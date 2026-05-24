import { useMemo, useState } from "react";
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Crown,
  Microscope,
  GraduationCap,
  Users,
  Network,
  Triangle,
  List,
  Search,
  Filter,
  X,
  Shield,
  Briefcase,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/hooks/use-lang";
import { useTeamRoster, type RosterMember } from "@/hooks/use-team-roster";
import { CountUp } from "@/components/CountUp";
import { TeamGraph } from "@/components/TeamGraph";
import { PublicLayout } from "@/components/PublicLayout";
import { fetchProjects, type ApiProject } from "@/lib/api";
import { initials, type Tier } from "@/lib/team-data";

type View = "mesh" | "pyramid" | "list";

const VIEW_ICON: Record<View, typeof Network> = {
  mesh: Network,
  pyramid: Triangle,
  list: List,
};

const TIER_ORDER: Tier[] = ["head", "coordinator", "manager", "doctorate", "master", "undergrad"];

const TIER_VISUAL: Record<
  Tier,
  { gradient: string; ring: string; icon: typeof Crown; chipBg: string; chipText: string }
> = {
  head: {
    gradient: "from-laps-navy to-laps-blue",
    ring: "ring-laps-light/40",
    icon: Crown,
    chipBg: "bg-laps-ghost",
    chipText: "text-laps-blue",
  },
  coordinator: {
    gradient: "from-violet-700 to-violet-400",
    ring: "ring-violet-200",
    icon: Shield,
    chipBg: "bg-violet-50",
    chipText: "text-violet-700",
  },
  manager: {
    gradient: "from-purple-600 to-purple-300",
    ring: "ring-purple-200",
    icon: Briefcase,
    chipBg: "bg-purple-50",
    chipText: "text-purple-700",
  },
  doctorate: {
    gradient: "from-laps-blue to-laps-light",
    ring: "ring-laps-blue/30",
    icon: Microscope,
    chipBg: "bg-blue-50",
    chipText: "text-laps-blue",
  },
  master: {
    gradient: "from-emerald-500 to-emerald-300",
    ring: "ring-emerald-200",
    icon: GraduationCap,
    chipBg: "bg-emerald-50",
    chipText: "text-emerald-700",
  },
  undergrad: {
    gradient: "from-amber-400 to-amber-200",
    ring: "ring-amber-200",
    icon: Users,
    chipBg: "bg-amber-50",
    chipText: "text-amber-700",
  },
};

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
      {/* HERO */}
      <section className="relative bg-gradient-to-b from-laps-ghost/40 via-white to-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-block rounded-full bg-laps-ghost px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-laps-blue">
            {t.structure.chip}
          </span>
          <h1 className="font-display mt-6 text-4xl font-bold text-laps-navy md:text-5xl">
            {t.structure.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-laps-navy/75 md:text-lg">
            {t.structure.body}
          </p>
        </div>

        {/* Tier counts */}
        <div className="mx-auto mt-10 grid max-w-6xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[
            { tier: "head" as Tier, label: labels.tier.head, value: tierCounts.head },
            { tier: "coordinator" as Tier, label: labels.tier.coordinator, value: tierCounts.coordinator },
            { tier: "doctorate" as Tier, label: labels.tier.doctorate, value: tierCounts.doctorate },
            { tier: "master" as Tier, label: labels.tier.master, value: tierCounts.master },
            { tier: "undergrad" as Tier, label: labels.tier.undergrad, value: tierCounts.undergrad },
          ].map((tier) => {
            const v = TIER_VISUAL[tier.tier];
            const Icon = v.icon;
            return (
              <div
                key={tier.label}
                className="group rounded-2xl border border-laps-light/25 bg-white p-5 shadow-[0_2px_20px_rgba(25,58,89,0.05)] transition hover:-translate-y-1 hover:shadow-[0_14px_40px_-12px_rgba(11,78,141,0.18)]"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${v.chipBg} ring-4 ring-${tier.tier === "head" ? "laps-blue/20" : "transparent"}`}>
                  <Icon className={`h-5 w-5 ${v.chipText}`} />
                </div>
                <div className={`font-display mt-4 text-3xl font-bold ${v.chipText}`}>
                  <CountUp end={tier.value} />
                </div>
                <div className="mt-1 text-sm font-medium text-laps-navy/70">{tier.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* VIEW TABS */}
      <section className="relative bg-white pt-4">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex justify-center">
            <div className="relative inline-flex items-center gap-0.5 rounded-full border border-laps-navy/10 bg-white/80 p-1 shadow-sm backdrop-blur">
              {(Object.keys(VIEW_ICON) as View[]).map((v) => {
                const Icon = VIEW_ICON[v];
                const active = view === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className="relative isolate px-1 py-1"
                    aria-pressed={active}
                  >
                    {active && (
                      <>
                        <motion.span
                          layoutId="view-pill-outer"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          className="absolute inset-0 -z-10 rounded-full bg-laps-blue shadow-[0_4px_14px_rgba(11,78,141,0.25)]"
                        />
                        <motion.span
                          layoutId="view-pill-inner"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          className="absolute inset-[3px] -z-10 rounded-full bg-white"
                        />
                      </>
                    )}
                    <span
                      className={`relative inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors md:text-sm ${
                        active ? "text-laps-blue" : "text-laps-navy/65 hover:text-laps-navy"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      {labels.views[v]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* VIEW CONTENT */}
      <section className="relative bg-white pb-24 pt-8">
        <div className="mx-auto max-w-6xl px-6">
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
        const v = TIER_VISUAL[tier];
        const Icon = v.icon;
        return (
          <motion.div
            key={tier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: tierIdx * 0.08 }}
            className="relative"
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${v.gradient} text-white shadow-sm`}>
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="font-display text-lg font-bold text-laps-navy">
                {labels.tier[tier]}
              </h3>
              <span className="rounded-full bg-laps-ghost px-2 py-0.5 text-xs font-bold text-laps-blue">
                {tierMembers.length}
              </span>
            </div>
            <div className="mx-auto flex max-w-5xl flex-wrap items-start justify-center gap-3 md:gap-4">
              {tierMembers.map((m) => (
                <Link
                  key={m.id}
                  to="/team/$uuid"
                  params={{ uuid: m.uuid ?? m.id }}
                  className="group flex w-24 flex-col items-center text-center md:w-28"
                >
                  <div
                    className={`relative h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br ${v.gradient} p-0.5 shadow-sm ring-2 ring-white transition group-hover:scale-105 group-hover:shadow-md md:h-20 md:w-20`}
                  >
                    {m.photo ? (
                      <img
                        src={m.photo}
                        alt={m.fullName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full text-sm font-bold text-white">
                        {initials(m.fullName)}
                      </div>
                    )}
                  </div>
                  <span className="mt-2 line-clamp-2 text-[11px] font-semibold leading-tight text-laps-navy/85 group-hover:text-laps-blue md:text-xs">
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
            className="w-full rounded-full border border-laps-navy/10 bg-white py-3 pl-11 pr-4 text-sm text-laps-navy shadow-sm placeholder:text-laps-navy/40 focus:border-laps-blue/40 focus:outline-none focus:ring-2 focus:ring-laps-blue/15"
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
            filtersOpen || hasActiveFilters
              ? "border-laps-blue bg-laps-blue text-white shadow-sm"
              : "border-laps-navy/10 bg-white text-laps-navy/75 hover:border-laps-blue/30 hover:text-laps-blue"
          }`}
        >
          <Filter className="h-4 w-4" />
          {labels.views.filterByRole} / {labels.views.filterByProject}
          {hasActiveFilters && (
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-laps-blue">
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
              className="md:col-span-2 inline-flex items-center justify-center gap-1.5 self-end rounded-full border border-laps-blue/20 bg-white px-4 py-2 text-xs font-semibold text-laps-blue transition hover:bg-laps-ghost"
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => {
            const v = TIER_VISUAL[m.tier];
            const Icon = v.icon;
            return (
              <Link
                key={m.id}
                to="/team/$uuid"
                params={{ uuid: m.uuid ?? m.id }}
                className="group flex items-center gap-4 rounded-2xl border border-laps-navy/8 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-laps-blue/25 hover:shadow-md"
              >
                <div
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gradient-to-br ${v.gradient} p-0.5 ring-2 ring-white`}
                >
                  {m.photo ? (
                    <img
                      src={m.photo}
                      alt={m.fullName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full text-xs font-bold text-white">
                      {initials(m.fullName)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-laps-navy group-hover:text-laps-blue">
                    {m.fullName}
                  </p>
                  <span
                    className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${v.chipBg} ${v.chipText}`}
                  >
                    <Icon className="h-3 w-3" /> {labels.tier[m.tier]}
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
          ? "bg-laps-blue text-white shadow-sm"
          : "border border-laps-navy/10 bg-white text-laps-navy/75 hover:border-laps-blue/25 hover:text-laps-blue"
      }`}
    >
      {children}
    </button>
  );
}
