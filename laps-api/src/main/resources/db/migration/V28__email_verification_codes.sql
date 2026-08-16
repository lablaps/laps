-- Email verification becomes a real proof of control.
--
-- The old flow generated a 256-bit token and handed it straight back to the
-- caller in the HTTP response, for a coordinator to read out. Whatever that
-- proved, it was not control of the mailbox: the member never had to open the
-- inbox to complete it. The token now becomes a 6-digit code that only exists
-- in the message the provider delivers (see EmailService).
--
-- Two consequences for this table.

-- 1. Attempt counter. Six digits is a 1-in-a-million guess, which is fine for a
--    code that dies after a handful of tries and 15 minutes, and useless
--    otherwise. The counter is what enforces the "handful": the fifth wrong
--    entry discards the code and the member has to request a new one. Rate
--    limiting alone cannot do this — it throttles a burst, it does not cap the
--    total attempts against one code.
ALTER TABLE member ADD COLUMN email_verification_attempts SMALLINT NOT NULL DEFAULT 0;

-- 2. Pending tokens are dropped. The column keeps its name and VARCHAR(64)
--    width (a BCrypt hash is 60 characters, so it still fits), but the contents
--    change meaning: V24 stored a SHA-256 digest, and codes are now stored as
--    BCrypt. SHA-256 was the right call for a 256-bit token — there is no
--    dictionary to attack — and the wrong one for six digits, where the entire
--    keyspace is a million SHA-256 calls away from anyone holding a database
--    dump. Mixing the two formats in one column would mean guessing which
--    algorithm produced a given row, so the in-flight ones go.
--
--    Nobody loses anything durable: these expire in 24h anyway, and the member
--    simply requests a new code. email_verified rows are untouched — an address
--    already confirmed stays confirmed.
UPDATE member
   SET email_verification_token_hash = NULL,
       email_verification_token_expires_at = NULL
 WHERE email_verification_token_hash IS NOT NULL;
