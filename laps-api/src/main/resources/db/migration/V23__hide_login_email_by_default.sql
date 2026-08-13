-- Hide the login email from public profiles by default.
--
-- V19 created show_email with DEFAULT TRUE. That column governs the *login*
-- address ("email de login e recuperação" in the portal), not the separately
-- editable public contact address — publishing a credential identifier to
-- anonymous callers by default is the wrong posture for a roster covered by
-- the LGPD. Members opt in instead of opting out; anyone wanting a public
-- address fills in contact_email, which the profile page prefers anyway.
--
-- Why this is a NEW migration rather than an edit to V19: V19 has already been
-- applied in production, and Flyway validates the checksum of every applied
-- migration. Editing it in place made the API refuse to boot with
-- "Migration checksum mismatch for migration version 19". Corrections to
-- applied migrations only ever move forward.
--
-- The UPDATE flips rows that V19 created as TRUE. That is safe here precisely
-- because it follows V19 so closely: the visibility toggles have not yet been
-- through a release where a member could have deliberately chosen to publish
-- their login email, so there is no considered choice to overwrite. The other
-- five flags (links) keep DEFAULT TRUE — those are published on purpose.

ALTER TABLE member ALTER COLUMN show_email SET DEFAULT FALSE;

UPDATE member
   SET show_email = FALSE,
       updated_at = CURRENT_TIMESTAMP
 WHERE show_email = TRUE;
