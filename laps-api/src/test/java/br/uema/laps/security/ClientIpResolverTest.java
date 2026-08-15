package br.uema.laps.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * X-Forwarded-For is attacker-controlled up to the point where our own
 * infrastructure starts appending. These tests pin which entry we believe, in
 * both directions of failure:
 *
 * <ul>
 *   <li>believing an entry that is too far left lets one caller mint a fresh
 *       rate-limit bucket per request by varying the header;</li>
 *   <li>believing an entry too far right collapses every visitor into a single
 *       bucket, which lets one attacker lock the whole site out of login.</li>
 * </ul>
 */
class ClientIpResolverTest {

    private static MockHttpServletRequest request(String peer, String xff) {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setRemoteAddr(peer);
        if (xff != null) req.addHeader("X-Forwarded-For", xff);
        return req;
    }

    @Test
    @DisplayName("one trusted hop: the appended trailing entry is the client")
    void singleTrustedHop() {
        ClientIpResolver resolver = new ClientIpResolver(1);
        // Proxy appended the real peer to a header the client did not send.
        assertThat(resolver.resolve(request("10.0.0.1", "203.0.113.7")))
                .isEqualTo("203.0.113.7");
    }

    @Test
    @DisplayName("one trusted hop: a spoofed leading entry is ignored")
    void spoofedEntryIsIgnored() {
        ClientIpResolver resolver = new ClientIpResolver(1);
        assertThat(resolver.resolve(request("10.0.0.1", "1.2.3.4, 203.0.113.7")))
                .isEqualTo("203.0.113.7");
        assertThat(resolver.resolve(request("10.0.0.1", "evil, more-evil, 203.0.113.7")))
                .isEqualTo("203.0.113.7");
    }

    @Test
    @DisplayName("two trusted hops: skips the inner proxy and lands on the client")
    void twoTrustedHops() {
        ClientIpResolver resolver = new ClientIpResolver(2);
        assertThat(resolver.resolve(request("10.0.0.1", "203.0.113.7, 10.1.1.1")))
                .isEqualTo("203.0.113.7");
        // Spoof attempt with the same topology: still the client, not the spoof.
        assertThat(resolver.resolve(request("10.0.0.1", "spoofed, 203.0.113.7, 10.1.1.1")))
                .isEqualTo("203.0.113.7");
    }

    @Test
    @DisplayName("header shorter than the configured topology falls back to the unspoofable peer")
    void shortHeaderFallsBackToPeer() {
        ClientIpResolver resolver = new ClientIpResolver(3);
        assertThat(resolver.resolve(request("10.0.0.1", "203.0.113.7, 10.1.1.1")))
                .isEqualTo("10.0.0.1");
    }

    @Test
    @DisplayName("no header, blank header, or empty entry falls back to the peer")
    void fallsBackToPeer() {
        ClientIpResolver resolver = new ClientIpResolver(1);
        assertThat(resolver.resolve(request("10.0.0.1", null))).isEqualTo("10.0.0.1");
        assertThat(resolver.resolve(request("10.0.0.1", "   "))).isEqualTo("10.0.0.1");
        assertThat(resolver.resolve(request("10.0.0.1", "1.2.3.4,   "))).isEqualTo("10.0.0.1");
    }

    @Test
    @DisplayName("a hop count below 1 is clamped rather than trusted")
    void clampsNonsenseConfiguration() {
        // 0 or negative would index past the end of the array; clamping to 1
        // keeps a misconfiguration from throwing on every login attempt.
        assertThat(new ClientIpResolver(0).resolve(request("10.0.0.1", "1.2.3.4, 203.0.113.7")))
                .isEqualTo("203.0.113.7");
        assertThat(new ClientIpResolver(-5).resolve(request("10.0.0.1", "1.2.3.4, 203.0.113.7")))
                .isEqualTo("203.0.113.7");
    }
}
