import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Old address of the Prêmios e Bolsas page. Kept as a permanent hop so links
 * already shared (portal notices, messages, bookmarks) keep working; `replace`
 * keeps the dead URL out of the back-button history.
 */
export const Route = createFileRoute("/impactos")({
  beforeLoad: () => {
    throw redirect({ to: "/premios-e-bolsas", replace: true });
  },
});
