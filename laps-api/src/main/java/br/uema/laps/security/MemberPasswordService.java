package br.uema.laps.security;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

/**
 * Owns the initial-password lifecycle for member accounts.
 *
 * <h2>Why this is no longer deterministic</h2>
 * Temp passwords used to be {@code laps@{slug}#{last4uuid}} — derived purely
 * from the member's slug and id so a coordinator could recompute and dictate
 * them. Both of those values are published by {@code GET /api/v1/members} to
 * anonymous callers, which made every un-rotated account takeable by anyone
 * who could read the public roster: fetch the list, compute the password, log
 * in. Convenience for the coordinator was indistinguishable from convenience
 * for an attacker.
 *
 * Passwords are now drawn from {@link SecureRandom} and returned exactly once,
 * at the moment they are set. They cannot be recovered afterwards — BCrypt is
 * one-way and there is no formula to fall back on. A coordinator who loses the
 * value issues a new one via {@code POST /api/v1/admin/members/{id}/reset-password}.
 */
@Service
public class MemberPasswordService {

    /**
     * Unambiguous alphabet: no O/0, I/l/1. These get read aloud and copied off
     * a screen, so glyph collisions cost a support round-trip.
     */
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    /**
     * 14 chars over a 56-symbol alphabet ≈ 81 bits of entropy — far beyond
     * brute-force range for a credential that is meant to be rotated on first
     * login, while still short enough to dictate over the phone.
     */
    private static final int LENGTH = 14;

    private static final SecureRandom RNG = new SecureRandom();

    private final PasswordEncoder passwordEncoder;
    private final MemberRepository memberRepository;

    public MemberPasswordService(PasswordEncoder passwordEncoder, MemberRepository memberRepository) {
        this.passwordEncoder = passwordEncoder;
        this.memberRepository = memberRepository;
    }

    /** A fresh random temp password. Never reproducible — show it once. */
    public String generateTempPassword() {
        StringBuilder sb = new StringBuilder(LENGTH);
        for (int i = 0; i < LENGTH; i++) {
            sb.append(ALPHABET.charAt(RNG.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }

    /**
     * Provision a temp password on a newly-created (or password-less) member.
     * Idempotent: if a hash already exists we leave it alone so a member who
     * has rotated their own credential is never clobbered.
     *
     * @return the plaintext, to be shown to the admin exactly once, or
     *         {@code null} when the member already had a password.
     */
    @Transactional
    public String provisionInitial(Member member) {
        if (member.getPasswordHash() != null && !member.getPasswordHash().isBlank()) {
            return null;
        }
        return forceReset(member);
    }

    /**
     * Unconditionally issues a new temp password, discarding any existing hash.
     * Backs the admin "reset password" action and the one-time migration off
     * the old deterministic scheme.
     *
     * @return the plaintext, shown once.
     */
    @Transactional
    public String forceReset(Member member) {
        String temp = generateTempPassword();
        member.setPasswordHash(passwordEncoder.encode(temp));
        member.setMustChangePassword(true);
        memberRepository.save(member);
        return temp;
    }
}
