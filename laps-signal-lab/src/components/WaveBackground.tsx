import { useEffect, useRef } from "react";

const VW = 1200; // logical viewport width — independent of pixel size
const VH = 420;
const MID = VH / 2;

// Per-frame cost is dominated by LINES × STEPS Math.exp + Math.sin calls
// inside the inner loop, so the desktop numbers (70 × 60 = 4200 evals/frame)
// melt mid-range phones. Halving both axes brings us to ~700 evals/frame on
// mobile, which holds 60 fps on a typical Android without visibly thinning
// out the wave (the canvas is rendered behind text).
const DESKTOP_STEPS = 60;
const DESKTOP_LINES = 70;
const MOBILE_STEPS = 30;
const MOBILE_LINES = 26;

// Fixed envelope peaks (small → big → medium-small) so the wave reads as a
// signal trace rather than a sine. Matches the reference image proportions.
const peaks: { x: number; w: number; h: number }[] = [
  { x: 150, w: 75, h: 38 },
  { x: 360, w: 130, h: 105 },
  { x: 620, w: 180, h: 155 },
  { x: 880, w: 115, h: 80 },
  { x: 1060, w: 70, h: 34 },
];

export function WaveBackground({
  color1 = "#0B4E8D",
  color2 = "#74B5F2",
  className = "",
}: {
  color1?: string;
  color2?: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0.5, active: false, strength: 0 });
  const visible = useRef(true);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    prefersReducedMotion.current = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Touch-primary devices (phones, most tablets). Used to pick the cheap
    // geometry, skip the pointer-hover bulge, and throttle to ~30 fps —
    // the wave is decorative, so trading framerate for battery is fine.
    const isMobile = typeof window !== "undefined"
      && window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    const STEPS = isMobile ? MOBILE_STEPS : DESKTOP_STEPS;
    const LINES = isMobile ? MOBILE_LINES : DESKTOP_LINES;
    // ~30 fps on mobile, uncapped on desktop. The decoration reads fine
    // either way and halving frames roughly halves CPU.
    const frameInterval = isMobile ? 1000 / 30 : 0;

    let raf = 0;
    let t = 0;
    let lastW = 0;
    let lastH = 0;
    let lastDraw = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // Cap DPR harder on mobile — most phones report 2.5–3.5, which
      // quadruples fill cost for no visible gain on a blurred background.
      const dprCap = isMobile ? 1.25 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (w === lastW && h === lastH) return;
      canvas.width = w;
      canvas.height = h;
      lastW = w;
      lastH = h;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // Skip work while the canvas is offscreen. The hero is at the top of the
    // page so this fires the moment the user scrolls past, recovering CPU.
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        visible.current = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: "100px" }
    );
    intersectionObserver.observe(canvas);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible.current) return;
      // Manual frame-rate cap. RAF still fires every vsync, but we skip
      // the heavy inner loop until enough time has elapsed.
      if (frameInterval > 0 && now - lastDraw < frameInterval) return;
      lastDraw = now;

      const w = canvas.width;
      const h = canvas.height;
      // Map logical viewBox into device pixels.
      const sx = w / VW;
      const sy = h / VH;

      t += prefersReducedMotion.current ? 0 : 0.012;
      // Skip the bulge math on touch devices — no hover input ever reaches us.
      const k = isMobile ? 0 : mouse.current.strength;
      if (!isMobile) {
        const target = mouse.current.active ? 1 : 0;
        mouse.current.strength += (target - mouse.current.strength) * 0.08;
      }
      const mx = mouse.current.x * VW;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < LINES; i++) {
        const frac = (i - LINES / 2) / (LINES / 2); // −1..1
        const absFrac = Math.abs(frac);
        const stroke = i % 3 === 0 ? color1 : color2;
        const opacity = 0.1 + absFrac * 0.5;

        ctx.beginPath();
        ctx.strokeStyle = stroke;
        ctx.globalAlpha = opacity;
        ctx.lineWidth = 0.55 * Math.min(sx, sy);

        ctx.moveTo(0, MID * sy);
        for (let s = 1; s <= STEPS; s++) {
          const x = (s / STEPS) * VW;
          // Base envelope (mountain shape).
          let env = 0;
          for (let p = 0; p < peaks.length; p++) {
            const dx = (x - peaks[p].x) / peaks[p].w;
            const e = peaks[p].h * Math.exp(-dx * dx * 1.5);
            if (e > env) env = e;
          }
          // Local bulge under the cursor.
          if (k > 0.01) {
            const dxm = (x - mx) / 130;
            env += 90 * k * Math.exp(-dxm * dxm);
          }
          const wave = Math.sin(x * 0.022 + t + frac * 0.4);
          const y = MID + frac * env * wave;
          ctx.lineTo(x * sx, y * sy);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(draw);

    // Skip pointer wiring on touch devices — they never produce hover events
    // anyway, and listening for `pointermove` on a scrolling phone is a real
    // jank source.
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) {
        mouse.current.active = false;
        return;
      }
      mouse.current.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      mouse.current.active = true;
    };
    const onLeave = () => {
      mouse.current.active = false;
    };
    if (!isMobile) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerout", onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (!isMobile) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerout", onLeave);
      }
    };
  }, [color1, color2]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none h-full w-full ${className}`}
      aria-hidden
    />
  );
}
