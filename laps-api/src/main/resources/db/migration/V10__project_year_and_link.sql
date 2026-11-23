-- Extend project with publication year and an optional external article/project link.
ALTER TABLE project
    ADD COLUMN year        SMALLINT     NULL,
    ADD COLUMN article_url VARCHAR(500) NULL;
