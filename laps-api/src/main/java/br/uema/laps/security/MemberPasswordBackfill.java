package br.uema.laps.security;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reports accounts that cannot log in because they have no password hash.
 *
 * <h2>Why this no longer provisions anything</h2>
 * This runner used to stamp a temp password on every password-less member at
 * startup. That was only viable while passwords were deterministic — the value
 * could be recomputed later and handed out. It was also precisely what made
 * the whole seeded roster takeable: every member got a credential derived from
 * their public slug and id.
 *
 * Passwords are random now and shown exactly once, so a startup runner has
 * nowhere to put the plaintext. Writing it to the log would be worse than the
 * problem it solves. Instead we count the affected accounts and let a
 * coordinator issue credentials deliberately via
 * {@code POST /api/v1/admin/members/{id}/reset-password}, which returns the
 * new password to the admin in the response.
 *
 * A member with no hash simply cannot authenticate — {@code AuthController}
 * rejects a null hash — so leaving them unprovisioned fails closed.
 */
@Configuration
public class MemberPasswordBackfill {

    private static final Logger log = LoggerFactory.getLogger(MemberPasswordBackfill.class);

    @Bean
    public ApplicationRunner reportMembersWithoutPasswordAtStartup(MemberRepository memberRepository) {
        return args -> report(memberRepository);
    }

    @Transactional(readOnly = true)
    void report(MemberRepository memberRepository) {
        long pending = memberRepository.findAll().stream()
                .filter(m -> m.getDeletedAt() == null)
                .map(Member::getPasswordHash)
                .filter(hash -> hash == null || hash.isBlank())
                .count();

        if (pending > 0) {
            log.warn("{} member(s) have no password and cannot log in. "
                    + "Issue credentials from the admin UI (Reset password) — "
                    + "temp passwords are random and displayed only once.", pending);
        } else {
            log.debug("All active members have a password hash.");
        }
    }
}
