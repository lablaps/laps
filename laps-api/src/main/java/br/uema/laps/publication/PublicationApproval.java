package br.uema.laps.publication;

/**
 * Moderation state of a publication record — deliberately separate from
 * {@link PublicationStatus}, which describes the research itself (PUBLISHED,
 * IN_PRESS, …). A paper can be IN_PRESS and APPROVED, or PUBLISHED and still
 * PENDING because nobody has checked the member's submission yet.
 *
 * <p>Only APPROVED rows are visible on the public site; see
 * {@link PublicationSpecifications}.
 */
public enum PublicationApproval {
    /** Submitted from the member portal, awaiting a manager. Not public. */
    PENDING,
    /** Entered by a manager, or a submission a manager accepted. Public. */
    APPROVED,
    /** Turned down. Kept, with the reason, so the member can see what happened. */
    REJECTED
}
