// LAPS international exchange roster.
// Each entry references a member by slug — the page renders by joining this
// list against the static team data so all photos, tiers, UUIDs, and bios
// stay in a single source of truth.

export type CountryCode = "FR" | "CA" | "PT" | "IT";

export interface ExchangeEntry {
  /** Slug from team-data.ts (matches TeamMember.id). */
  memberSlug: string;
  country: CountryCode;
  /** Working languages while abroad. PT is implied; we list the non-PT ones explicitly. */
  languages: string[];
}

export const exchangeRoster: ExchangeEntry[] = [
  // Canada
  { memberSlug: "antonio-fhillipi-maciel-silva", country: "CA", languages: ["pt", "en", "fr"] },
  { memberSlug: "icaro-de-jesus-silva",          country: "CA", languages: ["pt", "en", "fr"] },

  // France
  { memberSlug: "marcelo-viana-da-silva", country: "FR", languages: ["pt", "fr", "en"] },
  { memberSlug: "ewaldo-eder-santana",    country: "FR", languages: ["pt", "fr", "en"] },

  // Portugal
  { memberSlug: "yanna-leidy-ketley-fernandes-cruz", country: "PT", languages: ["pt", "en"] },

  // Italy
  { memberSlug: "pedro-luis-jovino-da-silva", country: "IT", languages: ["pt", "it", "en"] },
];

export const COUNTRY_ORDER: CountryCode[] = ["FR", "CA", "PT", "IT"];

export interface CountryMeta {
  code: CountryCode;
  name: { pt: string; en: string; fr: string };
}

export const COUNTRIES: Record<CountryCode, CountryMeta> = {
  FR: { code: "FR", name: { pt: "França",   en: "France",   fr: "France"   } },
  CA: { code: "CA", name: { pt: "Canadá",   en: "Canada",   fr: "Canada"   } },
  PT: { code: "PT", name: { pt: "Portugal", en: "Portugal", fr: "Portugal" } },
  IT: { code: "IT", name: { pt: "Itália",   en: "Italy",    fr: "Italie"   } },
};
