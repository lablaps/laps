import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
// Crown / Shield / Briefcase / Microscope / GraduationCap / Users went with the
// per-tier icon chips; ArrowDown went with the arrow stapled to the photo CTA.
import { Network, Triangle, List, Search, Filter, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/hooks/use-lang";
import { useTeamRoster, type RosterMember } from "@/hooks/use-team-roster";
import { CountUp } from "@/components/CountUp";
import { TeamGraph } from "@/components/TeamGraph";
import { PublicLayout } from "@/components/PublicLayout";
import { fetchProjects, type ApiProject } from "@/lib/api";
import { initials, type Tier } from "@/lib/team-data";
import { TIER_CLASS } from "@/lib/tier-visual";
import teamPhoto from "@/assets/laps-team.jpeg";

type View = "mesh" | "pyramid" | "list";

const VIEW_ICON: Record<View, typeof Network> = {
  mesh: Network,
  pyramid: Triangle,
  list: List,
};

const TIER_ORDER: Tier[] = ["head", "coordinator", "manager", "doctorate", "master", "undergrad"];

// Tier colours come from lib/tier-visual.ts now — one ramp shared with the
// graph and /exchange, instead of three drifting copies of a six-hue table.

export const Route = createFileRoute("/team")({
  component: TeamPage,
  head: () => ({
    meta: [
      { title: "Team — LAPS" },
      {
        name: "description",
        content:
          "The LAPS researcher network — head, doctoral students, MSc students and undergrad researchers, presented as an interactive neural mesh, hierarchy and list.",
      },
    ],
  }),
});

function TeamPage() {
  const { t, lang } = useLang();
  const { members, tierCounts } = useTeamRoster();
  const [view, setView] = useState<View>("mesh");
  const networkRef = useRef<HTMLElement>(null);

  /**
   * Hand-off from the team photo into the graph: force the mesh view (the
   * visitor asked for the network, not whichever tab was last active) and scroll
   * it into frame. Honours prefers-reduced-motion — a long smooth scroll is a
   * common vestibular trigger.
   */
  function goToNetwork() {
    setView("mesh");
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    networkRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }
  const { pathname } = useLocation();

  // team.$uuid is registered as a child route of /team, so when the URL is
  // /team/<id> TanStack routes here first. Without an outlet the detail page
  // never paints. Hand off rendering to the child whenever the pathname is
  // deeper than /team itself.
  const isDetail = pathname.startsWith("/team/") && pathname !== "/team";
  if (isDetail) {
    return <Outlet />;
  }

  const labels = t.structure.network;

  return (
    <PublicLayout>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-laps-navy/15 bg-laps-paper">
        <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="label-tech">/ {t.structure.chip}</p>
              <h1 className="font-display mt-6 text-[clamp(2.25rem,5vw,4.25rem)] font-extrabold leading-[0.95] text-laps-navy">
                {t.structure.title}
              </h1>
            </div>
            <p className="text-base leading-relaxed text-laps-navy/70 lg:col-span-5 lg:pt-3">
              {t.structure.body}
            </p>
          </div>

          {/* ── Tier counts ────────────────────────────────────────────────
              A ruled census, not five lifting cards each with its own coloured
              icon chip. The tiers are a ladder, so they are shown as one: read
              left to right they run senior → junior, and the only colour spent
              is the accent on `head`, which is one person.
              The dropped chips were Crown / Shield / Microscope / GraduationCap
              / Users — the stock glyph for each word, adding nothing the label
              beside them did not already say. */}
          <div className="mt-16 grid grid-cols-2 border-t border-laps-navy/15 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { tier: "head" as Tier, label: labels.tier.head, value: tierCounts.head },
              { tier: "coordinator" as Tier, label: labels.tier.coordinator, value: tierCounts.coordinator },
              { tier: "doctorate" as Tier, label: labels.tier.doctorate, value: tierCounts.doctorate },
              { tier: "master" as Tier, label: labels.tier.master, value: tierCounts.master },
              { tier: "undergrad" as Tier, label: labels.tier.undergrad, value: tierCounts.undergrad },
            ].map((tier, i) => (
              <div
                key={tier.label}
                className={[
                  "border-b border-laps-navy/15 py-6 pr-6 lg:border-b-0",
                  i > 0 ? "border-l border-laps-navy/15 pl-6" : "",
                ].join(" ")}
              >
                <div
                  className={`tnum font-mono text-3xl font-medium ${TIER_CLASS[tier.tier].text}`}
                >
                  <CountUp end={tier.value} />
                </div>
                <div className="mt-2 font-mono text-[10px] font-medium uppercase leading-tight tracking-[0.12em] text-laps-navy/55">
                  {tier.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM PHOTO — the first impression, and the hand-off into the graph */}
      <section className="relative bg-surface pt-16">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          {/* Square and unshadowed. A 24px radius with a 70px tinted drop shadow
              made the one real photograph on the site look like a stock card;
              a hard edge lets it read as a document. */}
          <figure className="group relative overflow-hidden border border-laps-navy/15">
            <img
              src={teamPhoto}
              alt={t.structure.teamPhoto.alt}
              width={1459}
              height={1078}
              loading="lazy"
              decoding="async"
              /* object-[center_35%] keeps the faces in frame as the crop tightens.
                 The height caps stop a 4:3 group shot from eating a whole screen. */
              className="w-full object-cover object-[center_35%] max-h-[20rem] sm:max-h-[26rem] md:max-h-[30rem]"
            />

            {/* Scrim only exists where the caption overlays the photo (md+).
                Sized to the text block rather than the whole frame, which would
                mute the faces this section exists to show. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-2/3 bg-gradient-to-t from-laps-ink/95 via-laps-ink/60 to-transparent md:block" />

            {/* Below the photo on phones — overlaying it would cover the people.
                Overlaid from md up, where there's room to do both. */}
            <figcaption className="bg-laps-ink p-6 md:absolute md:inset-x-0 md:bottom-0 md:bg-transparent md:p-8">
              <div className="max-w-2xl">
                <h2 className="font-display text-2xl font-bold text-balance text-white md:text-3xl">
                  {t.structure.teamPhoto.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-pretty text-white/85 md:text-base">
                  {t.structure.teamPhoto.caption}
                </p>
                <button
                  type="button"
                  onClick={goToNetwork}
                  className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-laps-ink transition-colors duration-150 hover:bg-laps-signal hover:text-white active:translate-y-px"
                >
                  <Network className="h-4 w-4" />
                  {t.structure.teamPhoto.cta}
                </button>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* VIEW TABS */}
      <section ref={networkRef} className="relative scroll-mt-24 bg-surface pt-16">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          {/* Flush-left tabs on a rule, marked by the same 2px accent the header
              nav uses. The floating capsule with a sliding pill inside it was
              the header's old treatment duplicated — two pill switchers on one
              page, neither of them belonging to the page's structure. */}
          <div className="flex border-b border-laps-navy/15">
            {(Object.keys(VIEW_ICON) as View[]).map((v) => {
              const Icon = VIEW_ICON[v];
              const active = view === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className="relative isolate -mb-px"
                  aria-pressed={active}
                >
                  <span
                    className={`relative inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold transition-colors md:text-sm ${
                      active ? "text-laps-navy" : "text-laps-navy/55 hover:text-laps-navy"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {labels.views[v]}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="view-marker"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-laps-signal"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* VIEW CONTENT */}
      <section className="relative bg-surface pb-24 pt-10">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          {view === "mesh" && <TeamGraph labels={labels} lang={lang} />}
          {view === "pyramid" && <PyramidView members={members} labels={labels} />}
          {view === "list" && <ListView members={members} labels={labels} />}
        </div>
      </section>
    </PublicLayout>
  );
}

// ───── PYRAMID VIEW ─────

function PyramidView({
  members,
  labels,
}: {
  members: RosterMember[];
  labels: ReturnType<typeof useLang>["t"]["structure"]["network"];
}) {
  return (
    <div className="flex flex-col gap-8 py-4">
      {TIER_ORDER.map((tier, tierIdx) => {
        const tierMembers = members.filter((m) => m.tier === tier);
        if (tierMembers.length === 0) return null;
        const c = TIER_CLASS[tier];
        return (
          <motion.div
            key={tier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: tierIdx * 0.08 }}
            className="relative"
          >
            {/* Tier heading as a ruled band: a dot on the ramp, the name, and
                the count in mono at the far right. Flush-left, because a
                hierarchy that centres each row hides the shape it is trying to
                show. */}
            <div className="flex items-baseline gap-3 border-b border-laps-navy/15 pb-3">
              <span className={`h-2 w-2 shrink-0 translate-y-[-1px] ${c.dot}`} />
              <h3 className={`font-display text-base font-bold ${c.text}`}>
                {labels.tier[tier]}
              </h3>
              <span className="tnum ml-auto font-mono text-[11px] text-laps-navy/45">
                {String(tierMembers.length).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap items-start gap-x-4 gap-y-6">
              {tierMembers.map((m) => (
                <Link
                  key={m.id}
                  to="/team/$uuid"
                  params={{ uuid: m.uuid ?? m.id }}
                  className="group flex w-24 flex-col items-center text-center md:w-28"
                >
                  <div
                    className={`relative h-16 w-16 overflow-hidden rounded-full border-2 border-transparent bg-laps-ghost transition-colors group-hover:border-laps-signal md:h-20 md:w-20`}
                  >
                    {m.photo ? (
                      <img
                        src={m.photo}
                        alt={m.fullName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full font-mono text-xs font-semibold text-laps-navy/60">
                        {initials(m.fullName)}
                      </div>
                    )}
                  </div>
                  <span className="mt-2 line-clamp-2 text-[11px] font-semibold leading-tight text-laps-navy/80 transition-colors group-hover:text-laps-signal md:text-xs">
                    {m.fullName}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ───── LIST VIEW ─────

function ListView({
  members,
  labels,
}: {
  members: RosterMember[];
  labels: ReturnType<typeof useLang>["t"]["structure"]["network"];
}) {
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Tier | "all">("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: projects = [] } = useQuery<ApiProject[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
  });

  // Map memberId/slug → list of project ids the member leads.
  const memberToProjects = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const p of projects) {
      for (const l of p.leaders ?? []) {
        const idsForMember = [l.memberId, l.member?.slug, l.member?.id].filter(Boolean) as string[];
        for (const memberKey of idsForMember) {
          if (!map.has(memberKey)) map.set(memberKey, new Set());
          map.get(memberKey)!.add(p.id);
        }
      }
    }
    return map;
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (roleFilter !== "all" && m.tier !== roleFilter) return false;
      if (projectFilter !== "all") {
        const memberKey = m.uuid ?? m.id;
        const projectIds = memberToProjects.get(memberKey) ?? memberToProjects.get(m.id);
        if (!projectIds || !projectIds.has(projectFilter)) return false;
      }
      if (q && !m.fullName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [members, search, roleFilter, projectFilter, memberToProjects]);

  const hasActiveFilters = roleFilter !== "all" || projectFilter !== "all";

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* Search + filter toggle */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-laps-navy/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={labels.views.search}
            className="w-full rounded-full border border-laps-navy/10 bg-surface py-3 pl-11 pr-4 text-sm text-laps-navy shadow-sm placeholder:text-laps-navy/40 focus:border-laps-blue/40 focus:outline-none focus:ring-2 focus:ring-laps-blue/15"
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
            filtersOpen || hasActiveFilters
              ? "border-laps-blue bg-laps-accent text-white shadow-sm"
              : "border-laps-navy/10 bg-surface text-laps-navy/75 hover:border-laps-blue/30 hover:text-laps-blue"
          }`}
        >
          <Filter className="h-4 w-4" />
          {labels.views.filterByRole} / {labels.views.filterByProject}
          {hasActiveFilters && (
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-laps-blue">
              {(roleFilter !== "all" ? 1 : 0) + (projectFilter !== "all" ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {filtersOpen && (
        <div className="grid gap-4 rounded-2xl border border-laps-navy/10 bg-laps-ghost/30 p-4 md:grid-cols-2">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              {labels.views.filterByRole}
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <FilterChip active={roleFilter === "all"} onClick={() => setRoleFilter("all")}>
                {labels.views.allRoles}
              </FilterChip>
              {TIER_ORDER.map((tier) => (
                <FilterChip
                  key={tier}
                  active={roleFilter === tier}
                  onClick={() => setRoleFilter(tier)}
                >
                  {labels.tier[tier]}
                </FilterChip>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              {labels.views.filterByProject}
            </label>
            <div className="mt-2 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
              <FilterChip
                active={projectFilter === "all"}
                onClick={() => setProjectFilter("all")}
              >
                {labels.views.allProjects}
              </FilterChip>
              {projects.map((p) => {
                const title =
                  (lang === "pt" ? p.titlePt : lang === "fr" ? p.titleFr : p.titleEn) ||
                  p.titleEn ||
                  p.slug;
                return (
                  <FilterChip
                    key={p.id}
                    active={projectFilter === p.id}
                    onClick={() => setProjectFilter(p.id)}
                  >
                    {title}
                  </FilterChip>
                );
              })}
            </div>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setRoleFilter("all");
                setProjectFilter("all");
              }}
              className="md:col-span-2 inline-flex items-center justify-center gap-1.5 self-end rounded-full border border-laps-blue/20 bg-surface px-4 py-2 text-xs font-semibold text-laps-blue transition hover:bg-laps-ghost"
            >
              <X className="h-3.5 w-3.5" /> {labels.views.clearFilters}
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm italic text-laps-navy/55">
          {labels.views.noResults}
        </p>
      ) : (
        // A ruled roster instead of a grid of shadowed, lifting cards. The tier
        // is now a dot on the ramp plus its name in mono — the pill badge that
        // carried a Lucide glyph and a tinted fill said the same thing three
        // times over.
        <div className="grid border-t border-laps-navy/15 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, i) => {
            const c = TIER_CLASS[m.tier];
            return (
              <Link
                key={m.id}
                to="/team/$uuid"
                params={{ uuid: m.uuid ?? m.id }}
                className={[
                  "group relative flex items-center gap-4 border-b border-laps-navy/15 py-4 pr-4 transition-colors hover:bg-laps-ghost/60",
                  i % 2 === 1 ? "sm:border-l sm:border-laps-navy/15 sm:pl-4" : "",
                  i % 3 !== 0 ? "lg:border-l lg:border-laps-navy/15 lg:pl-4" : "lg:border-l-0 lg:pl-0",
                ].join(" ")}
              >
                <span className="absolute left-0 top-0 h-0.5 w-0 bg-laps-signal transition-all duration-300 group-hover:w-full" />
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-laps-ghost">
                  {m.photo ? (
                    <img
                      src={m.photo}
                      alt={m.fullName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full font-mono text-[11px] font-semibold text-laps-navy/60">
                      {initials(m.fullName)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-laps-navy transition-colors group-hover:text-laps-signal">
                    {m.fullName}
                  </p>
                  <span className="mt-1.5 inline-flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 shrink-0 ${c.dot}`} />
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-laps-navy/50">
                      {labels.tier[m.tier]}
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
        active
          ? "bg-laps-accent text-white shadow-sm"
          : "border border-laps-navy/10 bg-surface text-laps-navy/75 hover:border-laps-blue/25 hover:text-laps-blue"
      }`}
    >
      {children}
    </button>
  );
}
