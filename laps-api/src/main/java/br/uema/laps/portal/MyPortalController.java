package br.uema.laps.portal;

import br.uema.laps.email.EmailSendBudget;
import br.uema.laps.email.EmailService;
import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.member.MemberRole;
import br.uema.laps.project.MemberProject;
import br.uema.laps.project.MemberProjectRepository;
import br.uema.laps.project.Project;
import br.uema.laps.project.ProjectRepository;
import br.uema.laps.project.ProjectStatus;
import br.uema.laps.publication.Publication;
import br.uema.laps.publication.PublicationApproval;
import br.uema.laps.publication.PublicationRepository;
import br.uema.laps.publication.PublicationSpecifications;
import br.uema.laps.publication.PublicationStatus;
import br.uema.laps.publication.PublicationType;
import br.uema.laps.security.AuthenticatedMember;
import br.uema.laps.security.ManagerAllowlist;
import br.uema.laps.security.RateLimitGuard;
import br.uema.laps.translate.TranslationService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.text.Normalizer;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/me")
public class MyPortalController {

    private static final Logger log = LoggerFactory.getLogger(MyPortalController.class);

    private static final SecureRandom RNG = new SecureRandom();

    /** The only role a member may obtain for themselves. Anything above it is a manager action. */
    private static final String SELF_SERVICE_ROLE = "RESEARCHER";

    private static final int MAX_PARTICIPANTS = 50;

    /**
     * How long a verification code lives. Fifteen minutes, not the 24 hours the
     * old link token had: a code short enough to retype is short enough to
     * guess, so its window has to be measured in the time it takes to read an
     * email rather than the time it takes to notice one.
     */
    private static final Duration EMAIL_CODE_TTL = Duration.ofMinutes(15);

    /** Wrong entries before the code is discarded. Five is generous for six digits typed by hand. */
    private static final int MAX_EMAIL_CODE_ATTEMPTS = 5;

    // Fully qualified: the class already imports jakarta.validation's Pattern.
    private static final java.util.regex.Pattern CODE_PATTERN =
            java.util.regex.Pattern.compile("\\d{6}");

    private final MemberRepository memberRepository;
    private final MemberProjectRepository memberProjectRepository;
    private final ProjectRepository projectRepository;
    private final PublicationRepository publicationRepository;
    private final PasswordEncoder passwordEncoder;
    private final TranslationService translationService;
    private final RateLimitGuard rateLimitGuard;
    private final EmailService emailService;
    private final EmailSendBudget emailSendBudget;
    private final ManagerAllowlist managerAllowlist;

    public MyPortalController(
            MemberRepository memberRepository,
            MemberProjectRepository memberProjectRepository,
            ProjectRepository projectRepository,
            PublicationRepository publicationRepository,
            PasswordEncoder passwordEncoder,
            TranslationService translationService,
            RateLimitGuard rateLimitGuard,
            EmailService emailService,
            EmailSendBudget emailSendBudget,
            ManagerAllowlist managerAllowlist) {
        this.memberRepository = memberRepository;
        this.memberProjectRepository = memberProjectRepository;
        this.projectRepository = projectRepository;
        this.publicationRepository = publicationRepository;
        this.passwordEncoder = passwordEncoder;
        this.translationService = translationService;
        this.rateLimitGuard = rateLimitGuard;
        this.emailService = emailService;
        this.emailSendBudget = emailSendBudget;
        this.managerAllowlist = managerAllowlist;
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
        out.put("exchangeState", me.getExchangeState());
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
     * Issues a 6-digit verification code and emails it to the address on the
     * member's profile. The code is consumed by `POST /me/email/verify`.
     *
     * <p>The response deliberately does <em>not</em> carry the code when a mail
     * provider is configured. Returning it — which is what this endpoint used to
     * do with a 256-bit token — makes the whole flow decorative: a member could
     * complete verification without ever opening the inbox, so "verified" proved
     * nothing about who controls the address. The code now only exists in the
     * message the provider delivers.
     *
     * <p>The one exception is a deployment with no provider configured, where
     * the code comes back in the response so the flow still terminates. That is
     * the old (weak) behaviour, kept as a fallback and flagged to the SPA via
     * {@code channel} so it can say so out loud instead of pretending.
     */
    @PostMapping("/email/request-verification")
    @Transactional
    public ResponseEntity<Map<String, Object>> requestEmailVerification(HttpServletRequest request) {
        Member me = loadMe();
        if (me.getEmail() == null || me.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Set an email on your profile first");
        }
        if (me.isEmailVerified()) {
            return ResponseEntity.ok(Map.of("message", "Email already verified", "alreadyVerified", true));
        }
        // Two independent meters, because they answer different questions.
        // The guard is the burst limit shared with the credential endpoints;
        // the budget is what bounds mail specifically — a per-account cooldown
        // and daily cap, plus a global ceiling under the provider's own quota.
        // Both are spent before the provider is touched, so a refusal costs
        // nothing downstream.
        rateLimitGuard.enforce(request, "emailcode:" + me.getId());
        emailSendBudget.consume(me.getId());

        String code = randomCode();
        // BCrypt, not the SHA-256 that invite tokens use: six digits is a
        // million-entry dictionary, and a fast digest of one is reversible by
        // anyone who can read the column. The cost factor is what makes the
        // stored value useless without the email.
        me.setEmailVerificationTokenHash(passwordEncoder.encode(code));
        me.setEmailVerificationTokenExpiresAt(Instant.now().plus(EMAIL_CODE_TTL));
        me.setEmailVerificationAttempts((short) 0);
        memberRepository.save(me);

        Map<String, Object> body = new HashMap<>();
        body.put("email", me.getEmail());
        body.put("expiresAt", me.getEmailVerificationTokenExpiresAt());
        switch (emailService.sendVerificationCode(me.getEmail(), me.getFullName(), code, EMAIL_CODE_TTL)) {
            case SENT -> {
                body.put("channel", "EMAIL");
                body.put("message", "Verification code sent. Check your inbox and spam folder.");
            }
            case NOT_CONFIGURED -> {
                log.warn("No mail provider configured (laps.email.provider) — returning the verification "
                        + "code in the response for member {}. Email verification proves nothing in this mode.",
                        me.getId());
                body.put("channel", "MANUAL");
                body.put("code", code);
                body.put("message", "No mail provider configured. Use the code below.");
            }
            // Throwing rolls the transaction back, which is the point: the code
            // that nobody received never becomes the account's pending code, so
            // a retry is a clean new code rather than a second live one.
            case FAILED -> throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY, "Could not send the verification email. Try again in a moment.");
        }
        return ResponseEntity.ok(body);
    }

    /**
     * Consumes the 6-digit code.
     *
     * <p>{@code noRollbackFor} is load-bearing. Every rejection below is a
     * {@link ResponseStatusException}, and the default rollback rule would undo
     * the attempt counter written on the way out — leaving a 1-in-a-million
     * guess that can be retried a million times. The only writes this method
     * performs on a failure path are that counter and the discarding of a spent
     * code, both of which have to survive.
     */
    @PostMapping("/email/verify")
    @Transactional(noRollbackFor = ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest req, HttpServletRequest request) {
        Member me = loadMe();
        if (me.isEmailVerified()) {
            return ResponseEntity.ok(Map.of("message", "Already verified"));
        }
        rateLimitGuard.enforce(request, "emailcode:" + me.getId());

        String code = req.code() == null ? "" : req.code().trim();
        if (me.getEmailVerificationTokenHash() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request a verification code first");
        }
        if (me.getEmailVerificationTokenExpiresAt() == null
                || me.getEmailVerificationTokenExpiresAt().isBefore(Instant.now())) {
            clearVerificationCode(me);
            memberRepository.save(me);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification code expired");
        }
        // A malformed entry cannot match a six-digit code, so it is a typo
        // rather than a guess and does not spend an attempt.
        if (!CODE_PATTERN.matcher(code).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter the 6-digit code from the email");
        }
        if (!passwordEncoder.matches(code, me.getEmailVerificationTokenHash())) {
            short attempts = (short) (me.getEmailVerificationAttempts() + 1);
            me.setEmailVerificationAttempts(attempts);
            boolean burned = attempts >= MAX_EMAIL_CODE_ATTEMPTS;
            if (burned) clearVerificationCode(me);
            memberRepository.save(me);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    burned
                            ? "Too many incorrect codes. Request a new one."
                            : "Incorrect code. " + (MAX_EMAIL_CODE_ATTEMPTS - attempts) + " attempts left.");
        }
        me.setEmailVerified(true);
        clearVerificationCode(me);
        memberRepository.save(me);
        return ResponseEntity.ok(Map.of("message", "Email verified"));
    }

    private static void clearVerificationCode(Member me) {
        me.setEmailVerificationTokenHash(null);
        me.setEmailVerificationTokenExpiresAt(null);
        me.setEmailVerificationAttempts((short) 0);
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
     *
     * <p>Closed to undergraduates entirely — see {@link #guardProjectAuthoring}.
     * Because this endpoint replaces the whole list rather than editing it, the
     * card is read-only for them: additions and removals both come from someone
     * further up the lab.
     */
    @PutMapping("/projects")
    @Transactional
    public ResponseEntity<Void> updateMyProjects(@RequestBody List<MyProjectLink> links) {
        Member me = loadMe();
        guardLockedUntilPasswordChanged(me);
        guardProjectAuthoring(me);
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

    // ───── Publications ─────

    /**
     * The member's own publications, including the ones the public cannot see.
     *
     * <p>Deliberately not filtered to APPROVED: the whole point of showing this
     * list in the portal is that the member can tell a submission still waiting
     * on a manager apart from one that was turned down, and read the reason.
     */
    @GetMapping("/publications")
    public List<Publication> myPublications() {
        return publicationRepository.findAll(
                PublicationSpecifications.ownedBy(AuthenticatedMember.id()),
                Sort.by(Sort.Direction.DESC, "year").and(Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    /**
     * Submits a publication for review. Open to every member, undergraduates
     * included — this is the one authoring path that is not tiered.
     *
     * <p>The asymmetry with projects is intentional. A project entry is the
     * lab's record of work it is running, so who appears on it is the
     * supervisor's call ({@link #guardProjectAuthoring}). A publication is the
     * member's own authorship of a paper that already exists in the world, and
     * an undergraduate with a conference paper has exactly as much standing to
     * report it as a doctorate does.
     *
     * <p>What makes that safe is the review step rather than the role: the row
     * is written PENDING and stays off every public surface until a manager
     * approves it (see {@link PublicationSpecifications#approved()}). This is
     * the approval workflow the removed {@code /publications/{id}/claim}
     * endpoint lacked — that one let a member attach themselves to *someone
     * else's* existing publication with no review at all. Here the member
     * creates a new record, is recorded as its author and its submitter, and a
     * manager decides whether it joins the public record.
     */
    @PostMapping("/publications")
    @Transactional
    public ResponseEntity<Publication> submitPublication(@Valid @RequestBody MyPublicationCreate req) {
        Member me = loadMe();
        guardLockedUntilPasswordChanged(me);

        Publication p = new Publication();
        p.setTitle(req.title().trim());
        p.setVenue(req.venue().trim());
        p.setYear(req.year().shortValue());
        p.setType(req.type());
        p.setStatus(req.status() != null ? req.status() : PublicationStatus.PUBLISHED);
        p.setDoi(blankToNull(req.doi()));
        p.setUrl(blankToNull(req.url()));
        p.setAbstractText(blankToNull(req.abstractText()));
        p.setApprovalStatus(PublicationApproval.PENDING);
        p.setSubmittedBy(me.getId());

        Publication saved = publicationRepository.save(p);

        // The submitter is author 1 of a record that had no authors a moment
        // ago. Co-authors are not accepted from this endpoint: naming someone
        // else is a claim about them, and that is what the manager's review and
        // the admin surface are for.
        publicationRepository.addAuthor(saved.getId(), me.getId(), (short) 1);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    /**
     * Fields a member may set on their own submission. Notably absent:
     * approvalStatus and submittedBy — both are decided by the server, so a
     * crafted body cannot self-approve. Lengths mirror the column widths
     * (venue/doi VARCHAR(255), url VARCHAR(500)) so an over-long value is a 400
     * rather than a constraint violation surfacing as a 500.
     */
    public record MyPublicationCreate(
            @NotBlank @Size(max = 500) String title,
            @NotBlank @Size(max = 255) String venue,
            @NotNull @Min(1900) @Max(2100) Integer year,
            @NotNull PublicationType type,
            PublicationStatus status,
            @Size(max = 255) String doi,
            @Size(max = 500) String url,
            @Size(max = 5000) String abstractText) {
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

    /**
     * Undergraduates do not author the lab's project record.
     *
     * <p>Both self-service project endpoints write to what the public site
     * publishes: {@code /projects/new} creates an entry outright, and
     * {@code /projects} decides whose name appears on one. Undergrads are the
     * largest tier in the lab and the one with the highest turnover, so the
     * decision was to have their participation recorded by whoever supervises
     * the work rather than claimed from the portal.
     *
     * <p>This closes the endpoints, not the outcome: an undergrad can still be
     * put on a project by a manager from the Central de Comando, or listed in
     * {@code participantIds} by the member creating the project — neither path
     * goes through here, and both leave an actor other than the undergrad
     * responsible for the claim.
     */
    private void guardProjectAuthoring(Member me) {
        if (me.getCurrentRole() == MemberRole.UNDERGRAD) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Undergraduate members cannot add or join projects themselves");
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
        if (u.email() != null) applyEmailChange(me, u.email());
    }

    /**
     * Writes the login email, which is the most security-sensitive field a
     * member can set on themselves.
     *
     * <p>It used to be a straight assignment of whatever arrived. Three things
     * were wrong with that, all of them because this column is not just contact
     * information — it is an identity the rest of the system resolves against.
     *
     * <ol>
     *   <li><b>The manager allowlist is keyed on it.</b> {@code ManagerAllowlist}
     *       lowercases the member's email and looks it up in
     *       {@code LAPS_MANAGER_EMAILS}, and {@code JwtAuthFilter} re-runs that
     *       on every request. So any member who typed a coordinator's address
     *       into their own profile was granted MANAGER on their next call —
     *       self-service privilege escalation, needing nothing but knowledge of
     *       an address the public roster may well display. Claiming an
     *       allowlisted address is now refused outright; a manager whose account
     *       needs that address gets it set from the Central de Comando, which is
     *       where provisioning already lives.</li>
     *   <li><b>The unique constraint is case-sensitive.</b> Postgres treats
     *       {@code Ada@uema.br} and {@code ada@uema.br} as different values,
     *       while every lookup in this codebase is {@code ...IgnoreCase}. Two
     *       rows differing only in case therefore satisfied the database and
     *       then made {@code findByEmailIgnoreCase} return two results, which
     *       is an exception, not a login — one member could lock another out by
     *       re-typing their address in a different case. Normalising on write
     *       and rejecting a case-insensitive collision closes both halves.</li>
     *   <li><b>Blank was a value.</b> An empty string is not "no email": it is
     *       an email that collides with the next member who also sends blank.</li>
     * </ol>
     *
     * <p>The collision and allowlist rejections deliberately return the same
     * status and wording, so the response cannot be used to probe which
     * addresses are on the allowlist.
     */
    private void applyEmailChange(Member me, String raw) {
        String next = raw.trim().toLowerCase(Locale.ROOT);
        if (next.isBlank()) next = null;

        boolean changed = next == null
                ? me.getEmail() != null
                : !next.equalsIgnoreCase(me.getEmail());
        if (!changed) return;

        if (next != null) {
            if (managerAllowlist.isManager(next) || memberRepository.existsByEmailIgnoreCase(next)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
            }
        }
        me.setEmail(next);
        // A new address is an unproven address. Dropping any code in flight
        // matters as much as the flag: without it, a code mailed to the old
        // address would still verify the new one.
        me.setEmailVerified(false);
        clearVerificationCode(me);
    }

    /**
     * Creates a project owned by the authenticated member. The member is added
     * as CO_LEAD (or RESEARCHER if no advisor is selected). An optional advisor
     * (any HEAD/COORDINATOR) is added as LEAD. Additional participants are added
     * as RESEARCHER. Title and description are auto-translated PT→EN/FR.
     *
     * <p>Closed to undergraduates — see {@link #guardProjectAuthoring}. They may
     * still be named in {@code participantIds} by whoever creates the project.
     */
    @PostMapping("/projects/new")
    @Transactional
    public ResponseEntity<Project> createMyProject(@RequestBody MemberProjectCreate req) {
        Member me = loadMe();
        guardLockedUntilPasswordChanged(me);
        guardProjectAuthoring(me);

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

    /**
     * A zero-padded 6-digit code. {@code nextInt(bound)} rather than
     * {@code nextInt() % 1_000_000}, which is biased toward low codes — a
     * skewed distribution is exactly the kind of thing that makes a small
     * keyspace smaller.
     */
    private static String randomCode() {
        return "%06d".formatted(RNG.nextInt(1_000_000));
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
            // Empty clears the address. @Email on anything else so a malformed
            // string is refused here rather than shipped to the mail provider
            // as a recipient — every rejected send still costs an API call and
            // counts against the sender's reputation.
            @Size(max = 255) @Pattern(regexp = "^$|^[^@\\s]+@[^@\\s.]+(\\.[^@\\s.]+)+$",
                     message = "must be a valid email address") String email,
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

    /** The 6 digits from the email. Validated for shape in the handler, so the error is readable. */
    public record VerifyEmailRequest(@NotBlank String code) {
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
