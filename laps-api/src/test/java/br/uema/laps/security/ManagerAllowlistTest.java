package br.uema.laps.security;

import br.uema.laps.member.Member;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ManagerAllowlistTest {

    private static Member withEmail(String email) {
        Member m = new Member();
        m.setEmail(email);
        return m;
    }

    @Test
    @DisplayName("matches case-insensitively and ignores surrounding whitespace")
    void matchesLoosely() {
        ManagerAllowlist allowlist = new ManagerAllowlist(List.of(" Coord@uema.br ", "head@uema.br"));
        assertThat(allowlist.isManager("coord@uema.br")).isTrue();
        assertThat(allowlist.isManager("COORD@UEMA.BR")).isTrue();
        assertThat(allowlist.isManager(" head@uema.br ")).isTrue();
    }

    @Test
    @DisplayName("does not match anything else")
    void rejectsNonMembers() {
        ManagerAllowlist allowlist = new ManagerAllowlist(List.of("coord@uema.br"));
        assertThat(allowlist.isManager("someone@uema.br")).isFalse();
        assertThat(allowlist.isManager("coord@uema.br.evil.com")).isFalse();
        assertThat(allowlist.isManager("")).isFalse();
        assertThat(allowlist.isManager(null)).isFalse();
    }

    @Test
    @DisplayName("an unset allowlist grants nobody the manager role")
    void emptyAllowlistGrantsNothing() {
        // An unset env var coerces to either of these shapes; both must mean
        // "no managers" rather than "everyone" or "the blank-email member".
        assertThat(new ManagerAllowlist(List.of()).isManager("anyone@uema.br")).isFalse();
        assertThat(new ManagerAllowlist(List.of("")).isManager("")).isFalse();
        assertThat(new ManagerAllowlist(List.of("  ")).isManager("  ")).isFalse();
    }

    @Test
    @DisplayName("roleFor resolves the authority granted per request")
    void roleForMapsToAuthority() {
        ManagerAllowlist allowlist = new ManagerAllowlist(List.of("coord@uema.br"));
        assertThat(allowlist.roleFor(withEmail("coord@uema.br"))).isEqualTo("MANAGER");
        assertThat(allowlist.roleFor(withEmail("member@uema.br"))).isEqualTo("MEMBER");
        // Members registered without an email can never be managers.
        assertThat(allowlist.roleFor(withEmail(null))).isEqualTo("MEMBER");
    }
}
