import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

/**
 * Light/dark switch.
 *
 * Both icons are always mounted and cross-faded rather than swapped, so the
 * button never changes size mid-press and the transition survives being
 * interrupted by a second click.
 */
export function ThemeToggle({
  className,
  variant = "default",
}: {
  className?: string;
  /** `onDark` sits on a permanently dark surface (hero, footer) where the
   *  palette does not flip, so it needs light-on-dark styling in both themes. */
  variant?: "default" | "onDark";
}) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      // The label states the destination, not the current state — that is what
      // a screen-reader user is choosing to do.
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Modo claro" : "Modo escuro"}
      className={cn(
        "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 active:scale-[0.96]",
        variant === "onDark"
          ? // Literal white tints, not --surface: this variant sits on a surface
            // that stays dark in both themes, so it must not follow the flip.
            "border-white/20 bg-white/10 text-white hover:bg-white/20"
          : "border-laps-navy/15 bg-surface text-laps-navy/75 hover:border-laps-blue/30 hover:text-laps-blue",
        className,
      )}
    >
      <Sun
        className={cn(
          "absolute h-4 w-4 transition-[opacity,transform] duration-200",
          isDark ? "rotate-0 opacity-100" : "-rotate-90 opacity-0",
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 transition-[opacity,transform] duration-200",
          isDark ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
        )}
      />
    </button>
  );
}
