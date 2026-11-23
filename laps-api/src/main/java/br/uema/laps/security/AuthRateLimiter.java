package br.uema.laps.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Per-IP sliding-window rate limiter for the /auth endpoints.
 *
 * Why in-memory instead of Bucket4j/Redis: this app runs as a single replica
 * on UEMA's server. A ConcurrentHashMap keyed by IP is enough at lab scale,
 * adds zero dependencies to the JAR, and survives a process restart by
 * starting fresh (which is the *correct* behavior — a brute-forcer who
 * crashes the JVM should not get a clean window for free, but at single-node
 * scale this trade is acceptable).
 *
 * If/when this becomes multi-replica, swap {@link #attempts} for a Redis
 * sorted-set; the {@code allow}/{@code retryAfterSeconds} contract is
 * intentionally narrow so the rewrite stays self-contained.
 */
@Component
public class AuthRateLimiter {

    /**
     * Hard ceiling on distinct tracked keys. Without it a caller who varies the
     * key on every request (a rotating proxy pool, or a spoofed header) grows
     * these maps without bound until the heap gives out. When the ceiling is
     * hit we sweep expired entries; if that frees nothing the map is genuinely
     * saturated and we fail closed rather than keep allocating.
     */
    private static final int MAX_TRACKED_KEYS = 50_000;

    private final int maxAttempts;
    private final Duration window;
    private final Duration blockFor;

    // key → timestamps of recent attempts (oldest first).
    private final Map<String, Deque<Instant>> attempts = new ConcurrentHashMap<>();
    // key → timestamp at which the block expires.
    private final Map<String, Instant> blockedUntil = new ConcurrentHashMap<>();

    public AuthRateLimiter(
            @Value("${laps.ratelimit.auth-attempts-per-minute:10}") int maxAttempts,
            @Value("${laps.ratelimit.auth-block-seconds:60}") long blockSeconds
    ) {
        this.maxAttempts = maxAttempts;
        this.window = Duration.ofMinutes(1);
        this.blockFor = Duration.ofSeconds(blockSeconds);
    }

    /**
     * Records an attempt from {@code key} (typically the remote IP) and
     * returns {@code true} if the request should proceed. When {@code false},
     * call {@link #retryAfterSeconds(String)} to populate the Retry-After
     * header so well-behaved clients back off.
     */
    public boolean allow(String key) {
        Instant now = Instant.now();
        Instant blockUntil = blockedUntil.get(key);
        if (blockUntil != null && blockUntil.isAfter(now)) {
            return false;
        }
        if (blockUntil != null) {
            blockedUntil.remove(key);
        }

        if (attempts.size() >= MAX_TRACKED_KEYS && !attempts.containsKey(key)) {
            sweep(now);
            if (attempts.size() >= MAX_TRACKED_KEYS) {
                // Saturated: refuse rather than admit an unbounded key space.
                return false;
            }
        }

        Deque<Instant> recent = attempts.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (recent) {
            Instant cutoff = now.minus(window);
            while (!recent.isEmpty() && recent.peekFirst().isBefore(cutoff)) {
                recent.pollFirst();
            }
            if (recent.size() >= maxAttempts) {
                blockedUntil.put(key, now.plus(blockFor));
                return false;
            }
            recent.addLast(now);
            return true;
        }
    }

    public long retryAfterSeconds(String key) {
        Instant until = blockedUntil.get(key);
        if (until == null) return blockFor.getSeconds();
        long s = Duration.between(Instant.now(), until).getSeconds();
        return Math.max(1, s);
    }

    /**
     * Drops keys whose window has fully elapsed and blocks that have expired.
     * Called on a scheduled tick and opportunistically when the map saturates —
     * previously nothing ever removed entries, so the maps only grew.
     */
    @Scheduled(fixedDelay = 5, timeUnit = TimeUnit.MINUTES)
    public void sweep() {
        sweep(Instant.now());
    }

    private void sweep(Instant now) {
        Instant cutoff = now.minus(window);
        attempts.entrySet().removeIf(e -> {
            Deque<Instant> d = e.getValue();
            synchronized (d) {
                while (!d.isEmpty() && d.peekFirst().isBefore(cutoff)) {
                    d.pollFirst();
                }
                return d.isEmpty();
            }
        });
        blockedUntil.entrySet().removeIf(e -> !e.getValue().isAfter(now));
    }
}
