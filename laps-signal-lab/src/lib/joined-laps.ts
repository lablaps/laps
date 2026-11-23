// Formatting + parsing for when a member joined LAPS.
//
// Two independent granularities, mirroring Member#joinedSemester / #joinedMonth:
//   - semester: "YYYY.1" | "YYYY.2"  (Brazilian academic period)
//   - month:    "YYYY-MM"            (no day — we never collect one)
//
// A member may fill either, both, or neither.

export type Lang = "pt" | "en" | "fr";

const LOCALE: Record<Lang, string> = { pt: "pt-BR", en: "en-US", fr: "fr-FR" };

export const SEMESTER_RE = /^\d{4}\.[12]$/;
export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidSemester(v: string | null | undefined): boolean {
  return !!v && SEMESTER_RE.test(v);
}

export function isValidMonth(v: string | null | undefined): boolean {
  return !!v && MONTH_RE.test(v);
}

/**
 * "2024-08" → "agosto de 2024".
 *
 * Builds the Date from local parts rather than parsing the string. `new
 * Date("2024-08-01")` is parsed as UTC midnight, which renders as 31 July in
 * any negative-offset timezone — including UTC-3, where this lab is.
 */
export function formatJoinedMonth(value: string | null | undefined, lang: Lang): string | null {
  if (!isValidMonth(value)) return null;
  const [year, month] = value!.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString(LOCALE[lang], { year: "numeric", month: "long" });
}

const SEMESTER_LABEL: Record<Lang, (term: string, year: string) => string> = {
  pt: (term, year) => `${term}º semestre de ${year}`,
  en: (term, year) => `${term === "1" ? "1st" : "2nd"} semester ${year}`,
  fr: (term, year) => `${term === "1" ? "1er" : "2e"} semestre ${year}`,
};

/** "2024.1" → "1º semestre de 2024". */
export function formatJoinedSemester(value: string | null | undefined, lang: Lang): string | null {
  if (!isValidSemester(value)) return null;
  const [year, term] = value!.split(".");
  return SEMESTER_LABEL[lang](term, year);
}

/**
 * Single line for the public profile. When both are set the month is the
 * precise answer and the semester is shown alongside it in parentheses,
 * because the semester is what people in the lab actually say out loud.
 */
export function formatJoined(
  member: { joinedMonth?: string | null; joinedSemester?: string | null },
  lang: Lang,
): string | null {
  const month = formatJoinedMonth(member.joinedMonth, lang);
  const semester = formatJoinedSemester(member.joinedSemester, lang);
  if (month && semester) return `${month} (${semester})`;
  return month ?? semester;
}

/**
 * Years offered in the semester picker: current year first, back to 2005 (the
 * lab predates the site, so members can have joined well before it existed).
 * Includes next year so someone registering ahead of an intake can select it.
 */
export function semesterYears(): number[] {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current + 1; y >= 2005; y--) years.push(y);
  return years;
}
