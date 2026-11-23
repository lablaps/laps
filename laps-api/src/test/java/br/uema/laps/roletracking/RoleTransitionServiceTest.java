package br.uema.laps.roletracking;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.member.MemberRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RoleTransitionServiceTest {

    @Test
    @DisplayName("legacy management roles cannot be assigned through the transition service")
    void rejectsLegacyManagementRole() {
        UUID memberId = UUID.randomUUID();
        MemberRepository members = mock(MemberRepository.class);
        RoleHistoryRepository history = mock(RoleHistoryRepository.class);
        Member member = new Member();
        member.setId(memberId);
        member.setCurrentRole(MemberRole.UNDERGRAD);
        when(members.findById(memberId)).thenReturn(Optional.of(member));

        RoleTransitionService service = new RoleTransitionService(members, history);

        assertThatThrownBy(() -> service.transition(
                new RoleTransitionService.TransitionRequest(
                        memberId, MemberRole.MANAGER, LocalDate.now(), null, false),
                UUID.randomUUID()))
                .isInstanceOf(IllegalRoleTransitionException.class);

        verify(history, never()).save(org.mockito.ArgumentMatchers.any());
        verify(members, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
