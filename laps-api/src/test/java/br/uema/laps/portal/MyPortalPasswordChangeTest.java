package br.uema.laps.portal;

import br.uema.laps.email.EmailSendBudget;
import br.uema.laps.email.EmailService;
import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.member.MemberStatus;
import br.uema.laps.project.MemberProjectRepository;
import br.uema.laps.project.ProjectRepository;
import br.uema.laps.publication.PublicationRepository;
import br.uema.laps.security.ManagerAllowlist;
import br.uema.laps.security.AuthCookies;
import br.uema.laps.security.LapsJwtService;
import br.uema.laps.security.RateLimitGuard;
import br.uema.laps.translate.TranslationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MyPortalPasswordChangeTest {

    private UUID memberId;
    private Member member;
    private MemberRepository repository;
    private PasswordEncoder passwordEncoder;
    private LapsJwtService jwtService;
    private MyPortalController controller;

    @BeforeEach
    void setUp() {
        memberId = UUID.randomUUID();
        member = new Member();
        member.setId(memberId);
        member.setSlug("ada");
        member.setFullName("Ada Lovelace");
        member.setEmail("ada@uema.br");
        member.setStatus(MemberStatus.ACTIVE);
        member.setEmailVerified(true);
        member.setMustChangePassword(false);
        member.setPasswordHash("old-hash");
        member.setAuthVersion(4L);

        repository = mock(MemberRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        when(repository.findById(memberId)).thenReturn(Optional.of(member));
        when(repository.findByIdForUpdate(memberId)).thenReturn(Optional.of(member));
        when(repository.save(any(Member.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(passwordEncoder.matches("current-password", "old-hash")).thenReturn(true);
        when(passwordEncoder.matches("new-password", "old-hash")).thenReturn(false);
        when(passwordEncoder.encode("new-password")).thenReturn("new-hash");

        jwtService = new LapsJwtService(
                "laps-test",
                "test-only-signing-secret-that-is-at-least-32-bytes-long",
                Duration.ofHours(1));
        controller = new MyPortalController(
                repository,
                mock(MemberProjectRepository.class),
                mock(ProjectRepository.class),
                mock(PublicationRepository.class),
                passwordEncoder,
                mock(TranslationService.class),
                mock(RateLimitGuard.class),
                mock(EmailService.class),
                mock(EmailSendBudget.class),
                new ManagerAllowlist(List.of()),
                jwtService,
                new AuthCookies(Duration.ofHours(1), true));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        memberId.toString(), null, List.of(new SimpleGrantedAuthority("MEMBER"))));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("changing a password revokes older tokens and replaces the current cookie")
    void rotatesCurrentSessionAfterPasswordChange() {
        MockHttpServletRequest request = new MockHttpServletRequest("PUT", "/api/v1/me/password");
        request.setSecure(true);

        var response = controller.changePassword(
                new MyPortalController.ChangePasswordRequest("current-password", "new-password"),
                request);

        assertThat(member.getPasswordHash()).isEqualTo("new-hash");
        assertThat(member.getAuthVersion()).isEqualTo(5L);
        assertThat(response.getBody()).containsOnlyKeys("message");
        String setCookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertThat(setCookie)
                .startsWith("laps_jwt=")
                .contains("HttpOnly")
                .contains("Secure")
                .contains("SameSite=Lax")
                .contains("Max-Age=3600");
        String token = setCookie.substring("laps_jwt=".length(), setCookie.indexOf(';'));
        assertThat(((Number) jwtService.parseClaims(token).get("ver")).longValue()).isEqualTo(5L);
        verify(repository).findByIdForUpdate(memberId);
    }
}
