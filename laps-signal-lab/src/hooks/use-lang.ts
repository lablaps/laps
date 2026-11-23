import { useSyncExternalStore } from "react";
import { translations, type Lang } from "@/lib/i18n";

// Module-level store so every component sees the same language.
// Before this rewrite, each call to useLang() owned its own useState, so
// the LangSwitcher in PublicLayout would update localStorage and its own
// re-render but consumers like team.$personId.tsx kept their stale lang
// until a remount — i.e. the user had to refresh the page.

const KEY = "laps-lang";
const VALID: Lang[] = ["pt", "en", "fr"];

function readInitial(): Lang {
  if (typeof window === "undefined") return "pt";
  const stored = window.localStorage.getItem(KEY) as Lang | null;
  return stored && VALID.includes(stored) ? stored : "pt";
}

let current: Lang = readInitial();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  // Cross-tab sync: if another tab writes to localStorage, propagate here.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY && e.newValue && VALID.includes(e.newValue as Lang)) {
      current = e.newValue as Lang;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Lang {
  return current;
}

// SSR / first-render shim — return the same value every time so React doesn't
// hydrate-mismatch. Hydration will pick up the real localStorage value via
// the subscribe path once the client mounts.
function getServerSnapshot(): Lang {
  return "pt";
}

export function setLang(l: Lang) {
  if (!VALID.includes(l) || l === current) return;
  current = l;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, l);
  }
  emit();
}

export function useLang() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { lang, setLang, t: translations[lang] };
}
