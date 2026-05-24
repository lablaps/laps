-- Append-only audit log for admin mutations.

CREATE TABLE audit_log (
    id              BIGSERIAL       PRIMARY KEY,
    actor_member_id UUID,
    action          VARCHAR(80)     NOT NULL,
    entity_type     VARCHAR(80)     NOT NULL,
    entity_id       VARCHAR(80),
    payload_json    TEXT,
    occurred_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_member_id) REFERENCES member(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_occurred_at ON audit_log (occurred_at);
CREATE INDEX idx_audit_entity      ON audit_log (entity_type, entity_id);
