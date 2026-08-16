import { COUNTRIES, BR_STATES, type CountryCode } from "./exchange-data";

/**
 * Flags for every country and every Brazilian state.
 *
 * This used to be four hand-written inline SVGs in a `Record<CountryCode, …>`
 * keyed by a four-member union — which meant adding a destination was a code
 * change, and picking a country the lab had not been to before was impossible.
 * The flags are now vendored as files (see src/assets/flags) and resolved by
 * code at render time, so the picker can offer the full ISO list.
 *
 * They are bundled rather than pulled from a flag CDN deliberately: the site's
 * CSP would permit `https:` images, but a lab site that still renders correctly
 * with no third-party network is worth more than the ~1.3 MB of SVG, none of
 * which is downloaded unless a member is actually shown for that place.
 */

// Vite rewrites these to emitted asset URLs at build time. Eager because the
// maps are needed synchronously during render; the SVGs themselves are separate
// files that the browser only fetches when an <img> actually points at one.
const countryFiles = import.meta.glob("../assets/flags/countries/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const brStateFiles = import.meta.glob("../assets/flags/br/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function byCode(files: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [filePath, url] of Object.entries(files)) {
    const base = filePath
      .split("/")
      .pop()!
      .replace(/\.svg$/, "");
    out[base.toUpperCase()] = url;
  }
  return out;
}

export const COUNTRY_FLAG_URL = byCode(countryFiles);
export const BR_STATE_FLAG_URL = byCode(brStateFiles);

interface FlagProps {
  className?: string;
  /** Rendered as the alt text; falls back to the code. */
  label?: string;
}

/**
 * Shown when a code has no flag on disk — a stored code that ISO retired, or a
 * typo from a direct API write. A grey chip with the code beats a broken image
 * icon, and makes the bad data legible instead of invisible.
 */
function FlagFallback({ code, className }: { code: string; className?: string }) {
  return (
    <span
      className={`flex h-full w-full items-center justify-center bg-laps-ink/8 text-[9px] font-bold tracking-wider text-laps-navy/50 ${className ?? ""}`}
      aria-hidden
    >
      {code.toUpperCase()}
    </span>
  );
}

export function CountryFlag({ code, className, label }: FlagProps & { code: CountryCode }) {
  const key = (code ?? "").toUpperCase();
  const url = COUNTRY_FLAG_URL[key];
  if (!url) return <FlagFallback code={key} className={className} />;
  return (
    <img
      src={url}
      alt={label ?? COUNTRIES[key]?.name.pt ?? key}
      loading="lazy"
      decoding="async"
      className={`h-full w-full object-cover ${className ?? ""}`}
    />
  );
}

export function BrStateFlag({ code, className, label }: FlagProps & { code: string }) {
  const key = (code ?? "").toUpperCase();
  const url = BR_STATE_FLAG_URL[key];
  if (!url) return <FlagFallback code={key} className={className} />;
  return (
    <img
      src={url}
      alt={label ?? BR_STATES[key]?.name ?? key}
      loading="lazy"
      decoding="async"
      className={`h-full w-full object-cover ${className ?? ""}`}
    />
  );
}

/**
 * Country flag, or the state's flag when the destination is inside Brazil.
 * Every surface that shows "where is this member" wants this pair together.
 */
export function DestinationFlag({
  country,
  state,
  className,
}: {
  country: CountryCode;
  state?: string | null;
  className?: string;
}) {
  if (country?.toUpperCase() === "BR" && state) {
    return <BrStateFlag code={state} className={className} />;
  }
  return <CountryFlag code={country} className={className} />;
}
