package br.uema.laps.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class ProofOfWorkServiceTest {

    private static final Duration FIVE_MINUTES = Duration.ofMinutes(5);

    /** Brute-forces a solution the same way the browser does. */
    private static String solve(String nonce, int difficultyBits) {
        for (int counter = 0; counter < 5_000_000; counter++) {
            String candidate = Integer.toString(counter, 36);
            if (ProofOfWorkService.leadingZeroBits(nonce, candidate) >= difficultyBits) {
                return candidate;
            }
        }
        throw new AssertionError("no solution found — difficulty misconfigured?");
    }

    @Test
    @DisplayName("a correct solution is accepted")
    void acceptsCorrectSolution() {
        ProofOfWorkService pow = new ProofOfWorkService(8, FIVE_MINUTES);
        String nonce = pow.issue();
        assertThat(pow.consume(nonce, solve(nonce, 8))).isTrue();
    }

    @Test
    @DisplayName("a solved challenge cannot be replayed — otherwise the work is paid once and reused forever")
    void challengeIsSingleUse() {
        ProofOfWorkService pow = new ProofOfWorkService(8, FIVE_MINUTES);
        String nonce = pow.issue();
        String solution = solve(nonce, 8);

        assertThat(pow.consume(nonce, solution)).isTrue();
        // This is the property the whole mechanism rests on. If replay worked,
        // an attacker would pay for one challenge and then guess passwords free.
        assertThat(pow.consume(nonce, solution)).isFalse();
        assertThat(pow.consume(nonce, solution)).isFalse();
    }

    @Test
    @DisplayName("a wrong solution is rejected and still spends the nonce")
    void wrongSolutionSpendsTheNonce() {
        ProofOfWorkService pow = new ProofOfWorkService(16, FIVE_MINUTES);
        String nonce = pow.issue();

        assertThat(pow.consume(nonce, "not-a-solution")).isFalse();
        // Spent even on failure, so one challenge cannot be probed repeatedly.
        assertThat(pow.consume(nonce, solve(nonce, 16))).isFalse();
    }

    @Test
    @DisplayName("unknown, null and expired nonces are rejected")
    void rejectsUnusableNonces() {
        ProofOfWorkService pow = new ProofOfWorkService(8, FIVE_MINUTES);
        assertThat(pow.consume("never-issued", "x")).isFalse();
        assertThat(pow.consume(null, "x")).isFalse();
        assertThat(pow.consume(pow.issue(), null)).isFalse();

        ProofOfWorkService expired = new ProofOfWorkService(8, Duration.ofSeconds(-1));
        String nonce = expired.issue();
        assertThat(expired.consume(nonce, solve(nonce, 8))).isFalse();
    }

    @Test
    @DisplayName("each nonce is distinct")
    void noncesAreDistinct() {
        ProofOfWorkService pow = new ProofOfWorkService(8, FIVE_MINUTES);
        assertThat(pow.issue()).isNotEqualTo(pow.issue());
    }

    @Test
    @DisplayName("difficulty is clamped so a zero or absurd config cannot disable or wedge login")
    void difficultyIsClamped() {
        assertThat(new ProofOfWorkService(0, FIVE_MINUTES).difficultyBits()).isEqualTo(8);
        assertThat(new ProofOfWorkService(-4, FIVE_MINUTES).difficultyBits()).isEqualTo(8);
        assertThat(new ProofOfWorkService(64, FIVE_MINUTES).difficultyBits()).isEqualTo(24);
        assertThat(new ProofOfWorkService(16, FIVE_MINUTES).difficultyBits()).isEqualTo(16);
    }

    @Test
    @DisplayName("leadingZeroBits agrees with the browser implementation on known pairs")
    void matchesBrowserImplementation() {
        // Produced by the TypeScript solver in laps-signal-lab/src/lib/proof-of-work.ts
        // and pinned here: if either side's hashing or its "nonce:solution"
        // framing drifts, nobody can log in, and this is what would catch it.
        assertThat(ProofOfWorkService.leadingZeroBits("9f8c1b2a3d4e5f60718293a4b5c6d7e8", "1ats")).isEqualTo(17);
        assertThat(ProofOfWorkService.leadingZeroBits("00112233445566778899aabbccddeeff", "2ycf")).isEqualTo(17);
        assertThat(ProofOfWorkService.leadingZeroBits("deadbeefcafebabe0123456789abcdef", "19f3")).isEqualTo(20);
    }

    @Test
    @DisplayName("leadingZeroBits counts across byte boundaries")
    void countsAcrossByteBoundaries() {
        // Whatever the inputs, the count must never exceed the digest width or
        // go negative — the byte-boundary arithmetic is easy to get wrong.
        for (int i = 0; i < 200; i++) {
            int bits = ProofOfWorkService.leadingZeroBits("nonce", Integer.toString(i));
            assertThat(bits).isBetween(0, 256);
        }
    }
}
