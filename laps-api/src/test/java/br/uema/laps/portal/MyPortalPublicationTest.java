package br.uema.laps.portal;

import br.uema.laps.email.EmailSendBudget;
import br.uema.laps.email.EmailService;
import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.member.MemberRole;
import br.uema.laps.member.MemberStatus;
import br.uema.laps.project.MemberProjectRepository;
import br.uema.laps.project.ProjectRepository;
import br.uema.laps.publication.Publication;
import br.uema.laps.publication.PublicationApproval;
import br.uema.laps.publication.PublicationRepository;
import br.uema.laps.publication.PublicationStatus;
import br.uema.laps.publication.PublicationType;
import br.uema.laps.security.ManagerAllowlist;
import br.uema.laps.security.RateLimitGuard;
import br.uema.laps.translate.TranslationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Self-service publication submission.
 *
 * <p>Publications are the one authoring path open to every tier: an undergrad
 * with a conference paper reports it themselves, where the same undergrad
 * cannot create or join a project ({@link MyPortalProjectLinkTest}). The safety
 * property is not the role check that projects use — it is that a submission
 * lands PENDING and reaches nobody until a manager approves it.
 */
class MyPortalPublicationTest {

    private static final UUID ME = UUID.randomUUID();

    private MemberRepository memberRepository;
    private PublicationRepository publicationRepository;
    private MyPortalController controller;
    private Member me;

    @BeforeEach
    void setUp() {
        memberRepository = mock(MemberRepository.class);
        publicationRepository = mock(PublicationRepository.class);

        controller = new MyPortalController(
                memberRepository,
                mock(MemberProjectRepository.class),
                mock(ProjectRepository.class),
                publicationRepository,
                mock(PasswordEncoder.class),
                mock(TranslationService.class),
                mock(RateLimitGuard.class),
                mock(EmailService.class),
                mock(EmailSendBudget.class),
                new ManagerAllowlist(List.of()));

        me = new Member();
        me.setId(ME);
        me.setSlug("me");
        me.setStatus(MemberStatus.ACTIVE);
        me.setMustChangePassword(false);
        // The tier that matters: everything below is asserted for an undergrad.
        me.setCurrentRole(MemberRole.UNDERGRAD);
        when(memberRepository.findById(ME)).thenReturn(Optional.of(me));
        when(publicationRepository.save(any(Publication.class)))
                .thenAnswer(inv -> {
                    Publication p = inv.getArgument(0);
                    if (p.getId() == null) p.setId(UUID.randomUUID());
                    return p;
                });

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        ME.toString(), null, List.of(new SimpleGrantedAuthority("MEMBER"))));
    }

    private MyPortalController.MyPublicationCreate request() {
        return new MyPortalController.MyPublicationCreate(
                "Wavelet denoising of ECG under baseline wander",
                "SBrT 2026",
                2026,
                PublicationType.CONFERENCE,
                PublicationStatus.PUBLISHED,
                "10.1000/example",
                "https://example.org/paper",
                "An abstract.");
    }

    private Publication saved() {
        ArgumentCaptor<Publication> captor = ArgumentCaptor.forClass(Publication.class);
        verify(publicationRepository).save(captor.capture());
        return captor.getValue();
    }

    @Test
    @DisplayName("an undergrad may submit a publication — this is not tiered like projects")
    void undergradMaySubmit() {
        var response = controller.submitPublication(request());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(saved().getTitle()).isEqualTo("Wavelet denoising of ECG under baseline wander");
    }

    @Test
    @DisplayName("a submission lands PENDING, so it is not on the public site yet")
    void submissionIsPending() {
        controller.submitPublication(request());

        assertThat(saved().getApprovalStatus()).isEqualTo(PublicationApproval.PENDING);
    }

    @Test
    @DisplayName("the submitter is recorded, so no entry is anonymous")
    void submitterIsRecorded() {
        controller.submitPublication(request());

        assertThat(saved().getSubmittedBy()).isEqualTo(ME);
    }

    @Test
    @DisplayName("the submitter is attached as author 1 — otherwise it never shows on their profile")
    void submitterBecomesAuthor() {
        var response = controller.submitPublication(request());

        verify(publicationRepository).addAuthor(
                eq(response.getBody().getId()), eq(ME), eq((short) 1));
    }

    @Test
    @DisplayName("the research status is the member's to state; approval is not")
    void researchStatusIsIndependentOfApproval() {
        controller.submitPublication(new MyPortalController.MyPublicationCreate(
                "In-press paper", "IEEE TSP", 2026,
                PublicationType.JOURNAL, PublicationStatus.IN_PRESS,
                null, null, null));

        Publication p = saved();
        assertThat(p.getStatus()).isEqualTo(PublicationStatus.IN_PRESS);
        assertThat(p.getApprovalStatus()).isEqualTo(PublicationApproval.PENDING);
    }

    @Test
    @DisplayName("blank optional fields are stored as null rather than empty strings")
    void blankOptionalsBecomeNull() {
        controller.submitPublication(new MyPortalController.MyPublicationCreate(
                "No DOI yet", "Workshop", 2025,
                PublicationType.WORKSHOP, null, "  ", "", "   "));

        Publication p = saved();
        assertThat(p.getDoi()).isNull();
        assertThat(p.getUrl()).isNull();
        assertThat(p.getAbstractText()).isNull();
        // Status is optional on the request; PUBLISHED is the sane default.
        assertThat(p.getStatus()).isEqualTo(PublicationStatus.PUBLISHED);
    }

    @Test
    @DisplayName("an unrotated temp password still blocks the write, as on every other portal endpoint")
    void tempPasswordStillBlocks() {
        me.setMustChangePassword(true);

        assertThatThrownBy(() -> controller.submitPublication(request()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("403");

        verify(publicationRepository, never()).save(any(Publication.class));
        verify(publicationRepository, never()).addAuthor(any(), any(), org.mockito.ArgumentMatchers.anyShort());
    }
}
