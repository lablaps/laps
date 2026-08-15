package br.uema.laps.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;
import org.springframework.mock.web.MockHttpServletRequest;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class AuthCookiesTest {

    private static final Duration TTL = Duration.ofHours(8);

    private static MockHttpServletRequest request(boolean secure) {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setSecure(secure);
        return req;
    }

    @Test
    @DisplayName("issued cookie is HttpOnly, SameSite=Lax, root-scoped, and expires with the token")
    void issuedCookieAttributes() {
        ResponseCookie cookie = new AuthCookies(TTL, null).issue("jwt-value", request(true));
        assertThat(cookie.getName()).isEqualTo("laps_jwt");
        assertThat(cookie.getValue()).isEqualTo("jwt-value");
        assertThat(cookie.isHttpOnly()).isTrue();
        assertThat(cookie.getSameSite()).isEqualTo("Lax");
        assertThat(cookie.getPath()).isEqualTo("/");
        assertThat(cookie.getMaxAge()).isEqualTo(TTL);
    }

    @Test
    @DisplayName("Secure follows the request when no override is configured")
    void secureDerivedFromRequest() {
        AuthCookies cookies = new AuthCookies(TTL, null);
        assertThat(cookies.issue("x", request(true)).isSecure()).isTrue();
        assertThat(cookies.issue("x", request(false)).isSecure()).isFalse();
    }

    @Test
    @DisplayName("the override wins, so a proxy that drops X-Forwarded-Proto cannot strip Secure")
    void overrideForcesSecure() {
        // This is the failure this property exists for: TLS terminated upstream,
        // proto header not forwarded, request looks plaintext to the app.
        assertThat(new AuthCookies(TTL, true).issue("x", request(false)).isSecure()).isTrue();
        assertThat(new AuthCookies(TTL, false).issue("x", request(true)).isSecure()).isFalse();
    }

    @Test
    @DisplayName("the clearing cookie matches the issued one on every attribute except lifetime")
    void clearMatchesIssuedAttributes() {
        // A Set-Cookie that differs in Path/Secure/SameSite is not guaranteed to
        // replace the cookie it is trying to expire. JwtAuthFilter's old inline
        // clear set HttpOnly only.
        AuthCookies cookies = new AuthCookies(TTL, true);
        ResponseCookie issued = cookies.issue("jwt-value", request(true));
        ResponseCookie cleared = cookies.clear(request(true));

        assertThat(cleared.getName()).isEqualTo(issued.getName());
        assertThat(cleared.getPath()).isEqualTo(issued.getPath());
        assertThat(cleared.isHttpOnly()).isEqualTo(issued.isHttpOnly());
        assertThat(cleared.isSecure()).isEqualTo(issued.isSecure());
        assertThat(cleared.getSameSite()).isEqualTo(issued.getSameSite());

        assertThat(cleared.getValue()).isEmpty();
        assertThat(cleared.getMaxAge()).isZero();
    }
}
