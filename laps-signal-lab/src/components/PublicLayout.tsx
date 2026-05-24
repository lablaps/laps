import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Linkedin, Github, MapPin, Mail, Menu, X, UserCircle2 } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { type Lang } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { WaveStrip } from "@/components/WaveStrip";
import lapsLogoColor from "@/assets/laps-logo.png";
import lapsLogoWhite from "@/assets/laps-logo1.png";

// Hand-drawn-ish inline flags. We render them in full color; the
// `desaturated` style on the parent button greys them out for the inactive
// state and the transition gives the user the vivid → muted feedback they
// asked for. Sizes are tuned to align with the PT/EN/FR text labels.
const FLAGS: Record<Lang, ReactNode> = {
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
      {/* 7 red stripes — stripes 1, 3, 5, 7, 9, 11, 13 of the 13-stripe field. */}
      <rect y="0" width="60" height="3.08" fill="#B22234" />
      <rect y="6.15" width="60" height="3.08" fill="#B22234" />
      <rect y="12.31" width="60" height="3.08" fill="#B22234" />
      <rect y="18.46" width="60" height="3.08" fill="#B22234" />
      <rect y="24.62" width="60" height="3.08" fill="#B22234" />
      <rect y="30.77" width="60" height="3.08" fill="#B22234" />
      <rect y="36.92" width="60" height="3.08" fill="#B22234" />
      {/* Blue canton — sized to overlay the top 7 stripes. */}
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

function LangSwitcher({
  lang,
  setLang,
  dark = false,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  dark?: boolean;
}) {
  const codes: Lang[] = ["pt", "en", "fr"];
  const idSuffix = dark ? "footer" : "header";

  return (
    <div
      className={`relative inline-flex w-fit items-center p-0.5 rounded-full transition-all duration-300 ${dark
        ? "bg-white/5 border border-white/10"
        : "bg-laps-navy/5 border border-laps-navy/5"
        }`}
    >
      {codes.map((c) => {
        const active = lang === c;
        return (
          <button
            key={c}
            onClick={() => setLang(c)}
            className="relative flex items-center justify-center h-7 w-9 rounded-full transition-all z-10"
            aria-label={`Switch to ${c.toUpperCase()}`}
          >
            {active && (
              <motion.div
                layoutId={`active-lang-bg-${idSuffix}`}
                className={`absolute inset-0 rounded-full shadow-sm ${dark ? "bg-white/15" : "bg-white"
                  }`}
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
              {FLAGS[c]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const { lang, setLang, t } = useLang();
  const auth = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  type NavItem = {
    to: string;
    label: string;
    matchPrefix?: string;
    /** When set, hovering the item on desktop reveals a dropdown with these links. */
    submenu?: { to: string; label: string }[];
  };

  const navItems: NavItem[] = [
    { to: "/team", label: t.nav.equipe, matchPrefix: "/team" },
    { to: "/aboutus", label: t.nav.sobre },
    { to: "/", label: t.nav.home },
    {
      to: "/projects",
      label: t.nav.projetos,
      submenu: [
        { to: "/projects", label: t.nav.projetos },
        { to: "/exchange", label: t.nav.intercambio },
      ],
    },
    { to: "/contact", label: t.nav.contato },
  ];

  const isActive = (to: string, prefix?: string) => {
    if (prefix) return pathname.startsWith(prefix);
    return pathname === to;
  };

  return (
    <div className="min-h-screen bg-white text-laps-navy">
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled
          ? "border-b border-laps-navy/8 bg-white/75 shadow-[0_2px_20px_rgba(25,58,89,0.06)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
          }`}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-6 py-3 md:grid-cols-[1fr_auto_1fr]">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={lapsLogoColor} alt="LAPS" className="h-14 w-auto" />
          </Link>

          <nav
            className={`relative hidden items-center justify-center gap-0.5 rounded-full p-1 md:flex ${scrolled
              ? "border border-laps-navy/10 bg-white/60"
              : "border border-laps-navy/8 bg-white/40 backdrop-blur"
              }`}
          >
            {navItems.map((it) => {
              const submenuActive = it.submenu?.some((s) => pathname === s.to);
              const active = isActive(it.to, it.matchPrefix) || !!submenuActive;
              const pill = (
                <>
                  {active && (
                    <>
                      <motion.span
                        layoutId="nav-pill-outer"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-0 -z-10 rounded-full bg-laps-blue/30"
                      />
                      <motion.span
                        layoutId="nav-pill-inner"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-[1.5px] -z-10 rounded-full bg-white"
                      />
                    </>
                  )}
                  <span
                    className={`relative inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${active ? "text-laps-blue" : "text-laps-navy/70 hover:text-laps-navy"
                      }`}
                  >
                    {it.label}
                  </span>
                </>
              );

              if (it.submenu) {
                // Hover-driven submenu. The wrapping div owns the :hover state so
                // the dropdown stays visible while the cursor moves into it.
                return (
                  <div key={it.to} className="group relative">
                    <Link
                      to={it.to}
                      className="relative isolate block px-1 py-1"
                      aria-current={active ? "page" : undefined}
                    >
                      {pill}
                    </Link>
                    <div
                      className="invisible absolute left-1/2 top-full z-50 mt-1 w-56 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      <div className="rounded-2xl border border-laps-navy/10 bg-white/95 p-1.5 shadow-[0_10px_30px_rgba(11,78,141,0.18)] backdrop-blur-xl">
                        {it.submenu.map((sub) => {
                          const subActive = pathname === sub.to;
                          return (
                            <Link
                              key={sub.to}
                              to={sub.to}
                              className={`block rounded-xl px-3 py-2 text-sm font-semibold transition ${subActive
                                ? "bg-laps-blue/10 text-laps-blue"
                                : "text-laps-navy/80 hover:bg-laps-ghost hover:text-laps-blue"
                                }`}
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className="relative isolate px-1 py-1"
                  aria-current={active ? "page" : undefined}
                >
                  {pill}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center justify-end gap-2 md:flex">
            {auth.isAuthenticated && (
              <Link
                to={auth.isManager ? "/admin" : "/portal"}
                title={auth.isManager ? t.nav.admin : t.nav.portal}
                className="inline-flex items-center gap-1.5 rounded-full border border-laps-navy/15 bg-white/70 px-3 py-1.5 text-xs font-semibold text-laps-navy backdrop-blur transition hover:border-laps-blue/40 hover:text-laps-blue"
              >
                <UserCircle2 className="h-4 w-4" />
                {auth.isManager ? t.nav.admin : t.nav.portal}
              </Link>
            )}
            {!auth.isAuthenticated && (
              <Link
                to="/login"
                title={t.nav.login}
                className="inline-flex items-center gap-1.5 rounded-full border border-laps-navy/15 bg-white/70 px-3 py-1.5 text-xs font-semibold text-laps-navy backdrop-blur transition hover:border-laps-blue/40 hover:text-laps-blue"
              >
                <UserCircle2 className="h-4 w-4" />
                {t.nav.login}
              </Link>
            )}
            <LangSwitcher lang={lang} setLang={setLang} />
          </div>

          <button
            type="button"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-laps-navy/15 bg-white/60 text-laps-navy backdrop-blur md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden">
            <nav className="mx-auto mt-1 flex max-w-7xl flex-col gap-1 rounded-2xl border border-laps-navy/10 bg-white/85 px-3 py-3 backdrop-blur-xl">
              {navItems.flatMap((it) => {
                // Mobile flattens the submenu into siblings so users don't need
                // to deal with a hover/long-press affordance on touch devices.
                const links = it.submenu ?? [{ to: it.to, label: it.label }];
                return links.map((sub) => {
                  const active = isActive(sub.to, it.matchPrefix);
                  return (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${active
                        ? "bg-laps-blue text-white shadow-[0_4px_14px_rgba(11,78,141,0.25)]"
                        : "text-laps-navy/75 hover:bg-laps-ghost"
                        }`}
                    >
                      {sub.label}
                    </Link>
                  );
                });
              })}
              {auth.isAuthenticated ? (
                <Link
                  to={auth.isManager ? "/admin" : "/portal"}
                  className="mx-2 inline-flex items-center gap-1.5 rounded-full border border-laps-navy/15 bg-white px-4 py-2 text-sm font-semibold text-laps-navy"
                >
                  <UserCircle2 className="h-4 w-4" />
                  {auth.isManager ? t.nav.admin : t.nav.portal}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="mx-2 inline-flex items-center gap-1.5 rounded-full border border-laps-navy/15 bg-white px-4 py-2 text-sm font-semibold text-laps-navy"
                >
                  <UserCircle2 className="h-4 w-4" />
                  {t.nav.login}
                </Link>
              )}
              <div className="px-2 pt-2">
                <LangSwitcher lang={lang} setLang={setLang} />
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="pt-[68px]">{children}</main>

      <footer className="relative bg-laps-navy text-white">
        <WaveStrip className="absolute left-0 right-0 top-0 h-12 -translate-y-1/2" color1="#0B4E8D" color2="#74B5F2" />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-8">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <div className="inline-flex items-center justify-center">
                <img src={lapsLogoWhite} alt="LAPS" className="h-12 w-auto" />
              </div>
              <p className="mt-4 text-xs font-light uppercase tracking-[0.2em] text-laps-light">
                {t.tagline}
              </p>
              <p className="mt-5 max-w-xs text-sm text-white/70">{t.footer.desc}</p>
              <div className="mt-6 flex gap-3">
                {[
                  {
                    Icon: Linkedin,
                    href: "https://www.linkedin.com/company/laborat%C3%B3rio-de-aquisi%C3%A7%C3%A3o-e-processamento-de-sinais",
                    label: "LinkedIn",
                  },
                  { Icon: Github, href: "https://github.com/lablaps", label: "GitHub" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-laps-light hover:text-laps-light"
                  >
                    <social.Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-laps-light">
                {t.footer.navTitle}
              </h4>
              <ul className="mt-5 space-y-3 text-sm text-white/75">
                {navItems.map((it) => (
                  <li key={it.to}>
                    <Link to={it.to} className="transition hover:text-laps-light">
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-laps-light">
                {t.footer.contactTitle}
              </h4>
              <ul className="mt-5 space-y-3 text-sm text-white/75">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-laps-light" />
                  {t.footer.address}
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-laps-light" />
                  laps&#64;engcomp.uema.br
                </li>
              </ul>
              <div className="mt-6">
                <LangSwitcher lang={lang} setLang={setLang} dark />
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row">
            <span>{t.footer.rights}</span>
            <span>{t.footer.made}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
