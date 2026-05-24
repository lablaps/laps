package br.uema.laps.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

/** Pulls the JWT subject (member UUID) from the SecurityContext populated by {@link JwtAuthFilter}. */
public final class AuthenticatedMember {

    private AuthenticatedMember() {}

    public static UUID id() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "Not authenticated");
        }
        try {
            return UUID.fromString(auth.getPrincipal().toString());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid JWT subject");
        }
    }
}
