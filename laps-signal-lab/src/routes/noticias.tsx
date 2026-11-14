import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { NewsFeed } from "@/components/news/NewsFeed";
import { useLang } from "@/hooks/use-lang";
import { NEWS_COPY, newsCategories } from "@/lib/news";

/**
 * Notícias — the site's main navigation entry. Every published news item,
 * newest first, filterable by the fixed categories. Projetos, Intercâmbio and
 * Prêmios e Bolsas hang under it in the header.
 */
export const Route = createFileRoute("/noticias")({
  head: () => ({
    meta: [
      { title: "Notícias — LAPS" },
      {
        name: "description",
        content:
          "Notícias do LAPS: projetos, intercâmbios, prêmios e bolsas dos pesquisadores do laboratório.",
      },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const { lang } = useLang();
  return (
    <PublicLayout>
      <NewsFeed
        copy={NEWS_COPY[lang]}
        scope={[]}
        filters={[...newsCategories]}
        queryKey="news-page"
      />
    </PublicLayout>
  );
}
