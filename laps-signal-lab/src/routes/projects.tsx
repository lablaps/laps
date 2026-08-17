import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLang } from "@/hooks/use-lang";
import { PublicLayout } from "@/components/PublicLayout";
import { fetchProjects, type ApiProject } from "@/lib/api";
import { initials } from "@/lib/team-data";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  head: () => ({
    meta: [
      { title: "Projects — LAPS" },
      { name: "description", content: "Active research projects at LAPS — signal processing, AI, diagnostics." },
    ],
  }),
});

function ProjectsPage() {
  const { t, lang } = useLang();

  const { data: projects = [], isPending, isError } = useQuery<ApiProject[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
  });

  const [openProject, setOpenProject] = useState<ApiProject | null>(null);

  return (
    <PublicLayout>
      {/* ── HERO ───────────────────────────────────────────────────────────
          The badge above the title used to print t.projects.title, the same
          string as the H1 directly under it, and the paragraph below was a
          verbatim copy of the About page's opening. All three said one thing.
          The count is real data and earns its place; invented supporting copy
          would not. */}
      <section className="border-b border-laps-navy/15 bg-laps-paper">
        <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 lg:py-28">
          <p className="label-tech">/ {t.nav.projetos}</p>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-8 gap-y-3">
            <h1 className="font-display text-[clamp(2.25rem,5vw,4.25rem)] font-extrabold leading-[0.95] text-laps-navy">
              {t.projects.title}
            </h1>
            {projects.length > 0 && (
              <span className="tnum font-mono text-sm text-laps-navy/45">
                {String(projects.length).padStart(2, "0")}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── PROJECT INDEX ──────────────────────────────────────────────────
          A ruled index rather than a row of lifting cards. What went:
            - the coloured bar across the top of every card (a stripe cycling
              through three brand blues that encoded nothing — projects have a
              status, and the stripe was not it),
            - the Lucide flask/activity/cpu chip, cycled by position, so the
              same glyph meant a different project on every page load,
            - the shadow + hover -translate-y-1 lift, which made twelve peers
              all float at the same height.
          Status is the one thing here worth marking, so it is the one thing the
          accent colour is spent on. */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1280px] px-6 pb-24 md:px-10">
          {/* Loading, error and empty are real states here, not an afterthought.
              Previously all three rendered the same thing — a heading followed
              by nothing — so a reader could not tell a lab with no published
              projects from an API that was down. Each is set in the readout
              language the rest of the page uses. */}
          {isPending && (
            <div className="border-t border-laps-navy/15 py-16">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-laps-navy/45">
                {lang === "pt" ? "Carregando projetos…" : lang === "fr" ? "Chargement des projets…" : "Loading projects…"}
              </p>
              {/* Three skeleton rows on the same grid the cells use, so the page
                  does not jump when the data lands. */}
              <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((n) => (
                  <div key={n} className="space-y-3" aria-hidden>
                    <div className="h-3 w-8 animate-pulse bg-laps-navy/10" />
                    <div className="h-5 w-3/4 animate-pulse bg-laps-navy/10" />
                    <div className="h-3 w-full animate-pulse bg-laps-navy/[0.07]" />
                    <div className="h-3 w-5/6 animate-pulse bg-laps-navy/[0.07]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isError && !isPending && (
            <div className="border-t-2 border-laps-signal py-16">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-laps-signal">
                {lang === "pt" ? "Falha ao carregar" : lang === "fr" ? "Échec du chargement" : "Failed to load"}
              </p>
              <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-laps-navy/70">
                {lang === "pt"
                  ? "Não foi possível obter a lista de projetos. Atualize a página para tentar novamente."
                  : lang === "fr"
                    ? "Impossible de récupérer la liste des projets. Actualisez la page pour réessayer."
                    : "Could not fetch the project list. Reload the page to try again."}
              </p>
            </div>
          )}

          {!isPending && !isError && projects.length === 0 && (
            <div className="border-t border-laps-navy/15 py-16">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-laps-navy/45">
                {lang === "pt" ? "Nenhum projeto publicado" : lang === "fr" ? "Aucun projet publié" : "No published projects"}
              </p>
              <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-laps-navy/65">
                {lang === "pt"
                  ? "Os projetos do laboratório ainda não foram publicados aqui."
                  : lang === "fr"
                    ? "Les projets du laboratoire n'ont pas encore été publiés ici."
                    : "The lab's projects have not been published here yet."}
              </p>
            </div>
          )}

          {/* The top rule belongs to the rows; without it the empty state would
              sit under a stray hairline that framed nothing. */}
          <div
            className={`grid md:grid-cols-2 lg:grid-cols-3 ${
              projects.length > 0 ? "border-t border-laps-navy/15" : ""
            }`}
          >
            {projects.map((p, i) => {
              const title = pickI18n(p, lang, "title");
              const description = pickI18n(p, lang, "description");
              const isActive = p.status === "ACTIVE";
              return (
                <article
                  key={p.id}
                  onClick={() => setOpenProject(p)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenProject(p);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={title}
                  className={[
                    "group relative flex cursor-pointer flex-col border-b border-laps-navy/15 py-8 pr-8 transition-colors hover:bg-laps-ghost/50",
                    i % 2 === 1 ? "md:border-l md:border-laps-navy/15 md:pl-8" : "",
                    i % 3 !== 0 ? "lg:border-l lg:border-laps-navy/15 lg:pl-8" : "lg:border-l-0 lg:pl-0",
                  ].join(" ")}
                >
                  <span className="absolute left-0 top-0 h-0.5 w-0 bg-laps-signal transition-all duration-300 group-hover:w-full" />

                  <div className="flex items-baseline justify-between gap-4">
                    <span className="tnum font-mono text-sm font-medium text-laps-navy/35">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex items-baseline gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em]">
                      {p.year && <span className="tnum text-laps-navy/45">{p.year}</span>}
                      <span className={isActive ? "text-laps-signal" : "text-laps-navy/40"}>
                        {isActive ? t.projects.status.active : t.projects.status.done}
                      </span>
                    </span>
                  </div>

                  <h3 className="font-display mt-5 text-xl font-bold leading-tight text-laps-navy">
                    {title}
                  </h3>

                  {p.tags && p.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-sm border border-laps-navy/20 px-2 py-0.5 font-mono text-[10px] font-medium text-laps-navy/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-4 line-clamp-4 flex-1 text-sm leading-relaxed text-laps-navy/65">
                    {description}
                  </p>

                  <div className="mt-6 flex items-end justify-between gap-4 border-t border-laps-navy/15 pt-5">
                    <div>
                      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-laps-navy/40">
                        {lang === "pt" ? "Orientadores" : lang === "fr" ? "Directeurs" : "Advisors"}
                      </span>
                      <div className="mt-2 flex -space-x-1.5">
                        {p.leaders?.slice(0, 5).map((l) => {
                          if (!l.member) return null;
                          return (
                            <div
                              key={l.member.id}
                              className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface bg-laps-ghost"
                              title={`${l.member.fullName} (${l.role})`}
                            >
                              {l.member.photoUrl ? (
                                <img src={l.member.photoUrl} alt={l.member.fullName} className="h-full w-full object-cover" />
                              ) : (
                                <span className="font-mono text-[10px] font-semibold text-laps-navy/70">
                                  {initials(l.member.fullName)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/*
                      "Learn more" only when the project has an external article/dataset link.
                      Stops click propagation so the card-level detail dialog doesn't also open.
                     */}
                    {p.articleUrl ? (
                      <a
                        href={p.articleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-laps-navy/60 transition-colors hover:text-laps-signal"
                      >
                        {lang === "pt" ? "Saiba mais" : lang === "fr" ? "En savoir plus" : "Learn more"}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-laps-navy/60">
                        {lang === "pt" ? "Detalhes" : lang === "fr" ? "Détails" : "Details"}
                        <span className="h-px w-6 bg-laps-navy/30 transition-all duration-300 group-hover:w-10 group-hover:bg-laps-signal" />
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {openProject && (
        <ProjectDetailDialog
          project={openProject}
          onClose={() => setOpenProject(null)}
        />
      )}

      {/* ── COLLABORATION CTA ──────────────────────────────────────────────
          Same full-bleed ink band as /aboutus, deliberately: the two pages have
          the same closing move, so it should look like the same move rather
          than a second gradient panel with its own badge and radius. */}
      <section className="bg-laps-ink text-white">
        <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-laps-signal-ink">
                {t.nav.contato}
              </p>
              <h2 className="font-display mt-5 text-[clamp(1.75rem,3.2vw,2.75rem)] font-extrabold leading-[1] text-white">
                {t.structure.researchersTitle}
              </h2>
              <p className="mt-5 max-w-[52ch] text-sm leading-relaxed text-white/70 md:text-base">
                {t.structure.body}
              </p>
            </div>
            <div className="lg:col-span-5 lg:justify-self-end">
              <Link
                to="/contact"
                className="inline-flex h-12 items-center rounded-md bg-white px-7 text-sm font-semibold text-laps-ink transition-colors duration-150 hover:bg-laps-signal hover:text-white active:translate-y-px"
              >
                {t.nav.contato}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

/**
 * Pick the most readable string for the current language with English as the
 * public default (per user spec). Falls back across PT/FR/EN so nothing renders
 * empty if a translation hasn't been filled in yet.
 */
function pickI18n(p: ApiProject, lang: "pt" | "en" | "fr", kind: "title" | "description"): string {
  const en = kind === "title" ? p.titleEn : p.descriptionEn;
  const pt = kind === "title" ? p.titlePt : p.descriptionPt;
  const fr = kind === "title" ? p.titleFr : p.descriptionFr;
  if (lang === "pt") return pt || en || fr || "";
  if (lang === "fr") return fr || en || pt || "";
  return en || pt || fr || "";
}

// ───── Detail dialog ─────
// Left panel: full project info. Right panel: lead researchers grouped by role.

function ProjectDetailDialog({
  project,
  onClose,
}: {
  project: ApiProject;
  onClose: () => void;
}) {
  const { t, lang } = useLang();
  const title = pickI18n(project, lang, "title");
  const description = pickI18n(project, lang, "description");

  // Sort leaders so LEAD > CO_LEAD > RESEARCHER, then by name.
  const ranked = [...(project.leaders ?? [])].sort((a, b) => {
    const order: Record<string, number> = { LEAD: 0, CO_LEAD: 1, RESEARCHER: 2 };
    const da = order[a.role] ?? 99;
    const db = order[b.role] ?? 99;
    if (da !== db) return da - db;
    return (a.member?.fullName ?? "").localeCompare(b.member?.fullName ?? "");
  });

  const roleLabel = (role: string) => {
    if (role === "LEAD") return lang === "pt" ? "Orientador" : lang === "fr" ? "Directeur" : "Advisor";
    if (role === "CO_LEAD") return lang === "pt" ? "Co-orientador" : lang === "fr" ? "Co-directeur" : "Co-Advisor";
    return lang === "pt" ? "Pesquisador" : lang === "fr" ? "Chercheur" : "Researcher";
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-5xl overflow-hidden rounded-md border border-laps-navy/25 bg-surface p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className="flex flex-col md:h-[82vh] md:max-h-[760px] md:flex-row">
          {/* LEFT — project info */}
          <div className="relative flex flex-col overflow-y-auto border-b border-laps-navy/15 md:w-7/12 md:border-b-0 md:border-r">
            {/* One 2px signal rule instead of a gradient bar: the dialog is the
                focused surface, and that is what the accent marks throughout. */}
            <div className="h-0.5 shrink-0 bg-laps-signal" />

            <div className="flex flex-col gap-5 p-8">
              <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] font-medium uppercase tracking-[0.12em]">
                <span className={project.status === "ACTIVE" ? "text-laps-signal" : "text-laps-navy/45"}>
                  {project.status === "ACTIVE" ? t.projects.status.active : t.projects.status.done}
                </span>
                {project.year && <span className="tnum text-laps-navy/50">{project.year}</span>}
                <span className="text-laps-navy/35">/{project.slug}</span>
              </div>

              <h2 className="font-display text-2xl font-bold leading-tight text-laps-navy md:text-3xl">{title}</h2>

              <p className="whitespace-pre-line text-sm leading-relaxed text-laps-navy/75">{description}</p>

              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-sm border border-laps-navy/20 px-2 py-0.5 font-mono text-[10px] font-medium text-laps-navy/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {project.articleUrl && (
                <a
                  href={project.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex h-11 items-center gap-2 self-start rounded-md bg-laps-cta px-5 text-sm font-semibold text-white transition-colors hover:bg-laps-accent active:translate-y-px"
                >
                  {lang === "pt" ? "Acessar publicação" : lang === "fr" ? "Accéder à la publication" : "Open publication"}
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* RIGHT — researchers */}
          <div className="flex flex-col bg-laps-ghost/40 md:w-5/12">
            <div className="shrink-0 px-7 pb-3 pt-7">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-laps-navy/45">
                {lang === "pt" ? "Orientadores e equipe" : lang === "fr" ? "Direction et équipe" : "Advisors & Team"}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-7 pb-7">
              {ranked.length === 0 && (
                <p className="py-6 text-xs italic text-laps-navy/45">
                  {lang === "pt" ? "Nenhum pesquisador vinculado." : lang === "fr" ? "Aucun chercheur lié." : "No researchers linked."}
                </p>
              )}
              <div className="border-t border-laps-navy/15">
                {ranked.map((l) => {
                  if (!l.member) return null;
                  return (
                    <Link
                      key={l.member.id}
                      to="/team/$uuid"
                      params={{ uuid: l.member.id }}
                      onClick={onClose}
                      className="group flex items-center gap-3 border-b border-laps-navy/15 border-l-2 border-l-transparent py-3 pl-3 transition-colors hover:border-l-laps-signal hover:bg-surface"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-laps-ghost font-mono text-[10px] font-semibold text-laps-navy/70">
                        {l.member.photoUrl ? (
                          <img src={l.member.photoUrl} alt={l.member.fullName} className="h-full w-full object-cover" />
                        ) : (
                          initials(l.member.fullName)
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-laps-navy">{l.member.fullName}</div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-laps-navy/45">
                          {roleLabel(l.role)}
                        </div>
                        {l.contribution && (
                          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-laps-navy/60">
                            {l.contribution}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
