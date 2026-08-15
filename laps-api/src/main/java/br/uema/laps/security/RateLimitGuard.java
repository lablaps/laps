package br.uema.laps.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

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

    /**
     * Limits on a namespaced view of the caller's address, giving the endpoint
     * its own budget.
     *
     * Needed because the proof-of-work challenge is fetched immediately before
     * every login: sharing one bucket would mean each login attempt spends two
     * tokens, silently halving the configured allowance, and the resulting 429
     * would surface on the challenge fetch — a request the member never made
     * and cannot interpret.
     */
    public void enforceNamespaced(HttpServletRequest request, String namespace) {
        checkBucket(namespace + ":" + clientIpResolver.resolve(request));
    }

    private void checkBucket(String key) {
        if (!limiter.allow(key)) {
            throw new RateLimitExceededException(limiter.retryAfterSeconds(key));
        }
    }
}
