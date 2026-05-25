import { useEffect, useRef, useState } from "react";

const LIGHT_BLUE = "#81b4e0";
const DARK_BLUE = "#2c455f";


const FILL_FADE = 0.6;
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

type LetterPath = {
  id: string;
  d: string;
  color: string;
  strokeDelay: number;
  strokeDur: number;
  fillRule?: "nonzero" | "evenodd";
};

const PATHS: LetterPath[] = [
  // 1) "L" — light blue, drawn first
  {
    id: "l",
    color: LIGHT_BLUE,
    strokeDelay: 0.2,
    strokeDur: 1.2,
    d: "M 210.56 237.88 C 204.88 239.31 191.76 239.16 181.50 237.54 C 166.83 235.23 154.30 227.49 148.80 217.36 C 143.20 207.02 143.00 204.71 143.00 149.69 C 143.00 121.90 143.27 98.45 143.61 97.58 C 144.09 96.33 145.82 96.00 151.95 96.00 C 163.41 96.00 163.98 91.23 164.00 150.85 C 164.50 201.13 164.52 201.53 166.77 205.75 C 170.43 212.60 175.56 215.32 186.04 215.96 L 194.84 216.50 L 202.17 223.69 C 206.20 227.65 210.74 231.85 212.25 233.02 C 213.76 234.19 215.00 235.51 215.00 235.95 C 215.00 236.40 213.00 237.27 210.56 237.88 Z",
  },
  // 2) Main body — dark blue (A bowl + P bowl + S), starts while L is finishing
  {
    id: "body",
    color: DARK_BLUE,
    strokeDelay: 1.0,
    strokeDur: 3.2,
    fillRule: "evenodd",
    d: "M 498.00 235.78 C 496.08 236.35 491.58 237.03 488.00 237.28 C 469.97 238.55 450.77 232.39 434.31 220.06 C 419.63 209.06 413.81 200.93 411.94 188.76 C 409.44 172.52 408.76 169.45 406.84 165.70 C 404.18 160.47 398.65 155.27 393.00 152.68 C 389.38 151.01 386.44 150.60 378.00 150.57 C 368.93 150.54 366.91 150.85 363.16 152.83 C 358.64 155.23 352.42 161.13 342.87 172.10 C 338.70 176.89 335.46 179.45 330.37 181.98 C 324.22 185.03 322.61 185.40 315.00 185.45 C 301.52 185.53 290.01 179.82 280.40 168.29 C 267.00 152.21 264.67 150.92 248.87 150.88 C 240.32 150.86 237.25 151.25 233.81 152.80 C 227.57 155.62 223.50 159.75 219.60 167.24 C 213.36 179.20 213.78 190.02 220.90 200.73 C 228.30 211.88 235.87 216.25 248.00 216.40 C 253.98 216.48 256.47 216.02 260.27 214.15 C 269.52 209.60 277.33 199.53 280.08 188.61 C 280.72 186.05 281.59 183.75 282.02 183.49 C 282.45 183.22 285.88 184.52 289.65 186.37 C 293.42 188.23 297.46 190.04 298.64 190.40 C 302.25 191.52 302.87 195.42 302.68 215.79 C 302.53 231.70 302.24 235.24 301.00 236.02 C 299.29 237.10 293.23 237.26 287.82 236.37 C 284.04 235.74 282.99 234.31 281.56 227.75 C 280.79 224.23 278.75 224.25 274.14 227.84 C 269.81 231.21 266.02 233.28 260.23 235.42 C 254.65 237.49 241.02 237.48 233.93 235.41 C 206.74 227.47 189.12 198.21 195.45 171.50 C 199.57 154.12 209.34 141.50 224.50 133.98 C 236.87 127.85 248.95 126.80 263.81 130.57 C 272.86 132.87 279.79 137.64 291.50 149.62 C 302.99 161.39 308.23 165.00 313.78 165.00 C 319.25 165.00 327.70 159.84 331.01 154.49 C 333.50 150.45 345.70 138.48 350.04 135.80 C 357.44 131.25 366.52 129.00 377.35 129.04 C 395.31 129.10 404.94 132.86 416.04 144.16 C 425.75 154.03 429.96 163.83 431.88 181.00 C 432.99 190.86 434.74 193.92 443.55 201.35 C 455.09 211.06 467.43 216.58 479.94 217.61 C 492.45 218.64 500.15 215.35 501.45 208.43 C 503.27 198.70 499.96 196.32 477.00 190.82 C 463.87 187.68 453.78 180.35 448.89 170.44 C 446.02 164.60 445.78 163.39 446.27 157.26 C 447.23 145.23 454.59 134.81 464.84 130.94 C 477.35 126.23 497.42 127.50 510.00 133.80 C 515.16 136.39 515.52 136.81 515.77 140.53 C 516.07 144.79 513.63 150.66 510.87 152.35 C 509.69 153.07 506.92 152.57 500.87 150.55 C 481.55 144.10 463.61 148.88 465.38 160.00 C 466.19 165.09 469.71 167.53 481.26 170.99 C 503.38 177.61 508.19 179.36 512.01 182.12 C 525.35 191.79 526.43 213.65 514.20 226.34 C 510.38 230.29 504.12 233.94 498.00 235.78 Z",
  },
  // 3) "P" stem — light blue
  {
    id: "p-stem",
    color: LIGHT_BLUE,
    strokeDelay: 1.6,
    strokeDur: 1.0,
    d: "M 343.22 277.68 C 342.37 279.01 336.41 279.75 330.78 279.23 C 328.23 278.99 326.41 278.07 325.03 276.31 C 323.07 273.81 323.00 272.39 323.00 232.91 L 323.00 192.10 L 331.36 188.18 C 335.96 186.02 340.04 183.75 340.42 183.13 C 340.80 182.51 341.77 182.00 342.56 182.00 C 343.79 182.00 344.00 188.77 343.98 229.25 C 343.98 255.24 343.63 277.03 343.22 277.68 Z",
  },
  // 4) "A" cap highlight — light blue, last
  {
    id: "a-cap",
    color: LIGHT_BLUE,
    strokeDelay: 2.6,
    strokeDur: 0.8,
    d: "M 391.37 235.49 C 380.34 238.37 368.37 236.80 356.98 230.99 C 351.78 228.34 351.00 226.55 351.02 217.32 C 351.04 206.16 351.24 206.03 360.63 210.93 C 377.45 219.71 388.90 217.85 402.36 204.15 L 407.22 199.21 L 410.04 204.57 C 411.59 207.52 414.02 211.18 415.43 212.71 C 419.22 216.80 418.72 219.17 412.94 224.36 C 407.24 229.48 399.91 233.27 391.37 235.49 Z",
  },
];

// Full animation takes ~4.8 s (body path: delay 1.0 + draw 3.2 + fill 0.6).
const ANIMATION_DURATION_MS = 4800;
const LOOP_PAUSE_MS = 600;

interface LapsLogoAnimationProps {
  loop?: boolean;
}

export default function LapsLogoAnimation({ loop = false }: LapsLogoAnimationProps) {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    if (!loop) return;
    const id = setTimeout(
      () => setRunKey((k) => k + 1),
      ANIMATION_DURATION_MS + LOOP_PAUSE_MS,
    );
    return () => clearTimeout(id);
  }, [loop, runKey]);

  useEffect(() => {
    PATHS.forEach((p, i) => {
      const el = pathRefs.current[i];
      if (!el) return;

      const len = el.getTotalLength();

      // initial state: invisible fill, fully-offset stroke
      el.style.fillOpacity = "0";
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len}`;
      el.style.transition = "none";

      // force reflow so the next transition is honored
      void el.getBoundingClientRect();

      // schedule the stroke draw
      el.style.transition =
        `stroke-dashoffset ${p.strokeDur}s ${EASE} ${p.strokeDelay}s, ` +
        `fill-opacity ${FILL_FADE}s ease-out ${p.strokeDelay + p.strokeDur}s`;

      requestAnimationFrame(() => {
        el.style.strokeDashoffset = "0";
        el.style.fillOpacity = "1";
      });
    });
  }, [runKey]);

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        background: "transparent",
      }}
    >
      <svg
        key={runKey}
        viewBox="130 90 410 200"
        width="100%"
        style={{ maxWidth: 560, height: "auto", display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {PATHS.map((p, i) => (
          <path
            key={p.id}
            ref={(el) => {
              pathRefs.current[i] = el;
            }}
            d={p.d}
            fill={p.color}
            fillRule={p.fillRule ?? "nonzero"}
            stroke={p.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ fillOpacity: 0 }}
          />
        ))}
      </svg>

    </div>
  );
}
