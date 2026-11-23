package br.uema.laps.roletracking;

import br.uema.laps.member.MemberRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

// Append-only role transitions. Invariants in /home/user/ICARO/Icaro de Jesus/01-projects/laps/laps-role-tracking.md
@Entity
@Table(name = "role_history")
@Getter
@Setter
@NoArgsConstructor
public class RoleHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Enumerated(EnumType.STRING)
    @Column(name = "member_role", nullable = false)
    private MemberRole role;

    @Column(name = "started_at", nullable = false)
    private LocalDate startedAt;

    @Column(name = "ended_at")
    private LocalDate endedAt;

    @Column(columnDefinition = "text")
    private String reason;

    @Column(name = "recorded_by")
    private UUID recordedBy;
}
