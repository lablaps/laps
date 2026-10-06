CREATE TABLE impact (
    id UUID PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES member(id),
    kind VARCHAR(40) NOT NULL CHECK (kind IN ('SCHOLARSHIP', 'DOCTORAL_SCHOLARSHIP', 'INTERNATIONAL', 'CONTRIBUTION', 'AWARD', 'OTHER')),
    occurred_on DATE NOT NULL,
    details JSONB NOT NULL,
    search_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT impact_tools_limit CHECK (jsonb_array_length(details->'tools') <= 10)
);
CREATE INDEX impact_member_date_idx ON impact(member_id, occurred_on DESC, id DESC) WHERE deleted_at IS NULL;
CREATE INDEX impact_kind_date_idx ON impact(kind, occurred_on DESC, id DESC) WHERE deleted_at IS NULL;
CREATE INDEX impact_date_idx ON impact(occurred_on DESC, id DESC) WHERE deleted_at IS NULL;
