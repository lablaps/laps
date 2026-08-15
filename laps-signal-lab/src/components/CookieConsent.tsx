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
          className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 sm:p-6"
        >
          {/* pointer-events-none on the wrapper would swallow clicks on the page
              behind the banner's empty horizontal margins; scope it to the card. */}
          <div className="pointer-events-auto relative w-full max-w-xl rounded-2xl border border-border/60 bg-background/95 p-5 shadow-lg backdrop-blur-sm sm:p-6">
            <button
              type="button"
              onClick={dismissCookies}
              aria-label={t.cookies.closeLabel}
              className="absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-[color,background-color,transform] duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <h2
              id="cookie-consent-title"
              className="pr-12 text-base font-semibold tracking-tight text-foreground"
            >
              {t.cookies.title}
            </h2>
            <p
              id="cookie-consent-body"
              className="mt-2 text-sm leading-relaxed text-muted-foreground [text-wrap:pretty]"
            >
              {t.cookies.body}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                ref={acceptRef}
                type="button"
                onClick={acceptCookies}
                className="inline-flex h-10 min-w-[7rem] items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-[background-color,transform] duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
              >
                {t.cookies.accept}
              </button>
              <button
                type="button"
                onClick={dismissCookies}
                className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium text-muted-foreground transition-[color,background-color,transform] duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
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
