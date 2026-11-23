-- Make the login email unique the way the application actually reads it.
--
-- member.email has carried a plain UNIQUE since V1, which Postgres evaluates
-- case-sensitively, while every lookup in the codebase is IgnoreCase
-- (MemberRepository.findByEmailIgnoreCase, ManagerAllowlist.isManager). Those
-- two facts together were a privilege escalation, not a style inconsistency:
--
--   * ManagerAllowlist grants MANAGER by lower-casing member.email and looking
--     it up in LAPS_MANAGER_EMAILS, and JwtAuthFilter recomputes that on every
--     request. The profile email is self-service.
--   * 'Coord@uema.br' did not collide with 'coord@uema.br' under the old
--     constraint, so "that address is taken" was not the barrier it appeared
--     to be. Any member could take a coordinator's identity by changing case.
--
-- MyPortalController now normalises on write and refuses both allowlisted
-- addresses and case-insensitive collisions, and InviteController does the same
-- at registration. This migration is the half that does not depend on every
-- future write path remembering to ask.

-- 1. '' is not "no address" — it is a value, and the second member to save it
--    collides with the first. Nothing reads it as an address either.
UPDATE member SET email = NULL WHERE email = '';

-- 2. Bring existing rows in line with what the application now writes. Safe for
--    logins: resolution was already case-insensitive, so nobody's credentials
--    change meaning here.
UPDATE member
   SET email = lower(email)
 WHERE email IS NOT NULL
   AND email <> lower(email);

-- 3. The constraint itself.
--
--    IF THIS MIGRATION FAILS, IT HAS FOUND SOMETHING. Two members whose
--    addresses differ only in case cannot both survive, and picking which one
--    keeps the address is not a decision a migration should make silently — a
--    wrong guess locks a real person out of their account. Startup halting is
--    the intended outcome. To resolve, find them:
--
--      SELECT lower(email), count(*), array_agg(id) FROM member
--       WHERE email IS NOT NULL GROUP BY 1 HAVING count(*) > 1;
--
--    then decide per pair who owns the address (check role, created_at, and
--    whether email_verified is set), clear the loser's email, and redeploy.
--    Treat a collision on an address in LAPS_MANAGER_EMAILS as an incident:
--    that is what a successful escalation looks like from the database side.
--
--    The V1 constraint stays. Once every row is lower-case the two are
--    equivalent, and dropping a constraint by a name Postgres generated is a
--    worse bet than leaving a redundant one in place.
CREATE UNIQUE INDEX member_email_lower_key ON member (lower(email));
