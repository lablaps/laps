package br.uema.laps.admin;

import br.uema.laps.audit.AuditLogRepository;
import br.uema.laps.audit.AuditService;
import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.member.MemberRole;
import br.uema.laps.project.MemberProjectRepository;
import br.uema.laps.project.ProjectRepository;
import br.uema.laps.publication.PublicationRepository;
import br.uema.laps.roletracking.RoleTransitionService;
import br.uema.laps.security.ManagerAllowlist;
import br.uema.laps.security.MemberPasswordService;
import br.uema.laps.security.MemberPermission;
import br.uema.laps.translate.TranslationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminManagementAccessTest {

    private static final UUID MEMBER_ID = UUID.randomUUID();
    private MemberRepository memberRepository;
    private AuditService auditService;

    @BeforeEach
    void authenticateManager() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        UUID.randomUUID().toString(),
                        null,
                        List.of(new SimpleGrantedAuthority("MANAGER"))));
    }

    @Test
    @DisplayName("management access is granted as an internal permission, not a public role")
    void grantsInternalPermission() {
        AdminController controller = controller(new ManagerAllowlist(List.of()));
        Member member = member("member@uema.br");

        AdminController.AdminMemberView result = controller.setManagementAccess(
                MEMBER_ID, new AdminController.ManagementAccessUpdate(true));

        assertThat(member.getCurrentRole()).isEqualTo(MemberRole.UNDERGRAD);
        assertThat(member.getPermissions()).contains(MemberPermission.MANAGE_PLATFORM);
        assertThat(result.canManage()).isTrue();
        assertThat(result.managementPermissionGranted()).isTrue();
        assertThat(result.managementAccessFromAllowlist()).isFalse();
        verify(auditService).record(any(), org.mockito.ArgumentMatchers.eq("GRANT_MANAGEMENT_ACCESS"),
                org.mockito.ArgumentMatchers.eq("Member"), org.mockito.ArgumentMatchers.eq(MEMBER_ID.toString()), any());
    }

    @Test
    @DisplayName("revoking the database grant does not pretend an allowlisted manager lost access")
    void reportsEffectiveAllowlistAccessAfterRevocation() {
        AdminController controller = controller(new ManagerAllowlist(List.of("breakglass@uema.br")));
        Member member = member("breakglass@uema.br");
        member.getPermissions().add(MemberPermission.MANAGE_PLATFORM);

        AdminController.AdminMemberView result = controller.setManagementAccess(
                MEMBER_ID, new AdminController.ManagementAccessUpdate(false));

        assertThat(member.getPermissions()).doesNotContain(MemberPermission.MANAGE_PLATFORM);
        assertThat(result.canManage()).isTrue();
        assertThat(result.managementPermissionGranted()).isFalse();
        assertThat(result.managementAccessFromAllowlist()).isTrue();
    }

    private Member member(String email) {
        Member member = new Member();
        member.setId(MEMBER_ID);
        member.setSlug("member");
        member.setFullName("Member");
        member.setEmail(email);
        member.setCurrentRole(MemberRole.UNDERGRAD);
        when(memberRepository.findById(MEMBER_ID)).thenReturn(Optional.of(member));
        when(memberRepository.save(any(Member.class))).thenAnswer(invocation -> invocation.getArgument(0));
        return member;
    }

    private AdminController controller(ManagerAllowlist allowlist) {
        memberRepository = mock(MemberRepository.class);
        auditService = mock(AuditService.class);
        return new AdminController(
                memberRepository,
                mock(PublicationRepository.class),
                mock(ProjectRepository.class),
                mock(MemberProjectRepository.class),
                mock(RoleTransitionService.class),
                auditService,
                mock(AuditLogRepository.class),
                mock(TranslationService.class),
                mock(MemberPasswordService.class),
                allowlist);
    }
}
