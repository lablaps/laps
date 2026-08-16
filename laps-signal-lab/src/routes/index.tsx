import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, HeartPulse, Microscope, Activity, ChevronDown } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { stats } from "@/lib/i18n";
import { WaveBackground } from "@/components/WaveBackground";
import { CountUp } from "@/components/CountUp";
import LapsLogoAnimated from "@/components/LapsLogoAnimated";
import { PublicLayout } from "@/components/PublicLayout";

import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t } = useLang();
  const areaIcons = [Brain, HeartPulse, Microscope, Activity];
  const handleScrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const discoverSection = document.getElementById("discover");
    if (discoverSection) {
      discoverSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <PublicLayout>
      {/* HERO — full viewport */}
      <section className="relative isolate -mt-[68px] flex min-h-[100svh] flex-col overflow-hidden bg-gradient-to-b from-surface via-laps-ghost/30 to-surface pt-[68px]">
        <div className="absolute inset-0 z-0">
          <WaveBackground />
        </div>

        <div className="pointer-events-none relative z-20 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="pointer-events-auto">
            <span className="inline-block rounded-full border border-laps-blue/20 bg-surface/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-laps-blue backdrop-blur">
              {t.hero.label}
            </span>
          </div>

          <div className="pointer-events-auto mt-8 w-full max-w-2xl">
            <LapsLogoAnimated />
          </div>

          <p
            className="mt-6 max-w-2xl text-base font-normal text-laps-navy/80 md:text-lg"
            style={{ textShadow: "0 2px 20px rgba(255,255,255,0.9)" }}
          >
            {t.hero.subtitle}
          </p>

          <div className="pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-lg bg-laps-ink px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-laps-navy/20 transition hover:bg-laps-accent hover:shadow-laps-blue/30"
            >
              {t.hero.cta1} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/aboutus"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-laps-navy bg-surface/40 px-6 py-3 text-sm font-semibold text-laps-navy backdrop-blur transition hover:bg-laps-ink hover:text-white"
            >
              {t.hero.cta2}
            </Link>
          </div>
        </div>

        {/* Scroll-down indicator — smooth sliding animation */}
        <motion.button
          onClick={handleScrollClick}
          aria-label={t.hero.scrollHint}
          animate={{ y: [0, 8, 0], opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="group pointer-events-auto relative z-20 mx-auto mb-8 flex cursor-pointer flex-col items-center gap-2 text-laps-navy/70 transition-colors duration-300 hover:text-laps-blue"
        >
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.32em] transition-opacity duration-300 group-hover:opacity-100">
            {t.hero.scrollHint}
          </span>
          <span className="flex h-9 w-6 items-start justify-center rounded-full border border-laps-navy/30 p-1 transition-colors duration-300 group-hover:border-laps-blue">
            <span className="animate-scroll-dot block h-2 w-1 rounded-full bg-laps-accent" />
          </span>
          <ChevronDown className="h-4 w-4" />
        </motion.button>
      </section>

      {/* STATS — below the fold */}
      <section id="discover" className="relative bg-surface py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-6 rounded-2xl border border-laps-blue/10 bg-gradient-to-br from-surface to-laps-ghost/30 px-6 py-10 shadow-sm md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.key} className="text-center">
                <div className="font-display text-3xl font-bold text-laps-blue md:text-4xl">
                  <CountUp end={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-[13px] font-normal text-laps-navy/80">
                  {t.stats[s.key]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESEARCH AREAS */}
      <section className="relative bg-surface pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:items-end">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-laps-blue">
                / {t.about.chip}
              </span>
              <h2 className="font-display mt-4 text-3xl font-bold leading-tight text-laps-navy md:text-4xl lg:text-5xl">
                {t.about.title}
              </h2>
            </div>
            <p className="text-base leading-relaxed text-laps-navy/70 md:text-lg">
              {t.about.body}
            </p>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-laps-light/30 bg-laps-light/30 md:grid-cols-2 lg:grid-cols-4">
            {t.areas.items.map((item, i) => {
              const Icon = areaIcons[i];
              return (
                <div
                  key={i}
                  className="group relative flex flex-col bg-surface p-8 transition-colors hover:bg-laps-ghost/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-laps-ghost text-laps-blue transition group-hover:bg-laps-accent group-hover:text-white">
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
                  <div className="mt-6 h-px w-8 bg-laps-accent/30 transition-all group-hover:w-16 group-hover:bg-laps-accent" />
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/aboutus"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-laps-blue transition hover:text-laps-navy"
            >
              {t.hero.cta2} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
