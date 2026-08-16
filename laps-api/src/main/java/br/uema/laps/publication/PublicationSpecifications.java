package br.uema.laps.publication;

import br.uema.laps.member.Member;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.Set;
import java.util.UUID;

public final class PublicationSpecifications {

    private PublicationSpecifications() {}

    /**
     * The public visibility rule, in one place.
     *
     * <p>Members can now submit publications from the portal, and those land
     * PENDING. Every public read path goes through {@link #build} below, so the
     * filter is applied there rather than left to each caller to remember — an
     * unreviewed submission must never reach /api/v1/publications, the member
     * filter, or anything downstream of them.
     */
    public static Specification<Publication> approved() {
        return (root, query, cb) -> cb.equal(root.get("approvalStatus"), PublicationApproval.APPROVED);
    }

    /**
     * Everything a member may see about their own submissions — including the
     * PENDING and REJECTED ones the public never sees. Matched on authorship or
     * on who submitted it, so a member keeps sight of a submission even if the
     * authorship rows are edited afterwards.
     */
    public static Specification<Publication> ownedBy(UUID memberId) {
        return (root, query, cb) -> {
            Join<Publication, Member> authors = root.join("authors", JoinType.LEFT);
            query.distinct(true);
            return cb.or(
                    cb.equal(authors.get("id"), memberId),
                    cb.equal(root.get("submittedBy"), memberId));
        };
    }

    public static Specification<Publication> build(
            String q,
            Integer yearFrom,
            Integer yearTo,
            Set<UUID> memberIds,
            Set<PublicationStatus> statuses,
            Set<PublicationType> types,
            Boolean hasDoi
    ) {
        // Not optional and not a parameter: this is the public search, so the
        // approval filter is the first thing ANDed in and nothing a caller
        // passes can widen it.
        Specification<Publication> spec = approved();

        if (q != null && !q.isBlank()) {
            String like = "%" + q.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), like),
                    cb.like(cb.lower(root.get("venue")), like),
                    cb.like(cb.lower(root.get("abstractText")), like)
            ));
        }
        if (yearFrom != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("year"), yearFrom.shortValue()));
        }
        if (yearTo != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("year"), yearTo.shortValue()));
        }
        if (memberIds != null && !memberIds.isEmpty()) {
            spec = spec.and((root, query, cb) -> {
                Join<Publication, Member> join = root.join("authors", JoinType.INNER);
                query.distinct(true);
                return join.get("id").in(memberIds);
            });
        }
        if (statuses != null && !statuses.isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("status").in(statuses));
        }
        if (types != null && !types.isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("type").in(types));
        }
        if (hasDoi != null) {
            spec = spec.and(hasDoi
                    ? (root, query, cb) -> cb.isNotNull(root.get("doi"))
                    : (root, query, cb) -> cb.isNull(root.get("doi")));
        }
        return spec;
    }
}
