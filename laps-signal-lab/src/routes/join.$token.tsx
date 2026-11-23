import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import {
  User, Mail, Lock, Eye, EyeOff, Linkedin, Github, BookOpen,
  Camera, Loader2, AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { api, ApiError, type MemberRole } from "@/lib/api";
import { type Lang } from "@/lib/i18n";
import { LANG_FLAGS } from "@/lib/lang-flags";
import { useInvalidateAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import LapsLogoMono from "@/components/LapsLogoMono";

export const Route = createFileRoute("/join/$token")({
  component: JoinPage,
  head: () => ({
    meta: [
      { title: "Juntar-se ao LAPS" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

// ───── i18n ─────

// The invite page is deliberately outside PublicLayout — no nav, no footer, so
// nothing distracts from the one form. That is also how it ended up with its
// own broken copy of the flags. It now shares the site's set; only the
// switcher chrome below is local, because this one sits on a dark panel.
type JoinLang = Lang;

const JOIN_COPY = {
  pt: {
    headline: "Junte-se ao LAPS",
    sub: "Preencha seus dados para criar sua conta e fazer parte do laboratório.",
    bioPlaceholder: "Escreva uma breve apresentação em português…",
    bioLabel: "Sobre você (Português)",
    fullName: "Nome completo",
    email: "E-mail",
    password: "Senha",
    confirmPassword: "Confirmar senha",
    photo: "Foto de perfil (opcional)",
    linkedin: "LinkedIn",
    lattes: "Lattes",
    github: "GitHub",
    submit: "Criar conta",
    submitting: "Criando conta…",
    successMsg: "Conta criada! Bem-vindo ao LAPS.",
    roleLabel: "Você está sendo convidado como",
    bioTitle: "Sobre você",
    linksTitle: "Redes e perfis",
    passwordMismatch: "As senhas não coincidem.",
    passwordShort: "Senha deve ter no mínimo 8 caracteres.",
    errorInvalid: "Este link de convite é inválido ou expirou.",
    errorUsed: "Este link de convite já foi utilizado.",
    errorGeneric: "Não foi possível criar sua conta. Tente novamente.",
    errorEmail: "Este e-mail já está em uso.",
    bioHint: "Selecione o idioma da sua bio:",
  },
  en: {
    headline: "Join LAPS",
    sub: "Fill in your details to create an account and become part of the lab.",
    bioPlaceholder: "Write a brief introduction in English…",
    bioLabel: "About you (English)",
    fullName: "Full name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    photo: "Profile photo (optional)",
    linkedin: "LinkedIn",
    lattes: "Lattes",
    github: "GitHub",
    submit: "Create account",
    submitting: "Creating account…",
    successMsg: "Account created! Welcome to LAPS.",
    roleLabel: "You are being invited as",
    bioTitle: "About you",
    linksTitle: "Networks & profiles",
    passwordMismatch: "Passwords do not match.",
    passwordShort: "Password must be at least 8 characters.",
    errorInvalid: "This invite link is invalid or has expired.",
    errorUsed: "This invite link has already been used.",
    errorGeneric: "Could not create your account. Please try again.",
    errorEmail: "This email is already in use.",
    bioHint: "Choose the language of your bio:",
  },
  fr: {
    headline: "Rejoindre le LAPS",
    sub: "Remplissez vos informations pour créer un compte et rejoindre le laboratoire.",
    bioPlaceholder: "Rédigez une brève présentation en français…",
    bioLabel: "À propos de vous (Français)",
    fullName: "Nom complet",
    email: "E-mail",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    photo: "Photo de profil (optionnel)",
    linkedin: "LinkedIn",
    lattes: "Lattes",
    github: "GitHub",
    submit: "Créer un compte",
    submitting: "Création du compte…",
    successMsg: "Compte créé ! Bienvenue au LAPS.",
    roleLabel: "Vous êtes invité(e) en tant que",
    bioTitle: "À propos de vous",
    linksTitle: "Réseaux et profils",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    passwordShort: "Le mot de passe doit comporter au moins 8 caractères.",
    errorInvalid: "Ce lien d'invitation est invalide ou a expiré.",
    errorUsed: "Ce lien d'invitation a déjà été utilisé.",
    errorGeneric: "Impossible de créer votre compte. Veuillez réessayer.",
    errorEmail: "Cet e-mail est déjà utilisé.",
    bioHint: "Choisissez la langue de votre biographie :",
  },
} as const;

const ROLE_LABELS: Record<MemberRole, Record<JoinLang, string>> = {
  UNDERGRAD:   { pt: "Graduação", en: "Undergraduate", fr: "Licence" },
  MASTER:      { pt: "Mestrado", en: "Master's", fr: "Master" },
  DOCTORATE:   { pt: "Doutorado", en: "Doctorate", fr: "Doctorat" },
  COLLABORATOR:{ pt: "Colaborador", en: "Collaborator", fr: "Collaborateur" },
  HEAD:        { pt: "Diretor", en: "Head", fr: "Directeur" },
};

// ───── LangSwitcher ─────

function JoinLangSwitcher({ lang, setLang }: { lang: JoinLang; setLang: (l: JoinLang) => void }) {
  const codes: JoinLang[] = ["pt", "en", "fr"];
  return (
    <div className="relative inline-flex w-fit items-center p-0.5 rounded-full bg-white/10 border border-white/15">
      {codes.map((c) => {
        const active = lang === c;
        return (
          <button
            key={c}
            type="button"
            onClick={() => setLang(c)}
            className="relative flex items-center justify-center h-7 w-9 rounded-full transition-all z-10"
            aria-pressed={active}
          >
            {active && (
              <motion.div
                layoutId="join-active-lang"
                className="absolute inset-0 rounded-full bg-white/20 shadow-sm"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span
              className="relative transition-all duration-300"
              style={{
                filter: active ? "saturate(1) brightness(1)" : "saturate(0) opacity(0.45)",
                transform: active ? "scale(1.05)" : "scale(0.85)",
              }}
            >
              {LANG_FLAGS[c]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ───── Page ─────

function JoinPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const router = useRouter();
  const invalidateAuth = useInvalidateAuth();

  const [lang, setLang] = useState<JoinLang>("pt");
  const c = JOIN_COPY[lang];

  const [inviteState, setInviteState] = useState<"loading" | "valid" | "invalid" | "used">("loading");
  const [inviteRole, setInviteRole] = useState<MemberRole | null>(null);

  // Form fields
  const [fullName, setFullName]         = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPass, setConfirmPass]   = useState("");
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [bio, setBio]                   = useState("");
  const [bioLang, setBioLang]           = useState<JoinLang>("pt");
  const [linkedinUrl, setLinkedinUrl]   = useState("");
  const [lattesUrl, setLattesUrl]       = useState("");
  const [githubUrl, setGithubUrl]       = useState("");
  const [photoFile, setPhotoFile]       = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting]     = useState(false);

  // Validate token on load
  useEffect(() => {
    api.inviteInfo(token)
      .then((info) => {
        setInviteRole(info.role);
        setInviteState("valid");
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 410) {
          setInviteState("used");
        } else {
          setInviteState("invalid");
        }
      });
  }, [token]);

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    if (password.length < 8) { toast.error(c.passwordShort); return; }
    if (password !== confirmPass) { toast.error(c.passwordMismatch); return; }

    setSubmitting(true);
    try {
      await api.inviteRegister(token, {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        bio: bio.trim() || undefined,
        bioLang,
        linkedinUrl: linkedinUrl.trim() || undefined,
        lattesUrl: lattesUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
      });

      // After register the auth cookie is set — upload photo if provided.
      if (photoFile) {
        try {
          const { url } = await api.meUploadPhoto(photoFile);
          await api.meUpdate({ photoUrl: url });
        } catch {
          // Non-fatal — user can change their photo in the portal.
        }
      }

      await invalidateAuth();
      await router.invalidate();
      toast.success(c.successMsg);
      navigate({ to: "/portal" });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error(c.errorEmail);
        } else if (err.status === 410) {
          toast.error(c.errorUsed);
        } else {
          toast.error(c.errorGeneric);
        }
      } else {
        toast.error(c.errorGeneric);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Left — branded panel. Matches /login exactly: flat ink and a dot grid
          rather than a radial gradient with two blurred colour orbs. The two
          screens are the same moment in the product and should not look like
          two different products. */}
      <aside className="relative flex flex-col justify-between overflow-hidden bg-laps-ink px-10 py-14 text-white lg:px-16 lg:py-20">
        <div className="absolute inset-0 opacity-[0.09] [background:radial-gradient(circle_at_1px_1px,#74B5F2_1px,transparent_0)_0_0/22px_22px]" />

        {/* Centred, matching /login exactly — the two screens are the same
            moment in the product and should not differ in composition. */}
        <div className="relative flex items-center justify-center gap-4">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-laps-signal-ink">
            Convite · LAPS
          </p>
          <JoinLangSwitcher lang={lang} setLang={setLang} />
        </div>

        <div className="relative mx-auto flex w-full max-w-md flex-col items-center text-center">
          <LapsLogoMono />
          <h1 className="font-display mt-10 text-3xl font-extrabold leading-[1.05] text-balance md:text-4xl">
            {c.headline}
          </h1>
          <p className="mt-5 max-w-[46ch] text-sm leading-relaxed text-pretty text-white/60">
            {c.sub}
          </p>
        </div>

        <div className="relative border-t border-white/15 pt-5 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-white/45">
          Laboratório para Aquisição e Processamento de Sinais · UEMA
        </div>
      </aside>

      {/* Right — form */}
      <section className="flex items-start justify-center overflow-y-auto bg-surface px-6 py-10 lg:px-12">
        <div className="w-full max-w-sm">
          {inviteState === "loading" && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-laps-navy/60">
              <Loader2 className="h-7 w-7 animate-spin" />
              <span className="text-sm">Verificando convite…</span>
            </div>
          )}

          {(inviteState === "invalid" || inviteState === "used") && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-200">
                <AlertCircle className="h-7 w-7 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-laps-navy">
                  {inviteState === "used" ? c.errorUsed : c.errorInvalid}
                </p>
                <p className="mt-1 text-xs text-laps-navy/55">
                  Entre em contato com o coordenador do laboratório.
                </p>
              </div>
            </div>
          )}

          {inviteState === "valid" && inviteRole && (
            <form onSubmit={onSubmit} noValidate className="space-y-6">
              <div className="mb-8 space-y-2">
                <span className="inline-block rounded-full bg-laps-ghost px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-laps-blue">
                  {c.roleLabel}: {ROLE_LABELS[inviteRole][lang]}
                </span>
                <h2 className="font-display text-2xl font-bold text-laps-navy">
                  {c.headline}
                </h2>
                <p className="text-sm text-laps-navy/60">{c.sub}</p>
              </div>

              {/* Photo */}
              <div className="flex flex-col items-center gap-3">
                <label className="relative cursor-pointer group">
                  <div className="h-20 w-20 rounded-full border-2 border-dashed border-laps-blue/30 bg-laps-ghost/40 flex items-center justify-center overflow-hidden transition group-hover:border-laps-blue/60">
                    {photoPreview ? (
                      <img src={photoPreview} alt="preview" className="h-full w-full object-cover" />
                    ) : (
                      <Camera className="h-7 w-7 text-laps-blue/40" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="sr-only"
                  />
                </label>
                <span className="text-[11px] text-laps-navy/50">{c.photo}</span>
              </div>

              {/* Full name */}
              <FormField label={c.fullName} icon={<User className="h-4 w-4" />} htmlFor="fullName">
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Maria Silva"
                  className="h-11 border-laps-navy/15 bg-surface pl-10 text-base text-laps-navy placeholder:text-laps-navy/35 focus-visible:ring-laps-blue"
                />
              </FormField>

              {/* Email */}
              <FormField label={c.email} icon={<Mail className="h-4 w-4" />} htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="maria@uema.br"
                  className="h-11 border-laps-navy/15 bg-surface pl-10 text-base text-laps-navy placeholder:text-laps-navy/35 focus-visible:ring-laps-blue"
                />
              </FormField>

              {/* Password */}
              <FormField
                label={c.password}
                icon={<Lock className="h-4 w-4" />}
                htmlFor="password"
                trailing={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass((v) => !v)}
                    className="pointer-events-auto absolute inset-y-0 right-3 flex items-center text-laps-navy/40 hover:text-laps-navy/70"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              >
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="h-11 border-laps-navy/15 bg-surface pl-10 pr-10 text-base text-laps-navy placeholder:text-laps-navy/35 focus-visible:ring-laps-blue"
                />
              </FormField>

              {/* Confirm password */}
              <FormField
                label={c.confirmPassword}
                icon={<Lock className="h-4 w-4" />}
                htmlFor="confirmPass"
                trailing={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="pointer-events-auto absolute inset-y-0 right-3 flex items-center text-laps-navy/40 hover:text-laps-navy/70"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              >
                <Input
                  id="confirmPass"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="h-11 border-laps-navy/15 bg-surface pl-10 pr-10 text-base text-laps-navy placeholder:text-laps-navy/35 focus-visible:ring-laps-blue"
                />
              </FormField>

              {/* Bio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-laps-navy/65">
                    {c.bioTitle}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-laps-navy/45">{c.bioHint}</span>
                    <div className="relative inline-flex items-center p-0.5 rounded-full bg-laps-ink/5 border border-laps-navy/5">
                      {(["pt", "en", "fr"] as JoinLang[]).map((bl) => (
                        <button
                          key={bl}
                          type="button"
                          onClick={() => setBioLang(bl)}
                          className="relative flex items-center justify-center h-6 w-8 rounded-full transition-all z-10"
                        >
                          {bioLang === bl && (
                            <motion.div
                              layoutId="join-bio-lang"
                              className="absolute inset-0 rounded-full bg-surface shadow-sm"
                              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                            />
                          )}
                          <span
                            className="relative transition-all duration-300"
                            style={{
                              filter: bioLang === bl ? "saturate(1)" : "saturate(0) opacity(0.4)",
                              transform: bioLang === bl ? "scale(1.05)" : "scale(0.85)",
                            }}
                          >
                            {LANG_FLAGS[bl]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={JOIN_COPY[bioLang].bioPlaceholder}
                  rows={4}
                  className="w-full rounded-md border border-laps-navy/15 bg-surface px-3 py-2 text-sm text-laps-navy placeholder:text-laps-navy/35 focus:outline-none focus:ring-2 focus:ring-laps-blue resize-none"
                />
              </div>

              {/* Links */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-laps-navy/65">
                  {c.linksTitle}
                </p>
                <FormField label={c.linkedin} icon={<Linkedin className="h-4 w-4" />} htmlFor="linkedin">
                  <Input
                    id="linkedin"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/…"
                    className="h-11 border-laps-navy/15 bg-surface pl-10 text-sm text-laps-navy placeholder:text-laps-navy/35 focus-visible:ring-laps-blue"
                  />
                </FormField>
                <FormField label="Lattes" icon={<BookOpen className="h-4 w-4" />} htmlFor="lattes">
                  <Input
                    id="lattes"
                    type="url"
                    value={lattesUrl}
                    onChange={(e) => setLattesUrl(e.target.value)}
                    placeholder="http://lattes.cnpq.br/…"
                    className="h-11 border-laps-navy/15 bg-surface pl-10 text-sm text-laps-navy placeholder:text-laps-navy/35 focus-visible:ring-laps-blue"
                  />
                </FormField>
                <FormField label={c.github} icon={<Github className="h-4 w-4" />} htmlFor="github">
                  <Input
                    id="github"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/…"
                    className="h-11 border-laps-navy/15 bg-surface pl-10 text-sm text-laps-navy placeholder:text-laps-navy/35 focus-visible:ring-laps-blue"
                  />
                </FormField>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-laps-cta px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-laps-accent active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {c.submitting}
                  </>
                ) : (
                  c.submit
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

// ───── FormField ─────

function FormField({
  label,
  icon,
  htmlFor,
  trailing,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  htmlFor: string;
  trailing?: React.ReactNode;
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
        {trailing}
      </div>
    </div>
  );
}
