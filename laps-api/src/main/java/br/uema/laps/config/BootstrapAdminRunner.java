package br.uema.laps.config;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import br.uema.laps.member.MemberRole;
import br.uema.laps.member.MemberStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * On startup, ensures the bootstrap manager account exists with a usable password.
 * - If the member row is missing, it is created (slug + role from config).
 * - If the password hash is empty, it is set from {@code laps.bootstrap.password}.
 *
 * Keeps credentials out of Flyway migrations (which would commit them to git).
 */
@Component
public class BootstrapAdminRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(BootstrapAdminRunner.class);

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String fullName;
    private final String slug;
    private final String password;

    public BootstrapAdminRunner(
            MemberRepository memberRepository,
            PasswordEncoder passwordEncoder,
            @Value("${laps.bootstrap.email:}") String email,
            @Value("${laps.bootstrap.full-name:}") String fullName,
            @Value("${laps.bootstrap.slug:}") String slug,
            @Value("${laps.bootstrap.password:}") String password
    ) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.fullName = fullName;
        this.slug = slug;
        this.password = password;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (password == null || password.isBlank()) {
            log.warn("Bootstrap admin password is empty — skipping. Set LAPS_BOOTSTRAP_PASSWORD to enable.");
            return;
        }
        if (email == null || email.isBlank()
                || fullName == null || fullName.isBlank()
                || slug == null || slug.isBlank()) {
            log.warn("Bootstrap admin identity is incomplete — skipping. "
                    + "Set LAPS_BOOTSTRAP_EMAIL, LAPS_BOOTSTRAP_FULL_NAME and LAPS_BOOTSTRAP_SLUG to enable.");
            return;
        }

        Member member = memberRepository.findByEmailIgnoreCase(email)
                .or(() -> memberRepository.findBySlug(slug))
                .orElseGet(() -> {
                    Member m = new Member();
                    m.setSlug(slug);
                    m.setFullName(fullName);
                    m.setCurrentRole(MemberRole.UNDERGRAD);
                    m.setCurrentRoleStartedAt(LocalDate.now());
                    m.setStatus(MemberStatus.ACTIVE);
                    log.info("Bootstrap: creating manager account for {}", email);
                    return m;
                });

        boolean changed = false;
        if (member.getEmail() == null || !email.equalsIgnoreCase(member.getEmail())) {
            member.setEmail(email);
            changed = true;
        }
        if (member.getPasswordHash() == null || member.getPasswordHash().isBlank()) {
            member.setPasswordHash(passwordEncoder.encode(password));
            log.info("Bootstrap: set initial password for {}", email);
            changed = true;
        }

        if (changed) {
            memberRepository.save(member);
        }
    }
}
