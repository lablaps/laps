package br.uema.laps.project;

import br.uema.laps.member.Member;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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

    /**
     * Nested member shown as a project leader/participant. Only identity and
     * avatar are needed here, so the contact block is stripped — otherwise
     * /api/v1/projects would republish an email that the member deliberately
     * hid from /api/v1/members, routing around the visibility flags.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({
            "email", "contactEmail", "linkedinUrl", "lattesUrl", "githubUrl",
            "customUrl", "customUrlLabel", "roadmap",
            "showEmail", "showContactEmail", "showLinkedin",
            "showLattes", "showGithub", "showCustomUrl"
    })
    private Member member;

    @Column(nullable = false)
    private String role; // "LEAD", "CO_LEAD", "RESEARCHER"

    /** Free text: what this member actually did on the project. Self-service, unlike {@link #role}. */
    @Column(length = 1000)
    private String contribution;

    public MemberProject(UUID projectId, UUID memberId, String role) {
        this.projectId = projectId;
        this.memberId = memberId;
        this.role = role;
    }

    public MemberProject(UUID projectId, UUID memberId, String role, String contribution) {
        this.projectId = projectId;
        this.memberId = memberId;
        this.role = role;
        this.contribution = contribution;
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
