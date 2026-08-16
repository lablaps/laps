package br.uema.laps.portal;

import br.uema.laps.email.EmailSendBudget;
import br.uema.laps.email.EmailService;
import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.member.MemberRole;
import br.uema.laps.member.MemberStatus;
import br.uema.laps.project.MemberProject;
import br.uema.laps.project.MemberProjectRepository;
import br.uema.laps.project.ProjectRepository;
import br.uema.laps.publication.PublicationRepository;
import br.uema.laps.security.ManagerAllowlist;
import br.uema.laps.security.RateLimitGuard;
import br.uema.laps.translate.TranslationService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * The project-link endpoints let a member edit their own memberships. The role
 * on each link is authority — the public site renders LEAD as "Orientador" —
 * and it used to be stored verbatim from the request body against a free-text
 * column with no CHECK constraint, for any project id the caller named.
 */
class MyPortalProjectLinkTest {

    private static final UUID ME = UUID.randomUUID();
    private static final UUID PROJECT_A = UUID.randomUUID();
    private static final UUID PROJECT_B = UUID.randomUUID();

    private MemberRepository memberRepository;
    private MemberProjectRepository memberProjectRepository;
    private ProjectRepository projectRepository;
    private MyPortalController controller;

    @BeforeEach
    void setUp() {
        memberRepository = mock(MemberRepository.class);
        memberProjectRepository = mock(MemberProjectRepository.class);
        projectRepository = mock(ProjectRepository.class);

        controller = new MyPortalController(
                memberRepository,
                memberProjectRepository,
                projectRepository,
                mock(PublicationRepository.class),
                mock(PasswordEncoder.class),
                mock(TranslationService.class),
                mock(RateLimitGuard.class),
                mock(EmailService.class),
                mock(EmailSendBudget.class),
                new ManagerAllowlist(List.of()));

        Member me = new Member();
        me.setId(ME);
        me.setSlug("me");
        me.setStatus(MemberStatus.ACTIVE);
        me.setMustChangePassword(false);
        when(memberRepository.findById(ME)).thenReturn(Optional.of(me));
        when(projectRepository.existsById(any())).thenReturn(true);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        ME.toString(), null, List.of(new SimpleGrantedAuthority("MEMBER"))));
    }

    private List<MemberProject> savedLinks() {
        ArgumentCaptor<MemberProject> captor = ArgumentCaptor.forClass(MemberProject.class);
        verify(memberProjectRepository, times(1)).save(captor.capture());
        return captor.getAllValues();
    }

    @Test
    @DisplayName("a member cannot promote themselves to LEAD on a project they are joining")
    void newLinkIsAlwaysResearcher() {
        when(memberProjectRepository.findByMemberId(ME)).thenReturn(List.of());

        controller.updateMyProjects(List.of(
                new MyPortalController.MyProjectLink(PROJECT_A, "LEAD")));

        assertThat(savedLinks()).singleElement()
                .satisfies(link -> {
                    assertThat(link.getRole()).isEqualTo("RESEARCHER");
                    assertThat(link.getMemberId()).isEqualTo(ME);
                });
    }

    @Test
    @DisplayName("an arbitrary role string is not stored either")
    void arbitraryRoleStringIsIgnored() {
        when(memberProjectRepository.findByMemberId(ME)).thenReturn(List.of());

        controller.updateMyProjects(List.of(
                new MyPortalController.MyProjectLink(PROJECT_A, "SUPREME_DIRECTOR")));

        assertThat(savedLinks()).singleElement()
                .satisfies(link -> assertThat(link.getRole()).isEqualTo("RESEARCHER"));
    }

    @Test
    @DisplayName("an existing elevated role is preserved, so editing the list does not demote you")
    void existingRoleIsPreserved() {
        // Granted by a manager, or earned by creating the project.
        when(memberProjectRepository.findByMemberId(ME))
                .thenReturn(List.of(new MemberProject(PROJECT_A, ME, "CO_LEAD")));

        controller.updateMyProjects(List.of(
                new MyPortalController.MyProjectLink(PROJECT_A, "RESEARCHER")));

        assertThat(savedLinks()).singleElement()
                .satisfies(link -> assertThat(link.getRole()).isEqualTo("CO_LEAD"));
    }

    @Test
    @DisplayName("the stored role wins over a client attempt to escalate an existing link")
    void clientCannotEscalateExistingLink() {
        when(memberProjectRepository.findByMemberId(ME))
                .thenReturn(List.of(new MemberProject(PROJECT_A, ME, "RESEARCHER")));

        controller.updateMyProjects(List.of(
                new MyPortalController.MyProjectLink(PROJECT_A, "LEAD")));

        assertThat(savedLinks()).singleElement()
                .satisfies(link -> assertThat(link.getRole()).isEqualTo("RESEARCHER"));
    }

    @Test
    @DisplayName("a link to a project that does not exist is refused")
    void unknownProjectRefused() {
        when(memberProjectRepository.findByMemberId(ME)).thenReturn(List.of());
        when(projectRepository.existsById(PROJECT_B)).thenReturn(false);

        assertThatThrownBy(() -> controller.updateMyProjects(List.of(
                new MyPortalController.MyProjectLink(PROJECT_B, "RESEARCHER"))))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("an advisor must actually be a head or coordinator")
    void advisorMustBeLabLeadership() {
        UUID advisorId = UUID.randomUUID();
        Member notLeadership = new Member();
        notLeadership.setId(advisorId);
        notLeadership.setCurrentRole(MemberRole.UNDERGRAD);
        notLeadership.setStatus(MemberStatus.ACTIVE);
        when(memberRepository.findById(advisorId)).thenReturn(Optional.of(notLeadership));
        when(projectRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        assertThatThrownBy(() -> controller.createMyProject(
                new MyPortalController.MemberProjectCreate(
                        "Projeto", null, null, null, null, null, advisorId, null)))
                .hasMessageContaining("head or coordinator");

        // The undergrad must not have been linked as LEAD before the check.
        verify(memberProjectRepository, never()).save(any());
    }

    @Test
    @DisplayName("an unknown project status is a 400, not the 500 valueOf produced")
    void unknownStatusIsRejected() {
        when(projectRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        assertThatThrownBy(() -> controller.createMyProject(
                new MyPortalController.MemberProjectCreate(
                        "Projeto", null, "NOT_A_STATUS", null, null, null, null, null)))
                .hasMessageContaining("Unknown project status");
    }

    /** Puts the authenticated caller on the undergraduate tier. */
    private void makeMeAnUndergrad() {
        Member me = memberRepository.findById(ME).orElseThrow();
        me.setCurrentRole(MemberRole.UNDERGRAD);
    }

    @Test
    @DisplayName("an undergrad cannot create a project")
    void undergradCannotCreateProject() {
        makeMeAnUndergrad();
        when(projectRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        assertThatThrownBy(() -> controller.createMyProject(
                new MyPortalController.MemberProjectCreate(
                        "Projeto", null, null, null, null, null, null, null)))
                .hasMessageContaining("cannot add or join projects");

        // Refused before anything is written — no orphan project row, no links.
        verify(projectRepository, never()).save(any());
        verify(memberProjectRepository, never()).save(any());
    }

    @Test
    @DisplayName("an undergrad cannot join an existing project either")
    void undergradCannotLinkThemselves() {
        makeMeAnUndergrad();
        when(memberProjectRepository.findByMemberId(ME)).thenReturn(List.of());

        assertThatThrownBy(() -> controller.updateMyProjects(List.of(
                new MyPortalController.MyProjectLink(PROJECT_A, "RESEARCHER"))))
                .hasMessageContaining("cannot add or join projects");

        verify(memberProjectRepository, never()).save(any());
    }

    @Test
    @DisplayName("the undergrad's existing links survive — the endpoint refuses before deleting")
    void undergradLinksAreNotWipedByARefusedCall() {
        // updateMyProjects clears the caller's rows before rewriting them, so a
        // guard placed after the delete would strip an undergrad's memberships
        // on every refused call — silently undoing manager-assigned links.
        makeMeAnUndergrad();
        when(memberProjectRepository.findByMemberId(ME))
                .thenReturn(List.of(new MemberProject(PROJECT_A, ME, "RESEARCHER")));

        assertThatThrownBy(() -> controller.updateMyProjects(List.of()))
                .hasMessageContaining("cannot add or join projects");

        verify(memberProjectRepository, never()).deleteByMemberId(any());
    }

    @Test
    @DisplayName("tiers above undergrad are unaffected")
    void graduateTiersMayStillAuthor() {
        Member me = memberRepository.findById(ME).orElseThrow();
        me.setCurrentRole(MemberRole.MASTER);
        when(memberProjectRepository.findByMemberId(ME)).thenReturn(List.of());

        controller.updateMyProjects(List.of(
                new MyPortalController.MyProjectLink(PROJECT_A, "RESEARCHER")));

        assertThat(savedLinks()).singleElement()
                .satisfies(link -> assertThat(link.getMemberId()).isEqualTo(ME));
    }
}
