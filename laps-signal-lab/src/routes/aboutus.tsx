import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, HeartPulse, Microscope, Activity, Target, Eye } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { ValuesGraph } from "@/components/ValuesGraph";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/aboutus")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — LAPS" },
      { name: "description", content: "About the LAPS — Signal Acquisition and Processing Laboratory." },
    ],
  }),
});

function AboutPage() {
  const { t } = useLang();
  const areaIcons = [Brain, HeartPulse, Microscope, Activity];

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-laps-ghost/40 via-white to-white py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-block rounded-full bg-laps-ghost px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-laps-blue">
            {t.about.chip}
          </span>
          <h1 className="font-display mt-6 text-4xl font-bold text-laps-navy md:text-5xl">
            {t.about.title}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-laps-navy/75 md:text-lg">
            {t.about.body}
          </p>
        </div>
      </section>

      {/* MISSION / VISION */}
      <section className="bg-white pb-24">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
          <div className="rounded-2xl border border-laps-blue/15 bg-white p-8 shadow-[0_2px_20px_rgba(25,58,89,0.06)] border-l-4 border-l-laps-blue">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-laps-ghost text-laps-blue">
              <Target className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-laps-navy">{t.about.missionTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-laps-navy/75">{t.about.missionBody}</p>
          </div>
          <div
            className="rounded-2xl border border-laps-blue/15 bg-white p-8 shadow-[0_2px_20px_rgba(25,58,89,0.06)] border-l-4"
            style={{ borderLeftColor: "#27AE60" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Eye className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-laps-navy">{t.about.visionTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-laps-navy/75">{t.about.visionBody}</p>
          </div>
        </div>
      </section>

      {/* RESEARCH AREAS */}
      <section className="relative bg-laps-ghost/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:items-end">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-laps-blue">
                / research.areas
              </span>
              <h2 className="font-display mt-4 text-3xl font-bold leading-tight text-laps-navy md:text-4xl lg:text-5xl">
                {t.areas.title}
              </h2>
            </div>
            <p className="text-base leading-relaxed text-laps-navy/70 md:text-lg">
              {t.about.body}
            </p>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-laps-light/40 bg-laps-light/40 md:grid-cols-2 lg:grid-cols-4">
            {t.areas.items.map((item, i) => {
              const Icon = areaIcons[i];
              return (
                <div
                  key={i}
                  className="group relative flex flex-col bg-white p-8 transition-colors hover:bg-laps-ghost/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-laps-ghost text-laps-blue transition group-hover:bg-laps-blue group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-laps-navy/40">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-display mt-6 text-lg font-bold leading-tight text-laps-navy">
                    {item.t}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-laps-navy/65">{item.d}</p>
                  <div className="mt-6 h-px w-8 bg-laps-blue/30 transition-all group-hover:w-16 group-hover:bg-laps-blue" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-laps-ghost py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-center text-3xl font-bold text-laps-navy md:text-5xl">
            {t.values.title}
          </h2>
          <div className="relative mx-auto mt-12 h-[420px] w-full max-w-4xl">
            <ValuesGraph labels={t.values.items} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-laps-navy to-laps-blue p-10 text-center text-white md:p-14">
            <h2 className="font-display text-2xl font-bold md:text-3xl">{t.team.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-white/80 md:text-base">
              {t.structure.body}
            </p>
            <Link
              to="/team"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-laps-navy shadow-lg transition hover:bg-laps-light hover:text-white"
            >
              {t.team.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
