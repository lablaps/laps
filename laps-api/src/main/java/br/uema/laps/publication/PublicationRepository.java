package br.uema.laps.publication;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface PublicationRepository
        extends JpaRepository<Publication, UUID>, JpaSpecificationExecutor<Publication> {

    /** The approval queue, oldest submission first — nothing should sit at the back forever. */
    List<Publication> findByApprovalStatusOrderByCreatedAtAsc(PublicationApproval approvalStatus);

    /**
     * Attaches a member as an author.
     *
     * <p>Native rather than {@code publication.getAuthors().add(member)} because
     * the {@code authorship} table carries two columns the {@code @ManyToMany}
     * mapping does not know about — {@code author_order SMALLINT NOT NULL} (no
     * default) and {@code author_role} — so the mapping's INSERT would be
     * rejected by the NOT NULL constraint. The table also holds external
     * co-authors as rows with a null {@code member_id}, which no entity mapping
     * of a primary-key-less table would survive; a targeted insert sidesteps
     * both problems without remodelling the table.
     */
    @Modifying
    @Query(value = """
            INSERT INTO authorship (publication_id, member_id, external_author_name, author_order, author_role)
            VALUES (:publicationId, :memberId, NULL, :authorOrder, :authorRole)
            """, nativeQuery = true)
    void addMemberAuthor(
            @Param("publicationId") UUID publicationId,
            @Param("memberId") UUID memberId,
            @Param("authorOrder") short authorOrder,
            @Param("authorRole") String authorRole);

    /**
     * A co-author who is not in the roster — someone from another lab or
     * institution. {@code member_id} is a SQL literal NULL rather than a bound
     * parameter so the driver never has to infer a type for a null UUID; the
     * same reason {@link #addMemberAuthor} hard-codes the null name.
     */
    @Modifying
    @Query(value = """
            INSERT INTO authorship (publication_id, member_id, external_author_name, author_order, author_role)
            VALUES (:publicationId, NULL, :externalAuthorName, :authorOrder, :authorRole)
            """, nativeQuery = true)
    void addExternalAuthor(
            @Param("publicationId") UUID publicationId,
            @Param("externalAuthorName") String externalAuthorName,
            @Param("authorOrder") short authorOrder,
            @Param("authorRole") String authorRole);

    /** The portal's one-author case: the submitter, first in the list, plain AUTHOR. */
    default void addAuthor(UUID publicationId, UUID memberId, short authorOrder) {
        addMemberAuthor(publicationId, memberId, authorOrder, "AUTHOR");
    }

    /**
     * Wipes the author list so a caller can write the new one.
     *
     * <p>Replace-all rather than diffing: {@code authorship} has no primary key
     * and carries {@code author_order}, so "move the third author to first" has
     * no update to express — every edit rewrites the sequence anyway.
     */
    @Modifying
    @Query(value = "DELETE FROM authorship WHERE publication_id = :publicationId", nativeQuery = true)
    void deleteAuthorsByPublicationId(@Param("publicationId") UUID publicationId);

    /**
     * Author rows for a batch of publications — one query for the whole admin
     * list rather than one per row.
     *
     * <p>Aliases are quoted so Postgres keeps the camel case the projection
     * binds by; unquoted they come back folded to lower case and every getter
     * reads null.
     */
    @Query(value = """
            SELECT publication_id       AS "publicationId",
                   member_id            AS "memberId",
                   external_author_name AS "externalAuthorName",
                   author_order         AS "authorOrder",
                   author_role          AS "authorRole"
            FROM authorship
            WHERE publication_id IN (:publicationIds)
            ORDER BY publication_id, author_order
            """, nativeQuery = true)
    List<AuthorRow> findAuthorRows(@Param("publicationIds") Collection<UUID> publicationIds);

    /** One row of {@code authorship}: either a member or an external name, never both. */
    interface AuthorRow {
        UUID getPublicationId();

        UUID getMemberId();

        String getExternalAuthorName();

        /** Boxed because the driver may hand back an Integer for a SMALLINT. */
        Short getAuthorOrder();

        String getAuthorRole();
    }
}
