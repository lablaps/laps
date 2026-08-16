import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/hooks/use-lang";
import { ValuesGraph } from "@/components/ValuesGraph";
import { AreaIndex } from "@/components/AreaIndex";
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

  return (
    <PublicLayout>
      {/* ── HERO ───────────────────────────────────────────────────────────
          Flush-left and unadorned. What was here — a centred pill badge over a
          centred H1 over a centred paragraph, on a soft vertical gradient — is
          the same template the home page hero used, so the two pages opened
          identically and neither had a spatial idea of its own. */}
      <section className="border-b border-laps-navy/15 bg-laps-paper">
        <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-10 lg:py-32">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="label-tech">{t.about.chip}</p>
              <h1 className="font-display mt-6 text-[clamp(2.25rem,5vw,4.25rem)] font-extrabold leading-[0.95] text-laps-navy">
                {t.about.title}
              </h1>
            </div>
            <p className="text-base leading-relaxed text-laps-navy/70 lg:col-span-5 lg:pt-3 lg:text-lg">
              {t.about.body}
            </p>
          </div>
        </div>
      </section>

      {/* ── MISSION / VISION ───────────────────────────────────────────────
          Two ruled columns rather than two cards.

          The old treatment is the clearest single tell the site had: each was a
          16px-radius card with a soft shadow and a 4px coloured left border —
          blue on one, a hard-coded green on the other — topped with a Lucide
          glyph in a tinted rounded square. The stripe carried no information
          (the two are peers, not statuses), the green belonged to no palette on
          this site, and a target and an eye are the stock icons for exactly
          these two words.
          Set as a ruled pair with mono labels, the same two paragraphs read as
          what they are: the lab's two statements of intent. */}
      <section className="border-b border-laps-navy/15 bg-surface">
        <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-10">
          <div className="grid gap-12 border-t border-laps-navy/15 md:grid-cols-2 md:gap-0">
            <div className="pt-8 md:pr-14">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-laps-navy/45">
                01
              </p>
              <h2 className="font-display mt-4 text-2xl font-bold text-laps-navy md:text-3xl">
                {t.about.missionTitle}
              </h2>
              <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-laps-navy/70">
                {t.about.missionBody}
              </p>
            </div>
            <div className="border-t border-laps-navy/15 pt-8 md:border-l md:border-t-0 md:pl-14">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-laps-navy/45">
                02
              </p>
              <h2 className="font-display mt-4 text-2xl font-bold text-laps-navy md:text-3xl">
                {t.about.visionTitle}
              </h2>
              <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-laps-navy/70">
                {t.about.visionBody}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESEARCH AREAS ─────────────────────────────────────────────────
          The supporting paragraph that sat beside this heading was a verbatim
          copy of the hero paragraph three sections above. Repeating it did not
          make the section read as fuller, only as unedited — the heading and
          the four areas say it. */}
      <section className="border-b border-laps-navy/15 bg-laps-paper">
        <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-10">
          <p className="label-tech">03 / research.areas</p>
          <h2 className="font-display mt-6 max-w-[16ch] text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[0.98] text-laps-navy">
            {t.areas.title}
          </h2>
          <div className="mt-16">
            <AreaIndex items={t.areas.items} />
          </div>
        </div>
      </section>

      {/* ── VALUES ─────────────────────────────────────────────────────────
          The force-directed graph is one of the few genuinely custom things on
          this site, so it gets the room and the frame it deserves instead of
          floating in a pale-blue band under a centred heading. The mono caption
          rail beneath it labels it the way a figure in a paper would. */}
      <section className="border-b border-laps-navy/15 bg-surface">
        <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-10">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="label-tech">04 / {t.values.title}</p>
              <h2 className="font-display mt-6 text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[0.98] text-laps-navy">
                {t.values.title}
              </h2>
              <ul className="mt-8 border-t border-laps-navy/15">
                {t.values.items.map((v, i) => (
                  <li
                    key={v}
                    className="flex items-baseline gap-4 border-b border-laps-navy/15 py-3"
                  >
                    <span className="tnum font-mono text-[11px] text-laps-navy/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-semibold text-laps-navy">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-8">
              <div className="relative h-[420px] w-full border border-laps-navy/15 bg-laps-paper">
                <ValuesGraph labels={t.values.items} />
              </div>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-laps-navy/40">
                Fig. 01 — {t.values.title}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM CTA ───────────────────────────────────────────────────────
          A full-bleed ink band, flush-left, rather than a 24px-radius gradient
          panel with centred text and a white pill CTA. The band is the last
          thing before the footer and is the only heavy surface on the page —
          which is what makes it read as the page's one call to action. */}
      <section className="bg-laps-ink text-white">
        <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-laps-signal-ink">
                {t.structure.chip}
              </p>
              <h2 className="font-display mt-5 text-[clamp(1.75rem,3.2vw,2.75rem)] font-extrabold leading-[1] text-white">
                {t.team.title}
              </h2>
              <p className="mt-5 max-w-[52ch] text-sm leading-relaxed text-white/70 md:text-base">
                {t.structure.body}
              </p>
            </div>
            <div className="lg:col-span-5 lg:justify-self-end">
              <Link
                to="/team"
                className="inline-flex h-12 items-center rounded-md bg-white px-7 text-sm font-semibold text-laps-ink transition-colors duration-150 hover:bg-laps-signal hover:text-white active:translate-y-px"
              >
                {t.team.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
