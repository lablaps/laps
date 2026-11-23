package br.uema.laps.publication;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * The public search must never return a publication that has not been approved.
 *
 * <p>Members can submit publications from the portal, and those rows sit in the
 * same table as the lab's public record. The filter therefore lives inside
 * {@link PublicationSpecifications#build} rather than in the controller: a
 * future caller of build() cannot forget it, and no request parameter can widen
 * it. These tests pin that — they fail if the approval predicate is ever moved
 * back out to the caller or made conditional.
 */
class PublicationVisibilityTest {

    private Root<Publication> root;
    private CriteriaQuery<?> query;
    private CriteriaBuilder cb;
    private Path<Object> approvalPath;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        root = mock(Root.class);
        query = mock(CriteriaQuery.class);
        cb = mock(CriteriaBuilder.class);

        approvalPath = mock(Path.class);
        Path<Object> anyPath = mock(Path.class);
        Join<Publication, ?> join = mock(Join.class);
        Predicate predicate = mock(Predicate.class);

        when(root.get("approvalStatus")).thenReturn(approvalPath);
        when(root.get(anyString())).thenReturn(anyPath);
        when(root.get("approvalStatus")).thenReturn(approvalPath);
        when(root.join(anyString(), any(JoinType.class))).thenReturn((Join) join);
        when(join.get(anyString())).thenReturn(anyPath);

        when(cb.equal(any(Expression.class), any())).thenReturn(predicate);
        when(cb.and(any(Predicate.class), any(Predicate.class))).thenReturn(predicate);
        when(cb.or(any(Predicate.class), any(Predicate.class))).thenReturn(predicate);
        when(cb.conjunction()).thenReturn(predicate);
        when(cb.lower(any())).thenReturn(mock(Expression.class));
        when(cb.like(any(), anyString())).thenReturn(predicate);
        when(cb.isNotNull(any())).thenReturn(predicate);
        when(cb.isNull(any())).thenReturn(predicate);
        when(cb.greaterThanOrEqualTo(any(), any(Short.class))).thenReturn(predicate);
        when(cb.lessThanOrEqualTo(any(), any(Short.class))).thenReturn(predicate);
    }

    @Test
    @DisplayName("an unfiltered public search still restricts to approved rows")
    void bareSearchIsRestricted() {
        PublicationSpecifications.build(null, null, null, null, null, null, null)
                .toPredicate(root, query, cb);

        verify(cb).equal(approvalPath, PublicationApproval.APPROVED);
    }

    @Test
    @DisplayName("the restriction survives every other filter being applied at once")
    void restrictionSurvivesOtherFilters() {
        PublicationSpecifications.build(
                        "wavelet",
                        2020,
                        2026,
                        Set.of(UUID.randomUUID()),
                        Set.of(PublicationStatus.PUBLISHED),
                        Set.of(PublicationType.JOURNAL),
                        true)
                .toPredicate(root, query, cb);

        verify(cb).equal(approvalPath, PublicationApproval.APPROVED);
    }

    @Test
    @DisplayName("a member's own view is NOT restricted — they see their pending and rejected entries")
    void ownViewIsUnrestricted() {
        PublicationSpecifications.ownedBy(UUID.randomUUID())
                .toPredicate(root, query, cb);

        verify(cb, org.mockito.Mockito.never()).equal(approvalPath, PublicationApproval.APPROVED);
    }
}
