package br.uema.laps.member;

import org.springframework.data.jpa.domain.Specification;

public final class MemberSpecifications {

    private MemberSpecifications() {}

    public static Specification<Member> build(MemberRole role, MemberStatus status) {
        Specification<Member> spec = (root, q, cb) -> cb.isNull(root.get("deletedAt"));
        if (role != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("currentRole"), role));
        }
        if (status != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), status));
        }
        return spec;
    }
}
