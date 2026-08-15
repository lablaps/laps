package br.uema.laps.security;

/**
 * Raised when a credential endpoint's allowance is spent.
 *
 * <h2>Why this is not a ResponseStatusException</h2>
 * The original limiter built one and then called
 * {@code exception.getHeaders().add("Retry-After", ...)}. Under Spring
 * Framework 6 that accessor returns an immutable collection, so the add threw
 * {@link UnsupportedOperationException} from inside the throw site — every
 * tripped rate limit surfaced as a 500 with no {@code Retry-After} rather than
 * the intended 429. The limiter still refused the request, so nothing was
 * unprotected, but clients could not tell a throttle from a server fault and
 * had nothing to back off against.
 *
 * <p>Carrying the retry hint on a dedicated exception and rendering it in
 * {@code GlobalExceptionHandler} keeps the header attached without depending on
 * the mutability of a framework type.
 */
public class RateLimitExceededException extends RuntimeException {

    private final long retryAfterSeconds;

    public RateLimitExceededException(long retryAfterSeconds) {
        super("Too many attempts. Try again later.");
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
