# LAPS — lab platform (UEMA)

Public site, member portal and admin console for **LAPS** (Laboratório de Análise e
Processamento de Sinais) at Universidade Estadual do Maranhão. Portuguese-first,
with EN/FR translations. Runs as a single deployable: one Spring Boot jar serving
both the REST API and the compiled React SPA.

Roughly 6k lines of Java and 21k of TypeScript.

## Layout

```
laps/
├── laps-api/            Spring Boot 3.5.16, Java 21 — REST API + serves the SPA
├── laps-signal-lab/     React 19 SPA (TanStack Start/Router, Vite 7, Tailwind 4)
├── Dockerfile           3-stage: SPA build → Maven build → JRE runtime (non-root)
├── docker-compose.yml   App + Postgres for local/on-prem
└── render.yaml          Render blueprint (web service + managed Postgres)
```

The SPA is compiled into the jar's `static/` at image-build time, so production is
same-origin: no CORS in the normal path, no separate frontend host.

## Stack

**Backend** — Spring Boot 3.5.16 (web, data-jpa, security, validation, actuator),
Java 21, PostgreSQL, Flyway (29 migrations), Hibernate with `ddl-auto: validate`,
JJWT, Lombok, Cloudinary SDK, JUnit 5 + Mockito + AssertJ (126 tests).

**Frontend** — React 19, TanStack Router + Start, Vite 7, TypeScript 5.8,
Tailwind 4, shadcn/ui/Radix, TanStack Query, react-hook-form + Zod, Framer Motion,
Recharts, d3-force, lucide-react, sonner.

**External services** — Cloudinary (media; falls back to local disk), Brevo or
Resend (transactional email; falls back to on-screen codes), MyMemory (PT→EN/FR
bio translation; falls back to the source text). Every integration degrades
instead of failing the request.

## Domain

Nine entities: `Member`, `Project`, `Publication`, `ResearchArea`, `Professor`,
`MemberProject`, `RoleHistory`, `InviteToken`, `AuditLog`. Thirteen controllers
split three ways:

- **Public** (`/api/v1/members`, `/projects`, `/publications`, `/areas`, `/graph`) — unauthenticated reads, redacted through `MemberPublicView`.
- **Portal** (`/api/v1/me/**`) — self-service for any logged-in member: profile, bio, research areas, publication submission, project links.
- **Admin** (`/api/v1/admin/**`) — the *Central de Comando*: roster, credentials, publication moderation, projects, audit log.

`MemberRole` is the academic hierarchy, junior→senior: `UNDERGRAD`, `MASTER`,
`DOCTORATE`, `MANAGER`, `COORDINATOR`, `HEAD`. **This is not the security role.**
The security authority is `MEMBER` or `MANAGER`, resolved per request by
`ManagerAllowlist` from either (a) the `LAPS_MANAGER_EMAILS` allowlist or (b) a
`MANAGER`/`COORDINATOR` tier. `HEAD` is seniority, not console duty, and needs an
allowlist entry.

## Security model

The distinctive design decisions, most of which exist because something was wrong
before:

- **JWT in an HttpOnly + Secure + SameSite=Lax cookie.** CSRF is disabled; `Lax` plus non-GET mutations is what covers it.
- **Authority is recomputed on every request** in `JwtAuthFilter`, never trusted from the token's claim — so a demotion takes effect immediately.
- **BCrypt cost 12** for passwords and the 6-digit email code; **SHA-256** for high-entropy invite tokens (`TokenHashing` — the split is deliberate and documented there).
- **Proof-of-work** challenge on login, set-password and invite registration.
- **Two-key rate limiting** (per-IP and per-account) in `AuthRateLimiter`, with a bounded key space.
- **`EmailSendBudget`** caps outbound mail: 60s cooldown, 5/account/day, 200/day globally — because the recipient of a verification code is a self-service field.
- **Append-only audit log** (V25).
- **Email is identity.** `member.email` feeds the manager allowlist, so both write paths (portal + invite) refuse allowlisted addresses and case-insensitive collisions, and V29 enforces `UNIQUE (lower(email))`.

## Conventions

**Comments explain why, not what — and name the failure they prevent.** This is
the codebase's strongest convention: most non-obvious block carries the reasoning,
often including the bug that motivated it. Match it. A comment that restates the
code is worse than none.

- Tests are plain JUnit + Mockito, constructed with `new`, no Spring context — except `ApplicationContextSmokeTest`, which is the only one that boots the app.
- `@DisplayName` on every test, written as a claim about behaviour.
- Migrations carry long prose headers explaining intent and consequences.
- Errors are `ResponseStatusException`, rendered by `GlobalExceptionHandler` (which exists because Spring's default resolver turned every one of them into a 401).
- Frontend: PT-BR user-facing strings; portal components live in `routes/portal.tsx`, shared ones in `components/`.

## Build & run

```bash
# Backend — ALWAYS skip the frontend for Java-only work.
# Without this, `npm ci` runs at generate-resources and wipes node_modules.
cd laps-api && mvn -Dskip.frontend=true test

# Frontend
cd laps-signal-lab && npm run dev          # Vite on :5173, expects API on :8080
npx tsc --noEmit && npx eslint src/...     # typecheck + lint

# Full stack
docker compose up --build -d               # needs .env — see .env.example
```

`application.yml` imports an optional `.env`; nothing is committed. `.env.example`
at the repo root is the canonical variable list.

## Open items

- **Migrations V28/V29 have never run against a real Postgres.** V29 halts startup if two members' emails collide case-insensitively — intentionally; the triage query is in the file.
- **No CI.** Tests and typecheck are manual.
- Brevo blocks API calls from unrecognised IPs; Render's outbound ranges must be allowlisted or verification emails fail with a 502.
- Cloudinary unset on Render free tier means uploaded photos are destroyed on every redeploy.
- `LAPS_TRUSTED_PROXY_HOPS` is unverified on Render — wrong-too-low lets one attacker rate-limit every member out of login.
- Spring Boot 4.x is the eventual upgrade; 3.5 is the last 3.x line.
