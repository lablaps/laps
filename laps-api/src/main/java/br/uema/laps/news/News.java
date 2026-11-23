package br.uema.laps.news;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * One news card. Schema and rationale: V34__news.sql.
 *
 * <p>People are held as member ids rather than a {@code @ManyToMany} to
 * {@code Member}: the public view needs only a handful of public fields, and
 * resolving a whole page's people in one roster query (NewsService) is cheaper
 * and safer than letting Jackson walk into a Member entity's private fields.
 *
 * <p>The collections are {@code @BatchSize}d so a page of N items loads its
 * categories and people in a few IN-queries instead of 2N single-row selects.
 */
@Entity
@Table(name = "news")
@Getter
@Setter
@NoArgsConstructor
public class News {

    @Id
    private UUID id;

    @Column(name = "title_pt", nullable = false, length = 200)
    private String titlePt;
    @Column(name = "title_en", length = 200)
    private String titleEn;
    @Column(name = "title_fr", length = 200)
    private String titleFr;

    @Column(name = "subtitle_pt", length = 400)
    private String subtitlePt;
    @Column(name = "subtitle_en", length = 400)
    private String subtitleEn;
    @Column(name = "subtitle_fr", length = 400)
    private String subtitleFr;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "link_url", length = 2000)
    private String linkUrl;

    @Column(name = "published_on", nullable = false)
    private LocalDate publishedOn;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags", nullable = false, columnDefinition = "jsonb")
    private List<String> tags = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "news_category", joinColumns = @JoinColumn(name = "news_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    @BatchSize(size = 50)
    private Set<NewsCategory> categories = EnumSet.noneOf(NewsCategory.class);

    @ElementCollection
    @CollectionTable(name = "news_member", joinColumns = @JoinColumn(name = "news_id"))
    @OrderColumn(name = "position")
    @Column(name = "member_id", nullable = false)
    @BatchSize(size = 50)
    private List<UUID> memberIds = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
