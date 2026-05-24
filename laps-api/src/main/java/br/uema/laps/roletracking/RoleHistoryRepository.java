package br.uema.laps.roletracking;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoleHistoryRepository extends JpaRepository<RoleHistory, Long> {
    Optional<RoleHistory> findByMemberIdAndEndedAtIsNull(UUID memberId);
    List<RoleHistory> findByMemberIdOrderByStartedAtAsc(UUID memberId);
}
