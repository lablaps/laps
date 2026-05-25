// Language proficiency catalogue — the single source of truth for language
// codes, proficiency systems, and level definitions.
//
// Design:
//   • ISO 639-1 codes as language identifiers (compact, standard, unambiguous)
//   • Each language belongs to one ProficiencySystem — the frontend renders
//     the correct level picker automatically
//   • Level values are opaque strings stored in the DB; this file is the only
//     place that knows what they mean
//   • rank (0–10) drives color coding independent of system names
//   • NATIVE is a universal level available for every language

export type ProficiencySystem = "CEFR" | "HSK" | "JLPT" | "TOPIK";
export type Lang = "pt" | "en" | "fr";

export interface LevelDef {
  value: string;
  short: string;
  label: Record<Lang, string>;
  rank: number; // 0 = lowest, 10 = native — drives badge color
}

export interface LanguageDef {
  code: string;
  name: Record<Lang, string>;
  system: ProficiencySystem;
  flag: string;
}

export interface LanguageEntry {
  code: string;
  level: string;
}

// ─── Universal level ────────────────────────────────────────────────────────

export const NATIVE_LEVEL: LevelDef = {
  value: "NATIVE",
  short: "Nativo",
  label: { pt: "Nativo", en: "Native", fr: "Natif" },
  rank: 10,
};

// ─── CEFR — Common European Framework of Reference ─────────────────────────
// Used for: PT, EN, FR, ES, DE, IT, NL, RU, AR, PL, TR

export const CEFR_LEVELS: LevelDef[] = [
  { value: "A1", short: "A1", label: { pt: "A1 — Iniciante",              en: "A1 — Beginner",          fr: "A1 — Débutant"              }, rank: 1 },
  { value: "A2", short: "A2", label: { pt: "A2 — Elementar",              en: "A2 — Elementary",        fr: "A2 — Élémentaire"           }, rank: 2 },
  { value: "B1", short: "B1", label: { pt: "B1 — Intermediário",          en: "B1 — Intermediate",      fr: "B1 — Intermédiaire"         }, rank: 3 },
  { value: "B2", short: "B2", label: { pt: "B2 — Intermediário Avançado", en: "B2 — Upper Intermediate", fr: "B2 — Intermédiaire Supérieur" }, rank: 4 },
  { value: "C1", short: "C1", label: { pt: "C1 — Avançado",               en: "C1 — Advanced",          fr: "C1 — Avancé"                }, rank: 5 },
  { value: "C2", short: "C2", label: { pt: "C2 — Proficiente",            en: "C2 — Proficient",        fr: "C2 — Maîtrise"              }, rank: 6 },
];

// ─── HSK — 汉语水平考试 (Chinese Proficiency Test) ──────────────────────────
// Used for: ZH (Mandarin Chinese)
// HSK 1–6 follows the pre-2021 standard, which remains the most widely cited.

export const HSK_LEVELS: LevelDef[] = [
  { value: "HSK1", short: "HSK 1", label: { pt: "HSK 1 — Básico (~150 palavras)",          en: "HSK 1 — Basic (~150 words)",          fr: "HSK 1 — Basique (~150 mots)"          }, rank: 1 },
  { value: "HSK2", short: "HSK 2", label: { pt: "HSK 2 — Básico (~300 palavras)",          en: "HSK 2 — Basic (~300 words)",          fr: "HSK 2 — Basique (~300 mots)"          }, rank: 2 },
  { value: "HSK3", short: "HSK 3", label: { pt: "HSK 3 — Intermediário (~600 palavras)",   en: "HSK 3 — Intermediate (~600 words)",   fr: "HSK 3 — Intermédiaire (~600 mots)"   }, rank: 3 },
  { value: "HSK4", short: "HSK 4", label: { pt: "HSK 4 — Intermediário (~1.200 palavras)", en: "HSK 4 — Intermediate (~1,200 words)", fr: "HSK 4 — Intermédiaire (~1 200 mots)" }, rank: 4 },
  { value: "HSK5", short: "HSK 5", label: { pt: "HSK 5 — Avançado (~2.500 palavras)",      en: "HSK 5 — Advanced (~2,500 words)",     fr: "HSK 5 — Avancé (~2 500 mots)"        }, rank: 5 },
  { value: "HSK6", short: "HSK 6", label: { pt: "HSK 6 — Proficiente (~5.000 palavras)",   en: "HSK 6 — Proficient (~5,000 words)",   fr: "HSK 6 — Maîtrise (~5 000 mots)"      }, rank: 6 },
];

// ─── JLPT — Japanese Language Proficiency Test ──────────────────────────────
// Used for: JA (Japanese). Levels run N5 (easiest) → N1 (hardest).

export const JLPT_LEVELS: LevelDef[] = [
  { value: "N5", short: "N5", label: { pt: "N5 — Básico",         en: "N5 — Basic",         fr: "N5 — Basique"       }, rank: 1 },
  { value: "N4", short: "N4", label: { pt: "N4 — Elementar",      en: "N4 — Elementary",    fr: "N4 — Élémentaire"   }, rank: 2 },
  { value: "N3", short: "N3", label: { pt: "N3 — Intermediário",  en: "N3 — Intermediate",  fr: "N3 — Intermédiaire" }, rank: 3 },
  { value: "N2", short: "N2", label: { pt: "N2 — Pré-Avançado",   en: "N2 — Pre-Advanced",  fr: "N2 — Pré-Avancé"   }, rank: 5 },
  { value: "N1", short: "N1", label: { pt: "N1 — Avançado",       en: "N1 — Advanced",      fr: "N1 — Avancé"        }, rank: 6 },
];

// ─── TOPIK — Test of Proficiency in Korean ──────────────────────────────────
// Used for: KO (Korean).
// TOPIK I covers levels 1–2; TOPIK II covers levels 3–6.

export const TOPIK_LEVELS: LevelDef[] = [
  { value: "TOPIK1", short: "TOPIK 1", label: { pt: "TOPIK I · Nível 1 — Básico",           en: "TOPIK I · Level 1 — Basic",           fr: "TOPIK I · Niveau 1 — Basique"          }, rank: 1 },
  { value: "TOPIK2", short: "TOPIK 2", label: { pt: "TOPIK I · Nível 2 — Básico",           en: "TOPIK I · Level 2 — Basic",           fr: "TOPIK I · Niveau 2 — Basique"          }, rank: 2 },
  { value: "TOPIK3", short: "TOPIK 3", label: { pt: "TOPIK II · Nível 3 — Intermediário",   en: "TOPIK II · Level 3 — Intermediate",   fr: "TOPIK II · Niveau 3 — Intermédiaire"  }, rank: 3 },
  { value: "TOPIK4", short: "TOPIK 4", label: { pt: "TOPIK II · Nível 4 — Intermediário",   en: "TOPIK II · Level 4 — Intermediate",   fr: "TOPIK II · Niveau 4 — Intermédiaire"  }, rank: 4 },
  { value: "TOPIK5", short: "TOPIK 5", label: { pt: "TOPIK II · Nível 5 — Avançado",        en: "TOPIK II · Level 5 — Advanced",       fr: "TOPIK II · Niveau 5 — Avancé"         }, rank: 5 },
  { value: "TOPIK6", short: "TOPIK 6", label: { pt: "TOPIK II · Nível 6 — Avançado",        en: "TOPIK II · Level 6 — Advanced",       fr: "TOPIK II · Niveau 6 — Avancé"         }, rank: 6 },
];

// ─── System → levels map ─────────────────────────────────────────────────────

export const LEVELS_BY_SYSTEM: Record<ProficiencySystem, LevelDef[]> = {
  CEFR:  CEFR_LEVELS,
  HSK:   HSK_LEVELS,
  JLPT:  JLPT_LEVELS,
  TOPIK: TOPIK_LEVELS,
};

// ─── Language catalogue ──────────────────────────────────────────────────────

export const LANGUAGE_CATALOG: LanguageDef[] = [
  // CEFR languages
  { code: "pt", name: { pt: "Português",  en: "Portuguese",        fr: "Portugais"    }, system: "CEFR",  flag: "🇧🇷" },
  { code: "en", name: { pt: "Inglês",     en: "English",           fr: "Anglais"      }, system: "CEFR",  flag: "🇺🇸" },
  { code: "fr", name: { pt: "Francês",    en: "French",            fr: "Français"     }, system: "CEFR",  flag: "🇫🇷" },
  { code: "es", name: { pt: "Espanhol",   en: "Spanish",           fr: "Espagnol"     }, system: "CEFR",  flag: "🇪🇸" },
  { code: "de", name: { pt: "Alemão",     en: "German",            fr: "Allemand"     }, system: "CEFR",  flag: "🇩🇪" },
  { code: "it", name: { pt: "Italiano",   en: "Italian",           fr: "Italien"      }, system: "CEFR",  flag: "🇮🇹" },
  { code: "nl", name: { pt: "Holandês",   en: "Dutch",             fr: "Néerlandais"  }, system: "CEFR",  flag: "🇳🇱" },
  { code: "ru", name: { pt: "Russo",      en: "Russian",           fr: "Russe"        }, system: "CEFR",  flag: "🇷🇺" },
  { code: "ar", name: { pt: "Árabe",      en: "Arabic",            fr: "Arabe"        }, system: "CEFR",  flag: "🇸🇦" },
  { code: "pl", name: { pt: "Polonês",    en: "Polish",            fr: "Polonais"     }, system: "CEFR",  flag: "🇵🇱" },
  { code: "tr", name: { pt: "Turco",      en: "Turkish",           fr: "Turc"         }, system: "CEFR",  flag: "🇹🇷" },
  // Non-CEFR languages with their own standardised test systems
  { code: "zh", name: { pt: "Mandarim",   en: "Mandarin Chinese",  fr: "Mandarin"     }, system: "HSK",   flag: "🇨🇳" },
  { code: "ja", name: { pt: "Japonês",    en: "Japanese",          fr: "Japonais"     }, system: "JLPT",  flag: "🇯🇵" },
  { code: "ko", name: { pt: "Coreano",    en: "Korean",            fr: "Coréen"       }, system: "TOPIK", flag: "🇰🇷" },
];

// Fast lookup maps
export const LANGUAGE_BY_CODE = Object.fromEntries(
  LANGUAGE_CATALOG.map((l) => [l.code, l])
) as Record<string, LanguageDef>;

const ALL_LEVELS: LevelDef[] = [
  ...CEFR_LEVELS, ...HSK_LEVELS, ...JLPT_LEVELS, ...TOPIK_LEVELS, NATIVE_LEVEL,
];

export const LEVEL_BY_VALUE = Object.fromEntries(
  ALL_LEVELS.map((l) => [l.value, l])
) as Record<string, LevelDef>;

// ─── Serialization boundary ──────────────────────────────────────────────────
// All code must go through these two functions. Nothing else touches raw JSON.

export function parseLanguages(raw: string | null | undefined): LanguageEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is LanguageEntry =>
        typeof e === "object" && e !== null &&
        typeof (e as Record<string, unknown>).code === "string" &&
        typeof (e as Record<string, unknown>).level === "string"
    );
  } catch {
    return [];
  }
}

export function serializeLanguages(entries: LanguageEntry[]): string {
  return JSON.stringify(entries);
}

// ─── Display helpers ─────────────────────────────────────────────────────────

/** Tailwind classes for the level badge — driven by rank, not system name. */
export function levelBadgeClass(level: string): string {
  if (level === "NATIVE") return "bg-laps-navy text-white";
  const rank = LEVEL_BY_VALUE[level]?.rank ?? 0;
  if (rank >= 6) return "bg-emerald-600 text-white";
  if (rank >= 5) return "bg-laps-blue text-white";
  if (rank >= 4) return "bg-violet-600 text-white";
  if (rank >= 3) return "bg-indigo-500 text-white";
  if (rank >= 2) return "bg-amber-500 text-white";
  return "bg-slate-400 text-white";
}

/** Short display label for a level value, translated into `lang`. */
export function levelShortLabel(level: string, lang: Lang): string {
  if (level === "NATIVE") return NATIVE_LEVEL.label[lang];
  return LEVEL_BY_VALUE[level]?.short ?? level;
}

/** Full descriptive label, e.g. "B2 — Upper Intermediate". */
export function levelFullLabel(level: string, lang: Lang): string {
  if (level === "NATIVE") return NATIVE_LEVEL.label[lang];
  return LEVEL_BY_VALUE[level]?.label[lang] ?? level;
}
