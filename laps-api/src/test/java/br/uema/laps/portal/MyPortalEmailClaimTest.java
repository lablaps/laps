package br.uema.laps.portal;

import br.uema.laps.email.EmailSendBudget;
import br.uema.laps.email.EmailService;
import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.member.MemberRole;
import br.uema.laps.member.MemberStatus;
import br.uema.laps.project.MemberProjectRepository;
import br.uema.laps.project.ProjectRepository;
import br.uema.laps.publication.PublicationRepository;
import br.uema.laps.security.ManagerAllowlist;
import br.uema.laps.security.RateLimitGuard;
import br.uema.laps.translate.TranslationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Who is allowed to claim which login email.
 *
 * <p>The escalation this covers: {@code ManagerAllowlist} resolves the MANAGER
 * authority by lower-casing {@code member.email} and looking it up in
 * {@code LAPS_MANAGER_EMAILS}, and {@code JwtAuthFilter} recomputes that on
 * every request. The profile email is self-service. So before this guard, an
 * undergraduate who typed a coordinator's address into their own profile held
 * the Central de Comando one request later — no invite, no password, no
 * database access, just an address the public roster may print.
 *
 * <p>The case-variant is the sharp edge: {@code member.email} carries a plain
 * SQL UNIQUE, which Postgres evaluates case-sensitively, while every lookup in
 * the codebase is {@code IgnoreCase}. "Already taken" was therefore not the
 * defence it looked like.
 */
class MyPortalEmailClaimTest {

    private static final UUID ME = UUID.randomUUID();
    private static final String MANAGER_EMAIL = "coord@uema.br";

    private MemberRepository memberRepository;
    private MyPortalController controller;
    private Member me;

    @BeforeEach
    void setUp() {
        memberRepository = mock(MemberRepository.class);

        controller = new MyPortalController(
                memberRepository,
                mock(MemberProjectRepository.class),
                mock(ProjectRepository.class),
                mock(PublicationRepository.class),
                mock(PasswordEncoder.class),
                mock(TranslationService.class),
                mock(RateLimitGuard.class),
                mock(EmailService.class),
                mock(EmailSendBudget.class),
                new ManagerAllowlist(List.of(MANAGER_EMAIL)));

        me = new Member();
        me.setId(ME);
        me.setSlug("me");
        me.setFullName("Ada Lovelace");
        me.setEmail("ada@uema.br");
        me.setStatus(MemberStatus.ACTIVE);
        me.setCurrentRole(MemberRole.UNDERGRAD);
        me.setMustChangePassword(false);
        me.setEmailVerified(true);
        when(memberRepository.findById(ME)).thenReturn(Optional.of(me));
        when(memberRepository.save(any(Member.class))).thenAnswer(inv -> inv.getArgument(0));
        when(memberRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        ME.toString(), null, List.of(new SimpleGrantedAuthority("MEMBER"))));
    }

    private MyPortalController.MyProfileUpdate emailUpdate(String email) {
        return new MyPortalController.MyProfileUpdate(
                null, null, null, null, null, null, null, null, email,
                null, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null);
    }

    @Test
    @DisplayName("a member cannot claim an allowlisted manager address")
    void cannotClaimManagerEmail() {
        assertThatThrownBy(() -> controller.updateMe(emailUpdate(MANAGER_EMAIL)))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));

        assertThat(me.getEmail()).isEqualTo("ada@uema.br");
    }

    @Test
    @DisplayName("nor a case-variant of one — the UNIQUE constraint would have allowed it")
    void cannotClaimManagerEmailInAnotherCase() {
        assertThatThrownBy(() -> controller.updateMe(emailUpdate("Coord@UEMA.br")))
                .isInstanceOf(ResponseStatusException.class);

        assertThat(me.getEmail()).isEqualTo("ada@uema.br");
    }

    @Test
    @DisplayName("nor another member's address, compared case-insensitively")
    void cannotClaimAnotherMembersEmail() {
        when(memberRepository.existsByEmailIgnoreCase("bob@uema.br")).thenReturn(true);

        assertThatThrownBy(() -> controller.updateMe(emailUpdate("BOB@uema.br")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    @DisplayName("the rejection reads the same either way, so it cannot probe the allowlist")
    void rejectionsAreIndistinguishable() {
        when(memberRepository.existsByEmailIgnoreCase("taken@uema.br")).thenReturn(true);

        String allowlisted = messageOf(() -> controller.updateMe(emailUpdate(MANAGER_EMAIL)));
        String taken = messageOf(() -> controller.updateMe(emailUpdate("taken@uema.br")));

        assertThat(allowlisted).isEqualTo(taken);
    }

    @Test
    @DisplayName("a normal address is accepted, lower-cased, and drops verification")
    void ordinaryChangeIsNormalised() {
        controller.updateMe(emailUpdate("  Ada.Byron@UEMA.br "));

        assertThat(me.getEmail()).isEqualTo("ada.byron@uema.br");
        assertThat(me.isEmailVerified()).isFalse();
    }

    @Test
    @DisplayName("re-sending the same address in another case is a no-op, not a self-collision")
    void samAddressDifferentCaseIsNotAChange() {
        when(memberRepository.existsByEmailIgnoreCase("ada@uema.br")).thenReturn(true);

        controller.updateMe(emailUpdate("ADA@uema.br"));

        // Still verified: nothing actually changed, so tearing down the
        // member's verified state would be a bug, not caution.
        assertThat(me.getEmail()).isEqualTo("ada@uema.br");
        assertThat(me.isEmailVerified()).isTrue();
    }

    @Test
    @DisplayName("blank clears the address instead of storing an empty string")
    void blankClears() {
        controller.updateMe(emailUpdate("   "));

        // "" is not "no email" — it is a value, and the second member to send
        // it collides with the first on the UNIQUE constraint.
        assertThat(me.getEmail()).isNull();
    }

    private static String messageOf(Runnable r) {
        try {
            r.run();
            throw new AssertionError("expected a rejection");
        } catch (ResponseStatusException e) {
            return e.getReason();
        }
    }
}
