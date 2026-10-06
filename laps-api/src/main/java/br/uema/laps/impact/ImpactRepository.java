package br.uema.laps.impact;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface ImpactRepository extends JpaRepository<Impact, UUID>, JpaSpecificationExecutor<Impact> {
    @Override @EntityGraph(attributePaths = "member")
    Page<Impact> findAll(Specification<Impact> spec, Pageable pageable);
    @EntityGraph(attributePaths = "member")
    Optional<Impact> findByIdAndDeletedAtIsNull(UUID id);
    @EntityGraph(attributePaths = "member")
    Optional<Impact> findByIdAndMemberIdAndDeletedAtIsNull(UUID id, UUID memberId);
}
