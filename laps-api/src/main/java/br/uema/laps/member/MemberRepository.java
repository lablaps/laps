package br.uema.laps.member;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MemberRepository extends JpaRepository<Member, UUID>, JpaSpecificationExecutor<Member> {
    @Override
    @EntityGraph(attributePaths = "permissions")
    Optional<Member> findById(UUID id);

    @EntityGraph(attributePaths = "permissions")
    Optional<Member> findBySlug(String slug);

    @EntityGraph(attributePaths = "permissions")
    Optional<Member> findByEmailIgnoreCase(String email);

    List<Member> findAllByDeletedAtIsNull(Pageable pageable);

    boolean existsByEmailIgnoreCase(String email);
}
