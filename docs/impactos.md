# Impactos

Each member, at any academic level, owns dated impact records. Categories: scholarship,
doctoral scholarship, international experience, contribution, award, other.
Required Portuguese title, outcome, contribution and role; editable English and French
translations fall back to Portuguese. Records include organization, date, at most 10
tools, collaborators, optional supervisors, and labeled HTTP(S) supporting links
(articles, projects, datasets or other evidence). Collaborators and supervisors may be
external to LAPS and are recorded by name; this does not grant editing rights.

Public GET /api/v1/impacts supports memberId, kind, from, to, q and pagination.
GET /api/v1/impacts/{id} retrieves one record. Authenticated CRUD at
/api/v1/me/impacts derives ownership from the session, honors the temporary-password
write guard, and never permits editing another member's records. Soft-deleted owners
are excluded from public results. Removal of an impact is soft deletion.

UI: /impactos searchable directory; member profile timeline; portal editor. All labels,
errors and empty states in PT/EN/FR, with explicit public visibility notice.

Verification: mvn -Dskip.frontend=true test; npx tsc --noEmit; npm run build;
HTTP ownership/validation and query tests; desktop/mobile browser inspection.
