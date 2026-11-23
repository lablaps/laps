import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { useLang } from "@/hooks/use-lang";

/**
 * LGPD cookie notice.
 *
 * Deliberately not a modal: it does not trap focus, does not block the page,
 * and carries aria-modal="false". The site is readable without answering it, so
 * stealing focus from someone who came to read a project page would be wrong.
 *
 * Dismissal is session-scoped and acceptance is permanent — see
 * use-cookie-consent for why those differ.
 */
export function CookieConsent() {
  const { isVisible, acceptCookies, dismissCookies } = useCookieConsent();
  const { t } = useLang();
  const reduceMotion = useReducedMotion();
  const acceptRef = useRef<HTMLButtonElement>(null);

  // Escape closes it, matching every other dismissible surface on the site.
  useEffect(() => {
    if (!isVisible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissCookies();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isVisible, dismissCookies]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-body"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-x-0 bottom-0 z-50 flex justify-start p-4 sm:p-6"
        >
          {/* pointer-events-none on the wrapper would swallow clicks on the page
              behind the banner's empty horizontal margins; scope it to the card.

              Docked bottom-left rather than centred, and square rather than a
              floating 16px-radius card with a drop shadow. A centred card is the
              most disruptive place to put a notice that explicitly does not
              block the page — it lands on the headline. Against the left edge it
              stays out of the composition while remaining the first thing in
              reading order at the bottom of the viewport. */}
          <div className="pointer-events-auto relative w-full max-w-md rounded-md border border-laps-navy/25 bg-surface p-5 sm:p-6">
            {/* The signal rule marks this as the one thing asking for an answer. */}
            <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-laps-signal" />
            <button
              type="button"
              onClick={dismissCookies}
              aria-label={t.cookies.closeLabel}
              className="absolute right-1.5 top-2.5 inline-flex h-10 w-10 items-center justify-center rounded-md text-laps-navy/50 transition-colors duration-150 hover:bg-laps-ghost hover:text-laps-navy"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <h2
              id="cookie-consent-title"
              className="font-display pr-12 text-base font-bold text-laps-navy"
            >
              {t.cookies.title}
            </h2>
            <p
              id="cookie-consent-body"
              className="mt-2 text-sm leading-relaxed text-laps-navy/70 [text-wrap:pretty]"
            >
              {t.cookies.body}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                ref={acceptRef}
                type="button"
                onClick={acceptCookies}
                className="inline-flex h-10 min-w-[7rem] items-center justify-center rounded-md bg-laps-cta px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-laps-accent active:translate-y-px"
              >
                {t.cookies.accept}
              </button>
              <button
                type="button"
                onClick={dismissCookies}
                className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold text-laps-navy/60 transition-colors duration-150 hover:bg-laps-ghost hover:text-laps-navy active:translate-y-px"
              >
                {t.cookies.close}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
