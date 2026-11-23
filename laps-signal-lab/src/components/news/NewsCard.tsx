import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { resolveMediaUrl } from "@/lib/api";
import { initials } from "@/lib/team-data";
import { NEWS_CATEGORY_LABEL, newsText, type ApiNews } from "@/lib/news";
import type { Lang } from "@/lib/i18n";

const COPY: Record<Lang, { readMore: string; people: string }> = {
  pt: { readMore: "Ler mais", people: "Pessoas" },
  en: { readMore: "Read more", people: "People" },
  fr: { readMore: "Lire la suite", people: "Personnes" },
};

/**
 * One news card: image, categories, title, subtitle, tags, the people
 * involved and an optional link out. There is no detail page by design — the
 * card is the item — so everything a reader can follow is on it: each person
 * links to their profile, and the external link opens the source.
 *
 * Shared by /noticias and /premios-e-bolsas, so a prize looks the same in
 * both places.
 */
export function NewsCard({ news, lang }: { news: ApiNews; lang: Lang }) {
  const title = newsText(news.title, lang) ?? "";
  const subtitle = newsText(news.subtitle, lang);
  const copy = COPY[lang];

  return (
    <article className="flex min-w-0 flex-col border-t border-laps-navy/15 pt-5">
      {news.imageUrl && (
        <div className="mb-4 aspect-[16/9] overflow-hidden rounded-sm bg-laps-ghost">
          <img
            src={resolveMediaUrl(news.imageUrl)}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover outline outline-1 -outline-offset-1 outline-black/10"
          />
        </div>
      )}

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.1em] text-laps-navy/55">
        <time dateTime={news.publishedOn} className="tabular-nums">
          {formatDate(news.publishedOn, lang)}
        </time>
        {news.categories.map((c) => (
          <span key={c} className="text-laps-signal">
            {NEWS_CATEGORY_LABEL[c][lang]}
          </span>
        ))}
      </p>

      <h3 className="mt-2 font-display text-xl font-bold leading-snug text-balance text-laps-navy">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-2 text-sm leading-relaxed text-pretty text-laps-navy/70">{subtitle}</p>
      )}

      {news.tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {news.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-sm bg-laps-ghost px-2 py-0.5 text-xs font-medium text-laps-blue"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {news.people.length > 0 && (
        <ul aria-label={copy.people} className="mt-4 flex flex-wrap gap-2">
          {news.people.map((p) => (
            <li key={p.id}>
              <Link
                to="/team/$uuid"
                params={{ uuid: p.slug || p.id }}
                className="flex min-h-10 items-center gap-2 rounded-full border border-laps-navy/15 bg-surface py-1 pl-1 pr-3 text-sm font-medium text-laps-navy/85 transition-colors hover:border-laps-blue/40 hover:text-laps-blue"
              >
                <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-laps-ghost font-mono text-[9px] font-semibold text-laps-navy/60">
                  {p.photoUrl ? (
                    <img
                      src={resolveMediaUrl(p.photoUrl)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials(p.fullName)
                  )}
                </span>
                {p.fullName}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {news.linkUrl && (
        <a
          href={news.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-10 items-center gap-1.5 self-start text-sm font-semibold text-laps-blue underline-offset-4 hover:underline"
        >
          {copy.readMore}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      )}
    </article>
  );
}

function formatDate(iso: string, lang: Lang): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "pt" ? "pt-BR" : lang === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
