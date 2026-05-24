import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api, ApiError, type ApiProject, type MyProfile } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { initials } from "@/lib/team-data";

export const Route = createFileRoute("/portal")({
  component: PortalPage,
  head: () => ({
    meta: [
      { title: "Meu Perfil — LAPS" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function PortalPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const me = auth.member;

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [auth.isLoading, auth.isAuthenticated, navigate]);

  if (auth.isLoading || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-laps-ghost/20">
        <p className="text-sm text-laps-navy/55">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-laps-ghost/20">
      <PortalHeader me={me} onLogout={() => api.logout().then(() => navigate({ to: "/login" }))} />

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        {/* Account-state banners.
            New users see (1) an info banner explaining the email-first flow
            and (2) the email verification card. Once verified, both disappear
            and the change-password card unlocks. */}
        {auth.mustChangePassword && <FirstLoginBanner emailVerified={auth.emailVerified} />}
        {!auth.emailVerified && <EmailVerificationBanner me={me} />}

        <ProfileEditor me={me} />
        <ProjectsEditor />
        <PasswordChangeCard emailVerified={auth.emailVerified} />
      </main>
    </div>
  );
}

function PortalHeader({ me, onLogout }: { me: MyProfile; onLogout: () => void }) {
  return (
    <header className="border-b border-laps-navy/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-laps-blue">
            LAPS · Portal
          </p>
          <h1 className="mt-0.5 text-base font-bold text-laps-navy">{me.fullName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-laps-navy/55">
              @{me.username ?? me.slug}
            </p>
            <p className="text-xs text-laps-navy/70">{me.email ?? "Sem email cadastrado"}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-laps-navy/15 bg-white px-4 py-2 text-xs font-semibold text-laps-navy/75 transition hover:border-laps-blue/30 hover:text-laps-blue"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}

// ───── First-login info banner ─────

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

// ───── Email verification banner ─────

function EmailVerificationBanner({ me }: { me: MyProfile }) {
  const [tokenIssued, setTokenIssued] = useState<{ token: string; expiresAt: string } | null>(
    null
  );
  const [verifyToken, setVerifyToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  const requestMutation = useMutation({
    mutationFn: () => api.meRequestEmailVerification(),
    onSuccess: (res) => {
      if (res.token && res.expiresAt) setTokenIssued({ token: res.token, expiresAt: res.expiresAt });
    },
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : "Falha ao solicitar verificação."),
  });

  const verifyMutation = useMutation({
    mutationFn: (token: string) => api.meVerifyEmail(token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setTokenIssued(null);
      setVerifyToken("");
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Token inválido."),
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

          {error && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-700">
              <AlertCircle className="h-3.5 w-3.5" /> {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ───── Profile editor ─────

function ProfileEditor({ me }: { me: MyProfile }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    email: me.email ?? "",
    bioPt: me.bioPt ?? "",
    photoUrl: me.photoUrl ?? "",
    linkedinUrl: me.linkedinUrl ?? "",
    lattesUrl: me.lattesUrl ?? "",
    githubUrl: me.githubUrl ?? "",
    contactEmail: me.contactEmail ?? "",
    roadmap: me.roadmap ?? "",
  });
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.meUpdate({
        ...form,
        // PT only — backend auto-translates to EN/FR on save.
        bioEn: undefined,
        bioFr: undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["members"] });
      qc.invalidateQueries({ queryKey: ["graph"] });
      setSavedAt(Date.now());
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.meUploadPhoto(file),
    onSuccess: (res) => {
      setForm((f) => ({ ...f, photoUrl: res.url }));
      setUploadError(null);
    },
    onError: (err) =>
      setUploadError(err instanceof ApiError ? err.message : "Falha no upload."),
  });

  function patch<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = "";
  }

  return (
    <section className="rounded-2xl border border-laps-navy/10 bg-white p-6 shadow-sm">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-laps-navy">Meu perfil</h2>
          <p className="text-xs text-laps-navy/55">
            Suas informações aparecem em <code>/team/{me.id}</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-laps-blue px-4 py-2 text-xs font-semibold text-white transition hover:bg-laps-navy disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" />
          {saveMutation.isPending ? "Salvando…" : "Salvar"}
        </button>
      </header>

      {/* Photo uploader */}
      <div className="mb-6 flex items-center gap-5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-laps-blue to-laps-light p-0.5 ring-2 ring-white shadow-sm">
          {form.photoUrl ? (
            <img
              src={form.photoUrl}
              alt={me.fullName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full text-xl font-bold text-white">
              {initials(me.fullName)}
            </div>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
            Foto de perfil
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onPickFile}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-laps-blue/25 bg-white px-3 py-1.5 text-xs font-semibold text-laps-blue transition hover:bg-laps-ghost disabled:opacity-60"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploadMutation.isPending ? "Enviando…" : "Trocar foto"}
            </button>
            {form.photoUrl && (
              <button
                type="button"
                onClick={() => patch("photoUrl", "")}
                className="text-xs text-laps-navy/55 hover:text-red-600"
              >
                Remover
              </button>
            )}
          </div>
          <p className="mt-1 text-[10px] text-laps-navy/45">
            JPG, PNG ou WebP. Clique em Salvar para aplicar.
          </p>
          {uploadError && (
            <p className="mt-1 text-[11px] text-red-700">{uploadError}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Email (login + recuperação)"
          value={form.email}
          onChange={(v) => patch("email", v)}
        />
        <TextField
          label="Email de contato (público)"
          value={form.contactEmail}
          onChange={(v) => patch("contactEmail", v)}
        />
        <TextField label="LinkedIn" value={form.linkedinUrl} onChange={(v) => patch("linkedinUrl", v)} />
        <TextField label="Lattes" value={form.lattesUrl} onChange={(v) => patch("lattesUrl", v)} />
        <TextField label="GitHub" value={form.githubUrl} onChange={(v) => patch("githubUrl", v)} />
      </div>

      <div className="mt-4">
        <TextArea
          label="Bio (PT — traduzida automaticamente para EN e FR ao salvar)"
          value={form.bioPt}
          onChange={(v) => patch("bioPt", v)}
        />
      </div>

      <div className="mt-4">
        <TextArea
          label="Roadmap pessoal"
          value={form.roadmap}
          onChange={(v) => patch("roadmap", v)}
          rows={3}
        />
      </div>

      {savedAt && (
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> Salvo.
        </p>
      )}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
        {label}
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 border-laps-navy/15 bg-white text-sm"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-md border border-laps-navy/15 bg-white px-3 py-2 text-sm text-laps-navy outline-none focus:border-laps-blue/40 focus:ring-2 focus:ring-laps-blue/15"
      />
    </div>
  );
}

// ───── Project links ─────

function ProjectsEditor() {
  const qc = useQueryClient();
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects(),
    staleTime: 30_000,
  });
  const linksQuery = useQuery({
    queryKey: ["my-projects"],
    queryFn: () => api.myProjects(),
    staleTime: 10_000,
  });

  const links = linksQuery.data ?? [];
  const projects = projectsQuery.data ?? [];

  const [pending, setPending] = useState<{ projectId: string; role: string }[] | null>(null);
  const editable = pending ?? links.map((l) => ({ projectId: l.projectId, role: l.role }));

  const mutation = useMutation({
    mutationFn: (next: { projectId: string; role: string }[]) => api.updateMyProjects(next),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["graph"] });
      setPending(null);
    },
  });

  const isDirty = useMemo(() => {
    if (!pending) return false;
    if (pending.length !== links.length) return true;
    const a = [...pending].sort((x, y) => x.projectId.localeCompare(y.projectId));
    const b = [...links]
      .map((l) => ({ projectId: l.projectId, role: l.role }))
      .sort((x, y) => x.projectId.localeCompare(y.projectId));
    return a.some((p, i) => p.projectId !== b[i]?.projectId || p.role !== b[i]?.role);
  }, [pending, links]);

  function toggle(p: ApiProject) {
    const current = editable.find((l) => l.projectId === p.id);
    const next = current
      ? editable.filter((l) => l.projectId !== p.id)
      : [...editable, { projectId: p.id, role: "RESEARCHER" }];
    setPending(next);
  }

  function setRole(projectId: string, role: string) {
    setPending(editable.map((l) => (l.projectId === projectId ? { ...l, role } : l)));
  }

  return (
    <section className="rounded-2xl border border-laps-navy/10 bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-laps-navy">Meus projetos</h2>
          <p className="text-xs text-laps-navy/55">
            Apenas a coordenação cria projetos. Você se vincula aos existentes.
          </p>
        </div>
        {isDirty && (
          <button
            type="button"
            onClick={() => mutation.mutate(editable)}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-laps-blue px-4 py-2 text-xs font-semibold text-white transition hover:bg-laps-navy disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" />
            {mutation.isPending ? "Salvando…" : "Salvar vínculos"}
          </button>
        )}
      </header>

      <div className="grid gap-2">
        {projects.map((p) => {
          const link = editable.find((l) => l.projectId === p.id);
          const linked = !!link;
          return (
            <div
              key={p.id}
              className={`flex flex-col gap-2 rounded-xl border p-3 transition md:flex-row md:items-center md:justify-between ${
                linked
                  ? "border-laps-blue/40 bg-laps-ghost/30"
                  : "border-laps-navy/10 bg-white hover:border-laps-blue/20"
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-laps-navy">
                  {p.titlePt || p.titleEn || p.slug}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-laps-light/40 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-laps-navy/65"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {linked && (
                  <select
                    value={link!.role}
                    onChange={(e) => setRole(p.id, e.target.value)}
                    className="rounded-md border border-laps-navy/15 bg-white px-2 py-1.5 text-xs text-laps-navy"
                  >
                    <option value="RESEARCHER">Pesquisador</option>
                    <option value="CO_LEAD">Co-orientador</option>
                    <option value="LEAD">Orientador</option>
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => toggle(p)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    linked
                      ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                      : "border border-laps-blue/25 bg-white text-laps-blue hover:bg-laps-ghost"
                  }`}
                >
                  {linked ? "Remover" : "Vincular"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ───── Change password card (locked until email verified) ─────

function PasswordChangeCard({ emailVerified }: { emailVerified: boolean }) {
  const qc = useQueryClient();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const mutation = useMutation({
    mutationFn: ({ a, b }: { a: string; b: string }) => api.meChangePassword(a, b),
    onSuccess: () => {
      setOk(true);
      setCurrent("");
      setNext("");
      setConfirm("");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao trocar senha."),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    if (next.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (next !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    mutation.mutate({ a: current, b: next });
  }

  if (!emailVerified) {
    return (
      <section className="relative rounded-2xl border border-laps-navy/10 bg-white p-6 shadow-sm">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-white/55" />
        <div className="relative">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-laps-navy/8 text-laps-navy/60">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-laps-navy/65">Trocar senha</h2>
              <p className="mt-1 text-xs text-laps-navy/55">
                Cadastre e verifique seu email antes de definir uma senha pessoal — isso garante
                que você consiga recuperá-la caso a perca. Seu nome de usuário não pode ser alterado.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-laps-navy/10 bg-white p-6 shadow-sm">
      <h2 className="font-display mb-1 text-base font-bold text-laps-navy">Trocar senha</h2>
      <p className="mb-4 text-xs text-laps-navy/55">
        Email verificado — você pode definir uma senha pessoal agora. O nome de usuário continua
        fixo.
      </p>
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
        <PasswordField
          id="pwd-current"
          label="Senha atual"
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
        />
        <PasswordField
          id="pwd-next"
          label="Nova senha"
          value={next}
          onChange={setNext}
          autoComplete="new-password"
        />
        <PasswordField
          id="pwd-confirm"
          label="Confirmar"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        {error && (
          <p className="md:col-span-3 flex items-center gap-1.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}
        {ok && (
          <p className="md:col-span-3 flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Senha atualizada.
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
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-laps-navy/55"
      >
        {label}
      </label>
      <Input
        id={id}
        type="password"
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 border-laps-navy/15 bg-white text-sm"
      />
    </div>
  );
}
