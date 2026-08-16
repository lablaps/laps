---
name: LAPS Signal Lab
colors:
  laps-navy: "#193A59"
  laps-blue: "#0B4E8D"
  laps-light: "#74B5F2"
  laps-ghost: "#EEF2F6"
  laps-paper: "#FBFAF8"
  laps-signal: "#0B6FD4"
  laps-cta: "#193A59"
  laps-white: "#FFFFFF"
  border: "oklch(0.9 0.02 240)"
  background: "oklch(1 0 0)"
  foreground: "oklch(0.25 0.05 250)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.25 0.05 250)"
  primary: "oklch(0.36 0.10 250)"
  primary-foreground: "oklch(1 0 0)"
  secondary: "oklch(0.96 0.02 240)"
  secondary-foreground: "oklch(0.25 0.05 250)"
  muted: "oklch(0.96 0.02 240)"
  muted-foreground: "oklch(0.5 0.04 250)"
  accent: "oklch(0.85 0.08 240)"
  accent-foreground: "oklch(0.25 0.05 250)"
  ring: "oklch(0.5 0.1 250)"
typography:
  sans:
    fontFamily: "'Archivo', system-ui, sans-serif"
    weights: [400, 500, 600, 700, 800]
  display:
    fontFamily: "'Archivo', system-ui, sans-serif"
    letterSpacing: "-0.03em"
    weight: 700
  mono:
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace"
    weights: [400, 500, 600]
radii:
  sm: "0"
  md: "2px"
  lg: "3px"
  xl: "3px"
  2xl: "4px"
  3xl: "4px"
  full: "9999px"
spacing:
  container-wide: "max-w-[1600px]"
  container-read: "max-w-[1280px]"
  section: "py-20 / py-24"
motion:
  wave-flow: "18s linear infinite"
  transition: "transition-colors duration-150; active:translate-y-px on press"
---

## Brand & Style

**Direction: Swiss × instrument.** LAPS measures signals, so the interface is
built like something you would read a measurement off: a strict grid, one
grotesque at several weights, a mono technical layer, hairline rules instead of
shadows, and one emphasis colour spent sparingly.

The aim is that the page looks like a research instrument's panel rather than a
product page about research. Restraint is the point — nothing here floats,
glows, or lifts.

## Colors

Navy ink on paper carries everything; a single bright signal blue marks emphasis.
The discipline is 60/30/10: navy dominant, paper/ghost secondary, signal at
roughly a tenth of the surface and never as body text.

- **Ink:** `laps-navy` (#193A59) is the text and structural colour.
- **Ground:** `laps-paper` (#FBFAF8) under full-bleed sections — a 1px rule on
  pure white reads as an artefact, on paper it reads as drawn. `laps-ghost`
  (#EEF2F6) is the recessive secondary surface.
- **Signal:** `laps-signal` (#0B6FD4) is the *only* emphasis colour: the active
  nav marker, the section tick, the hovered rule, the focus ring, the `head`
  tier, a required state. It is a marker, not a palette entry.
  It sits inside the brand blue, so it is separated from the ink by brightness
  and saturation rather than hue — keep it visibly brighter than both
  `laps-navy` and `laps-accent` or the page goes back to blue-on-blue with
  nothing marked.
- **CTA:** `laps-cta` is split from `laps-ink` because a filled button must stay
  *lighter* than the page in dark mode while an ink surface must stay darker.
- **Tiers:** the academic hierarchy is one navy ramp (dark → light, senior →
  junior) plus the accent for `head`. Defined once in `src/lib/tier-visual.ts`
  and shared by the roster, the graph, `/exchange`, `/portal` and `/admin`.

## Typography

- **Archivo** everywhere, at several weights. One grotesque at many weights is
  the Swiss discipline; a second display face would dilute it. Headings use
  `.font-display` (-0.03em, weight 700) — large Archivo at default tracking
  reads loose.
- **IBM Plex Mono** is the technical layer: labels, numerals, ticks, metadata,
  status, field names. Every figure on this site is a readout, and setting them
  in mono is what separates a lab site from a SaaS page about a lab.
- `.label-tech` is the section opener (mono, uppercase, 0.14em, signal-coloured,
  with a 14px rule drawn by `::before`). `.tnum` gives tabular numerals wherever
  a figure is a measurement.

## Layout & Spacing

Width is a hierarchy tool, not a constant. The hero runs to `1600px`; reading
sections sit at `1280px`. Content is flush-left on a 12-column grid, and on the
home hero the four-column grid is *drawn* as hairlines — the grid is the design.

Content is separated by 1px rules rather than gaps alone, so a row of peers
reads as one table rather than as floating cards.

## Elevation & Depth

**Hairlines, not shadows.** Surfaces are separated by `border-laps-navy/15`.
There are no drop shadows on cards, no hover lifts, and no coloured glows — a
soft shadow on a page built from 1px rules reads as a different design system
bolted on. Depth comes from rules, weight and position.

## Shapes & Motion

- **Radii:** three values only — square (0), 2px for controls, 3–4px for panels.
  `--radius` is 2px, stated outright rather than derived, because a derived
  scale computes negative values against a sharp base.
- **Motion is near-none and functional.** `transition-colors duration-150`,
  `active:translate-y-px` on press. The exceptions are deliberate: the
  `WaveBackground` signal trace and the force-directed `TeamGraph`/`ValuesGraph`
  are data-as-motion and on-thesis. `prefers-reduced-motion` disables all of it.
- **Focus** is one global treatment: a 2px signal outline at 2px offset.
