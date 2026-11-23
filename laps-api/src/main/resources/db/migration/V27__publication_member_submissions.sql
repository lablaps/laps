-- Self-service publication submissions.
--
-- Members (undergraduates included — that is the point of this change) may now
-- submit a publication from the portal instead of asking a manager to enter it.
-- Projects stay closed to undergrads; publications are the member's own
-- authorship claim, not the lab's project record.
--
-- Moderation state is a NEW column rather than a reuse of publication.status.
-- That column already means something else — the research lifecycle
-- (PUBLISHED / IN_PROGRESS / COMPLETED / IN_PRESS) — and a paper that is
-- genuinely IN_PRESS is a different fact from a submission a manager has not
-- looked at yet. Folding the two together would make "awaiting review"
-- unrepresentable for anything except in-progress work, and would silently
-- change the meaning of every existing row.
ALTER TABLE publication ADD COLUMN approval_status varchar(20) NOT NULL DEFAULT 'APPROVED';

-- DEFAULT 'APPROVED' is doing the backfill: every publication that exists today
-- was entered by a manager and is already on the public site. Defaulting to
-- PENDING would retroactively unpublish the lab's entire research record the
-- moment this migration ran.
--
-- New rows from the portal set PENDING explicitly; the admin create path keeps
-- writing APPROVED, since a manager entering a publication *is* the approval.
ALTER TABLE publication ADD CONSTRAINT publication_approval_status_valid
    CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED'));

-- Who submitted it, and who ruled on it. ON DELETE SET NULL on both: a
-- publication outlives the membership of the person who typed it in, and losing
-- the submitter must never cascade into deleting the lab's research record.
ALTER TABLE publication ADD COLUMN submitted_by uuid
    REFERENCES member(id) ON DELETE SET NULL;
ALTER TABLE publication ADD COLUMN reviewed_by uuid
    REFERENCES member(id) ON DELETE SET NULL;
ALTER TABLE publication ADD COLUMN reviewed_at timestamp;

-- Why a submission was turned down, shown back to the member in the portal so a
-- rejection is actionable ("wrong venue", "duplicate of #123") rather than a
-- silent disappearance.
ALTER TABLE publication ADD COLUMN review_note text;

-- The public list filters on this column on every request, and the approval
-- queue reads the PENDING slice. Partial index: PENDING is a handful of rows
-- against a table that is overwhelmingly APPROVED.
CREATE INDEX idx_publication_approval_pending
    ON publication (approval_status)
    WHERE approval_status <> 'APPROVED';
