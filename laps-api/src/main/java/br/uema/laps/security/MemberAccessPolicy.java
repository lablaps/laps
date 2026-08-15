package br.uema.laps.security;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberStatus;
import org.springframework.stereotype.Component;

/**
 * Decides whether a member row may hold a session at all.
 *
 * <p>Two separate holes shared this missing rule:
 *
 * <ul>
 *   <li>{@code AuthController.login} resolved members by slug or email with no
 *       filter on {@code deletedAt}, and {@code AdminController.softDelete}
 *       leaves {@code password_hash} in place — so removing a member from the
 *       lab did not stop them logging in afterwards.</li>
 *   <li>{@code JwtAuthFilter} trusted any correctly-signed token, so even once
 *       login was closed, a token minted before the removal stayed valid for the
 *       rest of its TTL (8h in production).</li>
 * </ul>
 *
 * <p>Applying this at both points makes removal take effect on the next request
 * rather than at the next token expiry.
 *
 * <p>{@link MemberStatus#COMPLETED} deliberately still has access: those are
 * alumni whose profiles remain published, and the graph endpoint already treats
 * only {@code INACTIVE} as hidden.
 */
@Component
public class MemberAccessPolicy {

    public boolean mayAuthenticate(Member member) {
        return member != null
                && member.getDeletedAt() == null
                && member.getStatus() != MemberStatus.INACTIVE;
    }
}
