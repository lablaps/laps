import { useEffect, useRef } from "react";

interface Node {
  x: number; y: number;
  vx: number; vy: number;
  hx: number; hy: number;
  r: number;
  activation: number;
  pulse: number;
}

interface Burst {
  nodeIdx: number;
  startTime: number;
  hops: Set<number>;
}

const NAVY = "#193A59";
const BLUE = "#0B4E8D";
const LIGHT = "#74B5F2";

export function NeuralMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas) return;
    const c: HTMLCanvasElement = canvas;
    const ctx: CanvasRenderingContext2D | null = c.getContext("2d");
    if (!ctx) return;
    const g2 = ctx;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = r.width * dpr;
      c.height = r.height * dpr;
      g2.setTransform(dpr, 0, 0, dpr, 0, 0);
      const grad = g2.createRadialGradient(r.width / 2, r.height / 2, 0, r.width / 2, r.height / 2, Math.max(r.width, r.height) / 2);
      grad.addColorStop(0, "rgba(116, 181, 242, 0.18)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      g2.fillStyle = grad;
      g2.fillRect(0, 0, r.width, r.height);
      return;
    }

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0, height = 0;
    const isMobile = window.innerWidth < 768;
    const N = isMobile ? 50 : 100;
    const D = isMobile ? 130 : 160;

    const nodes: Node[] = [];
    const bursts: Burst[] = [];

    function resize() {
      const rect = c.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      c.width = width * dpr;
      c.height = height * dpr;
      g2.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      resize();
      nodes.length = 0;
      for (let i = 0; i < N; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const isHub = i < 4;
        nodes.push({
          x, y, vx: 0, vy: 0, hx: x, hy: y,
          r: isHub ? 7 : 3 + Math.random() * 2,
          activation: 0,
          pulse: 0,
        });
      }
    }

    function gauss() {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    let last = performance.now();
    let raf = 0;
    let running = true;

    function step(now: number) {
      const dt = Math.min((now - last) / 16.67, 2);
      last = now;

      g2.clearRect(0, 0, width, height);

      // Langevin update
      const gamma = 0.08, k = 0.002, eta = 0.15;
      for (const n of nodes) {
        const fx = -k * (n.x - n.hx);
        const fy = -k * (n.y - n.hy);
        n.vx += (-gamma * n.vx + fx) * dt + eta * gauss() * Math.sqrt(dt) * 0.3;
        n.vy += (-gamma * n.vy + fy) * dt + eta * gauss() * Math.sqrt(dt) * 0.3;
        n.x += n.vx * dt;
        n.y += n.vy * dt;

        // mouse activation
        if (mouseRef.current.active) {
          const dx = n.x - mouseRef.current.x;
          const dy = n.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            n.activation = Math.max(n.activation, 1 - dist / 80);
          }
        }

        n.activation *= 0.94;
        n.pulse *= 0.96;
      }

      // bursts (action potentials)
      const HOP_MS = 80;
      for (let bi = bursts.length - 1; bi >= 0; bi--) {
        const b = bursts[bi];
        const elapsed = now - b.startTime;
        const hopLevel = Math.floor(elapsed / HOP_MS);
        if (hopLevel > 6) { bursts.splice(bi, 1); continue; }
        // Cascade: activate neighbors of newly hopped nodes
        const current = Array.from(b.hops);
        for (const idx of current) {
          const node = nodes[idx];
          for (let j = 0; j < nodes.length; j++) {
            if (b.hops.has(j)) continue;
            const dx = nodes[j].x - node.x;
            const dy = nodes[j].y - node.y;
            if (dx * dx + dy * dy < D * D) {
              const expectedHop = hopLevel;
              if (expectedHop > 0) {
                b.hops.add(j);
                nodes[j].activation = 1;
                nodes[j].pulse = 1;
              }
            }
          }
        }
      }

      // edges
      g2.lineWidth = 0.8;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < D) {
            const baseOp = (1 - dist / D) * 0.35;
            const act = Math.max(a.activation, b.activation);
            const op = baseOp + act * 0.55;
            g2.strokeStyle = act > 0.2
              ? `rgba(11, 78, 141, ${Math.min(op, 0.95)})`
              : `rgba(11, 78, 141, ${baseOp})`;
            g2.beginPath();
            g2.moveTo(a.x, a.y);
            g2.lineTo(b.x, b.y);
            g2.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        // pulse ring
        if (n.pulse > 0.05) {
          const ringR = (1 - n.pulse) * 80;
          g2.strokeStyle = `rgba(11, 78, 141, ${n.pulse * 0.5})`;
          g2.lineWidth = 1.5;
          g2.beginPath();
          g2.arc(n.x, n.y, ringR, 0, Math.PI * 2);
          g2.stroke();
        }

        // node fill (interpolate light → blue)
        const a = n.activation;
        const r = Math.round(0x74 + (0x0B - 0x74) * a);
        const g = Math.round(0xB5 + (0x4E - 0xB5) * a);
        const bl = Math.round(0xF2 + (0x8D - 0xF2) * a);
        g2.fillStyle = `rgba(${r}, ${g}, ${bl}, ${0.7 + a * 0.3})`;
        g2.strokeStyle = BLUE;
        g2.lineWidth = 1;
        g2.beginPath();
        g2.arc(n.x, n.y, n.r + a * 2, 0, Math.PI * 2);
        g2.fill();
        g2.stroke();
      }

      if (running) raf = requestAnimationFrame(step);
    }

    init();
    raf = requestAnimationFrame((t) => { last = t; step(t); });

    function onMove(e: MouseEvent) {
      const rect = c.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    }
    function onLeave() { mouseRef.current.active = false; mouseRef.current.x = -9999; mouseRef.current.y = -9999; }
    function onClick(e: MouseEvent) {
      if (isMobile) return;
      const rect = c.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      let nearest = -1, best = Infinity;
      for (let i = 0; i < nodes.length; i++) {
        const dx = nodes[i].x - cx, dy = nodes[i].y - cy;
        const d = dx * dx + dy * dy;
        if (d < best) { best = d; nearest = i; }
      }
      if (nearest >= 0 && best < 100 * 100) {
        nodes[nearest].pulse = 1;
        nodes[nearest].activation = 1;
        bursts.push({ nodeIdx: nearest, startTime: performance.now(), hops: new Set([nearest]) });
      }
    }
    function onResize() { resize(); for (const n of nodes) { n.hx = Math.min(n.hx, width); n.hy = Math.min(n.hy, height); } }
    function onVis() {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(step); }
    }

    c.addEventListener("mousemove", onMove);
    c.addEventListener("mouseleave", onLeave);
    c.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      c.removeEventListener("mousemove", onMove);
      c.removeEventListener("mouseleave", onLeave);
      c.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Neural network visualization"
      className="absolute inset-0 h-full w-full cursor-crosshair"
    />
  );
}
