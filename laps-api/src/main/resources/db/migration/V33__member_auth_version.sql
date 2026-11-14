ALTER TABLE member
    ADD COLUMN auth_version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE member
    ADD CONSTRAINT member_auth_version_nonnegative
    CHECK (auth_version >= 0);
