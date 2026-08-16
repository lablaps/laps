import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/hooks/use-lang";
import { stats } from "@/lib/i18n";
import { WaveBackground } from "@/components/WaveBackground";
import { CountUp } from "@/components/CountUp";
import { AreaIndex } from "@/components/AreaIndex";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t } = useLang();

  const handleScrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PublicLayout>
      {/* ── HERO ───────────────────────────────────────────────────────────
          Flush-left on a 12-column grid, not the centred badge/headline/two-
          buttons stack this used to be. The old composition put the wordmark
          where the headline belongs, so the page had no typographic anchor at
          all — the largest type on the whole site sat below the fold. The lab's
          full name (hero.title1/title2, already in i18n and previously unused)
          is now the H1 and carries the hero on its own. */}
      <section className="relative isolate -mt-[68px] flex min-h-[100svh] flex-col overflow-hidden bg-laps-paper pt-[68px]">
        {/* Held to the lower half rather than inset-0. Full-bleed, the trace ran
            straight through the headline and neither survived it: the wave lost
            its shape behind the letterforms and the letterforms lost their
            edges. Dropped to the bottom 55% it does what it should — the
            headline sits on clean paper, and the signal reads as a plotted
            trace along the base of the composition. */}
        <div className="absolute inset-x-0 bottom-0 top-[42%] z-0 opacity-70">
          <WaveBackground />
        </div>

        {/* The Swiss move made literal: the column grid the layout is built on
            is drawn rather than implied. Four columns, matching the readout rail
            below exactly — an earlier pass drew six against a four-column rail
            and the two grids visibly disagreed, which is worse than drawing no
            grid at all. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 mx-auto hidden max-w-[1600px] px-6 md:block md:px-10 lg:px-16"
        >
          <div className="grid h-full grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="border-l border-laps-navy/[0.06]" />
            ))}
          </div>
        </div>

        <div className="relative z-20 mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-center px-6 py-20 md:px-10 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8 xl:col-span-7">
              <p className="label-tech">{t.hero.label}</p>

              <h1 className="font-display mt-7 text-[clamp(2.25rem,5.2vw,4.5rem)] font-extrabold leading-[0.95] text-laps-navy">
                {t.hero.title1}
                <br />
                {t.hero.title2}
              </h1>

              {/* Capped at ~62 characters. The subtitle used to run the full
                  width of a centred 42rem block, which is past the point where
                  the eye reliably finds the next line. */}
              <p className="mt-8 max-w-[34rem] text-base leading-relaxed text-laps-navy/75 md:text-lg">
                {t.hero.subtitle}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  to="/projects"
                  className="inline-flex h-12 items-center rounded-md bg-laps-cta px-7 text-sm font-semibold text-white transition-colors duration-150 hover:bg-laps-accent active:translate-y-px"
                >
                  {t.hero.cta1}
                </Link>
                <Link
                  to="/aboutus"
                  // Solid paper fill, not transparent: the wave trace runs
                  // behind this button and showed through the outline variant,
                  // which left the label sitting on moving line-work.
                  className="inline-flex h-12 items-center rounded-md border border-laps-navy/30 bg-laps-paper px-7 text-sm font-semibold text-laps-navy transition-colors duration-150 hover:border-laps-navy hover:bg-laps-navy hover:text-white active:translate-y-px"
                >
                  {t.hero.cta2}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Readout rail ─────────────────────────────────────────────────
            The stats, folded into the base of the hero instead of floating
            below it in their own rounded, gradient-filled box. Two things this
            fixes: the numbers now sit on the page's structure rather than in a
            decorative container, and the hero gets a base that anchors the
            left-aligned composition.
            The figures are the lab's own and unchanged — only their presentation
            is: mono, tabular, hairline-separated, read as instrument output. */}
        <div className="relative z-20 mx-auto w-full max-w-[1600px] px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-2 border-t border-laps-navy/15 md:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.key}
                // Rules land on the drawn column grid: one before every item but
                // the first, so the first figure stays flush with the headline's
                // left edge and the rail reads as part of the same structure.
                className={[
                  "py-6 pr-6",
                  i % 2 === 1 ? "border-l border-laps-navy/15 pl-6" : "",
                  i >= 2 ? "border-t border-laps-navy/15 md:border-t-0" : "",
                  i > 0 ? "md:border-l md:border-laps-navy/15 md:pl-6" : "",
                ].join(" ")}
              >
                <div className="tnum font-mono text-3xl font-medium text-laps-navy md:text-4xl">
                  <CountUp end={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-laps-navy/55">
                  {t.stats[s.key]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll affordance as a measurement tick rather than the stock mouse
            capsule with a bouncing chevron. The rule grows on hover — the only
            motion in the hero that responds to the pointer. */}
        <div className="relative z-20 mx-auto w-full max-w-[1600px] px-6 pb-8 pt-6 md:px-10 lg:px-16">
          <button
            onClick={handleScrollClick}
            className="group inline-flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-laps-navy/55 transition-colors hover:text-laps-signal"
          >
            <span className="h-px w-8 bg-laps-navy/30 transition-all duration-300 group-hover:w-14 group-hover:bg-laps-signal" />
            {t.hero.scrollHint}
          </button>
        </div>
      </section>

      {/* ── 01 · RESEARCH AREAS ────────────────────────────────────────────
          Narrower than the hero on purpose. Section width is a hierarchy tool
          here rather than one max-w applied to everything: the hero runs to
          1600px, this reads at 1280px. */}
      <section id="discover" className="border-t border-laps-navy/15 bg-surface">
        <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-10 lg:py-32">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="label-tech">01 / {t.about.chip}</p>
              <h2 className="font-display mt-6 text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[0.98] text-laps-navy">
                {t.about.title}
              </h2>
            </div>
            <p className="text-base leading-relaxed text-laps-navy/70 lg:col-span-6 lg:col-start-7 lg:pt-2 lg:text-lg">
              {t.about.body}
            </p>
          </div>

          <div className="mt-20">
            <AreaIndex items={t.areas.items} />
          </div>

          <div className="mt-16">
            <Link
              to="/aboutus"
              className="group inline-flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-laps-navy transition-colors hover:text-laps-signal"
            >
              {t.hero.cta2}
              <span className="h-px w-10 bg-laps-navy/40 transition-all duration-300 group-hover:w-16 group-hover:bg-laps-signal" />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
