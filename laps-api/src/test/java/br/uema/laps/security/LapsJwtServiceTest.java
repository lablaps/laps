package br.uema.laps.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class LapsJwtServiceTest {

    private static final String SECRET = "test-only-signing-secret-that-is-at-least-32-bytes-long";

    @Test
    @DisplayName("a session token lasts one hour and contains only identity and revocation state")
    void issuesMinimalOneHourToken() {
        LapsJwtService service = new LapsJwtService("laps-test", SECRET, Duration.ofHours(1));
        String memberId = UUID.randomUUID().toString();

        Claims claims = service.parseClaims(service.issue(memberId, 7L));

        assertThat(claims.getIssuer()).isEqualTo("laps-test");
        assertThat(claims.getSubject()).isEqualTo(memberId);
        assertThat(((Number) claims.get("ver")).longValue()).isEqualTo(7L);
        assertThat(claims).doesNotContainKeys("email", "role");
        assertThat(claims.getExpiration().getTime() - claims.getIssuedAt().getTime())
                .isEqualTo(Duration.ofHours(1).toMillis());
    }
}
