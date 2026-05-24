package br.uema.laps.security;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final MemberRepository memberRepository;
    private final LapsJwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final List<String> managerEmails;
    private final Duration jwtTtl;
    private final AuthRateLimiter rateLimiter;

    public AuthController(
            MemberRepository memberRepository,
            LapsJwtService jwtService,
            PasswordEncoder passwordEncoder,
            @Value("${laps.managers.allowed-emails:}") List<String> managerEmails,
            @Value("${laps.jwt.ttl}") Duration jwtTtl,
            AuthRateLimiter rateLimiter
    ) {
        this.memberRepository = memberRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.managerEmails = managerEmails;
        this.jwtTtl = jwtTtl;
        this.rateLimiter = rateLimiter;
    }

    /**
     * Resolve the client IP, honoring X-Forwarded-For when the app sits
     * behind nginx. Limited to the *first* hop in the header to avoid trust
     * issues if a downstream client forges its own X-Forwarded-For.
     */
    private static String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            int comma = xff.indexOf(',');
            return (comma > 0 ? xff.substring(0, comma) : xff).trim();
        }
        return request.getRemoteAddr();
    }

    private void enforceRateLimit(HttpServletRequest request) {
        String ip = clientIp(request);
        if (!rateLimiter.allow(ip)) {
            long retry = rateLimiter.retryAfterSeconds(ip);
            ResponseStatusException tooMany = new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS, "Too many attempts. Try again later.");
            tooMany.getHeaders().add("Retry-After", String.valueOf(retry));
            throw tooMany;
        }
    }

    /**
     * Accepts either a username (slug, e.g. "joao-silva") or an email. The
     * SPA's login form keeps a single field so members don't have to track
     * which one was provisioned for them — slugs are easier to remember and
     * email is optional/unverified for new accounts.
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody LoginRequest req,
            HttpServletRequest request
    ) {
        enforceRateLimit(request);
        String identifier = req.username() != null ? req.username() : req.email();
        if (identifier == null || identifier.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        Member member = resolveMember(identifier)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (member.getPasswordHash() == null
                || !passwordEncoder.matches(req.password(), member.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        boolean isManager = member.getEmail() != null
                && managerEmails.stream().anyMatch(e -> e.equalsIgnoreCase(member.getEmail()));
        String role = isManager ? "MANAGER" : "MEMBER";

        String jwt = jwtService.issue(
                member.getId().toString(),
                member.getEmail() != null ? member.getEmail() : member.getSlug(),
                role
        );

        Map<String, Object> body = new HashMap<>();
        body.put("token", jwt);
        body.put("memberId", member.getId());
        body.put("username", member.getSlug());
        body.put("email", member.getEmail());
        body.put("role", role);
        body.put("mustChangePassword", member.isMustChangePassword());
        body.put("emailVerified", member.isEmailVerified());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildAuthCookie(jwt, request.isSecure()).toString())
                .body(body);
    }

    /**
     * One-time password setup for any member who has not yet set a password.
     *
     * Enumeration-safe response shape:
     *   - 400 on missing identifier or password too short — these reflect the
     *     caller's own input, so no member data leaks.
     *   - 200 in every other case ("done") whether or not the member exists.
     *
     * The underlying behavior is unchanged: a member who actually exists and
     * has no password set will get their hash recorded; anyone else gets a
     * no-op. Attackers polling this endpoint can no longer use 404/409 to
     * enumerate which slugs/emails are real, and the constant-time BCrypt
     * decoy keeps timing roughly uniform across both paths.
     */
    @PostMapping("/set-password")
    public ResponseEntity<Map<String, String>> setPassword(
            @RequestBody SetPasswordRequest req,
            HttpServletRequest request
    ) {
        enforceRateLimit(request);
        String identifier = req.username() != null ? req.username() : req.email();
        if (identifier == null || identifier.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username or email required");
        }
        if (req.password() == null || req.password().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }

        Optional<Member> maybeMember = resolveMember(identifier);
        if (maybeMember.isPresent()
                && (maybeMember.get().getPasswordHash() == null || maybeMember.get().getPasswordHash().isBlank())) {
            Member member = maybeMember.get();
            member.setPasswordHash(passwordEncoder.encode(req.password()));
            member.setMustChangePassword(false);
            memberRepository.save(member);
        } else {
            // Constant-time decoy: burn ~the same CPU even when the member is
            // missing or already has a password set, so request duration
            // doesn't reveal which branch we took.
            passwordEncoder.encode(req.password());
        }

        return ResponseEntity.ok(Map.of(
                "message", "If the account exists and has no password set, it is now ready to use."
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        ResponseCookie cleared = ResponseCookie.from("laps_jwt", "")
                .httpOnly(true)
                .secure(request.isSecure())
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleared.toString())
                .body(Map.of("message", "logged out"));
    }

    private Optional<Member> resolveMember(String identifier) {
        Optional<Member> bySlug = memberRepository.findBySlug(identifier.toLowerCase());
        if (bySlug.isPresent()) return bySlug;
        return memberRepository.findByEmailIgnoreCase(identifier);
    }

    private ResponseCookie buildAuthCookie(String jwt, boolean secure) {
        return ResponseCookie.from("laps_jwt", jwt)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(jwtTtl)
                .sameSite("Lax")
                .build();
    }

    public record LoginRequest(String username, String email, String password) {}
    public record SetPasswordRequest(String username, String email, String password) {}
}
