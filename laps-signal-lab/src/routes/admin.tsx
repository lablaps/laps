import { useMemo, useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Folder,
  Plus,
  Crown,
  Microscope,
  GraduationCap,
  Users,
  Search,
  ArrowUpRight,
  LogOut,
  Loader2,
  Pencil,
  Trash2,
  ArrowUpCircle,
  Save,
  Linkedin,
  ExternalLink,
  X,
  Shield,
  Briefcase,
  Replace,
  KeyRound,
  Copy,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Link2,
  Clock,
  CheckCircle2,
  UserCircle,
} from "lucide-react";
import {
  api,
  ApiError,
  type ApiMember,
  type ApiProject,
  type ProjectStatus,
  type MemberRole,
  type MemberStatusEnum,
} from "@/lib/api";
import { resolveMediaUrl } from "@/lib/api";
import { countryName, brStateName } from "@/lib/exchange-data";
import {
  ExchangePlacementPicker,
  type Placement,
} from "@/components/ExchangePlacementPicker";
import { UNDERGRAD_PROGRAMS, UNDERGRAD_PROGRAM_ORDER } from "@/lib/undergrad-programs";
import { DestinationFlag } from "@/lib/flags";
import { searchMembers } from "@/lib/member-search";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { initials } from "@/lib/team-data";
import lapsLogo from "@/assets/laps-logo2.png";
import LapsLogoMono from "@/components/LapsLogoMono";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Administração — LAPS" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const TIER_META: Record<
  MemberRole,
  { label: string; Icon: typeof Crown; accent: string; chip: string }
> = {
  HEAD: { label: "Head", Icon: Crown, accent: "text-laps-blue", chip: "bg-laps-ghost text-laps-blue" },
  COORDINATOR: { label: "Coordenador", Icon: Shield, accent: "text-violet-700", chip: "bg-violet-50 text-violet-700" },
  MANAGER: { label: "Gerenciador", Icon: Briefcase, accent: "text-purple-700", chip: "bg-purple-50 text-purple-700" },
  DOCTORATE: { label: "Doutorando", Icon: Microscope, accent: "text-laps-blue", chip: "bg-blue-50 text-laps-blue" },
  MASTER: { label: "Mestrando", Icon: GraduationCap, accent: "text-emerald-600", chip: "bg-emerald-50 text-emerald-700" },
  UNDERGRAD: { label: "Graduação", Icon: Users, accent: "text-amber-600", chip: "bg-amber-50 text-amber-700" },
};

// Canonical role order — used in the change-role dropdown so the manager
// always sees roles top-to-bottom.
const ROLE_ORDER: MemberRole[] = ["HEAD", "COORDINATOR", "MANAGER", "DOCTORATE", "MASTER", "UNDERGRAD"];

const STATUS_META: Record<MemberStatusEnum, { label: string; dot: string }> = {
  ACTIVE: { label: "Ativo", dot: "bg-emerald-500" },
  COMPLETED: { label: "Concluído", dot: "bg-slate-400" },
  INACTIVE: { label: "Inativo", dot: "bg-rose-500" },
};

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading, isManager, member } = useAuth();

  // The backend enforces MANAGER; this is just to keep the UI honest before redirecting.
  if (!authLoading && (!isAuthenticated || !isManager)) {
    if (typeof window !== "undefined") {
      navigate({ to: "/login" });
    }
    return null;
  }

  const membersQuery = useQuery({
    // Distinct from the public ["members"] key: the same endpoint returns an
    // unredacted payload for MANAGER callers, so sharing one cache entry across
    // auth states served the admin UI a redacted roster (blank emails).
    queryKey: ["admin", "members"],
    queryFn: () => api.members(),
    staleTime: 30_000,
  });

  // Auth-state-per-member: needed to show "still on temp password" badges and
  // to gate the credentials reveal in MemberCard. One round trip serves the
  // whole list — refetch when the admin re-saves a member.
  const authStatusQuery = useQuery({
    queryKey: ["admin", "auth-status"],
    queryFn: () => api.admin.authStatus(),
    staleTime: 10_000,
  });
  const authStatusMap = useMemo(() => {
    const map = new Map<string, { mustChangePassword: boolean; emailVerified: boolean }>();
    for (const row of authStatusQuery.data ?? []) {
      map.set(row.memberId, {
        mustChangePassword: row.mustChangePassword,
        emailVerified: row.emailVerified,
      });
    }
    return map;
  }, [authStatusQuery.data]);

  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<MemberRole | "ALL">("ALL");
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);

  const members = membersQuery.data?.content ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (m.deletedAt) return false;
      if (tierFilter !== "ALL" && m.currentRole !== tierFilter) return false;
      if (!q) return true;
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q) ||
        (m.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [members, query, tierFilter]);

  const tierCounts = useMemo(() => {
    const counts: Record<MemberRole, number> = {
      HEAD: 0,
      COORDINATOR: 0,
      MANAGER: 0,
      DOCTORATE: 0,
      MASTER: 0,
      UNDERGRAD: 0,
    };
    for (const m of members) {
      if (m.deletedAt) continue;
      counts[m.currentRole] = (counts[m.currentRole] ?? 0) + 1;
    }
    return counts;
  }, [members]);

  async function onLogout() {
    try { await api.logout(); } catch { /* ignore */ }
    await queryClient.invalidateQueries({ queryKey: ["me"] });
    navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-laps-ghost/30 via-white to-white text-laps-navy">
      <header className="sticky top-0 z-30 border-b border-laps-navy/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
          <img src={lapsLogo} alt="LAPS" className="h-8 w-auto" />
          <span className="rounded-full bg-laps-ghost px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-laps-blue">
            Gerenciar
          </span>
          <div className="ml-auto flex items-center gap-3">
            {/* Return leg of the portal ↔ console switch. A manager is also a
                member with a portfolio of their own, so the console is a place
                they pass through rather than a terminus. */}
            <Link
              to="/portal"
              className="inline-flex items-center gap-1.5 rounded-md border border-laps-blue/25 bg-laps-ghost px-3 py-1.5 text-xs font-semibold text-laps-blue transition hover:bg-laps-blue/10"
            >
              <UserCircle className="h-3.5 w-3.5" /> Meu portfólio
            </Link>
            <a
              href="/team"
              className="hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-laps-navy/60 transition hover:text-laps-blue md:inline-flex"
            >
              Ver grafo público da equipe <ExternalLink className="h-3 w-3" />
            </a>
            {member && (
              <div className="hidden text-right md:block">
                <div className="text-xs font-semibold text-laps-navy">{member.fullName}</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-laps-navy/45">{member.email}</div>
              </div>
            )}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-md border border-laps-navy/15 px-3 py-1.5 text-xs font-semibold text-laps-navy/70 transition hover:border-laps-blue hover:text-laps-blue"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Hero — animated white LAPS logo, centered on a dark backdrop. */}
      <section
        className="relative overflow-hidden border-b border-laps-navy/10 py-14"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #0B4E8D 0%, #193A59 55%, #0F2A42 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-[0.07] [background:radial-gradient(circle_at_1px_1px,#74B5F2_1px,transparent_0)_0_0/22px_22px]" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 px-6 md:flex-row md:gap-10">
          <div className="flex w-full max-w-[260px] shrink-0 items-center justify-center md:max-w-[280px]">
            <LapsLogoMono />
          </div>

          {/* Divider — horizontal accent on mobile, vertical hairline on desktop. */}
          <div
            aria-hidden
            className="h-px w-24 bg-gradient-to-r from-transparent via-laps-light/45 to-transparent md:h-24 md:w-px md:bg-gradient-to-b"
          />

          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-laps-light/65">
              Interno · UEMA
            </span>
            <h1 className="font-display mt-2 text-2xl font-bold leading-[1.05] tracking-tight text-white md:text-[28px]">
              Central de Comando
            </h1>
            <p className="mt-3 max-w-[18rem] text-[12px] leading-relaxed text-white/55">
              Equipe, funções e publicações — cada alteração é refletida no
              grafo público da equipe instantaneamente.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1400px] px-6 py-10">
        {/* Stat cards */}
        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {ROLE_ORDER.map((role) => {
            const meta = TIER_META[role];
            return (
              <div
                key={role}
                className="rounded-2xl border border-laps-light/25 bg-white p-5 shadow-[0_2px_20px_rgba(25,58,89,0.05)]"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-laps-navy/55">
                  <meta.Icon className={`h-4 w-4 ${meta.accent}`} /> {meta.label}
                </div>
                <div className={`font-display mt-3 text-3xl font-bold ${meta.accent}`}>
                  {tierCounts[role]}
                </div>
              </div>
            );
          })}
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] items-start gap-10">
          <div className="min-w-0">
            {/* Filter bar */}
            <section className="mb-6 flex flex-wrap items-center gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-laps-navy/40" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nome, slug ou email…"
                  className="h-11 border-laps-navy/15 bg-white pl-10 text-sm focus-visible:ring-laps-blue"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 rounded-md border border-laps-navy/10 bg-white p-1 text-xs font-semibold">
                {(["ALL", ...ROLE_ORDER] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setTierFilter(opt as MemberRole | "ALL")}
                    className={`rounded px-3 py-1.5 transition ${tierFilter === opt
                        ? "bg-laps-blue text-white shadow-sm"
                        : "text-laps-navy/65 hover:bg-laps-ghost/60"
                      }`}
                  >
                    {opt === "ALL"
                      ? `Todos (${members.filter((m) => !m.deletedAt).length})`
                      : `${TIER_META[opt as MemberRole].label} (${tierCounts[opt as MemberRole] ?? 0})`}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setInviting(true)}
                className="inline-flex items-center gap-2 rounded-md border border-laps-blue/30 bg-laps-ghost px-4 py-2.5 text-xs font-bold text-laps-blue transition hover:bg-laps-blue/10"
              >
                <Link2 className="h-4 w-4" /> Gerar convite
              </button>
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="inline-flex items-center gap-2 rounded-md bg-laps-blue px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-laps-navy"
              >
                <Plus className="h-4 w-4" /> Novo membro
              </button>
            </section>

            <PublicationApprovalSection />

            {/* Member grid */}
            <section>
              {membersQuery.isLoading && (
                <div className="flex items-center justify-center py-20 text-laps-navy/55">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando equipe…
                </div>
              )}
              {membersQuery.isError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  Não foi possível carregar a equipe.
                </div>
              )}
              {!membersQuery.isLoading && filtered.length === 0 && (
                <div className="rounded-lg border border-laps-navy/10 bg-white p-10 text-center text-sm text-laps-navy/55">
                  Nenhum membro corresponde ao filtro atual.
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {filtered.map((m) => (
                  <MemberCard key={m.id} member={m} authStatus={authStatusMap.get(m.id)} />
                ))}
              </div>
            </section>
          </div>
          <ProjectSection />
        </div>
      </main>

      {creating && (
        <CreateMemberDialog
          onClose={() => setCreating(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["members"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
            queryClient.invalidateQueries({ queryKey: ["graph"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "auth-status"] });
          }}
        />
      )}
      {inviting && <InviteDialog onClose={() => setInviting(false)} />}
    </div>
  );
}

// ───── CreateMemberDialog ─────
// One-input flow: admin types the full name, we derive the slug + temp
// password automatically and show the generated credentials so the admin
// can hand them off. Role is optional (defaults to UNDERGRAD) since most
// new accounts start there.

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function CreateMemberDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<MemberRole>("UNDERGRAD");
  const [result, setResult] = useState<{
    member: ApiMember;
    tempPassword: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"user" | "pwd" | null>(null);

  const slug = useMemo(() => slugify(fullName), [fullName]);

  const mutation = useMutation({
    mutationFn: () =>
      api.admin.createMember({
        slug,
        fullName: fullName.trim(),
        currentRole: role,
      }),
    onSuccess: (res) => {
      setResult(res);
      onCreated();
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Falha ao criar membro.");
    },
  });

  async function copy(label: "user" | "pwd", value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied((cur) => (cur === label ? null : cur)), 1400);
    } catch {
      /* clipboard may be blocked */
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md overflow-hidden rounded-2xl border border-laps-blue/15 bg-white p-0">
        <DialogTitle className="sr-only">Novo membro</DialogTitle>

        {!result ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              if (!fullName.trim()) {
                setError("Digite o nome completo.");
                return;
              }
              if (!slug) {
                setError("Não foi possível gerar um nome de usuário válido.");
                return;
              }
              mutation.mutate();
            }}
            className="flex flex-col gap-4 p-6"
          >
            <div>
              <h2 className="font-display text-base font-bold text-laps-navy">
                Adicionar novo membro
              </h2>
              <p className="mt-1 text-xs text-laps-navy/55">
                Digite o nome completo — o sistema gera usuário e senha temporária automaticamente.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
                Nome completo
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ex: João da Silva"
                autoFocus
                className="h-10 border-laps-navy/15 bg-white text-sm"
              />
              {slug && (
                <p className="mt-1.5 text-[11px] text-laps-navy/60">
                  Usuário gerado: <code className="rounded bg-laps-ghost/60 px-1.5 py-0.5 font-mono text-laps-blue">{slug}</code>
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
                Nível
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["UNDERGRAD", "MASTER", "DOCTORATE", "HEAD"] as MemberRole[]).map((r) => {
                  const meta = TIER_META[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-semibold transition ${role === r
                          ? "border-laps-blue bg-laps-blue text-white"
                          : "border-laps-navy/10 bg-white text-laps-navy/70 hover:border-laps-blue/30"
                        }`}
                    >
                      <meta.Icon className="h-3.5 w-3.5" />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-700">{error}</p>
            )}

            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-laps-navy/15 bg-white px-4 py-2 text-xs font-semibold text-laps-navy/70 hover:bg-laps-ghost"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-md bg-laps-blue px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-laps-navy disabled:opacity-60"
              >
                {mutation.isPending ? "Criando…" : "Criar membro"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-base font-bold text-laps-navy">
                  {result.member.fullName} criado(a)
                </h2>
                <p className="mt-1 text-xs text-laps-navy/55">
                  Copie as credenciais abaixo e envie ao membro pela conversa privada
                  combinada. A senha deixa de funcionar no momento em que ele rotacionar.
                </p>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-laps-blue/20 bg-laps-ghost/40 p-3">
              <CredRow
                label="Usuário"
                value={result.member.slug}
                copied={copied === "user"}
                onCopy={() => copy("user", result.member.slug)}
              />
              {result.tempPassword && (
                <CredRow
                  label="Senha temporária"
                  value={result.tempPassword}
                  copied={copied === "pwd"}
                  onCopy={() => copy("pwd", result.tempPassword!)}
                />
              )}
              <CredRow
                label="Portal"
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/portal`}
                copied={false}
                onCopy={() => copy("user", `${window.location.origin}/portal`)}
              />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="self-end rounded-md bg-laps-blue px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-laps-navy"
            >
              Concluído
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CredRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <code className="rounded bg-white px-2 py-1 font-mono text-[11px] text-laps-navy">
          {value}
        </code>
        <button
          type="button"
          onClick={onCopy}
          className="rounded p-1 text-laps-navy/55 transition hover:bg-laps-ghost hover:text-laps-blue"
          aria-label="Copy"
        >
          {copied ? <ShieldCheck className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}

// ───── InviteDialog ─────

const INVITE_ROLES: { value: MemberRole; label: string }[] = [
  { value: "UNDERGRAD", label: "Graduação" },
  { value: "MASTER", label: "Mestrado" },
  { value: "DOCTORATE", label: "Doutorado" },
  { value: "COORDINATOR", label: "Coordenador" },
];

function InviteDialog({ onClose }: { onClose: () => void }) {
  const [role, setRole] = useState<MemberRole>("UNDERGRAD");
  const [validityDays, setValidityDays] = useState(14);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.admin.createInvite({ role, validityDays }),
    onSuccess: (data) => {
      const link = `${window.location.origin}/join/${data.token}`;
      setGeneratedLink(link);
    },
    onError: () => toast.error("Não foi possível gerar o convite."),
  });

  function copyLink() {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-laps-navy/10 bg-white p-6 shadow-[0_8px_40px_rgba(25,58,89,0.15)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-laps-navy">Gerar link de convite</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-laps-navy/40 transition hover:bg-laps-ghost hover:text-laps-navy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!generatedLink ? (
          <div className="space-y-5">
            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-laps-navy/65">
                Função
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INVITE_ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      role === r.value
                        ? "border-laps-blue bg-laps-blue text-white"
                        : "border-laps-navy/15 text-laps-navy/65 hover:border-laps-blue/40 hover:text-laps-blue"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-laps-navy/65">
                Validade
              </label>
              <div className="flex gap-2">
                {[7, 14, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setValidityDays(d)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      validityDays === d
                        ? "border-laps-blue bg-laps-blue text-white"
                        : "border-laps-navy/15 text-laps-navy/65 hover:border-laps-blue/40 hover:text-laps-blue"
                    }`}
                  >
                    {d} dias
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-laps-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-laps-navy disabled:opacity-60"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              Gerar link
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Link gerado com sucesso! Validade: {validityDays} dias.
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-laps-navy/15 bg-laps-ghost/40 px-3 py-2">
              <Link2 className="h-4 w-4 shrink-0 text-laps-blue/60" />
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-laps-navy/70">
                {generatedLink}
              </span>
              <button
                type="button"
                onClick={copyLink}
                className="shrink-0 rounded p-1 text-laps-navy/55 transition hover:bg-white hover:text-laps-blue"
                aria-label="Copiar link"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-laps-navy/50">
              Compartilhe este link com o novo membro. Ele pode ser usado apenas uma vez.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setGeneratedLink(null); mutation.reset(); }}
                className="flex-1 rounded-lg border border-laps-navy/15 px-3 py-2 text-xs font-semibold text-laps-navy/65 transition hover:border-laps-blue hover:text-laps-blue"
              >
                Gerar outro
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg bg-laps-blue px-3 py-2 text-xs font-bold text-white transition hover:bg-laps-navy"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ───── MemberCard ─────

function MemberCard({
  member,
  authStatus,
}: {
  member: ApiMember;
  authStatus?: { mustChangePassword: boolean; emailVerified: boolean };
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  // Fan out invalidation across every cache the public site reads from.
  // /team's TeamGraph reads ["members"]; the dialog page does its own loader
  // call but TanStack Router re-runs loaders on next navigation.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["members"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["graph"] });
    queryClient.invalidateQueries({ queryKey: ["member", member.id] });
    queryClient.invalidateQueries({ queryKey: ["member", member.slug] });
    queryClient.invalidateQueries({ queryKey: ["admin", "auth-status"] });
  };

  const deleteMutation = useMutation({
    mutationFn: () => api.admin.deleteMember(member.id),
    onSuccess: invalidate,
  });

  const meta = TIER_META[member.currentRole];
  const status = STATUS_META[member.status];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-laps-light/20 bg-white shadow-[0_2px_20px_rgba(25,58,89,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-12px_rgba(11,78,141,0.18)]">
      {/* Header band */}
      <div className="flex items-start justify-between gap-3 border-b border-laps-light/15 bg-gradient-to-b from-laps-ghost/40 to-white px-4 py-3">
        <div className="min-w-0">
          <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${meta.chip}`}>
            <meta.Icon className="h-3 w-3" /> {meta.label}
          </div>
          <h3 className="mt-2 truncate text-sm font-bold text-laps-navy" title={member.fullName}>
            {member.fullName}
          </h3>
          <div className="mt-0.5 truncate text-[11px] text-laps-navy/55" title={member.slug}>
            /{member.slug}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-laps-navy/55">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </div>
          {member.exchangeCountry && (
            <div
              className="flex items-center gap-1 rounded-full border border-laps-blue/20 bg-laps-ghost/60 px-2 py-0.5"
              title={
                member.exchangeState
                  ? `${brStateName(member.exchangeState)} · ${countryName(member.exchangeCountry, "pt")}`
                  : countryName(member.exchangeCountry, "pt")
              }
            >
              <span className="inline-block h-3 w-5 overflow-hidden rounded-sm">
                <DestinationFlag
                  country={member.exchangeCountry}
                  state={member.exchangeState}
                />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-laps-blue">
                Intercambista
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 px-4 py-3 text-[12px] text-laps-navy/70">
        <Detail label="Email" value={member.email ?? "—"} />
        <Detail label="Desde" value={member.currentRoleStartedAt ?? "—"} />
        {member.linkedinUrl && (
          <Detail
            label="LinkedIn"
            value={
              <a href={member.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-laps-blue hover:underline">
                Perfil <ArrowUpRight className="h-3 w-3" />
              </a>
            }
          />
        )}
      </div>

      {/* Auth state + credentials reveal */}
      <CredentialsPanel member={member} authStatus={authStatus} />

      {/* Actions — edit covers promote + project links, so a single primary action keeps the UI honest. */}
      <div className="grid grid-cols-2 gap-1.5 border-t border-laps-light/15 bg-laps-ghost/20 p-2 text-[11px] font-semibold">
        <ActionButton onClick={() => setEditing(true)} icon={<Pencil className="h-3.5 w-3.5" />}>
          Editar perfil
        </ActionButton>
        <ActionButton
          onClick={() => {
            if (window.confirm(`Arquivar ${member.fullName}? Isso o oculta do grafo público da equipe, mas mantém o histórico.`)) {
              deleteMutation.mutate();
            }
          }}
          icon={<Trash2 className="h-3.5 w-3.5" />}
          tone="danger"
          loading={deleteMutation.isPending}
        >
          Excluir
        </ActionButton>
      </div>

      {editing && (
        <EditPanel member={member} onClose={() => setEditing(false)} onSaved={invalidate} />
      )}
    </article>
  );
}

// ───── CredentialsPanel ─────
// Surfaces a member's login username, their portal URL, and (only while
// they're still on the deterministic temp password) the temp credential
// the admin can hand over. The reveal is opt-in so a shoulder-surfer can't
// pick passwords off a public laptop screen.

function CredentialsPanel({
  member,
  authStatus,
}: {
  member: ApiMember;
  authStatus?: { mustChangePassword: boolean; emailVerified: boolean };
}) {
  const [copied, setCopied] = useState<"user" | "pwd" | "url" | null>(null);

  const portalUrl =
    typeof window !== "undefined" ? `${window.location.origin}/portal` : "/portal";

  // Temp passwords are random and hashed, so there is nothing to "reveal" —
  // the only way to produce a known credential is to mint a new one. This is a
  // mutation, not a query: it changes the member's password every time it runs.
  const resetMutation = useMutation({
    mutationFn: () => api.admin.resetPassword(member.id),
    onError: () => toast.error("Falha ao redefinir a senha. Tente novamente."),
  });

  async function copy(label: "user" | "pwd" | "url", value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied((cur) => (cur === label ? null : cur)), 1400);
    } catch {
      /* clipboard may be blocked in some browsers / non-HTTPS contexts */
    }
  }

  const rotated = !authStatus?.mustChangePassword;
  const emailVerified = !!authStatus?.emailVerified;

  return (
    <div className="border-t border-laps-light/15 bg-white px-4 py-2.5 text-[11px]">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${rotated
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-800"
            }`}
          title={
            rotated
              ? "Member rotated their temp password"
              : "Member is still using the deterministic temp password"
          }
        >
          {rotated ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
          {rotated ? "Senha rotacionada" : "Senha temporária ativa"}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${emailVerified ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}
        >
          <Mail className="h-3 w-3" />
          {emailVerified ? "Email verificado" : "Email não verificado"}
        </span>
      </div>

      <dl className="mt-2 grid gap-1">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-laps-navy/55">
            Usuário
          </dt>
          <dd className="flex items-center gap-1">
            <code className="rounded bg-laps-ghost/60 px-1.5 py-0.5 font-mono text-[10px] text-laps-navy">
              {member.slug}
            </code>
            <CopyBtn copied={copied === "user"} onClick={() => copy("user", member.slug)} />
          </dd>
        </div>

        <div className="flex items-center justify-between gap-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-laps-navy/55">
            Portal
          </dt>
          <dd className="flex items-center gap-1">
            <a
              href="/portal"
              className="rounded bg-laps-ghost/60 px-1.5 py-0.5 font-mono text-[10px] text-laps-blue hover:underline"
            >
              /portal
            </a>
            <CopyBtn copied={copied === "url"} onClick={() => copy("url", portalUrl)} />
          </dd>
        </div>

        <div className="mt-1 rounded-lg border border-amber-200 bg-amber-50/60 px-2 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
              <KeyRound className="h-3 w-3" />
              Senha
            </dt>
            <dd className="flex items-center gap-1">
              {resetMutation.data ? (
                <>
                  <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-amber-900">
                    {resetMutation.data.tempPassword}
                  </code>
                  <CopyBtn
                    copied={copied === "pwd"}
                    onClick={() => copy("pwd", resetMutation.data!.tempPassword)}
                  />
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => resetMutation.mutate()}
                  disabled={resetMutation.isPending}
                  className="rounded-md border border-amber-300 bg-white px-2 py-1 text-[10px] font-semibold text-amber-900 transition hover:bg-amber-100 disabled:opacity-60"
                >
                  {resetMutation.isPending ? "Gerando…" : "Redefinir senha"}
                </button>
              )}
            </dd>
          </div>

          {resetMutation.data && (
            <p className="mt-1.5 text-[10px] leading-snug text-amber-900">
              Copie agora — esta senha não pode ser recuperada depois. Se fechar
              esta tela sem copiar, será preciso redefinir de novo.
            </p>
          )}
        </div>
      </dl>

      <p className="mt-1.5 text-[10px] leading-snug text-laps-navy/55">
        {rotated
          ? "O membro já definiu a própria senha. Redefinir só é necessário se perder o acesso."
          : "Compartilhe usuário + senha pela mesma conversa privada. O membro deve trocá-la no primeiro acesso."}
      </p>
    </div>
  );
}

function CopyBtn({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded p-1 text-laps-navy/55 transition hover:bg-laps-ghost hover:text-laps-blue"
      aria-label="Copy to clipboard"
    >
      {copied ? <ShieldCheck className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-14 shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-laps-navy/40">
        {label}
      </span>
      <span className="min-w-0 flex-1 truncate">{value}</span>
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  children,
  tone = "default",
  loading,
  disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  tone?: "default" | "danger";
  loading?: boolean;
  disabled?: boolean;
}) {
  const isDanger = tone === "danger";
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${isDanger
          ? "text-rose-600 hover:bg-rose-50"
          : "text-laps-navy/70 hover:bg-white hover:text-laps-blue"
        }`}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
      {children}
    </button>
  );
}

// ───── Helpers ─────
const tierConfig: Record<
  MemberRole,
  { gradient: string; ring: string; chip: string; Icon: typeof Crown }
> = {
  HEAD: {
    gradient: "from-laps-navy to-laps-blue",
    ring: "ring-laps-light/40",
    chip: "bg-gradient-to-r from-laps-navy to-laps-blue text-white",
    Icon: Crown,
  },
  COORDINATOR: {
    gradient: "from-violet-700 to-violet-400",
    ring: "ring-violet-200",
    chip: "bg-violet-50 text-violet-700",
    Icon: Shield,
  },
  MANAGER: {
    gradient: "from-purple-600 to-purple-300",
    ring: "ring-purple-200",
    chip: "bg-purple-50 text-purple-700",
    Icon: Briefcase,
  },
  DOCTORATE: {
    gradient: "from-laps-blue to-laps-light",
    ring: "ring-laps-blue/30",
    chip: "bg-laps-ghost text-laps-blue",
    Icon: Microscope,
  },
  MASTER: {
    gradient: "from-emerald-500 to-emerald-300",
    ring: "ring-emerald-200",
    chip: "bg-emerald-50 text-emerald-700",
    Icon: GraduationCap,
  },
  UNDERGRAD: {
    gradient: "from-amber-400 to-amber-200",
    ring: "ring-amber-200",
    chip: "bg-amber-50 text-amber-700",
    Icon: Users,
  },
};

// ───── Edit dialog ─────
// Mirrors team.$personId.tsx visual layout (left = identity, right = content)
// but every field is editable. Save invalidates ["members"]/["projects"]/["graph"]
// so /team and the landing page reflect changes instantly.

function EditPanel({
  member,
  onClose,
  onSaved,
}: {
  member: ApiMember;
  onClose: () => void;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(member.fullName);
  const [email, setEmail] = useState(member.email ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(member.linkedinUrl ?? "");
  const [lattesUrl, setLattesUrl] = useState(member.lattesUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(member.githubUrl ?? "");
  const [photoUrl, setPhotoUrl] = useState(member.photoUrl ?? "");
  // Bio is single-source: managers type PT, the backend auto-translates to
  // EN/FR on save (see TranslationService). The two extra textareas were
  // removed because most managers don't speak fluent EN/FR.
  const [bioPt, setBioPt] = useState(member.bioPt ?? "");
  const [status, setStatus] = useState<MemberStatusEnum>(member.status);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const photoUpload = useMutation({
    mutationFn: (file: File) => api.admin.uploadMemberPhoto(file),
    onSuccess: ({ url }) => {
      setPhotoUrl(url);
      setUploadError(null);
    },
    onError: (err) => {
      setUploadError(err instanceof ApiError ? err.message : "Falha ao enviar foto.");
    },
  });

  const [toRole, setToRole] = useState<MemberRole>(member.currentRole);
  const [placement, setPlacement] = useState<Placement>({
    country: member.exchangeCountry ?? "",
    state: member.exchangeState ?? "",
  });
  const [undergradProgram, setUndergradProgram] = useState<string>(member.undergradProgram ?? "");

  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: () => api.projects() });
  const allProjects = projectsQuery.data ?? [];
  const [linkedProjects, setLinkedProjects] = useState<{ projectId: string; role: string }[]>([]);
  const [linkedInited, setLinkedInited] = useState(false);

  useEffect(() => {
    if (projectsQuery.isSuccess && !linkedInited) {
      setLinkedProjects(
        allProjects
          .filter((p) => p.leaders?.some((l) => l.memberId === member.id))
          .map((p) => ({
            projectId: p.id,
            role: p.leaders!.find((l) => l.memberId === member.id)!.role,
          }))
      );
      setLinkedInited(true);
    }
  }, [projectsQuery.isSuccess, allProjects, member.id, linkedInited]);

  const save = useMutation({
    mutationFn: async () => {
      await api.admin.updateMember(member.id, {
        fullName,
        email: email || null,
        linkedinUrl: linkedinUrl || null,
        lattesUrl: lattesUrl || null,
        githubUrl: githubUrl || null,
        photoUrl: photoUrl || null,
        // EN/FR bios are auto-translated server-side from bioPt; the SPA
        // intentionally does not send bioEn/bioFr so the manager can't
        // accidentally overwrite a freshly-translated value.
        bioPt: bioPt || null,
        status,
        // Empty string clears the country. AdminController reads null as
        // "field not sent, leave it alone", so `|| null` made "Nenhum país"
        // a silent no-op — the old value survived the save.
        exchangeCountry: placement.country,
        // Always sent alongside the country so the server can reconcile the
        // pair; it drops the UF itself whenever the country is not BR.
        exchangeState: placement.state,
        // Same empty-string-clears contract.
        undergradProgram,
      });
      if (linkedInited) {
        await api.admin.updateMemberProjects(member.id, linkedProjects);
      }
      if (toRole !== member.currentRole) {
        // Backend used to enforce a strict promotion graph; now any role
        // change is accepted, so we send the call regardless of direction.
        await api.admin.promote(member.id, { toRole });
      }
    },
    onSuccess: () => {
      // Invalidate every cache the public site reads so /team and the landing
      // page reflect this edit immediately.
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
      queryClient.invalidateQueries({ queryKey: ["graph"] });
      queryClient.invalidateQueries({ queryKey: ["member", member.id] });
      queryClient.invalidateQueries({ queryKey: ["member", member.slug] });
      onSaved();
      onClose();
    },
    onError: (err) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        queryClient.invalidateQueries({ queryKey: ["me"] });
        navigate({ to: "/login" });
      }
    },
  });

  const cfg = tierConfig[member.currentRole];
  const Icon = cfg.Icon;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden rounded-3xl border border-laps-blue/15 bg-white p-0 shadow-[0_20px_60px_-20px_rgba(11,78,141,0.45)] w-[95vw] max-w-5xl">
        <DialogTitle className="sr-only">Editando {member.fullName}</DialogTitle>

        <div className="flex flex-col md:h-[85vh] md:max-h-[800px] md:flex-row">
          {/* LEFT PANEL — identity, mirrors team.$personId.tsx */}
          <div className="relative flex flex-col md:w-5/12 overflow-y-auto border-b md:border-b-0 md:border-r border-laps-blue/10">
            <div className={`relative h-28 md:h-32 shrink-0 bg-gradient-to-r ${cfg.gradient}`}>
              <svg
                className="absolute bottom-0 left-0 h-8 w-full text-white/40"
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
              <div className="absolute right-5 top-5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                ID: {member.id}
              </div>
            </div>

            <div className="-mt-14 md:-mt-16 flex flex-col items-center px-6 pb-8 text-center md:px-8">
              <div className={`relative h-28 w-28 md:h-32 md:w-32 shrink-0 rounded-full bg-white p-1.5 shadow-xl ring-4 ${cfg.ring}`}>
                {photoUrl ? (
                  <img src={resolveMediaUrl(photoUrl)} alt={fullName} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${cfg.gradient} text-3xl font-bold text-white`}>
                    {initials(fullName)}
                  </div>
                )}
                <div className="absolute -right-1 -top-1 flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-white text-laps-blue shadow ring-2 ring-white">
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <FormField
                value={fullName}
                onChange={setFullName}
                placeholder="Nome completo"
                className="font-display mt-5 w-full max-w-xs text-center text-xl font-bold text-laps-navy md:text-2xl"
              />

              <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] md:text-xs font-semibold uppercase tracking-wider ${cfg.chip}`}>
                <Icon className="h-3.5 w-3.5" /> {TIER_META[member.currentRole].label}
              </span>

              <div className="mt-7 w-full max-w-xs flex flex-col gap-2">
                <PhotoUploader
                  photoUrl={photoUrl}
                  uploading={photoUpload.isPending}
                  error={uploadError}
                  onFile={(f) => photoUpload.mutate(f)}
                  onClear={() => setPhotoUrl("")}
                />
                <FormField label="E-mail" value={email} onChange={setEmail} placeholder="nome@uema.br" type="email" />
                <FormField label="LinkedIn" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/in/…" type="url" icon={<Linkedin className="h-3.5 w-3.5" />} />
                <FormField label="Lattes" value={lattesUrl} onChange={setLattesUrl} placeholder="http://lattes.cnpq.br/…" type="url" />
                <FormField label="GitHub" value={githubUrl} onChange={setGithubUrl} placeholder="https://github.com/…" type="url" />
              </div>
            </div>
          </div>

          {/* RIGHT PANEL — editable content (bio, status, role, projects) */}
          <div className="flex flex-col md:w-7/12 bg-laps-ghost/5 relative">
            <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-8">
              <Section title="Acesso e Funções">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldCard label="Status na equipe">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as MemberStatusEnum)}
                      className="h-10 w-full rounded-md border border-laps-navy/15 bg-white px-3 text-sm text-laps-navy focus:outline-none focus:ring-2 focus:ring-laps-blue/40"
                    >
                      <option value="ACTIVE">Ativo (visível na equipe)</option>
                      <option value="COMPLETED">Concluído (alumni)</option>
                      <option value="INACTIVE">Inativo (arquivado)</option>
                    </select>
                  </FieldCard>

                  <FieldCard label={<><Replace className="h-3.5 w-3.5 inline mr-1 text-laps-blue" />Função na equipe</>}>
                    <select
                      value={toRole}
                      onChange={(e) => setToRole(e.target.value as MemberRole)}
                      className="h-10 w-full rounded-md border border-laps-navy/15 bg-white px-3 text-sm text-laps-navy focus:outline-none focus:ring-2 focus:ring-laps-blue/40"
                    >
                      {ROLE_ORDER.map((r) => (
                        <option key={r} value={r}>
                          {TIER_META[r].label}
                          {r === member.currentRole ? " (atual)" : ""}
                        </option>
                      ))}
                    </select>
                    {toRole !== member.currentRole && (
                      <p className="mt-2 text-[10px] font-medium text-laps-blue">
                        Será registrado em histórico ao salvar.
                      </p>
                    )}
                  </FieldCard>
                </div>
              </Section>

              <Section title="Curso de Graduação">
                <p className="mb-3 text-[11px] text-laps-navy/55">
                  De qual bacharelado o membro veio. Independente do cargo no
                  laboratório — um mestrando ou doutorando também tem curso de
                  origem. Deixe em branco se não se aplica.
                </p>
                <FieldCard label="Bacharelado">
                  <div className="flex flex-col gap-2">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="radio"
                        name="undergrad-program"
                        value=""
                        checked={undergradProgram === ""}
                        onChange={() => setUndergradProgram("")}
                        className="h-4 w-4 border-laps-navy/30 text-laps-blue focus:ring-laps-blue"
                      />
                      <span className="text-sm text-laps-navy/70">Não informado</span>
                    </label>
                    {UNDERGRAD_PROGRAM_ORDER.map((code) => {
                      const program = UNDERGRAD_PROGRAMS[code];
                      return (
                        <label key={code} className="flex cursor-pointer items-center gap-3">
                          <input
                            type="radio"
                            name="undergrad-program"
                            value={code}
                            checked={undergradProgram === code}
                            onChange={() => setUndergradProgram(code)}
                            className="h-4 w-4 border-laps-navy/30 text-laps-blue focus:ring-laps-blue"
                          />
                          <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${program.badge}`}>
                            {program.short.pt}
                          </span>
                          <span className="text-sm text-laps-navy">{program.name.pt}</span>
                        </label>
                      );
                    })}
                  </div>
                </FieldCard>
              </Section>

              <Section title="Intercâmbio">
                <p className="mb-3 text-[11px] text-laps-navy/55">
                  Somente gestores podem atribuir este marcador. O membro verá o badge
                  "Intercambista" no seu portfólio público, e o destino aparece na página de
                  intercâmbio automaticamente — nacional (por estado) ou internacional.
                </p>
                <FieldCard label="Destino">
                  <ExchangePlacementPicker value={placement} onChange={setPlacement} />
                </FieldCard>
              </Section>

              <Section title="Bio (Português)">
                <p className="mb-2 text-[11px] text-laps-navy/55">
                  Escreva em português. A tradução para inglês e francês é gerada automaticamente ao salvar.
                </p>
                <BioField
                  label="Texto"
                  value={bioPt}
                  onChange={(v) => setBioPt(v.slice(0, 500))}
                  rows={5}
                  maxLength={500}
                />
              </Section>

              <Section title="Vínculos de pesquisa">
                {projectsQuery.isLoading ? (
                  <div className="flex py-10 justify-center"><Loader2 className="h-6 w-6 animate-spin text-laps-blue/50" /></div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {allProjects.map((p) => {
                      const isLinked = linkedProjects.some((lp) => lp.projectId === p.id);
                      const role = linkedProjects.find((lp) => lp.projectId === p.id)?.role || "RESEARCHER";
                      return (
                        <div
                          key={p.id}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border transition ${isLinked
                              ? "border-laps-blue/40 bg-white shadow-sm"
                              : "border-laps-light/30 bg-white/40 hover:bg-white"
                            }`}
                        >
                          <label className="flex items-start gap-3 flex-1 overflow-hidden cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isLinked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setLinkedProjects((prev) => [...prev, { projectId: p.id, role: "RESEARCHER" }]);
                                } else {
                                  setLinkedProjects((prev) => prev.filter((lp) => lp.projectId !== p.id));
                                }
                              }}
                              className="mt-0.5 h-4 w-4 rounded border-laps-navy/30 text-laps-blue focus:ring-laps-blue shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-semibold text-laps-navy leading-tight truncate">{p.titlePt}</span>
                              <span className="text-[10px] font-medium uppercase tracking-wider text-laps-navy/50 mt-0.5">{p.slug}</span>
                            </div>
                          </label>
                          {isLinked && (
                            <select
                              value={role}
                              onChange={(e) =>
                                setLinkedProjects((prev) =>
                                  prev.map((lp) => (lp.projectId === p.id ? { ...lp, role: e.target.value } : lp))
                                )
                              }
                              className="h-9 rounded-md border border-laps-blue/20 bg-laps-blue/5 px-2 text-xs font-semibold text-laps-blue focus:outline-none focus:ring-2 focus:ring-laps-blue/40"
                            >
                              <option value="LEAD">Orientador</option>
                              <option value="CO_LEAD">Co-orientador</option>
                              <option value="RESEARCHER">Pesquisador</option>
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Section>
            </div>

            {/* ACTION BAR */}
            <div className="mt-auto border-t border-laps-blue/10 bg-white/95 backdrop-blur-md p-4 flex items-center justify-end gap-3 shrink-0">
              {save.isError && (
                <span className="text-xs text-rose-600 mr-auto">
                  {save.error instanceof ApiError && (save.error.status === 401 || save.error.status === 403)
                    ? "Sessão expirada — redirecionando para login…"
                    : save.error instanceof ApiError
                      ? save.error.message
                      : "Falha ao salvar."}
                </span>
              )}
              <button
                onClick={onClose}
                className="rounded-md px-5 py-2 text-sm font-semibold text-laps-navy/65 hover:bg-laps-ghost hover:text-laps-navy transition"
              >
                Descartar
              </button>
              <button
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-laps-navy to-laps-blue px-6 py-2 text-sm font-bold text-white shadow-md shadow-laps-blue/25 transition hover:shadow-laps-blue/40 disabled:opacity-60"
              >
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar perfil
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ───── Small editing primitives ─────

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  className,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-left">
      {label && (
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-laps-navy/55 flex items-center gap-1">
          {icon} {label}
        </span>
      )}
      <Input
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`h-9 bg-white border-laps-navy/15 focus-visible:ring-laps-blue ${className ?? "text-sm"}`}
      />
    </label>
  );
}

function BioField({
  label,
  value,
  onChange,
  rows = 2,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  maxLength?: number;
}) {
  const overLimit = maxLength != null && value.length > maxLength;
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-laps-navy/55">
        <span>{label}</span>
        {maxLength != null && (
          <span className={`tabular-nums ${overLimit ? "text-rose-600" : value.length > maxLength * 0.85 ? "text-amber-600" : "text-laps-navy/40"}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        maxLength={maxLength}
        className="w-full rounded-md border border-laps-navy/15 bg-white px-3 py-2 text-sm text-laps-navy focus:outline-none focus:ring-2 focus:ring-laps-blue/40"
      />
    </label>
  );
}

function PhotoUploader({
  photoUrl,
  uploading,
  error,
  onFile,
  onClear,
}: {
  photoUrl: string;
  uploading: boolean;
  error: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-laps-navy/55">
        Foto
      </span>
      <div className="flex items-center gap-3 rounded-md border border-dashed border-laps-navy/20 bg-white p-2">
        {photoUrl ? (
          <img
            src={resolveMediaUrl(photoUrl)}
            alt=""
            className="h-12 w-12 rounded-md object-cover ring-1 ring-laps-blue/15"
          />
        ) : (
          <div className="h-12 w-12 rounded-md bg-laps-ghost flex items-center justify-center text-[10px] font-semibold uppercase text-laps-navy/45">
            Sem foto
          </div>
        )}
        <div className="flex-1 min-w-0">
          <label
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${uploading
                ? "bg-laps-ghost text-laps-navy/40 cursor-wait"
                : "bg-laps-blue/10 text-laps-blue hover:bg-laps-blue/15"
              }`}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
            {uploading ? "Enviando…" : photoUrl ? "Trocar foto" : "Selecionar foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.currentTarget.value = "";
                if (f) onFile(f);
              }}
            />
          </label>
          {photoUrl && (
            <button
              type="button"
              onClick={onClear}
              className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-laps-navy/45 hover:text-rose-600 transition"
            >
              Remover
            </button>
          )}
          {error && <div className="mt-1 text-[10px] text-rose-600">{error}</div>}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
        {title}
      </p>
      {children}
    </div>
  );
}

function FieldCard({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-laps-light/30 shadow-sm">
      <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-laps-navy/60 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

// ───── ProjectSection ─────

// ───── Publication approval queue ─────
//
// Members submit publications from their portal (any tier — undergrads
// included) and they stay off the public site until approved here. The section
// renders nothing at all when the queue is empty, so the page only grows a
// moderation panel on the days there is something to moderate.

function PublicationApprovalSection() {
  const queryClient = useQueryClient();
  const pendingQuery = useQuery({
    queryKey: ["admin", "pending-publications"],
    queryFn: () => api.adminPendingPublications(),
    staleTime: 15_000,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "pending-publications"] });
    // The approved row becomes public immediately; drop anything showing it.
    queryClient.invalidateQueries({ queryKey: ["publications"] });
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.adminApprovePublication(id),
    onSuccess: refresh,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      api.adminRejectPublication(id, note),
    onSuccess: refresh,
  });

  const pending = pendingQuery.data ?? [];
  if (pendingQuery.isLoading || pending.length === 0) return null;

  const busy = approveMutation.isPending || rejectMutation.isPending;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
      <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-laps-navy">
        <Clock className="h-5 w-5 text-amber-600" />
        Publicações aguardando revisão
        <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-xs font-bold text-amber-900">
          {pending.length}
        </span>
      </h3>
      <p className="mb-4 text-xs text-laps-navy/60">
        Enviadas por membros pelo portal. Só aparecem no site público depois de aprovadas.
      </p>

      <div className="space-y-3">
        {pending.map(({ publication: p, submitterName }) => (
          <div key={p.id} className="rounded-lg border border-amber-200/80 bg-white p-3">
            <div className="mb-1 font-bold leading-snug text-laps-navy">{p.title}</div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-laps-navy/45">
              {p.venue} · {p.year} · {p.type}
              {submitterName ? ` · enviado por ${submitterName}` : ""}
            </div>
            {p.doi && (
              <a
                href={`https://doi.org/${p.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-2 inline-flex items-center gap-1 text-[11px] font-medium text-laps-blue hover:underline"
              >
                doi:{p.doi} <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => approveMutation.mutate(p.id)}
                className="inline-flex items-center gap-1.5 rounded-md bg-laps-blue px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-laps-navy disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Aprovar
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  // The note is what the member reads in their portal, so a
                  // rejection is never a silent disappearance.
                  const note = window.prompt(
                    "Motivo da recusa (opcional) — o membro verá esta mensagem:",
                  );
                  if (note === null) return;
                  rejectMutation.mutate({ id: p.id, note: note.trim() || undefined });
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" /> Recusar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectSection() {
  const queryClient = useQueryClient();
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects(),
  });

  // null = no dialog open; "new" = create flow; ApiProject = edit that one.
  const [editing, setEditing] = useState<null | "new" | ApiProject>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteProject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const projects = projectsQuery.data ?? [];

  return (
    <div className="sticky top-24 flex flex-col max-h-[calc(100vh-8rem)] rounded-2xl border border-laps-light/25 bg-white p-5 shadow-[0_2px_20px_rgba(25,58,89,0.05)]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="font-display text-lg font-bold text-laps-navy flex items-center gap-2">
          <Folder className="h-5 w-5 text-laps-blue" />
          Projetos Ativos
        </h3>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-1 rounded-md bg-laps-blue px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-laps-navy"
        >
          <Plus className="h-3.5 w-3.5" /> Novo
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
        {projectsQuery.isLoading && <div className="text-center text-sm py-4 text-laps-navy/55"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></div>}
        {projects.length === 0 && !projectsQuery.isLoading && (
          <div className="text-xs text-center text-laps-navy/50 py-8 border border-dashed rounded-lg">Nenhum projeto encontrado.</div>
        )}
        {projects.map((p) => (
          <div
            key={p.id}
            className="group relative rounded-lg border border-laps-navy/10 hover:border-laps-blue/30 p-3 text-sm transition cursor-pointer"
            onClick={() => setEditing(p)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-bold text-laps-navy mb-1 leading-snug">{p.titleEn || p.titlePt}</div>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                <button
                  className="text-laps-navy/40 hover:text-rose-600 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Excluir projeto?")) deleteMutation.mutate(p.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-laps-navy/45 mb-1">
              {p.slug}{p.year ? ` · ${p.year}` : ""} · {p.status === "ACTIVE" ? "Ativo" : "Concluído"}
            </div>
            <div className="text-[11px] text-laps-navy/60 mb-2 line-clamp-2">{p.descriptionEn || p.descriptionPt}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {p.leaders?.slice(0, 4).map((l) => (
                <span key={l.memberId} className="bg-laps-ghost px-1.5 py-0.5 rounded text-[10px] text-laps-blue font-semibold whitespace-nowrap">
                  {l.member?.fullName || l.memberId.slice(0, 8)}
                </span>
              ))}
              {p.leaders && p.leaders.length > 4 && (
                <span className="text-[10px] text-laps-navy/45">+{p.leaders.length - 4}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ProjectEditPanel
          existing={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ["projects"] })}
        />
      )}
    </div>
  );
}

// ───── ProjectEditPanel ─────
// Mirror the member EditPanel layout: left = identity + status, right = bodies
// and researcher picker. English titles are the public default; PT/FR optional.

function ProjectEditPanel({
  existing,
  onClose,
  onSaved,
}: {
  existing: ApiProject | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = existing === null;

  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [status, setStatus] = useState<ProjectStatus>(existing?.status ?? "ACTIVE");
  const [year, setYear] = useState<string>(existing?.year != null ? String(existing.year) : "");
  const [articleUrl, setArticleUrl] = useState(existing?.articleUrl ?? "");

  const [titleEn, setTitleEn] = useState(existing?.titleEn ?? "");
  const [descriptionEn, setDescriptionEn] = useState(existing?.descriptionEn ?? "");
  const [titlePt, setTitlePt] = useState(existing?.titlePt ?? "");
  const [descriptionPt, setDescriptionPt] = useState(existing?.descriptionPt ?? "");
  const [titleFr, setTitleFr] = useState(existing?.titleFr ?? "");
  const [descriptionFr, setDescriptionFr] = useState(existing?.descriptionFr ?? "");

  const [tagsRaw, setTagsRaw] = useState((existing?.tags ?? []).join(", "));
  const tags = useMemo(
    () => tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
    [tagsRaw]
  );

  const [leaders, setLeaders] = useState<{ memberId: string; role: string }[]>(
    existing?.leaders?.map((l) => ({ memberId: l.memberId, role: l.role })) ?? []
  );

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const save = useMutation({
    mutationFn: async () => {
      const yearNum = year.trim() ? Number(year) : null;
      const payload = {
        slug,
        status,
        year: yearNum,
        articleUrl: articleUrl.trim() || null,
        titleEn: titleEn || null,
        descriptionEn: descriptionEn || null,
        titlePt: titlePt || null,
        descriptionPt: descriptionPt || null,
        titleFr: titleFr || null,
        descriptionFr: descriptionFr || null,
        tags,
      };
      if (isNew) {
        const created = await api.admin.createProject({ ...payload, leaders });
        if (leaders.length > 0) {
          await api.admin.updateProjectMembers(created.id, leaders);
        }
      } else {
        await api.admin.updateProject(existing!.id, payload);
        await api.admin.updateProjectMembers(existing!.id, leaders);
      }
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
    onError: (err) => {
      // Session expiry surfaces here as 401 "Full authentication is required…"
      // (the backend's AuthenticationEntryPoint). Match the member EditPanel
      // pattern: drop the stale /me cache so useAuth re-evaluates, then send
      // the manager to /login so they don't keep seeing raw Spring messages.
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        queryClient.invalidateQueries({ queryKey: ["me"] });
        navigate({ to: "/login" });
      }
    },
  });

  // Friendly inline message — show "session expired" when we know that's what it is.
  const saveErrorMessage = save.isError
    ? save.error instanceof ApiError && (save.error.status === 401 || save.error.status === 403)
      ? "Sessão expirada — redirecionando para login…"
      : save.error instanceof ApiError
        ? save.error.message
        : "Falha ao salvar."
    : null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden rounded-3xl border border-laps-blue/15 bg-white p-0 shadow-[0_20px_60px_-20px_rgba(11,78,141,0.45)] w-[95vw] max-w-5xl">
        <DialogTitle className="sr-only">{isNew ? "Novo projeto" : `Editando ${titleEn || titlePt}`}</DialogTitle>

        <div className="flex flex-col md:h-[88vh] md:max-h-[820px] md:flex-row">
          {/* LEFT — identity */}
          <div className="relative flex flex-col md:w-5/12 overflow-y-auto border-b md:border-b-0 md:border-r border-laps-blue/10">
            <div className="relative h-24 shrink-0 bg-gradient-to-r from-laps-navy to-laps-blue">
              <div className="absolute right-5 top-4 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                {isNew ? "Novo projeto" : "Editando projeto"}
              </div>
            </div>

            <div className="flex flex-col gap-4 px-6 py-6 md:px-8">
              <FormField
                label="Slug (URL)"
                value={slug}
                onChange={(v) => setSlug(v.replace(/[^a-z0-9-]/gi, "-").toLowerCase())}
                placeholder="ex: gan-histological"
              />

              <FieldCard label="Status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="h-10 w-full rounded-md border border-laps-navy/15 bg-white px-3 text-sm text-laps-navy focus:outline-none focus:ring-2 focus:ring-laps-blue/40"
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="COMPLETED">Concluído</option>
                </select>
              </FieldCard>

              <FormField
                label="Ano"
                value={year}
                onChange={(v) => setYear(v.replace(/[^0-9]/g, "").slice(0, 4))}
                placeholder="ex: 2025"
                type="text"
              />

              <FormField
                label="Link externo (opcional)"
                value={articleUrl}
                onChange={setArticleUrl}
                placeholder="https://doi.org/..."
                type="url"
                icon={<ExternalLink className="h-3.5 w-3.5" />}
              />
              <p className="-mt-2 text-[10px] text-laps-navy/45">
                Quando presente, o card em /projects mostra "Learn more".
              </p>

              <FormField
                label="Tags (separadas por vírgula)"
                value={tagsRaw}
                onChange={setTagsRaw}
                placeholder="GAN, Computer Vision, Histology"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 -mt-1">
                  {tags.map((t) => (
                    <span key={t} className="rounded-md border border-laps-blue/15 bg-laps-ghost/40 px-2 py-0.5 text-[10px] font-semibold text-laps-navy/70">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — content */}
          <div className="flex flex-col md:w-7/12 bg-laps-ghost/5 relative">
            <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-7">
              <Section title="Título e descrição — inglês (público padrão)">
                <FormField label="Título (EN)" value={titleEn} onChange={setTitleEn} placeholder="ex: GANs on Histological Images" />
                <div className="mt-2">
                  <BioField label="Descrição (EN)" value={descriptionEn} onChange={setDescriptionEn} rows={3} maxLength={600} />
                </div>
              </Section>

              <Section title="Versões PT / FR (opcionais)">
                <div className="grid gap-3">
                  <FormField label="Título (PT)" value={titlePt} onChange={setTitlePt} placeholder="ex: Modelos GAN em Imagens Histológicas" />
                  <BioField label="Descrição (PT)" value={descriptionPt} onChange={setDescriptionPt} rows={2} maxLength={600} />
                  <FormField label="Título (FR)" value={titleFr} onChange={setTitleFr} placeholder="ex: Modèles GAN en Images Histologiques" />
                  <BioField label="Descrição (FR)" value={descriptionFr} onChange={setDescriptionFr} rows={2} maxLength={600} />
                </div>
              </Section>

              <Section title="Pesquisadores responsáveis">
                <ResearcherPicker leaders={leaders} onChange={setLeaders} />
              </Section>
            </div>

            <div className="mt-auto border-t border-laps-blue/10 bg-white/95 backdrop-blur-md p-4 flex items-center justify-end gap-3 shrink-0">
              {saveErrorMessage && (
                <span className="text-xs text-rose-600 mr-auto">{saveErrorMessage}</span>
              )}
              <button onClick={onClose} className="rounded-md px-5 py-2 text-sm font-semibold text-laps-navy/65 hover:bg-laps-ghost hover:text-laps-navy transition">
                Descartar
              </button>
              <button
                onClick={() => save.mutate()}
                disabled={save.isPending || !slug || !(titleEn || titlePt)}
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-laps-navy to-laps-blue px-6 py-2 text-sm font-bold text-white shadow-md shadow-laps-blue/25 transition hover:shadow-laps-blue/40 disabled:opacity-60"
              >
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isNew ? "Criar projeto" : "Salvar projeto"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ───── ResearcherPicker ─────
// Searchable autocomplete over the member roster. Ranking via member-search.ts
// (substring + word-prefix + initials match, all weighted) — for ~50 members
// this is a sub-millisecond linear pass per keystroke, no Fuse.js needed.

function ResearcherPicker({
  leaders,
  onChange,
}: {
  leaders: { memberId: string; role: string }[];
  onChange: (next: { memberId: string; role: string }[]) => void;
}) {
  const membersQuery = useQuery({
    // Distinct from the public ["members"] key: the same endpoint returns an
    // unredacted payload for MANAGER callers, so sharing one cache entry across
    // auth states served the admin UI a redacted roster (blank emails).
    queryKey: ["admin", "members"],
    queryFn: () => api.members(),
    staleTime: 30_000,
  });
  const allMembers = membersQuery.data?.content ?? [];
  const byId = useMemo(() => Object.fromEntries(allMembers.map((m) => [m.id, m])), [allMembers]);

  const [q, setQ] = useState("");
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const taken = new Set(leaders.map((l) => l.memberId));
    return searchMembers(allMembers.filter((m) => !m.deletedAt && !taken.has(m.id)), q, 8);
  }, [q, allMembers, leaders]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-laps-navy/40" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, slug ou iniciais (ex: ES → Ewaldo Santana)"
          className="h-10 pl-10 bg-white border-laps-navy/15 focus-visible:ring-laps-blue"
        />
        {results.length > 0 && (
          <div className="absolute left-0 right-0 top-11 z-20 rounded-lg border border-laps-light/40 bg-white shadow-xl max-h-64 overflow-y-auto">
            {results.map(({ member }) => (
              <button
                key={member.id}
                type="button"
                onClick={() => {
                  onChange([...leaders, { memberId: member.id, role: "RESEARCHER" }]);
                  setQ("");
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-laps-ghost transition"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-laps-ghost text-[10px] font-bold text-laps-blue">
                  {member.photoUrl ? (
                    <img src={resolveMediaUrl(member.photoUrl)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(member.fullName)
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-laps-navy">{member.fullName}</div>
                  <div className="truncate text-[10px] uppercase tracking-wider text-laps-navy/50">
                    {TIER_META[member.currentRole].label} · /{member.slug}
                  </div>
                </span>
                <Plus className="h-4 w-4 text-laps-blue/60" />
              </button>
            ))}
          </div>
        )}
      </div>

      {leaders.length === 0 ? (
        <p className="text-xs text-laps-navy/45 italic text-center py-4 border border-dashed rounded-lg">
          Nenhum pesquisador vinculado.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {leaders.map((l) => {
            const m = byId[l.memberId];
            return (
              <div key={l.memberId} className="flex items-center gap-3 rounded-lg border border-laps-light/30 bg-white p-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-laps-ghost text-[10px] font-bold text-laps-blue">
                  {m?.photoUrl ? (
                    <img src={resolveMediaUrl(m.photoUrl)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    m ? initials(m.fullName) : "?"
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-laps-navy">
                    {m?.fullName ?? l.memberId.slice(0, 8)}
                  </div>
                  {m && (
                    <div className="truncate text-[10px] uppercase tracking-wider text-laps-navy/45">
                      {TIER_META[m.currentRole].label}
                    </div>
                  )}
                </div>
                <select
                  value={l.role}
                  onChange={(e) =>
                    onChange(leaders.map((x) => (x.memberId === l.memberId ? { ...x, role: e.target.value } : x)))
                  }
                  className="h-8 rounded-md border border-laps-blue/20 bg-laps-blue/5 px-2 text-xs font-semibold text-laps-blue focus:outline-none focus:ring-2 focus:ring-laps-blue/40"
                >
                  <option value="LEAD">Orientador</option>
                  <option value="CO_LEAD">Co-orientador</option>
                  <option value="RESEARCHER">Pesquisador</option>
                </select>
                <button
                  type="button"
                  onClick={() => onChange(leaders.filter((x) => x.memberId !== l.memberId))}
                  className="text-laps-navy/35 hover:text-rose-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
