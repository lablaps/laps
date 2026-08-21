import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, useAnimationControls, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { initials, type Tier } from "@/lib/team-data";
import { TIER_COLOR, TIER_GRADIENT } from "@/lib/tier-visual";
import { useTeamRoster, type RosterMember } from "@/hooks/use-team-roster";
import { fetchProjects, type ApiProject } from "@/lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const VIEW_W = 1200;
const VIEW_H = 780;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;

const TIER_ORDER: Tier[] = [
  "head",
  "collaborator",
  "doctorate",
  "master",
  "undergrad",
];

// Both tables now live in lib/tier-visual.ts — see the note there on why the
// six-hue version was replaced by one ramp plus an accent.

// Radial annulus [rMin, rMax] per tier — head at center.
const TIER_ANNULUS: Record<Tier, [number, number]> = {
  head: [0, 0],
  collaborator: [100, 200],
  doctorate: [260, 360],
  master: [380, 480],
  undergrad: [500, 600],
};

// Base node radius per tier (degree will scale up to MAX_R).
const BASE_R: Record<Tier, number> = {
  head: 32,
  collaborator: 25,
  doctorate: 22,
  master: 18,
  undergrad: 14,
};
const MIN_R = 14;
const MAX_R = 36;

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pos {
  x: number;
  y: number;
}

interface GraphEdge {
  from: string; // slug
  to: string; // slug
  weight: number;
}

interface GraphNode extends RosterMember {
  degree: number;
  r: number;
  top3: string[]; // full names of top-3 collaborators
}

// ─── Utilities ────────────────────────────────────────────────────────────────

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
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function anchorFor(m: RosterMember): Pos {
  const [rMin, rMax] = TIER_ANNULUS[m.tier];
  if (rMax === 0) return { x: CX, y: CY };
  const rnd = mulberry32(hashSeed(m.slug));
  const angle = rnd() * Math.PI * 2;
  const r = rMin + rnd() * (rMax - rMin);
  return { x: CX + Math.cos(angle) * r, y: CY + Math.sin(angle) * r };
}

// Quadratic bezier curved path — perpendicular offset keeps parallel edges apart.
function bezierD(a: Pos, b: Pos, curvature = 0.15): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const bend = len * curvature;
  const cx = mx + (-dy / len) * bend;
  const cy = my + (dx / len) * bend;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

function normStr(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// ─── Graph data hook ──────────────────────────────────────────────────────────

function useGraphData(
  members: RosterMember[],
  projects: ApiProject[],
): {
  nodes: GraphNode[];
  edges: GraphEdge[];
  neighborMap: Map<string, Set<string>>;
  maxWeight: number;
} {
  return useMemo(() => {
    const bySlug = new Map<string, RosterMember>(members.map((m) => [m.slug, m]));
    // Leaders use member UUIDs; map back to slug for the rest of the graph.
    const uuidToSlug = new Map<string, string>(members.map((m) => [m.id, m.slug]));

    // Build edges from shared project membership.
    // For every project, every pair of member-leaders gets +1 weight.
    // API3: we only read the memberId field — no raw model binding.
    const edgeCounter = new Map<string, number>();

    for (const proj of projects) {
      const slugsInProject = (proj.leaders ?? [])
        .map((l) => uuidToSlug.get(l.memberId))
        .filter((s): s is string => s !== undefined && bySlug.has(s));

      for (let i = 0; i < slugsInProject.length; i++) {
        for (let j = i + 1; j < slugsInProject.length; j++) {
          const a = slugsInProject[i]!;
          const b = slugsInProject[j]!;
          const key = a < b ? `${a}__${b}` : `${b}__${a}`;
          edgeCounter.set(key, (edgeCounter.get(key) ?? 0) + 1);
        }
      }
    }

    const edges: GraphEdge[] = Array.from(edgeCounter.entries()).map(([key, weight]) => {
      const sep = key.indexOf("__");
      return { from: key.slice(0, sep), to: key.slice(sep + 2), weight };
    });

    const maxWeight = edges.reduce((acc, e) => Math.max(acc, e.weight), 1);

    // Degree + top-collaborator weights per member.
    const degrees = new Map<string, number>();
    const collabWeights = new Map<string, Map<string, number>>();

    for (const e of edges) {
      degrees.set(e.from, (degrees.get(e.from) ?? 0) + e.weight);
      degrees.set(e.to, (degrees.get(e.to) ?? 0) + e.weight);
      if (!collabWeights.has(e.from)) collabWeights.set(e.from, new Map());
      if (!collabWeights.has(e.to)) collabWeights.set(e.to, new Map());
      collabWeights.get(e.from)!.set(e.to, e.weight);
      collabWeights.get(e.to)!.set(e.from, e.weight);
    }

    const maxDeg = Math.max(1, ...degrees.values());

    const nodes: GraphNode[] = members.map((m) => {
      const deg = degrees.get(m.slug) ?? 0;
      const base = BASE_R[m.tier];
      const r = Math.min(MAX_R, Math.max(MIN_R, base + (deg / maxDeg) * (MAX_R - base)));

      const cMap = collabWeights.get(m.slug);
      const top3 = cMap
        ? Array.from(cMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([slug]) => bySlug.get(slug)?.fullName ?? slug)
        : [];

      return { ...m, degree: deg, r, top3 };
    });

    const neighborMap = new Map<string, Set<string>>();
    for (const e of edges) {
      if (!neighborMap.has(e.from)) neighborMap.set(e.from, new Set());
      if (!neighborMap.has(e.to)) neighborMap.set(e.to, new Set());
      neighborMap.get(e.from)!.add(e.to);
      neighborMap.get(e.to)!.add(e.from);
    }

    return { nodes, edges, neighborMap, maxWeight };
  }, [members, projects]);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  labels: {
    tier: Record<Tier, string>;
    helper: string;
    legendTitle: string;
  };
  lang?: "pt" | "en" | "fr";
}

// ─── TeamGraph ────────────────────────────────────────────────────────────────

export function TeamGraph({ labels }: Props) {
  const navigate = useNavigate();
  const { members } = useTeamRoster();

  // API4: size is bounded server-side; client reads the full list (typically <100 projects).
  const { data: projects = [] } = useQuery<ApiProject[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
  });

  const { nodes, edges, neighborMap, maxWeight } = useGraphData(members, projects);

  // UI state
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeRoles, setActiveRoles] = useState<Set<Tier>>(new Set(TIER_ORDER));
  const [edgeThreshold, setEdgeThreshold] = useState(1);
  const [railOpen, setRailOpen] = useState(false);

  // Cursor screen coords (for hover card position)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  // Pan/zoom — kept in refs, written directly to SVG via setAttribute.
  const viewRef = useRef({ x: 0, y: 0, scale: 1 });
  const transformGroupRef = useRef<SVGGElement | null>(null);
  const panRef = useRef<{
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    moved: boolean;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [zoomLabel, setZoomLabel] = useState(100);
  const zoomRaf = useRef<number | null>(null);

  const applyTransform = useCallback(() => {
    const g = transformGroupRef.current;
    if (!g) return;
    const { x, y, scale } = viewRef.current;
    g.setAttribute("transform", `translate(${x} ${y}) scale(${scale})`);
  }, []);

  const scheduleZoomLabel = useCallback(() => {
    if (zoomRaf.current != null) return;
    zoomRaf.current = requestAnimationFrame(() => {
      zoomRaf.current = null;
      setZoomLabel(Math.round(viewRef.current.scale * 100));
    });
  }, []);

  // Stable anchor positions per slug.
  const positions = useMemo(() => {
    const out: Record<string, Pos> = {};
    for (const m of nodes) out[m.slug] = anchorFor(m);
    return out;
  }, [nodes]);

  // Filtered nodes & edges.
  const filteredNodes = useMemo(() => {
    const q = normStr(search.trim());
    return nodes.filter((m) => {
      if (!activeRoles.has(m.tier)) return false;
      if (q && !normStr(m.fullName).includes(q)) return false;
      return true;
    });
  }, [nodes, activeRoles, search]);

  const filteredSlugs = useMemo(
    () => new Set(filteredNodes.map((m) => m.slug)),
    [filteredNodes]
  );

  const filteredEdges = useMemo(
    () =>
      edges.filter(
        (e) =>
          e.weight >= edgeThreshold &&
          filteredSlugs.has(e.from) &&
          filteredSlugs.has(e.to)
      ),
    [edges, edgeThreshold, filteredSlugs]
  );

  // Active focus: selected takes priority over hovered.
  const activeId = selectedId ?? hoveredId;

  const egoSet = useMemo(() => {
    if (!activeId) return null;
    const nb = neighborMap.get(activeId) ?? new Set<string>();
    return new Set([activeId, ...nb]);
  }, [activeId, neighborMap]);

  // Role counts for filter chips.
  const roleCounts = useMemo(() => {
    const c = {} as Record<Tier, number>;
    for (const t of TIER_ORDER) c[t] = nodes.filter((m) => m.tier === t).length;
    return c;
  }, [nodes]);

  // ── Pan / zoom ──────────────────────────────────────────────────────────────

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
      const next = Math.min(3, Math.max(0.3, v.scale * factor));
      const k = next / v.scale;
      viewRef.current = { x: cx - k * (cx - v.x), y: cy - k * (cy - v.y), scale: next };
      applyTransform();
      scheduleZoomLabel();
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [applyTransform, scheduleZoomLabel]);

  const onPanStart = (e: ReactPointerEvent<SVGRectElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const v = viewRef.current;
    panRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: v.x,
      baseY: v.y,
      moved: false,
    };
  };

  const onPanMove = (e: ReactPointerEvent<SVGRectElement>) => {
    setCursor({ x: e.clientX, y: e.clientY });
    if (!panRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dx = e.clientX - panRef.current.startX;
    const dy = e.clientY - panRef.current.startY;
    if (dx * dx + dy * dy > 9) panRef.current.moved = true;
    viewRef.current = {
      ...viewRef.current,
      x: panRef.current.baseX + dx * (VIEW_W / rect.width),
      y: panRef.current.baseY + dy * (VIEW_H / rect.height),
    };
    applyTransform();
  };

  const onPanEnd = (e: ReactPointerEvent<SVGRectElement>) => {
    const p = panRef.current;
    panRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // noop
    }
    // Click on empty canvas → deselect
    if (p && !p.moved) setSelectedId(null);
    (e.currentTarget as SVGRectElement).style.cursor = "grab";
  };

  const resetView = useCallback(() => {
    viewRef.current = { x: 0, y: 0, scale: 1 };
    applyTransform();
    setZoomLabel(100);
  }, [applyTransform]);

  const zoomBy = (f: number) => {
    const v = viewRef.current;
    viewRef.current = { ...v, scale: Math.min(3, Math.max(0.3, v.scale * f)) };
    applyTransform();
    setZoomLabel(Math.round(viewRef.current.scale * 100));
  };

  // ── Focus a node: pan viewport so the node is at center ─────────────────────

  const focusNode = useCallback(
    (slug: string) => {
      const a = positions[slug];
      if (!a) return;
      setSelectedId(slug);
      const v = viewRef.current;
      viewRef.current = {
        x: CX - a.x * v.scale,
        y: CY - a.y * v.scale,
        scale: v.scale,
      };
      applyTransform();
    },
    [positions, applyTransform]
  );

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedId(null);
        setHoveredId(null);
      }
      if ((e.key === "f" || e.key === "F") && !e.ctrlKey && !e.metaKey) {
        resetView();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [resetView]);

  // Re-apply transform after mount / members change.
  useEffect(() => {
    applyTransform();
  }, [applyTransform, members]);

  // ── Hover card: follow cursor for hover, anchored to node for selected ───────

  const activeNode = nodes.find(
    (m) => m.slug === (selectedId ?? hoveredId)
  ) as GraphNode | undefined;

  const cardPos = useMemo(() => {
    if (!activeNode) return null;
    if (selectedId && svgRef.current) {
      // Pin to node position
      const a = positions[activeNode.slug];
      if (!a) return null;
      const rect = svgRef.current.getBoundingClientRect();
      const v = viewRef.current;
      const vbX = a.x * v.scale + v.x;
      const vbY = a.y * v.scale + v.y;
      return {
        x: rect.left + (vbX / VIEW_W) * rect.width,
        y: rect.top + (vbY / VIEW_H) * rect.height,
      };
    }
    return cursor;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNode, selectedId, cursor, positions]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="relative">
      <div className="flex items-start gap-3">
        {/* Left rail */}
        <AnimatePresence>
          {railOpen && (
            <LeftRail
              search={search}
              onSearch={setSearch}
              activeRoles={activeRoles}
              onToggleRole={(tier) =>
                setActiveRoles((prev) => {
                  const next = new Set(prev);
                  next.has(tier) ? next.delete(tier) : next.add(tier);
                  return next;
                })
              }
              roleCounts={roleCounts}
              edgeThreshold={edgeThreshold}
              onEdgeThreshold={setEdgeThreshold}
              onReset={resetView}
              labels={labels}
            />
          )}
        </AnimatePresence>

        {/* Main graph */}
        <div className="relative flex-1 min-w-0">
          <div className="relative mx-auto aspect-[12/7.8] w-full max-w-6xl overflow-hidden rounded-md border border-laps-navy/15"
            style={{ background: "radial-gradient(ellipse at 50% 40%, #f8fafc 35%, #eef2f7 100%)" }}
          >
            {/* Faint dotted grid */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
              aria-hidden
            >
              <defs>
                <pattern id="grid-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="#193A59" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-dots)" />
            </svg>

            <svg
              ref={svgRef}
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="absolute inset-0 h-full w-full touch-none select-none"
              role="img"
              aria-label="Rede de pesquisadores do LAPS"
            >
              <defs>
                {nodes.map((m) => {
                  const [g1, g2] = TIER_GRADIENT[m.tier];
                  return (
                    <radialGradient
                      key={`grad-${m.slug}`}
                      id={`grad-${m.slug}`}
                      cx="35%"
                      cy="30%"
                      r="75%"
                    >
                      <stop offset="0%" stopColor={g2} />
                      <stop offset="100%" stopColor={g1} />
                    </radialGradient>
                  );
                })}
                {nodes.map((m) => (
                  <clipPath key={`clip-${m.slug}`} id={`clip-${m.slug}`}>
                    <circle r={(m as GraphNode).r ?? BASE_R[m.tier]} />
                  </clipPath>
                ))}
                <filter id="shadow-base" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.10" />
                </filter>
                <filter id="shadow-active" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="6" stdDeviation="10" floodOpacity="0.22" />
                </filter>
              </defs>

              {/* Pan capture layer */}
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
                onPointerMove={(e) => {
                  (e.currentTarget as SVGRectElement).style.cursor =
                    panRef.current ? "grabbing" : "grab";
                  onPanMove(e);
                }}
                onPointerUp={(e) => {
                  onPanEnd(e);
                }}
                onPointerCancel={(e) => {
                  panRef.current = null;
                  try {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                  } catch {
                    // noop
                  }
                  (e.currentTarget as SVGRectElement).style.cursor = "grab";
                }}
              />

              <g ref={transformGroupRef}>
                {/* Edges — drawn before nodes */}
                <g aria-hidden>
                  {filteredEdges.map((e, i) => {
                    const a = positions[e.from];
                    const b = positions[e.to];
                    if (!a || !b) return null;
                    const isIncident =
                      activeId !== null &&
                      (e.from === activeId || e.to === activeId);
                    const dim = activeId !== null && !isIncident;
                    const wNorm = e.weight / maxWeight;
                    const sw = 0.5 + wNorm * 2.5;
                    const opacity = dim ? 0.04 : isIncident ? 0.8 : 0.08 + wNorm * 0.18;
                    const otherSlug = e.from === activeId ? e.to : e.from;
                    const otherNode = isIncident
                      ? (filteredNodes.find((m) => m.slug === otherSlug) as GraphNode | undefined)
                      : undefined;
                    const stroke =
                      isIncident && otherNode
                        ? TIER_COLOR[otherNode.tier]
                        : "#0B4E8D";
                    return (
                      <path
                        key={`e-${i}`}
                        d={bezierD(a, b)}
                        stroke={stroke}
                        strokeOpacity={opacity}
                        strokeWidth={sw}
                        fill="none"
                        style={{ transition: "stroke-opacity 180ms, stroke-width 180ms" }}
                      />
                    );
                  })}
                </g>

                {/* Nodes */}
                <g>
                  {filteredNodes.map((member) => {
                    const node = member as GraphNode;
                    const anchor = positions[node.slug];
                    if (!anchor) return null;
                    const isHov = hoveredId === node.slug;
                    const isSel = selectedId === node.slug;
                    const inEgo = egoSet ? egoSet.has(node.slug) : true;
                    const dim = activeId !== null && !inEgo;
                    const tierIdx = TIER_ORDER.indexOf(node.tier);
                    return (
                      <DraggableNode
                        key={node.slug}
                        member={node}
                        anchor={anchor}
                        isHovered={isHov}
                        isSelected={isSel}
                        dim={dim}
                        label={labels.tier[node.tier]}
                        tierIndex={tierIdx}
                        onHoverStart={() => setHoveredId(node.slug)}
                        onHoverEnd={() =>
                          setHoveredId((cur) =>
                            cur === node.slug ? null : cur
                          )
                        }
                        onSelect={() => {
                          if (selectedId === node.slug) setSelectedId(null);
                          else focusNode(node.slug);
                        }}
                        onActivate={() =>
                          navigate({
                            to: "/team/$uuid",
                            params: { uuid: node.id },
                          })
                        }
                      />
                    );
                  })}
                </g>
              </g>
            </svg>

            {/* Hover/selected card */}
            <AnimatePresence>
              {activeNode && cardPos && (
                <HoverCard
                  key={activeNode.slug}
                  node={activeNode as GraphNode}
                  cursorPos={cardPos}
                  isSelected={!!selectedId}
                  labels={labels}
                  onClose={() => setSelectedId(null)}
                />
              )}
            </AnimatePresence>

            {/* Zoom controls */}
            <div className="pointer-events-auto absolute right-3 top-3 flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1 rounded-full border border-laps-light/40 bg-surface/90 px-1 py-0.5 text-[10px] font-semibold text-laps-navy/70 shadow-sm backdrop-blur">
                <button
                  type="button"
                  onClick={() => zoomBy(1 / 1.2)}
                  className="rounded-full px-2 py-1 hover:bg-laps-ghost"
                  aria-label="Diminuir zoom"
                >
                  −
                </button>
                <span className="tabular-nums text-laps-navy/55">{zoomLabel}%</span>
                <button
                  type="button"
                  onClick={() => zoomBy(1.2)}
                  className="rounded-full px-2 py-1 hover:bg-laps-ghost"
                  aria-label="Aumentar zoom"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={resetView}
                  className="rounded-full px-2 py-1 text-laps-navy/55 hover:bg-laps-ghost"
                  aria-label="Resetar visualização"
                >
                  ⟲
                </button>
              </div>
              <span className="rounded-full bg-surface/85 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-laps-navy/50 shadow-sm backdrop-blur">
                arraste · zoom · F para ajustar · ESC para sair
              </span>
            </div>

            {/* Rail toggle button */}
            <button
              type="button"
              onClick={() => setRailOpen((v) => !v)}
              className="pointer-events-auto absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-laps-light/40 bg-surface/90 px-3 py-1.5 text-[11px] font-semibold text-laps-navy/70 shadow-sm backdrop-blur transition hover:bg-laps-ghost"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {railOpen ? "Ocultar" : "Filtros"}
            </button>
          </div>

          {/* Footer: helper + legend */}
          <div className="mt-6 space-y-4">
            <p className="text-center text-xs text-laps-navy/55">{labels.helper}</p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px]">
              <span className="font-mono uppercase tracking-[0.2em] text-laps-navy/45">
                {labels.legendTitle}
              </span>
              {TIER_ORDER.map((tier) => {
                const active = activeRoles.has(tier);
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() =>
                      setActiveRoles((prev) => {
                        const next = new Set(prev);
                        next.has(tier) ? next.delete(tier) : next.add(tier);
                        return next;
                      })
                    }
                    className={`flex items-center gap-1.5 text-laps-navy/75 transition-opacity ${!active ? "opacity-35" : ""}`}
                  >
                    <span
                      className="inline-block rounded-full"
                      style={{
                        width: BASE_R[tier] * 0.65,
                        height: BASE_R[tier] * 0.65,
                        background: `linear-gradient(135deg, ${TIER_GRADIENT[tier][1]}, ${TIER_GRADIENT[tier][0]})`,
                        boxShadow: `0 1px 4px ${TIER_COLOR[tier]}33`,
                      }}
                    />
                    {labels.tier[tier]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LeftRail ─────────────────────────────────────────────────────────────────

function LeftRail({
  search,
  onSearch,
  activeRoles,
  onToggleRole,
  roleCounts,
  edgeThreshold,
  onEdgeThreshold,
  onReset,
  labels,
}: {
  search: string;
  onSearch: (s: string) => void;
  activeRoles: Set<Tier>;
  onToggleRole: (t: Tier) => void;
  roleCounts: Record<Tier, number>;
  edgeThreshold: number;
  onEdgeThreshold: (n: number) => void;
  onReset: () => void;
  labels: { tier: Record<Tier, string> };
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.22, ease: EASE_OUT }}
      className="w-52 shrink-0 self-start rounded-2xl border border-laps-light/20 bg-surface/95 p-4 shadow-lg backdrop-blur flex flex-col gap-4"
    >
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-laps-navy/40 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar pesquisador…"
          className="w-full rounded-full border border-laps-navy/10 bg-surface py-2 pl-9 pr-8 text-xs text-laps-navy placeholder:text-laps-navy/40 focus:border-laps-blue/40 focus:outline-none focus:ring-2 focus:ring-laps-blue/15"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-laps-navy/40 hover:text-laps-navy"
            aria-label="Limpar busca"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Role filters */}
      <div>
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-laps-navy/45">
          Nível
        </p>
        <div className="flex flex-col gap-0.5">
          {TIER_ORDER.map((tier) => {
            const active = activeRoles.has(tier);
            return (
              <button
                key={tier}
                type="button"
                onClick={() => onToggleRole(tier)}
                className={`flex items-center justify-between gap-2 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                  active
                    ? "bg-laps-ghost/60 text-laps-navy"
                    : "text-laps-navy/35 hover:text-laps-navy/55"
                }`}
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ background: TIER_COLOR[tier], opacity: active ? 1 : 0.4 }}
                  />
                  <span className="truncate">{labels.tier[tier]}</span>
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold shrink-0 ${
                    active ? "bg-surface text-laps-navy/55" : "text-laps-navy/25"
                  }`}
                >
                  {roleCounts[tier]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Edge threshold */}
      <div>
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-laps-navy/45">
          Conexões mín. ·{" "}
          <span className="text-laps-blue">{edgeThreshold}</span>
        </p>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={edgeThreshold}
          onChange={(e) => onEdgeThreshold(Number(e.target.value))}
          className="w-full accent-laps-blue"
          aria-label="Número mínimo de colaborações para mostrar aresta"
        />
        <div className="mt-1 flex justify-between text-[8px] text-laps-navy/30 font-mono">
          <span>1</span>
          <span>5</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5 border-t border-laps-light/20 pt-3">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 rounded-full border border-laps-navy/10 bg-surface px-3 py-1.5 text-[11px] font-semibold text-laps-navy/65 transition hover:bg-laps-ghost hover:text-laps-navy"
        >
          <RotateCcw className="h-3 w-3" />
          Resetar vista
        </button>
      </div>
    </motion.aside>
  );
}

// ─── HoverCard ────────────────────────────────────────────────────────────────

const CARD_W = 228;
const CARD_OFFSET = 18;

function HoverCard({
  node,
  cursorPos,
  isSelected,
  labels,
  onClose,
}: {
  node: GraphNode;
  cursorPos: { x: number; y: number };
  isSelected: boolean;
  labels: { tier: Record<Tier, string> };
  onClose: () => void;
}) {
  const winW = typeof window !== "undefined" ? window.innerWidth : 1400;
  const left =
    cursorPos.x + CARD_OFFSET + CARD_W > winW - 8
      ? cursorPos.x - CARD_OFFSET - CARD_W
      : cursorPos.x + CARD_OFFSET;
  const top = Math.max(8, cursorPos.y - 64);
  const color = TIER_COLOR[node.tier];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 4 }}
      transition={{ duration: 0.12, ease: EASE_OUT }}
      style={{
        position: "fixed",
        left,
        top,
        width: CARD_W,
        zIndex: 60,
        pointerEvents: isSelected ? "auto" : "none",
      }}
      className="rounded-2xl border border-laps-light/30 bg-surface/97 p-4 shadow-xl backdrop-blur"
    >
      {isSelected && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-laps-navy/35 hover:text-laps-navy transition-colors"
          aria-label="Fechar cartão"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-offset-1"
          style={{ "--tw-ring-color": color } as React.CSSProperties}
        >
          {node.photo ? (
            <img
              src={node.photo}
              alt={node.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-sm font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${TIER_GRADIENT[node.tier][1]}, ${TIER_GRADIENT[node.tier][0]})`,
              }}
            >
              {initials(node.fullName)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold leading-tight text-laps-navy">
            {node.fullName}
          </p>
          <span
            className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: `${color}18`, color }}
          >
            {labels.tier[node.tier]}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 border-t border-laps-light/20 pt-2.5 text-[11px] text-laps-navy/60">
        <span>
          <strong className="text-laps-navy">{node.degree}</strong>{" "}
          projeto{node.degree !== 1 ? "s" : ""} compartilhado{node.degree !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Top collaborators */}
      {node.top3.length > 0 && (
        <div className="mt-2.5">
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-laps-navy/40">
            Principais colaboradores
          </p>
          <ul className="space-y-0.5">
            {node.top3.map((name) => (
              <li
                key={name}
                className="truncate text-[11px] text-laps-navy/65 before:mr-1.5 before:content-['·']"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

// ─── DraggableNode ────────────────────────────────────────────────────────────

function DraggableNode({
  member,
  anchor,
  isHovered,
  isSelected,
  dim,
  label,
  tierIndex,
  onHoverStart,
  onHoverEnd,
  onSelect,
  onActivate,
}: {
  member: GraphNode;
  anchor: Pos;
  isHovered: boolean;
  isSelected: boolean;
  dim: boolean;
  label: string;
  tierIndex: number;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onSelect: () => void;
  onActivate: () => void;
}) {
  const r = member.r;
  const controls = useAnimationControls();
  const downAt = useRef<{ x: number; y: number } | null>(null);
  const wasDragged = useRef(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Entrance animation on first mount
  const entered = useRef(false);
  useEffect(() => {
    if (!mounted || entered.current) return;
    entered.current = true;
    if (prefersReduced) return;
    controls.set({ scale: 0.9 });
    void controls.start({
      scale: 1,
      transition: {
        delay: tierIndex * 0.055,
        duration: 0.3,
        ease: EASE_OUT,
      },
    });
  }, [mounted, controls, tierIndex, prefersReduced]);

  // Reset drag offset when anchor changes (admin edits)
  useEffect(() => {
    if (mounted) controls.set({ x: 0, y: 0 });
  }, [anchor.x, anchor.y, controls, mounted]);

  const isActive = isHovered || isSelected;
  const color = TIER_COLOR[member.tier];

  const visuals = (
    <>
      {/* Selection dashed ring */}
      {isSelected && (
        <circle
          r={r + 9}
          fill="none"
          stroke={color}
          strokeOpacity={0.55}
          strokeWidth={1.5}
          strokeDasharray="5 3"
        />
      )}

      {/* Hover halo */}
      {isHovered && !isSelected && (
        <circle
          r={r + 7}
          fill="none"
          stroke={color}
          strokeOpacity={0.35}
          strokeWidth={1.5}
        />
      )}

      {/* Role color ring */}
      <circle
        r={r + 2}
        fill="none"
        stroke={color}
        strokeOpacity={isActive ? 0.75 : 0.25}
        strokeWidth={2}
        style={{ transition: "stroke-opacity 180ms" }}
      />

      {/* Main fill */}
      <circle
        r={r}
        fill={`url(#grad-${member.slug})`}
        filter={isActive ? "url(#shadow-active)" : "url(#shadow-base)"}
      />

      {/* Photo */}
      {member.photo && (
        <image
          href={member.photo}
          x={-r}
          y={-r}
          width={r * 2}
          height={r * 2}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#clip-${member.slug})`}
          style={{
            filter: isActive ? "none" : "grayscale(55%) brightness(0.97)",
            transition: "filter 220ms ease",
          }}
        />
      )}

      {/* Initials */}
      {!member.photo && (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={Math.max(10, r * 0.62)}
          fontWeight={600}
          fill="white"
          letterSpacing="-0.5"
          pointerEvents="none"
          style={{ fontFamily: "Archivo, sans-serif" }}
        >
          {initials(member.fullName)}
        </text>
      )}

      {/* Status dot */}
      {member.status && member.status !== "ACTIVE" && (
        <circle
          cx={r * 0.78}
          cy={-r * 0.78}
          r={3.5}
          fill={member.status === "COMPLETED" ? "#94A3B8" : "#CBD5E1"}
          stroke="white"
          strokeWidth={1.2}
        />
      )}

      {/* Label */}
      {(member.tier === "head" || isActive) && (
        <text
          y={r + 15}
          textAnchor="middle"
          fontSize={member.tier === "head" ? 13 : 11}
          fontWeight={member.tier === "head" || isActive ? 600 : 500}
          fill="#193A59"
          opacity={isActive ? 1 : 0.82}
          pointerEvents="none"
          style={{
            fontFamily: "Archivo, sans-serif",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {member.fullName.length > 22 && !isActive
            ? member.fullName.slice(0, 21) + "…"
            : member.fullName}
        </text>
      )}
    </>
  );

  // SSR / pre-hydration: static, non-interactive, no motion APIs.
  if (!mounted) {
    return (
      <g
        transform={`translate(${anchor.x} ${anchor.y})`}
        style={{ opacity: dim ? 0.12 : 1, transition: "opacity 200ms" }}
        role="button"
        tabIndex={0}
        aria-label={`${label}: ${member.fullName}, ${member.degree} colaborações`}
        onClick={onSelect}
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
        dragElastic={0.35}
        animate={controls}
        initial={{ x: 0, y: 0 }}
        onPointerDown={(e) => {
          downAt.current = { x: e.clientX, y: e.clientY };
          wasDragged.current = false;
        }}
        onDrag={() => {
          wasDragged.current = true;
        }}
        onDragEnd={() => {
          void controls.start({
            x: 0,
            y: 0,
            transition: { type: "spring", stiffness: 90, damping: 16, mass: 0.8 },
          });
        }}
        onPointerUp={(e) => {
          const start = downAt.current;
          downAt.current = null;
          if (wasDragged.current) {
            wasDragged.current = false;
            return;
          }
          if (start) {
            const dx = e.clientX - start.x;
            const dy = e.clientY - start.y;
            if (dx * dx + dy * dy < 36) onSelect();
          }
        }}
        onDoubleClick={onActivate}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSelect();
          }
          if (e.key === " ") {
            e.preventDefault();
            onActivate();
          }
        }}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        role="button"
        tabIndex={0}
        aria-label={`${label}: ${member.fullName}, ${member.degree} colaborações`}
        style={{
          cursor: "pointer",
          opacity: dim ? 0.12 : 1,
          transition: "opacity 200ms",
        }}
        whileHover={{ scale: 1.1 }}
        whileDrag={{ scale: 1.14 }}
      >
        {visuals}
      </motion.g>
    </g>
  );
}
