package br.uema.laps.email;

import br.uema.laps.security.RateLimitExceededException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Caps how much mail the application will send, per account and in total.
 *
 * <h2>Why the generic rate limiter is not enough</h2>
 * {@code RateLimitGuard} answers "is this caller hammering us right now" — ten
 * requests a minute, then a minute of cooldown. For an endpoint that only
 * touches our own database that is the whole question. For one that sends mail
 * it is barely half of it, because the resource being consumed is not this
 * server's CPU: it is a third-party quota (300 messages a day on Brevo's free
 * plan), a shared sender reputation, and a stranger's inbox.
 *
 * <p>Sustained through the generic limiter, a single logged-in member can emit
 * roughly ten messages a minute indefinitely — several hundred an hour. That
 * exhausts a day's quota in minutes, and every message after that fails for
 * everyone, including the member who actually needs to verify an address. Worse,
 * the recipient is attacker-chosen: the profile's email field is self-service,
 * so "request a code" can be aimed at any address by editing the profile between
 * requests. Unbounded, this endpoint is a mail relay wearing the lab's name.
 *
 * <h2>Three limits</h2>
 * <ol>
 *   <li><b>Cooldown</b> — one message per account per minute. Verification is a
 *       thing you do once; a legitimate resend is a person waiting on an inbox,
 *       never a loop.</li>
 *   <li><b>Per-account daily cap</b> — the one that actually stops the relay.
 *       Five is generous for "I typo'd my address twice"; it is useless as an
 *       attack.</li>
 *   <li><b>Global daily cap</b> — the backstop that holds "regardless of the
 *       situation". Per-account limits multiply by the number of accounts, and
 *       accounts are handed out by coordinators, so the ceiling has to exist
 *       independently of how many members there are. Sits below the provider's
 *       own quota so that hitting ours is a 429 we control rather than a 4xx
 *       from Brevo that we cannot distinguish from a broken key.</li>
 * </ol>
 *
 * <p>Both windows are rolling rather than calendar days: a midnight reset is a
 * doubled budget for anyone who waits for it.
 *
 * <p>State is in-memory, like {@link br.uema.laps.security.AuthRateLimiter}, and
 * the same caveat applies — a restart clears the counters, and a second replica
 * would get its own set. Single-instance is the deployment today; the cost of
 * being wrong here is a bounded burst of email, not a breach.
 */
@Component
public class EmailSendBudget {

    private static final Logger log = LoggerFactory.getLogger(EmailSendBudget.class);

    private static final Duration DAY = Duration.ofHours(24);

    private final Duration minInterval;
    private final int maxPerAccountPerDay;
    private final int maxPerDay;

    /** member id → send instants inside the rolling day, oldest first. */
    private final Map<UUID, Deque<Instant>> perAccount = new HashMap<>();
    /** every send inside the rolling day, oldest first. Bounded by maxPerDay. */
    private final Deque<Instant> global = new ArrayDeque<>();

    public EmailSendBudget(
            @Value("${laps.email.min-interval-seconds:60}") long minIntervalSeconds,
            @Value("${laps.email.max-per-account-per-day:5}") int maxPerAccountPerDay,
            @Value("${laps.email.max-per-day:200}") int maxPerDay
    ) {
        this.minInterval = Duration.ofSeconds(Math.max(0, minIntervalSeconds));
        this.maxPerAccountPerDay = Math.max(1, maxPerAccountPerDay);
        this.maxPerDay = Math.max(1, maxPerDay);
    }

    /**
     * Books one message against {@code memberId}'s budget.
     *
     * <p>Call before handing anything to the provider — a booked-but-unsent
     * message is a wasted allowance, while a sent-but-unbooked one is a hole.
     *
     * @throws RateLimitExceededException carrying the seconds until the caller
     *         may retry, which {@code GlobalExceptionHandler} renders as a 429
     *         with {@code Retry-After}.
     */
    public synchronized void consume(UUID memberId) {
        Instant now = Instant.now();
        Deque<Instant> mine = perAccount.computeIfAbsent(memberId, k -> new ArrayDeque<>());
        prune(mine, now);
        prune(global, now);
        // Opportunistic sweep so idle accounts do not accumulate empty deques.
        perAccount.entrySet().removeIf(e -> e.getValue().isEmpty() && !e.getKey().equals(memberId));

        Instant last = mine.peekLast();
        if (last != null) {
            Duration since = Duration.between(last, now);
            if (since.compareTo(minInterval) < 0) {
                throw new RateLimitExceededException(
                        Math.max(1, minInterval.minus(since).toSeconds()));
            }
        }
        if (mine.size() >= maxPerAccountPerDay) {
            throw new RateLimitExceededException(retryAfter(mine.peekFirst(), now));
        }
        if (global.size() >= maxPerDay) {
            // Operational, not a member mistake: the lab is out of budget for
            // the day and somebody has to know before every verification fails.
            log.error("Daily email budget of {} exhausted; refusing further sends until the "
                    + "rolling window frees up. Raise laps.email.max-per-day if this is legitimate volume.",
                    maxPerDay);
            throw new RateLimitExceededException(retryAfter(global.peekFirst(), now));
        }

        mine.addLast(now);
        global.addLast(now);
    }

    private static long retryAfter(Instant oldest, Instant now) {
        if (oldest == null) return DAY.toSeconds();
        return Math.max(1, Duration.between(now, oldest.plus(DAY)).toSeconds());
    }

    private static void prune(Deque<Instant> window, Instant now) {
        Instant cutoff = now.minus(DAY);
        while (!window.isEmpty() && window.peekFirst().isBefore(cutoff)) {
            window.pollFirst();
        }
    }
}
