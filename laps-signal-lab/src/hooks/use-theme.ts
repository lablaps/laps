import { useCallback, useEffect, useState } from "react";
import { THEME_CHANGE_EVENT, applyTheme, currentTheme, toggleTheme, type Theme } from "@/lib/theme";

/**
 * Reads and sets the active theme.
 *
 * Initial state is "light" rather than `currentTheme()` on purpose: this app
 * prerenders, so the first client render has to match the server's HTML or
 * React throws a hydration mismatch. The real value lands in the effect below,
 * one tick later — which is invisible, because the inline script in __root.tsx
 * has already put the right class on <html> before any of this runs. The class
 * is what paints; this hook only mirrors it for components that need to *know*
 * the theme, such as the logo picker.
 *
 * Instances stay in sync through a window event, so the toggle in the public
 * nav and the one in the portal header never disagree.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(currentTheme());
    const onChange = () => setTheme(currentTheme());
    window.addEventListener(THEME_CHANGE_EVENT, onChange);
    // Another tab changing the preference should not leave this one stale.
    const onStorage = () => setTheme(currentTheme());
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const set = useCallback((next: Theme) => {
    applyTheme(next);
    setTheme(next);
  }, []);

  const toggle = useCallback(() => setTheme(toggleTheme()), []);

  return { theme, isDark: theme === "dark", setTheme: set, toggle };
}
