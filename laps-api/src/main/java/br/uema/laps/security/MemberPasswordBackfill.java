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
 * Provision the deterministic temp password on members who pre-date the
 * per-member auth migration. V11 only flips `must_change_password` for rows
 * that already have a `password_hash`; the seed members from V4 do not, so
 * without this runner none of them could log in.
 *
 * Re-running is safe: `MemberPasswordService.provisionInitial` no-ops when a
 * hash is already present. Counts are logged so a coordinator can see at
 * startup how many accounts were just bootstrapped.
 */
@Configuration
public class MemberPasswordBackfill {

    private static final Logger log = LoggerFactory.getLogger(MemberPasswordBackfill.class);

    @Bean
    public ApplicationRunner provisionPasswordsAtStartup(
            MemberRepository memberRepository,
            MemberPasswordService memberPasswordService
    ) {
        return args -> backfill(memberRepository, memberPasswordService);
    }

    @Transactional
    void backfill(MemberRepository memberRepository, MemberPasswordService memberPasswordService) {
        int provisioned = 0;
        for (Member m : memberRepository.findAll()) {
            String hash = m.getPasswordHash();
            if (hash != null && !hash.isBlank()) continue;
            memberPasswordService.provisionInitial(m);
            provisioned++;
        }
        if (provisioned > 0) {
            log.info("Provisioned deterministic temp passwords for {} member(s) without a hash", provisioned);
        } else {
            log.debug("All members already have a password_hash — no backfill needed");
        }
    }
}
