-- Store bearer tokens as hashes instead of plaintext.
--
-- Both columns held a credential verbatim:
--
--   invite_tokens.token              a UUID that redeems to a NEW ACTIVE MEMBER
--                                    at whatever role the invite carries — up to
--                                    HEAD or COORDINATOR
--   member.email_verification_token  proves control of an address, and a verified
--                                    address is what gates a voluntary password
--                                    change
--
-- Anyone who can read the database — a backup file, a replica, a support
-- session, or an injection that only manages a SELECT — could therefore mint
-- accounts and verify addresses without ever touching the application. Storing
-- the hash means a database read yields nothing redeemable: the server hashes
-- what the caller presents and compares.
--
-- SHA-256 with no salt or stretching is the right primitive here, unlike for
-- passwords. These are 122- and 256-bit random values, so there is no dictionary
-- to attack and nothing to slow down; a slow KDF would only cost latency on
-- every invite lookup. Unsalted also keeps the lookup a plain indexed equality.
--
-- Existing rows are converted in place rather than invalidated, so invites and
-- verification links already in someone's inbox keep working.

-- ── invite_tokens ────────────────────────────────────────────────────────
-- VARCHAR, not CHAR: the entity maps this as a plain String, and Hibernate's
-- ddl-auto=validate rejects bpchar against a varchar mapping — the app would
-- refuse to start. CHAR would also pad with spaces, which is a poor fit for a
-- value compared for exact equality.
ALTER TABLE invite_tokens ADD COLUMN token_hash VARCHAR(64);

UPDATE invite_tokens
   SET token_hash = encode(sha256(convert_to(token::text, 'UTF8')), 'hex');

ALTER TABLE invite_tokens ALTER COLUMN token_hash SET NOT NULL;
ALTER TABLE invite_tokens ADD CONSTRAINT uq_invite_tokens_token_hash UNIQUE (token_hash);

-- The plaintext column is what this migration exists to remove. Dropping it
-- also drops its UNIQUE constraint and index.
ALTER TABLE invite_tokens DROP COLUMN token;

-- ── member.email_verification_token ──────────────────────────────────────
-- Renamed as well as rehashed: a column called `..._token` holding a digest is
-- the kind of thing that gets compared against a plaintext value by the next
-- person to touch it.
ALTER TABLE member RENAME COLUMN email_verification_token TO email_verification_token_hash;

UPDATE member
   SET email_verification_token_hash =
       encode(sha256(convert_to(email_verification_token_hash, 'UTF8')), 'hex')
 WHERE email_verification_token_hash IS NOT NULL
   AND email_verification_token_hash <> '';

-- 64 hex characters, down from the 80 the base64url plaintext needed.
ALTER TABLE member ALTER COLUMN email_verification_token_hash TYPE VARCHAR(64);
