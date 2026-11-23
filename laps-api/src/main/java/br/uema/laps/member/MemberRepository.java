package br.uema.laps.member;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MemberRepository extends JpaRepository<Member, UUID>, JpaSpecificationExecutor<Member> {
    @Override
    @EntityGraph(attributePaths = "permissions")
    Optional<Member> findById(UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from Member m where m.id = :id")
    Optional<Member> findByIdForUpdate(@Param("id") UUID id);

    @EntityGraph(attributePaths = "permissions")
    Optional<Member> findBySlug(String slug);

    @EntityGraph(attributePaths = "permissions")
    Optional<Member> findByEmailIgnoreCase(String email);

    List<Member> findAllByDeletedAtIsNull(Pageable pageable);

    boolean existsByEmailIgnoreCase(String email);
}
