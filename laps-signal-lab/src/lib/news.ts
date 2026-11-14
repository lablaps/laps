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
