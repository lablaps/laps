package br.uema.laps.email;

import br.uema.laps.security.RateLimitExceededException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * The ceiling on outbound mail.
 *
 * <p>What these assert is not "requests are throttled" — {@code RateLimitGuard}
 * already does that — but that the number of messages the application can be
 * made to send is finite, per account and in total, whoever is asking.
 */
class EmailSendBudgetTest {

    /** No cooldown, so the cap tests measure the cap rather than the interval. */
    private static EmailSendBudget budget(int perAccount, int global) {
        return new EmailSendBudget(0, perAccount, global);
    }

    @Test
    @DisplayName("a second request inside the cooldown is refused with a retry hint")
    void cooldownBetweenSends() {
        EmailSendBudget budget = new EmailSendBudget(60, 5, 200);
        UUID member = UUID.randomUUID();

        budget.consume(member);

        assertThatThrownBy(() -> budget.consume(member))
                .isInstanceOf(RateLimitExceededException.class)
                .satisfies(e -> assertThat(((RateLimitExceededException) e).getRetryAfterSeconds())
                        .isBetween(1L, 60L));
    }

    @Test
    @DisplayName("an account's daily allowance is finite — this is what stops the relay")
    void perAccountDailyCap() {
        EmailSendBudget budget = budget(5, 200);
        UUID member = UUID.randomUUID();

        for (int i = 0; i < 5; i++) budget.consume(member);

        // The sixth is refused even though the burst limiter would allow it and
        // even though the member could point the address anywhere in between.
        assertThatThrownBy(() -> budget.consume(member))
                .isInstanceOf(RateLimitExceededException.class);
    }

    @Test
    @DisplayName("one account exhausting itself does not touch anyone else's allowance")
    void capIsPerAccount() {
        EmailSendBudget budget = budget(2, 200);
        UUID noisy = UUID.randomUUID();
        UUID quiet = UUID.randomUUID();

        budget.consume(noisy);
        budget.consume(noisy);
        assertThatThrownBy(() -> budget.consume(noisy)).isInstanceOf(RateLimitExceededException.class);

        assertThatCode(() -> budget.consume(quiet)).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("the global ceiling holds when the attacker has many accounts")
    void globalDailyCap() {
        // Per-account limits multiply by the number of accounts; coordinators
        // hand accounts out. Three members, one message each, is the whole
        // day's budget here — the fourth member is refused regardless.
        EmailSendBudget budget = budget(5, 3);
        for (int i = 0; i < 3; i++) budget.consume(UUID.randomUUID());

        assertThatThrownBy(() -> budget.consume(UUID.randomUUID()))
                .isInstanceOf(RateLimitExceededException.class);
    }

    @Test
    @DisplayName("a refusal does not consume the allowance it refused")
    void refusalIsNotCharged() {
        EmailSendBudget budget = budget(1, 10);
        UUID member = UUID.randomUUID();
        budget.consume(member);

        assertThatThrownBy(() -> budget.consume(member)).isInstanceOf(RateLimitExceededException.class);
        assertThatThrownBy(() -> budget.consume(member)).isInstanceOf(RateLimitExceededException.class);

        // Global budget was 10 and only one message was actually booked, so
        // nine remain for everyone else — a hammered account must not be able
        // to spend the lab's ceiling by being refused repeatedly.
        for (int i = 0; i < 9; i++) budget.consume(UUID.randomUUID());
        assertThatThrownBy(() -> budget.consume(UUID.randomUUID()))
                .isInstanceOf(RateLimitExceededException.class);
    }
}
