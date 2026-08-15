package br.uema.laps.security;

import br.uema.laps.member.Member;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

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
 * <p>Emails are compared case-insensitively and trimmed, because the value
 * arrives from a comma-separated environment variable that humans edit.
 */
@Component
public class ManagerAllowlist {

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

    /** The security role to grant this member right now: {@code MANAGER} or {@code MEMBER}. */
    public String roleFor(Member member) {
        return isManager(member.getEmail()) ? "MANAGER" : "MEMBER";
    }
}
