package br.uema.laps.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Resolves the caller's address for rate-limiting purposes.
 *
 * <h2>Why this is configurable</h2>
 * {@code X-Forwarded-For} is a client-supplied header that each proxy appends
 * to. Only the entries our own infrastructure wrote can be trusted; everything
 * to the left of those is attacker-controlled. Which entry that is depends on
 * how many proxies sit in front of the app, and LAPS runs in two shapes:
 *
 * <ul>
 *   <li><b>docker-compose</b> — nginx builds the header with
 *       {@code $proxy_add_x_forwarded_for}, appending the real peer address.
 *       One trusted hop; the last entry is the client.</li>
 *   <li><b>Render</b> — no nginx exists in that image at all (Spring Boot serves
 *       the SPA itself), so the hop count is whatever Render's edge produces.</li>
 * </ul>
 *
 * Hardcoding either shape silently breaks the other. Reading the <i>first</i>
 * entry — as this did originally — lets any caller mint a fresh bucket per
 * request by varying the header, which defeats the limiter entirely. Reading
 * the last entry when the real count is higher collapses every visitor into one
 * bucket, which is worse than no limiter: one attacker can lock out all logins.
 *
 * <p>{@code laps.ratelimit.trusted-proxy-hops} is the number of trailing entries
 * written by infrastructure you control. The default of 1 is correct for the
 * nginx topology. See the verification note in {@code .env.example} for how to
 * confirm the right value for a given deployment.
 *
 * <p>Note that the per-account bucket in {@link RateLimitGuard} does not depend
 * on this value at all — that is the control that still works if this is
 * misconfigured.
 */
@Component
public class ClientIpResolver {

    private final int trustedProxyHops;

    public ClientIpResolver(@Value("${laps.ratelimit.trusted-proxy-hops:1}") int trustedProxyHops) {
        this.trustedProxyHops = Math.max(1, trustedProxyHops);
    }

    public String resolve(HttpServletRequest request) {
        String header = request.getHeader("X-Forwarded-For");
        if (header == null || header.isBlank()) {
            return request.getRemoteAddr();
        }

        String[] hops = header.split(",");
        // Count back from the end: the trailing `trustedProxyHops` entries were
        // written by our own proxies, so the one immediately before them is the
        // furthest-left address we are willing to believe.
        int index = hops.length - trustedProxyHops;
        if (index < 0) {
            // Fewer entries than configured hops — the header is shorter than the
            // topology says it should be, so nothing in it is trustworthy. Fall
            // back to the direct peer, which cannot be spoofed.
            return request.getRemoteAddr();
        }

        String candidate = hops[index].trim();
        return candidate.isEmpty() ? request.getRemoteAddr() : candidate;
    }
}
