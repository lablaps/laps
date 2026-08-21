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
import br.uema.laps.security.MemberPermission;
import br.uema.laps.security.ManagerAllowlist;
import br.uema.laps.member.MemberPublicView;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private final ManagerAllowlist managerAllowlist;

    public AdminController(
            MemberRepository memberRepository,
            PublicationRepository publicationRepository,
            ProjectRepository projectRepository,
            MemberProjectRepository memberProjectRepository,
            RoleTransitionService roleTransitionService,
            AuditService auditService,
            AuditLogRepository auditLogRepository,
            TranslationService translationService,
            MemberPasswordService memberPasswordService,
            ManagerAllowlist managerAllowlist) {
        this.memberRepository = memberRepository;
        this.publicationRepository = publicationRepository;
        this.projectRepository = projectRepository;
        this.memberProjectRepository = memberProjectRepository;
        this.roleTransitionService = roleTransitionService;
        this.auditService = auditService;
        this.auditLogRepository = auditLogRepository;
        this.translationService = translationService;
        this.memberPasswordService = memberPasswordService;
        this.managerAllowlist = managerAllowlist;
    }

    // ───── Members ─────

    @PostMapping("/members")
    @Transactional
    public Map<String, Object> createMember(@Valid @RequestBody MemberCreate req) {
        requireAssignable(req.currentRole());
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

    @GetMapping("/members")
    @Transactional(readOnly = true)
    public List<AdminMemberView> members() {
        return memberRepository.findAllByDeletedAtIsNull(
                        PageRequest.of(0, 500, Sort.by(Sort.Direction.ASC, "fullName"))).stream()
                .map(member -> AdminMemberView.of(member, managerAllowlist))
                .toList();
    }

    @PutMapping("/members/{id}/management-access")
    @Transactional
    public AdminMemberView setManagementAccess(
            @PathVariable UUID id,
            @Valid @RequestBody ManagementAccessUpdate req) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("member not found: " + id));
        boolean enabled = Boolean.TRUE.equals(req.enabled());
        if (enabled) {
            member.getPermissions().add(MemberPermission.MANAGE_PLATFORM);
        } else {
            member.getPermissions().remove(MemberPermission.MANAGE_PLATFORM);
        }
        Member saved = memberRepository.save(member);
        auditService.record(
                AuthenticatedMember.id(),
                enabled ? "GRANT_MANAGEMENT_ACCESS" : "REVOKE_MANAGEMENT_ACCESS",
                "Member",
                id.toString(),
                req);
        return AdminMemberView.of(saved, managerAllowlist);
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
        requireAssignable(req.toRole());
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

    /**
     * The lab's whole publication record, authors resolved, newest first.
     *
     * <p>Deliberately not filtered to APPROVED, unlike every public read: this
     * is the console's working list, so a manager sees the rejected and
     * still-pending rows beside the live ones instead of having to guess why a
     * paper is missing from the site. The list is unpaged for the same reason
     * the roster and the project list are — a lab's bibliography is tens of
     * rows, and the console filters it client-side.
     */
    @GetMapping("/publications")
    public List<AdminPublicationView> publications() {
        return withAuthors(publicationRepository.findAll(
                Sort.by(Sort.Direction.DESC, "year").and(Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @PostMapping("/publications")
    @Transactional
    public AdminPublicationView createPublication(@Valid @RequestBody PublicationCreate req) {
        Publication p = new Publication();
        p.setTitle(req.title().trim());
        p.setVenue(req.venue().trim());
        p.setYear(req.year());
        p.setDoi(blankToNull(req.doi()));
        p.setUrl(blankToNull(req.url()));
        p.setType(req.type());
        p.setStatus(req.status());
        p.setAbstractText(blankToNull(req.abstractText()));
        Publication saved = publicationRepository.save(p);

        // A manager entering a publication *is* the approval (see V27), so the
        // entity's APPROVED default stands and this reaches the public site at
        // once — including the profile of everyone named below.
        writeAuthors(saved.getId(), req.authors());

        auditService.record(AuthenticatedMember.id(), "CREATE_PUBLICATION", "Publication", saved.getId().toString(),
                req);
        return withAuthors(List.of(saved)).get(0);
    }

    /**
     * Edits a publication, including who is on it.
     *
     * <p>This is the only path that can name a co-author. The portal's
     * submission endpoint records the submitter and nobody else on purpose —
     * naming someone is a claim about them — so attaching the rest of the
     * authors to an approved submission happens here, by the manager who
     * reviewed it.
     */
    @PutMapping("/publications/{id}")
    @Transactional
    public AdminPublicationView updatePublication(@PathVariable UUID id, @RequestBody PublicationUpdate req) {
        Publication p = publicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("publication not found: " + id));

        if (req.title() != null)
            p.setTitle(req.title().trim());
        if (req.venue() != null)
            p.setVenue(req.venue().trim());
        if (req.year() != null)
            p.setYear(req.year());
        if (req.type() != null)
            p.setType(req.type());
        if (req.status() != null)
            p.setStatus(req.status());
        // Same sentinel the project fields use: empty string clears the value,
        // null means the SPA did not send the field at all.
        if (req.doi() != null)
            p.setDoi(blankToNull(req.doi()));
        if (req.url() != null)
            p.setUrl(blankToNull(req.url()));
        if (req.abstractText() != null)
            p.setAbstractText(blankToNull(req.abstractText()));

        Publication saved = publicationRepository.save(p);

        // Null leaves the author list untouched — a manager fixing a typo in the
        // venue must not silently drop every name from the paper.
        if (req.authors() != null) {
            writeAuthors(id, req.authors());
        }

        auditService.record(AuthenticatedMember.id(), "UPDATE_PUBLICATION", "Publication", id.toString(), req);
        return withAuthors(List.of(saved)).get(0);
    }

    /**
     * Replaces a publication's author list with exactly what was sent.
     *
     * <p>Position in the list <em>is</em> {@code author_order}: on a paper the
     * order of names is part of the record, and the console lets a manager
     * reorder them. Replace-all rather than diffing because {@code authorship}
     * has no primary key and reordering has no update to express.
     */
    private void writeAuthors(UUID publicationId, List<AuthorLink> authors) {
        // Also flushes the pending publication INSERT on the create path — the
        // authorship rows below carry a foreign key to a row Hibernate would
        // otherwise still be holding in the persistence context.
        publicationRepository.deleteAuthorsByPublicationId(publicationId);
        if (authors == null || authors.isEmpty()) {
            return;
        }

        Set<UUID> seenMembers = new HashSet<>();
        short order = 1;
        for (AuthorLink author : authors) {
            String role = normalizeAuthorRole(author.role());
            String externalName = blankToNull(author.externalName());
            UUID memberId = author.memberId();

            if ((memberId == null) == (externalName == null)) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Each author is either a roster member or an external name — never both, never neither");
            }

            if (memberId == null) {
                publicationRepository.addExternalAuthor(publicationId, externalName, order, role);
            } else {
                // An id that names nobody would surface as a foreign-key
                // violation: a 500 the console cannot explain to whoever picked
                // a member the roster had already dropped.
                if (!memberRepository.existsById(memberId)) {
                    throw new ResponseStatusException(
                            org.springframework.http.HttpStatus.BAD_REQUEST, "Unknown member: " + memberId);
                }
                // The same member twice would double-count the paper on their
                // profile, where /publications?memberId joins authorship.
                if (!seenMembers.add(memberId)) {
                    throw new ResponseStatusException(
                            org.springframework.http.HttpStatus.BAD_REQUEST,
                            "Member listed twice as author: " + memberId);
                }
                publicationRepository.addMemberAuthor(publicationId, memberId, order, role);
            }
            order++;
        }
    }

    /** The roles the public profile pages know how to render. */
    private static final Set<String> AUTHOR_ROLES = Set.of("AUTHOR", "ADVISOR", "CO_ADVISOR");

    /**
     * Blank means the ordinary case, AUTHOR. Anything outside the set is a typo
     * rather than a new concept — storing it would put a role on the page that
     * nothing knows how to label, and {@code author_role} has no CHECK to catch
     * it at the table.
     */
    private static String normalizeAuthorRole(String raw) {
        if (raw == null || raw.isBlank()) {
            return "AUTHOR";
        }
        String role = raw.trim().toUpperCase();
        if (!AUTHOR_ROLES.contains(role)) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Unknown author role: " + raw);
        }
        return role;
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    /**
     * Attaches each publication's author list, resolving member ids to names.
     *
     * <p>Two queries for the whole page rather than two per row: the authorship
     * rows come back in one batch, and the members they name in another.
     */
    private List<AdminPublicationView> withAuthors(List<Publication> publications) {
        if (publications.isEmpty()) {
            // IN () is a syntax error, and a lab with no publications on record
            // yet is a real state.
            return List.of();
        }

        List<PublicationRepository.AuthorRow> rows = publicationRepository.findAuthorRows(
                publications.stream().map(Publication::getId).toList());

        Map<UUID, Member> membersById = new HashMap<>();
        memberRepository
                .findAllById(rows.stream()
                        .map(PublicationRepository.AuthorRow::getMemberId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet()))
                .forEach(m -> membersById.put(m.getId(), m));

        Map<UUID, List<AuthorView>> byPublication = new LinkedHashMap<>();
        for (PublicationRepository.AuthorRow row : rows) {
            Member m = row.getMemberId() == null ? null : membersById.get(row.getMemberId());
            byPublication
                    .computeIfAbsent(row.getPublicationId(), k -> new ArrayList<>())
                    .add(new AuthorView(
                            row.getMemberId(),
                            m != null ? m.getFullName() : row.getExternalAuthorName(),
                            m != null ? m.getSlug() : null,
                            row.getAuthorRole(),
                            row.getAuthorOrder()));
        }

        return publications.stream()
                .map(p -> new AdminPublicationView(p, byPublication.getOrDefault(p.getId(), List.of())))
                .toList();
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

    private static void requireAssignable(MemberRole role) {
        if (role == null || !role.isAssignable()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Management duties cannot be assigned as member roles");
        }
    }

    public record AdminMemberView(
            MemberPublicView member,
            boolean mustChangePassword,
            boolean emailVerified,
            boolean canManage,
            boolean managementPermissionGranted,
            boolean managementAccessFromAllowlist) {
        static AdminMemberView of(Member member, ManagerAllowlist managerAllowlist) {
            boolean permissionGranted = member.hasPermission(MemberPermission.MANAGE_PLATFORM);
            boolean allowlisted = managerAllowlist.isManager(member.getEmail());
            return new AdminMemberView(
                    MemberPublicView.of(member, true),
                    member.isMustChangePassword(),
                    member.isEmailVerified(),
                    permissionGranted || allowlisted,
                    permissionGranted,
                    allowlisted);
        }
    }

    public record ManagementAccessUpdate(@NotNull Boolean enabled) {
    }

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
            String abstractText,
            List<AuthorLink> authors) {
    }

    /** Every field optional: null is "not sent", and only what arrives is written. */
    public record PublicationUpdate(
            String title,
            String venue,
            Short year,
            String doi,
            String url,
            PublicationType type,
            PublicationStatus status,
            String abstractText,
            List<AuthorLink> authors) {
    }

    /**
     * One name on a paper — a roster member by id, or someone from another
     * institution by name. Exactly one of the two, enforced in
     * {@code writeAuthors}: an entry with both would be two different claims
     * about the same position in the author list.
     */
    public record AuthorLink(
            UUID memberId,
            String externalName,
            /** AUTHOR (default), ADVISOR or CO_ADVISOR. */
            String role) {
    }

    /** A publication plus its author list, which the entity itself does not expose. */
    public record AdminPublicationView(Publication publication, List<AuthorView> authors) {
    }

    /**
     * An author as the console renders it. {@code memberId} and {@code slug} are
     * null for an external co-author, which is exactly what tells the two apart.
     */
    public record AuthorView(UUID memberId, String name, String slug, String role, short order) {
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
