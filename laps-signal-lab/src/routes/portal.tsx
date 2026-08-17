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
  Clock,
  Compass,
  Crown,
  Edit2,
  Eye,
  EyeOff,
  Globe,
  GraduationCap,
  ImageIcon,
  KeyRound,
  LayoutDashboard,
  Lock,
  Mail,
  MapPin,
  Microscope,
  Palette,
  Plus,
  Save,
  Shield,
  Sparkles,
  Upload,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import PortalGuide, { type GuideStepId } from "@/components/PortalGuide";
import { EmailVerificationDialog } from "@/components/EmailVerificationDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ExchangePlacementPicker,
  type Placement,
} from "@/components/ExchangePlacementPicker";
import { countryName, brStateName } from "@/lib/exchange-data";
import { DestinationFlag } from "@/lib/flags";
import { useLang } from "@/hooks/use-lang";
import { type Lang } from "@/lib/i18n";
import { api, ApiError, resolveMediaUrl, type ApiMember, type ApiProject, type ApiPublication, type ApiResearchArea, type MyProfile, type PublicationStatus, type PublicationType } from "@/lib/api";
import {
  LANGUAGE_CATALOG, LANGUAGE_BY_CODE, LEVELS_BY_SYSTEM, NATIVE_LEVEL,
  parseLanguages, serializeLanguages, levelBadgeClass, levelShortLabel,
  type LanguageEntry,
} from "@/lib/languages-data";
import { Input } from "@/components/ui/input";
import { initials } from "@/lib/team-data";
import { UNDERGRAD_PROGRAMS, toProgramCode } from "@/lib/undergrad-programs";
import { formatJoined, semesterYears, type Lang as JoinedLang } from "@/lib/joined-laps";
import type { Tier } from "@/lib/team-data";
import { TIER_CONFIG } from "@/lib/tier-visual";

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
    <div className="relative inline-flex w-fit items-center p-0.5 rounded-full bg-laps-ink/5 border border-laps-navy/5">
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
                className="absolute inset-0 rounded-full bg-surface shadow-sm"
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

// The tier table lives in lib/tier-visual.ts now. Five screens used to carry
// their own near-identical copy of it, all including the violet/purple pair
// that belonged to no palette on this site.
const tierConfig = TIER_CONFIG;

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

/**
 * Turns a failed profile write into something the member can act on.
 *
 * Every editor on this page mapped all errors to "Falha ao salvar. Tente
 * novamente." — which, for the one failure new members reliably hit, is advice
 * that loops forever: the write guard refuses profile edits for as long as the
 * temporary password is live, so retrying can only fail again. The API reports
 * it in English, so match on it and say what actually unblocks them.
 */
function saveErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError && err.status === 403) {
    if (/temporary password/i.test(err.message)) {
      return "Troque a senha temporária antes de editar o perfil — a seção «Trocar senha» fica no fim da página e não exige email.";
    }
  }
  return fallback;
}

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

  // Which onboarding step the member is actually blocked on. Ordered to match
  // what the API allows — the temporary password has to go first, because every
  // profile write is refused until it does.
  const guideStep: GuideStepId | null = auth.mustChangePassword
    ? "password"
    : !me.email
      ? "email"
      : !auth.emailVerified
        ? "verify"
        : null;

  return (
    <div className="min-h-screen bg-laps-paper">
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
            <ThemeToggle className="h-8 w-8" />
            {/* Gerenciadores and coordenadores work in both halves of the app —
                their own portfolio and the lab-wide console. Rendered off
                auth.isManager (the resolved security role, which covers both
                tiers) rather than me.currentRole, so the button is only offered
                when /admin will actually let them in. */}
            {auth.isManager && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 rounded-md bg-laps-cta px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-laps-accent active:translate-y-px"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                {t.portal.commandCenter}
              </Link>
            )}
            <Link
              to="/team/$uuid"
              params={{ uuid: me.id }}
              className="inline-flex items-center gap-1.5 rounded-md border border-laps-navy/20 px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-laps-navy transition-colors hover:border-laps-navy hover:bg-laps-ghost"
            >
              {t.portal.viewProfile}
            </Link>
            <button
              type="button"
              onClick={() => api.logout().then(() => navigate({ to: "/login" }))}
              className="inline-flex items-center gap-1.5 rounded-md border border-laps-navy/20 px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-laps-navy/75 transition-colors hover:border-laps-navy hover:text-laps-navy"
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
            <div data-guide="email" className="scroll-mt-24">
              <ContactEditor me={me} />
            </div>
            {auth.mustChangePassword && <FirstLoginBanner hasEmail={!!me.email} />}
            {!auth.emailVerified && (
              <div data-guide="verify" className="scroll-mt-24">
                <EmailVerificationBanner me={me} />
              </div>
            )}

            <AboutEditor me={me} />
            <ResearchAreasEditor
              me={me}
              dbAreas={areasQuery.data ?? []}
              currentAreas={memberAreas}
            />
            <InterestsEditor me={me} currentInterests={memberInterests} />
            <LanguagesEditor me={me} />
            <JoinedLapsEditor me={me} />
            <UndergradProgramCard me={me} />
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
            <PublicationsSection />
            <PasswordChangeCard
              emailVerified={auth.emailVerified}
              mustChangePassword={auth.mustChangePassword}
            />
          </main>
        </div>

        <div className="pb-16" />
      </div>

      {/* Walks a new member through password → email → verificação, in the only
          order the API accepts. Renders nothing once all three are done. */}
      <PortalGuide step={guideStep} />
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
  return (
    <div className="relative overflow-hidden rounded-md border border-laps-navy/20 bg-surface">
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
              {/* Outlined, mono, no glyph. The role chip used to be a filled
                  pastel capsule led by a Crown / Shield / Microscope icon —
                  the word beside it already said which tier this is. */}
              <span
                className={`inline-flex items-center rounded-sm border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] ${cfg.chip}`}
              >
                {cfg.label}
              </span>
              {roleStart && (
                <span className="inline-flex items-center gap-1.5 rounded-sm border border-laps-navy/20 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-laps-navy/60">
                  <Calendar className="h-3 w-3" /> desde {roleStart}
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
                className="inline-flex items-center gap-1.5 rounded-lg bg-laps-cta px-3 py-2 text-xs font-semibold text-white transition hover:bg-laps-accent"
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
    onError: (err) => toast.error(saveErrorMessage(err, t.portal.errorSave)),
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
            className="inline-flex items-center gap-1.5 rounded-md bg-laps-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-laps-cta disabled:opacity-60"
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

// Square export for avatars. 512 covers the largest place the avatar renders
// (the 144px portal hero at 3x DPR) without pushing the PNG near the API's
// 5 MiB multipart cap.
const AVATAR_CANVAS_SIZE = 512;

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
        <ImageTransformEditor
          file={editorFile}
          frameW={BANNER_CANVAS_W}
          frameH={BANNER_CANVAS_H}
          title="Ajustar imagem da capa"
          onConfirm={handleEditorConfirm}
          onCancel={() => setEditorFile(null)}
        />
      )}

      <div
        // Flat tier colour when the member has not set a banner. The default
        // used to be a three-stop gradient per tier, which meant the fallback
        // was louder than any banner someone actually chose.
        className={`relative h-40 md:h-48 ${!me.bannerImageUrl && !me.bannerColor ? cfg.band : ""}`}
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
          className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-md bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <Palette className="h-3.5 w-3.5" /> Editar capa
        </button>

        {/* Banner editor panel */}
        {open && (
          <div className="absolute right-4 top-14 z-10 w-72 rounded-md border border-laps-navy/30 bg-surface p-4">
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
                className="rounded-md bg-laps-accent px-3 text-xs font-semibold text-white hover:bg-laps-ink disabled:opacity-60"
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
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-laps-blue/25 bg-surface px-3 py-1.5 text-xs font-semibold text-laps-blue transition hover:bg-laps-ghost disabled:opacity-60"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Selecionar imagem…
                </button>
                {me.bannerImageUrl && (
                  <button
                    type="button"
                    onClick={() => saveMutation.mutate({ bannerImageUrl: "" })}
                    className="rounded-md border border-red-200 bg-surface px-2 text-xs text-red-600 hover:bg-red-50"
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

// ───── Image transform editor (shared by capa + foto) ─────

/**
 * Canvas bounding box of the output frame, expressed in the image's own rotated
 * frame. Rotating the frame instead of the image keeps the coverage maths in one
 * coordinate system.
 */
function rotatedFrameExtent(w: number, h: number, deg: number) {
  const r = (deg * Math.PI) / 180;
  const c = Math.abs(Math.cos(r));
  const s = Math.abs(Math.sin(r));
  return { w: w * c + h * s, h: w * s + h * c };
}

/**
 * Smallest scale at which the image still covers the whole output frame at this
 * rotation. Below it the export would contain empty wedges (which JPEG flattens
 * to black), so this is the slider's lower bound — not a suggestion.
 */
function minCoverScale(imgW: number, imgH: number, frameW: number, frameH: number, deg: number) {
  const e = rotatedFrameExtent(frameW, frameH, deg);
  return Math.max(e.w / imgW, e.h / imgH);
}

/**
 * Upper bound: scale 1 means one image pixel per output pixel, i.e. the photo at
 * its own native resolution — enlarging past that only invents detail. A photo
 * too small to cover the frame is the one exception: it must be allowed to reach
 * its cover scale, so the ceiling lifts to meet the floor.
 */
function maxAllowedScale(imgW: number, imgH: number, frameW: number, frameH: number, deg: number) {
  return Math.max(1, minCoverScale(imgW, imgH, frameW, frameH, deg));
}

/**
 * Clamps the pan so the frame stays fully inside the image. Without it a member
 * can drag a correctly-scaled photo half out of frame and export a band of void.
 */
function clampOffset(
  offset: { x: number; y: number },
  imgW: number,
  imgH: number,
  scale: number,
  frameW: number,
  frameH: number,
  deg: number,
) {
  const e = rotatedFrameExtent(frameW, frameH, deg);
  const r = (deg * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);

  // Frame centre relative to image centre, rotated into the image's frame.
  const u = -(offset.x * cos + offset.y * sin);
  const v = offset.x * sin - offset.y * cos;

  const maxU = Math.max(0, (imgW * scale - e.w) / 2);
  const maxV = Math.max(0, (imgH * scale - e.h) / 2);
  const cu = Math.min(maxU, Math.max(-maxU, u));
  const cv = Math.min(maxV, Math.max(-maxV, v));

  // …and back out to canvas space.
  return { x: -(cu * cos - cv * sin), y: -(cu * sin + cv * cos) };
}

function ImageTransformEditor({
  file,
  frameW,
  frameH,
  title,
  circular = false,
  onConfirm,
  onCancel,
}: {
  file: File;
  frameW: number;
  frameH: number;
  title: string;
  /** Circular mask + round export, for avatars. */
  circular?: boolean;
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

  // Bounds depend on rotation, so they are recomputed on every render.
  const minScale = img ? minCoverScale(img.width, img.height, frameW, frameH, rotation) : 0.05;
  const maxScale = img ? maxAllowedScale(img.width, img.height, frameW, frameH, rotation) : 10;

  // Load the image and start at the scale that just covers the frame
  useEffect(() => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      setScale(minCoverScale(image.width, image.height, frameW, frameH, 0));
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setImg(image);
    };
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file, frameW, frameH]);

  // Rotating changes how much image is needed to cover the frame, so a scale and
  // pan that were legal a moment ago may not be. Re-clamp both when it changes.
  useEffect(() => {
    if (!img) return;
    setScale((s) => Math.min(maxScale, Math.max(minScale, s)));
  }, [rotation, img, minScale, maxScale]);

  useEffect(() => {
    if (!img) return;
    setOffset((o) => clampOffset(o, img.width, img.height, scale, frameW, frameH, rotation));
  }, [img, scale, rotation, frameW, frameH]);

  // Redraw whenever transform changes
  useEffect(() => {
    if (!img || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.clearRect(0, 0, frameW, frameH);
    ctx.save();
    if (circular) {
      ctx.beginPath();
      ctx.arc(frameW / 2, frameH / 2, Math.min(frameW, frameH) / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    }
    ctx.translate(frameW / 2 + offset.x, frameH / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  }, [img, scale, rotation, offset, frameW, frameH, circular]);

  // Ratio between canvas pixels and displayed CSS pixels
  function pixelRatio() {
    if (!canvasRef.current) return 1;
    return frameW / canvasRef.current.getBoundingClientRect().width;
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
    if (!dragRef.current || !img) return;
    const r = pixelRatio();
    const next = {
      x: dragRef.current.startOffsetX + (clientX - dragRef.current.startClientX) * r,
      y: dragRef.current.startOffsetY + (clientY - dragRef.current.startClientY) * r,
    };
    setOffset(clampOffset(next, img.width, img.height, scale, frameW, frameH, rotation));
  }

  function endDrag() {
    dragRef.current = null;
  }

  function reset() {
    if (!img) return;
    setScale(minCoverScale(img.width, img.height, frameW, frameH, 0));
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  }

  function confirm() {
    canvasRef.current?.toBlob(
      (blob) => { if (blob) onConfirm(blob); },
      // A circular crop needs alpha for the corners, so PNG; the banner stays
      // JPEG because it is a full-bleed rectangle and compresses far better.
      circular ? "image/png" : "image/jpeg",
      0.92
    );
  }

  // A photo smaller than the frame has no room to zoom — pin the slider rather
  // than render a control with min === max that silently does nothing.
  const zoomLocked = maxScale - minScale < 0.001;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-surface p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-laps-navy">{title}</h3>
          <button type="button" onClick={onCancel} className="rounded-full p-1 text-laps-navy/50 hover:bg-laps-ghost hover:text-laps-navy">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Canvas preview — same aspect as the exported image */}
        <div className={`mb-3 overflow-hidden border border-laps-navy/10 bg-laps-ghost/30 ${circular ? "mx-auto max-w-xs rounded-full" : "rounded-xl"}`}>
          {!img ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-xs text-laps-navy/40">Carregando imagem…</p>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={frameW}
              height={frameH}
              className="w-full cursor-grab select-none touch-none active:cursor-grabbing"
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
            min={minScale}
            max={maxScale}
            step={0.001}
            disabled={zoomLocked}
            displayValue={
              zoomLocked
                ? "Ajuste automático"
                : `${Math.round((scale / minScale) * 100)}%`
            }
            onChange={(v) => setScale(Math.min(maxScale, Math.max(minScale, v)))}
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

        <p className="mb-4 text-center text-[10px] leading-relaxed text-laps-navy/35">
          O zoom vai até o tamanho real da foto — ampliar além disso só perderia
          nitidez. O mínimo mantém a imagem cobrindo todo o quadro.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={confirm}
            disabled={!img}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-laps-accent px-4 py-2 text-xs font-semibold text-white hover:bg-laps-cta disabled:opacity-60"
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
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue?: string;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <div className={disabled ? "opacity-50" : undefined}>
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
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-laps-blue disabled:cursor-not-allowed"
      />
    </div>
  );
}

// ───── Avatar editor ─────

function AvatarEditor({ me, cfg }: { me: MyProfile; cfg: (typeof tierConfig)[Tier] }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editorFile, setEditorFile] = useState<File | null>(null);

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

  // The editor hands back the already-cropped square, so what gets uploaded is
  // exactly what was previewed — no server-side guessing about the focal point.
  function handleEditorConfirm(blob: Blob) {
    const file = new File([blob], "avatar.png", { type: "image/png" });
    setEditorFile(null);
    uploadMutation.mutate(file);
  }

  const busy = uploadMutation.isPending || saveMutation.isPending;

  return (
    <div className="-mt-20 flex flex-col items-start gap-1">
      {editorFile && (
        <ImageTransformEditor
          file={editorFile}
          frameW={AVATAR_CANVAS_SIZE}
          frameH={AVATAR_CANVAS_SIZE}
          title="Ajustar foto de perfil"
          circular
          onConfirm={handleEditorConfirm}
          onCancel={() => setEditorFile(null)}
        />
      )}
      {/* A 2px ring in the tier's own colour instead of a 4px pastel halo plus
          a shadow-xl. The badge that sat in the corner held the same tier glyph
          as the role chip two lines below it. */}
      <div className={`group relative h-36 w-36 shrink-0 rounded-full bg-surface p-1 ring-2 ${cfg.ring}`}>
        {me.photoUrl ? (
          <img src={resolveMediaUrl(me.photoUrl)} alt={me.fullName} className="h-full w-full rounded-full object-cover" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center rounded-full ${cfg.fill} text-4xl font-bold text-white`}>
            {initials(me.fullName)}
          </div>
        )}
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
            if (file) setEditorFile(file);
            // Reset so re-picking the same file still fires onChange.
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

// ───── Contact / links editor ─────

/**
 * Contact rows that carry a per-field public/hidden toggle.
 *
 * `flag` is the server-side visibility column. When it is false the API omits
 * the value from /api/v1/members entirely for anonymous callers — the toggle is
 * real access control, not a CSS-level hide.
 */
const CONTACT_FIELDS = [
  { key: "email",        flag: "showEmail",        label: "Email (login e recuperação) *", placeholder: "seu@email.com",     type: "email" },
  { key: "contactEmail", flag: "showContactEmail", label: "Email de contato (público)",    placeholder: "contato@email.com", type: "email" },
  { key: "linkedinUrl",  flag: "showLinkedin",     label: "LinkedIn",                      placeholder: "https://linkedin.com/in/…" },
  { key: "lattesUrl",    flag: "showLattes",       label: "Lattes",                        placeholder: "http://lattes.cnpq.br/…" },
  { key: "githubUrl",    flag: "showGithub",       label: "GitHub",                        placeholder: "https://github.com/…" },
  { key: "customUrl",    flag: "showCustomUrl",    label: "URL personalizada",             placeholder: "https://seusite.com" },
] as const;

function contactFormFromMe(me: MyProfile) {
  return {
    email: me.email ?? "",
    contactEmail: me.contactEmail ?? "",
    linkedinUrl: me.linkedinUrl ?? "",
    lattesUrl: me.lattesUrl ?? "",
    githubUrl: me.githubUrl ?? "",
    customUrl: me.customUrl ?? "",
    customUrlLabel: me.customUrlLabel ?? "",
    // Fallbacks mirror the column defaults in V19: links are published by
    // default, the login email is not.
    showEmail: me.showEmail ?? false,
    showContactEmail: me.showContactEmail ?? true,
    showLinkedin: me.showLinkedin ?? true,
    showLattes: me.showLattes ?? true,
    showGithub: me.showGithub ?? true,
    showCustomUrl: me.showCustomUrl ?? true,
  };
}

function ContactEditor({ me }: { me: MyProfile }) {
  const qc = useQueryClient();
  const { t } = useLang();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => contactFormFromMe(me));

  const mutation = useMutation({
    mutationFn: () => api.meUpdate(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setEditing(false);
      toast.success(t.portal.saved);
    },
    onError: (err) => toast.error(saveErrorMessage(err, t.portal.errorSave)),
  });

  function patch<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Highlight the card when email is missing — draws attention to the required step
  const needsEmail = !me.email;

  // PUT /me is refused for the whole duration of the temporary password, so
  // offering the form here only led members into filling it in and being told,
  // in English, that they were forbidden. Show the reason and the way out up
  // front instead of letting the API say no.
  const lockedByTempPassword = me.mustChangePassword;

  return (
    <PortfolioCard
      title="CONTATO & LINKS"
      icon={Mail}
      action={
        !editing && !lockedByTempPassword ? (
          <button
            type="button"
            onClick={() => {
              setForm(contactFormFromMe(me));
              setEditing(true);
            }}
            className="inline-flex items-center gap-1 rounded-md border border-laps-navy/15 px-2 py-1 text-[10px] font-semibold text-laps-navy/60 hover:border-laps-blue/30 hover:text-laps-blue"
          >
            <Edit2 className="h-3 w-3" /> Editar
          </button>
        ) : !editing ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-laps-ghost/60 px-2 py-1 text-[10px] font-semibold text-laps-navy/45">
            <Lock className="h-3 w-3" /> Bloqueado
          </span>
        ) : null
      }
    >
      {lockedByTempPassword && !editing && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-laps-blue/25 bg-laps-ghost/50 px-3 py-2">
          <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-laps-blue" />
          <p className="text-[11px] leading-relaxed font-medium text-laps-navy/75">
            Troque a senha temporária primeiro — a edição do perfil é liberada logo em seguida. A
            seção <em>Trocar senha</em> fica no fim da página e não exige email.
          </p>
        </div>
      )}

      {needsEmail && !editing && !lockedByTempPassword && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          <p className="text-[11px] font-medium text-amber-800">
            Cadastre seu email para habilitar a verificação.
          </p>
        </div>
      )}

      {editing ? (
        <div className="space-y-3">
          <p className="rounded-lg bg-laps-ghost/40 px-3 py-2 text-[10px] leading-relaxed text-laps-navy/55">
            Use o <Eye className="inline h-3 w-3" /> para escolher o que aparece no
            seu perfil público. O que estiver oculto não é enviado pela API — some
            de verdade, não só da tela.
          </p>

          {CONTACT_FIELDS.map((f) => (
            <div key={f.key}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
                  {f.label}
                </label>
                <button
                  type="button"
                  onClick={() => patch(f.flag, !form[f.flag])}
                  aria-pressed={form[f.flag]}
                  title={form[f.flag] ? "Visível no perfil público" : "Oculto do perfil público"}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-semibold transition ${
                    form[f.flag]
                      ? "border-laps-blue/25 text-laps-blue hover:bg-laps-ghost"
                      : "border-laps-navy/15 text-laps-navy/40 hover:bg-laps-ghost"
                  }`}
                >
                  {form[f.flag] ? (
                    <>
                      <Eye className="h-3 w-3" /> Visível
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3" /> Oculto
                    </>
                  )}
                </button>
              </div>
              <Input
                type={"type" in f ? f.type : "text"}
                value={form[f.key]}
                onChange={(e) => patch(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="h-9 text-sm"
              />
              {/* The custom link gets an optional caption so it doesn't render
                  as a bare URL on the public profile. */}
              {f.key === "customUrl" && (
                <Input
                  value={form.customUrlLabel}
                  onChange={(e) => patch("customUrlLabel", e.target.value)}
                  placeholder="Nome do link (ex: Meu portfólio, ORCID)"
                  className="mt-1.5 h-8 text-xs"
                />
              )}
            </div>
          ))}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-laps-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-laps-cta disabled:opacity-60"
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
          <InfoRow label="Email" value={me.email} placeholder="Não cadastrado" highlight={needsEmail} hidden={me.showEmail === false} />
          <InfoRow label="Contato" value={me.contactEmail} hidden={me.showContactEmail === false} />
          <InfoRow label="LinkedIn" value={me.linkedinUrl} link hidden={me.showLinkedin === false} />
          <InfoRow label="Lattes" value={me.lattesUrl} link hidden={me.showLattes === false} />
          <InfoRow label="GitHub" value={me.githubUrl} link hidden={me.showGithub === false} />
          <InfoRow
            label={me.customUrlLabel || "Site"}
            value={me.customUrl}
            link
            hidden={me.showCustomUrl === false}
          />
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
  hidden,
}: {
  label: string;
  value: string | null | undefined;
  placeholder?: string;
  link?: boolean;
  highlight?: boolean;
  /** Marks a row the member has hidden from their public profile. */
  hidden?: boolean;
}) {
  if (!value && !placeholder) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="flex w-16 shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-laps-navy/40">
        <span className="truncate">{label}</span>
        {hidden && value && (
          <EyeOff className="h-3 w-3 shrink-0 text-laps-navy/35" aria-label="Oculto do perfil público" />
        )}
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
    onError: (err) => toast.error(saveErrorMessage(err, t.portal.errorSave)),
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
                ? "bg-surface text-laps-blue shadow-sm"
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
            className="w-full rounded-md border border-laps-navy/15 bg-surface px-3 py-2 text-sm text-laps-navy outline-none focus:border-laps-blue/40 focus:ring-2 focus:ring-laps-blue/15"
            placeholder={currentDef.placeholder}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => mutation.mutate(values)}
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-laps-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-laps-cta disabled:opacity-60"
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
    onError: (err) => toast.error(saveErrorMessage(err, t.portal.errorSave)),
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
            className="inline-flex items-center gap-1 rounded-md bg-laps-accent px-2 py-1 text-[10px] font-semibold text-white hover:bg-laps-cta disabled:opacity-60"
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
                className="inline-flex items-center gap-1.5 rounded-sm border border-laps-navy/20 bg-surface px-2 py-0.5 font-mono text-[11px] font-medium text-laps-navy/75"
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
            className="inline-flex items-center gap-1 rounded-sm border border-dashed border-laps-navy/35 px-2 py-0.5 font-mono text-[11px] font-medium text-laps-navy/60 transition-colors hover:border-laps-signal hover:text-laps-signal"
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
                      className="inline-flex items-center gap-1.5 rounded-sm border border-laps-navy/20 bg-surface px-2 py-0.5 font-mono text-[11px] font-medium text-laps-navy/70 transition-colors hover:border-laps-signal hover:text-laps-signal"
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
                  className="rounded-md bg-laps-accent px-3 text-xs font-semibold text-white hover:bg-laps-ink disabled:opacity-60"
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
            className="inline-flex items-center gap-1 rounded-md bg-laps-accent px-2 py-1 text-[10px] font-semibold text-white hover:bg-laps-cta disabled:opacity-60"
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
            className="inline-flex items-center gap-1 rounded-md border border-laps-blue/25 bg-surface px-2 py-1.5 text-xs font-semibold text-laps-blue hover:bg-laps-ghost disabled:opacity-60"
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
    onError: (err) => toast.error(saveErrorMessage(err, t.portal.errorSave)),
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
            className="inline-flex items-center gap-1 rounded-md bg-laps-accent px-2 py-1 text-[10px] font-semibold text-white hover:bg-laps-cta disabled:opacity-60"
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
                    className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.08em] ${levelBadgeClass(entry.level)}`}
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
              className="w-full rounded-md border border-laps-navy/15 bg-surface px-2 py-2 text-xs text-laps-navy focus:outline-none focus:border-laps-blue/40"
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
                  className="w-full rounded-md border border-laps-navy/15 bg-surface px-2 py-2 text-xs text-laps-navy focus:outline-none focus:border-laps-blue/40"
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
                className="flex-1 rounded-md bg-laps-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-laps-ink disabled:opacity-50 transition"
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
            className="inline-flex items-center gap-1 rounded-sm border border-dashed border-laps-navy/35 px-2 py-0.5 font-mono text-[11px] font-medium text-laps-navy/60 transition-colors hover:border-laps-signal hover:text-laps-signal"
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
    onError: (err) => toast.error(saveErrorMessage(err, t.portal.errorSave)),
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
            className="w-full rounded-md border border-laps-navy/15 bg-surface px-3 py-2 text-sm text-laps-navy outline-none focus:border-laps-blue/40 focus:ring-2 focus:ring-laps-blue/15"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => mutation.mutate(value)}
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-laps-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-laps-cta disabled:opacity-60"
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
  myProjectLinks: { projectId: string; role: string; contribution?: string | null }[];
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

// ───── Publications section ─────

const PUB_TYPE_LABELS: Record<PublicationType, string> = {
  JOURNAL: "Periódico",
  CONFERENCE: "Conferência",
  WORKSHOP: "Workshop",
  DISSERTATION: "Dissertação",
  THESIS: "Tese",
};

const PUB_STATUS_LABELS: Record<PublicationStatus, string> = {
  PUBLISHED: "Publicado",
  IN_PRESS: "No prelo",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
};

/**
 * Unlike PROJETOS, this card has no tier lock.
 *
 * Every member may submit a publication, undergraduates included: it is their
 * own authorship of a paper that already exists, not a claim on the lab's
 * project record. What stands in for the role check is the review step — a
 * submission is PENDING until a manager approves it, and the chip on each row
 * is what tells the member which of theirs are live.
 */
function PublicationsSection() {
  const [creating, setCreating] = useState(false);
  const qc = useQueryClient();

  const myPublicationsQuery = useQuery({
    queryKey: ["my-publications"],
    queryFn: () => api.myPublications(),
    staleTime: 10_000,
  });

  const mine = myPublicationsQuery.data ?? [];
  const pendingCount = mine.filter((p) => p.approvalStatus === "PENDING").length;

  return (
    <PortfolioCard title="PUBLICAÇÕES" icon={BookOpen}>
      <div className="space-y-3">
        {myPublicationsQuery.isLoading && (
          <p className="text-sm italic text-laps-navy/45">Carregando…</p>
        )}

        {mine.map((p) => (
          <PublicationRow key={p.id} publication={p} />
        ))}

        {!myPublicationsQuery.isLoading && mine.length === 0 && !creating && (
          <p className="text-sm italic text-laps-navy/45">
            Nenhuma publicação ainda. Envie a primeira abaixo!
          </p>
        )}

        {creating ? (
          <SubmitPublicationForm
            onCancel={() => setCreating(false)}
            onSubmitted={() => {
              setCreating(false);
              qc.invalidateQueries({ queryKey: ["my-publications"] });
              toast.success("Publicação enviada para revisão.");
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-laps-blue/40 py-3 text-sm font-semibold text-laps-blue/70 transition hover:border-laps-blue hover:bg-laps-ghost/20 hover:text-laps-blue"
          >
            <Plus className="h-4 w-4" /> Adicionar publicação
          </button>
        )}

        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-laps-navy/55">
          <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-laps-navy/40" />
          <span>
            Publicações enviadas pelo portal passam por revisão de um gestor antes de aparecerem no
            site público.
            {pendingCount > 0 && <> Você tem {pendingCount} aguardando revisão.</>}
          </span>
        </p>
      </div>
    </PortfolioCard>
  );
}

function PublicationRow({ publication }: { publication: ApiPublication }) {
  const chip =
    publication.approvalStatus === "APPROVED"
      ? { label: "No site", className: "bg-emerald-50 text-emerald-700", Icon: CheckCircle2 }
      : publication.approvalStatus === "REJECTED"
        ? { label: "Recusada", className: "bg-red-50 text-red-700", Icon: X }
        : { label: "Em revisão", className: "bg-amber-50 text-amber-700", Icon: Clock };

  return (
    <div className="rounded-md border border-laps-navy/15 bg-surface p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h4 className="text-sm font-bold text-laps-navy">{publication.title}</h4>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-sm px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.1em] ${chip.className}`}
        >
          <chip.Icon className="h-3 w-3" /> {chip.label}
        </span>
      </div>
      <p className="text-xs text-laps-navy/70">
        {publication.venue} · {publication.year} · {PUB_TYPE_LABELS[publication.type]} ·{" "}
        {PUB_STATUS_LABELS[publication.status]}
      </p>
      {publication.doi && (
        <a
          href={`https://doi.org/${publication.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-[11px] font-medium text-laps-blue hover:underline"
        >
          doi:{publication.doi} ↗
        </a>
      )}
      {/* A rejection with no reason is just a disappearance — show the note. */}
      {publication.approvalStatus === "REJECTED" && (
        <p className="mt-2 rounded-lg border border-red-100 bg-red-50/60 px-2.5 py-2 text-[11px] leading-relaxed text-red-800">
          {publication.reviewNote ?? "Um gestor recusou esta publicação. Fale com a coordenação."}
        </p>
      )}
    </div>
  );
}

function SubmitPublicationForm({
  onCancel,
  onSubmitted,
}: {
  onCancel: () => void;
  onSubmitted: () => void;
}) {
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [type, setType] = useState<PublicationType>("CONFERENCE");
  const [status, setStatus] = useState<PublicationStatus>("PUBLISHED");
  const [doi, setDoi] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      api.meSubmitPublication({
        title: title.trim(),
        venue: venue.trim(),
        year: parseInt(year, 10),
        type,
        status,
        doi: doi.trim() || undefined,
        url: url.trim() || undefined,
      }),
    onSuccess: onSubmitted,
    onError: (err) =>
      setError(
        saveErrorMessage(err, err instanceof ApiError ? err.message : "Erro ao enviar publicação."),
      ),
  });

  const parsedYear = parseInt(year, 10);
  const valid =
    title.trim().length > 0 &&
    venue.trim().length > 0 &&
    Number.isInteger(parsedYear) &&
    parsedYear >= 1900 &&
    parsedYear <= 2100;

  return (
    <div className="rounded-md border border-laps-navy/15 bg-laps-ghost/50 p-4">
      <h4 className="mb-4 text-sm font-bold text-laps-navy">Nova publicação</h4>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
            Título *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do artigo"
            className="h-10 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
            Veículo *
          </label>
          <Input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="Periódico, conferência ou workshop"
            className="h-10 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              Ano *
            </label>
            <Input
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              placeholder="2026"
              className="h-10 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              Tipo *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PublicationType)}
              className="h-10 w-full rounded-md border border-laps-navy/15 bg-surface px-3 text-sm text-laps-navy"
            >
              {(Object.keys(PUB_TYPE_LABELS) as PublicationType[]).map((t) => (
                <option key={t} value={t}>
                  {PUB_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
            Situação
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PublicationStatus)}
            className="h-10 w-full rounded-md border border-laps-navy/15 bg-surface px-3 text-sm text-laps-navy"
          >
            {(Object.keys(PUB_STATUS_LABELS) as PublicationStatus[]).map((s) => (
              <option key={s} value={s}>
                {PUB_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              DOI
            </label>
            <Input
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
              placeholder="10.3390/app15147802"
              className="h-10 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              Link
            </label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="h-10 text-sm"
            />
          </div>
        </div>

        {error && (
          <p className="flex items-start gap-1.5 text-xs text-red-600">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={!valid || mutation.isPending}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-laps-accent py-2.5 text-sm font-semibold text-white transition hover:bg-laps-cta disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {mutation.isPending ? "Enviando…" : "Enviar para revisão"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-laps-navy/15 px-4 py-2.5 text-sm font-semibold text-laps-navy/70 transition hover:bg-laps-ghost/40"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
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
    <div className="rounded-md border border-laps-navy/15 bg-surface p-4 transition-colors hover:border-laps-navy/35 hover:bg-laps-ghost/50">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h4 className="text-sm font-bold text-laps-navy">
          {project.titlePt || project.titleEn || project.slug}
        </h4>
        <span
          className={`shrink-0 rounded-sm px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.1em] ${
            project.status === "ACTIVE"
              ? "bg-laps-accent/10 text-laps-blue"
              : "bg-laps-ink/10 text-laps-navy"
          }`}
        >
          {project.status === "ACTIVE" ? "Ativo" : "Concluído"}
        </span>
      </div>
      {myLink && myLink.role !== "RESEARCHER" && (
        <div className="mb-2 inline-flex rounded-sm border border-laps-navy/20 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-laps-navy/70">
          {roleLabel}
        </div>
      )}
      {project.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-laps-light/40 bg-surface px-1.5 py-0.5 text-[9px] font-semibold text-laps-navy/70"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {project.descriptionPt && (
        <p className="text-xs leading-relaxed text-laps-navy/70">{project.descriptionPt}</p>
      )}
      {myLink?.contribution && (
        <p className="mt-2 rounded-lg border border-laps-navy/10 bg-laps-ghost/30 px-2.5 py-2 text-[11px] leading-relaxed text-laps-navy/70">
          <span className="font-bold uppercase tracking-wider text-laps-navy/50">O que você fez: </span>
          {myLink.contribution}
        </p>
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
  const [myContribution, setMyContribution] = useState("");
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
        myContribution: myContribution || undefined,
      }),
    onSuccess: onCreated,
    onError: (err) =>
      setError(
        saveErrorMessage(err, err instanceof ApiError ? err.message : "Erro ao criar projeto."),
      ),
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
    <div className="rounded-md border border-laps-navy/15 bg-laps-ghost/50 p-4">
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
            className="w-full rounded-md border border-laps-navy/15 bg-surface px-3 py-2 text-sm text-laps-navy outline-none focus:border-laps-blue/40 focus:ring-2 focus:ring-laps-blue/15"
          />
        </div>

        {/* Own contribution */}
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
            O que você fez neste projeto?
          </label>
          <textarea
            value={myContribution}
            onChange={(e) => setMyContribution(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="Sua contribuição — aparece no seu perfil público"
            className="w-full rounded-md border border-laps-navy/15 bg-surface px-3 py-2 text-sm text-laps-navy outline-none focus:border-laps-blue/40 focus:ring-2 focus:ring-laps-blue/15"
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
              className="w-full rounded-md border border-laps-navy/15 bg-surface px-2 py-2 text-sm text-laps-navy"
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
              className="rounded-md border border-laps-blue/25 bg-surface px-2 text-xs font-semibold text-laps-blue hover:bg-laps-ghost"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          {tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded border border-laps-light/40 bg-surface px-1.5 py-0.5 text-[9px] font-semibold text-laps-navy/70"
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
              className="w-full rounded-md border border-laps-navy/15 bg-surface px-2 py-2 text-sm text-laps-navy"
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
            className="inline-flex items-center gap-1.5 rounded-md bg-laps-accent px-4 py-2 text-xs font-semibold text-white hover:bg-laps-cta disabled:opacity-60"
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
  myProjectLinks: { projectId: string; role: string; contribution?: string | null }[];
}) {
  const qc = useQueryClient();
  type Link = { projectId: string; role: string; contribution?: string | null };
  const [pending, setPending] = useState<Link[] | null>(null);
  const editable = pending ?? myProjectLinks.map((l) => ({ ...l }));

  const mutation = useMutation({
    mutationFn: (next: Link[]) => api.updateMyProjects(next),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      setPending(null);
    },
    // A rejected link used to fail silently, leaving the ticked checkbox on
    // screen as if it had been saved.
    onError: (err) => {
      setPending(null);
      toast.error(saveErrorMessage(err, "Não foi possível atualizar seus projetos."));
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
      : [...editable, { projectId: p.id, role: "RESEARCHER", contribution: "" }];
    setPending(next);
  }

  function setContribution(projectId: string, contribution: string) {
    setPending(editable.map((l) => (l.projectId === projectId ? { ...l, contribution } : l)));
  }

  if (linkable.length === 0) return <p className="text-xs text-laps-navy/40">Não há outros projetos para vincular.</p>;

  return (
    <div className="space-y-2">
      {linkable.map((p) => {
        const link = editable.find((l) => l.projectId === p.id);
        const linked = !!link;
        return (
          <div
            key={p.id}
            className={`rounded-lg border p-2.5 transition ${
              linked ? "border-laps-blue/30 bg-laps-ghost/20" : "border-laps-navy/10 bg-surface"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-xs font-medium text-laps-navy/85">
                {p.titlePt || p.titleEn || p.slug}
              </span>
              <button
                type="button"
                onClick={() => toggle(p)}
                className={`shrink-0 rounded-sm px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] transition-colors ${
                  linked
                    ? "border border-red-200 bg-surface text-red-600 hover:bg-red-50"
                    : "border border-laps-blue/25 bg-surface text-laps-blue hover:bg-laps-ghost"
                }`}
              >
                {linked ? "Remover" : "Vincular"}
              </button>
            </div>
            {linked && (
              <textarea
                value={link.contribution ?? ""}
                onChange={(e) => setContribution(p.id, e.target.value)}
                rows={2}
                maxLength={1000}
                placeholder="O que você fez neste projeto?"
                className="mt-2 w-full rounded-md border border-laps-navy/15 bg-surface px-2.5 py-1.5 text-xs text-laps-navy outline-none focus:border-laps-blue/40 focus:ring-2 focus:ring-laps-blue/15"
              />
            )}
          </div>
        );
      })}
      {pending && (
        <button
          type="button"
          onClick={() => mutation.mutate(editable)}
          disabled={mutation.isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-laps-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-laps-cta disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" />
          {mutation.isPending ? "Salvando…" : "Salvar vínculos"}
        </button>
      )}
    </div>
  );
}

// ───── Account ─────

// The order here is not cosmetic. These steps used to be listed email-first,
// which is the order that cannot work: PUT /me is closed while the temporary
// password is live, so "cadastre seu email e salve" answered with a 403 the
// member had no way to interpret. Password first is the only sequence the API
// permits — see PasswordChangeCard and MyPortalController.changePassword.
function FirstLoginBanner({ hasEmail }: { hasEmail: boolean }) {
  return (
    <section className="rounded-md border border-laps-navy/15 bg-laps-ghost/50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-laps-accent/15 text-laps-blue">
          <KeyRound className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-laps-navy">
            Bem-vindo(a)! Você está usando uma senha temporária.
          </h2>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-laps-navy/70">
            <li className="font-semibold text-laps-blue">
              Defina sua senha pessoal na seção <em>Trocar senha</em>, no fim da página.
            </li>
            <li className={hasEmail ? "line-through opacity-60" : ""}>
              Depois, cadastre seu email em <em>Contato &amp; Links</em>.
            </li>
            <li>Peça o código de 6 dígitos e confirme com o que chegar no email.</li>
          </ol>
          <p className="mt-2 rounded-lg bg-surface/70 px-2.5 py-1.5 text-[11px] leading-relaxed text-laps-navy/60">
            O email só pode ser salvo <strong>depois</strong> da troca de senha — até lá o perfil
            fica bloqueado para edição.
          </p>
        </div>
      </div>
    </section>
  );
}

function EmailVerificationBanner({ me }: { me: MyProfile }) {
  return (
    <section className="rounded-md border-l-2 border-l-laps-signal border-y border-r border-y-laps-navy/15 border-r-laps-navy/15 bg-surface p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Mail className="h-4 w-4" />
        </div>
        <div className="flex-1">
          {/* This heading used to read "Verifique seu email para liberar a troca
              de senha" unconditionally — which is false during the temp-password
              phase, and pointed members at a step the API blocks. Verification
              gates *voluntary* changes later on; the first rotation never
              needed it. */}
          <h2 className="text-sm font-bold text-amber-900">
            {me.mustChangePassword
              ? "Depois de trocar a senha, verifique seu email"
              : "Verifique seu email para liberar a troca de senha"}
          </h2>
          <p className="mt-1 text-xs text-amber-900/70">
            {me.mustChangePassword
              ? "Comece pela seção «Trocar senha». Só depois disso o perfil é liberado para salvar o email e pedir o código."
              : me.email
                ? "Enviamos um código de 6 dígitos para o seu email — é só digitá-lo para confirmar."
                : "Cadastre um email no formulário de perfil e salve antes de solicitar o código."}
          </p>

          {me.email && <EmailVerificationDialog me={me} />}
        </div>
      </div>
    </section>
  );
}

function PasswordChangeCard({
  emailVerified,
  mustChangePassword,
}: {
  emailVerified: boolean;
  mustChangePassword: boolean;
}) {
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

  // Mirrors the rule in MyPortalController.changePassword: a *voluntary* change
  // needs a verified email, but the first rotation off a temporary password is
  // exempt — it is the member's only way out, and the email cannot be saved
  // before it happens because PUT /me refuses every write while the temp
  // password is live. Gating this card on emailVerified alone deadlocked exactly
  // that case: no email could be registered, so no password could be changed.
  if (!mustChangePassword && !emailVerified) {
    return (
      <section className="relative rounded-2xl border border-laps-navy/10 bg-surface p-6 shadow-sm">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-surface/55" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-laps-ink/8 text-laps-navy/60">
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
    <section
      data-guide="password"
      className={`scroll-mt-24 rounded-2xl border bg-surface p-6 shadow-sm ${
        mustChangePassword ? "border-laps-blue/40 ring-1 ring-laps-blue/15" : "border-laps-navy/10"
      }`}
    >
      <h2 className="font-display mb-1 text-base font-bold text-laps-navy">Trocar senha</h2>
      {mustChangePassword ? (
        <p className="mb-4 text-xs leading-relaxed text-laps-navy/65">
          <strong className="font-semibold text-laps-navy">Comece por aqui.</strong> Digite em
          «Senha atual» a senha temporária que você recebeu e escolha a sua senha definitiva. Você
          <em> não</em> precisa cadastrar o email antes deste passo — o email vem depois.
        </p>
      ) : (
        <p className="mb-4 text-xs text-laps-navy/55">
          Email verificado — defina sua senha pessoal.
        </p>
      )}
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
            className="inline-flex items-center gap-1.5 rounded-md bg-laps-accent px-4 py-2 text-xs font-semibold text-white transition hover:bg-laps-cta disabled:opacity-60"
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
          className="h-10 border-laps-navy/15 bg-surface pr-9 text-sm"
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

// ───── Exchange placement editor ─────
//
// The eight-country list that used to live here has been replaced by the shared
// ExchangePlacementPicker. It was a second, drifting copy of the catalogue in
// exchange-data.ts — and it listed "UK", which is not an ISO 3166-1 code, so a
// member placed in the United Kingdom through this control got a code no flag
// or country lookup could ever resolve.

/**
 * When the member joined LAPS. Member-owned, unlike the exchange country and
 * undergraduate program above: only they know this, so they fill it in.
 *
 * Two granularities, both optional. The month input is `type="month"`, which
 * collects exactly year + month with no day — matching the storage format
 * ("YYYY-MM") byte for byte, so no parsing sits between the two.
 */
function JoinedLapsEditor({ me }: { me: MyProfile }) {
  const qc = useQueryClient();
  const { t, lang } = useLang();
  const L = lang as JoinedLang;
  const [editing, setEditing] = useState(false);
  const [month, setMonth] = useState(me.joinedMonth ?? "");
  const [semYear, setSemYear] = useState(() => me.joinedSemester?.split(".")[0] ?? "");
  const [semTerm, setSemTerm] = useState(() => me.joinedSemester?.split(".")[1] ?? "");

  const semester = semYear && semTerm ? `${semYear}.${semTerm}` : "";

  const mutation = useMutation({
    // Empty string clears server-side; null would be read as "not sent".
    mutationFn: () => api.meUpdate({ joinedMonth: month, joinedSemester: semester }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setEditing(false);
      toast.success(t.portal.saved);
    },
    onError: (err) => toast.error(saveErrorMessage(err, t.portal.errorSave)),
  });

  function reset() {
    setMonth(me.joinedMonth ?? "");
    setSemYear(me.joinedSemester?.split(".")[0] ?? "");
    setSemTerm(me.joinedSemester?.split(".")[1] ?? "");
  }

  // A year without a term (or vice versa) can't form a valid "YYYY.N".
  const semesterIncomplete = (!!semYear && !semTerm) || (!semYear && !!semTerm);
  const current = formatJoined(me, L);

  return (
    <PortfolioCard
      title="ENTRADA NO LAPS"
      icon={Calendar}
      action={
        !editing ? (
          <button
            type="button"
            onClick={() => { reset(); setEditing(true); }}
            className="inline-flex items-center gap-1 rounded-md border border-laps-navy/15 px-2 py-1 text-[10px] font-semibold text-laps-navy/60 hover:border-laps-blue/30 hover:text-laps-blue"
          >
            <Edit2 className="h-3 w-3" /> Editar
          </button>
        ) : null
      }
    >
      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              Mês e ano
            </label>
            <Input
              type="month"
              value={month}
              min="2005-01"
              onChange={(e) => setMonth(e.target.value)}
              className="h-9 text-sm"
            />
            <p className="mt-1 text-[10px] text-laps-navy/40">
              Sem dia — apenas o mês em que você começou.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
              Semestre
            </label>
            <div className="flex gap-2">
              <select
                value={semYear}
                onChange={(e) => setSemYear(e.target.value)}
                className="h-9 flex-1 rounded-md border border-laps-navy/15 bg-surface px-2 text-sm text-laps-navy focus:border-laps-blue/40 focus:outline-none"
              >
                <option value="">Ano…</option>
                {semesterYears().map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
              <select
                value={semTerm}
                onChange={(e) => setSemTerm(e.target.value)}
                className="h-9 flex-1 rounded-md border border-laps-navy/15 bg-surface px-2 text-sm text-laps-navy focus:border-laps-blue/40 focus:outline-none"
              >
                <option value="">Período…</option>
                <option value="1">1º semestre</option>
                <option value="2">2º semestre</option>
              </select>
            </div>
            {semesterIncomplete && (
              <p className="mt-1 text-[10px] font-medium text-amber-600">
                Escolha o ano e o período — ou limpe os dois.
              </p>
            )}
          </div>

          <p className="text-[10px] leading-relaxed text-laps-navy/40">
            Preencha o que souber. Os dois campos são opcionais e independentes.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || semesterIncomplete}
              className="inline-flex items-center gap-1.5 rounded-md bg-laps-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-laps-cta disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              {mutation.isPending ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => { reset(); setEditing(false); }}
              className="rounded-md border border-laps-navy/15 px-3 py-1.5 text-xs font-semibold text-laps-navy/70 hover:bg-laps-ghost"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-laps-navy/80">
          {current ?? <span className="italic text-laps-navy/40">Não informado</span>}
        </p>
      )}
    </PortfolioCard>
  );
}

/**
 * Undergraduate course. Read-only for everyone here — it is an institutional
 * fact recorded when the member is registered, so it is set from /admin (which
 * SecurityConfig gates on MANAGER) rather than self-declared, exactly like the
 * exchange country above.
 */
function UndergradProgramCard({ me }: { me: MyProfile }) {
  const { lang } = useLang();
  const program = toProgramCode(me.undergradProgram);
  const meta = program ? UNDERGRAD_PROGRAMS[program] : null;

  return (
    <PortfolioCard title="CURSO DE GRADUAÇÃO" icon={GraduationCap}>
      <div className="flex items-center justify-between gap-2">
        {meta ? (
          <span className={`rounded-md px-2 py-1 text-xs font-semibold ${meta.badge}`}>
            {meta.name[lang as "pt" | "en" | "fr"]}
          </span>
        ) : (
          <span className="text-sm italic text-laps-navy/40">Não informado</span>
        )}
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-laps-ghost/60 px-2 py-1 text-[10px] font-semibold text-laps-navy/45"
          title="Somente gerentes podem alterar o curso de graduação."
        >
          <Lock className="h-3 w-3" /> Gerenciado
        </span>
      </div>
      <p className="mt-2 text-[10px] text-laps-navy/40">
        Definido no cadastro pela coordenação. Fale com um gerente para corrigir.
      </p>
    </PortfolioCard>
  );
}

/** Flag + destination, naming the state when the placement is inside Brazil. */
function PlacementLabel({ me, empty }: { me: MyProfile; empty: string }) {
  if (!me.exchangeCountry) return <span className="italic text-laps-navy/40">{empty}</span>;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3.5 w-5 shrink-0 overflow-hidden rounded-sm shadow-[0_0_0_1px_rgba(0,0,0,0.1)]">
        <DestinationFlag country={me.exchangeCountry} state={me.exchangeState} />
      </span>
      {me.exchangeState
        ? `${brStateName(me.exchangeState)} — ${countryName(me.exchangeCountry, "pt")}`
        : countryName(me.exchangeCountry, "pt")}
    </span>
  );
}

function ExchangeCountryEditor({ me }: { me: MyProfile }) {
  const qc = useQueryClient();
  const { t } = useLang();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<Placement>({
    country: me.exchangeCountry ?? "",
    state: me.exchangeState ?? "",
  });

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
    mutationFn: (next: Placement) =>
      api.admin.updateMember(me.id, {
        exchangeCountry: next.country,
        exchangeState: next.state,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setEditing(false);
      toast.success(t.portal.saved);
    },
    onError: (err) => toast.error(saveErrorMessage(err, t.portal.errorSave)),
  });

  const current = <PlacementLabel me={me} empty={t.portal.noCountry} />;

  // Members see the country their coordinator assigned, but cannot touch it.
  if (!isManager) {
    return (
      <PortfolioCard title={t.portal.exchangeCountry} icon={MapPin}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-laps-navy/80">{current}</span>
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
          <ExchangePlacementPicker value={value} onChange={setValue} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => mutation.mutate(value)}
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-laps-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-laps-cta disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              {mutation.isPending ? "…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setValue({ country: me.exchangeCountry ?? "", state: me.exchangeState ?? "" });
                setEditing(false);
              }}
              className="rounded-md border border-laps-navy/15 px-3 py-1.5 text-xs font-semibold text-laps-navy/70 hover:bg-laps-ghost"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-laps-navy/80">{current}</span>
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
    <div className="rounded-md border border-laps-navy/15 bg-surface p-5">
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
    <div className="flex items-center gap-3 rounded-2xl border border-laps-blue/12 bg-surface p-4">
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
