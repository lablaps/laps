package br.uema.laps.portal;

import br.uema.laps.email.EmailService;
import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.member.MemberRole;
import br.uema.laps.member.MemberStatus;
import br.uema.laps.project.MemberProjectRepository;
import br.uema.laps.project.ProjectRepository;
import br.uema.laps.publication.PublicationRepository;
import br.uema.laps.security.RateLimitGuard;
import br.uema.laps.translate.TranslationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Email verification by 6-digit code.
 *
 * <p>The flow this replaces returned its own token in the HTTP response, so a
 * member could complete "verification" without ever opening the inbox — the one
 * thing the ceremony exists to prove. What has to hold now: the code reaches the
 * caller only through the mail provider, and a six-digit secret is not
 * guessable in the window it is alive.
 */
class MyPortalEmailVerificationTest {

    private static final UUID ME = UUID.randomUUID();

    private MemberRepository memberRepository;
    private EmailService emailService;
    private MyPortalController controller;
    private Member me;

    @BeforeEach
    void setUp() {
        memberRepository = mock(MemberRepository.class);
        emailService = mock(EmailService.class);

        controller = new MyPortalController(
                memberRepository,
                mock(MemberProjectRepository.class),
                mock(ProjectRepository.class),
                mock(PublicationRepository.class),
                // Real BCrypt: the stored-code assertions below are about the
                // hash actually being a hash, which a stubbed encoder cannot show.
                new BCryptPasswordEncoder(4),
                mock(TranslationService.class),
                mock(RateLimitGuard.class),
                emailService);

        me = new Member();
        me.setId(ME);
        me.setSlug("me");
        me.setFullName("Ada Lovelace");
        me.setEmail("ada@uema.br");
        me.setStatus(MemberStatus.ACTIVE);
        me.setCurrentRole(MemberRole.UNDERGRAD);
        me.setMustChangePassword(false);
        when(memberRepository.findById(ME)).thenReturn(Optional.of(me));
        when(memberRepository.save(any(Member.class))).thenAnswer(inv -> inv.getArgument(0));
        when(emailService.sendVerificationCode(anyString(), any(), anyString(), any()))
                .thenReturn(EmailService.Delivery.SENT);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        ME.toString(), null, List.of(new SimpleGrantedAuthority("MEMBER"))));
    }

    private MockHttpServletRequest http() {
        return new MockHttpServletRequest();
    }

    /** The code as it was handed to the mail provider — the only place it exists. */
    private String emailedCode() {
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendVerificationCode(eq("ada@uema.br"), any(), captor.capture(), any());
        return captor.getValue();
    }

    @Test
    @DisplayName("the code is emailed and never returned in the response")
    void codeGoesToTheInboxOnly() {
        var response = controller.requestEmailVerification(http());

        assertThat(response.getBody()).containsEntry("channel", "EMAIL");
        assertThat(response.getBody()).doesNotContainKey("code");
        assertThat(emailedCode()).matches("\\d{6}");
    }

    @Test
    @DisplayName("what is stored is a hash, not the code")
    void storesOnlyTheHash() {
        controller.requestEmailVerification(http());

        String code = emailedCode();
        assertThat(me.getEmailVerificationTokenHash()).isNotNull().isNotEqualTo(code);
        assertThat(new BCryptPasswordEncoder(4).matches(code, me.getEmailVerificationTokenHash())).isTrue();
        assertThat(me.getEmailVerificationTokenExpiresAt())
                .isBetween(Instant.now(), Instant.now().plus(Duration.ofMinutes(16)));
    }

    @Test
    @DisplayName("a provider failure is a 502, and leaves no pending code behind")
    void providerFailureDoesNotLeakTheCode() {
        when(emailService.sendVerificationCode(anyString(), any(), anyString(), any()))
                .thenReturn(EmailService.Delivery.FAILED);

        assertThatThrownBy(() -> controller.requestEmailVerification(http()))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_GATEWAY));
    }

    @Test
    @DisplayName("with no provider configured the code comes back in the response, flagged as such")
    void fallsBackToOnScreenCode() {
        when(emailService.sendVerificationCode(anyString(), any(), anyString(), any()))
                .thenReturn(EmailService.Delivery.NOT_CONFIGURED);

        var response = controller.requestEmailVerification(http());

        // The weak mode is still reachable — a deployment with no mail account
        // has to be able to finish the flow — but it announces itself so the
        // portal can tell the member this is not an inbox check.
        assertThat(response.getBody()).containsEntry("channel", "MANUAL");
        assertThat((String) response.getBody().get("code")).matches("\\d{6}");
    }

    @Test
    @DisplayName("the emailed code verifies the address and is then spent")
    void correctCodeVerifies() {
        controller.requestEmailVerification(http());

        var response = controller.verifyEmail(
                new MyPortalController.VerifyEmailRequest(emailedCode()), http());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(me.isEmailVerified()).isTrue();
        // Spent: a replay of the same code has nothing left to match against.
        assertThat(me.getEmailVerificationTokenHash()).isNull();
    }

    @Test
    @DisplayName("a wrong code is rejected and counted")
    void wrongCodeCounts() {
        controller.requestEmailVerification(http());
        String wrong = wrongCodeFor(emailedCode());

        assertThatThrownBy(() -> controller.verifyEmail(
                new MyPortalController.VerifyEmailRequest(wrong), http()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Incorrect code");

        assertThat(me.isEmailVerified()).isFalse();
        assertThat(me.getEmailVerificationAttempts()).isEqualTo((short) 1);
    }

    @Test
    @DisplayName("the fifth wrong code discards it — a million guesses are not available")
    void fiveWrongCodesBurnIt() {
        controller.requestEmailVerification(http());
        String code = emailedCode();
        String wrong = wrongCodeFor(code);

        for (int i = 0; i < 5; i++) {
            assertThatThrownBy(() -> controller.verifyEmail(
                    new MyPortalController.VerifyEmailRequest(wrong), http()))
                    .isInstanceOf(ResponseStatusException.class);
        }

        assertThat(me.getEmailVerificationTokenHash()).isNull();
        // And the real code is dead too — the member has to request a new one,
        // which is the whole point of capping attempts on the code rather than
        // on the request.
        assertThatThrownBy(() -> controller.verifyEmail(
                new MyPortalController.VerifyEmailRequest(code), http()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Request a verification code first");
        assertThat(me.isEmailVerified()).isFalse();
    }

    @Test
    @DisplayName("an expired code is refused and cleared")
    void expiredCodeIsRefused() {
        controller.requestEmailVerification(http());
        String code = emailedCode();
        me.setEmailVerificationTokenExpiresAt(Instant.now().minusSeconds(1));

        assertThatThrownBy(() -> controller.verifyEmail(
                new MyPortalController.VerifyEmailRequest(code), http()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("expired");

        assertThat(me.isEmailVerified()).isFalse();
        assertThat(me.getEmailVerificationTokenHash()).isNull();
    }

    @Test
    @DisplayName("a malformed entry is a typo, not a guess, and does not spend an attempt")
    void malformedEntryDoesNotCount() {
        controller.requestEmailVerification(http());

        assertThatThrownBy(() -> controller.verifyEmail(
                new MyPortalController.VerifyEmailRequest("12ab"), http()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("6-digit");

        assertThat(me.getEmailVerificationAttempts()).isEqualTo((short) 0);
    }

    @Test
    @DisplayName("a member with no email on file gets told to set one, and nothing is mailed")
    void noEmailNoSend() {
        me.setEmail(null);

        assertThatThrownBy(() -> controller.requestEmailVerification(http()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Set an email");

        verify(emailService, never()).sendVerificationCode(any(), any(), any(), any());
    }

    /** Any six digits other than the real code. */
    private static String wrongCodeFor(String code) {
        return code.equals("000000") ? "111111" : "000000";
    }
}
