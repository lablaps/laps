-- V34 — Notícias (news)
--
-- News becomes the public site's main navigation: a feed of cards, each with
-- an image, a title, a subtitle, tags, the people involved and an optional
-- link out (an article on uema.br, a CAPES result, a conference page). There
-- is deliberately no body text and no detail page — the card is the item.
--
-- Prizes and scholarships live here too. They used to be a separate "impact"
-- record with a dozen structured fields per entry; the lab decided that a
-- prize is a news item with the right tags, so "Prêmios e Bolsas" becomes a
-- filtered view of this table (category AWARD or SCHOLARSHIP) and the impact
-- table is removed in a later migration.
--
-- Shape:
--   news            one row per card. Title is trilingual with Portuguese
--                   required; EN/FR are optional and the SPA falls back to PT.
--                   tags is free text (JSONB array, same as project.tags) —
--                   display only, never filtered on.
--   news_category   the fixed, translatable, *filterable* tags: AWARD,
--                   SCHOLARSHIP, NATIONAL, INTERNATIONAL. A separate table
--                   rather than JSONB so "prizes and scholarships" is an
--                   indexed join, not a JSON operator the JPA layer cannot
--                   express.
--   news_member     the people on the card, in the order the manager listed
--                   them (position). A member who is later soft-deleted keeps
--                   the row but is dropped from the public view by the API;
--                   a hard-deleted member takes the row with them.
--
-- Writes are manager-only (/api/v1/admin/news) and audited; reads are public.

CREATE TABLE news (
    id           UUID PRIMARY KEY,
    title_pt     VARCHAR(200) NOT NULL,
    title_en     VARCHAR(200),
    title_fr     VARCHAR(200),
    subtitle_pt  VARCHAR(400),
    subtitle_en  VARCHAR(400),
    subtitle_fr  VARCHAR(400),
    image_url    VARCHAR(500),
    link_url     VARCHAR(2000),
    published_on DATE NOT NULL,
    tags         JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at   TIMESTAMPTZ NOT NULL,
    updated_at   TIMESTAMPTZ NOT NULL,
    CONSTRAINT news_tags_is_array CHECK (jsonb_typeof(tags) = 'array'),
    CONSTRAINT news_tags_limit    CHECK (jsonb_array_length(tags) <= 12)
);

-- The feed is always read newest first; id breaks ties for stable paging.
CREATE INDEX news_published_idx ON news (published_on DESC, id DESC);

CREATE TABLE news_category (
    news_id  UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    category VARCHAR(30) NOT NULL
        CHECK (category IN ('AWARD', 'SCHOLARSHIP', 'NATIONAL', 'INTERNATIONAL')),
    PRIMARY KEY (news_id, category)
);

CREATE INDEX news_category_category_idx ON news_category (category);

CREATE TABLE news_member (
    news_id   UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES member(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    -- Keyed by position, which is how Hibernate maps an @OrderColumn list.
    -- Deliberately no UNIQUE (news_id, member_id): reordering an indexed list
    -- is written as in-place row updates, so swapping two people passes
    -- through a state where one member sits at both positions and the
    -- constraint would reject a valid save. NewsService deduplicates instead.
    PRIMARY KEY (news_id, position)
);

-- "News about this person", for the profile page.
CREATE INDEX news_member_member_idx ON news_member (member_id);
