package br.uema.laps.security;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberStatus;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtAuthFilterTest {

    private static final String SECRET = "test-only-signing-secret-that-is-at-least-32-bytes-long";

    private UUID memberId;
    private Member member;
    private LapsJwtService jwtService;
    private JwtAuthFilter filter;

    @BeforeEach
    void setUp() {
        memberId = UUID.randomUUID();
        member = new Member();
        member.setId(memberId);
        member.setSlug("test-member");
        member.setFullName("Test Member");
        member.setEmail("member@uema.br");
        member.setStatus(MemberStatus.ACTIVE);
        member.setAuthVersion(4L);

        var repository = mock(br.uema.laps.member.MemberRepository.class);
        when(repository.findById(memberId)).thenReturn(Optional.of(member));

        jwtService = new LapsJwtService("laps-test", SECRET, Duration.ofHours(1));
        filter = new JwtAuthFilter(
                jwtService,
                repository,
                new MemberAccessPolicy(),
                new ManagerAllowlist(List.of()),
                new AuthCookies(Duration.ofHours(1), true));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("a token matching the member authentication version is accepted")
    void acceptsCurrentAuthenticationVersion() throws Exception {
        var exchange = exchange(jwtService.issue(memberId.toString(), 4L));

        filter.doFilter(exchange.request(), exchange.response(), exchange.chain());

        assertThat(exchange.chainCalled()).isTrue();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .isEqualTo(memberId.toString());
    }

    @Test
    @DisplayName("a token issued before a password change is rejected and cleared")
    void rejectsStaleAuthenticationVersion() throws Exception {
        var exchange = exchange(jwtService.issue(memberId.toString(), 3L));

        filter.doFilter(exchange.request(), exchange.response(), exchange.chain());

        assertRevoked(exchange);
    }

    @Test
    @DisplayName("a legacy token without an authentication version is rejected and cleared")
    void rejectsTokenWithoutAuthenticationVersion() throws Exception {
        Instant now = Instant.now();
        String legacy = Jwts.builder()
                .issuer("laps-test")
                .subject(memberId.toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(Duration.ofHours(1))))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();
        var exchange = exchange(legacy);

        filter.doFilter(exchange.request(), exchange.response(), exchange.chain());

        assertRevoked(exchange);
    }

    private Exchange exchange(String token) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/me");
        request.setSecure(true);
        request.setCookies(new Cookie(AuthCookies.COOKIE_NAME, token));
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean called = new AtomicBoolean(false);
        return new Exchange(request, response, called);
    }

    private void assertRevoked(Exchange exchange) throws Exception {
        assertThat(exchange.chainCalled()).isFalse();
        assertThat(exchange.response().getStatus()).isEqualTo(401);
        assertThat(exchange.response().getContentAsString()).contains("session_revoked");
        assertThat(exchange.response().getHeader(HttpHeaders.SET_COOKIE))
                .contains("laps_jwt=")
                .contains("Max-Age=0");
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    private record Exchange(
            MockHttpServletRequest request,
            MockHttpServletResponse response,
            AtomicBoolean called) {

        jakarta.servlet.FilterChain chain() {
            return (req, res) -> called.set(true);
        }

        boolean chainCalled() {
            return called.get();
        }
    }
}
