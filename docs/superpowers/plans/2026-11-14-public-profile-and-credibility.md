# Public profile redesign, credibility and engineering hygiene

Date: 2026-11-14 · Status: Phases 1–3 + decisions implemented (uncommitted), Phases 4+ proposed

## Core scope (evaluation)

LAPS is three products in one deployable: a **public research site** (team,
profiles, projects, publications, exchange, partners), a **member portal**
(self-service profile and submissions) and an **admin console**. The security
side is mature — cookie JWT, recomputed authority, rate limits, append-only
audit, written-down reasoning. The public side is where credibility is won or
lost, and it was behind: profiles led with decoration (cover banner, network
graph, vanity counts) instead of the person and their research, and several
visible copy bugs (Portuguese words on English pages) undercut the rest.

The guiding rule for the follow-up: **a profile should answer "who is this,
what do they work on, and where is the evidence" — in that order.**

## Done in this pass

### Phase 1 — Network graph is no longer the main view
- `/team` opens on the **List** view; tab order is List → Hierarchy → Network.
  The graph is kept as the last tab.
- Team-photo CTA now scrolls to the roster ("Conhecer a equipe").
- Hero/caption/meta copy no longer describes the team as "a living neural network".
- i18n fixes: EN tier labels were Portuguese ("Doutorando", "Mestrando",
  "Graduando"); PT/FR `head` label was the English word "Head"; FR role titles
  are now gender-neutral; EN `exchange.tier.doctorate` was "Doutorando".

### Phase 2 — Dark mode removed
- Deleted `ThemeToggle`, `use-theme`, `lib/theme`; removed the pre-paint init
  script, all toggle mounts (public header, mobile menu, portal, admin), the
  `.dark` token block and dark-only partner-logo rules, and the remaining
  `dark:` utilities.
- `@custom-variant dark` is **kept on purpose**: deleting it makes Tailwind 4
  fall back to `prefers-color-scheme`, so any stray `dark:` class (shadcn ships
  them) would fire for OS-dark visitors. Comment in `styles.css` explains.

### Phase 3 — `/team/$uuid` profile redesign
- Hero is a **4:5 portrait card**: full photo, bottom scrim, name in white as
  the `<h1>`, role title beneath (Graduando(a) / Mestrando(a) / Doutorando(a) /
  Colaborador(a); EN/FR equivalents from `t.exchange.tier`). Initials fallback
  on the tier colour when there is no photo.
- Removed: cover banner, the three count tiles, "Sobre", the Impacts feed,
  "Outros do mesmo grupo".
- Added **Áreas de pesquisa / Research Interests** where the counts were
  (areas + interest tags).
- Everything else is an **accordion** (first section open): Projects (each
  project is itself collapsible; rows with no details are static), Publications
  (with **Google Scholar** button + external-link icon), **Prêmios e Bolsas /
  Honours & Awards** (impacts of kind AWARD, SCHOLARSHIP, DOCTORAL_SCHOLARSHIP),
  Research roadmap, Languages, Co-authors.
- Fixed: exchange chip was hard-coded "Intercambista" + Portuguese country
  names in every language.
- **Photo uploads** (portal editor) now export an 800×1000 JPEG instead of a
  512² circle-masked PNG — the mask made a rectangular card impossible. Round
  avatars elsewhere are CSS circles and are unaffected.

Verification: `tsc --noEmit` clean; no new non-formatting ESLint findings
(compared per file against HEAD); `vite build` passes and ships no dark rules;
visually checked desktop + 390px against a mock API (photo, no-photo, open
sections, Scholar link, `/team` default tab).

## Decisions (resolved 2026-11-14)

1. **Fonts — self-host. Done.** The Google Fonts `@import` sat below Tailwind's
   expansion (ignored by browsers) and was blocked by both CSPs
   (`font-src 'self'`), so the site rendered in system-ui. Now bundled from
   `@fontsource/archivo` + `@fontsource/ibm-plex-mono` (pinned 5.3.0): 30 local
   `@font-face` rules, no Google requests, no CSP change. `bun.lock` was not
   regenerated — see Phase 7 (one package manager).
2. **Bio — removed from the portal and the admin member dialog. Done.**
   Members curate Research Areas + "Interesses de pesquisa" instead. Stored
   bios stay in the database (admin no longer sends `bioPt`, which
   `AdminController` reads as "leave alone"). Follow-up: drop `bio_*` columns
   and the MyMemory translation path once nothing reads them.
3. **Home-page counters — keep.**
4. **Lab name — Laboratório de Aquisição e Processamento de Sinais. Done**
   (email footer and `CLAUDE.md` were the only "Análise" occurrences).
5. Section name **"Prêmios e Bolsas"**; profile projects are collapsible on the
   profile only (the `/projects` page is unchanged).

## Found while running the stack (fixed)

- **SPA API base was chosen by port.** `resolveApiBase()` treated any port
  other than 80/443/8080 as the Vite dev server and sent API calls (with
  credentials) to `:8080`. A production jar on any other `APP_HOST_PORT`
  therefore called a different service and every data page failed. It now
  uses build mode: production builds are same-origin; dev builds use `:8080`;
  `VITE_API_BASE` still overrides (needed for `vite preview`).
- First real run of V30–V33 against Postgres (local volume was at V29):
  applied cleanly.

## Round 2 (requested 2026-11-14) — one phase at a time, user approves each

Direction: **Notícias is the main navigation tool.** Prizes and scholarships
are news items with type tags, not a separate data model; the Impacts API is
removed entirely. Header (Equipe and Contato stay where they are):
`Equipe · Home ▾ (Sobre, Parceiros) · Notícias ▾ (Projetos, Intercâmbio, Prêmios e Bolsas) · Contato`.

- [x] **Phase 4 — Impactos → Prêmios e Bolsas** (copy, `/premios-e-bolsas`,
  `/impactos` redirect, backend route + test).
- [x] **Phase 5 — "Undergrad" → "Undergraduate"** in every user-facing string
  (EN exchange copy, tier census, code comments; applied SQL migrations left
  untouched — editing them breaks Flyway checksums), and **black gradient
  removed** from the profile photo card. White caption text keeps legibility
  through a glyph-hugging text-shadow, not an overlay.
- [x] **Phase 6 — News API + console editor.** V34 (`news`, `news_category`,
  `news_member`; prose header), package `br.uema.laps.news` (entity, input,
  view, service, public + admin controllers). Public `GET /api/v1/news`
  (`?category=` any-of, `?memberId=`) and `/{id}`; manager-only
  `POST/PUT/DELETE /api/v1/admin/news`, audited. Service refuses unknown or
  removed people, non-http(s) links, and images that are neither `/uploads/`
  nor https. Tests first: 13 service, 4 validation, 2 migration-contract,
  2 security smoke (180 backend tests green). V34 verified on real Postgres
  under `ddl-auto=validate`. Console: `components/admin/NewsSection.tsx`
  (trilingual title/subtitle, image upload, link, categories, tags, ordered
  people), request body checked against `NewsInput`.
  **Bug found and fixed on the way:** the project researcher picker and the
  publication author picker shared the `["admin","members"]` cache key with a
  different fetcher and shape, so their searches always returned nothing
  (confirmed by A/B test). One hook now owns that key: `hooks/use-admin-roster.ts`.
- [x] **Phase 7 — Impacts API removed entirely** (done before the Notícias
  page, at the user's request). Backend `impact` package and its tests
  deleted, public permit removed, **V35 drops table `impact`** (rows deleted,
  not migrated — the lab's decision). Contract test + smoke test pin the
  removal. Frontend `lib/impacts.ts`, `components/impacts/*` and the portal
  editor deleted; Prêmios e Bolsas page and the profile section now read news
  tagged AWARD or SCHOLARSHIP. 176 backend tests green; V35 verified on
  Postgres.
- [x] **Phase 8 — Notícias page + new navigation.** `/noticias` (route
  test-first in SpaControllerRouteTest; SecurityConfig permit). Shared
  `components/news/NewsCard.tsx` and `NewsFeed.tsx` — Prêmios e Bolsas is the
  same feed scoped to AWARD+SCHOLARSHIP. Header: `Equipe · Home ▾ (Sobre,
  Parceiros) · Notícias ▾ (Projetos, Intercâmbio, Prêmios e Bolsas) · Contato`.
  Fixed on the way: dropdowns were hover-only (now also open on keyboard
  focus); the mobile menu dropped parent items; hash links (Parceiros) were
  marked active on every home visit; the footer listed only top-level items.
  177 backend tests green.
- [x] **Phase 9 — /portal redesign.** Hero mirrors the public profile: a
  4:5 portrait card (name + role on the photo, no scrim) with an always-visible
  photo button (the old circular avatar's upload control was hover-only). Cover
  banner editor, stat tiles and circular avatar removed. Every editor is now a
  section of one controlled accordion (`PortfolioCard` → accordion item keyed
  by a stable `section`, not the translated title), ordered like the public
  profile; the onboarding guide's target section is forced open; the password
  card stays outside the accordion. Fixed on the way: the "Publicações" stat
  tile was hard-coded to 0; **members without a roadmap could never create one**
  (the section returned null and its own Editar button was the only way in —
  since 87c5cb7, May); guide copy named the old card title.

## Round 3 (requested 2026-11-14), one phase at a time

- [x] **Phase 10: no dashes.** Every em/en dash in user-facing text rewritten
  (page titles use "|", sentences use commas/colons/periods, empty values say
  "Não informado", select placeholders lose their dash brackets, level labels
  use "·", numeric ranges use "a"); backend messages users can see (session
  expiry, author validation, email footer) too. Decorative dashes removed: the
  14px mark before `.label-tech` and four hover-stub lines. Verified: zero
  dashes in the compiled bundle; 177 backend tests green.
- [ ] **Phase 11: /team.** Remove Lista; Hierarquia then Rede Neural stacked
  vertically (no tabs). Each tier an accordion listing its people one per row.
  Undergraduates without photos, subtitled with their programme ("Graduando(a)
  em Engenharia de Computação" / "B.Sc. in Artificial Intelligence").
- [ ] **Phase 12: members change their own major.** Backend: `undergradProgram`
  on the portal update (today admin-only); portal editor.
- [ ] **Phase 13: email first.** On login (and right after /join), anyone with
  an unverified email goes to a dedicated page to add and verify it before
  /portal or /admin. After verification the password change is **not**
  forced: a dismissible reminder suggests it while a temporary password is in
  use, and the temporary password stays valid (user's decision, risk noted:
  whoever issued or saw it keeps access until the member changes it).

Prerequisite for Phase 6: commit the staged security work (V33) first, so the
new migration lands on top of it rather than in the same diff.

The earlier follow-ups below are renumbered after these.

## Follow-up phases

### Phase 4 — Dedicated Google Scholar field (backend)
Today the button only appears when a member's custom link is a Scholar URL
(exact-host match). To make it first-class:
- V34: `google_scholar_url` + `show_google_scholar` on `member`.
- `Member`, `MemberPublicView` (redaction), portal update DTO, admin roster.
- Server-side validation: https, host `scholar.google.<tld>` only.
- Portal input with the visibility toggle; profile reads the new field first.
- Tests: redaction claim, host validation claim.
- **Prerequisite:** commit the in-flight JWT hardening work first — it touches
  `Member.java`, `MyPortalController` and V33, and the two changes should not
  share a diff.

### Phase 5 — Photo migration
Existing photos are circular PNGs; they render as a disc in the new card until
re-uploaded. Options: a one-time portal banner asking members to re-upload,
and/or a manager list of members with legacy (PNG) photos. Admin uploads
bypass the editor and are already rectangular.

### Phase 6 — Retire banners
- Remove `BannerEditor` from the portal (it edits something no public page shows).
- After one release, migration to drop `banner_color` / `banner_image_url`.

### Phase 7 — Engineering hygiene
- **CI** (none today): `mvn -Dskip.frontend=true test`, `tsc --noEmit`,
  `eslint`, `vite build` on every push.
- One formatting-only commit (`prettier --write`) so lint signal is usable —
  ~90 Prettier errors in the files touched here alone.
- `admin.tsx`: 14 `react-hooks/rules-of-hooks` violations (hooks called after
  a conditional return) — a real crash risk when that condition flips.
- Dead code: `NeuralMesh.tsx`, `LapsLogoAnimationWhite.tsx`,
  `public/images/partners/uema-white.png`, `i18n structure.tiers` (hard-coded
  head-counts, unreferenced), `structure.roles`.
- One package manager: both `bun.lock` and `package-lock.json` are committed.
- Template leftovers: `wrangler.jsonc`, `@cloudflare/vite-plugin`,
  `@lovable.dev/vite-tanstack-config`, package name `tanstack_start_ts`.
- `README.md` is empty; `CLAUDE.md` is stale (29→33 migrations, test count,
  role list predates V31 capabilities).
- Frontend has no tests: add Vitest for pure helpers first
  (`mergePublications`, `googleScholarUrl`, honours merge/sort).

### Phase 8 — Content credibility
- Make the database the single source of truth: migrate seed publications /
  tags / areas (`publications-data.ts`, `team-data.ts`) into the DB, then
  delete the overlay. Co-authors are currently derived from seed data only, so
  API-submitted papers never produce co-author links.
- Header nav order puts Home third ("Equipe, Sobre, Home…").
- Profile `<meta description>` could use the research areas instead of the
  generic lab line.
