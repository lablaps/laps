CREATE TABLE invite_tokens (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    token       UUID            NOT NULL UNIQUE,
    role        VARCHAR(30)     NOT NULL,
    expires_at  TIMESTAMPTZ     NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    used_at     TIMESTAMPTZ,
    created_by  UUID            NOT NULL REFERENCES member(id),
    used_by     UUID            REFERENCES member(id)
);
