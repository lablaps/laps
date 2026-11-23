package br.uema.laps.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Server-issued proof of work, used as the bot challenge on login and invite
 * registration.
 *
 * <h2>What this does and does not buy</h2>
 * A captcha asks "are you human". This asks "did you spend CPU". It costs an
 * attacker real time per attempt and makes high-volume credential stuffing
 * expensive, but a determined attacker with hardware to spare will still get
 * through — this was chosen over Turnstile/hCaptcha deliberately, to keep
 * visitor data inside UEMA and avoid loosening the CSP for a third-party
 * script. It is the weaker of the two options and should not be read as
 * equivalent.
 *
 * <h2>Single use is the whole point</h2>
 * A challenge is consumed the moment it is presented, whether or not the
 * credentials that accompany it turn out to be correct. If a solved challenge
 * could be replayed, an attacker would pay the CPU cost once and then guess
 * passwords for free, which is the same as having no challenge at all.
 * {@link ConcurrentHashMap#remove} gives that atomically, so two racing requests
 * cannot both spend the same nonce.
 */
@Service
public class ProofOfWorkService {

    /**
     * Ceiling on outstanding challenges. Issuing is unauthenticated, so without
     * a bound a caller could mint challenges until the heap gives out. Mirrors
     * the approach in {@link AuthRateLimiter}.
     */
    private static final int MAX_OUTSTANDING = 50_000;

    private static final SecureRandom RNG = new SecureRandom();

    private final int difficultyBits;
    private final Duration ttl;

    /** nonce -> expiry instant. */
    private final Map<String, Instant> outstanding = new ConcurrentHashMap<>();

    public ProofOfWorkService(
            @Value("${laps.pow.difficulty-bits:16}") int difficultyBits,
            @Value("${laps.pow.ttl:PT5M}") Duration ttl) {
        // Clamped: 0 would make the challenge free, and much past 24 turns a
        // phone into a space heater for a minute before anyone can log in.
        this.difficultyBits = Math.min(24, Math.max(8, difficultyBits));
        this.ttl = ttl;
    }

    public int difficultyBits() {
        return difficultyBits;
    }

    public Duration ttl() {
        return ttl;
    }

    /** Mints a challenge. Returns the nonce the caller must find a solution for. */
    public String issue() {
        if (outstanding.size() >= MAX_OUTSTANDING) {
            sweep(Instant.now());
            if (outstanding.size() >= MAX_OUTSTANDING) {
                throw new IllegalStateException("challenge store saturated");
            }
        }
        byte[] raw = new byte[16];
        RNG.nextBytes(raw);
        String nonce = HexFormat.of().formatHex(raw);
        outstanding.put(nonce, Instant.now().plus(ttl));
        return nonce;
    }

    /**
     * Spends {@code nonce} and reports whether {@code solution} satisfies it.
     * A nonce is spent even when the solution is wrong, so a caller cannot probe
     * one challenge repeatedly.
     */
    public boolean consume(String nonce, String solution) {
        if (nonce == null || solution == null) return false;

        Instant expiry = outstanding.remove(nonce);
        if (expiry == null || expiry.isBefore(Instant.now())) {
            return false;
        }
        return leadingZeroBits(nonce, solution) >= difficultyBits;
    }

    static int leadingZeroBits(String nonce, String solution) {
        byte[] digest = sha256(nonce + ":" + solution);
        int zeros = 0;
        for (byte b : digest) {
            int unsigned = b & 0xFF;
            if (unsigned == 0) {
                zeros += 8;
                continue;
            }
            // numberOfLeadingZeros counts across a 32-bit int; subtract the 24
            // padding bits so the result is the count within this byte.
            zeros += Integer.numberOfLeadingZeros(unsigned) - 24;
            break;
        }
        return zeros;
    }

    private static byte[] sha256(String input) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(input.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException("SHA-256 unavailable", impossible);
        }
    }

    @Scheduled(fixedDelay = 5, timeUnit = TimeUnit.MINUTES)
    public void sweep() {
        sweep(Instant.now());
    }

    private void sweep(Instant now) {
        outstanding.entrySet().removeIf(e -> e.getValue().isBefore(now));
    }
}
