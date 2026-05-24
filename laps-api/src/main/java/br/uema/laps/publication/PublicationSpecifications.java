package br.uema.laps.publication;

import br.uema.laps.member.Member;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.Set;
import java.util.UUID;

public final class PublicationSpecifications {

    private PublicationSpecifications() {}

    public static Specification<Publication> build(
            String q,
            Integer yearFrom,
            Integer yearTo,
            Set<UUID> memberIds,
            Set<PublicationStatus> statuses,
            Set<PublicationType> types,
            Boolean hasDoi
    ) {
        Specification<Publication> spec = (root, query, cb) -> cb.conjunction();

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
