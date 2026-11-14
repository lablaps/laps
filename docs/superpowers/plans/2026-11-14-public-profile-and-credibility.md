# Public profile redesign, credibility and engineering hygiene

Date: 2026-11-14 · Status: Phases 1–3 implemented (uncommitted), Phases 4+ proposed

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
  (with **Google Scholar** button + external-link icon), **Honras e Bolsas /
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

## Decisions needed

1. **Brand fonts never load in production.** `styles.css` `@import`s Google
   Fonts, but (a) Tailwind expansion puts it after other rules, where browsers
   ignore it, and (b) both CSPs (`SecurityConfig`, `nginx.conf`) only allow
   `'self'` for styles and fonts. The site renders in system fallback today.
   *Recommendation:* self-host with `@fontsource/archivo` +
   `@fontsource/ibm-plex-mono` — fixes both, needs no CSP change, and stops
   sending visitor IPs to Google (LGPD).
2. **Bio ("Sobre")** is gone from the profile but still edited (and
   machine-translated) in the portal. Remove it from the portal too, or show it
   somewhere (e.g. the network graph side panel only)?
3. **Home-page counters** (years / publications / projects / researchers) are
   the same kind of volume metric removed from profiles. Keep or replace?
4. Official lab name: the site says *Aquisição* e Processamento de Sinais,
   `CLAUDE.md` says *Análise*. Confirm and align.

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
