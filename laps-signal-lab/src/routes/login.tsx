import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import LapsLogoMono from "@/components/LapsLogoMono";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import { useInvalidateAuth } from "@/hooks/use-auth";

// Unlinked, unindexed authentication entry. No public site link points here —
// managers reach it directly via /login. The backend gates everything underneath;
// this page just exists to issue the JWT cookie.
export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Gerenciar — LAPS" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const invalidateAuth = useInvalidateAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.login(identifier.trim(), password);
      await invalidateAuth();
      await router.invalidate();
      // Managers go straight to /admin; everyone else lands in /portal where
      // the must-change-password gate (if any) is enforced inline.
      const dest: "/admin" | "/portal" = res.role === "MANAGER" ? "/admin" : "/portal";
      navigate({ to: dest });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Email ou senha inválidos.");
      } else {
        setError("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Left — animated logo + tagline */}
      <aside
        className="relative flex flex-col justify-between overflow-hidden px-10 py-14 text-white lg:px-16 lg:py-20"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, #0B4E8D 0%, #193A59 55%, #0F2A42 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-[0.07] [background:radial-gradient(circle_at_1px_1px,#74B5F2_1px,transparent_0)_0_0/22px_22px]" />
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-laps-light/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-laps-blue/30 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-laps-light">
            Interno · Gerenciamento
          </span>
        </div>

        <div className="relative mx-auto flex w-full max-w-md flex-col items-center text-center">
          <div className="flex w-full items-center justify-center">
            <LapsLogoMono />
          </div>
          <h1 className="font-display mt-10 text-center text-3xl font-bold leading-tight md:text-4xl">
            Laboratório para Aquisição e Processamento de Sinais
          </h1>
          <p className="mt-4 text-center text-sm text-white/65">
            Acesso restrito ao pessoal autorizado. Gerencie a equipe,
            publicações e funções do laboratório — cada alteração é refletida
            no grafo público da equipe instantaneamente.
          </p>
        </div>

        <div className="relative flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/45">
          <ShieldCheck className="h-3.5 w-3.5" />
          Seguro · JWT HttpOnly · Sessão de 15 min
        </div>
      </aside>

      {/* Right — login form */}
      <section className="flex items-center justify-center bg-white px-6 py-14 lg:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 space-y-2">
            <span className="inline-block rounded-full bg-laps-ghost px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-laps-blue">
              Entrar
            </span>
            <h2 className="font-display text-2xl font-bold text-laps-navy">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-laps-navy/60">
              Use as credenciais fornecidas pelo coordenador do laboratório.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <Field
              label="Usuário ou email"
              icon={<User className="h-4 w-4" />}
              htmlFor="identifier"
            >
              <Input
                id="identifier"
                type="text"
                inputMode="email"
                autoComplete="username"
                placeholder="seu-nome ou voce@uema.br"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="h-11 border-laps-navy/15 bg-white pl-10 text-base text-laps-navy placeholder:text-laps-navy/35 focus-visible:ring-laps-blue"
              />
            </Field>

            <Field
              label="Senha"
              icon={<Lock className="h-4 w-4" />}
              htmlFor="password"
            >
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11 border-laps-navy/15 bg-white pl-10 text-base text-laps-navy placeholder:text-laps-navy/35 focus-visible:ring-laps-blue"
              />
            </Field>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-laps-blue px-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(11,78,141,0.55)] transition hover:bg-laps-navy disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Entrando…" : "Entrar"}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>

            <p className="pt-4 text-center text-[11px] uppercase tracking-[0.24em] text-laps-navy/40">
              LAPS · UEMA
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  icon,
  htmlFor,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold uppercase tracking-[0.18em] text-laps-navy/65"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-laps-navy/40">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}
