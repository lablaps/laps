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
export default function LapsLogoAnimated({
  loop = false,
  maxWidth,
}: {
  loop?: boolean;
  /** Forwarded to the mono variant; the colour variant sizes itself. */
  maxWidth?: number;
}) {
  const { isDark } = useTheme();

  // Remounting on theme change is intentional — each variant should play its
  // entrance again rather than appear mid-animation in a new colourway.
  return isDark ? (
    <LapsLogoMono key="dark" loop={loop} maxWidth={maxWidth} />
  ) : (
    <LapsLogoAnimation key="light" loop={loop} />
  );
}
