-- National mobility: a member on exchange inside Brazil is placed by state, not
-- just by country. V15 added exchange_country only, which collapsed every
-- domestic placement into a single undifferentiated "Brasil" bucket.
--
-- Nullable and unconstrained-by-default: the column is meaningless unless
-- exchange_country = 'BR', and the CHECK below is what keeps the two in step
-- rather than leaving a stale UF behind when someone is moved abroad.
ALTER TABLE member ADD COLUMN exchange_state varchar(2);

-- Two invariants in one constraint:
--   * a state may only be present when the country is Brazil;
--   * when present it must be one of the 27 UFs.
-- Written as a single CHECK so a row can never carry a state that contradicts
-- its country — the application enforces this too, but the table is what
-- outlives any one version of the application.
--
-- COALESCE rather than a bare `exchange_country = 'BR'`: for a member with no
-- country at all that comparison is NULL, not false, and a CHECK admits any row
-- it cannot prove false. The bare form therefore let (country NULL, state 'SP')
-- through — an orphan placement with no country to belong to.
ALTER TABLE member ADD CONSTRAINT member_exchange_state_valid CHECK (
    exchange_state IS NULL
    OR (
        COALESCE(exchange_country, '') = 'BR'
        AND exchange_state IN (
            'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
            'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
        )
    )
);
