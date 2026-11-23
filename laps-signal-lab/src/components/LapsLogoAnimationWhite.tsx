import { useEffect, useRef, useState } from "react";
import svgRaw from "@/assets/file.svg?raw";

// The source SVG is auto-traced (~78 sub-paths in shades of white/grey) sitting on
// an opaque black rectangle (`fill="#000101"`). We:
//   1. drop the black background path so the logo reads on any backdrop, and
//   2. fade the remaining paths in with a left-to-right stagger to echo the
//      stroke-draw feeling of {@link LapsLogoAnimation} without needing
//      hand-curated stroke paths.

const TOTAL_DURATION_MS = 1800;
const PATH_FADE_MS = 480;
const LOOP_PAUSE_MS = 600;

interface Props {
  /** Max width of the rendered SVG (px). The aspect ratio is preserved. */
  maxWidth?: number;
  /** Replay continuously. Matches the prop on {@link LapsLogoAnimation} so the
   *  loading screen behaves the same in either theme. */
  loop?: boolean;
}

export default function LapsLogoAnimationWhite({ maxWidth = 480, loop = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    if (!loop) return;
    const id = setTimeout(() => setRunKey((k) => k + 1), TOTAL_DURATION_MS + LOOP_PAUSE_MS);
    return () => clearTimeout(id);
  }, [loop, runKey]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const svg = root.querySelector("svg");
    if (!svg) return;

    svg.style.width = "100%";
    svg.style.height = "auto";
    svg.style.display = "block";

    svg.querySelectorAll('path[fill="#000101"]').forEach((p) => p.remove());

    const paths = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
    if (paths.length === 0) return;

    type Item = { el: SVGPathElement; x: number };
    const items: Item[] = paths
      .map((el) => {
        let x = 0;
        try {
          x = el.getBBox().x;
        } catch {
          x = 0;
        }
        return { el, x };
      })
      .sort((a, b) => a.x - b.x);

    const minX = items[0]!.x;
    const maxX = items[items.length - 1]!.x;
    const span = Math.max(1, maxX - minX);
    const staggerMs = Math.max(0, TOTAL_DURATION_MS - PATH_FADE_MS);

    for (const { el, x } of items) {
      const delay = ((x - minX) / span) * staggerMs;
      // Transition cleared first so a looped replay snaps back to invisible
      // instead of fading out over PATH_FADE_MS on its way to the next run.
      el.style.transition = "none";
      el.style.opacity = "0";
    }

    void svg.getBoundingClientRect();

    for (const { el, x } of items) {
      const delay = ((x - minX) / span) * staggerMs;
      el.style.transition = `opacity ${PATH_FADE_MS}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`;
    }

    requestAnimationFrame(() => {
      for (const { el } of items) el.style.opacity = "1";
    });
  }, [runKey]);

  return (
    <div
      ref={containerRef}
      className="mx-auto flex items-center justify-center"
      style={{ width: "100%", maxWidth }}
      aria-label="LAPS"
      role="img"
      dangerouslySetInnerHTML={{ __html: svgRaw }}
    />
  );
}
