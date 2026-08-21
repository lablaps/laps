import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
// Globe / Users / Languages / Plane went with the summary chips and the country
// header — see the notes at those call sites.
import { Loader2, MapPin } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { PublicLayout } from "@/components/PublicLayout";
import { initials, type Tier } from "@/lib/team-data";
import { TIER_CLASS } from "@/lib/tier-visual";
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
  COLLABORATOR: "collaborator",
  DOCTORATE: "doctorate",
  MASTER: "master",
  UNDERGRAD: "undergrad",
};

// The tier ramp lives in lib/tier-visual.ts — the same table the roster and the
// network graph read, so an exchange card places a member on exactly the same
// scale they occupy on /team.

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
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-laps-navy/15 bg-laps-paper">
        <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="label-tech">/ {tx.chip}</p>
              <h1 className="font-display mt-6 text-[clamp(2.25rem,5vw,4.25rem)] font-extrabold leading-[0.95] text-laps-navy">
                {tx.heroTitle}
              </h1>
            </div>
            <p className="text-base leading-relaxed text-laps-navy/70 lg:col-span-5 lg:pt-3">
              {tx.heroBody}
            </p>
          </div>

          {/* Quick summary — all three derived from the live roster.
              Ruled columns rather than three shadowed cards each led by a
              Globe / Users / Languages glyph. All three carried the same
              `tx.summary.label`, so the icons were the only thing telling them
              apart — which is the job the values themselves should do. */}
          <dl className="mt-16 grid border-t border-laps-navy/15 sm:grid-cols-3">
            <SummaryCard label={tx.summary.label} value={tx.summary.countWithCount(totalCount)} index={0} />
            <SummaryCard
              label={tx.summary.label}
              value={tx.summary.countriesWithCount(groups.length, destinationNames)}
              index={1}
            />
            <SummaryCard label={tx.summary.label} value={tx.summary.languages} index={2} />
          </dl>
        </div>
      </section>

      {/* COUNTRY SECTIONS */}
      <section className="bg-surface pb-20 pt-16">
        <div className="mx-auto max-w-[1280px] space-y-12 px-6 md:px-10">
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
              <div key={group.code} className="border border-laps-navy/15 bg-surface">
                {/* Country header — flag + name + count.
                    The decorative Plane glyph is gone: a page called "exchange"
                    listing countries by flag does not need a picture of an
                    aeroplane to explain itself. */}
                <div className="flex flex-col gap-4 border-b border-laps-navy/15 bg-laps-ghost/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-[52px] w-[80px] shrink-0 overflow-hidden rounded-sm shadow-[0_0_0_1px_rgba(0,0,0,0.12)]">
                      <CountryFlag code={group.code} />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-laps-navy">
                        {countryName(group.code, lang)}
                      </h2>
                      <p className="mt-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-laps-navy/50">
                        <span className="tnum">{group.members.length}</span> {tx.labels.students}
                        <span className="ml-2 text-laps-navy/35">
                          · {isBrazil ? tx.labels.national : tx.labels.international}
                        </span>
                      </p>
                    </div>
                  </div>
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
          <article className="rounded-md border border-laps-navy/15 bg-surface p-7">
            <h3 className="font-display text-xl font-bold text-laps-navy">{tx.reality.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-laps-navy/80">{tx.reality.body}</p>
          </article>
          <article className="overflow-hidden rounded-md bg-laps-ink p-7 text-white">
            <h3 className="font-display text-xl font-bold">{tx.opportunity.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-white/90">{tx.opportunity.body}</p>
          </article>
        </div>
      </section>
    </PublicLayout>
  );
}

function SummaryCard({
  label,
  value,
  index,
}: {
  label: string;
  value: string;
  index: number;
}) {
  return (
    <div
      className={[
        "border-b border-laps-navy/15 py-5 pr-6 sm:border-b-0",
        index > 0 ? "sm:border-l sm:border-laps-navy/15 sm:pl-6" : "",
      ].join(" ")}
    >
      <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-laps-navy/45">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-semibold leading-relaxed text-laps-navy">{value}</dd>
    </div>
  );
}

function ExchangeCard({ member }: { member: ApiMember }) {
  const { t, lang } = useLang();
  const tx = t.exchange;
  const tier = ROLE_TO_TIER[member.currentRole] ?? "undergrad";
  const visual = TIER_CLASS[tier];
  const photo = member.photoUrl ? resolveMediaUrl(member.photoUrl) : null;
  // Languages come from the member's own profile now, rather than from a
  // hand-kept list that had to be edited alongside the roster.
  const languages = parseLanguages(member.languages).slice(0, 4);

  return (
    <Link
      to="/team/$uuid"
      params={{ uuid: member.id }}
      className="group relative flex flex-col gap-3 rounded-md border border-laps-navy/15 bg-surface p-5 transition-colors hover:border-laps-navy/40 hover:bg-laps-ghost/50"
    >
      <span className="absolute left-0 right-0 top-0 h-0.5 w-0 bg-laps-signal transition-all duration-300 group-hover:w-full" />
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-laps-ghost">
          {photo ? (
            <img
              src={photo}
              alt={member.fullName}
              loading="lazy"
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-full font-mono text-xs font-semibold text-laps-navy/60">
              {initials(member.fullName)}
            </span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold leading-tight text-laps-navy">{member.fullName}</h4>
          <p className="mt-1.5 inline-flex items-center gap-2">
            <span className={`h-1.5 w-1.5 shrink-0 ${visual.dot}`} />
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-laps-navy/50">
              {tx.tier[tier]}
            </span>
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
