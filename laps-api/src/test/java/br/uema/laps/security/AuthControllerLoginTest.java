package br.uema.laps.security;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.member.MemberStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Regression cover for the removal path.
 *
 * {@code AdminController.softDelete} stamps {@code deletedAt} and flips status to
 * INACTIVE but leaves {@code password_hash} intact, and login resolved members by
 * slug or email with no filter on either field. Removing someone from the lab
 * therefore did not revoke their ability to log back in.
 */
class AuthControllerLoginTest {

    private MemberRepository memberRepository;
    private LapsJwtService jwtService;
    private PasswordEncoder passwordEncoder;
    private RateLimitGuard rateLimitGuard;
    private ProofOfWorkService proofOfWork;
    private AuthController controller;

    @BeforeEach
    void setUp() {
        memberRepository = mock(MemberRepository.class);
        jwtService = mock(LapsJwtService.class);
        passwordEncoder = mock(PasswordEncoder.class);
        rateLimitGuard = mock(RateLimitGuard.class);
        // Real service at the lowest difficulty: the point is to exercise the
        // real single-use semantics, not to burn CPU in a unit test.
        proofOfWork = new ProofOfWorkService(8, Duration.ofMinutes(5));

        when(jwtService.issue(anyString(), any(), anyString())).thenReturn("signed-jwt");

        controller = new AuthController(
                memberRepository,
                jwtService,
                passwordEncoder,
                new ManagerAllowlist(List.of("coord@uema.br")),
                new MemberAccessPolicy(),
                rateLimitGuard,
                new AuthCookies(Duration.ofHours(8), true),
                proofOfWork);
    }

    /** A login request carrying a freshly solved challenge. */
    private AuthController.LoginRequest loginRequest(String identifier, String password) {
        String nonce = proofOfWork.issue();
        for (int counter = 0; counter < 5_000_000; counter++) {
            String candidate = Integer.toString(counter, 36);
            if (ProofOfWorkService.leadingZeroBits(nonce, candidate) >= proofOfWork.difficultyBits()) {
                return new AuthController.LoginRequest(identifier, null, password, nonce, candidate);
            }
        }
        throw new AssertionError("no proof-of-work solution found");
    }

    private Member member(MemberStatus status, Instant deletedAt) {
        Member m = new Member();
        m.setId(UUID.randomUUID());
        m.setSlug("joao-silva");
        m.setEmail("joao@uema.br");
        m.setStatus(status);
        m.setDeletedAt(deletedAt);
        m.setPasswordHash("$2a$12$storedhashvalue");
        return m;
    }

    private void givenMember(Member m) {
        when(memberRepository.findBySlug("joao-silva")).thenReturn(Optional.of(m));
        when(passwordEncoder.matches("correct-password", m.getPasswordHash())).thenReturn(true);
    }

    @Test
    @DisplayName("an active member with the right password logs in")
    void activeMemberCanLogIn() {
        givenMember(member(MemberStatus.ACTIVE, null));

        var response = controller.login(
                loginRequest("joao-silva", "correct-password"),
                new MockHttpServletRequest());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("token", "signed-jwt");
    }

    @Test
    @DisplayName("a soft-deleted member cannot log in even with the correct password")
    void softDeletedMemberCannotLogIn() {
        givenMember(member(MemberStatus.INACTIVE, Instant.now()));

        assertThatThrownBy(() -> controller.login(
                loginRequest("joao-silva", "correct-password"),
                new MockHttpServletRequest()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("401");

        // No token may be minted on this path.
        verify(jwtService, never()).issue(anyString(), any(), anyString());
    }

    @Test
    @DisplayName("an INACTIVE member cannot log in")
    void inactiveMemberCannotLogIn() {
        givenMember(member(MemberStatus.INACTIVE, null));

        assertThatThrownBy(() -> controller.login(
                loginRequest("joao-silva", "correct-password"),
                new MockHttpServletRequest()))
                .isInstanceOf(ResponseStatusException.class);
        verify(jwtService, never()).issue(anyString(), any(), anyString());
    }

    @Test
    @DisplayName("a removed account is indistinguishable from a nonexistent one")
    void removedAndUnknownLookTheSame() {
        // Same status code and same message, so the response cannot be used to
        // confirm that a given slug was once a real member.
        givenMember(member(MemberStatus.INACTIVE, Instant.now()));
        String removed = catchStatusAndReason(() -> controller.login(
                loginRequest("joao-silva", "correct-password"),
                new MockHttpServletRequest()));

        when(memberRepository.findBySlug("ghost")).thenReturn(Optional.empty());
        when(memberRepository.findByEmailIgnoreCase("ghost")).thenReturn(Optional.empty());
        String unknown = catchStatusAndReason(() -> controller.login(
                loginRequest("ghost", "correct-password"),
                new MockHttpServletRequest()));

        assertThat(removed).isEqualTo(unknown);
    }

    @Test
    @DisplayName("the unknown-account path still burns a BCrypt comparison, so timing does not leak existence")
    void unknownAccountBurnsADecoyComparison() {
        when(memberRepository.findBySlug("ghost")).thenReturn(Optional.empty());
        when(memberRepository.findByEmailIgnoreCase("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> controller.login(
                loginRequest("ghost", "some-password"),
                new MockHttpServletRequest()))
                .isInstanceOf(ResponseStatusException.class);

        verify(passwordEncoder).matches(anyString(), any());
    }

    @Test
    @DisplayName("the manager role is resolved from the current allowlist, not from the stored row")
    void managerRoleComesFromAllowlist() {
        Member m = member(MemberStatus.ACTIVE, null);
        m.setEmail("coord@uema.br");
        givenMember(m);

        var response = controller.login(
                loginRequest("joao-silva", "correct-password"),
                new MockHttpServletRequest());

        assertThat(response.getBody()).containsEntry("role", "MANAGER");
    }

    @Test
    @DisplayName("login without a solved challenge is refused before the account is even looked up")
    void loginRequiresProofOfWork() {
        givenMember(member(MemberStatus.ACTIVE, null));

        assertThatThrownBy(() -> controller.login(
                new AuthController.LoginRequest("joao-silva", null, "correct-password", null, null),
                new MockHttpServletRequest()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("400");

        verify(jwtService, never()).issue(anyString(), any(), anyString());
        verify(memberRepository, never()).findBySlug(anyString());
    }

    @Test
    @DisplayName("a challenge cannot be replayed for a second login attempt")
    void challengeCannotBeReplayed() {
        givenMember(member(MemberStatus.ACTIVE, null));
        AuthController.LoginRequest first = loginRequest("joao-silva", "correct-password");

        assertThat(controller.login(first, new MockHttpServletRequest()).getStatusCode())
                .isEqualTo(HttpStatus.OK);

        // Same nonce and solution, second time: an attacker who solved once must
        // not get unlimited free guesses from it.
        assertThatThrownBy(() -> controller.login(first, new MockHttpServletRequest()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("400");
    }

    private static String catchStatusAndReason(Runnable call) {
        try {
            call.run();
            return "no-exception";
        } catch (ResponseStatusException ex) {
            return ex.getStatusCode() + "|" + ex.getReason();
        }
    }
}
