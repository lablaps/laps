package br.uema.laps.publication;

import br.uema.laps.member.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "publication")
@Getter
@Setter
@NoArgsConstructor
public class Publication {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, columnDefinition = "text")
    private String title;

    @Column(nullable = false)
    private String venue;

    @Column(nullable = false)
    private short year;

    private String doi;
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PublicationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PublicationStatus status;

    @Column(columnDefinition = "text")
    private String abstractText;

    @ManyToMany
    @JoinTable(
        name = "authorship",
        joinColumns = @JoinColumn(name = "publication_id"),
        inverseJoinColumns = @JoinColumn(name = "member_id")
    )
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Set<Member> authors = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    void touch() {
        this.updatedAt = Instant.now();
    }
}
