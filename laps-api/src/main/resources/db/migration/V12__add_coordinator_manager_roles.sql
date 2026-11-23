-- Promote two members to COORDINATOR. Closes their open role-history row,
-- opens a new COORDINATOR row, and updates the current_role pointer.

UPDATE role_history rh
SET ended_at = CURRENT_DATE
FROM member m
WHERE m.id = rh.member_id
  AND m.slug IN ('luis-guilherme-busaglo-lopes', 'patrick-melo-albuquerque')
  AND rh.ended_at IS NULL;

INSERT INTO role_history (member_id, member_role, started_at, ended_at, reason)
SELECT m.id, 'COORDINATOR', CURRENT_DATE, NULL, 'role redesign — promoted to Coordenador'
FROM member m
WHERE m.slug IN ('luis-guilherme-busaglo-lopes', 'patrick-melo-albuquerque');

UPDATE member
SET member_role = 'COORDINATOR',
    current_role_started_at = CURRENT_DATE
WHERE slug IN ('luis-guilherme-busaglo-lopes', 'patrick-melo-albuquerque');
