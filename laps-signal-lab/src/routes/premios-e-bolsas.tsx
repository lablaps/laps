import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { NewsFeed } from "@/components/news/NewsFeed";
import { useLang } from "@/hooks/use-lang";
import { HONOURS_COPY, HONOUR_CATEGORIES } from "@/lib/news";

/**
 * Prêmios e Bolsas: the news feed scoped to items tagged AWARD or SCHOLARSHIP,
 * reached from the Notícias menu. There is no separate prizes data model — the
 * old Impacts records and API were removed (V35); a prize is published as news.
 *
 * The old /impactos URL redirects here (routes/impactos.tsx).
 */
export const Route = createFileRoute("/premios-e-bolsas")({
  head: () => ({ meta: [{ title: "Prêmios e Bolsas | LAPS" }] }),
  component: HonoursPage,
});

function HonoursPage() {
  const { lang } = useLang();
  return (
    <PublicLayout>
      <NewsFeed
        copy={HONOURS_COPY[lang]}
        scope={HONOUR_CATEGORIES}
        filters={HONOUR_CATEGORIES}
        queryKey="honours-page"
      />
    </PublicLayout>
  );
}
