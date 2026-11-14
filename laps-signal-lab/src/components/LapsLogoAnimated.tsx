import LapsLogoAnimation from "./LapsLogoAnimation";

/**
 * The animated brand wordmark, sized by its letterforms rather than its box.
 *
 * Rendered width of the glyphs at full container width is 360.5px; the colour
 * artwork holds a 383-unit glyph inside a 410-unit viewBox, so the container
 * has to be scaled by that ratio to land on the intended size. Callers pass a
 * maxWidth in glyph pixels and never need to know the artwork's crop.
 *
 * This used to switch to the white LapsLogoMono under a dark theme. The site
 * is light-only now; Mono is still used directly on the permanently dark
 * /login, /join and /admin surfaces.
 */
const GLYPH_WIDTH = 360.5;
const COLOR_MAX_WIDTH = Math.round(GLYPH_WIDTH * (410 / 383)); // 386

export default function LapsLogoAnimated({
  loop = false,
  maxWidth,
}: {
  loop?: boolean;
  /** Override the matched sizing, in glyph pixels. */
  maxWidth?: number;
}) {
  const scale = maxWidth ? maxWidth / GLYPH_WIDTH : 1;
  return <LapsLogoAnimation loop={loop} maxWidth={COLOR_MAX_WIDTH * scale} />;
}
