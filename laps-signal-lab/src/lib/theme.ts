/**
 * Theme state: light (default) or dark, remembered across visits.
 *
 * Light is the default deliberately — it is the design the site was built in,
 * and it is what a first-time visitor gets. Dark is opt-in, and the opt-in is
 * what gets persisted; we do not follow `prefers-color-scheme`, because a lab
 * member who has never touched the toggle should see the same site their
 * colleague is looking at.
 *
 * Storage is localStorage under one key. If it is unavailable — Safari private
 * mode, a hardened browser, cookies-off — every function here degrades to
 * "light, not remembered" rather than throwing. A theme toggle is not worth a
 * white screen.
 */

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "laps-theme";

/** The class the `dark:` variant keys off (see @custom-variant in styles.css). */
const DARK_CLASS = "dark";

/** Fired on the window so every mounted toggle re-renders together. */
export const THEME_CHANGE_EVENT = "laps:theme-change";

export function readStoredTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return raw === "dark" || raw === "light" ? raw : null;
  } catch {
    return null;
  }
}

/** The theme in effect right now, read from the DOM rather than from storage. */
export function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains(DARK_CLASS) ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(DARK_CLASS, theme === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Not remembered, still applied for this session.
  }
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
}

export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

/**
 * Runs before first paint, inlined into <head>.
 *
 * Without it the document renders light, React hydrates, and only then does the
 * stored preference get applied — a white flash on every page load for anyone
 * using dark mode. This has to be a blocking inline script for that reason;
 * doing it in an effect is too late by definition.
 *
 * Kept to one statement and wrapped in try/catch: it runs before any error
 * boundary exists, so anything it throws is an unstyled blank page.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="dark")document.documentElement.classList.add("${DARK_CLASS}")}catch(e){}`;
