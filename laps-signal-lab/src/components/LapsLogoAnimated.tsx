import { useTheme } from "@/hooks/use-theme";
import LapsLogoAnimation from "./LapsLogoAnimation";
import LapsLogoAnimationWhite from "./LapsLogoAnimationWhite";

/**
 * The animated wordmark, in whichever variant reads on the current background.
 *
 * The two are not recolourings of one drawing — they are different assets with
 * different animations, which is why this picks between them rather than
 * setting a fill:
 *
 *   light → {@link LapsLogoAnimation}, the brand colourway (#81b4e0 / #2c455f),
 *           hand-curated stroke-draw. Its dark blue disappears on a dark page.
 *   dark  → {@link LapsLogoAnimationWhite}, the traced white/grey artwork with
 *           its opaque black backdrop stripped out, fading in left-to-right.
 *           On white it is invisible; on a dark page it is the only one that
 *           reads. It shipped unused until dark mode gave it a background.
 *
 * `LapsLogoMono` is a third variant and is not part of this choice: it inherits
 * `currentColor`, so it already follows whatever text colour surrounds it.
 */
export default function LapsLogoAnimated({ loop = false }: { loop?: boolean }) {
  const { isDark } = useTheme();

  // Remounting on theme change is intentional — each variant should play its
  // entrance again rather than appear mid-animation in a new colourway.
  return isDark ? (
    <LapsLogoAnimationWhite key="dark" />
  ) : (
    <LapsLogoAnimation key="light" loop={loop} />
  );
}
