package br.uema.laps.invite;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.member.MemberRole;
import br.uema.laps.member.MemberStatus;
import br.uema.laps.security.AuthCookies;
import br.uema.laps.security.AuthenticatedMember;
import br.uema.laps.security.LapsJwtService;
import br.uema.laps.security.ManagerAllowlist;
import br.uema.laps.security.ProofOfWorkService;
import br.uema.laps.security.RateLimitGuard;
import br.uema.laps.security.TokenHashing;
import br.uema.laps.translate.TranslationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.text.Normalizer;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
public class InviteController {

    private final InviteTokenRepository inviteTokenRepository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final LapsJwtService jwtService;
    private final TranslationService translationService;
    private final ManagerAllowlist managerAllowlist;
    private final RateLimitGuard rateLimitGuard;
    private final AuthCookies authCookies;
    private final ProofOfWorkService proofOfWork;

    public InviteController(
            InviteTokenRepository inviteTokenRepository,
            MemberRepository memberRepository,
            PasswordEncoder passwordEncoder,
            LapsJwtService jwtService,
            TranslationService translationService,
            ManagerAllowlist managerAllowlist,
            RateLimitGuard rateLimitGuard,
            AuthCookies authCookies,
            ProofOfWorkService proofOfWork) {
        this.inviteTokenRepository = inviteTokenRepository;
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.translationService = translationService;
        this.managerAllowlist = managerAllowlist;
        this.rateLimitGuard = rateLimitGuard;
        this.authCookies = authCookies;
        this.proofOfWork = proofOfWork;
    }

    // ───── Admin: create invite ─────

    @PostMapping("/api/v1/admin/invites")
    @Transactional
    public Map<String, Object> createInvite(@Valid @RequestBody CreateInviteRequest req) {
        requireAssignable(req.role());
        InviteToken invite = new InviteToken();
        // The plaintext is generated here, handed back once in the response, and
        // never stored — only its digest goes to the database.
        String plaintextToken = UUID.randomUUID().toString();
        invite.setTokenHash(TokenHashing.hash(plaintextToken));
        invite.setRole(req.role());
        invite.setExpiresAt(Instant.now().plus(req.validityDays(), ChronoUnit.DAYS));
        invite.setCreatedBy(AuthenticatedMember.id());
        InviteToken saved = inviteTokenRepository.save(invite);

        Map<String, Object> body = new HashMap<>();
        body.put("id", saved.getId());
        body.put("token", plaintextToken);
        body.put("role", saved.getRole());
        body.put("expiresAt", saved.getExpiresAt());
        return body;
    }

    // ───── Public: validate invite ─────

    @GetMapping("/api/v1/invites/{token}")
    public Map<String, Object> validateInvite(@PathVariable String token, HttpServletRequest httpReq) {
        // Unauthenticated and enumerable in principle. The token is a v4 UUID so
        // guessing is not the real risk; the limit is here so this endpoint
        // cannot be used as an unmetered oracle or an amplification target.
        rateLimitGuard.enforceNamespaced(httpReq, "invite-validate");
        InviteToken invite = resolveAndCheck(token);
        requireAssignable(invite.getRole());
        Map<String, Object> body = new HashMap<>();
        body.put("role", invite.getRole());
        body.put("expiresAt", invite.getExpiresAt());
        return body;
    }

    // ───── Public: register with invite ─────

    @PostMapping("/api/v1/invites/{token}/register")
    @Transactional
    public ResponseEntity<Map<String, Object>> register(
            @PathVariable String token,
            @Valid @RequestBody RegisterRequest req,
            HttpServletRequest httpReq) {

        // This is the one public, unauthenticated, account-creating endpoint in
        // the API and it had no limit of any kind. Keyed on the invite token as
        // well as the address so a single leaked invite cannot be hammered from
        // a botnet.
        rateLimitGuard.enforce(httpReq, "invite:" + token);
        // Account creation is the most attractive automated target on the site,
        // so the challenge is spent before the token is even looked up.
        if (!proofOfWork.consume(req.powNonce(), req.powSolution())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid or expired challenge. Please retry.");
        }

        InviteToken invite = resolveAndCheck(token);
        requireAssignable(invite.getRole());

        // Same rejection for both conditions, deliberately: an invitee must not
        // be able to tell "somebody already has this address" from "this address
        // is on the manager allowlist".
        //
        // The allowlist check is the one that matters. Registration picks its
        // own email, and ManagerAllowlist resolves MANAGER from that column on
        // every request — so without this, redeeming any invite while typing a
        // coordinator's address hands the console to whoever holds the invite.
        // The tier on the invite was never the only way in.
        if (memberRepository.existsByEmailIgnoreCase(req.email())
                || managerAllowlist.isManager(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        String slug = uniqueSlug(slugify(req.fullName()));
        if (memberRepository.findBySlug(slug).isPresent()) {
            slug = uniqueSlug(slug);
        }

        Member m = new Member();
        m.setSlug(slug);
        m.setFullName(req.fullName());
        m.setEmail(req.email().trim().toLowerCase());
        m.setPasswordHash(passwordEncoder.encode(req.password()));
        m.setMustChangePassword(false);
        m.setCurrentRole(invite.getRole());
        m.setStatus(MemberStatus.ACTIVE);
        m.setPhotoUrl(req.photoUrl());
        m.setLinkedinUrl(req.linkedinUrl());
        m.setLattesUrl(req.lattesUrl());
        m.setGithubUrl(req.githubUrl());

        // Store the bio in whichever language the user filled in; translate to the others.
        String lang = req.bioLang() != null ? req.bioLang() : "pt";
        String bio = req.bio();
        if (bio != null && !bio.isBlank()) {
            switch (lang) {
                case "en" -> {
                    m.setBioEn(bio);
                    m.setBioPt(translationService.translate(bio, "pt"));
                    m.setBioFr(translationService.translate(bio, "fr"));
                }
                case "fr" -> {
                    m.setBioFr(bio);
                    m.setBioPt(translationService.translate(bio, "pt"));
                    m.setBioEn(translationService.translate(bio, "en"));
                }
                default -> {
                    m.setBioPt(bio);
                    m.setBioEn(translationService.translate(bio, "en"));
                    m.setBioFr(translationService.translate(bio, "fr"));
                }
            }
        }

        Member saved = memberRepository.save(m);

        // Mark invite as used
        invite.setUsedAt(Instant.now());
        invite.setUsedBy(saved.getId());
        inviteTokenRepository.save(invite);

        // Issue JWT and auto-login
        String role = managerAllowlist.roleFor(saved);
        String jwt = jwtService.issue(saved.getId().toString(), saved.getEmail(), role);

        Map<String, Object> body = new HashMap<>();
        body.put("memberId", saved.getId());
        body.put("username", saved.getSlug());
        body.put("email", saved.getEmail());
        body.put("role", role);
        body.put("mustChangePassword", false);
        body.put("emailVerified", false);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookies.issue(jwt, httpReq).toString())
                .body(body);
    }

    // ───── Helpers ─────

    private InviteToken resolveAndCheck(String raw) {
        // Parse first so only well-formed UUIDs are hashed, and normalise to the
        // canonical lower-case form the digest was taken over.
        UUID uuid;
        try {
            uuid = UUID.fromString(raw);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid invite token");
        }
        InviteToken invite = inviteTokenRepository.findByTokenHash(TokenHashing.hash(uuid.toString()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invite not found"));
        if (invite.getUsedAt() != null) {
            throw new ResponseStatusException(HttpStatus.GONE, "Invite already used");
        }
        if (Instant.now().isAfter(invite.getExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Invite has expired");
        }
        return invite;
    }

    private static void requireAssignable(MemberRole role) {
        if (role == null || !role.isAssignable()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Management duties cannot be assigned as member roles");
        }
    }

    private String slugify(String name) {
        String normalized = Normalizer.normalize(name.trim().toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-{2,}", "-");
        return normalized.isEmpty() ? "member" : normalized;
    }

    // Appends a numeric suffix until the slug is free in the DB.
    private String uniqueSlug(String base) {
        if (memberRepository.findBySlug(base).isEmpty()) return base;
        for (int i = 2; i < 100; i++) {
            String candidate = base + "-" + i;
            if (memberRepository.findBySlug(candidate).isEmpty()) return candidate;
        }
        return base + "-" + UUID.randomUUID().toString().substring(0, 6);
    }

    // ───── Records ─────

    public record CreateInviteRequest(
            @NotNull MemberRole role,
            // Was unbounded: a typo or a stray zero minted an invite that stayed
            // redeemable for centuries. An invite is a credential.
            @NotNull @Min(1) @Max(90) Integer validityDays) {
    }

    public record RegisterRequest(
            @NotBlank String fullName,
            @NotBlank String email,
            @NotBlank @Size(min = 8) String password,
            String photoUrl,
            String bio,
            String bioLang,
            String linkedinUrl,
            String lattesUrl,
            String githubUrl,
            String powNonce,
            String powSolution) {
    }
}
