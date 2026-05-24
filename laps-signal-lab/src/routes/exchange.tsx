import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe, Plane, Users, Languages } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { PublicLayout } from "@/components/PublicLayout";
import { team, initials, type Tier } from "@/lib/team-data";
import {
  COUNTRY_ORDER,
  COUNTRIES,
  exchangeRoster,
  type CountryCode,
  type ExchangeEntry,
} from "@/lib/exchange-data";

export const Route = createFileRoute("/exchange")({
  component: ExchangePage,
  head: () => ({
    meta: [
      { title: "International Exchange — LAPS" },
      {
        name: "description",
        content:
          "LAPS researchers and students on international mobility — France, Canada, Portugal and Italy.",
      },
    ],
  }),
});

// Flat-style country flags rendered inline so the page doesn't depend on
// network image assets. Aspect ratio is tuned to look right at 80×52.
const FLAGS: Record<CountryCode, ReactNode> = {
  FR: (
    <svg viewBox="0 0 60 40" className="h-full w-full">
      <rect width="20" height="40" x="0" fill="#0055A4" />
      <rect width="20" height="40" x="20" fill="#FFFFFF" />
      <rect width="20" height="40" x="40" fill="#EF4135" />
    </svg>
  ),
  CA: (
    <svg viewBox="0 0 60 40" className="h-full w-full">
      <rect width="15" height="40" x="0" fill="#D52B1E" />
      <rect width="30" height="40" x="15" fill="#FFFFFF" />
      <rect width="15" height="40" x="45" fill="#D52B1E" />
      <path
        d="M30 11 L31.7 14.2 L35 13.5 L33.6 16.4 L36 18.5 L33 19.3 L33.6 22 L30 21 L26.4 22 L27 19.3 L24 18.5 L26.4 16.4 L25 13.5 L28.3 14.2 Z"
        fill="#D52B1E"
      />
    </svg>
  ),
  PT: (
    <svg viewBox="0 0 60 40" className="h-full w-full">
      <rect width="24" height="40" x="0" fill="#006600" />
      <rect width="36" height="40" x="24" fill="#FF0000" />
      <circle cx="24" cy="20" r="6.5" fill="#FFFF00" stroke="#000" strokeWidth="0.6" />
      <circle cx="24" cy="20" r="3.2" fill="#FFFFFF" stroke="#000" strokeWidth="0.4" />
    </svg>
  ),
  IT: (
    <svg viewBox="0 0 60 40" className="h-full w-full">
      <rect width="20" height="40" x="0" fill="#009246" />
      <rect width="20" height="40" x="20" fill="#FFFFFF" />
      <rect width="20" height="40" x="40" fill="#CE2B37" />
    </svg>
  ),
};

// Visual styling per tier — mirrors the palette used on /team and /team/$uuid
// so an exchange researcher's card reads like a peer-card you'd see elsewhere.
const TIER_VISUAL: Record<Tier, { gradient: string; ring: string }> = {
  head:        { gradient: "from-laps-navy to-laps-blue",   ring: "ring-laps-light/40" },
  coordinator: { gradient: "from-violet-700 to-violet-400", ring: "ring-violet-200"    },
  manager:     { gradient: "from-purple-600 to-purple-300", ring: "ring-purple-200"    },
  doctorate:   { gradient: "from-laps-blue to-laps-light",  ring: "ring-laps-blue/30"  },
  master:      { gradient: "from-emerald-500 to-emerald-300", ring: "ring-emerald-200" },
  undergrad:   { gradient: "from-amber-400 to-amber-200",   ring: "ring-amber-200"     },
};

function ExchangePage() {
  const { t, lang } = useLang();
  const tx = t.exchange;

  // Group exchange entries by country, preserving the explicit COUNTRY_ORDER
  // so the page reads in the same order in every language.
  const byCountry = new Map<CountryCode, ExchangeEntry[]>();
  for (const c of COUNTRY_ORDER) byCountry.set(c, []);
  for (const entry of exchangeRoster) byCountry.get(entry.country)!.push(entry);

  const totalCount = exchangeRoster.length;

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

          {/* Quick summary cards */}
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <SummaryCard icon={Users} label={tx.summary.label} value={tx.summary.countWithCount(totalCount)} />
            <SummaryCard icon={Globe} label={tx.summary.label} value={tx.summary.countries} />
            <SummaryCard icon={Languages} label={tx.summary.label} value={tx.summary.languages} />
          </div>
        </div>
      </section>

      {/* COUNTRY SECTIONS */}
      <section className="bg-white pb-20">
        <div className="mx-auto max-w-6xl px-6 space-y-12">
          {COUNTRY_ORDER.map((code) => {
            const entries = byCountry.get(code) ?? [];
            if (entries.length === 0) return null;
            const country = COUNTRIES[code];
            return (
              <div
                key={code}
                className="overflow-hidden rounded-3xl border border-laps-blue/15 bg-white shadow-[0_2px_20px_rgba(25,58,89,0.06)]"
              >
                {/* Country header — flag + name + count */}
                <div className="flex flex-col gap-4 border-b border-laps-blue/10 bg-laps-ghost/30 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-[52px] w-[80px] overflow-hidden rounded-md shadow-[0_0_0_1px_rgba(0,0,0,0.12)]">
                      {FLAGS[code]}
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-laps-navy">
                        {country.name[lang]}
                      </h2>
                      <p className="text-xs font-semibold uppercase tracking-wider text-laps-navy/55">
                        {entries.length} {tx.labels.students}
                      </p>
                    </div>
                  </div>
                  <Plane className="hidden h-6 w-6 shrink-0 text-laps-blue/60 sm:block" />
                </div>

                {/* Researcher cards */}
                <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  {entries.map((entry) => (
                    <ExchangeCard key={entry.memberSlug} entry={entry} />
                  ))}
                </div>
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
        <div className="text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">{label}</div>
        <div className="text-sm font-semibold text-laps-navy">{value}</div>
      </div>
    </div>
  );
}

function ExchangeCard({ entry }: { entry: ExchangeEntry }) {
  const { t } = useLang();
  const tx = t.exchange;
  const member = team.find((m) => m.id === entry.memberSlug);
  if (!member) return null;

  const visual = TIER_VISUAL[member.tier];

  return (
    <Link
      to="/team/$uuid"
      params={{ uuid: member.uuid }}
      className="group flex flex-col gap-3 rounded-2xl border border-laps-light/30 bg-white p-5 transition hover:-translate-y-0.5 hover:border-laps-blue/40 hover:shadow-[0_10px_30px_rgba(11,78,141,0.12)]"
    >
      <div className="flex items-start gap-4">
        {/* Photo / initials — same pattern as the rest of the site. Clicking
            anywhere on the card (photo included) hits the /team/$uuid route. */}
        <span
          className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-md ring-2 ${visual.ring}`}
        >
          {member.photo ? (
            <img
              src={member.photo}
              alt={member.fullName}
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
            {tx.tier[member.tier]}
          </p>
        </div>
      </div>

      <div className="mt-1 flex flex-wrap gap-1.5">
        {entry.languages.map((code) => (
          <span
            key={code}
            className="inline-flex items-center gap-1 rounded-full border border-laps-blue/15 bg-laps-ghost/40 px-2 py-0.5 text-[10px] font-semibold text-laps-navy/75"
          >
            {tx.langName[code as keyof typeof tx.langName] ?? code.toUpperCase()}
          </span>
        ))}
      </div>

      <span className="mt-1 text-[11px] font-semibold text-laps-blue/80 group-hover:text-laps-blue">
        {tx.labels.seeProfile} →
      </span>
    </Link>
  );
}
