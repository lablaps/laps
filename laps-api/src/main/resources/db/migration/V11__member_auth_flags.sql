-- Per-member self-service auth.
ALTER TABLE member
    ADD COLUMN must_change_password BOOLEAN   NOT NULL DEFAULT TRUE,
    ADD COLUMN email_verified       BOOLEAN   NOT NULL DEFAULT FALSE,
    ADD COLUMN email_verification_token             VARCHAR(80),
    ADD COLUMN email_verification_token_expires_at  TIMESTAMP;

UPDATE member
   SET must_change_password = FALSE
 WHERE password_hash IS NOT NULL
   AND password_hash <> '';
