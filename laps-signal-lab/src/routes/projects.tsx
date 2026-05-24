import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FlaskConical, Activity, Cpu, ExternalLink } from "lucide-react";
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
      { name: "description", content: "Active research projects at LAPS — biomedical signals, AI, diagnostics." },
    ],
  }),
});

const projectAccents = ["#0B4E8D", "#74B5F2", "#193A59"];
const projectIcons = [FlaskConical, Activity, Cpu];

function ProjectsPage() {
  const { t, lang } = useLang();

  const { data: projects = [] } = useQuery<ApiProject[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
  });

  const [openProject, setOpenProject] = useState<ApiProject | null>(null);

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative bg-gradient-to-b from-laps-ghost/40 via-white to-white py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-block rounded-full bg-laps-ghost px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-laps-blue">
            {t.projects.title}
          </span>
          <h1 className="font-display mt-6 text-4xl font-bold text-laps-navy md:text-5xl">
            {t.projects.title}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-laps-navy/75 md:text-lg">
            {t.about.body}
          </p>
        </div>
      </section>

      {/* PROJECT CARDS */}
      <section className="bg-white pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {projects.map((p, i) => {
              const Icon = projectIcons[i % projectIcons.length];
              const title = pickI18n(p, lang, "title");
              const description = pickI18n(p, lang, "description");
              return (
                <article
                  key={p.id}
                  onClick={() => setOpenProject(p)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-laps-light/25 bg-white shadow-[0_2px_20px_rgba(25,58,89,0.06)] transition hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(11,78,141,0.16)] cursor-pointer"
                >
                  <div className="h-1.5 shrink-0" style={{ background: projectAccents[i % projectAccents.length] }} />
                  <div className="flex flex-col flex-1 p-7">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-laps-ghost text-laps-blue">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        {p.year && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-laps-navy/45">
                            {p.year}
                          </span>
                        )}
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            p.status === "ACTIVE" ? "bg-laps-blue/10 text-laps-blue" : "bg-laps-ghost text-laps-navy/60"
                          }`}
                        >
                          {p.status === "ACTIVE" ? t.projects.status.active : t.projects.status.done}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-laps-navy leading-tight">{title}</h3>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-laps-blue/15 bg-laps-ghost/40 px-2 py-1 text-[10px] font-semibold text-laps-navy/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-laps-navy/70 flex-1 line-clamp-4">{description}</p>

                    <div className="mt-6 flex items-center justify-between border-t border-laps-light/30 pt-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-laps-navy/40">
                          {lang === "pt" ? "Orientadores" : lang === "fr" ? "Directeurs" : "Advisors"}
                        </span>
                        <div className="flex -space-x-2">
                          {p.leaders?.slice(0, 5).map((l) => {
                            if (!l.member) return null;
                            return (
                              <div
                                key={l.member.id}
                                className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-laps-ghost shadow-sm"
                                title={`${l.member.fullName} (${l.role})`}
                              >
                                {l.member.photoUrl ? (
                                  <img src={l.member.photoUrl} alt={l.member.fullName} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="text-[10px] font-bold text-laps-blue">{initials(l.member.fullName)}</span>
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
                          className="inline-flex self-end items-center gap-1 text-sm font-semibold text-laps-blue transition group-hover:text-laps-navy"
                        >
                          {lang === "pt" ? "Saiba mais" : lang === "fr" ? "En savoir plus" : "Learn more"} <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="inline-flex self-end items-center gap-1 text-sm font-semibold text-laps-blue/80 transition group-hover:text-laps-navy">
                          {lang === "pt" ? "Detalhes" : lang === "fr" ? "Détails" : "Details"} <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </div>
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

      {/* COLLABORATION CTA */}
      <section className="bg-laps-ghost/40 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-laps-navy to-laps-blue p-10 text-center text-white md:p-14">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-laps-light backdrop-blur">
              {t.nav.contato}
            </span>
            <h2 className="font-display mt-5 text-2xl font-bold md:text-3xl">
              {t.structure.researchersTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 md:text-base">
              {t.structure.body}
            </p>
            <Link
              to="/contact"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-laps-navy shadow-lg transition hover:bg-laps-light hover:text-white"
            >
              {t.nav.contato} <ArrowRight className="h-4 w-4" />
            </Link>
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
      <DialogContent className="overflow-hidden rounded-3xl border border-laps-blue/15 bg-white p-0 shadow-[0_20px_60px_-20px_rgba(11,78,141,0.45)] w-[95vw] max-w-5xl">
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className="flex flex-col md:h-[82vh] md:max-h-[760px] md:flex-row">
          {/* LEFT — project info */}
          <div className="relative flex flex-col md:w-7/12 overflow-y-auto border-b md:border-b-0 md:border-r border-laps-blue/10">
            <div className="relative h-2 shrink-0 bg-gradient-to-r from-laps-navy to-laps-blue" />

            <div className="flex flex-col gap-5 p-8">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                <span className={`rounded-full px-2.5 py-1 ${project.status === "ACTIVE" ? "bg-laps-blue/10 text-laps-blue" : "bg-laps-ghost text-laps-navy/60"}`}>
                  {project.status === "ACTIVE" ? t.projects.status.active : t.projects.status.done}
                </span>
                {project.year && (
                  <span className="rounded-full bg-laps-ghost/60 px-2.5 py-1 text-laps-navy/70">{project.year}</span>
                )}
                <span className="text-laps-navy/40">/{project.slug}</span>
              </div>

              <h2 className="font-display text-2xl font-bold text-laps-navy md:text-3xl leading-tight">{title}</h2>

              <p className="text-sm leading-relaxed text-laps-navy/75 whitespace-pre-line">{description}</p>

              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-laps-blue/15 bg-laps-ghost/40 px-2 py-1 text-[10px] font-semibold text-laps-navy/70"
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
                  className="mt-2 inline-flex items-center gap-2 self-start rounded-lg bg-laps-navy px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-laps-blue"
                >
                  {lang === "pt" ? "Acessar publicação" : lang === "fr" ? "Accéder à la publication" : "Open publication"}
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* RIGHT — researchers */}
          <div className="flex flex-col md:w-5/12 bg-laps-ghost/15">
            <div className="px-7 pt-7 pb-3 shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
                {lang === "pt" ? "Orientadores e equipe" : lang === "fr" ? "Direction et équipe" : "Advisors & Team"}
              </p>
            </div>
            <div className="px-7 pb-7 flex-1 overflow-y-auto space-y-2">
              {ranked.length === 0 && (
                <p className="text-xs text-laps-navy/45 italic py-6">
                  {lang === "pt" ? "Nenhum pesquisador vinculado." : lang === "fr" ? "Aucun chercheur lié." : "No researchers linked."}
                </p>
              )}
              {ranked.map((l) => {
                if (!l.member) return null;
                return (
                  <Link
                    key={l.member.id}
                    to="/team/$uuid"
                    params={{ uuid: l.member.id }}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl border border-laps-light/40 bg-white p-3 transition hover:border-laps-blue/30 hover:shadow-sm"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-laps-ghost text-xs font-bold text-laps-blue">
                      {l.member.photoUrl ? (
                        <img src={l.member.photoUrl} alt={l.member.fullName} className="h-full w-full object-cover" />
                      ) : (
                        initials(l.member.fullName)
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-laps-navy">{l.member.fullName}</div>
                      <div className="text-[10px] uppercase tracking-wider text-laps-navy/45">{roleLabel(l.role)}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-laps-navy/30 group-hover:text-laps-blue" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
