package br.uema.laps.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class TokenHashingTest {

    @Test
    @DisplayName("agrees with the SQL backfill in V24")
    void matchesSqlBackfill() {
        // Cross-checked against Postgres 16:
        //   SELECT encode(sha256(convert_to('6ba7b810-9dad-11d1-80b4-00c04fd430c8','UTF8')),'hex');
        // If these ever diverge, invites migrated by V24 stop resolving — the
        // hash written by the migration must equal the hash the app computes.
        assertThat(TokenHashing.hash("6ba7b810-9dad-11d1-80b4-00c04fd430c8"))
                .isEqualTo("e5855ff48799c52c9ccf80b82bab9492c347a316876dbeaafef22b0bd4fac13d");
    }

    @Test
    @DisplayName("produces 64 lower-case hex characters, matching the CHAR(64) column")
    void producesFixedWidthHex() {
        String hash = TokenHashing.hash(UUID.randomUUID().toString());
        assertThat(hash).hasSize(64).matches("[0-9a-f]{64}");
    }

    @Test
    @DisplayName("the stored value cannot be presented as the token")
    void hashIsNotTheToken() {
        String token = UUID.randomUUID().toString();
        String stored = TokenHashing.hash(token);

        assertThat(stored).isNotEqualTo(token);
        // Presenting what the database holds must not authenticate.
        assertThat(TokenHashing.matches(stored, stored)).isFalse();
        assertThat(TokenHashing.matches(token, stored)).isTrue();
    }

    @Test
    @DisplayName("distinct tokens hash distinctly and casing is significant")
    void distinguishesTokens() {
        assertThat(TokenHashing.hash("a")).isNotEqualTo(TokenHashing.hash("b"));
        // UUIDs are normalised to lower case before hashing by the caller; this
        // pins that the digest itself is case-sensitive, so that normalisation
        // is load-bearing rather than incidental.
        assertThat(TokenHashing.hash("6BA7B810-9DAD-11D1-80B4-00C04FD430C8"))
                .isNotEqualTo(TokenHashing.hash("6ba7b810-9dad-11d1-80b4-00c04fd430c8"));
    }

    @Test
    @DisplayName("null inputs are refused rather than throwing")
    void handlesNulls() {
        assertThat(TokenHashing.matches(null, "abc")).isFalse();
        assertThat(TokenHashing.matches("abc", null)).isFalse();
        assertThat(TokenHashing.matches(null, null)).isFalse();
    }

    @Test
    @DisplayName("a wrong token of the same length is rejected")
    void rejectsWrongToken() {
        String stored = TokenHashing.hash(UUID.randomUUID().toString());
        assertThat(TokenHashing.matches(UUID.randomUUID().toString(), stored)).isFalse();
    }
}
