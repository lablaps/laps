package br.uema.laps.project;

import br.uema.laps.area.ResearchArea;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "project")
@Getter
@Setter
@NoArgsConstructor
public class Project {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status;

    /** Year the project was published / completed. Optional — long-running projects may leave it null. */
    @Column(name = "year")
    private Short year;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> tags = new ArrayList<>();

    /**
     * Optional external link to the published article, dataset, or project page.
     * When present, the /projects card surfaces a "Learn more" CTA pointing here.
     */
    @Column(name = "article_url", length = 500)
    private String articleUrl;

    @Column(name = "title_pt", columnDefinition = "text")
    private String titlePt;

    @Column(name = "description_pt", columnDefinition = "text")
    private String descriptionPt;

    @Column(name = "title_en", columnDefinition = "text")
    private String titleEn;

    @Column(name = "description_en", columnDefinition = "text")
    private String descriptionEn;

    @Column(name = "title_fr", columnDefinition = "text")
    private String titleFr;

    @Column(name = "description_fr", columnDefinition = "text")
    private String descriptionFr;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "project_area",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "area_id")
    )
    private Set<ResearchArea> areas;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<MemberProject> leaders = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    void touch() {
        this.updatedAt = Instant.now();
    }
}
