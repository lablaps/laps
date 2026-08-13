-- Invalidate every password hash that was derived from the old deterministic
-- formula `laps@{slug}#{last4uuid}`.
--
-- That formula used only the member's slug and id, both of which
-- GET /api/v1/members publishes to anonymous callers — so any un-rotated
-- account could be taken over by computing the password from the public
-- roster. Rotating the code alone is not enough: the *hashes already stored*
-- are hashes of those guessable values and stay valid until removed.
--
-- `must_change_password = TRUE` is exactly the set that never rotated, so it
-- identifies the compromised rows precisely. Members who already chose their
-- own password have `must_change_password = FALSE` and are left untouched —
-- their credential was never derivable.
--
-- Nulling the hash fails closed: AuthController rejects a null hash, so these
-- accounts cannot authenticate at all until a coordinator issues a new random
-- password via POST /api/v1/admin/members/{id}/reset-password. That is
-- deliberate — a locked account is recoverable, a publicly-guessable one is not.

UPDATE member
   SET password_hash        = NULL,
       must_change_password = TRUE,
       updated_at           = CURRENT_TIMESTAMP
 WHERE must_change_password = TRUE
   AND password_hash IS NOT NULL;
