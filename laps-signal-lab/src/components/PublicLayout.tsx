import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Linkedin, Github, MapPin, Mail, Menu, X, UserCircle2 } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { type Lang } from "@/lib/i18n";
import { LANG_FLAGS } from "@/lib/lang-flags";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/use-theme";
import { WaveStrip } from "@/components/WaveStrip";
import lapsLogoColor from "@/assets/laps-logo.png";
import lapsLogoWhite from "@/assets/laps-logo1.png";

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
      className={`relative inline-flex w-fit items-center rounded-md p-0.5 ${dark
        ? "border border-white/15 bg-white/5"
        : "border border-laps-navy/15 bg-transparent"
        }`}
    >
      {codes.map((c) => {
        const active = lang === c;
        return (
          <button
            key={c}
            onClick={() => setLang(c)}
            className="relative z-10 flex h-7 w-9 items-center justify-center rounded-sm transition-all"
            aria-label={`Switch to ${c.toUpperCase()}`}
          >
            {active && (
              <motion.div
                layoutId={`active-lang-bg-${idSuffix}`}
                className={`absolute inset-0 rounded-sm ${dark ? "bg-white/15" : "bg-laps-navy/10"
                  }`}
                transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              />
            )}
            <span
              className="relative transition-all duration-500"
              style={{
                filter: active ? "saturate(1) brightness(1)" : "saturate(0) opacity(0.3)",
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

export function PublicLayout({ children }: { children: ReactNode }) {
  const { lang, setLang, t } = useLang();
  const auth = useAuth();
  const { isDark } = useTheme();
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
    <div className="min-h-screen bg-surface text-laps-navy">
      {/* The blur stays — a bar sitting over scrolling content is the one place
          layering is real. What goes is the shadow: on a page whose structure is
          hairline rules, a soft drop shadow under the header reads as a
          different design system. A 1px rule does the same job in the same
          language. */}
      <header
        className={`fixed top-0 z-50 w-full transition-colors duration-300 ${scrolled
          ? "border-b border-laps-navy/15 bg-surface/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
          }`}
      >
        <div className="mx-auto grid max-w-[1600px] grid-cols-[1fr_auto] items-center gap-4 px-6 py-3 md:grid-cols-[1fr_auto_1fr] md:px-10 lg:px-16">
          <Link to="/" className="flex items-center gap-2.5">
            {/* The header background flips with the theme, so the mark has to
                as well. The white PNG already existed for the dark footer —
                dark mode just gives it a second home. */}
            <img
              src={isDark ? lapsLogoWhite : lapsLogoColor}
              alt="LAPS"
              className="h-14 w-auto"
            />
          </Link>

          {/* A tab rail, not a floating capsule. The rounded-full pill nav with
              a sliding pill behind the active item is the stock generated
              header; it also fought the page, which has no other pill shapes on
              it now. The active item is marked by a 2px rule in the signal
              colour — the same mark the section headers and the hover states
              use, so the whole site reads as one idea. */}
          <nav className="relative hidden items-center justify-center md:flex">
            {navItems.map((it) => {
              const submenuActive = it.submenu?.some((s) => pathname === s.to);
              const active = isActive(it.to, it.matchPrefix) || !!submenuActive;
              const pill = (
                <>
                  <span
                    className={`relative inline-flex items-center px-4 py-2 text-[13px] font-semibold transition-colors ${active ? "text-laps-navy" : "text-laps-navy/60 hover:text-laps-navy"
                      }`}
                  >
                    {it.label}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="nav-marker"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      className="absolute inset-x-2 bottom-0 h-0.5 bg-laps-signal"
                    />
                  )}
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
                      className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      <div className="rounded-md border border-laps-navy/20 bg-surface p-1">
                        {it.submenu.map((sub) => {
                          const subActive = pathname === sub.to;
                          return (
                            <Link
                              key={sub.to}
                              to={sub.to}
                              className={`block border-l-2 px-3 py-2 text-[13px] font-semibold transition-colors ${subActive
                                ? "border-laps-signal text-laps-navy"
                                : "border-transparent text-laps-navy/70 hover:border-laps-navy/30 hover:bg-laps-ghost hover:text-laps-navy"
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
            <ThemeToggle className="h-8 w-8 rounded-md border border-laps-navy/20" />
            {auth.isAuthenticated && (
              <Link
                to={auth.isManager ? "/admin" : "/portal"}
                title={auth.isManager ? t.nav.admin : t.nav.portal}
                className="inline-flex items-center gap-1.5 rounded-md border border-laps-navy/20 px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-laps-navy transition-colors hover:border-laps-navy hover:bg-laps-navy hover:text-white"
              >
                <UserCircle2 className="h-4 w-4" />
                {auth.isManager ? t.nav.admin : t.nav.portal}
              </Link>
            )}
            {!auth.isAuthenticated && (
              <Link
                to="/login"
                title={t.nav.login}
                className="inline-flex items-center gap-1.5 rounded-md border border-laps-navy/20 px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-laps-navy transition-colors hover:border-laps-navy hover:bg-laps-navy hover:text-white"
              >
                <UserCircle2 className="h-4 w-4" />
                {t.nav.login}
              </Link>
            )}
            <LangSwitcher lang={lang} setLang={setLang} />
          </div>

          <button
            type="button"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-md border border-laps-navy/20 bg-surface/60 text-laps-navy backdrop-blur md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden">
            <nav className="mx-auto mt-px flex flex-col border-t border-laps-navy/15 bg-surface/95 px-6 py-2 backdrop-blur-xl">
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
                      className={`border-l-2 px-4 py-3 text-sm font-semibold transition-colors ${active
                        ? "border-laps-signal text-laps-navy"
                        : "border-transparent text-laps-navy/70 hover:border-laps-navy/25 hover:text-laps-navy"
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
                  className="mx-4 mt-2 inline-flex items-center justify-center gap-1.5 rounded-md border border-laps-navy/25 px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-laps-navy"
                >
                  <UserCircle2 className="h-4 w-4" />
                  {auth.isManager ? t.nav.admin : t.nav.portal}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="mx-4 mt-2 inline-flex items-center justify-center gap-1.5 rounded-md border border-laps-navy/25 px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-laps-navy"
                >
                  <UserCircle2 className="h-4 w-4" />
                  {t.nav.login}
                </Link>
              )}
              <div className="flex items-center gap-2 px-2 pt-2">
                <LangSwitcher lang={lang} setLang={setLang} />
                <ThemeToggle />
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="pt-[68px]">{children}</main>

      <footer className="relative bg-laps-ink text-white">
        <WaveStrip className="absolute left-0 right-0 top-0 h-12 -translate-y-1/2" color1="#0B4E8D" color2="#74B5F2" />
        {/* Column headings are mono micro-labels rather than bold letter-spaced
            caps, and the columns are separated by rules instead of by gap
            alone — the footer is the last thing on every page, so it is where
            the grid should be most visible, not least. Content is unchanged:
            these are the lab's real links, address and inbox, which is why
            there is no newsletter box and no fourth column of invented links. */}
        <div className="mx-auto max-w-[1600px] px-6 pb-10 pt-20 md:px-10 lg:px-16">
          <div className="grid gap-12 border-t border-white/15 pt-10 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-5">
              <img src={lapsLogoWhite} alt="LAPS" className="h-11 w-auto" />
              <p className="mt-5 font-mono text-[10px] font-medium uppercase leading-relaxed tracking-[0.14em] text-laps-light">
                {t.tagline}
              </p>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/65">
                {t.footer.desc}
              </p>
              <div className="mt-7 flex gap-2">
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
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white/70 transition-colors hover:border-laps-signal-ink hover:text-laps-signal-ink"
                  >
                    <social.Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 md:border-l md:border-white/15 md:pl-8">
              <h4 className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
                {t.footer.navTitle}
              </h4>
              <ul className="mt-6 space-y-3.5 text-sm text-white/75">
                {navItems.map((it) => (
                  <li key={it.to}>
                    <Link
                      to={it.to}
                      className="transition-colors hover:text-laps-signal-ink"
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4 md:border-l md:border-white/15 md:pl-8">
              <h4 className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
                {t.footer.contactTitle}
              </h4>
              <ul className="mt-6 space-y-3.5 text-sm leading-relaxed text-white/75">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                  {t.footer.address}
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                  <a
                    href="mailto:laps@engcomp.uema.br"
                    className="transition-colors hover:text-laps-signal-ink"
                  >
                    laps&#64;engcomp.uema.br
                  </a>
                </li>
              </ul>
              <div className="mt-7">
                <LangSwitcher lang={lang} setLang={setLang} dark />
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-3 border-t border-white/15 pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40 md:flex-row md:justify-between">
            <span>{t.footer.rights}</span>
            <span>UEMA · São Luís · Maranhão</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
