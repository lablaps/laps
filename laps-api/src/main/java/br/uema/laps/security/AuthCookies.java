package br.uema.laps.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Builds the session cookie. One definition, so every issue and clear site
 * agrees on the attributes.
 *
 * <p>There were four cookie-writing sites with three different shapes:
 * {@code AuthController.login}, {@code AuthController.logout},
 * {@code InviteController.register}, and the expiry path in
 * {@code JwtAuthFilter}, which set only {@code HttpOnly} — no {@code Secure},
 * no {@code SameSite}. A clearing cookie that does not match the attributes of
 * the cookie it is trying to replace is not guaranteed to replace it.
 *
 * <h2>The Secure flag</h2>
 * {@code request.isSecure()} is the default source, which is correct as long as
 * the TLS-terminating proxy forwards {@code X-Forwarded-Proto} and the app runs
 * with {@code forward-headers-strategy: framework} (it does, in the prod
 * profile). It fails open — cookie sent without {@code Secure} — on any
 * deployment that terminates TLS without forwarding that header, and
 * {@code docker-compose.yml} explicitly leaves TLS to the host, so that
 * combination is reachable.
 *
 * <p>{@code laps.auth.cookie-secure} overrides the detection. It is deliberately
 * left unset by default rather than forced to {@code true}: forcing it on a
 * deployment genuinely served over plain HTTP makes the browser discard the
 * cookie and nobody can log in at all. Set it to {@code true} on any deployment
 * you serve over HTTPS.
 */
@Component
public class AuthCookies {

    public static final String COOKIE_NAME = "laps_jwt";

    private final Duration ttl;
    private final Boolean forceSecure;

    public AuthCookies(
            @Value("${laps.jwt.ttl}") Duration ttl,
            @Value("${laps.auth.cookie-secure:#{null}}") Boolean forceSecure) {
        this.ttl = ttl;
        this.forceSecure = forceSecure;
    }

    /** The cookie carrying a freshly issued token. */
    public ResponseCookie issue(String jwt, HttpServletRequest request) {
        return base(jwt, request).maxAge(ttl).build();
    }

    /** An immediately-expiring cookie with otherwise identical attributes. */
    public ResponseCookie clear(HttpServletRequest request) {
        return base("", request).maxAge(0).build();
    }

    private ResponseCookie.ResponseCookieBuilder base(String value, HttpServletRequest request) {
        return ResponseCookie.from(COOKIE_NAME, value)
                .httpOnly(true)
                .secure(isSecure(request))
                .path("/")
                // Lax is load-bearing here: the API disables CSRF tokens, so this
                // attribute is what stops a cross-site form POST from riding the
                // session. It still permits the top-level GET navigations the SPA
                // needs after an external link.
                .sameSite("Lax");
    }

    private boolean isSecure(HttpServletRequest request) {
        return forceSecure != null ? forceSecure : request.isSecure();
    }
}
