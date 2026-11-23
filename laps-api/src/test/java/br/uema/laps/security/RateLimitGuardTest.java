package br.uema.laps.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;


import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RateLimitGuardTest {

    private static RateLimitGuard guard(int perMinute) {
        return new RateLimitGuard(new AuthRateLimiter(perMinute, 60), new ClientIpResolver(1));
    }

    private static MockHttpServletRequest from(String ip) {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setRemoteAddr(ip);
        return req;
    }

    @Test
    @DisplayName("blocks the caller's address once the allowance is spent")
    void limitsPerAddress() {
        RateLimitGuard guard = guard(3);
        for (int i = 0; i < 3; i++) {
            assertThatCode(() -> guard.enforce(from("203.0.113.7"))).doesNotThrowAnyException();
        }
        assertThatThrownBy(() -> guard.enforce(from("203.0.113.7")))
                .isInstanceOf(RateLimitExceededException.class)
                .hasMessageContaining("Too many attempts");
    }

    @Test
    @DisplayName("a different address is unaffected")
    void addressesAreIndependent() {
        RateLimitGuard guard = guard(2);
        guard.enforce(from("203.0.113.7"));
        guard.enforce(from("203.0.113.7"));
        assertThatThrownBy(() -> guard.enforce(from("203.0.113.7")))
                .isInstanceOf(RateLimitExceededException.class);

        assertThatCode(() -> guard.enforce(from("198.51.100.9"))).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("the per-account bucket bounds a spray arriving from many addresses")
    void limitsPerAccountAcrossAddresses() {
        RateLimitGuard guard = guard(3);
        // Each request comes from a fresh address, so the IP bucket never trips.
        // Without the account bucket this loop would run forever.
        guard.enforce(from("198.51.100.1"), "joao-silva");
        guard.enforce(from("198.51.100.2"), "joao-silva");
        guard.enforce(from("198.51.100.3"), "joao-silva");

        assertThatThrownBy(() -> guard.enforce(from("198.51.100.4"), "joao-silva"))
                .isInstanceOf(RateLimitExceededException.class)
                .hasMessageContaining("Too many attempts");
    }

    @Test
    @DisplayName("the account bucket ignores casing so variants cannot multiply the allowance")
    void accountBucketIsCaseInsensitive() {
        RateLimitGuard guard = guard(2);
        guard.enforce(from("198.51.100.1"), "Joao-Silva");
        guard.enforce(from("198.51.100.2"), "joao-silva");

        assertThatThrownBy(() -> guard.enforce(from("198.51.100.3"), "JOAO-SILVA"))
                .isInstanceOf(RateLimitExceededException.class);
    }

    @Test
    @DisplayName("a namespaced bucket does not eat the login allowance")
    void namespacedBucketIsSeparate() {
        // The regression this guards: the SPA fetches a proof-of-work challenge
        // before every login. On a shared bucket each attempt would spend two
        // tokens and the member would be locked out at half the configured rate.
        RateLimitGuard guard = guard(3);

        for (int i = 0; i < 3; i++) {
            guard.enforceNamespaced(from("203.0.113.7"), "pow");
        }
        assertThatThrownBy(() -> guard.enforceNamespaced(from("203.0.113.7"), "pow"))
                .isInstanceOf(RateLimitExceededException.class);

        // Same address, login bucket untouched.
        assertThatCode(() -> guard.enforce(from("203.0.113.7"))).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("the throttle carries a retry hint so clients can back off")
    void carriesRetryAfter() {
        RateLimitGuard guard = guard(1);
        guard.enforce(from("203.0.113.7"));

        RateLimitExceededException ex = org.junit.jupiter.api.Assertions.assertThrows(
                RateLimitExceededException.class, () -> guard.enforce(from("203.0.113.7")));
        // Regression: the retry hint used to be mutated onto
        // ResponseStatusException.getHeaders(), which is immutable in Spring 6 —
        // the add threw and every throttled caller got a 500 instead of a 429.
        assertThat(ex.getRetryAfterSeconds()).isPositive();
    }
}
