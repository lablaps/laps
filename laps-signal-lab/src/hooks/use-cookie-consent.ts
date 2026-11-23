import { useSyncExternalStore } from "react";

// Module-level store, same shape as use-lang.ts, so every consumer sees one
// value and the banner cannot end up mounted twice in disagreement.
//
// Two storages on purpose, because "accept" and "close" are different promises
// to the user:
//
//   accepted  -> localStorage. A decision was made; never ask again.
//   dismissed -> sessionStorage. No decision was made, so we may ask again on a
//                future visit — but not for the rest of this one, including
//                across route changes and reloads in the same tab.
//
// Client-side routing means a dismissal would survive navigation in a plain
// module variable anyway, but a hard reload (or opening a deep link) would
// bring the banner back, which is exactly the nag the requirement rules out.

const ACCEPTED_KEY = "laps-cookie-consent";
const DISMISSED_KEY = "laps-cookie-consent-dismissed";

export type ConsentState = "unknown" | "pending" | "accepted" | "dismissed";

function readInitial(): ConsentState {
  if (typeof window === "undefined") return "unknown";
  try {
    if (window.localStorage.getItem(ACCEPTED_KEY) === "accepted") return "accepted";
    if (window.sessionStorage.getItem(DISMISSED_KEY) === "1") return "dismissed";
  } catch {
    // Storage can throw in private modes or with cookies blocked outright.
    // Someone who has blocked storage has answered the question implicitly;
    // showing a banner we cannot remember the answer to would nag forever.
    return "dismissed";
  }
  return "pending";
}

let current: ConsentState = readInitial();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): ConsentState {
  return current;
}

// SSR / first-render shim. Returning "unknown" keeps the banner out of the
// prerendered shell, so it appears after hydration rather than flashing in the
// markup and then disappearing for someone who already accepted.
function getServerSnapshot(): ConsentState {
  return "unknown";
}

export function acceptCookies() {
  if (current === "accepted") return;
  current = "accepted";
  try {
    window.localStorage.setItem(ACCEPTED_KEY, "accepted");
  } catch {
    // Non-fatal: the banner still closes for this session.
  }
  emit();
}

export function dismissCookies() {
  if (current === "accepted" || current === "dismissed") return;
  current = "dismissed";
  try {
    window.sessionStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // Non-fatal, as above.
  }
  emit();
}

export function useCookieConsent() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { state, isVisible: state === "pending", acceptCookies, dismissCookies };
}
