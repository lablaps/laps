import { useMemo, useState } from "react";
import { Check, MapPin, Search, X } from "lucide-react";
import {
  BRAZIL,
  BR_STATES,
  BR_STATE_ORDER,
  COUNTRIES,
  COUNTRY_ORDER,
  brStateName,
  countryName,
  type BrStateMeta,
} from "@/lib/exchange-data";
import { BrStateFlag, CountryFlag } from "@/lib/flags";

/**
 * Picks where a member went on exchange: a country, plus a UF when that country
 * is Brazil.
 *
 * This replaces a four-option radio list. Two things forced a real picker: the
 * catalogue is now the full ISO list, which no radio group can carry, and
 * domestic mobility needs a second, dependent field. Keeping both in one
 * component is what keeps the pair consistent — clearing the country here also
 * clears the state, which is the same rule AdminController enforces on write.
 */

export interface Placement {
  /** ISO 3166-1 alpha-2, or "" for no exchange. */
  country: string;
  /** UF, or "" — only meaningful when country is "BR". */
  state: string;
}

/** Accent- and case-insensitive, so "sao tome" and "açores" both find their entry. */
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const REGION_ORDER: BrStateMeta["region"][] = [
  "Norte",
  "Nordeste",
  "Centro-Oeste",
  "Sudeste",
  "Sul",
];

export function ExchangePlacementPicker({
  value,
  onChange,
}: {
  value: Placement;
  onChange: (next: Placement) => void;
}) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return COUNTRY_ORDER;
    return COUNTRY_ORDER.filter((code) => {
      const c = COUNTRIES[code];
      return (
        normalize(code).startsWith(q) ||
        normalize(c.name.pt).includes(q) ||
        normalize(c.name.en).includes(q) ||
        normalize(c.name.fr).includes(q)
      );
    });
  }, [query]);

  function selectCountry(code: string) {
    // Switching countries drops any UF: a São Paulo placement that becomes a
    // French one must not keep "SP" hanging off it.
    onChange({ country: code, state: code === BRAZIL ? value.state : "" });
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-laps-navy/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar país…"
          className="h-9 w-full rounded-md border border-laps-navy/15 bg-white pl-9 pr-8 text-sm text-laps-navy placeholder:text-laps-navy/35 focus:border-laps-blue/40 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Limpar busca"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-laps-navy/40 hover:text-laps-navy/70"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto rounded-md border border-laps-navy/10">
        <PickerRow
          selected={value.country === ""}
          onSelect={() => onChange({ country: "", state: "" })}
          label="Nenhum (sem intercâmbio)"
          muted
        />
        {matches.map((code) => (
          <PickerRow
            key={code}
            selected={value.country === code}
            onSelect={() => selectCountry(code)}
            label={countryName(code, "pt")}
            code={code}
            flag={<CountryFlag code={code} />}
          />
        ))}
        {matches.length === 0 && (
          <p className="px-3 py-4 text-center text-xs italic text-laps-navy/40">
            Nenhum país encontrado para “{query}”.
          </p>
        )}
      </div>

      {value.country === BRAZIL && (
        <div className="rounded-md border border-laps-blue/25 bg-laps-ghost/40 p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-laps-blue" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-laps-navy/65">
              Estado de destino
            </span>
          </div>
          <div className="flex items-center gap-2">
            {value.state && (
              <span className="inline-block h-6 w-9 shrink-0 overflow-hidden rounded shadow-[0_0_0_1px_rgba(0,0,0,0.12)]">
                <BrStateFlag code={value.state} />
              </span>
            )}
            <select
              value={value.state}
              onChange={(e) => onChange({ country: BRAZIL, state: e.target.value })}
              className="h-9 w-full rounded-md border border-laps-navy/15 bg-white px-2 text-sm text-laps-navy focus:border-laps-blue/40 focus:outline-none"
            >
              <option value="">— Estado não informado —</option>
              {REGION_ORDER.map((region) => (
                <optgroup key={region} label={region}>
                  {BR_STATE_ORDER.filter((uf) => BR_STATES[uf].region === region).map((uf) => (
                    <option key={uf} value={uf}>
                      {brStateName(uf)} ({uf})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-laps-navy/50">
            Mobilidade nacional. O estado aparece agrupado na página de intercâmbio, com a bandeira
            correspondente.
          </p>
        </div>
      )}
    </div>
  );
}

function PickerRow({
  selected,
  onSelect,
  label,
  code,
  flag,
  muted,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  code?: string;
  flag?: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 px-3 py-2 text-left transition ${
        selected ? "bg-laps-ghost" : "hover:bg-laps-ghost/50"
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          selected ? "border-laps-blue bg-laps-blue text-white" : "border-laps-navy/25"
        }`}
      >
        {selected && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
      </span>
      {flag && (
        <span className="inline-block h-4 w-6 shrink-0 overflow-hidden rounded-sm shadow-[0_0_0_1px_rgba(0,0,0,0.1)]">
          {flag}
        </span>
      )}
      <span className={`flex-1 truncate text-sm ${muted ? "text-laps-navy/60" : "text-laps-navy"}`}>
        {label}
      </span>
      {code && <span className="shrink-0 font-mono text-[10px] text-laps-navy/35">{code}</span>}
    </button>
  );
}
