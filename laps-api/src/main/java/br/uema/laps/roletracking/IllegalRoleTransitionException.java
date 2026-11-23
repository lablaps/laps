package br.uema.laps.roletracking;

import br.uema.laps.member.MemberRole;

public class IllegalRoleTransitionException extends RuntimeException {
    public IllegalRoleTransitionException(MemberRole from, MemberRole to) {
        super("Illegal role transition: " + from + " → " + to);
    }
}
