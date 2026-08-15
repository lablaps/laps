package br.uema.laps.security;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    /**
     * Burned instead of a real comparison when there is no account to compare
     * against, so a caller cannot tell "no such member", "member removed", and
     * "wrong password" apart by response time.
     *
     * <p>Generated at startup rather than written as a literal: the encoder
     * rejects anything that is not a structurally valid BCrypt string and
     * returns false immediately, which would hand back the exact timing signal
     * this exists to remove. Deriving it from the live encoder also keeps the
     * decoy at the configured work factor if that is ever changed again.
     */
    private final String timingDecoyHash;

    private final MemberRepository memberRepository;
    private final LapsJwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final ManagerAllowlist managerAllowlist;
    private final MemberAccessPolicy accessPolicy;
    private final RateLimitGuard rateLimitGuard;
    private final AuthCookies authCookies;

    public AuthController(
            MemberRepository memberRepository,
            LapsJwtService jwtService,
            PasswordEncoder passwordEncoder,
            ManagerAllowlist managerAllowlist,
            MemberAccessPolicy accessPolicy,
            RateLimitGuard rateLimitGuard,
            AuthCookies authCookies
    ) {
        this.memberRepository = memberRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.managerAllowlist = managerAllowlist;
        this.accessPolicy = accessPolicy;
        this.rateLimitGuard = rateLimitGuard;
        this.authCookies = authCookies;
        this.timingDecoyHash = passwordEncoder.encode(java.util.UUID.randomUUID().toString());
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
        // Resolve the identifier before limiting so the per-account bucket can
        // be keyed on it — otherwise a spray across many accounts from one IP
        // stays under the per-IP threshold indefinitely.
        String identifier = req.username() != null ? req.username() : req.email();
        rateLimitGuard.enforce(request, identifier);
        if (identifier == null || identifier.isBlank()) {
            throw invalidCredentials();
        }

        Member member = resolveMember(identifier)
                .filter(accessPolicy::mayAuthenticate)
                .orElse(null);

        // Soft-deleted and INACTIVE members are filtered above rather than after
        // the password check, and are indistinguishable from a nonexistent
        // account in both body and timing. Previously they were not filtered at
        // all: AdminController.softDelete leaves password_hash intact, so
        // removing a member from the lab did not revoke their ability to log in.
        if (member == null || member.getPasswordHash() == null) {
            passwordEncoder.matches(req.password() == null ? "" : req.password(), timingDecoyHash);
            throw invalidCredentials();
        }
        if (!passwordEncoder.matches(req.password(), member.getPasswordHash())) {
            throw invalidCredentials();
        }

        String role = managerAllowlist.roleFor(member);

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
                .header(HttpHeaders.SET_COOKIE, authCookies.issue(jwt, request).toString())
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
        String identifier = req.username() != null ? req.username() : req.email();
        rateLimitGuard.enforce(request, identifier);
        if (identifier == null || identifier.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username or email required");
        }
        if (req.password() == null || req.password().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }

        Optional<Member> maybeMember = resolveMember(identifier)
                .filter(accessPolicy::mayAuthenticate);
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
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookies.clear(request).toString())
                .body(Map.of("message", "logged out"));
    }

    private static ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    private Optional<Member> resolveMember(String identifier) {
        Optional<Member> bySlug = memberRepository.findBySlug(identifier.toLowerCase());
        if (bySlug.isPresent()) return bySlug;
        return memberRepository.findByEmailIgnoreCase(identifier);
    }

    public record LoginRequest(String username, String email, String password) {}
    public record SetPasswordRequest(String username, String email, String password) {}
}
