-- Make the audit trail append-only at the database level.
--
-- Row-level security here is not about one member reading another's rows — see
-- the note at the bottom for why per-member read policies are a poor fit for
-- this schema. It is about the property the checklist actually cares about:
-- holding even when the application layer is bypassed.
--
-- audit_log records who changed what: password resets, role promotions, member
-- deletion. Its value depends entirely on an attacker not being able to edit it
-- afterwards. The application only ever INSERTs (AuditService.record) and
-- SELECTs (AdminController.audit) — nothing in the codebase updates or deletes
-- an audit row, so no legitimate behaviour is lost by making those impossible.
--
-- Policies grant exactly SELECT and INSERT. UPDATE and DELETE have no policy at
-- all, and under RLS an operation with no permissive policy is denied. FORCE is
-- what makes this bite: without it the table owner bypasses RLS entirely, and
-- the application connects as the owner.
--
-- RLS alone is not enough here, because a Postgres SUPERUSER bypasses it even
-- with FORCE — and the official postgres image creates POSTGRES_USER as a
-- superuser, which is exactly how docker-compose.yml provisions this app's
-- account. So the policies below would protect the Render deployment (whose
-- managed user is a non-superuser owner) and quietly do nothing for the
-- self-hosted one.
--
-- The trigger further down closes that gap: triggers fire for superusers too,
-- and it raises a loud exception instead of RLS's silent "0 rows affected".
-- Together they deny at the policy layer for an ordinary owner and at the
-- trigger layer for everyone else.

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;

CREATE POLICY audit_log_read ON audit_log
    FOR SELECT
    USING (true);

CREATE POLICY audit_log_append ON audit_log
    FOR INSERT
    WITH CHECK (true);

-- Deliberately no UPDATE or DELETE policy.
--
-- If a retention policy is ever needed, do not add a DELETE policy — that hands
-- the capability back to anything running as the app. Export and truncate from
-- a maintenance session instead, which is an explicit, auditable act.

-- ── Superuser-proof backstop ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION audit_log_is_append_only()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION
        'audit_log is append-only: % is not permitted', TG_OP
        USING HINT = 'Audit history is evidence. Export and truncate deliberately '
                     'in a maintenance session rather than mutating rows.';
END;
$$ LANGUAGE plpgsql;

-- Statement-level so a blanket "UPDATE audit_log" is refused even when it would
-- match no rows, and so the cost does not scale with the number of rows targeted.
CREATE TRIGGER audit_log_no_update
    BEFORE UPDATE ON audit_log
    EXECUTE FUNCTION audit_log_is_append_only();

CREATE TRIGGER audit_log_no_delete
    BEFORE DELETE ON audit_log
    EXECUTE FUNCTION audit_log_is_append_only();

-- TRUNCATE is intentionally left available: it is the documented escape hatch
-- above, it cannot be aimed at individual incriminating rows, and it is obvious
-- in a way that a targeted DELETE is not.

-- ── Why the other tables do not get per-member read policies ──────────────
--
-- The checklist asks for policies so "a user cannot read rows they do not own".
-- Applied to member, project, publication, member_project, research_area and
-- professor, that would be theatre: this application's purpose is publishing
-- those rows to anonymous visitors on the public site, so any workable policy
-- reduces to "allow everyone to read everything" and protects nothing while
-- appearing on a compliance list as done.
--
-- The rows with genuine ownership semantics are audit_log (above),
-- invite_tokens and role_history. For the latter two the meaningful protection
-- is not a read policy but removing what a database read is worth: V24 replaces
-- the redeemable invite token with a hash, so reading invite_tokens no longer
-- yields anything that can be spent.
--
-- Making member-row reads genuinely restricted would require the application to
-- stop connecting as the table owner and to set a per-request identity, which
-- changes the deployment's database credentials. That is a deliberate decision
-- to take rather than a migration to slip in.
