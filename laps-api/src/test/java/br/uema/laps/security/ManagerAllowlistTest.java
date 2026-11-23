package br.uema.laps.security;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ManagerAllowlistTest {

    private static Member withEmail(String email) {
        return with(email, MemberRole.UNDERGRAD);
    }

    private static Member with(String email, MemberRole tier) {
        Member m = new Member();
        m.setEmail(email);
        m.setCurrentRole(tier);
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
        // An off-allowlist email on a non-manager tier stays a plain member.
        assertThat(allowlist.roleFor(withEmail(null))).isEqualTo("MEMBER");
    }

    @Test
    @DisplayName("the internal management permission grants MANAGER without an allowlist entry")
    void managementPermissionGrantsAuthority() {
        ManagerAllowlist allowlist = new ManagerAllowlist(List.of("coord@uema.br"));
        Member member = with("sofia@uema.br", MemberRole.COLLABORATOR);
        member.getPermissions().add(MemberPermission.MANAGE_PLATFORM);
        assertThat(allowlist.roleFor(member)).isEqualTo("MANAGER");
    }

    @Test
    @DisplayName("legacy public roles no longer grant management authority")
    void legacyRolesDoNotGrantAuthority() {
        ManagerAllowlist allowlist = new ManagerAllowlist(List.of("coord@uema.br"));
        assertThat(allowlist.roleFor(with("other@uema.br", MemberRole.COORDINATOR))).isEqualTo("MEMBER");
        assertThat(allowlist.roleFor(with(null, MemberRole.MANAGER))).isEqualTo("MEMBER");
    }

    @Test
    @DisplayName("HEAD is seniority, not a console grant")
    void headTierIsNotAManager() {
        // HEAD describes seniority, not console duty.
        ManagerAllowlist allowlist = new ManagerAllowlist(List.of("coord@uema.br"));
        assertThat(allowlist.roleFor(with("head@uema.br", MemberRole.HEAD))).isEqualTo("MEMBER");
        // …but the allowlist still wins regardless of tier.
        assertThat(allowlist.roleFor(with("coord@uema.br", MemberRole.HEAD))).isEqualTo("MANAGER");
    }

    @Test
    @DisplayName("a null member resolves to MEMBER rather than throwing")
    void nullMemberIsNotAManager() {
        assertThat(new ManagerAllowlist(List.of("coord@uema.br")).roleFor(null)).isEqualTo("MEMBER");
    }
}
