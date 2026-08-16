package br.uema.laps.publication;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface PublicationRepository
        extends JpaRepository<Publication, UUID>, JpaSpecificationExecutor<Publication> {

    /** The approval queue, oldest submission first — nothing should sit at the back forever. */
    java.util.List<Publication> findByApprovalStatusOrderByCreatedAtAsc(PublicationApproval approvalStatus);

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
            VALUES (:publicationId, :memberId, NULL, :authorOrder, 'AUTHOR')
            """, nativeQuery = true)
    void addAuthor(
            @Param("publicationId") UUID publicationId,
            @Param("memberId") UUID memberId,
            @Param("authorOrder") short authorOrder);
}
