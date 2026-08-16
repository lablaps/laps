package br.uema.laps.admin;

import br.uema.laps.audit.AuditLog;
import br.uema.laps.audit.AuditLogRepository;
import br.uema.laps.audit.AuditService;
import br.uema.laps.member.BrazilianState;
import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.member.MemberRole;
import br.uema.laps.member.MemberStatus;
import br.uema.laps.member.UndergradProgram;
import br.uema.laps.publication.Publication;
import br.uema.laps.publication.PublicationApproval;
import br.uema.laps.publication.PublicationRepository;
import br.uema.laps.publication.PublicationStatus;
import br.uema.laps.publication.PublicationType;
import br.uema.laps.project.Project;
import br.uema.laps.project.ProjectRepository;
import br.uema.laps.project.ProjectStatus;
import br.uema.laps.project.MemberProject;
import br.uema.laps.project.MemberProjectRepository;
import br.uema.laps.roletracking.RoleTransitionService;
import br.uema.laps.translate.TranslationService;
import java.util.List;
import java.util.Map;
import br.uema.laps.security.AuthenticatedMember;
import br.uema.laps.security.MemberPasswordService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final MemberRepository memberRepository;
    private final PublicationRepository publicationRepository;
    private final ProjectRepository projectRepository;
    private final MemberProjectRepository memberProjectRepository;
    private final RoleTransitionService roleTransitionService;
    private final AuditService auditService;
    private final AuditLogRepository auditLogRepository;
    private final TranslationService translationService;
    private final MemberPasswordService memberPasswordService;

    public AdminController(
            MemberRepository memberRepository,
            PublicationRepository publicationRepository,
            ProjectRepository projectRepository,
            MemberProjectRepository memberProjectRepository,
            RoleTransitionService roleTransitionService,
            AuditService auditService,
            AuditLogRepository auditLogRepository,
            TranslationService translationService,
            MemberPasswordService memberPasswordService) {
        this.memberRepository = memberRepository;
        this.publicationRepository = publicationRepository;
        this.projectRepository = projectRepository;
        this.memberProjectRepository = memberProjectRepository;
        this.roleTransitionService = roleTransitionService;
        this.auditService = auditService;
        this.auditLogRepository = auditLogRepository;
        this.translationService = translationService;
        this.memberPasswordService = memberPasswordService;
    }

    // ───── Members ─────

    @PostMapping("/members")
    @Transactional
    public Map<String, Object> createMember(@Valid @RequestBody MemberCreate req) {
        Member m = new Member();
        m.setSlug(req.slug());
        m.setFullName(req.fullName());
        m.setEmail(req.email());
        m.setCurrentRole(req.currentRole());
        m.setCurrentRoleStartedAt(req.currentRoleStartedAt() != null ? req.currentRoleStartedAt() : LocalDate.now());
        m.setStatus(req.status() != null ? req.status() : MemberStatus.ACTIVE);
        m.setMustChangePassword(true);
        Member saved = memberRepository.save(m);

        // Provision a random temp password the moment the row exists and return
        // it to the admin. This is the ONLY time it is visible — it is stored
        // as a BCrypt hash and cannot be recovered, so an admin who loses it
        // must issue a new one via /members/{id}/reset-password.
        String tempPassword = memberPasswordService.provisionInitial(saved);

        auditService.record(AuthenticatedMember.id(), "CREATE_MEMBER", "Member", saved.getId().toString(), req);

        Map<String, Object> body = new java.util.HashMap<>();
        body.put("member", saved);
        body.put("tempPassword", tempPassword);
        return body;
    }

    @GetMapping("/auth-status")
    public List<Map<String, Object>> authStatus() {
        return memberRepository.findAll().stream()
                .map(m -> Map.<String, Object>of(
                        "memberId", m.getId(),
                        "slug", m.getSlug(),
                        "mustChangePassword", m.isMustChangePassword(),
                        "emailVerified", m.isEmailVerified()))
                .toList();
    }

    /**
     * Issues a NEW random temp password and returns it once.
     *
     * This replaces the old {@code GET /temp-password}, which recomputed the
     * deterministic value on demand. Random passwords cannot be recovered, so
     * "show me their password again" is no longer expressible — the only
     * answer is to mint a fresh one, which is also what makes the old
     * publicly-derivable scheme unreachable.
     *
     * POST rather than GET: this mutates the member's credential, so it must
     * not be safe/idempotent, cacheable, or triggerable by link prefetch.
     *
     * Deliberately allowed even when the member has already rotated their own
     * password — that is the account-recovery path for someone locked out.
     * The action is audited.
     */
    @PostMapping("/members/{id}/reset-password")
    @Transactional
    public Map<String, Object> resetPassword(@PathVariable UUID id) {
        Member m = memberRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("member not found: " + id));
        String temp = memberPasswordService.forceReset(m);
        // Record that a reset happened; the password itself is never logged.
        auditService.record(AuthenticatedMember.id(), "RESET_MEMBER_PASSWORD", "Member", id.toString(), null);
        return Map.of(
                "username", m.getSlug(),
                "tempPassword", temp);
    }

    @PutMapping("/members/{id}")
    @Transactional
    public Member updateMember(@PathVariable UUID id, @RequestBody MemberUpdate req) {
        Member m = memberRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("member not found: " + id));
        if (req.fullName() != null)
            m.setFullName(req.fullName());
        if (req.email() != null)
            m.setEmail(req.email());

        if (req.bioPt() != null) {
            String pt = req.bioPt();
            m.setBioPt(pt);
            m.setBioEn(req.bioEn() != null ? req.bioEn() : translationService.translate(pt, "en"));
            m.setBioFr(req.bioFr() != null ? req.bioFr() : translationService.translate(pt, "fr"));
        } else {
            if (req.bioEn() != null)
                m.setBioEn(req.bioEn());
            if (req.bioFr() != null)
                m.setBioFr(req.bioFr());
        }

        if (req.photoUrl() != null)
            m.setPhotoUrl(req.photoUrl());
        if (req.linkedinUrl() != null)
            m.setLinkedinUrl(req.linkedinUrl());
        if (req.lattesUrl() != null)
            m.setLattesUrl(req.lattesUrl());
        if (req.githubUrl() != null)
            m.setGithubUrl(req.githubUrl());
        if (req.contactEmail() != null)
            m.setContactEmail(req.contactEmail());
        if (req.roadmap() != null)
            m.setRoadmap(req.roadmap());
        if (req.status() != null)
            m.setStatus(req.status());
        // Empty string clears the tag; null means no-op (field not sent by SPA).
        if (req.exchangeCountry() != null)
            m.setExchangeCountry(req.exchangeCountry().isBlank() ? null : req.exchangeCountry());
        if (req.exchangeState() != null)
            m.setExchangeState(req.exchangeState().isBlank() ? null : req.exchangeState().toUpperCase());
        // Applied after both, because either field alone can invalidate the pair:
        // moving someone from São Paulo to France has to drop the UF, and the DB
        // CHECK would otherwise reject the write with a constraint error the SPA
        // cannot explain to anyone.
        normalizeExchange(m);
        if (req.undergradProgram() != null)
            m.setUndergradProgram(parseUndergradProgram(req.undergradProgram()));
        if (req.joinedSemester() != null)
            m.setJoinedSemester(req.joinedSemester().isBlank() ? null : req.joinedSemester());
        if (req.joinedMonth() != null)
            m.setJoinedMonth(req.joinedMonth().isBlank() ? null : req.joinedMonth());
        if (req.languages() != null)
            m.setLanguages(req.languages().isBlank() ? null : req.languages());
        Member saved = memberRepository.save(m);
        auditService.record(AuthenticatedMember.id(), "UPDATE_MEMBER", "Member", id.toString(), req);
        return saved;
    }

    /**
     * Keeps the exchange country and state consistent with each other.
     *
     * <p>The two fields are edited independently but only make sense as a pair,
     * and V26's CHECK enforces that pairing at the table. Reconciling here means
     * the ordinary edits — clearing a placement, moving someone from Brazil to
     * France — succeed as a single request instead of coming back as a
     * constraint violation the SPA can only render as a generic failure.
     *
     * <p>Dropping a now-meaningless UF rather than rejecting the write is
     * deliberate: the alternative asks a coordinator to clear the state first
     * and change the country second, an ordering nothing in the UI suggests.
     */
    private static void normalizeExchange(Member m) {
        String country = m.getExchangeCountry();
        if (country == null || country.isBlank()) {
            m.setExchangeCountry(null);
            m.setExchangeState(null);
            return;
        }

        // The CHECK compares against 'BR' exactly, so a lower-case code stored
        // verbatim would make a perfectly valid pair fail at the database.
        country = country.trim().toUpperCase();
        m.setExchangeCountry(country);

        if (!"BR".equals(country)) {
            m.setExchangeState(null);
            return;
        }

        String uf = m.getExchangeState();
        if (uf != null && !BrazilianState.isValid(uf)) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Unknown Brazilian state: " + uf);
        }
    }

    /**
     * Blank clears the course; anything else must name a real enum constant.
     * Rejecting unknown values with 400 rather than silently storing null keeps
     * a typo in the SPA from quietly wiping a member's course.
     */
    private static UndergradProgram parseUndergradProgram(String raw) {
        if (raw.isBlank()) return null;
        try {
            return UndergradProgram.valueOf(raw);
        } catch (IllegalArgumentException unknown) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Unknown undergraduate program: " + raw);
        }
    }

    @DeleteMapping("/members/{id}")
    @Transactional
    public ResponseEntity<Void> softDelete(@PathVariable UUID id) {
        Member m = memberRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("member not found: " + id));
        m.setDeletedAt(Instant.now());
        m.setStatus(MemberStatus.INACTIVE);
        memberRepository.save(m);
        auditService.record(AuthenticatedMember.id(), "SOFT_DELETE_MEMBER", "Member", id.toString(), null);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/members/{id}/promote")
    @Transactional
    public Member promote(@PathVariable UUID id, @Valid @RequestBody PromoteRequest req) {
        Member updated = roleTransitionService.transition(
                new RoleTransitionService.TransitionRequest(
                        id,
                        req.toRole(),
                        req.effectiveDate() != null ? req.effectiveDate() : LocalDate.now(),
                        req.reason(),
                        req.force() != null && req.force()),
                AuthenticatedMember.id());
        auditService.record(AuthenticatedMember.id(), "PROMOTE_MEMBER", "Member", id.toString(), req);
        return updated;
    }

    // ───── Publications ─────

    @PostMapping("/publications")
    @Transactional
    public Publication createPublication(@Valid @RequestBody PublicationCreate req) {
        Publication p = new Publication();
        p.setTitle(req.title());
        p.setVenue(req.venue());
        p.setYear(req.year());
        p.setDoi(req.doi());
        p.setUrl(req.url());
        p.setType(req.type());
        p.setStatus(req.status());
        p.setAbstractText(req.abstractText());
        Publication saved = publicationRepository.save(p);
        auditService.record(AuthenticatedMember.id(), "CREATE_PUBLICATION", "Publication", saved.getId().toString(),
                req);
        return saved;
    }

    // ───── Publication approval queue ─────
    //
    // Members submit publications from the portal (MyPortalController) and they
    // land PENDING, invisible to the public site until someone here rules on
    // them. Managers entering a publication directly above skip the queue — that
    // write *is* the approval.

    @GetMapping("/publications/pending")
    public List<PendingPublicationView> pendingPublications() {
        return publicationRepository
                .findByApprovalStatusOrderByCreatedAtAsc(PublicationApproval.PENDING)
                .stream()
                .map(p -> {
                    // One lookup per row, not one per field.
                    Member submitter = p.getSubmittedBy() == null
                            ? null
                            : memberRepository.findById(p.getSubmittedBy()).orElse(null);
                    return new PendingPublicationView(
                            p,
                            submitter == null ? null : submitter.getFullName(),
                            submitter == null ? null : submitter.getSlug());
                })
                .toList();
    }

    /** Publishes a submission: it becomes visible everywhere the public list is read. */
    @PostMapping("/publications/{id}/approve")
    @Transactional
    public Publication approvePublication(@PathVariable UUID id) {
        Publication p = publicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("publication not found: " + id));
        p.setApprovalStatus(PublicationApproval.APPROVED);
        p.setReviewedBy(AuthenticatedMember.id());
        p.setReviewedAt(Instant.now());
        p.setReviewNote(null);
        Publication saved = publicationRepository.save(p);
        auditService.record(AuthenticatedMember.id(), "APPROVE_PUBLICATION", "Publication", id.toString(), null);
        return saved;
    }

    /**
     * Turns a submission down, with a reason the member reads in their portal.
     *
     * <p>Not restricted to PENDING rows on purpose: rejecting an approved
     * publication is how a manager retracts something that should not be on the
     * public site, and it keeps the record and its history instead of destroying
     * them the way DELETE does.
     */
    @PostMapping("/publications/{id}/reject")
    @Transactional
    public Publication rejectPublication(@PathVariable UUID id, @RequestBody(required = false) RejectRequest req) {
        Publication p = publicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("publication not found: " + id));
        p.setApprovalStatus(PublicationApproval.REJECTED);
        p.setReviewedBy(AuthenticatedMember.id());
        p.setReviewedAt(Instant.now());
        p.setReviewNote(req == null || req.note() == null || req.note().isBlank() ? null : req.note().trim());
        Publication saved = publicationRepository.save(p);
        auditService.record(AuthenticatedMember.id(), "REJECT_PUBLICATION", "Publication", id.toString(), req);
        return saved;
    }

    /** The queue needs a name next to each row; the entity only carries the submitter's id. */
    public record PendingPublicationView(Publication publication, String submitterName, String submitterSlug) {
    }

    public record RejectRequest(String note) {
    }

    @DeleteMapping("/publications/{id}")
    @Transactional
    public ResponseEntity<Void> deletePublication(@PathVariable UUID id) {
        if (!publicationRepository.existsById(id)) {
            throw new EntityNotFoundException("publication not found: " + id);
        }
        publicationRepository.deleteById(id);
        auditService.record(AuthenticatedMember.id(), "DELETE_PUBLICATION", "Publication", id.toString(), null);
        return ResponseEntity.noContent().build();
    }

    // ───── Projects ─────

    @PostMapping("/projects")
    @Transactional
    public Project createProject(@Valid @RequestBody ProjectCreate req) {
        Project p = new Project();
        p.setSlug(req.slug());
        p.setStatus(req.status() != null ? req.status() : ProjectStatus.ACTIVE);
        p.setYear(req.year());
        p.setArticleUrl(req.articleUrl());
        p.setTitlePt(req.titlePt());
        p.setDescriptionPt(req.descriptionPt());
        p.setTitleEn(req.titleEn());
        p.setDescriptionEn(req.descriptionEn());
        p.setTitleFr(req.titleFr());
        p.setDescriptionFr(req.descriptionFr());
        if (req.tags() != null)
            p.setTags(req.tags());
        Project saved = projectRepository.save(p);

        if (req.leaders() != null) {
            for (ProjectMemberDto dto : req.leaders()) {
                memberProjectRepository.save(new MemberProject(saved.getId(), dto.memberId(), dto.role()));
            }
        }

        auditService.record(AuthenticatedMember.id(), "CREATE_PROJECT", "Project", saved.getId().toString(), req);
        return saved;
    }

    @PutMapping("/projects/{id}")
    @Transactional
    public Project updateProject(@PathVariable UUID id, @RequestBody ProjectUpdate req) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("project not found: " + id));
        if (req.slug() != null)
            p.setSlug(req.slug());
        if (req.status() != null)
            p.setStatus(req.status());
        if (req.year() != null)
            p.setYear(req.year());
        // articleUrl uses a sentinel: empty string clears the link, null leaves it
        // alone.
        if (req.articleUrl() != null)
            p.setArticleUrl(req.articleUrl().isBlank() ? null : req.articleUrl());
        if (req.titlePt() != null)
            p.setTitlePt(req.titlePt());
        if (req.descriptionPt() != null)
            p.setDescriptionPt(req.descriptionPt());
        if (req.titleEn() != null)
            p.setTitleEn(req.titleEn());
        if (req.descriptionEn() != null)
            p.setDescriptionEn(req.descriptionEn());
        if (req.titleFr() != null)
            p.setTitleFr(req.titleFr());
        if (req.descriptionFr() != null)
            p.setDescriptionFr(req.descriptionFr());
        if (req.tags() != null)
            p.setTags(req.tags());
        Project saved = projectRepository.save(p);
        auditService.record(AuthenticatedMember.id(), "UPDATE_PROJECT", "Project", saved.getId().toString(), req);
        return saved;
    }

    @PutMapping("/projects/{id}/members")
    @Transactional
    public ResponseEntity<Void> updateProjectMembers(@PathVariable UUID id,
            @RequestBody List<ProjectMemberDto> members) {
        if (!projectRepository.existsById(id)) {
            throw new EntityNotFoundException("project not found: " + id);
        }
        memberProjectRepository.deleteByProjectId(id);
        for (ProjectMemberDto dto : members) {
            memberProjectRepository.save(new MemberProject(id, dto.memberId(), dto.role()));
        }
        auditService.record(AuthenticatedMember.id(), "UPDATE_PROJECT_MEMBERS", "Project", id.toString(), members);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/projects/{id}")
    @Transactional
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {
        if (!projectRepository.existsById(id)) {
            throw new EntityNotFoundException("project not found: " + id);
        }
        projectRepository.deleteById(id);
        auditService.record(AuthenticatedMember.id(), "DELETE_PROJECT", "Project", id.toString(), null);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/members/{id}/projects")
    @Transactional
    public ResponseEntity<Void> updateMemberProjects(@PathVariable UUID id,
            @RequestBody List<MemberProjectDto> newProjects) {
        if (!memberRepository.existsById(id)) {
            throw new EntityNotFoundException("member not found: " + id);
        }
        memberProjectRepository.deleteByMemberId(id);
        for (MemberProjectDto dto : newProjects) {
            memberProjectRepository.save(new MemberProject(dto.projectId(), id, dto.role()));
        }
        auditService.record(AuthenticatedMember.id(), "UPDATE_MEMBER_PROJECTS", "Member", id.toString(), newProjects);
        return ResponseEntity.noContent().build();
    }

    // ───── Audit feed ─────

    @GetMapping("/audit")
    public Page<AuditLog> audit(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return auditLogRepository.findAllByOrderByOccurredAtDesc(PageRequest.of(page, Math.min(size, 200)));
    }

    // ───── Records ─────

    public record MemberCreate(
            @NotBlank String slug,
            @NotBlank String fullName,
            String email,
            @NotNull MemberRole currentRole,
            LocalDate currentRoleStartedAt,
            MemberStatus status) {
    }

    public record MemberUpdate(
            String fullName, String email,
            String bioPt, String bioEn, String bioFr,
            String photoUrl, String linkedinUrl, String lattesUrl, String githubUrl,
            String contactEmail, String roadmap,
            MemberStatus status,
            String exchangeCountry,
            // UF for a placement inside Brazil; "" clears it, and it is dropped
            // automatically whenever the country is not BR.
            String exchangeState,
            // Enum name, or "" to clear. Typed as String rather than
            // UndergradProgram so the empty-string-clears convention matches
            // exchangeCountry — Jackson would reject "" for an enum outright.
            String undergradProgram,
            // Same empty-string-clears contract; format is enforced by the DB
            // CHECK constraints from V22 as well as the /me DTO pattern.
            String joinedSemester,
            String joinedMonth,
            String languages) {
    }

    public record PromoteRequest(
            @NotNull MemberRole toRole,
            LocalDate effectiveDate,
            String reason,
            Boolean force) {
    }

    public record PublicationCreate(
            @NotBlank String title,
            @NotBlank String venue,
            short year,
            String doi,
            String url,
            @NotNull PublicationType type,
            @NotNull PublicationStatus status,
            String abstractText) {
    }

    public record ProjectCreate(
            @NotBlank String slug,
            ProjectStatus status,
            Short year,
            String articleUrl,
            String titlePt, String descriptionPt,
            String titleEn, String descriptionEn,
            String titleFr, String descriptionFr,
            List<String> tags,
            List<ProjectMemberDto> leaders) {
    }

    public record ProjectUpdate(
            String slug,
            ProjectStatus status,
            Short year,
            String articleUrl,
            String titlePt, String descriptionPt,
            String titleEn, String descriptionEn,
            String titleFr, String descriptionFr,
            List<String> tags) {
    }

    public record MemberProjectDto(
            @NotNull UUID projectId,
            @NotBlank String role) {
    }

    public record ProjectMemberDto(
            @NotNull UUID memberId,
            @NotBlank String role) {
    }
}
