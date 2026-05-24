package br.uema.laps.security;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Owns the initial-password lifecycle for member accounts.
 *
 * The formula `laps@{slug}#{last4uuid}` is deliberately deterministic so a
 * coordinator can hand it out verbally / over chat without having to capture
 * a one-time secret. It is only a *temp* password — every account it is
 * applied to has `must_change_password = true`, so the system refuses to do
 * anything except change-password until the member rotates it.
 */
@Service
public class MemberPasswordService {

    private final PasswordEncoder passwordEncoder;
    private final MemberRepository memberRepository;

    public MemberPasswordService(PasswordEncoder passwordEncoder, MemberRepository memberRepository) {
        this.passwordEncoder = passwordEncoder;
        this.memberRepository = memberRepository;
    }

    /**
     * `laps@{slug}#{last4uuid}` — predictable from the (slug, UUID) pair the
     * coordinator can already see in the admin UI.
     */
    public String deterministicTempPassword(String slug, UUID id) {
        String idHex = id.toString().replace("-", "");
        String tail = idHex.substring(idHex.length() - 4);
        return "laps@" + slug + "#" + tail;
    }

    /**
     * Provision the deterministic temp password on a newly-created (or
     * password-less) member. Re-running is safe and idempotent: if a hash
     * already exists we leave it alone so we don't clobber a member who has
     * already rotated their own credential.
     *
     * Returns the plaintext temp password so the caller can show it to the
     * admin exactly once (we cannot recover it from BCrypt later, though the
     * formula above does let us recompute it deterministically).
     */
    @Transactional
    public String provisionInitial(Member member) {
        if (member.getPasswordHash() != null && !member.getPasswordHash().isBlank()) {
            return null;
        }
        String temp = deterministicTempPassword(member.getSlug(), member.getId());
        member.setPasswordHash(passwordEncoder.encode(temp));
        member.setMustChangePassword(true);
        memberRepository.save(member);
        return temp;
    }
}
