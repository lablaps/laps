package br.uema.laps.security;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MemberPasswordServiceTest {

    @Test
    @DisplayName("an admin reset increments the target member authentication version")
    void resetInvalidatesPreviouslyIssuedTokens() {
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        MemberRepository repository = mock(MemberRepository.class);
        MemberPasswordService service = new MemberPasswordService(encoder, repository);
        Member member = new Member();
        member.setId(UUID.randomUUID());
        member.setPasswordHash("old-hash");
        member.setMustChangePassword(false);
        member.setAuthVersion(4L);
        when(encoder.encode(anyString())).thenReturn("new-hash");
        when(repository.findByIdForUpdate(member.getId())).thenReturn(Optional.of(member));

        service.forceReset(member);

        assertThat(member.getPasswordHash()).isEqualTo("new-hash");
        assertThat(member.isMustChangePassword()).isTrue();
        assertThat(member.getAuthVersion()).isEqualTo(5L);
        verify(repository).findByIdForUpdate(member.getId());
        verify(repository).save(member);
    }

    @Test
    @DisplayName("initial password provisioning keeps the new account at version zero")
    void initialProvisioningDoesNotPretendToRevokeASession() {
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        MemberRepository repository = mock(MemberRepository.class);
        MemberPasswordService service = new MemberPasswordService(encoder, repository);
        Member member = new Member();
        member.setId(UUID.randomUUID());
        when(encoder.encode(anyString())).thenReturn("initial-hash");

        service.provisionInitial(member);

        assertThat(member.getPasswordHash()).isEqualTo("initial-hash");
        assertThat(member.getAuthVersion()).isZero();
    }
}
