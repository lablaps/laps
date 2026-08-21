# Visible Member Roles and Hidden Management Permissions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Coordenador/Gerenciador from the visible member taxonomy while preserving their access, add Colaborador, and let managers filter members with incomplete password rotation or email verification.

**Architecture:** A member has exactly one public membership classification (`HEAD`, `COLLABORATOR`, `DOCTORATE`, `MASTER`, or `UNDERGRAD`) and zero or more internal capabilities. `MANAGE_PLATFORM` is an authorization capability, never a public/member role. Existing `MANAGER` and `COORDINATOR` members are migrated to `MANAGE_PLATFORM` and reassigned to their latest preceding public role; when none exists, the safe visible fallback is `COLLABORATOR`. The configured email allowlist remains the break-glass/bootstrap grant and Spring continues to recompute authority on every request.

**Tech Stack:** Java 21, Spring Boot 3.5.16, Spring Security, Spring Data JPA, PostgreSQL/Flyway, React 19, TypeScript 5.8, TanStack Query/Router, Tailwind 4.

## Global Constraints

- Do not expose management capabilities from public member, graph, project, exchange, or profile endpoints.
- Do not represent management access as a badge, tier, count, graph ring, searchable public role, or invite role.
- Preserve immediate revocation: `JwtAuthFilter` must resolve current database capabilities on every request.
- Preserve the configured `LAPS_MANAGER_EMAILS` path as a bootstrap/break-glass grant.
- Preserve historical closed `MANAGER`/`COORDINATOR` rows during the first deployment; they are legacy audit data, not assignable roles.
- Revoke outstanding unused `MANAGER`/`COORDINATOR` invite tokens during migration rather than silently converting them into privileged invitations.
- Use TDD for backend behavior and run a Java specialist review after Java changes.
- Keep the roster client-side filtered at the current ~50-member scale; avoid adding search infrastructure or dependencies.

## Requirements and Assumptions for Review

1. “Multiple roles” is implemented as orthogonal dimensions: one public membership role plus zero or more internal capabilities. This prevents an undergraduate manager from losing “Graduação” or appearing publicly as “Gerenciador”.
2. `COLLABORATOR`/“Colaborador(a)” is a public membership role and participates in create, invite, edit, counts, public filters, graph, exchange, portal, profile, and translations.
3. `MANAGER` and `COORDINATOR` remain internal legacy enum values for one compatibility release only, so existing role-history rows remain readable. All write DTOs reject them.
4. Existing coordinator-only project-advisor eligibility is ambiguous. Recommended preservation: add internal `ADVISE_PROJECTS` alongside `MANAGE_PLATFORM` for former coordinators, while `HEAD` remains inherently eligible. If the product decision is “only HEAD may advise”, omit that capability and migrate only management access.
5. Admin authentication filters are two independent toggles: “Senha não rotacionada” and “Email não verificado”. When both are active they use AND semantics, so the result contains members with both pending actions.
6. Capability controls may appear only inside the protected member-edit dialog as “Acesso à Central de Comando”; they never appear as a member’s role. Creation and invitation assign public roles only; management access is granted explicitly after creation to reduce accidental privilege grants.

## Dependency Graph

```text
Flyway capability schema + data migration
    -> JPA capability model and authorization resolver
        -> admin-only roster/update contract
            -> admin create/edit/filter UI
    -> visible role contract (COLLABORATOR; legacy roles unassignable)
        -> public roster adapters and visual taxonomy
            -> graph/list/profile/exchange/portal/i18n
```

## Migration Contract

Create `V31__separate_member_roles_from_permissions.sql` with these ordered operations in one Flyway transaction:

1. Create `member_permission(member_id UUID, permission VARCHAR(40), granted_at TIMESTAMPTZ, granted_by UUID NULL)` with primary key `(member_id, permission)`, member FKs, and a permission check for `MANAGE_PLATFORM` (plus `ADVISE_PROJECTS` if approved).
2. Insert `MANAGE_PLATFORM` for every current member whose `member_role` is `MANAGER` or `COORDINATOR`; use `ON CONFLICT DO NOTHING`.
3. If advisor behavior is preserved, insert `ADVISE_PROJECTS` for current `COORDINATOR` members.
4. For each current legacy role, select the most recent earlier `role_history` row whose role is not `MANAGER`/`COORDINATOR`. Update `member.member_role` to it; use `COLLABORATOR` when absent.
5. Close the open legacy `role_history` row and append one open row for the restored visible role with a migration reason. Preserve older closed legacy rows unchanged.
6. Delete unused invite tokens whose `role` is `MANAGER` or `COORDINATOR`; already-used tokens and members remain intact.
7. Add database checks so `member.member_role` and new/open role-history writes accept public roles only. Because closed legacy history remains, use a partial/trigger rule for new rows rather than a table-wide check that would reject historical data.
8. End with assertions that zero current members and zero unused invites retain legacy roles, and that every migrated legacy member has `MANAGE_PLATFORM`.

Rollback is deploy-backup based: take a database snapshot before Flyway V31. Flyway migrations are forward-only; do not write a destructive down migration.

---

### Task 0: Restore a Trustworthy Verification Baseline

**Files:**
- Modify only if required: `laps-api/pom.xml`
- Verify: `laps-api/target/surefire-reports/`

**Interfaces:**
- Produces: a Maven test command that can execute Mockito under JDK 21 in the target environment.

- [ ] Reproduce the current baseline with `cd laps-api && mvn -Dskip.frontend=true test`.
- [ ] Configure Mockito/Byte Buddy as a Surefire Java agent if the target environment also blocks self-attachment; keep this isolated from role changes.
- [ ] Install frontend dependencies with the committed lockfile: `cd laps-signal-lab && npm ci --no-audit --no-fund`.
- [ ] Run the unchanged baseline: `npm run build`, `npx tsc --noEmit`, and targeted ESLint.

**Acceptance criteria:**
- [ ] Backend tests execute rather than error during MockMaker initialization.
- [ ] Frontend build and typecheck commands are available.

**Verification:** `mvn -Dskip.frontend=true test`; `npm run build`; `npx tsc --noEmit`.

**Dependencies:** None.

### Task 1: Add the Capability Schema and Migrate Existing Members

**Files:**
- Create: `laps-api/src/main/resources/db/migration/V31__separate_member_roles_from_permissions.sql`
- Create: `laps-api/src/test/java/br/uema/laps/member/MemberPermissionMigrationContractTest.java` (contract assertions that do not pretend H2 validates PostgreSQL SQL)

**Interfaces:**
- Produces: `member_permission(member_id, permission, granted_at, granted_by)` and the migration guarantees above.

- [ ] Write the failing migration-contract test for the required SQL invariants and forbidden outcomes.
- [ ] Implement V31 in the exact order in “Migration Contract”.
- [ ] Start a disposable PostgreSQL through the existing Compose topology and apply Flyway from V1 through V31.
- [ ] Query postconditions: no current legacy roles; every migrated member can manage; one open role-history row per member; no unused elevated legacy invite.
- [ ] Verify the known seeded coordinators regain `UNDERGRAD` and receive management access.

**Acceptance criteria:**
- [ ] No existing manager/coordinator loses Central de Comando access.
- [ ] No public current role is `MANAGER` or `COORDINATOR` after migration.
- [ ] Rows with no recoverable prior public role become `COLLABORATOR` explicitly.
- [ ] V31 succeeds on real PostgreSQL and a database snapshot is required before production deploy.

**Verification:** application startup against disposable PostgreSQL; postcondition SQL; migration contract test.

**Dependencies:** Task 0.

### Task 2: Model Internal Capabilities and Resolve Authorization From Them

**Files:**
- Create: `laps-api/src/main/java/br/uema/laps/security/MemberPermission.java`
- Modify: `laps-api/src/main/java/br/uema/laps/member/Member.java`
- Modify/rename: `laps-api/src/main/java/br/uema/laps/security/ManagerAllowlist.java`
- Modify: `laps-api/src/main/java/br/uema/laps/security/JwtAuthFilter.java`
- Modify: `laps-api/src/test/java/br/uema/laps/security/ManagerAllowlistTest.java`

**Interfaces:**
- Produces: `boolean has(Member, MemberPermission)` and `String roleFor(Member)` where `MANAGE_PLATFORM || allowlistedEmail` resolves to Spring authority `MANAGER`.

- [ ] Write failing tests proving an undergrad, master, doctorate, head, or collaborator can independently hold/revoke `MANAGE_PLATFORM`.
- [ ] Write failing tests proving legacy visible roles no longer grant authority by themselves.
- [ ] Map permissions as an eager small set or fetch them explicitly on authentication; avoid a lazy collection access after the repository call closes.
- [ ] Update the resolver and its comments so it no longer calls an academic tier a security grant.
- [ ] Prove revocation takes effect on the next request and the email allowlist still wins as bootstrap.

**Acceptance criteria:**
- [ ] Authorization is independent from `currentRole`.
- [ ] Management permissions never enter JWT trust decisions; they are recomputed from current state.
- [ ] HEAD remains non-manager unless capability/allowlist grants it.

**Verification:** targeted security tests, then full Maven suite.

**Dependencies:** Task 1.

### Task 3: Define the Assignable Public Role Contract

**Files:**
- Modify: `laps-api/src/main/java/br/uema/laps/member/MemberRole.java`
- Modify: `laps-api/src/main/java/br/uema/laps/admin/AdminController.java`
- Modify: `laps-api/src/main/java/br/uema/laps/invite/InviteController.java`
- Modify: `laps-api/src/main/java/br/uema/laps/roletracking/RoleTransitionService.java`
- Test: `laps-api/src/test/java/br/uema/laps/roletracking/RoleTransitionServiceTest.java`
- Test: `laps-api/src/test/java/br/uema/laps/admin/AdminMemberRoleTest.java`

**Interfaces:**
- Produces: `MemberRole.isAssignable()` containing `HEAD`, `COLLABORATOR`, `DOCTORATE`, `MASTER`, `UNDERGRAD`; legacy constants are read-only compatibility values.

- [ ] Write failing tests rejecting legacy roles from create, invite, and transition requests.
- [ ] Add `COLLABORATOR` and the assignable-role guard at every backend write boundary.
- [ ] Keep role history responsible only for public membership classification changes; capability grants/revocations use audit log actions such as `GRANT_MEMBER_PERMISSION` and `REVOKE_MEMBER_PERMISSION`.
- [ ] Resolve advisor eligibility using the approved Task 4 policy, not `COORDINATOR`.

**Acceptance criteria:**
- [ ] A forged JSON request cannot assign `MANAGER` or `COORDINATOR`.
- [ ] `COLLABORATOR` can be created, invited, filtered, and transitioned like other public roles.
- [ ] Capability changes do not rewrite academic role history.

**Verification:** controller/service tests and full Maven suite.

**Dependencies:** Task 2.

### Task 4: Preserve Project-Advisor Behavior Without a Coordinator Badge

**Files:**
- Modify: `laps-api/src/main/java/br/uema/laps/portal/MyPortalController.java`
- Modify: `laps-api/src/test/java/br/uema/laps/portal/MyPortalProjectLinkTest.java`
- Modify: `laps-signal-lab/src/routes/portal.tsx`

**Interfaces:**
- Consumes: approved rule: `HEAD || ADVISE_PROJECTS` (recommended) or `HEAD` only.

- [ ] Write failing backend tests for accepted and rejected advisor IDs under the approved rule.
- [ ] Replace the backend `HEAD/COORDINATOR` comparison with the policy.
- [ ] Return or derive the same advisor-eligible roster to the portal so frontend choices cannot drift from backend enforcement.
- [ ] Remove all coordinator wording from project creation and error messages.

**Acceptance criteria:**
- [ ] Former coordinators retain advisor behavior if that preservation option is approved.
- [ ] The frontend never offers a person the backend will reject.

**Verification:** targeted portal tests and manual project-creation flow.

**Dependencies:** Tasks 2–3 and the advisor-policy decision.

### Checkpoint: Backend and Migration

- [ ] V1→V31 applies on PostgreSQL.
- [ ] Security tests prove grant and immediate revocation.
- [ ] Create/invite/transition accept `COLLABORATOR` and reject legacy roles.
- [ ] Human reviews migrated-role and advisor-policy outcomes before UI work.

### Task 5: Create an Admin-Only Roster Contract With Auth State and Permission Control

**Files:**
- Create: `laps-api/src/main/java/br/uema/laps/admin/AdminMemberView.java`
- Modify: `laps-api/src/main/java/br/uema/laps/admin/AdminController.java`
- Modify: `laps-api/src/main/java/br/uema/laps/member/MemberRepository.java` if a fetch query is needed
- Test: `laps-api/src/test/java/br/uema/laps/admin/AdminMemberViewTest.java`

**Interfaces:**
- Produces: `GET /api/v1/admin/members` with full editable member fields, `mustChangePassword`, `emailVerified`, and admin-only `canManage`.
- Produces: `PUT /api/v1/admin/members/{id}/management-access` with `{ "enabled": true|false }`.

- [ ] Write failing tests proving the admin view combines profile and auth state while `MemberPublicView` contains no capability.
- [ ] Implement one admin roster endpoint and retire the frontend dependency on the separate `/admin/auth-status` merge.
- [ ] Implement audited, idempotent capability grant/revoke; an allowlisted manager remains authorized and receives a clear response rather than a misleading off state.
- [ ] Keep permission edits absent from create/invite payloads.

**Acceptance criteria:**
- [ ] Public JSON never contains `canManage` or permission names.
- [ ] Admin roster rows always carry definite booleans; no `undefined => rotated` bug remains.
- [ ] Permission changes are append-only audited and effective on the next request.

**Verification:** backend tests plus authenticated/anonymous response inspection.

**Dependencies:** Tasks 2–3.

### Task 6: Update the Admin Role, Creation, Edit, Counts, and Pending-Auth Filters

**Files:**
- Modify: `laps-signal-lab/src/lib/api.ts`
- Modify: `laps-signal-lab/src/routes/admin.tsx`
- Optional extraction for testability: `laps-signal-lab/src/lib/admin-member-filter.ts`

**Interfaces:**
- Consumes: `AdminMemberView`, public assignable roles, management-access mutation.

- [ ] Replace the frontend `MemberRole` union with public assignable values and a separate security-role type.
- [ ] Add Colaborador to create member, invite, change-role, count cards, chips, and role filters.
- [ ] Remove Coordenador/Gerenciador from stats, filters, cards, dropdowns, and icon/tier tables.
- [ ] Add independent “Senha não rotacionada” and “Email não verificado” filters; combine with name and public-role filters using AND semantics.
- [ ] Show an explicit loading/error state for credential status and never infer rotation from missing data.
- [ ] Add “Acesso à Central de Comando” only inside the protected edit dialog, with confirmation on revoke and no public badge.

**Acceptance criteria:**
- [ ] Search by name/slug/email still works and composes with every new filter.
- [ ] Selecting each pending-auth filter returns only matching members; selecting both returns the intersection.
- [ ] No visible admin taxonomy contains Coordenador or Gerenciador.
- [ ] A manager can still be displayed as Graduação/Mestrando/etc.

**Verification:** `npx tsc --noEmit`; targeted ESLint; manual checks at 375/768/1440px; keyboard focus and ≥40px filter hit targets.

**Dependencies:** Task 5.

### Task 7: Replace the Public Taxonomy Across Every Surface

**Files:**
- Modify: `laps-signal-lab/src/lib/team-data.ts`
- Modify: `laps-signal-lab/src/lib/tier-visual.ts`
- Modify: `laps-signal-lab/src/lib/i18n.ts`
- Modify: `laps-signal-lab/src/hooks/use-team-roster.ts`
- Modify: `laps-signal-lab/src/components/TeamGraph.tsx`
- Modify: `laps-signal-lab/src/routes/team.tsx`
- Modify: `laps-signal-lab/src/routes/team.$uuid.tsx`
- Modify: `laps-signal-lab/src/routes/exchange.tsx`
- Modify: `laps-signal-lab/src/routes/portal.tsx`
- Modify: `laps-signal-lab/src/routes/join.$token.tsx`

**Interfaces:**
- Produces: public tier union `head | collaborator | doctorate | master | undergrad` and PT/EN/FR labels.

- [ ] Add collaborator visuals/ordering/annulus/radius and remove coordinator/manager visuals.
- [ ] Update graph legends, counts, hierarchy/list filters, peer grouping, profile badges, exchange cards, portal headers, and invite copy.
- [ ] Update static fallback entries for the known coordinators to their restored public role and ensure fallback counts include collaborator.
- [ ] Search built assets/source for user-facing `Coordenador`, `Gerenciador`, `Coordinator`, and `Manager`; retain only security/admin explanatory text that is not rendered as a member role.

**Acceptance criteria:**
- [ ] Public pages display only Head, Colaborador, Doutorando, Mestrando, and Graduando (localized).
- [ ] Managers appear in their public role without any management marker.
- [ ] Graph and all three roster views can filter/render collaborators without fallback to undergrad.
- [ ] No stale legacy role label appears in PT, EN, or FR UI.

**Verification:** frontend build/typecheck/lint; anonymous browser sweep of `/team`, member detail, `/exchange`, `/join/:token`; visual screenshots.

**Dependencies:** Tasks 3 and 6.

### Checkpoint: End-to-End Product Behavior

- [ ] Existing manager/coordinator accounts can still log in and open `/admin` after migration.
- [ ] Revoking database management access blocks `/api/v1/admin/**` on the next request unless email allowlisted.
- [ ] Their cards/profiles show only the restored visible role.
- [ ] Colaborador works in create, invite, edit, public filters, graph, profile, and exchange.
- [ ] Password/email pending filters are accurate after loading and after password reset/query invalidation.

### Task 8: Documentation, Deployment Guardrails, and Final Review

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md` if its role model section differs
- Modify: relevant vault notes only in a separately authorized documentation pass (outside this repository)

- [ ] Document the two-dimensional identity model and why public roles never grant authority.
- [ ] Add production preflight SQL reporting which members will be remapped and which invites will be revoked.
- [ ] Take a production database snapshot, review the report with the human, deploy the monolith, and run postcondition SQL.
- [ ] Run full backend tests, frontend build/typecheck/lint, and authenticated/anonymous browser smoke tests.
- [ ] Invoke the mandatory Java reviewer for all Java changes; resolve correctness/security findings before completion.
- [ ] Check `git diff --check` and scan for dead legacy UI mappings without deleting historical compatibility code prematurely.

**Acceptance criteria:**
- [ ] Deployment has a reviewed snapshot, preflight report, and post-deploy authorization smoke test.
- [ ] Documentation matches the implemented model.
- [ ] No regression in public privacy or immediate authorization revocation.

**Verification:** complete release checklist plus five-axis code review.

**Dependencies:** All prior tasks.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---:|---|
| Wrong visible role chosen for a legacy manager | High | Preflight report; restore latest non-legacy history; explicit collaborator fallback; human review before deploy. |
| Manager loses access during migration | High | Insert capability before rewriting current role; postcondition assertion; retain allowlist bootstrap. |
| Legacy invite grants unexpected authority | High | Revoke unused elevated invites; never auto-convert them into capability-bearing invites. |
| Public endpoint leaks management access | High | Admin-only DTO; explicit negative serialization tests; anonymous response inspection. |
| Coordinator advisor behavior is lost or broadened | Medium | Resolve Task 4 decision explicitly; capability-based rule if behavior must survive. |
| Frontend shows incorrect auth status during loading | Medium | Replace two-query merge with definite admin DTO fields; tri-state UI on query loading/error. |
| Historic role rows cannot be deserialized | Medium | Keep legacy enum constants read-only for one release; forbid them at all write boundaries. |
| Public graph geometry breaks after tier removal | Medium | Update every exhaustive `Record<Tier,...>` and visually test all views/breakpoints. |
| Current test runner remains unusable in sandbox | Medium | Isolate Surefire agent setup as Task 0; do not mistake environment errors for feature failures. |

## Human Decision Required Before Implementation

Confirm whether former `COORDINATOR` users must remain eligible as project advisors. Recommended: preserve it as a second hidden capability (`ADVISE_PROJECTS`) so neither management nor advising is encoded as a public role. If not, restrict advisors to `HEAD` and omit that capability.

## Self-Review

- Spec coverage: role hiding, preserved access, multiple dimensions, Colaborador, member creation/invites/edit/search, public surfaces, password rotation, email verification, migration, security, and deployment are covered.
- Placeholder scan: no TBD/TODO implementation placeholders.
- Type consistency: public `MemberRole`, internal `MemberPermission`, Spring authority `MANAGER`, and frontend security role are separate names throughout.
- Dependency order: database -> authorization -> API -> admin UI/public UI -> deployment.

