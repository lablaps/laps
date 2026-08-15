import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Globe, Plane, Users, Languages, Loader2, MapPin } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { PublicLayout } from "@/components/PublicLayout";
import { initials, type Tier } from "@/lib/team-data";
import { fetchMembers, resolveMediaUrl, type ApiMember } from "@/lib/api";
import { applyOverlay } from "@/lib/static-source";
import {
  COUNTRIES,
  BRAZIL,
  BR_STATES,
  BR_STATE_ORDER,
  countryName,
  brStateName,
  type CountryCode,
} from "@/lib/exchange-data";
import { CountryFlag, BrStateFlag } from "@/lib/flags";
import { LANGUAGE_BY_CODE, parseLanguages } from "@/lib/languages-data";

export const Route = createFileRoute("/exchange")({
  component: ExchangePage,
  head: () => ({
    meta: [
      { title: "International Exchange — LAPS" },
      {
        name: "description",
        content:
          "LAPS researchers and students on academic mobility — the destinations, academic levels and working languages of every member who has studied away.",
      },
    ],
  }),
});

const ROLE_TO_TIER: Record<string, Tier> = {
  HEAD: "head",
  COORDINATOR: "coordinator",
  MANAGER: "manager",
  DOCTORATE: "doctorate",
  MASTER: "master",
  UNDERGRAD: "undergrad",
};

// Visual styling per tier — mirrors the palette used on /team and /team/$uuid
// so an exchange researcher's card reads like a peer-card you'd see elsewhere.
const TIER_VISUAL: Record<Tier, { gradient: string; ring: string }> = {
  head: { gradient: "from-laps-navy to-laps-blue", ring: "ring-laps-light/40" },
  coordinator: { gradient: "from-violet-700 to-violet-400", ring: "ring-violet-200" },
  manager: { gradient: "from-purple-600 to-purple-300", ring: "ring-purple-200" },
  doctorate: { gradient: "from-laps-blue to-laps-light", ring: "ring-laps-blue/30" },
  master: { gradient: "from-emerald-500 to-emerald-300", ring: "ring-emerald-200" },
  undergrad: { gradient: "from-amber-400 to-amber-200", ring: "ring-amber-200" },
};

interface CountryGroup {
  code: CountryCode;
  members: ApiMember[];
  /** Populated for Brazil only — domestic placements are grouped by UF. */
  byState: { state: string; members: ApiMember[] }[];
}

/**
 * Public exchange roster.
 *
 * Previously this page rendered `exchangeRoster` — a hand-written list of six
 * member slugs in exchange-data.ts — joined against the bundled team file. That
 * is why adding an intercambista in the Central de Comando changed nothing
 * here: the admin write landed on `member.exchange_country` in the database,
 * which this page never read. It now groups the live roster by that column, so
 * a placement set in the console shows up on the next load, and countries
 * appear and disappear on their own as members are added and cleared.
 */
function ExchangePage() {
  const { t, lang } = useLang();
  const tx = t.exchange;

  const { data, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
    // Short enough that coming back to this tab after editing a member in the
    // console shows the change, rather than a cached roster from before it.
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const groups = useMemo<CountryGroup[]>(() => {
    const members = (data ? applyOverlay(data) : []).filter(
      (m) => !m.deletedAt && m.exchangeCountry,
    );

    const byCountry = new Map<CountryCode, ApiMember[]>();
    for (const m of members) {
      const code = m.exchangeCountry!.toUpperCase();
      const bucket = byCountry.get(code);
      if (bucket) bucket.push(m);
      else byCountry.set(code, [m]);
    }

    const collator = new Intl.Collator(lang);
    return [...byCountry.entries()]
      .map(([code, list]) => {
        list.sort((a, b) => collator.compare(a.fullName, b.fullName));

        // Brazil is subdivided by UF; every other country is a flat list.
        const byState: CountryGroup["byState"] = [];
        if (code === BRAZIL) {
          const stateBuckets = new Map<string, ApiMember[]>();
          for (const m of list) {
            // A domestic placement with no UF recorded still has to appear —
            // dropping it would silently hide a member from the page.
            const uf = (m.exchangeState ?? "").toUpperCase();
            const bucket = stateBuckets.get(uf);
            if (bucket) bucket.push(m);
            else stateBuckets.set(uf, [m]);
          }
          const ordered = BR_STATE_ORDER.filter((uf) => stateBuckets.has(uf));
          if (stateBuckets.has("")) ordered.push("");
          for (const uf of ordered) byState.push({ state: uf, members: stateBuckets.get(uf)! });
        }

        return { code, members: list, byState };
      })
      .sort((a, b) => {
        // Busiest destination first, then alphabetically so the order is stable.
        if (b.members.length !== a.members.length) return b.members.length - a.members.length;
        return collator.compare(countryName(a.code, lang), countryName(b.code, lang));
      });
  }, [data, lang]);

  const totalCount = groups.reduce((sum, g) => sum + g.members.length, 0);
  const destinationNames = groups.map((g) => countryName(g.code, lang)).join(", ");

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-laps-ghost/40 via-white to-white py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-block rounded-full bg-laps-ghost px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-laps-blue">
            {tx.chip}
          </span>
          <h1 className="font-display mt-6 text-4xl font-bold text-laps-navy md:text-5xl">
            {tx.heroTitle}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-laps-navy/75 md:text-lg">
            {tx.heroBody}
          </p>

          {/* Quick summary cards — all three derived from the live roster. */}
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <SummaryCard
              icon={Users}
              label={tx.summary.label}
              value={tx.summary.countWithCount(totalCount)}
            />
            <SummaryCard
              icon={Globe}
              label={tx.summary.label}
              value={tx.summary.countriesWithCount(groups.length, destinationNames)}
            />
            <SummaryCard icon={Languages} label={tx.summary.label} value={tx.summary.languages} />
          </div>
        </div>
      </section>

      {/* COUNTRY SECTIONS */}
      <section className="bg-white pb-20">
        <div className="mx-auto max-w-6xl space-y-12 px-6">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-laps-navy/55">
              <Loader2 className="h-5 w-5 animate-spin" /> {tx.labels.loading}
            </div>
          )}

          {!isLoading && groups.length === 0 && (
            <p className="py-16 text-center text-sm italic text-laps-navy/45">{tx.labels.empty}</p>
          )}

          {groups.map((group) => {
            const isBrazil = group.code === BRAZIL;
            return (
              <div
                key={group.code}
                className="overflow-hidden rounded-3xl border border-laps-blue/15 bg-white shadow-[0_2px_20px_rgba(25,58,89,0.06)]"
              >
                {/* Country header — flag + name + count */}
                <div className="flex flex-col gap-4 border-b border-laps-blue/10 bg-laps-ghost/30 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-[52px] w-[80px] shrink-0 overflow-hidden rounded-md shadow-[0_0_0_1px_rgba(0,0,0,0.12)]">
                      <CountryFlag code={group.code} />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-laps-navy">
                        {countryName(group.code, lang)}
                      </h2>
                      <p className="text-xs font-semibold uppercase tracking-wider text-laps-navy/55">
                        {group.members.length} {tx.labels.students}
                        <span className="ml-2 text-laps-navy/35">
                          · {isBrazil ? tx.labels.national : tx.labels.international}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Plane className="hidden h-6 w-6 shrink-0 text-laps-blue/60 sm:block" />
                </div>

                {isBrazil ? (
                  // Domestic placements are grouped a level deeper, by state.
                  <div className="divide-y divide-laps-blue/10">
                    {group.byState.map(({ state, members }) => (
                      <div key={state || "sem-uf"} className="p-6">
                        <div className="mb-4 flex items-center gap-3">
                          {state ? (
                            <div className="h-7 w-[42px] shrink-0 overflow-hidden rounded shadow-[0_0_0_1px_rgba(0,0,0,0.12)]">
                              <BrStateFlag code={state} />
                            </div>
                          ) : (
                            <MapPin className="h-4 w-4 shrink-0 text-laps-navy/35" />
                          )}
                          <h3 className="text-sm font-bold text-laps-navy">
                            {state ? brStateName(state) : "—"}
                            {state && (
                              <span className="ml-2 text-[11px] font-semibold uppercase tracking-wider text-laps-navy/40">
                                {BR_STATES[state]?.region}
                              </span>
                            )}
                          </h3>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-laps-navy/45">
                            {members.length} {tx.labels.students}
                          </span>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {members.map((m) => (
                            <ExchangeCard key={m.id} member={m} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                    {group.members.map((m) => (
                      <ExchangeCard key={m.id} member={m} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CULTURAL IMMERSION + LAB OPPORTUNITY */}
      <section className="bg-laps-ghost/30 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
          <article className="rounded-2xl border border-laps-blue/15 bg-white p-7 shadow-[0_2px_20px_rgba(25,58,89,0.06)]">
            <h3 className="font-display text-xl font-bold text-laps-navy">{tx.reality.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-laps-navy/80">{tx.reality.body}</p>
          </article>
          <article className="overflow-hidden rounded-2xl bg-gradient-to-br from-laps-navy to-laps-blue p-7 text-white shadow-lg">
            <h3 className="font-display text-xl font-bold">{tx.opportunity.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-white/90">{tx.opportunity.body}</p>
          </article>
        </div>
      </section>
    </PublicLayout>
  );
}

function SummaryCard({
  icon: IconComp,
  label,
  value,
}: {
  icon: typeof Globe;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-laps-blue/12 bg-white p-4 text-left">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-laps-ghost text-laps-blue">
        <IconComp className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
          {label}
        </div>
        <div className="text-sm font-semibold text-laps-navy">{value}</div>
      </div>
    </div>
  );
}

function ExchangeCard({ member }: { member: ApiMember }) {
  const { t, lang } = useLang();
  const tx = t.exchange;
  const tier = ROLE_TO_TIER[member.currentRole] ?? "undergrad";
  const visual = TIER_VISUAL[tier];
  const photo = member.photoUrl ? resolveMediaUrl(member.photoUrl) : null;
  // Languages come from the member's own profile now, rather than from a
  // hand-kept list that had to be edited alongside the roster.
  const languages = parseLanguages(member.languages).slice(0, 4);

  return (
    <Link
      to="/team/$uuid"
      params={{ uuid: member.id }}
      className="group flex flex-col gap-3 rounded-2xl border border-laps-light/30 bg-white p-5 transition hover:-translate-y-0.5 hover:border-laps-blue/40 hover:shadow-[0_10px_30px_rgba(11,78,141,0.12)]"
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-md ring-2 ${visual.ring}`}
        >
          {photo ? (
            <img
              src={photo}
              alt={member.fullName}
              loading="lazy"
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span
              className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${visual.gradient} text-base font-bold text-white`}
            >
              {initials(member.fullName)}
            </span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold leading-tight text-laps-navy">{member.fullName}</h4>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-laps-blue">
            {tx.tier[tier]}
          </p>
        </div>
      </div>

      {languages.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {languages.map((entry) => (
            <span
              key={entry.code}
              className="inline-flex items-center gap-1 rounded-full border border-laps-blue/15 bg-laps-ghost/40 px-2 py-0.5 text-[10px] font-semibold text-laps-navy/75"
            >
              {LANGUAGE_BY_CODE[entry.code]?.name[lang] ?? entry.code.toUpperCase()}
            </span>
          ))}
        </div>
      )}

      <span className="mt-1 text-[11px] font-semibold text-laps-blue/80 group-hover:text-laps-blue">
        {tx.labels.seeProfile} →
      </span>
    </Link>
  );
}
