package br.uema.laps.impact;

import br.uema.laps.member.Member;
import br.uema.laps.portal.PortalWriteGuard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;

@Service
public class ImpactService {
    private final ImpactRepository repository;
    private final PortalWriteGuard writeGuard;

    public ImpactService(ImpactRepository repository, PortalWriteGuard writeGuard) {
        this.repository = repository;
        this.writeGuard = writeGuard;
    }

    @Transactional(readOnly = true)
    public Page<ImpactView> list(UUID memberId, ImpactKind kind, LocalDate from, LocalDate to,
                                 String q, int page, int size) {
        if (page < 0 || size < 1 || size > 100 || (from != null && to != null && from.isAfter(to))
                || (q != null && q.length() > 200)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid impact filters");
        }
        Specification<Impact> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            predicates.add(cb.isNull(root.get("deletedAt")));
            predicates.add(cb.isNull(root.get("member").get("deletedAt")));
            if (memberId != null) predicates.add(cb.equal(root.get("member").get("id"), memberId));
            if (kind != null) predicates.add(cb.equal(root.get("kind"), kind));
            if (from != null) predicates.add(cb.greaterThanOrEqualTo(root.get("occurredOn"), from));
            if (to != null) predicates.add(cb.lessThanOrEqualTo(root.get("occurredOn"), to));
            if (q != null && !q.isBlank()) {
                String escaped = q.trim().toLowerCase(Locale.ROOT).replace("\\", "\\\\")
                        .replace("%", "\\%").replace("_", "\\_");
                predicates.add(cb.like(root.get("searchText"), "%" + escaped + "%", '\\'));
            }
            return cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
        return repository.findAll(spec, PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "occurredOn", "id"))).map(ImpactView::of);
    }

    @Transactional(readOnly = true)
    public ImpactView get(UUID id) {
        Impact impact = repository.findByIdAndDeletedAtIsNull(id).orElseThrow(ImpactService::notFound);
        if (impact.getMember().getDeletedAt() != null) throw notFound();
        return ImpactView.of(impact);
    }

    @Transactional
    public ImpactView save(UUID id, ImpactInput input) {
        Member me = writeGuard.requireRotatedPassword();
        if (me.getDeletedAt() != null) throw notFound();
        Impact impact = id == null ? new Impact() : owned(id, me.getId());
        for (var evidence : input.evidence()) validateUrl(evidence.url());
        impact.setMember(me);
        impact.setDetails(input);
        impact.setKind(input.kind());
        impact.setOccurredOn(input.occurredOn());
        impact.setUpdatedAt(Instant.now());
        String text = Stream.of(input.title(), input.outcome(), input.contribution(), input.role())
                .flatMap(t -> Stream.of(t.pt(), t.en(), t.fr())).filter(Objects::nonNull)
                .collect(java.util.stream.Collectors.joining(" "));
        impact.setSearchText((text + " " + Objects.toString(input.organization(), "") + " "
                + String.join(" ", input.tools()) + " " + String.join(" ", input.collaborators()) + " "
                + String.join(" ", input.supervisors())).toLowerCase(Locale.ROOT));
        return ImpactView.of(repository.save(impact));
    }

    @Transactional
    public void delete(UUID id) {
        Member me = writeGuard.requireRotatedPassword();
        if (me.getDeletedAt() != null) throw notFound();
        Impact impact = owned(id, me.getId());
        impact.setDeletedAt(Instant.now());
        repository.save(impact);
    }

    private Impact owned(UUID id, UUID memberId) {
        return repository.findByIdAndMemberIdAndDeletedAtIsNull(id, memberId).orElseThrow(ImpactService::notFound);
    }

    static void validateUrl(String raw) {
        try {
            URI uri = URI.create(raw);
            if (!("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))
                    || uri.getHost() == null || uri.getUserInfo() != null) throw new IllegalArgumentException();
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Evidence URL must use HTTP or HTTPS");
        }
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Impact not found");
    }
}
