import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NewsCard } from "@/components/news/NewsCard";
import { useLang } from "@/hooks/use-lang";
import { NEWS_CATEGORY_LABEL, newsApi, type NewsCategory } from "@/lib/news";

const PAGE_SIZE = 12;

const ERROR: Record<"pt" | "en" | "fr", string> = {
  pt: "Não foi possível carregar.",
  en: "Could not load.",
  fr: "Chargement impossible.",
};

/**
 * A paged, filterable grid of news cards with a page header.
 *
 * Notícias and Prêmios e Bolsas are the same feed with different filters, so
 * they are one component: `scope` is what the page always shows (empty = all
 * news; Prêmios e Bolsas passes AWARD + SCHOLARSHIP), and `filters` are the
 * chips a reader can narrow it with. A chip replaces the scope rather than
 * intersecting it — the API matches any of the categories it is given, and
 * every chip offered is a subset of its page's scope.
 */
export function NewsFeed({
  copy,
  scope,
  filters,
  queryKey,
}: {
  copy: { title: string; intro: string; empty: string; all: string };
  scope: NewsCategory[];
  filters: NewsCategory[];
  queryKey: string;
}) {
  const { lang } = useLang();
  const [filter, setFilter] = useState<NewsCategory | null>(null);
  const [page, setPage] = useState(0);

  const categories = filter ? [filter] : scope;
  const query = useQuery({
    queryKey: ["news", queryKey, filter, page],
    queryFn: () => newsApi.list({ categories, page, size: PAGE_SIZE }),
  });

  const chips: (NewsCategory | null)[] = [null, ...filters];

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 md:px-10">
      <p className="label-tech">LAPS / {copy.title}</p>
      <h1 className="mt-6 font-display text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-tight text-balance text-laps-navy">
        {copy.title}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-laps-navy/70">
        {copy.intro}
      </p>

      <div
        role="group"
        aria-label={copy.title}
        className="mt-10 flex flex-wrap gap-2 border-b border-laps-navy/15 pb-6"
      >
        {chips.map((c) => {
          const active = filter === c;
          return (
            <button
              key={c ?? "all"}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setFilter(c);
                setPage(0);
              }}
              className={`min-h-10 rounded-md border px-4 text-sm font-semibold transition-colors ${
                active
                  ? "border-laps-accent bg-laps-accent text-white"
                  : "border-laps-navy/20 bg-surface text-laps-navy/75 hover:border-laps-blue/40"
              }`}
            >
              {c ? NEWS_CATEGORY_LABEL[c][lang] : copy.all}
            </button>
          );
        })}
      </div>

      <div className="mt-10" aria-live="polite">
        {query.isPending ? (
          <p className="text-sm text-laps-navy/60">…</p>
        ) : query.isError ? (
          <p role="alert" className="text-sm text-rose-700">
            {ERROR[lang]}
          </p>
        ) : query.data.content.length === 0 ? (
          <p className="py-12 text-laps-navy/60">{copy.empty}</p>
        ) : (
          <>
            <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {query.data.content.map((n) => (
                <NewsCard key={n.id} news={n} lang={lang} />
              ))}
            </div>
            {query.data.totalPages > 1 && (
              <nav className="mt-12 flex items-center gap-3">
                <button
                  type="button"
                  aria-label="←"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="min-h-10 min-w-10 rounded-md border border-laps-navy/20 px-4 text-sm font-semibold disabled:opacity-40"
                >
                  ←
                </button>
                <span className="font-mono text-sm tabular-nums text-laps-navy/60">
                  {page + 1} / {query.data.totalPages}
                </span>
                <button
                  type="button"
                  aria-label="→"
                  disabled={page + 1 >= query.data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="min-h-10 min-w-10 rounded-md border border-laps-navy/20 px-4 text-sm font-semibold disabled:opacity-40"
                >
                  →
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}
