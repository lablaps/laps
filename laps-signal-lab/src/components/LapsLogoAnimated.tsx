import { useTheme } from "@/hooks/use-theme";
import LapsLogoAnimation from "./LapsLogoAnimation";
import LapsLogoMono from "./LapsLogoMono";

/**
 * The animated wordmark, in whichever variant reads on the current background.
 *
 *   light → {@link LapsLogoAnimation}, the brand colourway (#81b4e0 / #2c455f)
 *           with its hand-curated stroke-draw.
 *   dark  → {@link LapsLogoMono}, the white wordmark /login and /admin already
 *           use, drawn with the same stroke-draw → fill-fade pacing.
 *
 * Dark deliberately does NOT use `LapsLogoAnimationWhite`. That component
 * injects the traced source SVG with `dangerouslySetInnerHTML` and only then
 * strips its black backdrop and sets up the fade in an effect — so the raw
 * artwork paints first and the "animation" is whatever is left after the
 * browser has already shown the finished image. Mono renders its paths as real
 * elements from the first frame, invisible until they draw, which is why it is
 * the one that actually animates on load.
 */
/**
 * Rendered width of the wordmark itself, in px, at full container width.
 *
 * This is the size the original dark logo drew at: `LapsLogoAnimationWhite`
 * defaulted to maxWidth 480 over a 663-unit viewBox holding a 498-unit glyph,
 * i.e. 480 × 498/663 ≈ 360px of actual letterforms.
 */
const GLYPH_WIDTH = 360.5;

/**
 * Per-variant maxWidth that renders GLYPH_WIDTH of letterforms.
 *
 * The two artworks crop differently — 383 glyph units inside a 410 viewBox for
 * the colour version, 498 inside 520 for the mono — so passing them the same
 * maxWidth produces visibly different logos. Scaling each by its own
 * viewBox/glyph ratio is what keeps the mark from resizing when the theme is
 * toggled.
 */
const COLOR_MAX_WIDTH = Math.round(GLYPH_WIDTH * (410 / 383)); // 386
const MONO_MAX_WIDTH = Math.round(GLYPH_WIDTH * (520 / 498)); // 377

export default function LapsLogoAnimated({
  loop = false,
  maxWidth,
}: {
  loop?: boolean;
  /** Override the matched sizing. Scales both variants proportionally. */
  maxWidth?: number;
}) {
  const { isDark } = useTheme();
  const scale = maxWidth ? maxWidth / GLYPH_WIDTH : 1;

  // Remounting on theme change is intentional — each variant should play its
  // entrance again rather than appear mid-animation in a new colourway.
  return isDark ? (
    <LapsLogoMono key="dark" loop={loop} maxWidth={MONO_MAX_WIDTH * scale} />
  ) : (
    <LapsLogoAnimation key="light" loop={loop} maxWidth={COLOR_MAX_WIDTH * scale} />
  );
}
