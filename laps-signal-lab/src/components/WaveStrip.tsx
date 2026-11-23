// Defaults are CSS variables, not hexes, so the strip follows the theme: SVG
// stroke resolves var() natively. --laps-navy inverts to a pale tone in dark
// mode, which is exactly what a hairline over a dark page needs; --laps-light
// already reads on both. Callers that pass explicit colours (the dark footer)
// are unaffected.
export function WaveStrip({
  className = "",
  color1 = "var(--laps-navy)",
  color2 = "var(--laps-light)",
}: {
  className?: string;
  color1?: string;
  color2?: string;
}) {
  return (
    <div className={`pointer-events-none overflow-hidden ${className}`}>
      <div className="wave-strip flex w-[200%]">
        {[0, 1].map((i) => (
          <svg key={i} viewBox="0 0 1200 80" preserveAspectRatio="none" className="h-full w-1/2 shrink-0">
            <path d="M0,40 Q150,5 300,40 T600,40 T900,40 T1200,40" fill="none" stroke={color1} strokeWidth="1.4" strokeOpacity="0.55" />
            <path d="M0,40 Q150,75 300,40 T600,40 T900,40 T1200,40" fill="none" stroke={color2} strokeWidth="1.2" strokeOpacity="0.7" />
            <path d="M0,40 Q100,20 200,40 T400,40 T600,40 T800,40 T1000,40 T1200,40" fill="none" stroke={color2} strokeWidth="0.8" strokeOpacity="0.4" />
            <path d="M0,40 Q100,60 200,40 T400,40 T600,40 T800,40 T1000,40 T1200,40" fill="none" stroke={color1} strokeWidth="0.8" strokeOpacity="0.35" />
          </svg>
        ))}
      </div>
    </div>
  );
}
