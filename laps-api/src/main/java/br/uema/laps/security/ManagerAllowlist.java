package br.uema.laps.security;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Single definition of "is this member a manager".
 *
 * <p>The allowlist lookup used to be inlined in three places — {@code AuthController}
 * at login, {@code InviteController} at registration, and nowhere at all on
 * subsequent requests, which is what let a demoted manager keep the role until
 * their token expired. Centralising it means every caller answers the question
 * the same way, against the current configuration rather than against whatever
 * was true when a token was minted.
 *
 * <p>Two independent grants resolve to the {@code MANAGER} authority:
 * <ol>
 *   <li>the configured email allowlist — the bootstrap path, since it works
 *       before any member record exists to carry a tier;</li>
 *   <li>a console-carrying tier on the member record itself — the "Gerenciador"
 *       ({@link MemberRole#MANAGER}) and "Coordenador"
 *       ({@link MemberRole#COORDINATOR}) badges assigned from the Central de
 *       Comando.</li>
 * </ol>
 *
 * <p>The tier grant is what lets the lab promote someone from the admin UI
 * instead of editing {@code LAPS_MANAGER_EMAILS} and redeploying, and it is the
 * only grant available to members registered without an email. Note the
 * consequence: setting a member's tier to Gerenciador or Coordenador — whether
 * by editing them or by issuing an invite for that tier — hands them the full
 * Central de Comando, including member deletion and temporary-password reveal.
 * Demotion revokes it on the very next request, because {@code JwtAuthFilter}
 * recomputes the authority from this class rather than trusting the token's
 * {@code role} claim.
 *
 * <p>{@link MemberRole#HEAD} sits above both and is still deliberately NOT
 * granted here: the title describes seniority, not console duty. Allowlist that
 * email to give the head the console.
 *
 * <p>Emails are compared case-insensitively and trimmed, because the value
 * arrives from a comma-separated environment variable that humans edit.
 */
@Component
public class ManagerAllowlist {

    /**
     * Tiers that carry Central de Comando duty on their own. Coordenadores run
     * the lab day to day — issuing credentials, fixing rosters, placing exchange
     * students — so making them ask a Gerenciador for every console action was
     * friction with no security value: they already outrank the tier that has it.
     */
    private static final Set<MemberRole> CONSOLE_TIERS =
            EnumSet.of(MemberRole.MANAGER, MemberRole.COORDINATOR);

    private final List<String> allowedEmails;

    public ManagerAllowlist(@Value("${laps.managers.allowed-emails:}") List<String> allowedEmails) {
        // An unset env var yields either an empty list or a single blank entry
        // depending on how Spring coerces it; normalise both to "no managers".
        this.allowedEmails = allowedEmails.stream()
                .map(e -> e == null ? "" : e.trim().toLowerCase(Locale.ROOT))
                .filter(e -> !e.isEmpty())
                .toList();
    }

    public boolean isManager(String email) {
        if (email == null || email.isBlank()) return false;
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        return allowedEmails.contains(normalized);
    }

    /** True when the member's academic tier carries the console on its own. */
    public boolean hasConsoleTier(Member member) {
        return member != null && CONSOLE_TIERS.contains(member.getCurrentRole());
    }

    /** The security role to grant this member right now: {@code MANAGER} or {@code MEMBER}. */
    public String roleFor(Member member) {
        if (member == null) return "MEMBER";
        return isManager(member.getEmail()) || hasConsoleTier(member) ? "MANAGER" : "MEMBER";
    }
}
