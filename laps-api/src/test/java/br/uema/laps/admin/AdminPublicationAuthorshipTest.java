package br.uema.laps.admin;

import br.uema.laps.audit.AuditLogRepository;
import br.uema.laps.audit.AuditService;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.project.MemberProjectRepository;
import br.uema.laps.project.ProjectRepository;
import br.uema.laps.publication.Publication;
import br.uema.laps.publication.PublicationRepository;
import br.uema.laps.publication.PublicationStatus;
import br.uema.laps.publication.PublicationType;
import br.uema.laps.roletracking.RoleTransitionService;
import br.uema.laps.security.MemberPasswordService;
import br.uema.laps.security.ManagerAllowlist;
import br.uema.laps.translate.TranslationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyShort;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Naming the people on a publication, from the Central de Comando.
 *
 * <p>This is the only path that can attach a co-author: the portal records the
 * submitter and nobody else, because naming someone is a claim about them. What
 * the tests below pin down is the authorship table's own shape — order is part
 * of the record, an external co-author is a row with no member, and a bad id
 * has to come back as a 400 instead of a foreign-key failure.
 */
class AdminPublicationAuthorshipTest {

    private static final UUID MANAGER = UUID.randomUUID();
    private static final UUID PUBLICATION = UUID.randomUUID();

    private MemberRepository memberRepository;
    private PublicationRepository publicationRepository;
    private AdminController controller;

    @BeforeEach
    void setUp() {
        memberRepository = mock(MemberRepository.class);
        publicationRepository = mock(PublicationRepository.class);

        controller = new AdminController(
                memberRepository,
                publicationRepository,
                mock(ProjectRepository.class),
                mock(MemberProjectRepository.class),
                mock(RoleTransitionService.class),
                mock(AuditService.class),
                mock(AuditLogRepository.class),
                mock(TranslationService.class),
                mock(MemberPasswordService.class),
                mock(ManagerAllowlist.class));

        when(publicationRepository.save(any(Publication.class))).thenAnswer(inv -> {
            Publication p = inv.getArgument(0);
            if (p.getId() == null) p.setId(PUBLICATION);
            return p;
        });
        // Every id the tests hand in names a real member unless a test says otherwise.
        when(memberRepository.existsById(any(UUID.class))).thenReturn(true);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        MANAGER.toString(), null, List.of(new SimpleGrantedAuthority("MANAGER"))));
    }

    private AdminController.PublicationCreate create(AdminController.AuthorLink... authors) {
        return new AdminController.PublicationCreate(
                "Wavelet denoising of ECG under baseline wander",
                "SBrT 2026",
                (short) 2026,
                "10.1000/example",
                "https://example.org/paper",
                PublicationType.CONFERENCE,
                PublicationStatus.PUBLISHED,
                "An abstract.",
                List.of(authors));
    }

    private static AdminController.AuthorLink member(UUID id) {
        return new AdminController.AuthorLink(id, null, null);
    }

    @Test
    @DisplayName("each author becomes one authorship row, numbered in the order they were sent")
    void authorsAreNumberedInOrder() {
        UUID first = UUID.randomUUID();
        UUID second = UUID.randomUUID();

        controller.createPublication(create(member(first), member(second)));

        InOrder order = inOrder(publicationRepository);
        order.verify(publicationRepository).addMemberAuthor(PUBLICATION, first, (short) 1, "AUTHOR");
        order.verify(publicationRepository).addMemberAuthor(PUBLICATION, second, (short) 2, "AUTHOR");
    }

    @Test
    @DisplayName("an external co-author is stored with no member id — the row a @ManyToMany could not hold")
    void externalCoAuthorIsStoredByName() {
        controller.createPublication(create(
                member(UUID.randomUUID()),
                new AdminController.AuthorLink(null, "  Daniel G. Costa (Univ. Porto)  ", "CO_ADVISOR")));

        verify(publicationRepository).addExternalAuthor(
                PUBLICATION, "Daniel G. Costa (Univ. Porto)", (short) 2, "CO_ADVISOR");
    }

    @Test
    @DisplayName("an id that names nobody is a 400, so it never reaches the foreign key as a 500")
    void unknownMemberIsRejected() {
        UUID ghost = UUID.randomUUID();
        when(memberRepository.existsById(ghost)).thenReturn(false);

        assertThatThrownBy(() -> controller.createPublication(create(member(ghost))))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("400");

        verify(publicationRepository, never()).addMemberAuthor(any(), eq(ghost), anyShort(), anyString());
    }

    @Test
    @DisplayName("the same member twice is refused — it would double-count the paper on their profile")
    void duplicateAuthorIsRejected() {
        UUID twice = UUID.randomUUID();

        assertThatThrownBy(() -> controller.createPublication(create(member(twice), member(twice))))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("400");
    }

    @Test
    @DisplayName("an author who is both a member and an external name is refused, as is one who is neither")
    void anAuthorIsAMemberOrAName() {
        UUID id = UUID.randomUUID();

        assertThatThrownBy(() -> controller.createPublication(
                create(new AdminController.AuthorLink(id, "Someone Else", null))))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("400");

        assertThatThrownBy(() -> controller.createPublication(
                create(new AdminController.AuthorLink(null, "   ", null))))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("400");
    }

    @Test
    @DisplayName("an unknown author role is refused rather than stored — author_role has no CHECK to catch it")
    void unknownRoleIsRejected() {
        assertThatThrownBy(() -> controller.createPublication(
                create(new AdminController.AuthorLink(UUID.randomUUID(), null, "REVIEWER"))))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("400");
    }

    @Test
    @DisplayName("editing the author list clears the old rows first, so a reorder is not an append")
    void editReplacesTheAuthorList() {
        Publication existing = new Publication();
        existing.setId(PUBLICATION);
        existing.setTitle("Wavelet denoising of ECG under baseline wander");
        existing.setVenue("SBrT 2026");
        existing.setYear((short) 2026);
        existing.setType(PublicationType.CONFERENCE);
        existing.setStatus(PublicationStatus.PUBLISHED);
        when(publicationRepository.findById(PUBLICATION)).thenReturn(Optional.of(existing));

        UUID promoted = UUID.randomUUID();
        controller.updatePublication(PUBLICATION, new AdminController.PublicationUpdate(
                null, null, null, null, null, null, null, null, List.of(member(promoted))));

        InOrder order = inOrder(publicationRepository);
        order.verify(publicationRepository).deleteAuthorsByPublicationId(PUBLICATION);
        order.verify(publicationRepository).addMemberAuthor(PUBLICATION, promoted, (short) 1, "AUTHOR");
    }

    @Test
    @DisplayName("an update that omits authors leaves them alone — fixing a venue must not unname the paper")
    void omittedAuthorsAreLeftAlone() {
        Publication existing = new Publication();
        existing.setId(PUBLICATION);
        existing.setTitle("Wavelet denoising of ECG under baseline wander");
        existing.setVenue("SBrT 2025");
        existing.setYear((short) 2026);
        existing.setType(PublicationType.CONFERENCE);
        existing.setStatus(PublicationStatus.PUBLISHED);
        when(publicationRepository.findById(PUBLICATION)).thenReturn(Optional.of(existing));

        controller.updatePublication(PUBLICATION, new AdminController.PublicationUpdate(
                null, "SBrT 2026", null, null, null, null, null, null, null));

        assertThat(existing.getVenue()).isEqualTo("SBrT 2026");
        verify(publicationRepository, never()).deleteAuthorsByPublicationId(any());
    }

    @Test
    @DisplayName("blank optional fields are stored as null rather than empty strings")
    void blankOptionalsBecomeNull() {
        controller.createPublication(new AdminController.PublicationCreate(
                "  No DOI yet  ", " Workshop ", (short) 2025,
                "  ", "", PublicationType.WORKSHOP, PublicationStatus.PUBLISHED, "   ",
                List.of()));

        org.mockito.ArgumentCaptor<Publication> captor = org.mockito.ArgumentCaptor.forClass(Publication.class);
        verify(publicationRepository).save(captor.capture());
        Publication saved = captor.getValue();
        assertThat(saved.getTitle()).isEqualTo("No DOI yet");
        assertThat(saved.getVenue()).isEqualTo("Workshop");
        assertThat(saved.getDoi()).isNull();
        assertThat(saved.getUrl()).isNull();
        assertThat(saved.getAbstractText()).isNull();
    }
}
