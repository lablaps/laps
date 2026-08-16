/**
 * The four research areas, set as a ruled index.
 *
 * Shared by `/` and `/aboutus`, which both list the same four areas. They used
 * to carry separate copies of the markup and had already drifted apart (one
 * tinted the hover, the other did not, and the borders differed) — one
 * definition keeps the two pages speaking the same language.
 *
 * The number is the anchor. The previous treatment put a Lucide glyph in a
 * tinted rounded square above each title, which is the stock "feature card"
 * icon treatment; worse, the four glyphs available (a brain, a heartbeat, a
 * microscope, a waveform) illustrated the areas only loosely and mostly said
 * "this is a feature card". A mono index number says exactly what it is — the
 * nth of four — and lets the titles carry the meaning.
 */
// readonly: the i18n tables are `as const`, so the areas arrive as a readonly
// tuple of readonly objects and a mutable array type would not accept them.
export function AreaIndex({
  items,
}: {
  items: readonly { readonly t: string; readonly d: string }[];
}) {
  return (
    <div className="grid border-t border-laps-navy/15 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <div
          key={i}
          className={[
            "group relative py-8 pr-8",
            i < items.length - 1 ? "border-b border-laps-navy/15 md:border-b-0" : "",
            i % 2 === 1 ? "md:border-l md:border-laps-navy/15 md:pl-8" : "",
            i >= 2 ? "md:border-t md:border-laps-navy/15 lg:border-t-0" : "",
            i > 0 ? "lg:border-l lg:border-laps-navy/15 lg:pl-8" : "",
          ].join(" ")}
        >
          {/* The accent rule that marks the hovered column. This is where the
              signal colour is spent — one moving 2px mark, not a tint on every
              surface. */}
          <span className="absolute left-0 top-0 h-0.5 w-0 bg-laps-signal transition-all duration-300 group-hover:w-full" />
          <span className="tnum font-mono text-sm font-medium text-laps-signal">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="font-display mt-5 text-xl font-bold leading-tight text-laps-navy">
            {item.t}
          </h3>
          <p className="mt-3 max-w-[28ch] text-sm leading-relaxed text-laps-navy/65">
            {item.d}
          </p>
        </div>
      ))}
    </div>
  );
}
