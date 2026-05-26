package br.uema.laps.invite;

import br.uema.laps.member.MemberRole;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "invite_tokens")
@Getter
@Setter
@NoArgsConstructor
public class InviteToken {

    @Id
    @GeneratedValue
    private UUID id;

    @JsonIgnore
    @Column(nullable = false, unique = true)
    private UUID token;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MemberRole role;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "used_by")
    private UUID usedBy;
}
