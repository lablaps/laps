-- LAPS schema v1 — PostgreSQL 15+
-- Spec: /home/user/ICARO/Icaro de Jesus/01-projects/laps/laps-data-model.md

CREATE TABLE professor (
    id              BIGSERIAL       PRIMARY KEY,
    full_name       VARCHAR(255)    NOT NULL,
    institution     VARCHAR(255),
    lab             VARCHAR(255),
    program         VARCHAR(255),
    bio_pt          TEXT,
    bio_en          TEXT,
    bio_fr          TEXT,
    linkedin_url    VARCHAR(500),
    lattes_url      VARCHAR(500),
    photo_url       VARCHAR(500)
);

CREATE TABLE research_area (
    id          SMALLSERIAL     PRIMARY KEY,
    slug        VARCHAR(100)    NOT NULL UNIQUE,
    name_pt     VARCHAR(255)    NOT NULL,
    name_en     VARCHAR(255)    NOT NULL,
    name_fr     VARCHAR(255)    NOT NULL,
    color       VARCHAR(20)     NOT NULL
);

CREATE TABLE member (
    id                          UUID            NOT NULL PRIMARY KEY,
    slug                        VARCHAR(100)    NOT NULL UNIQUE,
    full_name                   VARCHAR(255)    NOT NULL,
    email                       VARCHAR(255)    UNIQUE,
    google_sub                  VARCHAR(255)    UNIQUE,
    member_role                 VARCHAR(50)     NOT NULL,
    current_role_started_at     DATE,
    status                      VARCHAR(50)     NOT NULL DEFAULT 'ACTIVE',
    bio_pt                      TEXT,
    bio_en                      TEXT,
    bio_fr                      TEXT,
    photo_url                   VARCHAR(500),
    linkedin_url                VARCHAR(500),
    lattes_url                  VARCHAR(500),
    github_url                  VARCHAR(500),
    contact_email               VARCHAR(255),
    roadmap                     TEXT,
    deleted_at                  TIMESTAMP,
    created_at                  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_member_role   ON member (member_role);
CREATE INDEX idx_member_status ON member (status);

CREATE TABLE member_area (
    member_id   UUID        NOT NULL,
    area_id     SMALLINT    NOT NULL,
    is_primary  BOOLEAN     NOT NULL DEFAULT FALSE,
    PRIMARY KEY (member_id, area_id),
    CONSTRAINT fk_member_area_member FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE,
    CONSTRAINT fk_member_area_area   FOREIGN KEY (area_id)   REFERENCES research_area(id) ON DELETE CASCADE
);

CREATE TABLE role_history (
    id              BIGSERIAL       PRIMARY KEY,
    member_id       UUID            NOT NULL,
    member_role     VARCHAR(50)     NOT NULL,
    started_at      DATE            NOT NULL,
    ended_at        DATE,
    reason          TEXT,
    recorded_by     UUID,
    CONSTRAINT fk_role_history_member   FOREIGN KEY (member_id)    REFERENCES member(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_history_recorder FOREIGN KEY (recorded_by)  REFERENCES member(id),
    CONSTRAINT role_dates_ordered CHECK (ended_at IS NULL OR ended_at >= started_at)
);

-- One-open-role invariant enforced at application level in RoleTransitionService.
CREATE INDEX idx_role_history_member ON role_history (member_id, ended_at);

CREATE TABLE publication (
    id              UUID            NOT NULL PRIMARY KEY,
    title           TEXT            NOT NULL,
    venue           VARCHAR(255)    NOT NULL,
    year            SMALLINT        NOT NULL,
    doi             VARCHAR(255),
    url             VARCHAR(500),
    type            VARCHAR(50)     NOT NULL,
    status          VARCHAR(50)     NOT NULL,
    abstract_text   TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_publication_year   ON publication (year);
CREATE INDEX idx_publication_status ON publication (status);

CREATE TABLE authorship (
    publication_id          UUID            NOT NULL,
    member_id               UUID,
    external_author_name    VARCHAR(255),
    author_order            SMALLINT        NOT NULL,
    author_role             VARCHAR(50)     NOT NULL DEFAULT 'AUTHOR',
    CONSTRAINT fk_authorship_publication FOREIGN KEY (publication_id) REFERENCES publication(id) ON DELETE CASCADE,
    CONSTRAINT fk_authorship_member      FOREIGN KEY (member_id)       REFERENCES member(id) ON DELETE SET NULL
);

CREATE INDEX idx_authorship_publication ON authorship (publication_id);
CREATE INDEX idx_authorship_member      ON authorship (member_id);

CREATE TABLE publication_area (
    publication_id  UUID        NOT NULL,
    area_id         SMALLINT    NOT NULL,
    PRIMARY KEY (publication_id, area_id),
    CONSTRAINT fk_pub_area_publication FOREIGN KEY (publication_id) REFERENCES publication(id) ON DELETE CASCADE,
    CONSTRAINT fk_pub_area_area        FOREIGN KEY (area_id)         REFERENCES research_area(id) ON DELETE CASCADE
);
