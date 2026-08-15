import { QueryClient, QueryClientProvider, useIsFetching } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CookieConsent } from "@/components/CookieConsent";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import faviconUrl from "../assets/laps-logo.png?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LAPS — Laboratório de Aquisição e Processamento de Sinais" },
      { name: "description", content: "Pesquisa de ponta em processamento de sinais e inteligência artificial." },
      { name: "author", content: "LAPS" },
      { property: "og:title", content: "LAPS — Laboratório de Aquisição e Processamento de Sinais" },
      { property: "og:description", content: "Pesquisa de ponta em processamento de sinais e inteligência artificial." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: faviconUrl,
      },
      {
        rel: "apple-touch-icon",
        href: faviconUrl,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <TransitionLoader />
      <Outlet />
      {/* Mounted at the root so a dismissal survives client-side navigation —
          the component never unmounts as routes change. */}
      <CookieConsent />
      <Toaster />
    </QueryClientProvider>
  );
}

// Shows the loading screen when navigating between routes and queries are in-flight.
// Strategy:
//   1. Detect pathname change → show immediately.
//   2. Keep showing until both conditions are true:
//      a. At least MIN_MS have elapsed (prevents flash on fast navigations).
//      b. No active React Query fetches (isFetching === 0).
//   3. Then fade out via AnimatePresence.
const MIN_MS = 500;

function TransitionLoader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isFetching = useIsFetching();

  const [visible, setVisible] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const prevPathname = useRef(pathname);
  const minTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirst = useRef(true);

  // Show on every pathname change except the very first render.
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      prevPathname.current = pathname;
      return;
    }
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    setVisible(true);
    setMinElapsed(false);

    if (minTimer.current) clearTimeout(minTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);

    minTimer.current = setTimeout(() => setMinElapsed(true), MIN_MS);
  }, [pathname]);

  // Hide once both the minimum time and the fetch quiet-down are satisfied.
  useEffect(() => {
    if (!visible) return;
    if (!minElapsed || isFetching > 0) return;

    hideTimer.current = setTimeout(() => setVisible(false), 120);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [visible, minElapsed, isFetching]);

  return (
    <AnimatePresence>
      {visible && <LoadingScreen />}
    </AnimatePresence>
  );
}
