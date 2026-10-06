package br.uema.laps.impact;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRole;
import br.uema.laps.portal.PortalWriteGuard;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;

class ImpactServiceTest {
    ImpactRepository repository = mock(ImpactRepository.class);
    PortalWriteGuard guard = mock(PortalWriteGuard.class);
    ImpactService service = new ImpactService(repository, guard);
    Member me = new Member();
    @BeforeEach void setup() {
        me.setId(UUID.randomUUID()); me.setFullName("Member"); me.setSlug("member");
        me.setCurrentRole(MemberRole.UNDERGRAD);
        when(guard.requireRotatedPassword()).thenReturn(me);
        when(repository.save(any(Impact.class))).thenAnswer(inv -> { Impact impact = inv.getArgument(0); if (impact.getId() == null) impact.setId(UUID.randomUUID()); return impact; });
    }
    ImpactInput input() {
        var text = new ImpactInput.Text("Contribuição", "Contribution", "Contribution");
        return new ImpactInput(ImpactKind.SCHOLARSHIP, LocalDate.of(2025, 1, 2), text, text, text, text,
                "UEMA", List.of("R"), List.of("Collaborator"), List.of(),
                List.of(new ImpactInput.Evidence("Paper", "https://doi.org/10.1234/example")));
    }
    @Test void undergraduateCanCreateWithSessionOwnershipAndAllDetails() {
        var result = service.save(null, input());
        assertThat(result.memberId()).isEqualTo(me.getId());
        assertThat(result.details()).isEqualTo(input());
        verify(guard).requireRotatedPassword();
    }
    @Test void cannotUpdateOrDeleteAnotherMembersImpact() {
        UUID id = UUID.randomUUID();
        when(repository.findByIdAndMemberIdAndDeletedAtIsNull(id, me.getId())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.save(id, input())).isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException)e).getStatusCode().value()).isEqualTo(404));
        assertThatThrownBy(() -> service.delete(id)).isInstanceOf(ResponseStatusException.class);
        verify(repository, never()).save(any());
    }
    @Test void updatesOwnRecordAndSoftDeletesIt() {
        Impact record = new Impact(); record.setId(UUID.randomUUID()); record.setMember(me); record.setDetails(input());
        when(repository.findByIdAndMemberIdAndDeletedAtIsNull(record.getId(), me.getId())).thenReturn(Optional.of(record));
        assertThat(service.save(record.getId(), input()).id()).isEqualTo(record.getId());
        service.delete(record.getId());
        assertThat(record.getDeletedAt()).isNotNull();
    }
    @Test void passwordGuardPreventsWrites() {
        when(guard.requireRotatedPassword()).thenThrow(new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN));
        assertThatThrownBy(() -> service.save(null, input())).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> service.delete(UUID.randomUUID())).isInstanceOf(ResponseStatusException.class);
        verifyNoInteractions(repository);
    }
    @Test void publicDetailHidesRemovedOwners() {
        Impact record = new Impact(); record.setId(UUID.randomUUID()); record.setMember(me);
        me.setDeletedAt(Instant.now());
        when(repository.findByIdAndDeletedAtIsNull(record.getId())).thenReturn(Optional.of(record));
        assertThatThrownBy(() -> service.get(record.getId())).isInstanceOf(ResponseStatusException.class);
    }
    @Test void rejectsUnsafeLinksAndBadFilters() {
        for (String url : List.of("javascript:alert(1)", "data:text/html,test", "/relative", "https://user:password@example.com", "https://")) {
            assertThatThrownBy(() -> ImpactService.validateUrl(url)).isInstanceOf(ResponseStatusException.class);
        }
        assertThatCode(() -> ImpactService.validateUrl("https://example.org/paper?a=b#section")).doesNotThrowAnyException();
        assertThatThrownBy(() -> service.list(null, null, null, null, null, 0, 101)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> service.list(null, null, LocalDate.now(), LocalDate.now().minusDays(1), null, 0, 10)).isInstanceOf(ResponseStatusException.class);
        verifyNoInteractions(repository);
    }
}
