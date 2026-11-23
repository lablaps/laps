# Client Assets and JWT Session Hardening Plan

**Date:** 2026-10-06  
**Status:** Proposed — implementation requires user approval  
**Scope:** Browser asset visibility, cookie-only JWT delivery, one-hour sessions, and password-change token invalidation

## Objective

Keep the compiled JavaScript required by the SPA publicly loadable, while ensuring that source-only artifacts and nonexistent assets remain unavailable. Deliver JWTs only through the protected cookie, reduce their lifetime to one hour, minimize their claims, and invalidate every older token whenever a password is changed or reset.

## Verified Findings

1. The code visible in the supplied DevTools screenshot is a minified, hashed production JavaScript chunk. The browser must receive this file to run the corresponding page. Returning `404` for a real `/assets/*.js` file would break the application.
2. The current production build emits no `.map` source-map files. Client-side code must never contain secrets; minification is an optimization, not a security boundary.
3. The `laps_jwt` cookie is configured with `HttpOnly`, `Secure` in production, `SameSite=Lax`, and `Path=/`. A user can still inspect their own cookie in browser DevTools; browsers do not provide a mechanism to hide it from the browser owner.
4. `POST /api/v1/auth/login` unnecessarily returns the JWT in both `Set-Cookie` and the JSON body. The frontend uses the cookie and never reads `LoginResponse.token`, so the JSON copy is avoidable credential exposure.
5. The JWT currently carries `email` and `role` claims, but request authentication uses only `sub`; the current member record is reloaded and the authority is recomputed on every request. Those claims can be removed.
6. `application.yml` defaults to a one-hour JWT, but `render.yaml` and `.env.example` override it to eight hours. The production setting therefore contradicts the login screen's one-hour statement.
7. `PUT /api/v1/me/password` changes the BCrypt hash and returns only `{ "message": "Password updated" }`. It neither issues a new JWT nor replaces the cookie.
8. Existing JWTs remain valid after a password change because `JwtAuthFilter` validates the signature/expiry, reloads the member by `sub`, and checks account status, but does not bind the token to the member's current credential state.
9. The admin reset flow has the same gap: `MemberPasswordService.forceReset` replaces the password but does not invalidate tokens already held by that member.

## Architecture Decisions

- **Do not return 404 for real JavaScript bundles.** Existing hashed bundles remain public and cacheable because the SPA depends on them.
- **Keep natural 404 behavior for nonexistent assets and source artifacts.** No source maps or raw `src/` files will be published.
- **Keep the JWT cookie.** Cookie visibility in DevTools is expected; protection comes from `HttpOnly`, `Secure`, `SameSite`, HTTPS, short expiry, and server-side authorization checks.
- **Remove the JWT from JSON responses.** Login and registration responses will contain only the session metadata needed by the UI.
- **Use a one-hour lifetime everywhere.** `LAPS_JWT_TTL` will be `PT1H` in the production manifest and example environment, matching the backend default and UI copy.
- **Add a server-side credential/session version.** Each member gets a nonnegative `auth_version`, defaulting to zero. A password change or reset increments it.
- **Bind each JWT to `auth_version`.** Tokens retain standard issuer, subject, issued-at, and expiry claims plus a small `ver` claim. Email and role are removed.
- **Reject stale and legacy tokens.** `JwtAuthFilter` compares `ver` to the current member record. A missing or mismatched version clears the cookie and returns `401`, producing a one-time re-login after deployment and immediate invalidation after credential rotation.
- **Rotate the current password-change session.** After a successful self-service password change, the server increments `auth_version`, issues a fresh one-hour JWT with the new version, and replaces the cookie in the same response. The frontend needs no token handling because the browser applies `Set-Cookie` automatically.
- **Invalidate admin-reset sessions without impersonating the member.** An admin reset increments the target member's version but does not mint a token for that member. Every existing session is rejected; the member must sign in with the new temporary password.
- **Keep Bearer-header parsing for compatibility.** Bearer tokens are subject to the same version check as cookie tokens.
- **Do not add refresh tokens.** The application remains a single short-lived session-token design.

## Dependency Graph

```text
Failing security tests
        │
        ├── Login response + one-hour TTL
        └── Password-change/reset invalidation
                    │
                    ▼
          V33 auth_version migration
                    │
                    ▼
       JWT issuance + filter validation
              │              │
              ├── self-change rotates cookie
              └── admin reset revokes sessions
                    │
                    ▼
       Frontend/config alignment
                    │
                    ▼
 Production build + browser verification
```

## Task 1: Add failing security-contract tests

**Description:** Capture the desired behavior before production changes.

**Acceptance criteria:**

- [ ] Login requires a `Set-Cookie` header containing `laps_jwt` and a JSON body without `token`.
- [ ] JWT tests require `sub`, `iss`, `iat`, `exp`, and `ver`; they reject `email` and `role` claims.
- [ ] JWT expiry is approximately one hour after issuance.
- [ ] Filter tests prove a matching version authenticates, while missing or mismatched versions return `401` and clear the cookie.
- [ ] Self-service password-change tests require the version to increment and a replacement JWT cookie to be issued.
- [ ] Admin-reset tests require the target member's version to increment and no target-user JWT to be issued.
- [ ] The new assertions fail against the current implementation for the expected reasons.

**Verification:**

- [ ] Run the focused security, portal-password, and admin-reset tests and record only the expected failures.

**Dependencies:** None  
**Estimated scope:** Medium

## Task 2: Add the persistent authentication version

**Description:** Create the state used to invalidate all older tokens without maintaining a token blacklist.

**Acceptance criteria:**

- [ ] Add `V33__member_auth_version.sql` with `auth_version BIGINT NOT NULL DEFAULT 0`.
- [ ] Map the column in `Member` as a JSON-ignored nonnegative `long` defaulting to zero.
- [ ] Add a migration contract test for the column, default, and nullability.
- [ ] Existing member rows migrate to version zero without data loss.

**Verification:**

- [ ] Migration contract and application-context mapping tests pass.
- [ ] A disposable PostgreSQL migration run upgrades through V33 successfully.

**Dependencies:** Task 1  
**Estimated scope:** Small

## Task 3: Bind JWTs to the current authentication version

**Description:** Minimize token data and make validation depend on current credential state.

**Acceptance criteria:**

- [ ] `LapsJwtService.issue` accepts member ID and authentication version only.
- [ ] JWTs contain no email or role and expire after the configured one hour.
- [ ] Login and invite registration issue JWTs with the persisted member version.
- [ ] `JwtAuthFilter` rejects tokens whose `ver` is absent, malformed, or different from `Member.authVersion`.
- [ ] Rejection clears cookie authentication and returns a stable `session_revoked` or equivalent `401` response.
- [ ] Current role and account eligibility continue to be recomputed from server state on every request.

**Verification:**

- [ ] JWT service, filter, login, invite, inactive-account, and authorization tests pass.

**Dependencies:** Task 2  
**Estimated scope:** Medium

## Task 4: Rotate or revoke sessions on every password mutation

**Description:** Make a changed credential immediately invalidate previously issued tokens.

**Acceptance criteria:**

- [ ] `PUT /api/v1/me/password` changes the hash and increments `auth_version` in one transaction.
- [ ] That endpoint issues a replacement JWT using the incremented version and sends it only via `Set-Cookie`.
- [ ] The response body remains `{ "message": "Password updated" }`; it never contains a token.
- [ ] A request with the pre-change JWT is rejected after the transaction commits.
- [ ] A request with the replacement cookie remains authenticated.
- [ ] `MemberPasswordService.forceReset` increments `auth_version` whenever it overwrites an existing credential.
- [ ] Admin reset immediately invalidates all target-user sessions and still returns the one-time temporary password only to the authorized admin.
- [ ] Initial password provisioning follows an explicitly tested rule: increment when replacing an existing credential; retain the default version for a genuinely new/passwordless account.

**Verification:**

- [ ] Focused controller/service tests cover self-change, temp-password rotation, admin reset, and stale-token rejection.
- [ ] A two-session integration scenario proves changing the password in session A keeps A signed in with its new cookie and logs session B out on its next request.

**Dependencies:** Task 3  
**Estimated scope:** Medium

## Checkpoint: Authentication contract

- [ ] Login succeeds through the cookie without returning the JWT in JSON.
- [ ] New JWTs expire in one hour and contain only necessary claims.
- [ ] Password change rotates the current cookie.
- [ ] Previous and parallel-session tokens fail immediately after a password change/reset.
- [ ] Targeted backend tests pass.

## Task 5: Align frontend types and runtime configuration

**Description:** Remove the unused client token field and make every documented/deployed TTL one hour.

**Acceptance criteria:**

- [ ] `LoginResponse` no longer declares `token`.
- [ ] Login routing continues to use `role` and `mustChangePassword`.
- [ ] Password-change success continues to invalidate/refetch the `me` query; no JavaScript token storage is introduced.
- [ ] `render.yaml` and `.env.example` set `LAPS_JWT_TTL=PT1H`.
- [ ] Backend defaults, deployment manifest, example configuration, and visible one-hour session copy agree.

**Verification:**

- [ ] Repository search finds no frontend authentication-token storage or response-body token use.
- [ ] `npm run build` succeeds.

**Dependencies:** Task 4  
**Estimated scope:** Small

## Task 6: Verify the static-asset boundary without blocking the SPA

**Description:** Confirm that production serves required compiled bundles while source-only and nonexistent paths return `404`.

**Acceptance criteria:**

- [ ] A real hashed `/assets/*.js` bundle returns `200` with a JavaScript content type.
- [ ] A nonexistent hashed asset returns `404`.
- [ ] Guessed `.map` and raw `src/*.ts(x)` paths do not return source content.
- [ ] `dist/client` contains no `.map` files.
- [ ] No secrets or credential-like values are present in `VITE_` variables or emitted JavaScript.

**Verification:**

- [ ] Build the production SPA and exercise the packaged monolith anonymously against real and nonexistent paths.

**Dependencies:** Task 5  
**Estimated scope:** Small

## Task 7: Full regression and browser verification

**Description:** Verify the complete production-shaped authentication lifecycle.

**Acceptance criteria:**

- [ ] Login response JSON contains no JWT.
- [ ] `Set-Cookie` contains `HttpOnly`, `Secure` in production, `SameSite=Lax`, `Path=/`, and a one-hour maximum age.
- [ ] `document.cookie` cannot read `laps_jwt`; authenticated requests still succeed with `credentials: "include"`.
- [ ] Password change replaces the cookie and invalidates a token captured before the change.
- [ ] Admin reset invalidates the member's active session.
- [ ] Ordinary logout clears the browser cookie.
- [ ] Public pages and lazy-loaded routes still load their JavaScript chunks.

**Verification:**

- [ ] `mvn -q -Dskip.frontend=true test`
- [ ] `npm run build`
- [ ] Package the monolith and browser-test login, two-session password rotation, admin reset, logout, and lazy-route loading.

**Dependencies:** Tasks 1–6  
**Estimated scope:** Medium

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Blocking `/assets/**` while trying to hide code | Critical: SPA becomes unusable | Preserve `200` for real bundles; test lazy routes |
| Existing deployed JWTs have no `ver` claim | Expected one-time logout | Fail closed and communicate the deployment re-login requirement |
| Increment and new cookie are not based on the same committed version | Current session can be rejected unexpectedly | Perform mutation/version increment transactionally; issue from the saved value and test the full flow |
| Concurrent password changes lose an increment | A stale token could survive | Use an optimistic-lock/atomic increment strategy or lock the member row during credential mutation |
| Admin reset accidentally issues a token for the target member | Privilege/session confusion | Keep token issuance out of the admin reset response and assert it in tests |
| Frontend relies on the body token unexpectedly | Login regression | Repository search shows no use; verify production build and browser login |
| One-hour expiry affects long portal sessions | More frequent sign-in | Make the expiry explicit; do not add silent refresh without a separate threat-model decision |

## Deployment Notes

1. Applying V33 is backward-compatible with existing rows, but deploying version enforcement will invalidate all JWTs minted by older code because they lack `ver`.
2. Deploy the migration and application as one coordinated release and expect all users to sign in once afterward.
3. Treat any JWT already copied into screenshots, logs, or messages as compromised. The version check will revoke it on the next password change/reset; the one-hour TTL bounds it otherwise.
4. This plan intentionally does not add a refresh token or global token blacklist. A future “log out all devices” feature can increment the same `auth_version`.

## Final Checkpoint

- [ ] Backend suite passes with zero failures.
- [ ] Frontend production build succeeds.
- [ ] Required JS bundles remain available; source-only paths do not.
- [ ] JWT is present only in the protected cookie, not response JSON.
- [ ] JWT lifetime is one hour in all runtime/documented configurations.
- [ ] Password changes and resets invalidate every previously issued token.
- [ ] The human has reviewed the evidence before deployment.
