CREATE TABLE member_permission (
    member_id UUID NOT NULL REFERENCES member(id) ON DELETE CASCADE,
    permission VARCHAR(40) NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    granted_by UUID REFERENCES member(id),
    PRIMARY KEY (member_id, permission),
    CONSTRAINT member_permission_known CHECK (
        permission IN ('MANAGE_PLATFORM', 'ADVISE_PROJECTS')
    )
);

CREATE INDEX idx_member_permission_permission
    ON member_permission (permission);

CREATE TEMP TABLE migrated_legacy_member ON COMMIT DROP AS
SELECT
    m.id,
    m.member_role AS legacy_role,
    COALESCE(previous_role.member_role, 'COLLABORATOR') AS restored_role
FROM member m
LEFT JOIN LATERAL (
    SELECT rh.member_role
    FROM role_history rh
    WHERE rh.member_id = m.id
      AND rh.member_role NOT IN ('MANAGER', 'COORDINATOR')
    ORDER BY rh.started_at DESC, rh.id DESC
    LIMIT 1
) previous_role ON TRUE
WHERE m.member_role IN ('MANAGER', 'COORDINATOR');

INSERT INTO member_permission (member_id, permission)
SELECT id, 'MANAGE_PLATFORM'
FROM migrated_legacy_member
ON CONFLICT DO NOTHING;

INSERT INTO member_permission (member_id, permission)
SELECT id, 'ADVISE_PROJECTS'
FROM migrated_legacy_member
WHERE legacy_role = 'COORDINATOR'
ON CONFLICT DO NOTHING;

UPDATE role_history
SET ended_at = GREATEST(CURRENT_DATE, started_at)
WHERE ended_at IS NULL
  AND member_id IN (SELECT id FROM migrated_legacy_member);

UPDATE member m
SET member_role = migrated.restored_role,
    current_role_started_at = CURRENT_DATE
FROM migrated_legacy_member migrated
WHERE m.id = migrated.id;

INSERT INTO role_history (member_id, member_role, started_at, ended_at)
SELECT id, restored_role, CURRENT_DATE, NULL
FROM migrated_legacy_member;

DELETE FROM invite_tokens
WHERE used_at IS NULL
  AND role IN ('MANAGER', 'COORDINATOR');

ALTER TABLE member
    ADD CONSTRAINT member_public_role
    CHECK (member_role IN ('HEAD', 'COLLABORATOR', 'DOCTORATE', 'MASTER', 'UNDERGRAD'));

ALTER TABLE role_history
    ADD CONSTRAINT role_history_public_current_role
    CHECK (
        ended_at IS NOT NULL
        OR member_role IN ('HEAD', 'COLLABORATOR', 'DOCTORATE', 'MASTER', 'UNDERGRAD')
    );

ALTER TABLE invite_tokens
    ADD CONSTRAINT invite_tokens_public_pending_role
    CHECK (
        used_at IS NOT NULL
        OR role IN ('HEAD', 'COLLABORATOR', 'DOCTORATE', 'MASTER', 'UNDERGRAD')
    );

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM member WHERE member_role IN ('MANAGER', 'COORDINATOR')
    ) THEN
        RAISE EXCEPTION 'legacy management roles remain assigned to members';
    END IF;

    IF EXISTS (
        SELECT 1 FROM invite_tokens
        WHERE used_at IS NULL AND role IN ('MANAGER', 'COORDINATOR')
    ) THEN
        RAISE EXCEPTION 'pending invites still contain legacy management roles';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM migrated_legacy_member migrated
        LEFT JOIN member_permission permission
          ON permission.member_id = migrated.id
         AND permission.permission = 'MANAGE_PLATFORM'
        WHERE permission.member_id IS NULL
    ) THEN
        RAISE EXCEPTION 'a migrated manager is missing MANAGE_PLATFORM';
    END IF;
END $$;
