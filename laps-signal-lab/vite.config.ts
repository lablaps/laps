// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  // Render Static Site deploy target — no Worker runtime, just the client
  // shell + bundled JSON from src/lib/static-source.ts. Disabling the
  // cloudflare plugin and enabling SPA mode makes the build emit a real
  // dist/client/index.html that a static host can serve.
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
    spa: { enabled: true },
  },
  // Bind the dev server to all interfaces so the SPA is reachable from a
  // second device on the LAN (e.g. http://172.17.32.208:5173). The lovable
  // sandbox helper sets host/port for hosted previews; this only matters in
  // local `vite dev`.
  vite: {
    server: { host: true },
    build: {
      // Keep flag SVGs as separate files instead of base64 in the bundle.
      //
      // Vite inlines any asset under 4 KB, and most of the ~290 vendored flags
      // are smaller than that — which put nearly 300 KB of data: URIs into the
      // chunk that every page importing lib/flags.tsx has to download, to show
      // one or two flags. Emitted as files they are fetched only when an <img>
      // actually points at one, and they cache independently of the JS.
      assetsInlineLimit: (filePath: string) =>
        filePath.includes("/assets/flags/") ? false : undefined,
    },
  },
});
