// Regenerates src/lib/exchange-data.ts.
//
// Country names come from the runtime's ICU data rather than being typed by
// hand: 250-odd names in three languages is exactly the kind of table that
// rots, and "Côte d'Ivoire" / "Curaçao" / "São Tomé e Príncipe" are easy to get
// subtly wrong. The flag files on disk are the source of truth for which codes
// exist, so the list can never name a country whose flag is missing.
import fs from "node:fs";
import path from "node:path";

const root = process.argv[2];
const flagDir = path.join(root, "src/assets/flags/countries");
const out = path.join(root, "src/lib/exchange-data.ts");

const names = {
  pt: new Intl.DisplayNames(["pt"], { type: "region" }),
  en: new Intl.DisplayNames(["en"], { type: "region" }),
  fr: new Intl.DisplayNames(["fr"], { type: "region" }),
};

const codes = fs
  .readdirSync(flagDir)
  .filter((f) => f.endsWith(".svg"))
  .map((f) => f.replace(".svg", ""))
  .filter((c) => /^[A-Z]{2}$/.test(c))
  // Codes ICU cannot name are placeholders in the flag set, not countries.
  .filter((c) => names.pt.of(c) !== c);

const collator = new Intl.Collator("pt");
codes.sort((a, b) => collator.compare(names.pt.of(a), names.pt.of(b)));

// The 26 states plus the Federal District, with the region groupings the IBGE
// uses — handy for reading a long list, and stable.
const BR_STATES = [
  ["AC", "Acre", "Norte"],
  ["AL", "Alagoas", "Nordeste"],
  ["AP", "Amapá", "Norte"],
  ["AM", "Amazonas", "Norte"],
  ["BA", "Bahia", "Nordeste"],
  ["CE", "Ceará", "Nordeste"],
  ["DF", "Distrito Federal", "Centro-Oeste"],
  ["ES", "Espírito Santo", "Sudeste"],
  ["GO", "Goiás", "Centro-Oeste"],
  ["MA", "Maranhão", "Nordeste"],
  ["MT", "Mato Grosso", "Centro-Oeste"],
  ["MS", "Mato Grosso do Sul", "Centro-Oeste"],
  ["MG", "Minas Gerais", "Sudeste"],
  ["PA", "Pará", "Norte"],
  ["PB", "Paraíba", "Nordeste"],
  ["PR", "Paraná", "Sul"],
  ["PE", "Pernambuco", "Nordeste"],
  ["PI", "Piauí", "Nordeste"],
  ["RJ", "Rio de Janeiro", "Sudeste"],
  ["RN", "Rio Grande do Norte", "Nordeste"],
  ["RS", "Rio Grande do Sul", "Sul"],
  ["RO", "Rondônia", "Norte"],
  ["RR", "Roraima", "Norte"],
  ["SC", "Santa Catarina", "Sul"],
  ["SP", "São Paulo", "Sudeste"],
  ["SE", "Sergipe", "Nordeste"],
  ["TO", "Tocantins", "Norte"],
];

const q = (s) => JSON.stringify(s);

const header = `// GENERATED FILE — do not edit by hand.
//
// Country names are emitted from the runtime's ICU data (Intl.DisplayNames) and
// the code list is derived from the flag SVGs vendored in
// src/assets/flags/countries, so every entry here is guaranteed to have a flag
// to render. Regenerate with scripts/gen-exchange-data.mjs.
//
// Exchange destinations are stored on the member record as
// \`exchangeCountry\` (ISO 3166-1 alpha-2) plus, for Brazil, \`exchangeState\`
// (the two-letter UF). The public /exchange page reads them live from the API —
// there is no hand-maintained roster any more.

/** ISO 3166-1 alpha-2. Kept as a string so a new country never needs a code change. */
export type CountryCode = string;

export interface CountryMeta {
  code: CountryCode;
  name: { pt: string; en: string; fr: string };
}

/** The one country that also carries a state, for national mobility. */
export const BRAZIL: CountryCode = "BR";

export interface BrStateMeta {
  /** Two-letter UF. */
  code: string;
  name: string;
  /** IBGE macro-region, used to group the picker. */
  region: "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";
}
`;

const countryEntries = codes
  .map((c) => {
    const n = { pt: names.pt.of(c), en: names.en.of(c), fr: names.fr.of(c) };
    return `  ${c}: { code: ${q(c)}, name: { pt: ${q(n.pt)}, en: ${q(n.en)}, fr: ${q(n.fr)} } },`;
  })
  .join("\n");

const stateEntries = BR_STATES.map(
  ([code, name, region]) =>
    `  ${code}: { code: ${q(code)}, name: ${q(name)}, region: ${q(region)} },`,
).join("\n");

const body = `
export const COUNTRIES: Record<CountryCode, CountryMeta> = {
${countryEntries}
};

/** Every country code, sorted by Portuguese name. */
export const COUNTRY_ORDER: CountryCode[] = [
${codes.map((c) => `  ${q(c)},`).join("\n")}
];

export const BR_STATES: Record<string, BrStateMeta> = {
${stateEntries}
};

/** UFs in alphabetical order. */
export const BR_STATE_ORDER: string[] = [
${BR_STATES.map(([c]) => `  ${q(c)},`).join("\n")}
];

/**
 * Country name in the requested language, falling back to the raw code.
 *
 * Members carry whatever code was stored when they were edited, so a lookup can
 * miss if a code is ever retired upstream — showing "ZZ" beats rendering
 * "undefined" on the public site.
 */
export function countryName(code: string | null | undefined, lang: "pt" | "en" | "fr"): string {
  if (!code) return "";
  return COUNTRIES[code]?.name[lang] ?? code;
}

/** State name for a UF, falling back to the raw code. */
export function brStateName(code: string | null | undefined): string {
  if (!code) return "";
  return BR_STATES[code]?.name ?? code;
}
`;

fs.writeFileSync(out, header + body);
console.log(`wrote ${out}`);
console.log(`${codes.length} countries, ${BR_STATES.length} Brazilian states`);
