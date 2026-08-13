import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  Compass,
  Crown,
  Edit2,
  Eye,
  EyeOff,
  Globe,
  GraduationCap,
  ImageIcon,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Microscope,
  Palette,
  Plus,
  Save,
  Shield,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/hooks/use-lang";
import { type Lang } from "@/lib/i18n";
import { api, ApiError, resolveMediaUrl, type ApiMember, type ApiProject, type ApiResearchArea, type MyProfile } from "@/lib/api";
import {
  LANGUAGE_CATALOG, LANGUAGE_BY_CODE, LEVELS_BY_SYSTEM, NATIVE_LEVEL,
  parseLanguages, serializeLanguages, levelBadgeClass, levelShortLabel,
  type LanguageEntry,
} from "@/lib/languages-data";
import { Input } from "@/components/ui/input";
import { initials } from "@/lib/team-data";
import type { Tier } from "@/lib/team-data";

// ───── Language flags (pt / en / fr) ─────

const PORTAL_FLAGS: Record<Lang, React.ReactNode> = {
  pt: (
    <svg viewBox="0 0 24 16" className="h-3.5 w-5 shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.15)]">
      <rect width="24" height="16" fill="#009C3B" />
      <polygon points="12,2 22,8 12,14 2,8" fill="#FFDF00" />
      <circle cx="12" cy="8" r="3" fill="#002776" />
    </svg>
  ),
  en: (
    <svg viewBox="0 0 60 40" className="h-3.5 w-5 shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.15)]">
      <rect width="60" height="40" fill="#FFFFFF" />
      <rect y="0" width="60" height="3.08" fill="#B22234" />
      <rect y="6.15" width="60" height="3.08" fill="#B22234" />
      <rect y="12.31" width="60" height="3.08" fill="#B22234" />
      <rect y="18.46" width="60" height="3.08" fill="#B22234" />
      <rect y="24.62" width="60" height="3.08" fill="#B22234" />
      <rect y="30.77" width="60" height="3.08" fill="#B22234" />
      <rect y="36.92" width="60" height="3.08" fill="#B22234" />
      <rect width="24" height="21.54" fill="#3C3B6E" />
    </svg>
  ),
  fr: (
    <svg viewBox="0 0 24 16" className="h-3.5 w-5 shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.15)]">
      <rect width="8" height="16" fill="#002776" />
      <rect x="8" width="8" height="16" fill="#FFFFFF" />
      <rect x="16" width="8" height="16" fill="#ED2939" />
    </svg>
  ),
};

function PortalLangSwitcher() {
  const { lang, setLang } = useLang();
  const codes: Lang[] = ["pt", "en", "fr"];
  return (
    <div className="relative inline-flex w-fit items-center p-0.5 rounded-full bg-laps-navy/5 border border-laps-navy/5">
      {codes.map((c) => {
        const active = lang === c;
        return (
          <button
            key={c}
            type="button"
            onClick={() => setLang(c)}
            className="relative flex items-center justify-center h-7 w-9 rounded-full transition-all z-10"
            aria-label={`Switch to ${c.toUpperCase()}`}
          >
            {active && (
              <motion.div
                layoutId="portal-active-lang-bg"
                className="absolute inset-0 rounded-full bg-white shadow-sm"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span
              className="relative transition-all duration-500"
              style={{
                filter: active ? "saturate(1) brightness(1)" : "saturate(0) opacity(0.3)",
                transform: active ? "scale(1.05)" : "scale(0.85)",
              }}
            >
              {PORTAL_FLAGS[c]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export const Route = createFileRoute("/portal")({
  component: PortalPage,
  head: () => ({
    meta: [
      { title: "Meu Perfil — LAPS" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

// ───── Tier config (mirrors team.$uuid) ─────

const tierMap: Record<string, Tier> = {
  HEAD: "head",
  COORDINATOR: "coordinator",
  MANAGER: "manager",
  DOCTORATE: "doctorate",
  MASTER: "master",
  UNDERGRAD: "undergrad",
};

const tierConfig: Record<Tier, { gradient: string; ring: string; chip: string; band: string; label: string; Icon: typeof Crown }> = {
  head: {
    gradient: "from-laps-navy to-laps-blue",
    band: "from-laps-navy via-laps-blue to-laps-light",
    ring: "ring-laps-light/40",
    chip: "bg-gradient-to-r from-laps-navy to-laps-blue text-white",
    label: "HEAD",
    Icon: Crown,
  },
  coordinator: {
    gradient: "from-violet-700 to-violet-400",
    band: "from-violet-700 via-violet-400 to-violet-200",
    ring: "ring-violet-200",
    chip: "bg-violet-50 text-violet-700",
    label: "COORDINATOR",
    Icon: Shield,
  },
  manager: {
    gradient: "from-purple-600 to-purple-300",
    band: "from-purple-600 via-purple-300 to-purple-100",
    ring: "ring-purple-200",
    chip: "bg-purple-50 text-purple-700",
    label: "MANAGER",
    Icon: Briefcase,
  },
  doctorate: {
    gradient: "from-laps-blue to-laps-light",
    band: "from-laps-blue via-laps-light to-blue-200",
    ring: "ring-laps-blue/30",
    chip: "bg-laps-ghost text-laps-blue",
    label: "DOCTORATE",
    Icon: Microscope,
  },
  master: {
    gradient: "from-emerald-500 to-emerald-300",
    band: "from-emerald-500 via-emerald-300 to-emerald-100",
    ring: "ring-emerald-200",
    chip: "bg-emerald-50 text-emerald-700",
    label: "MASTER",
    Icon: GraduationCap,
  },
  undergrad: {
    gradient: "from-amber-400 to-amber-200",
    band: "from-amber-400 via-amber-200 to-amber-50",
    ring: "ring-amber-200",
    chip: "bg-amber-50 text-amber-700",
    label: "UNDERGRAD",
    Icon: Users,
  },
};

// ───── Preset banner options ─────

const BANNER_PRESETS = [
  { label: "Navy Blue", value: "#0B4E8D" },
  { label: "Sky", value: "#0EA5E9" },
  { label: "Violet", value: "#7C3AED" },
  { label: "Emerald", value: "#059669" },
  { label: "Amber", value: "#D97706" },
  { label: "Rose", value: "#E11D48" },
  { label: "Slate", value: "#475569" },
  { label: "Teal", value: "#0D9488" },
];

// ───── Main page ─────

function PortalPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const me = auth.member;
  const { t } = useLang();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [auth.isLoading, auth.isAuthenticated, navigate]);

  const areasQuery = useQuery({
    queryKey: ["areas"],
    queryFn: () => api.areas(),
    staleTime: 60_000,
  });

  const allMembersQuery = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const page = await api.members();
      return page.content;
    },
    staleTime: 30_000,
  });

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects(),
    staleTime: 30_000,
  });

  const myProjectLinksQuery = useQuery({
    queryKey: ["my-projects"],
    queryFn: () => api.myProjects(),
    staleTime: 10_000,
  });

  if (auth.isLoading || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-laps-ghost/20">
        <p className="text-sm text-laps-navy/55">Carregando…</p>
      </div>
    );
  }

  const tierKey = tierMap[me.currentRole] ?? "undergrad";
  const cfg = tierConfig[tierKey];
  const allMembers = allMembersQuery.data ?? [];
  const allProjects = projectsQuery.data ?? [];
  const myProjectLinks = myProjectLinksQuery.data ?? [];

  // My linked projects
  const linkedProjectIds = new Set(myProjectLinks.map((l) => l.projectId));
  const myProjects = allProjects.filter((p) => linkedProjectIds.has(p.id));

  // All projects I appear in as leader (created by me)
  const myCreatedProjects = allProjects.filter((p) =>
    p.leaders?.some((l) => l.memberId === me.id || l.member?.id === me.id)
  );

  // Combine and deduplicate
  const portfolioProjects = [
    ...myCreatedProjects,
    ...myProjects.filter((p) => !myCreatedProjects.find((cp) => cp.id === p.id)),
  ];

  // Parse areas from DB or seed
  const memberAreas = me.areas
    ? me.areas.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const memberInterests = me.interests
    ? me.interests.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Role start date
  const roleStart = me.currentRoleStartedAt
    ? new Date(me.currentRoleStartedAt).toLocaleDateString("pt-BR", { year: "numeric", month: "short" })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-laps-ghost/30 via-white to-white">
      {/* Top bar */}
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            to="/team"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-laps-navy/70 transition hover:text-laps-blue"
          >
            <ArrowLeft className="h-4 w-4" /> {t.portal.network}
          </Link>
          <div className="flex items-center gap-2">
            <PortalLangSwitcher />
            <Link
              to="/team/$uuid"
              params={{ uuid: me.id }}
              className="inline-flex items-center gap-1.5 rounded-full border border-laps-blue/25 bg-white px-3 py-1.5 text-xs font-semibold text-laps-blue transition hover:bg-laps-ghost"
            >
              {t.portal.viewProfile}
            </Link>
            <button
              type="button"
              onClick={() => api.logout().then(() => navigate({ to: "/login" }))}
              className="inline-flex items-center gap-1.5 rounded-full border border-laps-navy/15 bg-white px-4 py-2 text-xs font-semibold text-laps-navy/75 transition hover:border-laps-blue/30 hover:text-laps-blue"
            >
              {t.portal.logout}
            </button>
          </div>
        </div>

        {/* HERO CARD */}
        <HeroCard
          me={me}
          cfg={cfg}
          tierKey={tierKey}
          roleStart={roleStart}
          memberAreas={memberAreas}
          portfolioProjects={portfolioProjects}
        />

        {/* TWO-COLUMN BODY */}
        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_2fr]">
          {/* SIDEBAR */}
          <aside className="flex flex-col gap-6">
            <FullNameEditor me={me} />
            <ContactEditor me={me} />
            {auth.mustChangePassword && <FirstLoginBanner emailVerified={auth.emailVerified} />}
            {!auth.emailVerified && <EmailVerificationBanner me={me} />}

            <AboutEditor me={me} />
            <ResearchAreasEditor
              me={me}
              dbAreas={areasQuery.data ?? []}
              currentAreas={memberAreas}
            />
            <InterestsEditor me={me} currentInterests={memberInterests} />
            <LanguagesEditor me={me} />
            <ExchangeCountryEditor me={me} />
          </aside>

          {/* MAIN */}
          <main className="flex flex-col gap-6">
            <RoadmapEditor me={me} />
            <ProjectsSection
              me={me}
              allMembers={allMembers}
              portfolioProjects={portfolioProjects}
              myProjectLinks={myProjectLinks}
              allProjects={allProjects}
            />
            <PasswordChangeCard emailVerified={auth.emailVerified} />
          </main>
        </div>

        <div className="pb-16" />
      </div>
    </div>
  );
}

// ───── Hero card ─────

function HeroCard({
  me,
  cfg,
  tierKey,
  roleStart,
  memberAreas,
  portfolioProjects,
}: {
  me: MyProfile;
  cfg: (typeof tierConfig)[Tier];
  tierKey: Tier;
  roleStart: string | null;
  memberAreas: string[];
  portfolioProjects: ApiProject[];
}) {
  const { Icon } = cfg;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-laps-blue/15 bg-white shadow-[0_20px_60px_-30px_rgba(11,78,141,0.35)]">
      {/* Banner */}
      <BannerEditor me={me} cfg={cfg} />

      <div className="px-6 pb-10 md:px-10">
        {/* Avatar */}
        <AvatarEditor me={me} cfg={cfg} />

        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-8">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-bold leading-tight text-laps-navy md:text-4xl">
              {me.fullName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider ${cfg.chip}`}
              >
                <Icon className="h-3.5 w-3.5" /> {cfg.label}
              </span>
              {roleStart && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-laps-ghost/70 px-3 py-1.5 text-xs font-medium text-laps-navy/75">
                  <Calendar className="h-3.5 w-3.5" /> desde {roleStart}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:shrink-0">
            {me.linkedinUrl && (
              <a
                href={me.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-laps-navy px-3 py-2 text-xs font-semibold text-white transition hover:bg-laps-blue"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <QuickStats memberAreas={memberAreas} portfolioProjects={portfolioProjects} />
      </div>
    </div>
  );
}

// ───── Quick stats (i18n) ─────

function QuickStats({ memberAreas, portfolioProjects }: { memberAreas: string[]; portfolioProjects: ApiProject[] }) {
  const { t } = useLang();
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-3">
      <StatCard icon={Compass} label={t.portal.statAreas} value={memberAreas.length} />
      <StatCard icon={Sparkles} label={t.portal.statProjects} value={portfolioProjects.length} />
      <StatCard icon={BookOpen} label={t.portal.statPubs} value={0} />
    </div>
  );
}

// ───── Full name editor ─────

function FullNameEditor({ me }: { me: MyProfile }) {
  const qc = useQueryClient();
  const { t } = useLang();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(me.fullName);

  const mutation = useMutation({
    mutationFn: (name: string) => api.meUpdate({ fullName: name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setEditing(false);
      toast.success(t.portal.saved);
    },
    onError: () => toast.error(t.portal.errorSave),
  });

  return (
    <PortfolioCard title={t.portal.fullName} icon={UserCheck}>
      {editing ? (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-9 flex-1 text-sm"
            autoFocus
          />
          <button
            type="button"
            onClick={() => mutation.mutate(value)}
            disabled={mutation.isPending || !value.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-laps-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-laps-navy disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" />
            {mutation.isPending ? "…" : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => { setValue(me.fullName); setEditing(false); }}
            className="rounded-md border border-laps-navy/15 px-3 py-1.5 text-xs font-semibold text-laps-navy/70 hover:bg-laps-ghost"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-laps-navy">{me.fullName}</span>
          <button
            type="button"
            onClick={() => { setValue(me.fullName); setEditing(true); }}
            className="inline-flex items-center gap-1 rounded-md border border-laps-navy/15 px-2 py-1 text-[10px] font-semibold text-laps-navy/60 hover:border-laps-blue/30 hover:text-laps-blue"
          >
            <Edit2 className="h-3 w-3" /> Editar
          </button>
        </div>
      )}
    </PortfolioCard>
  );
}

// ───── Banner editor ─────

// Canvas dimensions for the banner output image
const BANNER_CANVAS_W = 1200;
const BANNER_CANVAS_H = 300;

function BannerEditor({ me, cfg }: { me: MyProfile; cfg: (typeof tierConfig)[Tier] }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [customColor, setCustomColor] = useState(me.bannerColor ?? "");
  const [editorFile, setEditorFile] = useState<File | null>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const saveMutation = useMutation({
    mutationFn: (patch: { bannerColor?: string; bannerImageUrl?: string }) =>
      api.meUpdate(patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setOpen(false);
    },
    onError: () => toast.error("Falha ao salvar capa. Tente novamente."),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.meUploadBanner(file),
    onSuccess: (res) => { saveMutation.mutate({ bannerImageUrl: res.url }); },
    onError: () => toast.error("Falha ao enviar imagem. Tente novamente."),
  });

  function handleEditorConfirm(blob: Blob) {
    const file = new File([blob], "banner.jpg", { type: "image/jpeg" });
    setEditorFile(null);
    uploadMutation.mutate(file);
  }

  const bannerStyle = me.bannerImageUrl
    ? { backgroundImage: `url(${resolveMediaUrl(me.bannerImageUrl)})`, backgroundSize: "cover", backgroundPosition: "center" }
    : me.bannerColor
      ? { background: `linear-gradient(to right, ${me.bannerColor}, ${me.bannerColor}99)` }
      : undefined;

  return (
    <>
      {/* Image transform editor modal */}
      {editorFile && (
        <BannerImageEditor
          file={editorFile}
          onConfirm={handleEditorConfirm}
          onCancel={() => setEditorFile(null)}
        />
      )}

      <div
        className={`relative h-40 md:h-48 ${!me.bannerImageUrl && !me.bannerColor ? `bg-gradient-to-r ${cfg.band}` : ""}`}
        style={bannerStyle}
      >
        <svg
          className="absolute bottom-0 left-0 h-10 w-full text-white/45"
          viewBox="0 0 200 20"
          preserveAspectRatio="none"
        >
          <path
            d="M0,10 Q25,2 50,10 T100,10 T150,10 T200,10"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>

        {/* Uploading overlay */}
        {(uploadMutation.isPending || saveMutation.isPending) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <p className="text-xs font-semibold text-white">Salvando…</p>
          </div>
        )}

        {/* Edit button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-black/50"
        >
          <Palette className="h-3.5 w-3.5" /> Editar capa
        </button>

        {/* Banner editor panel */}
        {open && (
          <div className="absolute right-4 top-14 z-10 w-72 rounded-2xl border border-laps-navy/15 bg-white p-4 shadow-xl">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              Cor de fundo
            </p>
            <div className="mb-3 grid grid-cols-4 gap-2">
              {BANNER_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => saveMutation.mutate({ bannerColor: p.value, bannerImageUrl: "" })}
                  title={p.label}
                  className="h-8 w-full rounded-lg border-2 border-transparent transition hover:border-laps-blue/50"
                  style={{ background: p.value }}
                />
              ))}
            </div>
            <div className="mb-3 flex gap-2">
              <input
                type="color"
                value={customColor || "#0B4E8D"}
                onChange={(e) => setCustomColor(e.target.value)}
                className="h-9 w-10 cursor-pointer rounded border border-laps-navy/20 p-0.5"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="#0B4E8D"
                className="flex-1 rounded-md border border-laps-navy/15 px-2 text-xs text-laps-navy"
              />
              <button
                type="button"
                onClick={() => saveMutation.mutate({ bannerColor: customColor, bannerImageUrl: "" })}
                disabled={!customColor || saveMutation.isPending}
                className="rounded-md bg-laps-blue px-3 text-xs font-semibold text-white hover:bg-laps-navy disabled:opacity-60"
              >
                OK
              </button>
            </div>
            <div className="border-t border-laps-navy/10 pt-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
                Imagem de capa
              </p>
              <input
                ref={bannerRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { setEditorFile(file); setOpen(false); }
                  e.target.value = "";
                }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => bannerRef.current?.click()}
                  disabled={uploadMutation.isPending || saveMutation.isPending}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-laps-blue/25 bg-white px-3 py-1.5 text-xs font-semibold text-laps-blue transition hover:bg-laps-ghost disabled:opacity-60"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Selecionar imagem…
                </button>
                {me.bannerImageUrl && (
                  <button
                    type="button"
                    onClick={() => saveMutation.mutate({ bannerImageUrl: "" })}
                    className="rounded-md border border-red-200 bg-white px-2 text-xs text-red-600 hover:bg-red-50"
                    title="Remover imagem"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-[10px] text-laps-navy/40">
                Após selecionar, você poderá ajustar posição, escala e rotação.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full rounded-md bg-laps-ghost/60 py-1.5 text-xs font-semibold text-laps-navy/70 hover:bg-laps-ghost"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ───── Banner image transform editor ─────

function BannerImageEditor({
  file,
  onConfirm,
  onCancel,
}: {
  file: File;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  // dragRef tracks the drag start state without triggering re-renders on mousemove
  const dragRef = useRef<{
    startClientX: number;
    startClientY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  // Load the image and set an initial scale that fills the canvas
  useEffect(() => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const fillScale = Math.max(
        BANNER_CANVAS_W / image.width,
        BANNER_CANVAS_H / image.height
      );
      setScale(fillScale);
      setImg(image);
    };
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Redraw whenever transform changes
  useEffect(() => {
    if (!img || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.clearRect(0, 0, BANNER_CANVAS_W, BANNER_CANVAS_H);
    ctx.save();
    ctx.translate(BANNER_CANVAS_W / 2 + offset.x, BANNER_CANVAS_H / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  }, [img, scale, rotation, offset]);

  // Ratio between canvas pixels and displayed CSS pixels
  function pixelRatio() {
    if (!canvasRef.current) return 1;
    return BANNER_CANVAS_W / canvasRef.current.getBoundingClientRect().width;
  }

  function startDrag(clientX: number, clientY: number) {
    dragRef.current = {
      startClientX: clientX,
      startClientY: clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
  }

  function moveDrag(clientX: number, clientY: number) {
    if (!dragRef.current) return;
    const r = pixelRatio();
    setOffset({
      x: dragRef.current.startOffsetX + (clientX - dragRef.current.startClientX) * r,
      y: dragRef.current.startOffsetY + (clientY - dragRef.current.startClientY) * r,
    });
  }

  function endDrag() {
    dragRef.current = null;
  }

  function reset() {
    if (!img) return;
    setScale(Math.max(BANNER_CANVAS_W / img.width, BANNER_CANVAS_H / img.height));
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  }

  function confirm() {
    canvasRef.current?.toBlob(
      (blob) => { if (blob) onConfirm(blob); },
      "image/jpeg",
      0.92
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-laps-navy">Ajustar imagem da capa</h3>
          <button type="button" onClick={onCancel} className="rounded-full p-1 text-laps-navy/50 hover:bg-laps-ghost hover:text-laps-navy">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Canvas preview — same 4:1 aspect as the actual banner */}
        <div className="mb-3 overflow-hidden rounded-xl border border-laps-navy/10 bg-laps-ghost/30">
          {!img ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-xs text-laps-navy/40">Carregando imagem…</p>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={BANNER_CANVAS_W}
              height={BANNER_CANVAS_H}
              className="w-full cursor-grab select-none active:cursor-grabbing"
              onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
              onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onTouchStart={(e) => { const t = e.touches[0]; startDrag(t.clientX, t.clientY); }}
              onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; moveDrag(t.clientX, t.clientY); }}
              onTouchEnd={endDrag}
            />
          )}
        </div>

        <p className="mb-4 text-center text-[10px] text-laps-navy/40">
          Arraste para reposicionar · Use os controles abaixo para escala e rotação
        </p>

        {/* Transform controls */}
        <div className="mb-5 space-y-4">
          <SliderControl
            label="Escala"
            value={scale}
            min={0.05}
            max={10}
            step={0.01}
            displayValue={`${Math.round(scale * 100)}%`}
            onChange={setScale}
          />
          <SliderControl
            label="Rotação"
            value={rotation}
            min={-180}
            max={180}
            step={1}
            displayValue={`${rotation}°`}
            onChange={setRotation}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={confirm}
            disabled={!img}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-laps-blue px-4 py-2 text-xs font-semibold text-white hover:bg-laps-navy disabled:opacity-60"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-laps-navy/15 px-3 py-2 text-xs font-semibold text-laps-navy/70 hover:bg-laps-ghost"
          >
            Resetar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-laps-navy/15 px-3 py-2 text-xs font-semibold text-laps-navy/70 hover:bg-laps-ghost"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
          {label}
        </label>
        <span className="text-[10px] font-mono font-semibold text-laps-navy/70">
          {displayValue ?? value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-laps-blue"
      />
    </div>
  );
}

// ───── Avatar editor ─────

function AvatarEditor({ me, cfg }: { me: MyProfile; cfg: (typeof tierConfig)[Tier] }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const { Icon } = cfg;

  const saveMutation = useMutation({
    mutationFn: (url: string) => api.meUpdate({ photoUrl: url }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["me"] }); },
    onError: () => toast.error("Falha ao salvar foto. Tente novamente."),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.meUploadPhoto(file),
    onSuccess: (res) => { saveMutation.mutate(res.url); },
    onError: () => toast.error("Falha ao enviar foto. Verifique o formato e tente novamente."),
  });

  const busy = uploadMutation.isPending || saveMutation.isPending;

  return (
    <div className="-mt-20 flex flex-col items-start gap-1">
      <div className={`group relative h-36 w-36 shrink-0 rounded-full bg-white p-1.5 shadow-xl ring-4 ${cfg.ring}`}>
        {me.photoUrl ? (
          <img src={resolveMediaUrl(me.photoUrl)} alt={me.fullName} className="h-full w-full rounded-full object-cover" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${cfg.gradient} text-4xl font-bold text-white`}>
            {initials(me.fullName)}
          </div>
        )}
        <div className="absolute -right-1 -top-1 flex h-10 w-10 items-center justify-center rounded-full bg-white text-laps-blue shadow ring-2 ring-white">
          <Icon className="h-5 w-5" />
        </div>
        {/* Upload / saving overlay */}
        {busy ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50">
            <p className="text-[10px] font-semibold text-white">
              {uploadMutation.isPending ? "Enviando…" : "Salvando…"}
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100"
          >
            <Upload className="h-6 w-6 text-white" />
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadMutation.mutate(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

// ───── Contact / links editor ─────

function ContactEditor({ me }: { me: MyProfile }) {
  const qc = useQueryClient();
  const { t } = useLang();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    email: me.email ?? "",
    contactEmail: me.contactEmail ?? "",
    linkedinUrl: me.linkedinUrl ?? "",
    lattesUrl: me.lattesUrl ?? "",
    githubUrl: me.githubUrl ?? "",
  });

  const mutation = useMutation({
    mutationFn: () => api.meUpdate(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setEditing(false);
      toast.success(t.portal.saved);
    },
    onError: () => toast.error(t.portal.errorSave),
  });

  function patch<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Highlight the card when email is missing — draws attention to the required step
  const needsEmail = !me.email;

  return (
    <PortfolioCard
      title="CONTATO & LINKS"
      icon={Mail}
      action={
        !editing ? (
          <button
            type="button"
            onClick={() => {
              setForm({
                email: me.email ?? "",
                contactEmail: me.contactEmail ?? "",
                linkedinUrl: me.linkedinUrl ?? "",
                lattesUrl: me.lattesUrl ?? "",
                githubUrl: me.githubUrl ?? "",
              });
              setEditing(true);
            }}
            className="inline-flex items-center gap-1 rounded-md border border-laps-navy/15 px-2 py-1 text-[10px] font-semibold text-laps-navy/60 hover:border-laps-blue/30 hover:text-laps-blue"
          >
            <Edit2 className="h-3 w-3" /> Editar
          </button>
        ) : null
      }
    >
      {needsEmail && !editing && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          <p className="text-[11px] font-medium text-amber-800">
            Cadastre seu email para habilitar a verificação.
          </p>
        </div>
      )}

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              Email (login e recuperação) *
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => patch("email", e.target.value)}
              placeholder="seu@email.com"
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              Email de contato (público)
            </label>
            <Input
              type="email"
              value={form.contactEmail}
              onChange={(e) => patch("contactEmail", e.target.value)}
              placeholder="contato@email.com"
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              LinkedIn
            </label>
            <Input
              value={form.linkedinUrl}
              onChange={(e) => patch("linkedinUrl", e.target.value)}
              placeholder="https://linkedin.com/in/…"
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              Lattes
            </label>
            <Input
              value={form.lattesUrl}
              onChange={(e) => patch("lattesUrl", e.target.value)}
              placeholder="http://lattes.cnpq.br/…"
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              GitHub
            </label>
            <Input
              value={form.githubUrl}
              onChange={(e) => patch("githubUrl", e.target.value)}
              placeholder="https://github.com/…"
              className="h-9 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-laps-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-laps-navy disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              {mutation.isPending ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-laps-navy/15 px-3 py-1.5 text-xs font-semibold text-laps-navy/70 hover:bg-laps-ghost"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5 text-xs text-laps-navy/70">
          <InfoRow label="Email" value={me.email} placeholder="Não cadastrado" highlight={needsEmail} />
          <InfoRow label="Contato" value={me.contactEmail} />
          <InfoRow label="LinkedIn" value={me.linkedinUrl} link />
          <InfoRow label="Lattes" value={me.lattesUrl} link />
          <InfoRow label="GitHub" value={me.githubUrl} link />
        </div>
      )}

    </PortfolioCard>
  );
}

function InfoRow({
  label,
  value,
  placeholder,
  link,
  highlight,
}: {
  label: string;
  value: string | null | undefined;
  placeholder?: string;
  link?: boolean;
  highlight?: boolean;
}) {
  if (!value && !placeholder) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wider text-laps-navy/40">
        {label}
      </span>
      {value ? (
        link ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-laps-blue hover:underline"
          >
            {value}
          </a>
        ) : (
          <span className={highlight ? "font-semibold text-laps-navy" : ""}>{value}</span>
        )
      ) : (
        <span className={`italic ${highlight ? "text-amber-600" : "text-laps-navy/35"}`}>
          {placeholder}
        </span>
      )}
    </div>
  );
}

// ───── About / Bio editor (trilingual) ─────

const BIO_LANGS: { key: "bioPt" | "bioEn" | "bioFr"; tab: "pt" | "en" | "fr"; placeholder: string }[] = [
  { key: "bioPt", tab: "pt", placeholder: "Escreva sua bio em português…" },
  { key: "bioEn", tab: "en", placeholder: "Write your bio in English…" },
  { key: "bioFr", tab: "fr", placeholder: "Écrivez votre bio en français…" },
];

function AboutEditor({ me }: { me: MyProfile }) {
  const qc = useQueryClient();
  const { t } = useLang();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"pt" | "en" | "fr">("pt");
  const [values, setValues] = useState({ bioPt: me.bioPt ?? "", bioEn: me.bioEn ?? "", bioFr: me.bioFr ?? "" });

  const mutation = useMutation({
    mutationFn: (patch: { bioPt?: string; bioEn?: string; bioFr?: string }) => api.meUpdate(patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setEditing(false);
      toast.success(t.portal.saved);
    },
    onError: () => toast.error(t.portal.errorSave),
  });

  const currentDef = BIO_LANGS.find((b) => b.tab === activeTab)!;
  const currentValue = values[currentDef.key];
  const currentStored = me[currentDef.key] ?? "";

  return (
    <PortfolioCard
      title="SOBRE"
      icon={UserCheck}
      action={
        !editing ? (
          <button
            type="button"
            onClick={() => {
              setValues({ bioPt: me.bioPt ?? "", bioEn: me.bioEn ?? "", bioFr: me.bioFr ?? "" });
              setEditing(true);
            }}
            className="inline-flex items-center gap-1 rounded-md border border-laps-navy/15 px-2 py-1 text-[10px] font-semibold text-laps-navy/60 hover:border-laps-blue/30 hover:text-laps-blue"
          >
            <Edit2 className="h-3 w-3" /> Editar
          </button>
        ) : null
      }
    >
      {/* Language tab switcher */}
      <div className="mb-3 flex gap-1 rounded-lg border border-laps-navy/10 bg-laps-ghost/30 p-0.5">
        {BIO_LANGS.map((b) => (
          <button
            key={b.tab}
            type="button"
            onClick={() => setActiveTab(b.tab)}
            className={`flex-1 rounded-md py-1 text-[10px] font-bold uppercase tracking-wider transition ${
              activeTab === b.tab
                ? "bg-white text-laps-blue shadow-sm"
                : "text-laps-navy/50 hover:text-laps-navy/70"
            }`}
          >
            {t.portal.bioTab[b.tab]}
          </button>
        ))}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={currentValue}
            onChange={(e) => setValues((v) => ({ ...v, [currentDef.key]: e.target.value }))}
            rows={4}
            className="w-full rounded-md border border-laps-navy/15 bg-white px-3 py-2 text-sm text-laps-navy outline-none focus:border-laps-blue/40 focus:ring-2 focus:ring-laps-blue/15"
            placeholder={currentDef.placeholder}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => mutation.mutate(values)}
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-laps-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-laps-navy disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              {mutation.isPending ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-laps-navy/15 px-3 py-1.5 text-xs font-semibold text-laps-navy/70 hover:bg-laps-ghost"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-laps-navy/80">
          {currentStored || (
            <span className="italic text-laps-navy/40">
              Sem bio em {t.portal.bioTab[activeTab].toLowerCase()}. Clique em Editar para adicionar.
            </span>
          )}
        </p>
      )}
    </PortfolioCard>
  );
}

// ───── Research areas editor ─────

function ResearchAreasEditor({
  me,
  dbAreas,
  currentAreas,
}: {
  me: MyProfile;
  dbAreas: ApiResearchArea[];
  currentAreas: string[];
}) {
  const qc = useQueryClient();
  const { t } = useLang();
  const [areas, setAreas] = useState<string[]>(currentAreas);
  const [newArea, setNewArea] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [dirty, setDirty] = useState(false);

  const mutation = useMutation({
    mutationFn: (next: string[]) => api.meUpdate({ areas: next.join(",") }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setDirty(false);
      toast.success(t.portal.saved);
    },
    onError: () => toast.error(t.portal.errorSave),
  });

  function addArea(slug: string) {
    const trimmed = slug.trim();
    if (!trimmed || areas.includes(trimmed)) return;
    const next = [...areas, trimmed];
    setAreas(next);
    setDirty(true);
    setNewArea("");
    setShowInput(false);
  }

  function removeArea(slug: string) {
    const next = areas.filter((a) => a !== slug);
    setAreas(next);
    setDirty(true);
  }

  // Resolve color from dbAreas if it's a known slug
  function areaColor(slug: string): string | undefined {
    const found = dbAreas.find((a) => a.slug === slug);
    return found?.color;
  }

  function areaLabel(slug: string): string {
    const found = dbAreas.find((a) => a.slug === slug);
    return found?.namePt ?? slug;
  }

  const unused = dbAreas.filter((a) => !areas.includes(a.slug));

  return (
    <PortfolioCard
      title="ÁREAS DE PESQUISA"
      icon={Compass}
      action={
        dirty ? (
          <button
            type="button"
            onClick={() => mutation.mutate(areas)}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-1 rounded-md bg-laps-blue px-2 py-1 text-[10px] font-semibold text-white hover:bg-laps-navy disabled:opacity-60"
          >
            <Save className="h-3 w-3" /> {mutation.isPending ? "…" : "Salvar"}
          </button>
        ) : null
      }
    >
      <div className="space-y-3">
        {/* Current areas */}
        <div className="flex flex-wrap gap-1.5">
          {areas.map((slug) => {
            const color = areaColor(slug);
            return (
              <span
                key={slug}
                className="inline-flex items-center gap-1.5 rounded-full border border-laps-light/40 bg-white px-2.5 py-1 text-[11px] font-medium text-laps-navy/80"
              >
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ background: color ?? "#94a3b8" }}
                />
                {areaLabel(slug)}
                <button
                  type="button"
                  onClick={() => removeArea(slug)}
                  className="ml-0.5 rounded-full text-laps-navy/40 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          <button
            type="button"
            onClick={() => setShowInput(!showInput)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-laps-blue/40 px-2.5 py-1 text-[11px] font-medium text-laps-blue/70 transition hover:border-laps-blue hover:text-laps-blue"
          >
            <Plus className="h-3 w-3" /> Adicionar
          </button>
        </div>

        {/* Add area panel */}
        {showInput && (
          <div className="space-y-2 rounded-xl border border-laps-navy/10 bg-laps-ghost/20 p-3">
            {unused.length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-laps-navy/50">
                  Áreas existentes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {unused.map((a) => (
                    <button
                      key={a.slug}
                      type="button"
                      onClick={() => addArea(a.slug)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-laps-light/40 bg-white px-2.5 py-1 text-[11px] font-medium text-laps-navy/70 transition hover:border-laps-blue/40 hover:text-laps-blue"
                    >
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: a.color }}
                      />
                      {a.namePt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-laps-navy/50">
                Nova área (texto livre)
              </p>
              <div className="flex gap-2">
                <Input
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  placeholder="Ex: Processamento de Sinais"
                  className="h-8 flex-1 text-xs"
                  onKeyDown={(e) => e.key === "Enter" && addArea(newArea)}
                />
                <button
                  type="button"
                  onClick={() => addArea(newArea)}
                  disabled={!newArea.trim()}
                  className="rounded-md bg-laps-blue px-3 text-xs font-semibold text-white hover:bg-laps-navy disabled:opacity-60"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PortfolioCard>
  );
}

// ───── Interests / tags editor ─────

/**
 * Delimiter tokenization — turns one typed string into N discrete tags.
 *
 * "Machine Learning, Computer Science" → ["Machine Learning", "Computer Science"].
 * The comma is also the storage delimiter (interests round-trips as a single
 * comma-joined column), so a tag may never contain one — tokenizing on input
 * is what keeps that invariant true instead of corrupting the next read.
 * Semicolons and newlines are folded in too, since both turn up when the text
 * is pasted out of a spreadsheet or a doc.
 *
 * Pure on purpose: the save path re-runs it over the pending input, which only
 * works if it never touches component state.
 */
export function mergeTokens(existing: string[], raw: string): string[] {
  const tokens = raw
    .split(/[,;\n]+/)
    .map((s) => s.trim().replace(/\s+/g, " "))
    .filter(Boolean);

  const next = [...existing];
  for (const token of tokens) {
    // Case-insensitive dedupe: "machine learning" shouldn't sit next to
    // "Machine Learning". The spelling entered first wins.
    if (!next.some((t) => t.toLowerCase() === token.toLowerCase())) next.push(token);
  }
  return next;
}

function InterestsEditor({ me, currentInterests }: { me: MyProfile; currentInterests: string[] }) {
  const qc = useQueryClient();
  const { t } = useLang();
  const [interests, setInterests] = useState<string[]>(currentInterests);
  const [newTag, setNewTag] = useState("");
  const [dirty, setDirty] = useState(false);

  const mutation = useMutation({
    mutationFn: (next: string[]) => api.meUpdate({ interests: next.join(",") }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setDirty(false);
      toast.success(t.portal.saved);
    },
    // saveAll() optimistically clears `dirty`; restore it on failure so the
    // Salvar button comes back instead of stranding unsaved edits.
    onError: () => {
      setDirty(true);
      toast.error(t.portal.errorSave);
    },
  });

  function addTags(raw: string) {
    const next = mergeTokens(interests, raw);
    setNewTag("");
    if (next.length === interests.length) return;
    setInterests(next);
    setDirty(true);
  }

  /**
   * Saves the pending input together with the committed chips.
   *
   * Clicking "Salvar" blurs the field first, but the blur's state update isn't
   * visible to this already-bound click handler — reading `interests` here
   * would drop a tag the member just typed. Re-tokenizing from `newTag` makes
   * the save correct no matter how the events interleave.
   */
  function saveAll() {
    const next = mergeTokens(interests, newTag);
    setInterests(next);
    setNewTag("");
    setDirty(false);
    mutation.mutate(next);
  }

  function removeTag(tag: string) {
    const next = interests.filter((tg) => tg !== tag);
    setInterests(next);
    setDirty(true);
  }

  return (
    <PortfolioCard
      title="INTERESSES"
      icon={Sparkles}
      action={
        dirty || newTag.trim() ? (
          <button
            type="button"
            onClick={saveAll}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-1 rounded-md bg-laps-blue px-2 py-1 text-[10px] font-semibold text-white hover:bg-laps-navy disabled:opacity-60"
          >
            <Save className="h-3 w-3" /> {mutation.isPending ? "…" : "Salvar"}
          </button>
        ) : null
      }
    >
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {interests.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-md bg-laps-ghost/60 px-2 py-0.5 text-[11px] font-medium text-laps-blue"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="rounded-full text-laps-blue/50 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => {
              const v = e.target.value;
              if (!/[,;\n]/.test(v)) {
                setNewTag(v);
                return;
              }
              // A delimiter landed mid-typing. Commit everything before the
              // last one and keep the trailing partial word in the box, so
              // typing "Machine Learning, Computer Sci…" never stalls.
              const cut = Math.max(v.lastIndexOf(","), v.lastIndexOf(";"), v.lastIndexOf("\n"));
              addTags(v.slice(0, cut));
              setNewTag(v.slice(cut + 1).trimStart());
            }}
            placeholder="Ex: Machine Learning, Computer Science"
            className="h-8 flex-1 text-xs"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              // Keep Enter from submitting any enclosing form before the tag lands.
              e.preventDefault();
              addTags(newTag);
            }}
            // Commit a half-typed tag instead of silently dropping it when the
            // member clicks straight on "Salvar".
            onBlur={() => addTags(newTag)}
          />
          <button
            type="button"
            onClick={() => addTags(newTag)}
            disabled={!newTag.trim()}
            className="inline-flex items-center gap-1 rounded-md border border-laps-blue/25 bg-white px-2 py-1.5 text-xs font-semibold text-laps-blue hover:bg-laps-ghost disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-laps-navy/40">
          Separe por vírgula para adicionar vários de uma vez.
        </p>
      </div>
    </PortfolioCard>
  );
}

// ───── Languages editor ─────

function LanguagesEditor({ me }: { me: MyProfile }) {
  const qc = useQueryClient();
  const [entries, setEntries] = useState<LanguageEntry[]>(() => parseLanguages(me.languages));
  const [addCode, setAddCode] = useState("");
  const [addLevel, setAddLevel] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { t } = useLang();

  const mutation = useMutation({
    mutationFn: (next: LanguageEntry[]) =>
      api.meUpdate({ languages: serializeLanguages(next) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setDirty(false);
      toast.success(t.portal.saved);
    },
    onError: () => toast.error(t.portal.errorSave),
  });

  const langDef = addCode ? LANGUAGE_BY_CODE[addCode] : undefined;

  function handleCodeChange(code: string) {
    setAddCode(code);
    setAddLevel("");
  }

  function addEntry() {
    if (!addCode || !addLevel) return;
    if (entries.some((e) => e.code === addCode)) return;
    const next = [...entries, { code: addCode, level: addLevel }];
    setEntries(next);
    setDirty(true);
    setAddCode("");
    setAddLevel("");
    setShowAdd(false);
  }

  function removeEntry(code: string) {
    const next = entries.filter((e) => e.code !== code);
    setEntries(next);
    setDirty(true);
  }

  const usedCodes = new Set(entries.map((e) => e.code));
  const availableLangs = LANGUAGE_CATALOG.filter((l) => !usedCodes.has(l.code));

  return (
    <PortfolioCard
      title="IDIOMAS"
      icon={Globe}
      action={
        dirty ? (
          <button
            type="button"
            onClick={() => mutation.mutate(entries)}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-1 rounded-md bg-laps-blue px-2 py-1 text-[10px] font-semibold text-white hover:bg-laps-navy disabled:opacity-60"
          >
            <Save className="h-3 w-3" /> {mutation.isPending ? "…" : "Salvar"}
          </button>
        ) : null
      }
    >
      <div className="space-y-3">
        {/* Existing entries */}
        <div className="space-y-1.5">
          {entries.map((entry) => {
            const lang = LANGUAGE_BY_CODE[entry.code];
            return (
              <div
                key={entry.code}
                className="flex items-center justify-between gap-2 rounded-lg border border-laps-blue/10 bg-laps-ghost/20 px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base leading-none">{lang?.flag ?? "🌐"}</span>
                  <span className="text-xs font-medium text-laps-navy/85 truncate">
                    {lang?.name.pt ?? entry.code}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${levelBadgeClass(entry.level)}`}
                  >
                    {levelShortLabel(entry.level, "pt")}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.code)}
                    className="rounded-full text-laps-navy/35 hover:text-red-600 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add form */}
        {showAdd ? (
          <div className="rounded-xl border border-laps-navy/10 bg-laps-ghost/20 p-3 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-laps-navy/50">
              Adicionar idioma
            </p>

            {/* Language selector */}
            <select
              value={addCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="w-full rounded-md border border-laps-navy/15 bg-white px-2 py-2 text-xs text-laps-navy focus:outline-none focus:border-laps-blue/40"
            >
              <option value="">— Selecione o idioma —</option>
              {availableLangs.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name.pt}
                </option>
              ))}
            </select>

            {/* Level selector — appears once a language is chosen */}
            {langDef && (
              <div>
                <p className="mb-1 text-[10px] text-laps-navy/50">
                  Sistema:{" "}
                  <span className="font-bold">
                    {langDef.system === "CEFR"
                      ? "CEFR (A1–C2)"
                      : langDef.system === "HSK"
                      ? "HSK (1–6)"
                      : langDef.system === "JLPT"
                      ? "JLPT (N5–N1)"
                      : "TOPIK (1–6)"}
                  </span>
                </p>
                <select
                  value={addLevel}
                  onChange={(e) => setAddLevel(e.target.value)}
                  className="w-full rounded-md border border-laps-navy/15 bg-white px-2 py-2 text-xs text-laps-navy focus:outline-none focus:border-laps-blue/40"
                >
                  <option value="">— Selecione o nível —</option>
                  <option value="NATIVE">{NATIVE_LEVEL.label.pt}</option>
                  {LEVELS_BY_SYSTEM[langDef.system].map((lv) => (
                    <option key={lv.value} value={lv.value}>
                      {lv.label.pt}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={addEntry}
                disabled={!addCode || !addLevel}
                className="flex-1 rounded-md bg-laps-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-laps-navy disabled:opacity-50 transition"
              >
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => { setShowAdd(false); setAddCode(""); setAddLevel(""); }}
                className="rounded-md border border-laps-navy/15 px-3 py-1.5 text-xs font-semibold text-laps-navy/70 hover:bg-laps-ghost transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : availableLangs.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-laps-blue/40 px-2.5 py-1 text-[11px] font-medium text-laps-blue/70 transition hover:border-laps-blue hover:text-laps-blue"
          >
            <Plus className="h-3 w-3" /> Adicionar idioma
          </button>
        ) : null}

        {entries.length === 0 && !showAdd && (
          <p className="text-xs italic text-laps-navy/40">Nenhum idioma adicionado ainda.</p>
        )}
      </div>
    </PortfolioCard>
  );
}

// ───── Roadmap editor ─────

function RoadmapEditor({ me }: { me: MyProfile }) {
  const qc = useQueryClient();
  const { t } = useLang();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(me.roadmap ?? "");

  const mutation = useMutation({
    mutationFn: (text: string) => api.meUpdate({ roadmap: text }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setEditing(false);
      toast.success(t.portal.saved);
    },
    onError: () => toast.error(t.portal.errorSave),
  });

  if (!editing && !me.roadmap) return null;

  return (
    <PortfolioCard
      title="ROTEIRO DE PESQUISA"
      icon={Compass}
      action={
        !editing ? (
          <button
            type="button"
            onClick={() => { setValue(me.roadmap ?? ""); setEditing(true); }}
            className="inline-flex items-center gap-1 rounded-md border border-laps-navy/15 px-2 py-1 text-[10px] font-semibold text-laps-navy/60 hover:border-laps-blue/30 hover:text-laps-blue"
          >
            <Edit2 className="h-3 w-3" /> Editar
          </button>
        ) : null
      }
    >
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-laps-navy/15 bg-white px-3 py-2 text-sm text-laps-navy outline-none focus:border-laps-blue/40 focus:ring-2 focus:ring-laps-blue/15"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => mutation.mutate(value)}
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-laps-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-laps-navy disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              {mutation.isPending ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-laps-navy/15 px-3 py-1.5 text-xs font-semibold text-laps-navy/70 hover:bg-laps-ghost"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-line text-sm leading-relaxed text-laps-navy/80">{me.roadmap}</p>
      )}
    </PortfolioCard>
  );
}

// ───── Projects section ─────

function ProjectsSection({
  me,
  allMembers,
  portfolioProjects,
  myProjectLinks,
  allProjects,
}: {
  me: MyProfile;
  allMembers: ApiMember[];
  portfolioProjects: ApiProject[];
  myProjectLinks: { projectId: string; role: string }[];
  allProjects: ApiProject[];
}) {
  const [creating, setCreating] = useState(false);
  const qc = useQueryClient();

  return (
    <PortfolioCard title="PROJETOS" icon={Sparkles}>
      <div className="space-y-3">
        {/* Existing projects */}
        {portfolioProjects.map((p) => (
          <ProjectCard key={p.id} project={p} me={me} />
        ))}

        {portfolioProjects.length === 0 && !creating && (
          <p className="text-sm italic text-laps-navy/45">
            Nenhum projeto ainda. Crie um abaixo!
          </p>
        )}

        {/* Create new project */}
        {creating ? (
          <CreateProjectForm
            me={me}
            allMembers={allMembers}
            onCancel={() => setCreating(false)}
            onCreated={() => {
              setCreating(false);
              qc.invalidateQueries({ queryKey: ["projects"] });
              qc.invalidateQueries({ queryKey: ["my-projects"] });
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-laps-blue/40 py-3 text-sm font-semibold text-laps-blue/70 transition hover:border-laps-blue hover:text-laps-blue hover:bg-laps-ghost/20"
          >
            <Plus className="h-4 w-4" /> Criar novo projeto
          </button>
        )}
      </div>

      {/* Link to existing projects section */}
      <div className="mt-6 border-t border-laps-navy/8 pt-4">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-laps-navy/50">
          Vincular a projetos existentes
        </p>
        <ExistingProjectLinker
          me={me}
          allProjects={allProjects}
          myProjectLinks={myProjectLinks}
        />
      </div>
    </PortfolioCard>
  );
}

function ProjectCard({ project, me }: { project: ApiProject; me: MyProfile }) {
  const myLink = project.leaders?.find(
    (l) => l.memberId === me.id || l.member?.id === me.id
  );
  const roleLabel =
    myLink?.role === "LEAD" ? "Orientador" :
    myLink?.role === "CO_LEAD" ? "Co-orientador" : "Pesquisador";

  return (
    <div className="rounded-xl border border-laps-blue/15 bg-gradient-to-br from-white to-laps-ghost/30 p-4 transition hover:border-laps-blue/30 hover:shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h4 className="text-sm font-bold text-laps-navy">
          {project.titlePt || project.titleEn || project.slug}
        </h4>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
            project.status === "ACTIVE"
              ? "bg-laps-blue/10 text-laps-blue"
              : "bg-laps-navy/10 text-laps-navy"
          }`}
        >
          {project.status === "ACTIVE" ? "Ativo" : "Concluído"}
        </span>
      </div>
      {myLink && myLink.role !== "RESEARCHER" && (
        <div className="mb-2 inline-flex rounded-full bg-laps-ghost px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-laps-blue">
          {roleLabel}
        </div>
      )}
      {project.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-laps-light/40 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-laps-navy/70"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {project.descriptionPt && (
        <p className="text-xs leading-relaxed text-laps-navy/70">{project.descriptionPt}</p>
      )}
    </div>
  );
}

function CreateProjectForm({
  me,
  allMembers,
  onCancel,
  onCreated,
}: {
  me: MyProfile;
  allMembers: ApiMember[];
  onCancel: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");
  const [year, setYear] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [advisorId, setAdvisorId] = useState("");
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      api.meCreateProject({
        titlePt: title,
        descriptionPt: description,
        status,
        year: year ? parseInt(year) : null,
        articleUrl: articleUrl || undefined,
        tags,
        advisorId: advisorId || null,
        participantIds,
      }),
    onSuccess: onCreated,
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao criar projeto."),
  });

  // Filter HEAD and COORDINATOR members as potential advisors
  const potentialAdvisors = allMembers.filter(
    (m) => (m.currentRole === "HEAD" || m.currentRole === "COORDINATOR") && m.id !== me.id
  );

  // All other members as potential participants (excluding self and selected advisor)
  const potentialParticipants = allMembers.filter(
    (m) => m.id !== me.id && m.id !== advisorId && m.status === "ACTIVE"
  );

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  function toggleParticipant(id: string) {
    setParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  return (
    <div className="rounded-xl border border-laps-blue/20 bg-gradient-to-br from-laps-ghost/30 to-white p-4 shadow-sm">
      <h4 className="mb-4 text-sm font-bold text-laps-navy">Novo projeto</h4>

      <div className="space-y-3">
        {/* Title */}
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
            Título *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do projeto"
            className="h-10 text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Descrição breve do projeto…"
            className="w-full rounded-md border border-laps-navy/15 bg-white px-3 py-2 text-sm text-laps-navy outline-none focus:border-laps-blue/40 focus:ring-2 focus:ring-laps-blue/15"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Status */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "ACTIVE" | "COMPLETED")}
              className="w-full rounded-md border border-laps-navy/15 bg-white px-2 py-2 text-sm text-laps-navy"
            >
              <option value="ACTIVE">Ativo</option>
              <option value="COMPLETED">Concluído</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              Ano
            </label>
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2024"
              className="h-10 text-sm"
            />
          </div>

          {/* Article URL */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              Link do artigo
            </label>
            <Input
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              placeholder="https://…"
              className="h-10 text-sm"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
            Tags
          </label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Ex: Computer Vision"
              className="h-9 flex-1 text-xs"
              onKeyDown={(e) => e.key === "Enter" && addTag()}
            />
            <button
              type="button"
              onClick={addTag}
              className="rounded-md border border-laps-blue/25 bg-white px-2 text-xs font-semibold text-laps-blue hover:bg-laps-ghost"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          {tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded border border-laps-light/40 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-laps-navy/70"
                >
                  {t}
                  <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Advisor */}
        {potentialAdvisors.length > 0 && (
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              Orientador / Professor responsável
            </label>
            <select
              value={advisorId}
              onChange={(e) => setAdvisorId(e.target.value)}
              className="w-full rounded-md border border-laps-navy/15 bg-white px-2 py-2 text-sm text-laps-navy"
            >
              <option value="">— Nenhum —</option>
              {potentialAdvisors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Participants */}
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
            Outros participantes
          </label>
          <div className="max-h-36 overflow-y-auto rounded-lg border border-laps-navy/10 bg-laps-ghost/10 p-2 space-y-1">
            {potentialParticipants.length === 0 ? (
              <p className="text-xs text-laps-navy/40 p-1">Nenhum outro membro disponível.</p>
            ) : (
              potentialParticipants.map((m) => (
                <label
                  key={m.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs font-medium text-laps-navy/80 hover:bg-laps-ghost/40"
                >
                  <input
                    type="checkbox"
                    checked={participantIds.includes(m.id)}
                    onChange={() => toggleParticipant(m.id)}
                    className="rounded border-laps-navy/30 text-laps-blue"
                  />
                  {m.fullName}
                  <span className="text-[10px] text-laps-navy/40">({m.currentRole})</span>
                </label>
              ))
            )}
          </div>
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-700">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !title.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-laps-blue px-4 py-2 text-xs font-semibold text-white hover:bg-laps-navy disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" />
            {mutation.isPending ? "Criando…" : "Criar projeto"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-laps-navy/15 px-4 py-2 text-xs font-semibold text-laps-navy/70 hover:bg-laps-ghost"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function ExistingProjectLinker({
  me,
  allProjects,
  myProjectLinks,
}: {
  me: MyProfile;
  allProjects: ApiProject[];
  myProjectLinks: { projectId: string; role: string }[];
}) {
  const qc = useQueryClient();
  const [pending, setPending] = useState<{ projectId: string; role: string }[] | null>(null);
  const editable = pending ?? myProjectLinks.map((l) => ({ projectId: l.projectId, role: l.role }));

  const mutation = useMutation({
    mutationFn: (next: { projectId: string; role: string }[]) => api.updateMyProjects(next),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      setPending(null);
    },
  });

  // Only show projects not already in the portfolio (created by them)
  const linkable = allProjects.filter(
    (p) => !p.leaders?.some((l) => l.memberId === me.id || l.member?.id === me.id)
  );

  function toggle(p: ApiProject) {
    const current = editable.find((l) => l.projectId === p.id);
    const next = current
      ? editable.filter((l) => l.projectId !== p.id)
      : [...editable, { projectId: p.id, role: "RESEARCHER" }];
    setPending(next);
  }

  if (linkable.length === 0) return <p className="text-xs text-laps-navy/40">Não há outros projetos para vincular.</p>;

  return (
    <div className="space-y-2">
      {linkable.map((p) => {
        const linked = !!editable.find((l) => l.projectId === p.id);
        return (
          <div
            key={p.id}
            className={`flex items-center justify-between gap-2 rounded-lg border p-2.5 transition ${
              linked ? "border-laps-blue/30 bg-laps-ghost/20" : "border-laps-navy/10 bg-white"
            }`}
          >
            <span className="truncate text-xs font-medium text-laps-navy/85">
              {p.titlePt || p.titleEn || p.slug}
            </span>
            <button
              type="button"
              onClick={() => toggle(p)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                linked
                  ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                  : "border border-laps-blue/25 bg-white text-laps-blue hover:bg-laps-ghost"
              }`}
            >
              {linked ? "Remover" : "Vincular"}
            </button>
          </div>
        );
      })}
      {pending && (
        <button
          type="button"
          onClick={() => mutation.mutate(editable)}
          disabled={mutation.isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-laps-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-laps-navy disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" />
          {mutation.isPending ? "Salvando…" : "Salvar vínculos"}
        </button>
      )}
    </div>
  );
}

// ───── Account ─────

function FirstLoginBanner({ emailVerified }: { emailVerified: boolean }) {
  return (
    <section className="rounded-2xl border border-laps-blue/20 bg-gradient-to-br from-laps-ghost/60 to-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-laps-blue/15 text-laps-blue">
          <KeyRound className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-laps-navy">
            Bem-vindo(a)! Você está usando uma senha temporária.
          </h2>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-laps-navy/70">
            <li className={emailVerified ? "line-through opacity-60" : ""}>
              Cadastre seu email no formulário abaixo e salve.
            </li>
            <li className={emailVerified ? "line-through opacity-60" : ""}>
              Solicite o token de verificação e confirme.
            </li>
            <li className={emailVerified ? "font-semibold text-laps-blue" : ""}>
              Defina sua senha pessoal na seção <em>Trocar senha</em>.
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

function EmailVerificationBanner({ me }: { me: MyProfile }) {
  const [tokenIssued, setTokenIssued] = useState<{ token: string; expiresAt: string } | null>(null);
  const [verifyToken, setVerifyToken] = useState("");
  const qc = useQueryClient();

  const requestMutation = useMutation({
    mutationFn: () => api.meRequestEmailVerification(),
    onSuccess: (res) => {
      if (res.token && res.expiresAt) {
        setTokenIssued({ token: res.token, expiresAt: res.expiresAt });
        toast.info("Token de verificação gerado. Cole-o abaixo.");
      } else {
        toast.success("Email já verificado.");
      }
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Falha ao solicitar verificação."),
  });

  const verifyMutation = useMutation({
    mutationFn: (token: string) => api.meVerifyEmail(token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setTokenIssued(null);
      setVerifyToken("");
      toast.success("Email verificado com sucesso!");
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Token inválido ou expirado."),
  });

  return (
    <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Mail className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-amber-900">
            Verifique seu email para liberar a troca de senha
          </h2>
          <p className="mt-1 text-xs text-amber-900/70">
            {me.email
              ? "Solicite o token, copie-o e cole abaixo para confirmar."
              : "Cadastre um email no formulário de perfil e salve antes de solicitar o token."}
          </p>

          {me.email && !tokenIssued && (
            <button
              type="button"
              onClick={() => requestMutation.mutate()}
              disabled={requestMutation.isPending}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:border-amber-500 hover:text-amber-900 disabled:opacity-60"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {requestMutation.isPending ? "Gerando token…" : `Verificar ${me.email}`}
            </button>
          )}

          {tokenIssued && (
            <div className="mt-3 space-y-2 rounded-lg border border-amber-300 bg-amber-100/40 p-3 text-xs">
              <p className="font-semibold text-amber-900">
                Token gerado (válido por 24h). Cole abaixo para confirmar.
              </p>
              <code className="block break-all rounded bg-white px-2 py-1 font-mono text-[11px] text-amber-900">
                {tokenIssued.token}
              </code>
              <div className="flex gap-2">
                <Input
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  placeholder="Cole o token"
                  className="h-8 flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => verifyMutation.mutate(verifyToken)}
                  disabled={verifyMutation.isPending || !verifyToken}
                  className="rounded-md bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
                >
                  Verificar
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

function PasswordChangeCard({ emailVerified }: { emailVerified: boolean }) {
  const qc = useQueryClient();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({ a, b }: { a: string; b: string }) => api.meChangePassword(a, b),
    onSuccess: () => {
      setCurrent("");
      setNext("");
      setConfirm("");
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Senha atualizada com sucesso!");
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Erro ao trocar senha."),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (next.length < 8) { setFormError("A nova senha deve ter pelo menos 8 caracteres."); return; }
    if (next !== confirm) { setFormError("As senhas não coincidem."); return; }
    mutation.mutate({ a: current, b: next });
  }

  if (!emailVerified) {
    return (
      <section className="relative rounded-2xl border border-laps-navy/10 bg-white p-6 shadow-sm">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-white/55" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-laps-navy/8 text-laps-navy/60">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-laps-navy/65">Trocar senha</h2>
            <p className="mt-1 text-xs text-laps-navy/55">
              Cadastre e verifique seu email antes de definir uma senha pessoal.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-laps-navy/10 bg-white p-6 shadow-sm">
      <h2 className="font-display mb-1 text-base font-bold text-laps-navy">Trocar senha</h2>
      <p className="mb-4 text-xs text-laps-navy/55">Email verificado — defina sua senha pessoal.</p>
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
        <PasswordField id="pwd-current" label="Senha atual" value={current} onChange={setCurrent} autoComplete="current-password" />
        <PasswordField id="pwd-next" label="Nova senha" value={next} onChange={setNext} autoComplete="new-password" />
        <PasswordField id="pwd-confirm" label="Confirmar" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        {formError && (
          <p className="md:col-span-3 flex items-center gap-1.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" /> {formError}
          </p>
        )}
        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-laps-blue px-4 py-2 text-xs font-semibold text-white transition hover:bg-laps-navy disabled:opacity-60"
          >
            <KeyRound className="h-3.5 w-3.5" />
            {mutation.isPending ? "Salvando…" : "Trocar senha"}
          </button>
        </div>
      </form>
    </section>
  );
}

function PasswordField({
  id, label, value, onChange, autoComplete,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 border-laps-navy/15 bg-white pr-9 text-sm"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((v) => !v)}
          className="absolute inset-y-0 right-2.5 flex items-center text-laps-navy/40 hover:text-laps-navy/70"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

// ───── Exchange country editor ─────

const EXCHANGE_COUNTRY_OPTIONS: { code: string; label: string }[] = [
  { code: "FR", label: "🇫🇷 França" },
  { code: "CA", label: "🇨🇦 Canadá" },
  { code: "PT", label: "🇵🇹 Portugal" },
  { code: "IT", label: "🇮🇹 Itália" },
  { code: "DE", label: "🇩🇪 Alemanha" },
  { code: "US", label: "🇺🇸 Estados Unidos" },
  { code: "UK", label: "🇬🇧 Reino Unido" },
  { code: "ES", label: "🇪🇸 Espanha" },
];

function ExchangeCountryEditor({ me }: { me: MyProfile }) {
  const qc = useQueryClient();
  const { t } = useLang();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(me.exchangeCountry ?? "");

  // Security role, resolved server-side from the manager-email allowlist —
  // deliberately NOT me.currentRole, which is the academic tier and happens to
  // spell "MANAGER" too. SecurityConfig gates /api/v1/admin/** on this one, so
  // keying off the tier would render an edit button that 403s on submit.
  const isManager = me.role === "MANAGER";

  const mutation = useMutation({
    // Exchange country is manager-owned. It is intentionally absent from the
    // /me update DTO (MyProfileUpdate), so the only way to write it is the
    // admin endpoint — which SecurityConfig restricts to MANAGER and
    // AuditService records. A member who forges this call gets 403 from Spring,
    // not from this component.
    //
    // The empty string clears the country: AdminController treats null as
    // "field not sent, leave alone", so `code || null` would make clearing a
    // silent no-op.
    mutationFn: (code: string) => api.admin.updateMember(me.id, { exchangeCountry: code }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setEditing(false);
      toast.success(t.portal.saved);
    },
    onError: () => toast.error(t.portal.errorSave),
  });

  const current = EXCHANGE_COUNTRY_OPTIONS.find((c) => c.code === me.exchangeCountry);

  // Members see the country their coordinator assigned, but cannot touch it.
  if (!isManager) {
    return (
      <PortfolioCard title={t.portal.exchangeCountry} icon={MapPin}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-laps-navy/80">
            {current ? current.label : <span className="italic text-laps-navy/40">{t.portal.noCountry}</span>}
          </span>
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-md bg-laps-ghost/60 px-2 py-1 text-[10px] font-semibold text-laps-navy/45"
            title="Somente gerentes podem alterar o país de intercâmbio."
          >
            <Lock className="h-3 w-3" /> Gerenciado
          </span>
        </div>
        <p className="mt-2 text-[10px] text-laps-navy/40">
          Definido pela coordenação. Fale com um gerente para corrigir.
        </p>
      </PortfolioCard>
    );
  }

  return (
    <PortfolioCard title={t.portal.exchangeCountry} icon={MapPin}>
      {editing ? (
        <div className="space-y-2">
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-md border border-laps-navy/15 bg-white px-2 py-2 text-sm text-laps-navy focus:outline-none focus:border-laps-blue/40"
          >
            <option value="">— {t.portal.noCountry} —</option>
            {EXCHANGE_COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => mutation.mutate(value)}
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-laps-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-laps-navy disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              {mutation.isPending ? "…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => { setValue(me.exchangeCountry ?? ""); setEditing(false); }}
              className="rounded-md border border-laps-navy/15 px-3 py-1.5 text-xs font-semibold text-laps-navy/70 hover:bg-laps-ghost"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-laps-navy/80">
            {current ? current.label : <span className="italic text-laps-navy/40">{t.portal.noCountry}</span>}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 rounded-md border border-laps-navy/15 px-2 py-1 text-[10px] font-semibold text-laps-navy/60 hover:border-laps-blue/30 hover:text-laps-blue"
          >
            <Edit2 className="h-3 w-3" /> Editar
          </button>
        </div>
      )}
    </PortfolioCard>
  );
}

// ───── Shared UI components ─────

function PortfolioCard({
  title,
  icon: IconComp,
  children,
  action,
}: {
  title: string;
  icon: typeof Crown;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-laps-blue/12 bg-white p-5 shadow-[0_2px_20px_rgba(25,58,89,0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-laps-ghost text-laps-blue">
            <IconComp className="h-4 w-4" />
          </span>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-laps-navy/70">
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatCard({
  icon: IconComp,
  label,
  value,
}: {
  icon: typeof Crown;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-laps-blue/12 bg-white p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-laps-ghost text-laps-blue">
        <IconComp className="h-5 w-5" />
      </span>
      <div>
        <div className="font-display text-2xl font-bold text-laps-navy">{value}</div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-laps-navy/60">
          {label}
        </div>
      </div>
    </div>
  );
}
