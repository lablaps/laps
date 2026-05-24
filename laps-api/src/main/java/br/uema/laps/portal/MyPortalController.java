package br.uema.laps.portal;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.project.MemberProject;
import br.uema.laps.project.MemberProjectRepository;
import br.uema.laps.publication.Publication;
import br.uema.laps.publication.PublicationRepository;
import br.uema.laps.security.AuthenticatedMember;
import br.uema.laps.translate.TranslationService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/me")
public class MyPortalController {

    private static final SecureRandom RNG = new SecureRandom();

    private final MemberRepository memberRepository;
    private final PublicationRepository publicationRepository;
    private final MemberProjectRepository memberProjectRepository;
    private final PasswordEncoder passwordEncoder;
    private final TranslationService translationService;

    public MyPortalController(
            MemberRepository memberRepository,
            PublicationRepository publicationRepository,
            MemberProjectRepository memberProjectRepository,
            PasswordEncoder passwordEncoder,
            TranslationService translationService) {
        this.memberRepository = memberRepository;
        this.publicationRepository = publicationRepository;
        this.memberProjectRepository = memberProjectRepository;
        this.passwordEncoder = passwordEncoder;
        this.translationService = translationService;
    }

    @GetMapping
    public Map<String, Object> me() {
        Member me = loadMe();
        // Strip sensitive fields and surface the auth-flow flags the SPA needs
        // to gate routing (force-change-password, snackbar prompt, etc.).
        Map<String, Object> out = new HashMap<>();
        out.put("id", me.getId());
        out.put("slug", me.getSlug());
        out.put("username", me.getSlug());
        out.put("fullName", me.getFullName());
        out.put("email", me.getEmail());
        out.put("currentRole", me.getCurrentRole());
        out.put("currentRoleStartedAt", me.getCurrentRoleStartedAt());
        out.put("status", me.getStatus());
        out.put("bioPt", me.getBioPt());
        out.put("bioEn", me.getBioEn());
        out.put("bioFr", me.getBioFr());
        out.put("photoUrl", me.getPhotoUrl());
        out.put("linkedinUrl", me.getLinkedinUrl());
        out.put("lattesUrl", me.getLattesUrl());
        out.put("githubUrl", me.getGithubUrl());
        out.put("contactEmail", me.getContactEmail());
        out.put("roadmap", me.getRoadmap());
        out.put("mustChangePassword", me.isMustChangePassword());
        out.put("emailVerified", me.isEmailVerified());
        return out;
    }

    @PutMapping
    @Transactional
    public Member updateMe(@RequestBody MyProfileUpdate update) {
        Member me = loadMe();
        apply(me, update);
        return memberRepository.save(me);
    }

    @PutMapping("/password")
    @Transactional
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody ChangePasswordRequest req) {
        Member me = loadMe();
        // Force-change after first login still works (the member has no other
        // way out of the temp password), but voluntary changes after that
        // require a verified email so a session-hijacker can't lock the real
        // member out without controlling their inbox.
        if (!me.isMustChangePassword() && !me.isEmailVerified()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Verify your email before changing your password");
        }
        if (req.newPassword() == null || req.newPassword().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 8 characters");
        }
        if (req.currentPassword() == null
                || !passwordEncoder.matches(req.currentPassword(), me.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }
        if (passwordEncoder.matches(req.newPassword(), me.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must differ from current one");
        }
        me.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        me.setMustChangePassword(false);
        memberRepository.save(me);
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

    /**
     * Generates a verification token for the member's current email and
     * returns it. In a real deployment this would be sent by email; for now
     * we surface it directly so the coordinator can copy it to the user
     * out-of-band. The token is consumed by `POST /me/email/verify`.
     */
    @PostMapping("/email/request-verification")
    @Transactional
    public ResponseEntity<Map<String, Object>> requestEmailVerification() {
        Member me = loadMe();
        if (me.getEmail() == null || me.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Set an email on your profile first");
        }
        if (me.isEmailVerified()) {
            return ResponseEntity.ok(Map.of("message", "Email already verified", "alreadyVerified", true));
        }
        String token = randomToken();
        me.setEmailVerificationToken(token);
        me.setEmailVerificationTokenExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        memberRepository.save(me);
        // The token is sensitive — only return it to the requester (the member
        // themselves).
        return ResponseEntity.ok(Map.of(
                "message", "Verification token issued. Use it within 24h.",
                "token", token,
                "expiresAt", me.getEmailVerificationTokenExpiresAt()));
    }

    @PostMapping("/email/verify")
    @Transactional
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestBody VerifyEmailRequest req) {
        Member me = loadMe();
        if (me.isEmailVerified()) {
            return ResponseEntity.ok(Map.of("message", "Already verified"));
        }
        if (me.getEmailVerificationToken() == null
                || !me.getEmailVerificationToken().equals(req.token())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification token");
        }
        if (me.getEmailVerificationTokenExpiresAt() == null
                || me.getEmailVerificationTokenExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification token expired");
        }
        me.setEmailVerified(true);
        me.setEmailVerificationToken(null);
        me.setEmailVerificationTokenExpiresAt(null);
        memberRepository.save(me);
        return ResponseEntity.ok(Map.of("message", "Email verified"));
    }

    /**
     * Members can pin themselves to projects (with a role label) but cannot
     * create new projects — that's still admin-only. This endpoint replaces
     * the caller's full project list atomically.
     */
    @GetMapping("/projects")
    public List<MemberProject> myProjects() {
        return memberProjectRepository.findByMemberId(AuthenticatedMember.id());
    }

    @PutMapping("/projects")
    @Transactional
    public ResponseEntity<Void> updateMyProjects(@RequestBody List<MyProjectLink> links) {
        Member me = loadMe();
        guardLockedUntilPasswordChanged(me);
        UUID myId = me.getId();
        memberProjectRepository.deleteByMemberId(myId);
        if (links != null) {
            for (MyProjectLink l : links) {
                memberProjectRepository.save(new MemberProject(l.projectId(), myId, l.role()));
            }
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/publications/{publicationId}/claim")
    @Transactional
    public ResponseEntity<Void> claimPublication(@PathVariable UUID publicationId) {
        Member me = loadMe();
        guardLockedUntilPasswordChanged(me);
        Publication pub = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new EntityNotFoundException("publication not found: " + publicationId));
        pub.getAuthors().add(me);
        publicationRepository.save(pub);
        return ResponseEntity.noContent().build();
    }

    private Member loadMe() {
        UUID myId = AuthenticatedMember.id();
        return memberRepository.findById(myId)
                .orElseThrow(() -> new EntityNotFoundException("member not found: " + myId));
    }

    /**
     * A member who still has the deterministic temp password cannot touch
     * profile data or external state until they rotate the credential —
     * stops an unrotated leaked temp password from being used to deface
     * the member's profile.
     */
    private void guardLockedUntilPasswordChanged(Member me) {
        if (me.isMustChangePassword()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You must change your temporary password before editing your profile");
        }
    }

    private void apply(Member me, MyProfileUpdate u) {
        // Mirror AdminController.updateMember: PT is the source of truth; if
        // the member edits PT we auto-fill EN/FR via the translation service
        // unless they explicitly provide an override. The service falls back
        // to the PT text if MyMemory is offline, so a failed translation can't
        // wipe a previously-translated bio.
        if (u.bioPt() != null) {
            String pt = u.bioPt();
            me.setBioPt(pt);
            me.setBioEn(u.bioEn() != null ? u.bioEn() : translationService.translate(pt, "en"));
            me.setBioFr(u.bioFr() != null ? u.bioFr() : translationService.translate(pt, "fr"));
        } else {
            if (u.bioEn() != null)
                me.setBioEn(u.bioEn());
            if (u.bioFr() != null)
                me.setBioFr(u.bioFr());
        }
        if (u.photoUrl() != null)
            me.setPhotoUrl(u.photoUrl());
        if (u.linkedinUrl() != null)
            me.setLinkedinUrl(u.linkedinUrl());
        if (u.lattesUrl() != null)
            me.setLattesUrl(u.lattesUrl());
        if (u.githubUrl() != null)
            me.setGithubUrl(u.githubUrl());
        if (u.contactEmail() != null)
            me.setContactEmail(u.contactEmail());
        if (u.roadmap() != null)
            me.setRoadmap(u.roadmap());
        // Email change invalidates verification — the SPA's snackbar will
        // re-fire prompting the member to verify the new address.
        if (u.email() != null && !u.email().equals(me.getEmail())) {
            me.setEmail(u.email());
            me.setEmailVerified(false);
            me.setEmailVerificationToken(null);
            me.setEmailVerificationTokenExpiresAt(null);
        }
    }

    private static String randomToken() {
        byte[] buf = new byte[32];
        RNG.nextBytes(buf);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
    }

    public record MyProfileUpdate(
            @Size(max = 8000) String bioPt,
            @Size(max = 8000) String bioEn,
            @Size(max = 8000) String bioFr,
            @Size(max = 500) String photoUrl,
            @Size(max = 500) String linkedinUrl,
            @Size(max = 500) String lattesUrl,
            @Size(max = 500) String githubUrl,
            @Size(max = 255) String contactEmail,
            @Size(max = 255) String email,
            @Size(max = 8000) String roadmap) {
    }

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank String newPassword) {
    }

    public record VerifyEmailRequest(@NotBlank String token) {
    }

    public record MyProjectLink(
            @NotNull UUID projectId,
            @NotBlank String role) {
    }
}
