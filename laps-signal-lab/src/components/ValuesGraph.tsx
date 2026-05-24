import { useEffect, useRef } from "react";

interface VNode {
  x: number; y: number; vx: number; vy: number; hx: number; hy: number;
  label: string; activation: number;
}

const EDGES: [number, number][] = [
  [0, 1], // Confiabilidade — Tecnologia
  [1, 2], // Tecnologia — Avanço
  [0, 3], // Confiabilidade — Conhecimento
  [3, 2], // Conhecimento — Avanço
];

export function ValuesGraph({ labels }: { labels: readonly string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const g = ctx;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;

    const positions = [
      { fx: 0.18, fy: 0.30 }, // Confiabilidade
      { fx: 0.55, fy: 0.20 }, // Tecnologia
      { fx: 0.82, fy: 0.65 }, // Avanço
      { fx: 0.30, fy: 0.78 }, // Conhecimento
    ];
    const nodes: VNode[] = positions.map((p, i) => ({
      x: 0, y: 0, vx: 0, vy: 0, hx: 0, hy: 0,
      label: labels[i] ?? "", activation: 0,
    }));

    function resize() {
      const r = c.getBoundingClientRect();
      W = r.width; H = r.height;
      c.width = W * dpr; c.height = H * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes.forEach((n, i) => {
        n.hx = positions[i].fx * W;
        n.hy = positions[i].fy * H;
        if (n.x === 0 && n.y === 0) { n.x = n.hx; n.y = n.hy; }
      });
    }

    function gauss() {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    let last = performance.now(), raf = 0, running = true;

    function loop(now: number) {
      const dt = Math.min((now - last) / 16.67, 2);
      last = now;
      g.clearRect(0, 0, W, H);

      const gamma = 0.07, k = 0.003, eta = 0.12;
      for (const n of nodes) {
        n.vx += (-gamma * n.vx + -k * (n.x - n.hx)) * dt + eta * gauss() * Math.sqrt(dt) * 0.25;
        n.vy += (-gamma * n.vy + -k * (n.y - n.hy)) * dt + eta * gauss() * Math.sqrt(dt) * 0.25;
        n.x += n.vx * dt; n.y += n.vy * dt;

        if (mouseRef.current.active) {
          const dx = n.x - mouseRef.current.x, dy = n.y - mouseRef.current.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) n.activation = Math.max(n.activation, 1 - d / 90);
        }
        n.activation *= 0.93;
      }

      // edges
      g.lineWidth = 1.2;
      for (const [a, b] of EDGES) {
        const na = nodes[a], nb = nodes[b];
        const act = Math.max(na.activation, nb.activation);
        g.strokeStyle = `rgba(11, 78, 141, ${0.35 + act * 0.55})`;
        g.beginPath();
        g.moveTo(na.x, na.y);
        g.lineTo(nb.x, nb.y);
        g.stroke();
      }

      // nodes + labels
      g.font = "700 13px Montserrat, sans-serif";
      g.textAlign = "center";
      for (const n of nodes) {
        const a = n.activation;
        const radius = 8 + a * 4;
        g.fillStyle = `rgba(11, 78, 141, ${0.85 + a * 0.15})`;
        g.beginPath();
        g.arc(n.x, n.y, radius, 0, Math.PI * 2);
        g.fill();

        g.fillStyle = "#193A59";
        const scale = 1 + a * 0.1;
        g.save();
        g.translate(n.x, n.y + radius + 18);
        g.scale(scale, scale);
        g.fillText(n.label.toUpperCase(), 0, 0);
        g.restore();
      }

      if (running) raf = requestAnimationFrame(loop);
    }

    resize();
    raf = requestAnimationFrame((t) => { last = t; loop(t); });

    function onMove(e: MouseEvent) {
      const r = c.getBoundingClientRect();
      mouseRef.current.x = e.clientX - r.left;
      mouseRef.current.y = e.clientY - r.top;
      mouseRef.current.active = true;
    }
    function onLeave() { mouseRef.current.active = false; }
    function onResize() { resize(); }

    c.addEventListener("mousemove", onMove);
    c.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);
    return () => {
      running = false; cancelAnimationFrame(raf);
      c.removeEventListener("mousemove", onMove);
      c.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [labels]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Values graph" />;
}
