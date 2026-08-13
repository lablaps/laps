// Undergraduate courses the lab recruits from. Mirrors the Java enum
// br.uema.laps.member.UndergradProgram — the `code` values are the enum names
// and travel over the wire verbatim, so they must not be renamed on a whim.
//
// This is distinct from a member's role/tier: the role is seniority in the lab
// (UNDERGRAD → MASTER → DOCTORATE), while the program is which bachelor's they
// came through. A doctoral student can still have one.

export type UndergradProgramCode = "COMPUTER_ENGINEERING" | "ARTIFICIAL_INTELLIGENCE";

export interface UndergradProgramMeta {
  code: UndergradProgramCode;
  /** Full course name, as the university writes it. */
  name: { pt: string; en: string; fr: string };
  /** Compact form for badges and table cells. */
  short: { pt: string; en: string; fr: string };
  /** Tailwind classes for the badge — mirrors the tier chip palette. */
  badge: string;
}

export const UNDERGRAD_PROGRAMS: Record<UndergradProgramCode, UndergradProgramMeta> = {
  COMPUTER_ENGINEERING: {
    code: "COMPUTER_ENGINEERING",
    name: {
      pt: "Bacharelado em Engenharia de Computação",
      en: "Computer Engineering Bachelor",
      fr: "Licence en Génie Informatique",
    },
    short: { pt: "Eng. Computação", en: "Computer Eng.", fr: "Génie Info." },
    badge: "bg-laps-ghost text-laps-blue",
  },
  ARTIFICIAL_INTELLIGENCE: {
    code: "ARTIFICIAL_INTELLIGENCE",
    name: {
      pt: "Bacharelado em Inteligência Artificial",
      en: "Artificial Intelligence Bachelor",
      fr: "Licence en Intelligence Artificielle",
    },
    short: { pt: "Inteligência Artificial", en: "Artificial Intelligence", fr: "Intelligence Artificielle" },
    badge: "bg-violet-50 text-violet-700",
  },
};

/** Stable display order — the long-running course first, then the new one. */
export const UNDERGRAD_PROGRAM_ORDER: UndergradProgramCode[] = [
  "COMPUTER_ENGINEERING",
  "ARTIFICIAL_INTELLIGENCE",
];

/** Narrows an arbitrary API string to a known program, or null. */
export function toProgramCode(raw: string | null | undefined): UndergradProgramCode | null {
  if (!raw) return null;
  return raw in UNDERGRAD_PROGRAMS ? (raw as UndergradProgramCode) : null;
}

export function programName(raw: string | null | undefined, lang: "pt" | "en" | "fr"): string | null {
  const code = toProgramCode(raw);
  return code ? UNDERGRAD_PROGRAMS[code].name[lang] : null;
}

export function programShort(raw: string | null | undefined, lang: "pt" | "en" | "fr"): string | null {
  const code = toProgramCode(raw);
  return code ? UNDERGRAD_PROGRAMS[code].short[lang] : null;
}
