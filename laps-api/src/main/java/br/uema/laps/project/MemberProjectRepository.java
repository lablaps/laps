package br.uema.laps.project;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface MemberProjectRepository extends JpaRepository<MemberProject, MemberProject.MemberProjectId> {
    List<MemberProject> findByMemberId(UUID memberId);
    List<MemberProject> findByProjectId(UUID projectId);
    void deleteByMemberId(UUID memberId);
    void deleteByProjectId(UUID projectId);
}
