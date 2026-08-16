import type { Tier } from "./team-data";

/**
 * The single palette for the academic hierarchy.
 *
 * Three files used to carry their own copy of this — TeamGraph as hex,
 * /team and /exchange as Tailwind gradient classes — and they had already
 * drifted (`master` was #059669 in one table and #10B981 in another). Worse,
 * they encoded six peer tiers as six unrelated hues: two violets, a purple, two
 * blues, a green and an amber. Six colours at equal weight is not a hierarchy,
 * it is a legend you have to memorise, and the violet/purple pair in particular
 * was the one part of this site that belonged to no palette anyone chose.
 *
 * What replaces it says the same thing with the structure it actually has:
 *
 *   head        the accent. One person, and the only tier the emphasis colour
 *               is spent on anywhere in the roster.
 *   the rest    one navy ramp, dark → light, senior → junior. The ramp *is* the
 *               seniority, so the colour carries information instead of just
 *               telling two tiers apart.
 *
 * The whole table is now inside the brand blue, so `head` and `doctorate` are
 * the pair to watch: they are separated by brightness and saturation, not hue.
 * If `head` is ever dulled toward #0B4E8D the two collapse into each other and
 * the lab's head stops being findable in the graph.
 *
 * Hex rather than tokens because the graph paints to SVG/canvas and needs real
 * values; the Tailwind-class table below is derived from the same decisions so
 * the roster cards and the graph cannot drift again.
 */
export const TIER_COLOR: Record<Tier, string> = {
  head: "#0B6FD4",
  coordinator: "#193A59",
  manager: "#2C5578",
  doctorate: "#0B4E8D",
  master: "#4A85BC",
  undergrad: "#8FB6D9",
};

/**
 * [dark, light] pair per tier, for the node fills in the network graph.
 *
 * Kept as a gentle tonal step within each tier's own colour rather than the
 * two-hue gradients this replaced — a node should read as one weight on the
 * ramp, not as its own little colour story.
 */
export const TIER_GRADIENT: Record<Tier, [string, string]> = {
  head: ["#0B6FD4", "#6FB6FF"],
  coordinator: ["#193A59", "#2C5578"],
  manager: ["#2C5578", "#4A85BC"],
  doctorate: ["#0B4E8D", "#4A85BC"],
  master: ["#4A85BC", "#8FB6D9"],
  undergrad: ["#8FB6D9", "#C3D8EA"],
};

/**
 * Tailwind classes for the same ramp, for the roster cards and lists.
 *
 * `text`/`border` only — no fill. The tier is stated by the label beside it, so
 * the colour's job is to place the tier on the ramp, not to build a badge.
 */
export const TIER_CLASS: Record<Tier, { text: string; border: string; dot: string }> = {
  head: { text: "text-laps-signal", border: "border-laps-signal", dot: "bg-laps-signal" },
  coordinator: { text: "text-laps-navy", border: "border-laps-navy/60", dot: "bg-laps-navy" },
  manager: { text: "text-laps-navy/85", border: "border-laps-navy/45", dot: "bg-laps-navy/75" },
  doctorate: { text: "text-laps-blue", border: "border-laps-blue/45", dot: "bg-laps-blue" },
  master: { text: "text-laps-navy/70", border: "border-laps-navy/30", dot: "bg-laps-navy/55" },
  undergrad: { text: "text-laps-navy/55", border: "border-laps-navy/20", dot: "bg-laps-navy/35" },
};

/**
 * The richer shape the profile, portal and console need for a member header:
 * a banner `band`, an avatar `fill`, and a role `chip`.
 *
 * Same decisions as the tables above, expressed as the classes those three
 * screens ask for. They each carried their own copy — `/portal`, `/team/$uuid`
 * and `/admin` had three near-identical tables, all with the violet/purple
 * pair — so a role badge looked different depending on which screen you were
 * looking at your own profile from.
 *
 * `chip` is a hairline outline rather than a tinted fill: six filled pastel
 * badges on one roster is most of what made these screens read as generic, and
 * an outline states the role just as clearly without competing with the page.
 */
export const TIER_CONFIG: Record<
  Tier,
  { band: string; fill: string; chip: string; ring: string; label: string }
> = {
  head: {
    band: "bg-laps-signal",
    fill: "bg-laps-signal",
    chip: "border-laps-signal text-laps-signal",
    ring: "ring-laps-signal",
    label: "HEAD",
  },
  coordinator: {
    band: "bg-laps-ink",
    fill: "bg-laps-ink",
    chip: "border-laps-navy/50 text-laps-navy",
    ring: "ring-laps-ink",
    label: "COORDINATOR",
  },
  manager: {
    band: "bg-[#2C5578]",
    fill: "bg-[#2C5578]",
    chip: "border-laps-navy/40 text-laps-navy/85",
    ring: "ring-[#2C5578]",
    label: "MANAGER",
  },
  doctorate: {
    band: "bg-laps-accent",
    fill: "bg-laps-accent",
    chip: "border-laps-blue/45 text-laps-blue",
    ring: "ring-laps-accent",
    label: "DOCTORATE",
  },
  master: {
    band: "bg-[#4A85BC]",
    fill: "bg-[#4A85BC]",
    chip: "border-laps-navy/30 text-laps-navy/70",
    ring: "ring-[#4A85BC]",
    label: "MASTER",
  },
  undergrad: {
    band: "bg-[#8FB6D9]",
    fill: "bg-[#8FB6D9]",
    chip: "border-laps-navy/25 text-laps-navy/60",
    ring: "ring-[#8FB6D9]",
    label: "UNDERGRAD",
  },
};
