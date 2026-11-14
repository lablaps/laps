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
- [ ] **Phase 6 — News API (backend).** `news` entity: image, title,
  subtitle, tags, associated people (members), optional external link.
  Managers only — create/edit/delete in the admin console. Public list
  endpoint filterable by tag and by person. Image via the existing media
  upload. Flyway migration + tests (fail first).
  Tags: a fixed type set used for filtering (Prêmio, Bolsa, Nacional,
  Internacional) plus free-form tags.
- [ ] **Phase 7 — Notícias page + new navigation.** `/noticias` as cards
  (image, tags, title, subtitle, people, external link); the dropdown header
  above (desktop + mobile); `/premios-e-bolsas` becomes Notícias filtered by
  the Prêmio/Bolsa tags; the profile's "Prêmios e Bolsas" section reads news
  tagged that way and associated with the person; people on a card link to
  their profiles.
- [ ] **Phase 8 — Remove the Impacts API entirely.** Backend entity,
  controller, service, repository, DTOs, kind enum and their tests; a Flyway
  migration dropping table `impact`; frontend `lib/impacts.ts`,
  `components/impacts/*` and the portal editor. Runs after Phase 7 so no page
  loses its data source mid-way. **Deletes any production impact rows.**
- [ ] **Phase 9 — /portal redesign** to match the profile (portrait card,
  accordions). Last, so it is not built around the Impacts editor that
  Phase 8 deletes.

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
