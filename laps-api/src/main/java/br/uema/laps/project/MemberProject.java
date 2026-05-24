package br.uema.laps.project;

import br.uema.laps.member.Member;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "member_project")
@Getter
@Setter
@NoArgsConstructor
@IdClass(MemberProject.MemberProjectId.class)
public class MemberProject {

    @Id
    @Column(name = "project_id")
    private UUID projectId;

    @Id
    @Column(name = "member_id")
    private UUID memberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", insertable = false, updatable = false)
    @JsonBackReference
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id", insertable = false, updatable = false)
    private Member member;

    @Column(nullable = false)
    private String role; // "LEAD", "CO_LEAD", "RESEARCHER"

    public MemberProject(UUID projectId, UUID memberId, String role) {
        this.projectId = projectId;
        this.memberId = memberId;
        this.role = role;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class MemberProjectId implements Serializable {
        private UUID projectId;
        private UUID memberId;

        public MemberProjectId(UUID projectId, UUID memberId) {
            this.projectId = projectId;
            this.memberId = memberId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            MemberProjectId that = (MemberProjectId) o;
            return Objects.equals(projectId, that.projectId) &&
                   Objects.equals(memberId, that.memberId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(projectId, memberId);
        }
    }
}
