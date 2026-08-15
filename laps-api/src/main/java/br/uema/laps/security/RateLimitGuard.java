package br.uema.laps.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

/**
 * Applies the two-key rate limit to a credential-handling request.
 *
 * <p>This logic lived as private methods on {@code AuthController}, which meant
 * only the two endpoints on that controller were covered. The invite
 * registration endpoint — unauthenticated, public, and account-creating — had no
 * limit at all, and neither did the password-change endpoint.
 *
 * <p>Two independent buckets, because either one alone has a blind spot:
 * per-IP cannot see a spray of one attempt against each of N accounts from a
 * single address, and per-account cannot see one address working through a
 * dictionary against many accounts. The per-account bucket has the useful
 * property of being independent of {@link ClientIpResolver}, so it keeps working
 * even if the proxy-hop configuration is wrong for the deployment.
 */
@Component
public class RateLimitGuard {

    private final AuthRateLimiter limiter;
    private final ClientIpResolver clientIpResolver;

    public RateLimitGuard(AuthRateLimiter limiter, ClientIpResolver clientIpResolver) {
        this.limiter = limiter;
        this.clientIpResolver = clientIpResolver;
    }

    /** Limits on the caller's address only. For endpoints with no account identifier. */
    public void enforce(HttpServletRequest request) {
        enforce(request, null);
    }

    /**
     * Limits on the caller's address and, when supplied, on the targeted account.
     *
     * @param identifier username/slug, email, or any stable per-account key. Lower-cased
     *                   so casing variants share a bucket, and prefixed so it can never
     *                   collide with an IP key.
     */
    public void enforce(HttpServletRequest request, String identifier) {
        checkBucket(clientIpResolver.resolve(request));
        if (identifier != null && !identifier.isBlank()) {
            checkBucket("id:" + identifier.trim().toLowerCase(Locale.ROOT));
        }
    }

    private void checkBucket(String key) {
        if (!limiter.allow(key)) {
            ResponseStatusException tooMany = new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS, "Too many attempts. Try again later.");
            tooMany.getHeaders().add("Retry-After", String.valueOf(limiter.retryAfterSeconds(key)));
            throw tooMany;
        }
    }
}
