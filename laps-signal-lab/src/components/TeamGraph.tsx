import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, useAnimationControls } from "framer-motion";
import { initials, type TeamMember, type Tier } from "@/lib/team-data";
import { areasBySlug, type AreaSlug } from "@/lib/areas-data";
import { useTeamRoster } from "@/hooks/use-team-roster";

// Scattered "constellation" graph.
//
// - Anchor positions are deterministic per member.id (seeded random) so the
//   layout stays stable across renders / admin edits.
// - Each node is draggable; releasing eases it back to its anchor.
// - Mouse-wheel zooms; dragging empty space pans.
// - Hover cascades through tier neighbors:
//     head     ↔ doctorate
//     doctorate ↔ master
//     master    ↔ undergrad
//   (Undergrads connect only to masters, as the user requested.)
// - Photos render inside the node; absent photos fall back to first-initial +
//   surname-initial via team-data.initials().

const VIEW_W = 1200;
const VIEW_H = 780;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;

// Radial preference per tier — head at center, others scattered in an annulus.
// The randomness inside each annulus keeps the layout organic (no concentric-
// ring feel) while still making roles visually distinguishable.
const TIER_ANNULUS: Record<Tier, [number, number]> = {
  head:        [0, 0],
  coordinator: [80, 150],
  manager:     [170, 240],
  doctorate:   [260, 360],
  master:      [380, 480],
  undergrad:   [500, 600],
};

const NODE_R: Record<Tier, number> = {
  head: 32,
  coordinator: 28,
  manager: 26,
  doctorate: 24,
  master: 20,
  undergrad: 17,
};

const NAVY = "#193A59";
const BLUE = "#0B4E8D";

const TIER_GRADIENT: Record<Tier, [string, string]> = {
  head:        ["#193A59", "#0B4E8D"],
  coordinator: ["#5B21B6", "#A78BFA"],
  manager:     ["#7C3AED", "#C4B5FD"],
  doctorate:   ["#0B4E8D", "#74B5F2"],
  master:      ["#10B981", "#6EE7B7"],
  undergrad:   ["#F59E0B", "#FCD34D"],
};

const STATUS_COLOR: Record<NonNullable<TeamMember["status"]>, string> = {
  ACTIVE: "#10B981",
  COMPLETED: "#94A3B8",
  INACTIVE: "#CBD5E1",
};

interface Pos { x: number; y: number }

// Deterministic seeded RNG so anchor positions are stable per member.id.
function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function anchorFor(member: TeamMember): Pos {
  const [rMin, rMax] = TIER_ANNULUS[member.tier];
  if (rMax === 0) return { x: CX, y: CY };
  const rnd = mulberry32(hashSeed(member.id));
  const angle = rnd() * Math.PI * 2;
  const radius = rMin + rnd() * (rMax - rMin);
  return {
    x: CX + Math.cos(angle) * radius,
    y: CY + Math.sin(angle) * radius,
  };
}

interface Props {
  labels: {
    tier: Record<Tier, string>;
    helper: string;
    legendTitle: string;
  };
  lang?: "pt" | "en" | "fr";
}

export function TeamGraph({ labels, lang = "en" }: Props) {
  const navigate = useNavigate();
  const { members: team } = useTeamRoster();

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Pan + zoom.
  //
  // The transform on the wrapped <g> used to be driven by React state. Every
  // wheel tick / pointermove called setView, which re-reconciled every node,
  // every edge and every framer-motion node in the tree. On large rosters this
  // overran a single frame, the work piled up, framer-motion's drag setup
  // threw mid-render, and the route's error boundary swapped in the
  // "this page didn't load" screen.
  //
  // We now keep the view in a ref and write `transform` directly to the SVG
  // group via setAttribute — React never sees the pan/zoom motion. The zoom
  // indicator label is the only thing kept in state, and only updates once
  // per animation frame.
  const viewRef = useRef({ x: 0, y: 0, scale: 1 });
  const transformGroupRef = useRef<SVGGElement | null>(null);
  const panRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [zoomLabel, setZoomLabel] = useState(100);
  const zoomLabelRaf = useRef<number | null>(null);

  const applyTransform = useCallback(() => {
    const g = transformGroupRef.current;
    if (!g) return;
    const { x, y, scale } = viewRef.current;
    g.setAttribute("transform", `translate(${x} ${y}) scale(${scale})`);
  }, []);

  const scheduleZoomLabel = useCallback(() => {
    if (zoomLabelRaf.current != null) return;
    zoomLabelRaf.current = requestAnimationFrame(() => {
      zoomLabelRaf.current = null;
      setZoomLabel(Math.round(viewRef.current.scale * 100));
    });
  }, []);

  // Per-member anchor (stable across re-renders + roster invalidations).
  const positions = useMemo(() => {
    const out: Record<string, Pos> = {};
    for (const m of team) out[m.id] = anchorFor(m);
    return out;
  }, [team]);

  // Tier-cascade adjacency. Each tier links to the one immediately below in
  // the official hierarchy:
  //   head ↔ coordinator ↔ manager ↔ doctorate ↔ master ↔ undergrad
  // Going through every adjacent pair keeps the visual cascade crisp without
  // exploding into a complete bipartite graph on every level.
  const { edges, neighborMap } = useMemo(() => {
    const byTier: Record<Tier, typeof team> = {
      head:        team.filter((m) => m.tier === "head"),
      coordinator: team.filter((m) => m.tier === "coordinator"),
      manager:     team.filter((m) => m.tier === "manager"),
      doctorate:   team.filter((m) => m.tier === "doctorate"),
      master:      team.filter((m) => m.tier === "master"),
      undergrad:   team.filter((m) => m.tier === "undergrad"),
    };
    const order: Tier[] = ["head", "coordinator", "manager", "doctorate", "master", "undergrad"];

    const edges: { from: string; to: string }[] = [];
    for (let i = 0; i < order.length - 1; i++) {
      const upper = byTier[order[i]];
      const lower = byTier[order[i + 1]];
      if (upper.length === 0 || lower.length === 0) continue;
      for (const u of upper) for (const l of lower) edges.push({ from: u.id, to: l.id });
    }

    const map: Record<string, Set<string>> = {};
    for (const e of edges) {
      (map[e.from] ??= new Set()).add(e.to);
      (map[e.to] ??= new Set()).add(e.from);
    }
    return { edges, neighborMap: map };
  }, [team]);

  const activeAreas = useMemo(() => {
    const s = new Set<AreaSlug>();
    for (const m of team) if (m.primaryArea) s.add(m.primaryArea);
    return Array.from(s).sort();
  }, [team]);

  // Wheel-zoom anchored to the cursor. Attached as a non-passive native
  // listener so e.preventDefault() works — React 17+ registers wheel as
  // passive by default which would otherwise scroll the page through us.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const cx = ((e.clientX - rect.left) / rect.width) * VIEW_W;
      const cy = ((e.clientY - rect.top) / rect.height) * VIEW_H;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const v = viewRef.current;
      const nextScale = Math.min(2.6, Math.max(0.45, v.scale * factor));
      const k = nextScale / v.scale;
      viewRef.current = {
        x: cx - k * (cx - v.x),
        y: cy - k * (cy - v.y),
        scale: nextScale,
      };
      applyTransform();
      scheduleZoomLabel();
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [applyTransform, scheduleZoomLabel]);

  const onPanStart = (e: ReactPointerEvent<SVGRectElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const v = viewRef.current;
    panRef.current = { startX: e.clientX, startY: e.clientY, baseX: v.x, baseY: v.y };
  };
  const onPanMove = (e: ReactPointerEvent<SVGRectElement>) => {
    if (!panRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const kx = VIEW_W / rect.width;
    const ky = VIEW_H / rect.height;
    viewRef.current = {
      ...viewRef.current,
      x: panRef.current.baseX + (e.clientX - panRef.current.startX) * kx,
      y: panRef.current.baseY + (e.clientY - panRef.current.startY) * ky,
    };
    applyTransform();
  };
  const onPanEnd = (e: ReactPointerEvent<SVGRectElement>) => {
    panRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  };
  const resetView = () => {
    viewRef.current = { x: 0, y: 0, scale: 1 };
    applyTransform();
    setZoomLabel(100);
  };
  const zoomBy = (factor: number) => {
    const v = viewRef.current;
    viewRef.current = { ...v, scale: Math.min(2.6, Math.max(0.45, v.scale * factor)) };
    applyTransform();
    setZoomLabel(Math.round(viewRef.current.scale * 100));
  };

  // Re-apply the transform once after mount (and after team data changes the
  // SVG node graph) so a fresh render restores the last viewRef state.
  useEffect(() => {
    applyTransform();
  }, [applyTransform, team]);

  return (
    <div className="relative">
      <div className="relative mx-auto aspect-[12/7.8] w-full max-w-6xl overflow-hidden rounded-2xl border border-laps-light/20 bg-gradient-to-b from-laps-ghost/30 via-white to-white">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="absolute inset-0 h-full w-full touch-none select-none"
          role="img"
          aria-label="LAPS researcher network"
        >
          <defs>
            {team.map((m) => {
              const [g1, g2] = TIER_GRADIENT[m.tier];
              return (
                <radialGradient key={`grad-${m.id}`} id={`grad-${m.id}`} cx="35%" cy="30%" r="75%">
                  <stop offset="0%" stopColor={g2} />
                  <stop offset="100%" stopColor={g1} />
                </radialGradient>
              );
            })}
            {team.map((m) => (
              <clipPath key={`clip-${m.id}`} id={`clip-${m.id}`}>
                <circle r={NODE_R[m.tier]} />
              </clipPath>
            ))}
          </defs>

          {/* Pan target — invisible rect that catches drags on empty space. */}
          <rect
            x={0}
            y={0}
            width={VIEW_W}
            height={VIEW_H}
            fill="transparent"
            style={{ cursor: "grab" }}
            onPointerDown={(e) => {
              (e.currentTarget as SVGRectElement).style.cursor = "grabbing";
              onPanStart(e);
            }}
            onPointerMove={onPanMove}
            onPointerUp={(e) => {
              (e.currentTarget as SVGRectElement).style.cursor = "grab";
              onPanEnd(e);
            }}
            onPointerCancel={(e) => {
              (e.currentTarget as SVGRectElement).style.cursor = "grab";
              onPanEnd(e);
            }}
          />

          <g ref={transformGroupRef}>
            {/* Edges — drawn first so they sit under the nodes. */}
            <g>
              {edges.map((e, i) => {
                const a = positions[e.from];
                const b = positions[e.to];
                if (!a || !b) return null;
                const touched =
                  !!hoveredId &&
                  (e.from === hoveredId ||
                    e.to === hoveredId ||
                    neighborMap[hoveredId]?.has(e.from) ||
                    neighborMap[hoveredId]?.has(e.to));
                const active = !!hoveredId && (e.from === hoveredId || e.to === hoveredId);
                const dim = !!hoveredId && !touched;
                return (
                  <line
                    key={`edge-${i}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={active ? NAVY : BLUE}
                    strokeOpacity={dim ? 0.04 : active ? 0.55 : 0.12}
                    strokeWidth={active ? 1.3 : 0.6}
                    style={{ transition: "stroke-opacity 180ms, stroke-width 180ms" }}
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g>
              {team.map((member) => {
                const anchor = positions[member.id];
                if (!anchor) return null;
                const isHovered = hoveredId === member.id;
                const isNeighbor =
                  !!hoveredId && (hoveredId === member.id || neighborMap[hoveredId]?.has(member.id));
                const dim = !!hoveredId && !isNeighbor;
                return (
                  <DraggableNode
                    key={member.id}
                    member={member}
                    anchor={anchor}
                    isHovered={isHovered}
                    dim={dim}
                    label={labels.tier[member.tier]}
                    onHoverStart={() => setHoveredId(member.id)}
                    onHoverEnd={() =>
                      setHoveredId((cur) => (cur === member.id ? null : cur))
                    }
                    onActivate={() =>
                      navigate({
                        to: "/team/$uuid",
                        params: { uuid: member.uuid ?? member.id },
                      })
                    }
                  />
                );
              })}
            </g>
          </g>
        </svg>

        {/* Floating controls */}
        <div className="pointer-events-auto absolute right-3 top-3 flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1 rounded-full border border-laps-light/40 bg-white/90 px-1 py-0.5 text-[10px] font-semibold text-laps-navy/70 shadow-sm backdrop-blur">
            <button
              type="button"
              onClick={() => zoomBy(1 / 1.2)}
              className="rounded-full px-2 py-1 hover:bg-laps-ghost"
              aria-label="Zoom out"
            >−</button>
            <span className="tabular-nums text-laps-navy/55">{zoomLabel}%</span>
            <button
              type="button"
              onClick={() => zoomBy(1.2)}
              className="rounded-full px-2 py-1 hover:bg-laps-ghost"
              aria-label="Zoom in"
            >+</button>
            <button
              type="button"
              onClick={resetView}
              className="rounded-full px-2 py-1 text-laps-navy/55 hover:bg-laps-ghost"
              aria-label="Reset view"
            >⟲</button>
          </div>
          <span className="rounded-full bg-white/85 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-laps-navy/50 shadow-sm backdrop-blur">
            arraste · zoom · clique
          </span>
        </div>
      </div>

      {/* Footer: helper + tier legend + area legend */}
      <div className="mt-6 space-y-4">
        <p className="text-center text-xs text-laps-navy/55">{labels.helper}</p>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px]">
          <span className="font-mono uppercase tracking-[0.2em] text-laps-navy/45">
            {labels.legendTitle}
          </span>
          {(["head", "coordinator", "manager", "doctorate", "master", "undergrad"] as const).map((tier) => (
            <span key={tier} className="flex items-center gap-1.5 text-laps-navy/75">
              <span
                className="inline-block rounded-full"
                style={{
                  width: NODE_R[tier] * 0.7,
                  height: NODE_R[tier] * 0.7,
                  background: `linear-gradient(135deg, ${TIER_GRADIENT[tier][1]}, ${TIER_GRADIENT[tier][0]})`,
                }}
              />
              {labels.tier[tier]}
            </span>
          ))}
        </div>

        {activeAreas.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px]">
            <span className="font-mono uppercase tracking-[0.2em] text-laps-navy/45">
              {lang === "pt" ? "Áreas" : lang === "fr" ? "Domaines" : "Areas"}
            </span>
            {activeAreas.map((slug) => {
              const area = areasBySlug[slug];
              return (
                <span key={slug} className="flex items-center gap-1.5 text-laps-navy/75">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: area.color }}
                  />
                  {area.name[lang]}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ───── DraggableNode ─────
// One node = static <g> placed at the anchor (so framer-motion never touches
// the absolute position) + an inner <motion.g> that owns the drag-offset.
// Earlier version put the anchor inside motion.g's SVG `transform` attribute,
// but framer-motion v12 manages its own transform via x/y motion values and
// silently overwrites the static SVG attribute — every node ended up stacked
// at (0,0).

function DraggableNode({
  member,
  anchor,
  isHovered,
  dim,
  label,
  onHoverStart,
  onHoverEnd,
  onActivate,
}: {
  member: TeamMember;
  anchor: Pos;
  isHovered: boolean;
  dim: boolean;
  label: string;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onActivate: () => void;
}) {
  const r = NODE_R[member.tier];
  const controls = useAnimationControls();
  const dragging = useRef(false);
  // Distinguish click from drag: only fire activate if the pointer barely moved.
  const downAt = useRef<{ x: number; y: number } | null>(null);

  // Mount gate. TanStack Start SSRs /team and useTeamRoster() returns the
  // static seed during SSR, so DraggableNode would render on the server too.
  // framer-motion's <motion.g drag> isn't SSR-safe — its drag setup pokes at
  // browser APIs that don't exist in Node, which crashes the whole route into
  // the global error boundary. We render a plain inert <g> on the server +
  // first client paint (so HTML/hydration match), then flip to the
  // interactive <motion.g> after the first effect runs.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // When the anchor changes (admin edit reflows positions) snap any current
  // drag-offset back to zero so the node sits at its new anchor immediately.
  useEffect(() => {
    if (mounted) controls.set({ x: 0, y: 0 });
  }, [anchor.x, anchor.y, controls, mounted]);

  const showLabel = member.tier === "head" || isHovered;
  const photo = member.photo;

  const visuals = (
    <>
      {/* Halo on hover, more pronounced for the head */}
      {isHovered && (
        <circle
          r={r + (member.tier === "head" ? 10 : 6)}
          fill="none"
          stroke={TIER_GRADIENT[member.tier][0]}
          strokeOpacity={0.45}
          strokeWidth={2}
        />
      )}

      {/* Main node */}
      <circle r={r} fill={`url(#grad-${member.id})`} stroke="white" strokeWidth={2} />

      {/* Photo (if any) clipped to a circle, on top of the gradient. */}
      {photo && (
        <image
          href={photo}
          x={-r}
          y={-r}
          width={r * 2}
          height={r * 2}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#clip-${member.id})`}
        />
      )}

      {/* Initials fallback — first name initial + surname initial, white over the gradient. */}
      {!photo && (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={Math.max(10, r * 0.62)}
          fontWeight={700}
          fill="white"
          pointerEvents="none"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          {initials(member.fullName)}
        </text>
      )}

      {/* Status dot — only when non-active */}
      {member.status && member.status !== "ACTIVE" && (
        <circle
          cx={r * 0.78}
          cy={-r * 0.78}
          r={3.5}
          fill={STATUS_COLOR[member.status]}
          stroke="white"
          strokeWidth={1.2}
        />
      )}

      {/* Label */}
      {showLabel && (
        <text
          y={r + 16}
          textAnchor="middle"
          fontSize={member.tier === "head" ? 12 : 11}
          fontWeight={member.tier === "head" || isHovered ? 600 : 500}
          fill={NAVY}
          opacity={isHovered ? 1 : 0.82}
          pointerEvents="none"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          {member.fullName.length > 24 && !isHovered
            ? member.fullName.slice(0, 23) + "…"
            : member.fullName}
        </text>
      )}
    </>
  );

  // Pre-mount: static, non-interactive. Renders identical SVG markup on the
  // server and on the first client paint so React doesn't see a hydration
  // mismatch when we upgrade to motion below.
  if (!mounted) {
    return (
      <g
        transform={`translate(${anchor.x} ${anchor.y})`}
        style={{ opacity: dim ? 0.22 : 1, transition: "opacity 180ms" }}
        role="button"
        tabIndex={0}
        aria-label={`${label}: ${member.fullName}`}
        onClick={onActivate}
      >
        {visuals}
      </g>
    );
  }

  return (
    <g transform={`translate(${anchor.x} ${anchor.y})`}>
      <motion.g
        drag
        dragMomentum={false}
        dragElastic={0.4}
        animate={controls}
        initial={{ x: 0, y: 0 }}
        onPointerDown={(e) => {
          downAt.current = { x: e.clientX, y: e.clientY };
          dragging.current = false;
        }}
        onDragStart={() => {
          dragging.current = true;
        }}
        onDragEnd={() => {
          controls.start({
            x: 0,
            y: 0,
            transition: { type: "spring", stiffness: 90, damping: 16, mass: 0.8 },
          });
        }}
        onPointerUp={(e) => {
          const start = downAt.current;
          downAt.current = null;
          if (dragging.current) {
            dragging.current = false;
            return;
          }
          if (start) {
            const dx = e.clientX - start.x;
            const dy = e.clientY - start.y;
            if (dx * dx + dy * dy < 25) onActivate();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActivate();
          }
        }}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        role="button"
        tabIndex={0}
        aria-label={`${label}: ${member.fullName}`}
        style={{
          cursor: "grab",
          opacity: dim ? 0.22 : 1,
          transition: "opacity 180ms",
        }}
        whileHover={{ scale: 1.08 }}
        whileDrag={{ scale: 1.15, cursor: "grabbing" }}
      >
        {visuals}
      </motion.g>
    </g>
  );
}
