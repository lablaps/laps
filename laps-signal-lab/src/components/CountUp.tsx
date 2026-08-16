import { useEffect, useRef, useState } from "react";

export function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);
  const [val, setVal] = useState(0);
  // Mirrors `val` so the animation can read where the number currently sits
  // without taking it as a dependency and restarting itself every frame.
  const valRef = useRef(0);

  // Visibility and animation are two effects, not one. They used to be fused
  // behind a single `started` ref that latched on first intersection and never
  // reset: the tier cards sit above the fold, so on any load where the roster
  // query had not resolved yet the observer fired against `end === 0`, animated
  // 0 → 0, and latched. When the real counts arrived the effect re-ran, but the
  // latch swallowed them and every tier rendered a permanent 0. It looked
  // intermittent only because a warm TanStack Query cache (staleTime 5min) can
  // deliver the counts before first paint — and a Render cold start guarantees
  // it does not.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!seen) return;

    // Animate from whatever is on screen rather than from 0, so a count that
    // arrives late (0 → 12) and a count that is later corrected (12 → 13) both
    // move continuously instead of snapping back to zero first.
    const from = valRef.current;
    if (from === end) return;

    const start = performance.now();
    const dur = 1200;
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (end - from) * eased);
      valRef.current = next;
      setVal(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Without this, a second `end` change mid-flight leaves two rAF loops
    // writing to the same state and the number visibly stutters between them.
    return () => cancelAnimationFrame(raf);
  }, [seen, end]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}
