package br.uema.laps.portal;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.member.MemberRole;
import br.uema.laps.project.MemberProject;
import br.uema.laps.project.MemberProjectRepository;
import br.uema.laps.project.Project;
import br.uema.laps.project.ProjectRepository;
import br.uema.laps.project.ProjectStatus;
import br.uema.laps.security.AuthenticatedMember;
import br.uema.laps.security.RateLimitGuard;
import br.uema.laps.security.TokenHashing;
import br.uema.laps.translate.TranslationService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.text.Normalizer;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/me")
public class MyPortalController {

    private static final SecureRandom RNG = new SecureRandom();

    /** The only role a member may obtain for themselves. Anything above it is a manager action. */
    private static final String SELF_SERVICE_ROLE = "RESEARCHER";

    private static final int MAX_PARTICIPANTS = 50;

    private final MemberRepository memberRepository;
    private final MemberProjectRepository memberProjectRepository;
    private final ProjectRepository projectRepository;
    private final PasswordEncoder passwordEncoder;
    private final TranslationService translationService;
    private final RateLimitGuard rateLimitGuard;

    public MyPortalController(
            MemberRepository memberRepository,
            MemberProjectRepository memberProjectRepository,
            ProjectRepository projectRepository,
            PasswordEncoder passwordEncoder,
            TranslationService translationService,
            RateLimitGuard rateLimitGuard) {
        this.memberRepository = memberRepository;
        this.memberProjectRepository = memberProjectRepository;
        this.projectRepository = projectRepository;
        this.passwordEncoder = passwordEncoder;
        this.translationService = translationService;
        this.rateLimitGuard = rateLimitGuard;
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
        out.put("customUrl", me.getCustomUrl());
        out.put("customUrlLabel", me.getCustomUrlLabel());
        // Visibility flags — the portal renders a per-field eye toggle from these.
        // /me is always the unredacted view: a member sees their own data whether
        // or not the public site shows it.
        out.put("showEmail", me.isShowEmail());
        out.put("showContactEmail", me.isShowContactEmail());
        out.put("showLinkedin", me.isShowLinkedin());
        out.put("showLattes", me.isShowLattes());
        out.put("showGithub", me.isShowGithub());
        out.put("showCustomUrl", me.isShowCustomUrl());
        out.put("roadmap", me.getRoadmap());
        out.put("areas", me.getAreas());
        out.put("interests", me.getInterests());
        out.put("bannerColor", me.getBannerColor());
        out.put("bannerImageUrl", me.getBannerImageUrl());
        out.put("mustChangePassword", me.isMustChangePassword());
        out.put("emailVerified", me.isEmailVerified());
        out.put("exchangeCountry", me.getExchangeCountry());
        out.put("undergradProgram", me.getUndergradProgram());
        out.put("joinedSemester", me.getJoinedSemester());
        out.put("joinedMonth", me.getJoinedMonth());
        out.put("languages", me.getLanguages());
        // Expose the resolved security role (MANAGER / MEMBER) so the SPA can
        // gate admin access without duplicating the manager-email allowlist.
        out.put("role", AuthenticatedMember.role());
        return out;
    }

    @PutMapping
    @Transactional
    public Member updateMe(@Valid @RequestBody MyProfileUpdate update) {
        Member me = loadMe();
        // This is the endpoint the guard's own javadoc was written for, and it
        // was the one place not calling it — an unrotated temp password could
        // rewrite the whole profile, including the login email.
        guardLockedUntilPasswordChanged(me);
        apply(me, update);
        return memberRepository.save(me);
    }

    @PutMapping("/password")
    @Transactional
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestBody ChangePasswordRequest req,
            HttpServletRequest request) {
        Member me = loadMe();
        // The current-password check below is an online guessing oracle for
        // anyone holding a stolen session, and it was unmetered. Keyed on the
        // member id so the limit follows the account, not the browser.
        rateLimitGuard.enforce(request, "pwchange:" + me.getId());
        // Voluntary changes require a verified email so a session-hijacker
        // can't lock the real member out without controlling their inbox.
        //
        // The first rotation off a temp password is exempt: the member has no
        // other way out of it, and requiring verification first would deadlock
        // an account whose email is not yet confirmed. This exemption is only
        // safe because temp passwords are now random and delivered
        // out-of-band — while they were derivable from the public roster, this
        // branch was what let an attacker take permanent ownership of an
        // account they had guessed into.
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
        // Only the digest is persisted: a database read must not yield a token
        // that can be presented to verify someone else's address.
        me.setEmailVerificationTokenHash(TokenHashing.hash(token));
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
        if (me.getEmailVerificationTokenHash() == null
                || !TokenHashing.matches(req.token(), me.getEmailVerificationTokenHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification token");
        }
        if (me.getEmailVerificationTokenExpiresAt() == null
                || me.getEmailVerificationTokenExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification token expired");
        }
        me.setEmailVerified(true);
        me.setEmailVerificationTokenHash(null);
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

    /**
     * Replaces the caller's own project links.
     *
     * <p>The role on each link is decided by the server, never by the request.
     * `role` was previously stored verbatim from the body, and the column is a
     * free-text VARCHAR with no CHECK — so a member could PUT
     * {@code {"projectId": <any project>, "role": "LEAD"}} and publish
     * themselves as lead of a project they had no connection to. Both halves
     * mattered: any project id was accepted, and any role string was accepted.
     *
     * <p>Existing links keep the role already stored (so a member who was made
     * CO_LEAD by a manager, or who created the project, is not demoted the next
     * time they tick a checkbox), and newly added links are always
     * {@code RESEARCHER}. Elevating someone remains a manager action.
     */
    @PutMapping("/projects")
    @Transactional
    public ResponseEntity<Void> updateMyProjects(@RequestBody List<MyProjectLink> links) {
        Member me = loadMe();
        guardLockedUntilPasswordChanged(me);
        UUID myId = me.getId();

        Map<UUID, String> rolesBefore = memberProjectRepository.findByMemberId(myId).stream()
                .collect(java.util.stream.Collectors.toMap(
                        MemberProject::getProjectId, MemberProject::getRole, (a, b) -> a));

        memberProjectRepository.deleteByMemberId(myId);
        if (links != null) {
            Set<UUID> seen = new java.util.HashSet<>();
            for (MyProjectLink l : links) {
                if (l == null || l.projectId() == null || !seen.add(l.projectId())) continue;
                if (!projectRepository.existsById(l.projectId())) {
                    throw new EntityNotFoundException("project not found: " + l.projectId());
                }
                memberProjectRepository.save(new MemberProject(
                        l.projectId(), myId, rolesBefore.getOrDefault(l.projectId(), SELF_SERVICE_ROLE)));
            }
        }
        return ResponseEntity.noContent().build();
    }

    // POST /publications/{id}/claim was removed here.
    //
    // It let any authenticated member add themselves as an author of ANY
    // publication, with no ownership test and no approval step — i.e. falsify
    // the lab's public research record, which is then republished through
    // /api/v1/publications and the author filter. Nothing in the SPA called it,
    // so removing it costs no functionality.
    //
    // Reinstating self-service authorship needs an approval workflow (member
    // requests, manager confirms) rather than a direct write; alternatively an
    // admin-side "set authors on this publication" endpoint, which is the
    // capability that is actually missing today.

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
        if (u.customUrl() != null)
            me.setCustomUrl(u.customUrl().isBlank() ? null : u.customUrl());
        if (u.customUrlLabel() != null)
            me.setCustomUrlLabel(u.customUrlLabel().isBlank() ? null : u.customUrlLabel());
        // Members own their own join date — unlike exchange country and
        // undergraduate program, this is something only they can state.
        if (u.joinedSemester() != null)
            me.setJoinedSemester(u.joinedSemester().isBlank() ? null : u.joinedSemester());
        if (u.joinedMonth() != null)
            me.setJoinedMonth(u.joinedMonth().isBlank() ? null : u.joinedMonth());
        // Boxed Booleans: null means "not sent, leave alone", so a partial PATCH
        // of a single toggle can't reset the other five to their defaults.
        if (u.showEmail() != null)
            me.setShowEmail(u.showEmail());
        if (u.showContactEmail() != null)
            me.setShowContactEmail(u.showContactEmail());
        if (u.showLinkedin() != null)
            me.setShowLinkedin(u.showLinkedin());
        if (u.showLattes() != null)
            me.setShowLattes(u.showLattes());
        if (u.showGithub() != null)
            me.setShowGithub(u.showGithub());
        if (u.showCustomUrl() != null)
            me.setShowCustomUrl(u.showCustomUrl());
        if (u.roadmap() != null)
            me.setRoadmap(u.roadmap());
        if (u.areas() != null)
            me.setAreas(u.areas());
        if (u.interests() != null)
            me.setInterests(u.interests());
        if (u.bannerColor() != null)
            me.setBannerColor(u.bannerColor().isBlank() ? null : u.bannerColor());
        if (u.bannerImageUrl() != null)
            me.setBannerImageUrl(u.bannerImageUrl().isBlank() ? null : u.bannerImageUrl());
        if (u.languages() != null)
            me.setLanguages(u.languages().isBlank() ? null : u.languages());
        // Email change invalidates verification — the SPA's snackbar will
        // re-fire prompting the member to verify the new address.
        if (u.email() != null && !u.email().equals(me.getEmail())) {
            me.setEmail(u.email());
            me.setEmailVerified(false);
            me.setEmailVerificationTokenHash(null);
            me.setEmailVerificationTokenExpiresAt(null);
        }
    }

    /**
     * Creates a project owned by the authenticated member. The member is added
     * as CO_LEAD (or RESEARCHER if no advisor is selected). An optional advisor
     * (any HEAD/COORDINATOR) is added as LEAD. Additional participants are added
     * as RESEARCHER. Title and description are auto-translated PT→EN/FR.
     */
    @PostMapping("/projects/new")
    @Transactional
    public ResponseEntity<Project> createMyProject(@RequestBody MemberProjectCreate req) {
        Member me = loadMe();
        guardLockedUntilPasswordChanged(me);

        Project p = new Project();
        p.setSlug(toSlug(req.titlePt()) + "-" + UUID.randomUUID().toString().substring(0, 8));
        p.setStatus(parseStatus(req.status()));
        p.setTitlePt(req.titlePt());
        p.setDescriptionPt(req.descriptionPt());
        if (req.titlePt() != null && !req.titlePt().isBlank()) {
            p.setTitleEn(translationService.translate(req.titlePt(), "en"));
            p.setTitleFr(translationService.translate(req.titlePt(), "fr"));
        }
        if (req.descriptionPt() != null && !req.descriptionPt().isBlank()) {
            p.setDescriptionEn(translationService.translate(req.descriptionPt(), "en"));
            p.setDescriptionFr(translationService.translate(req.descriptionPt(), "fr"));
        }
        if (req.tags() != null)
            p.setTags(req.tags());
        if (req.year() != null)
            p.setYear(req.year().shortValue());
        if (req.articleUrl() != null && !req.articleUrl().isBlank())
            p.setArticleUrl(req.articleUrl());

        Project saved = projectRepository.save(p);

        // Advisor → LEAD. The javadoc always claimed "any HEAD/COORDINATOR" but
        // nothing checked it, so any member id could be installed as lead of a
        // project someone else created.
        if (req.advisorId() != null) {
            Member advisor = memberRepository.findById(req.advisorId())
                    .orElseThrow(() -> new EntityNotFoundException("advisor not found: " + req.advisorId()));
            if (advisor.getDeletedAt() != null
                    || (advisor.getCurrentRole() != MemberRole.HEAD
                        && advisor.getCurrentRole() != MemberRole.COORDINATOR)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Advisor must be a lab head or coordinator");
            }
            memberProjectRepository.save(new MemberProject(saved.getId(), req.advisorId(), "LEAD"));
        }

        // Creator → CO_LEAD when an advisor exists, otherwise RESEARCHER
        String myRole = req.advisorId() != null ? "CO_LEAD" : "RESEARCHER";
        memberProjectRepository.save(new MemberProject(saved.getId(), me.getId(), myRole));

        // Additional participants → RESEARCHER (skip creator and advisor).
        // Every id must resolve to a live member: unchecked, this wrote rows
        // referencing arbitrary UUIDs and was bounded only by request size.
        if (req.participantIds() != null) {
            if (req.participantIds().size() > MAX_PARTICIPANTS) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Too many participants (max " + MAX_PARTICIPANTS + ")");
            }
            Set<UUID> added = new java.util.HashSet<>();
            for (UUID pid : req.participantIds()) {
                if (pid == null || pid.equals(me.getId()) || pid.equals(req.advisorId())) continue;
                if (!added.add(pid)) continue;
                Member participant = memberRepository.findById(pid)
                        .orElseThrow(() -> new EntityNotFoundException("member not found: " + pid));
                if (participant.getDeletedAt() != null) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "Cannot add a removed member to a project");
                }
                memberProjectRepository.save(new MemberProject(saved.getId(), pid, SELF_SERVICE_ROLE));
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /** Unknown status is a 400, not the 500 that ProjectStatus.valueOf produced. */
    private static ProjectStatus parseStatus(String raw) {
        if (raw == null || raw.isBlank()) return ProjectStatus.ACTIVE;
        try {
            return ProjectStatus.valueOf(raw);
        } catch (IllegalArgumentException unknown) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown project status: " + raw);
        }
    }

    private static String randomToken() {
        byte[] buf = new byte[32];
        RNG.nextBytes(buf);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
    }

    private static String toSlug(String text) {
        if (text == null || text.isBlank()) return "project";
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String slug = normalized.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        return slug.length() > 60 ? slug.substring(0, 60) : slug;
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
            @Size(max = 500) String customUrl,
            @Size(max = 60) String customUrlLabel,
            // Empty string clears the field; anything else must match exactly.
            // These are enforced now that updateMe carries @Valid — before that
            // every constraint on this record was decorative.
            @Pattern(regexp = "^$|^[0-9]{4}\\.[12]$",
                     message = "must be a semester like 2024.1")
            String joinedSemester,
            @Pattern(regexp = "^$|^[0-9]{4}-(0[1-9]|1[0-2])$",
                     message = "must be a month like 2024-08")
            String joinedMonth,
            Boolean showEmail,
            Boolean showContactEmail,
            Boolean showLinkedin,
            Boolean showLattes,
            Boolean showGithub,
            Boolean showCustomUrl,
            @Size(max = 8000) String roadmap,
            @Size(max = 4000) String areas,
            @Size(max = 4000) String interests,
            @Size(max = 50) String bannerColor,
            @Size(max = 500) String bannerImageUrl,
            @Size(max = 4000) String languages) {
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

    public record MemberProjectCreate(
            @NotBlank String titlePt,
            String descriptionPt,
            String status,
            Integer year,
            String articleUrl,
            List<String> tags,
            UUID advisorId,
            List<UUID> participantIds) {
    }
}
