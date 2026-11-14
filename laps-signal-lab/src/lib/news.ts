import { request, type MemberRole } from "@/lib/api";
import type { Lang } from "@/lib/i18n";

/**
 * Client side of the Notícias API (laps-api news package, V34).
 *
 * Reads are public; writes go through /api/v1/admin/news and need a manager
 * session — the console is the only caller of those.
 */

/** The fixed, filterable tags. "Prêmios e Bolsas" = AWARD or SCHOLARSHIP. */
export const newsCategories = ["AWARD", "SCHOLARSHIP", "NATIONAL", "INTERNATIONAL"] as const;
export type NewsCategory = (typeof newsCategories)[number];

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, Record<Lang, string>> = {
  AWARD: { pt: "Prêmio", en: "Award", fr: "Prix" },
  SCHOLARSHIP: { pt: "Bolsa", en: "Scholarship", fr: "Bourse" },
  NATIONAL: { pt: "Nacional", en: "National", fr: "National" },
  INTERNATIONAL: { pt: "Internacional", en: "International", fr: "International" },
};

/**
 * "Prêmios e Bolsas" is the news feed filtered to these. Shared by the page,
 * the nav and the profile section so the three can never disagree on what
 * counts as an honour.
 */
export const HONOUR_CATEGORIES: NewsCategory[] = ["AWARD", "SCHOLARSHIP"];

/** Copy for the Prêmios e Bolsas page and its nav entry. */
export const HONOURS_COPY: Record<
  Lang,
  { title: string; intro: string; empty: string; all: string }
> = {
  pt: {
    title: "Prêmios e Bolsas",
    intro: "Prêmios, bolsas e reconhecimentos de quem faz o LAPS.",
    empty: "Nenhum prêmio ou bolsa publicado ainda.",
    all: "Todos",
  },
  en: {
    title: "Honours & Awards",
    intro: "Awards, scholarships and recognitions earned by the people behind LAPS.",
    empty: "No honours or awards published yet.",
    all: "All",
  },
  fr: {
    title: "Distinctions et bourses",
    intro: "Prix, bourses et distinctions des personnes qui font le LAPS.",
    empty: "Aucune distinction ou bourse publiée pour l’instant.",
    all: "Tout",
  },
};

/** Copy for the Notícias page — the main feed. */
export const NEWS_COPY: Record<Lang, { title: string; intro: string; empty: string; all: string }> =
  {
    pt: {
      title: "Notícias",
      intro:
        "O que acontece no LAPS: projetos, intercâmbios, prêmios e bolsas de quem faz o laboratório.",
      empty: "Nenhuma notícia publicada ainda.",
      all: "Todas",
    },
    en: {
      title: "News",
      intro:
        "What is happening at LAPS: projects, exchanges, awards and scholarships from the people in the lab.",
      empty: "No news published yet.",
      all: "All",
    },
    fr: {
      title: "Actualités",
      intro:
        "Ce qui se passe au LAPS : projets, échanges, prix et bourses des membres du laboratoire.",
      empty: "Aucune actualité publiée pour l’instant.",
      all: "Toutes",
    },
  };

export interface NewsText {
  pt: string | null;
  en: string | null;
  fr: string | null;
}

export interface NewsPerson {
  id: string;
  slug: string;
  fullName: string;
  photoUrl: string | null;
  currentRole: MemberRole;
}

export interface ApiNews {
  id: string;
  title: NewsText;
  subtitle: NewsText;
  imageUrl: string | null;
  linkUrl: string | null;
  /** ISO date, "YYYY-MM-DD". */
  publishedOn: string;
  categories: NewsCategory[];
  tags: string[];
  people: NewsPerson[];
  createdAt: string;
  updatedAt: string;
}

/** What the console sends. An update replaces the whole card. */
export interface NewsInput {
  title: NewsText & { pt: string };
  subtitle: NewsText;
  imageUrl: string | null;
  linkUrl: string | null;
  publishedOn: string;
  categories: NewsCategory[];
  tags: string[];
  memberIds: string[];
}

export interface NewsPage {
  content: ApiNews[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface NewsFilters {
  categories?: NewsCategory[];
  memberId?: string;
  page?: number;
  size?: number;
}

export const newsApi = {
  list: (filters: NewsFilters = {}) => {
    const params = new URLSearchParams();
    for (const c of filters.categories ?? []) params.append("category", c);
    if (filters.memberId) params.set("memberId", filters.memberId);
    params.set("page", String(filters.page ?? 0));
    params.set("size", String(filters.size ?? 12));
    return request<NewsPage>(`/api/v1/news?${params}`);
  },
  get: (id: string) => request<ApiNews>(`/api/v1/news/${encodeURIComponent(id)}`),
  create: (body: NewsInput) => request<ApiNews>("/api/v1/admin/news", { method: "POST", body }),
  update: (id: string, body: NewsInput) =>
    request<ApiNews>(`/api/v1/admin/news/${encodeURIComponent(id)}`, { method: "PUT", body }),
  remove: (id: string) =>
    request<void>(`/api/v1/admin/news/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

/** The text in the reader's language, falling back to Portuguese (always present on titles). */
export function newsText(text: NewsText, lang: Lang): string | null {
  return text[lang]?.trim() || text.pt?.trim() || null;
}
