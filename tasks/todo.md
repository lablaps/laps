# Member Roles / Management Permission Tasks

- [x] Decide whether former coordinators retain project-advisor eligibility through hidden `ADVISE_PROJECTS` capability.
- [x] Task 0: restore a trustworthy backend/frontend verification baseline.
- [x] Task 1: add V31 capability schema and migrate current legacy-role members.
- [x] Task 2: resolve Spring authority from internal capabilities plus the email allowlist.
- [x] Task 3: add `COLLABORATOR` and reject legacy roles at every write boundary.
- [x] Task 4: replace coordinator-based project-advisor checks with the approved policy.
- [x] Checkpoint: verify migration, authorization grant/revocation, and role contracts.
- [x] Task 5: add a single admin-only roster DTO with auth flags and management access.
- [x] Task 6: update admin role/create/edit/count/search/pending-auth UI.
- [x] Task 7: update public graph, team views, profile, exchange, portal, join flow, fallback data, and i18n.
- [ ] Checkpoint: run end-to-end authenticated and anonymous product checks.
- [ ] Task 8: preflight production data, snapshot, deploy, and verify (deployment work; intentionally not run locally).

## Client assets and JWT response hardening — proposed

- [x] Decide the session lifetime: one hour (`PT1H`).
- [ ] Approve the amended security/session-rotation plan.
- [ ] Task 1: add failing tests for cookie-only responses, one-hour/versioned JWTs, and password-mutation invalidation.
- [ ] Task 2: add V33 and the persistent member `auth_version`.
- [ ] Task 3: minimize JWT claims and enforce the current authentication version in the filter.
- [ ] Task 4: rotate the current cookie on self-service password change and revoke all sessions on admin reset.
- [ ] Checkpoint: verify cookie-only login, one-hour expiry, and stale-token rejection.
- [ ] Task 5: remove the frontend `LoginResponse.token` field and align runtime TTL configuration.
- [ ] Task 6: verify real bundles remain available and source-only/nonexistent assets return 404.
- [ ] Task 7: run the full security regression and production-shaped two-session browser check.
- [ ] Final checkpoint: review evidence before deployment.

## Public profile redesign & credibility — 2026-11-14

Plan: [`docs/superpowers/plans/2026-11-14-public-profile-and-credibility.md`](../docs/superpowers/plans/2026-11-14-public-profile-and-credibility.md)

- [x] Phase 1: /team opens on List; network graph demoted to last tab; i18n tier-label fixes.
- [x] Phase 2: dark mode removed site-wide.
- [x] Phase 3: profile redesign (portrait hero, research interests, accordions, Honours & Awards, Scholar button); portrait photo export.
- [x] Decisions: fonts self-hosted; bio removed from portal/admin; home counters kept; lab name = Aquisição; "Prêmios e Bolsas".
- [ ] Phase 4: dedicated Google Scholar field (after JWT work is committed).
- [ ] Phase 5: legacy circular photo re-upload path.
- [ ] Phase 6: retire banner editor, then banner columns.
- [ ] Phase 7: CI, formatting commit, admin.tsx hooks fix, dead code, lockfile, README/CLAUDE.md.
- [ ] Phase 8: DB as single source of truth for publications/areas; nav order.

### Round 2 (one phase at a time)
- [x] Phase 4: Impactos → Prêmios e Bolsas (copy, URL + redirect, backend route).
- [x] Phase 5: "Undergrad" → "Undergraduate"; remove photo gradient.
- [x] Phase 6: News API + console editor (also fixed project/publication picker search).
- [x] Phase 7: remove Impacts API entirely (V35 drops table); Prêmios e Bolsas reads news.
- [x] Phase 8: /noticias + nav (Home ▾ Sobre/Parceiros; Notícias ▾ Projetos/Intercâmbio/Prêmios e Bolsas).
- [ ] Phase 9: /portal redesign with accordions.
