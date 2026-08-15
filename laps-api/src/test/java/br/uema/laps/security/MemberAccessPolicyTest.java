package br.uema.laps.security;

import br.uema.laps.member.Member;
import br.uema.laps.member.MemberStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class MemberAccessPolicyTest {

    private final MemberAccessPolicy policy = new MemberAccessPolicy();

    private static Member member(MemberStatus status, Instant deletedAt) {
        Member m = new Member();
        m.setStatus(status);
        m.setDeletedAt(deletedAt);
        return m;
    }

    @Test
    @DisplayName("an active member may authenticate")
    void activeMemberAllowed() {
        assertThat(policy.mayAuthenticate(member(MemberStatus.ACTIVE, null))).isTrue();
    }

    @Test
    @DisplayName("a soft-deleted member may not — AdminController.softDelete leaves the password hash in place")
    void softDeletedMemberRefused() {
        assertThat(policy.mayAuthenticate(member(MemberStatus.ACTIVE, Instant.now()))).isFalse();
        assertThat(policy.mayAuthenticate(member(MemberStatus.INACTIVE, Instant.now()))).isFalse();
    }

    @Test
    @DisplayName("an INACTIVE member may not, even without a deletion timestamp")
    void inactiveMemberRefused() {
        assertThat(policy.mayAuthenticate(member(MemberStatus.INACTIVE, null))).isFalse();
    }

    @Test
    @DisplayName("COMPLETED alumni keep access — their profiles stay published")
    void completedMemberAllowed() {
        assertThat(policy.mayAuthenticate(member(MemberStatus.COMPLETED, null))).isTrue();
    }

    @Test
    @DisplayName("a missing member is refused rather than NPEing")
    void nullRefused() {
        assertThat(policy.mayAuthenticate(null)).isFalse();
    }
}
