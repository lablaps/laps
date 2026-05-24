import { createFileRoute, notFound, useNavigate, Link } from "@tanstack/react-router";
import {
  Linkedin,
  ExternalLink,
  Crown,
  Microscope,
  GraduationCap,
  Users,
  ArrowRight,
  ArrowLeft,
  Mail,
  Github,
  BookOpen,
  Calendar,
  Globe,
  Sparkles,
  FileText,
  Compass,
  UserCheck,
  Shield,
  Briefcase,
} from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { type Tier, initials, team as staticTeam } from "@/lib/team-data";
import { areas as researchAreas, type AreaSlug } from "@/lib/areas-data";
import { publications, publicationsByMember } from "@/lib/publications-data";
import {
  fetchMember,
  fetchMembers,
  fetchProjects,
  type ApiMember,
} from "@/lib/api";
import { applyOverlay, decoratePhotoUrl } from "@/lib/static-source";
import { PublicLayout } from "@/components/PublicLayout";

type Lang = "pt" | "en" | "fr";

const tierConfig: Record<
  Tier,
  { gradient: string; ring: string; chip: string; band: string; Icon: typeof Crown }
> = {
  head: {
    gradient: "from-laps-navy to-laps-blue",
    band: "from-laps-navy via-laps-blue to-laps-light",
    ring: "ring-laps-light/40",
    chip: "bg-gradient-to-r from-laps-navy to-laps-blue text-white",
    Icon: Crown,
  },
  coordinator: {
    gradient: "from-violet-700 to-violet-400",
    band: "from-violet-700 via-violet-400 to-violet-200",
    ring: "ring-violet-200",
    chip: "bg-violet-50 text-violet-700",
    Icon: Shield,
  },
  manager: {
    gradient: "from-purple-600 to-purple-300",
    band: "from-purple-600 via-purple-300 to-purple-100",
    ring: "ring-purple-200",
    chip: "bg-purple-50 text-purple-700",
    Icon: Briefcase,
  },
  doctorate: {
    gradient: "from-laps-blue to-laps-light",
    band: "from-laps-blue via-laps-light to-blue-200",
    ring: "ring-laps-blue/30",
    chip: "bg-laps-ghost text-laps-blue",
    Icon: Microscope,
  },
  master: {
    gradient: "from-emerald-500 to-emerald-300",
    band: "from-emerald-500 via-emerald-300 to-emerald-100",
    ring: "ring-emerald-200",
    chip: "bg-emerald-50 text-emerald-700",
    Icon: GraduationCap,
  },
  undergrad: {
    gradient: "from-amber-400 to-amber-200",
    band: "from-amber-400 via-amber-200 to-amber-50",
    ring: "ring-amber-200",
    chip: "bg-amber-50 text-amber-700",
    Icon: Users,
  },
};

const PUB_TYPE_LABELS: Record<string, { pt: string; en: string; fr: string }> = {
  JOURNAL: { pt: "Periódico", en: "Journal", fr: "Revue" },
  CONFERENCE: { pt: "Conferência", en: "Conference", fr: "Conférence" },
  WORKSHOP: { pt: "Workshop", en: "Workshop", fr: "Atelier" },
  DISSERTATION: { pt: "Dissertação", en: "MSc Dissertation", fr: "Mémoire" },
  THESIS: { pt: "Tese", en: "PhD Thesis", fr: "Thèse" },
};

export const Route = createFileRoute("/team/$uuid")({
  loader: async ({ params }) => {
    // Parallel fan-out: the detail view needs the member, the full roster
    // (for "Peers" + co-author chips), and all projects (for the Projects
    // section). One round-trip cost, three queries.
    const [memberRaw, allMembersRaw, apiProjects] = await Promise.all([
      fetchMember(params.uuid).catch(() => null),
      fetchMembers(),
      fetchProjects(),
    ]);
    if (!memberRaw) throw notFound();
    const member: ApiMember = { ...memberRaw, photoUrl: decoratePhotoUrl(memberRaw) };
    const allMembers = applyOverlay(allMembersRaw);
    return { member, allMembers, apiProjects };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { member } = loaderData;
    const title = `${member.fullName} — LAPS`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `${member.fullName} · LAPS — Laboratório de Aquisição e Processamento de Sinais`,
        },
        { property: "og:title", content: title },
        { property: "og:type", content: "profile" },
        ...(member.photoUrl ? [{ property: "og:image", content: member.photoUrl }] : []),
      ],
    };
  },
  component: TeamMemberPage,
});

function TeamMemberPage() {
  const data = Route.useLoaderData();
  const member = data.member as ApiMember;
  const allMembers = data.allMembers as ApiMember[];
  const apiProjects = data.apiProjects as Array<{
    id: string;
    status: string;
    tags?: string[];
    year?: number | null;
    articleUrl?: string | null;
    titlePt?: string;
    titleEn?: string;
    titleFr?: string;
    descriptionPt?: string;
    descriptionEn?: string;
    descriptionFr?: string;
    leaders?: Array<{ memberId: string; role?: string; member?: { slug?: string; id?: string } }>;
  }>;

  const { lang, t } = useLang();
  const navigate = useNavigate();
  const L = lang as Lang;
  const tx = TX[L];

  const tierMap: Record<string, Tier> = {
    HEAD: "head",
    COORDINATOR: "coordinator",
    MANAGER: "manager",
    DOCTORATE: "doctorate",
    MASTER: "master",
    UNDERGRAD: "undergrad",
  };
  const tierKey = tierMap[member.currentRole] ?? "undergrad";
  const cfg = tierConfig[tierKey];
  const { Icon } = cfg;

  const seed = staticTeam.find((s) => s.id === member.slug);
  const memberAreas: AreaSlug[] = seed?.areas ?? [];
  const tags = seed?.tags ?? [];

  const bioObj: Record<string, string | null> = {
    pt: member.bioPt,
    en: member.bioEn,
    fr: member.bioFr,
  };
  const bio = bioObj[lang] || member.bioPt;

  const labels = t.structure.network;

  // Publications: the seed data keys authors by slug; ApiMember's id is the
  // UUID, so we use slug here. Resolves to an empty list cleanly when nothing
  // has been seeded for this member yet.
  const pubs = publicationsByMember(member.slug);

  const memberProjects = apiProjects
    .filter((p) =>
      p.leaders?.some(
        (l) => l.memberId === member.id || l.member?.id === member.id || l.member?.slug === member.slug
      )
    )
    .map((p) => ({
      id: p.id,
      status: p.status,
      year: p.year ?? null,
      articleUrl: p.articleUrl ?? null,
      tags: p.tags || [],
      role:
        p.leaders?.find(
          (l) => l.memberId === member.id || l.member?.id === member.id || l.member?.slug === member.slug
        )?.role || "RESEARCHER",
      i18n: {
        pt: { title: p.titlePt || p.titleEn || "", description: p.descriptionPt || "" },
        en: { title: p.titleEn || p.titlePt || "", description: p.descriptionEn || "" },
        fr: { title: p.titleFr || p.titleEn || "", description: p.descriptionFr || "" },
      },
    }));

  // Co-authors derived from publications: anyone the member has published with
  // at least once. Cross-reference back to API for the photo.
  const coAuthorSlugs = new Set<string>();
  for (const pub of publications) {
    const authoredByMe = pub.authors.some((a) => a.memberId === member.slug);
    if (!authoredByMe) continue;
    for (const a of pub.authors) {
      if (a.memberId && a.memberId !== member.slug) coAuthorSlugs.add(a.memberId);
    }
  }
  const coAuthors = Array.from(coAuthorSlugs)
    .map((slug) => allMembers.find((m) => m.slug === slug))
    .filter((m): m is ApiMember => Boolean(m));

  const peers = allMembers
    .filter((m) => m.currentRole === member.currentRole && m.id !== member.id && m.status === "ACTIVE")
    .slice(0, 6);

  const roleStart = member.currentRoleStartedAt
    ? formatDate(member.currentRoleStartedAt, L)
    : null;

  const primaryContact = member.contactEmail || member.email;
  const hasAnyContact = !!(primaryContact || member.linkedinUrl || member.lattesUrl || member.githubUrl);
  const projectRoleLabel = (role: string) => {
    if (role === "LEAD") return tx.projectRoleLead;
    if (role === "CO_LEAD") return tx.projectRoleCoLead;
    return tx.projectRoleResearcher;
  };

  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-laps-ghost/30 via-white to-white pb-16">
        <div className="mx-auto max-w-6xl px-6 pt-8">
          <Link
            to="/team"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-laps-navy/70 transition hover:text-laps-blue"
          >
            <ArrowLeft className="h-4 w-4" /> {t.structure.title}
          </Link>

          {/* HERO — cover band + identity */}
          <div className="relative overflow-hidden rounded-3xl border border-laps-blue/15 bg-white shadow-[0_20px_60px_-30px_rgba(11,78,141,0.35)]">
            <div className={`relative h-40 bg-gradient-to-r ${cfg.band} md:h-48`}>
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
            </div>

            <div className="px-6 pb-10 md:px-10">
              {/* Avatar — overlaps the colored band, but every text element sits
                  fully below the band so nothing ever gets clipped. */}
              <div className="-mt-20 flex justify-start">
                <div
                  className={`relative h-36 w-36 shrink-0 rounded-full bg-white p-1.5 shadow-xl ring-4 ${cfg.ring}`}
                >
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.fullName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${cfg.gradient} text-4xl font-bold text-white`}
                    >
                      {initials(member.fullName)}
                    </div>
                  )}
                  <div className="absolute -right-1 -top-1 flex h-10 w-10 items-center justify-center rounded-full bg-white text-laps-blue shadow ring-2 ring-white">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-8">
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-3xl font-bold leading-tight text-laps-navy md:text-4xl">
                    {member.fullName}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider ${cfg.chip}`}
                    >
                      <Icon className="h-3.5 w-3.5" /> {labels.tier[tierKey as Tier]}
                    </span>
                    {member.status && member.status !== "ACTIVE" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                        {tx.status[member.status as "COMPLETED" | "INACTIVE"]}
                      </span>
                    )}
                    {roleStart && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-laps-ghost/70 px-3 py-1.5 text-xs font-medium text-laps-navy/75">
                        <Calendar className="h-3.5 w-3.5" /> {tx.since} {roleStart}
                      </span>
                    )}
                  </div>
                </div>

                {hasAnyContact && (
                  <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end">
                    {primaryContact && (
                      <a
                        href={`mailto:${primaryContact}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-laps-blue/20 bg-white px-3 py-2 text-xs font-semibold text-laps-navy/80 transition hover:border-laps-blue hover:text-laps-blue"
                        title={primaryContact}
                      >
                        <Mail className="h-3.5 w-3.5" /> {tx.contact.email}
                      </a>
                    )}
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-laps-navy px-3 py-2 text-xs font-semibold text-white transition hover:bg-laps-blue"
                      >
                        <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                      </a>
                    )}
                    {member.lattesUrl && (
                      <a
                        href={member.lattesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-laps-blue/20 bg-white px-3 py-2 text-xs font-semibold text-laps-navy/80 transition hover:border-laps-blue hover:text-laps-blue"
                      >
                        <Globe className="h-3.5 w-3.5" /> Lattes
                      </a>
                    )}
                    {member.githubUrl && (
                      <a
                        href={member.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-laps-blue/20 bg-white px-3 py-2 text-xs font-semibold text-laps-navy/80 transition hover:border-laps-blue hover:text-laps-blue"
                      >
                        <Github className="h-3.5 w-3.5" /> GitHub
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* QUICK STATS */}
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <StatCard
                  icon={Compass}
                  label={tx.stats.areas}
                  value={memberAreas.length}
                />
                <StatCard
                  icon={Sparkles}
                  label={tx.stats.projects}
                  value={memberProjects.length}
                />
                <StatCard icon={BookOpen} label={tx.stats.publications} value={pubs.length} />
              </div>
            </div>
          </div>

          {/* TWO-COLUMN BODY */}
          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_2fr]">
            {/* SIDEBAR */}
            <aside className="flex flex-col gap-6 md:sticky md:top-24 md:self-start">
              {/* About */}
              <PortfolioCard title={tx.sections.about} icon={UserCheck}>
                <p className="text-sm leading-relaxed text-laps-navy/80">
                  {bio || labels.bioPending}
                </p>
              </PortfolioCard>

              {/* Research areas */}
              {memberAreas.length > 0 && (
                <PortfolioCard title={tx.sections.areas} icon={Compass}>
                  <div className="flex flex-wrap gap-1.5">
                    {memberAreas.map((slug) => {
                      const area = researchAreas.find((a) => a.slug === slug);
                      if (!area) return null;
                      return (
                        <span
                          key={slug}
                          className="inline-flex items-center gap-1.5 rounded-full border border-laps-light/40 bg-white px-2.5 py-1 text-[11px] font-medium text-laps-navy/80"
                        >
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ background: area.color }}
                          />
                          {area.name[L]}
                        </span>
                      );
                    })}
                  </div>
                </PortfolioCard>
              )}

              {/* Tags / interests */}
              {tags.length > 0 && (
                <PortfolioCard title={tx.sections.interests} icon={Sparkles}>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-laps-ghost/60 px-2 py-0.5 text-[11px] font-medium text-laps-blue"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </PortfolioCard>
              )}

              {/* Peers */}
              {peers.length > 0 && (
                <PortfolioCard title={tx.sections.peers} icon={Users}>
                  <div className="flex flex-col gap-2">
                    {peers.map((p) => (
                      <button
                        key={p.id}
                        onClick={() =>
                          navigate({ to: "/team/$uuid", params: { uuid: p.id } })
                        }
                        className="group flex items-center gap-2.5 rounded-lg border border-transparent px-1.5 py-1 text-left transition hover:border-laps-blue/15 hover:bg-laps-ghost/40"
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${
                            tierConfig[tierMap[p.currentRole] ?? "undergrad"].gradient
                          } text-[9px] font-bold text-white`}
                        >
                          {p.photoUrl ? (
                            <img
                              src={p.photoUrl}
                              alt=""
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            initials(p.fullName)
                          )}
                        </span>
                        <span className="flex-1 truncate text-xs font-medium text-laps-navy/85 group-hover:text-laps-blue">
                          {p.fullName}
                        </span>
                        <ArrowRight className="h-3 w-3 text-laps-navy/30 transition group-hover:text-laps-blue" />
                      </button>
                    ))}
                  </div>
                </PortfolioCard>
              )}
            </aside>

            {/* MAIN */}
            <main className="flex flex-col gap-6">
              {member.roadmap && member.roadmap.trim().length > 0 && (
                <PortfolioCard title={tx.sections.roadmap} icon={Compass}>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-laps-navy/80">
                    {member.roadmap}
                  </p>
                </PortfolioCard>
              )}

              {memberProjects.length > 0 && (
                <PortfolioCard title={tx.sections.projects} icon={Sparkles}>
                  <div className="flex flex-col gap-3">
                    {memberProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="rounded-xl border border-laps-blue/15 bg-gradient-to-br from-white to-laps-ghost/30 p-4 transition hover:border-laps-blue/30 hover:shadow-sm"
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <h4 className="text-sm font-bold text-laps-navy">
                            {proj.i18n[L].title}
                          </h4>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                proj.status === "ACTIVE"
                                  ? "bg-laps-blue/10 text-laps-blue"
                                  : "bg-laps-navy/10 text-laps-navy"
                              }`}
                            >
                              {proj.status === "ACTIVE"
                                ? t.projects.status.active
                                : t.projects.status.done}
                            </span>
                            {proj.year && (
                              <span className="text-[10px] font-semibold text-laps-navy/55">
                                {proj.year}
                              </span>
                            )}
                          </div>
                        </div>
                        {proj.role && proj.role !== "RESEARCHER" && (
                          <div className="mb-2 inline-flex rounded-full bg-laps-ghost px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-laps-blue">
                            {projectRoleLabel(proj.role)}
                          </div>
                        )}
                        {proj.tags.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1.5">
                            {proj.tags.map((tag: string) => (
                              <span
                                key={tag}
                                className="rounded border border-laps-light/40 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-laps-navy/70"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {proj.i18n[L].description && (
                          <p className="text-xs leading-relaxed text-laps-navy/70">
                            {proj.i18n[L].description}
                          </p>
                        )}
                        {proj.articleUrl && (
                          <a
                            href={proj.articleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-laps-blue hover:underline"
                          >
                            {tx.openArticle} <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </PortfolioCard>
              )}

              {pubs.length > 0 && (
                <PortfolioCard title={tx.sections.publications} icon={BookOpen}>
                  <div className="flex flex-col gap-3">
                    {pubs.map((pub) => {
                      const typeLabel = PUB_TYPE_LABELS[pub.type]?.[L] ?? pub.type;
                      return (
                        <div
                          key={pub.id}
                          className="rounded-xl border border-laps-light/30 bg-white p-4 transition hover:border-laps-light/60 hover:shadow-sm"
                        >
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <h4 className="text-sm font-semibold leading-tight text-laps-navy">
                              {pub.title}
                            </h4>
                            <span className="shrink-0 rounded-full bg-laps-blue/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-laps-blue">
                              {typeLabel}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-laps-navy/70">
                            <span className="rounded-md bg-laps-ghost/50 px-2 py-0.5 font-medium text-laps-blue/80">
                              {pub.venue}
                            </span>
                            <span>•</span>
                            <span className="font-semibold">{pub.year}</span>
                            {pub.status === "IN_PROGRESS" && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-amber-600">
                                  {tx.pubStatus.inProgress}
                                </span>
                              </>
                            )}
                            {pub.status === "IN_PRESS" && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-emerald-600">
                                  {tx.pubStatus.inPress}
                                </span>
                              </>
                            )}
                          </div>
                          {(pub.doi || pub.url) && (
                            <div className="mt-2 flex flex-wrap gap-3 text-xs">
                              {pub.doi && (
                                <a
                                  href={`https://doi.org/${pub.doi}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-semibold text-laps-blue hover:underline"
                                >
                                  DOI <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              {pub.url && (
                                <a
                                  href={pub.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-semibold text-laps-blue hover:underline"
                                >
                                  {tx.open} <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </PortfolioCard>
              )}

              {coAuthors.length > 0 && (
                <PortfolioCard title={tx.sections.collaborators} icon={Users}>
                  <div className="flex flex-wrap gap-2">
                    {coAuthors.map((c) => {
                      const ctier = tierMap[c.currentRole] ?? "undergrad";
                      const cv = tierConfig[ctier];
                      return (
                        <button
                          key={c.id}
                          onClick={() => navigate({ to: "/team/$uuid", params: { uuid: c.id } })}
                          className="group flex items-center gap-2 rounded-full border border-laps-light/25 bg-white px-2.5 py-1 text-xs font-medium text-laps-navy/85 transition hover:border-laps-blue/40 hover:text-laps-blue"
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${cv.gradient} text-[8px] font-bold text-white`}
                          >
                            {c.photoUrl ? (
                              <img
                                src={c.photoUrl}
                                alt=""
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              initials(c.fullName)
                            )}
                          </span>
                          {c.fullName}
                        </button>
                      );
                    })}
                  </div>
                </PortfolioCard>
              )}

              {memberProjects.length === 0 && pubs.length === 0 && !member.roadmap && (
                <PortfolioCard title={tx.sections.portfolio} icon={FileText}>
                  <p className="text-sm italic text-laps-navy/55">{tx.emptyPortfolio}</p>
                </PortfolioCard>
              )}
            </main>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function PortfolioCard({
  title,
  icon: IconComp,
  children,
}: {
  title: string;
  icon: typeof Crown;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-laps-blue/12 bg-white p-5 shadow-[0_2px_20px_rgba(25,58,89,0.04)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-laps-ghost text-laps-blue">
          <IconComp className="h-4 w-4" />
        </span>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-laps-navy/70">
          {title}
        </h3>
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

function formatDate(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(
    lang === "pt" ? "pt-BR" : lang === "fr" ? "fr-FR" : "en-US",
    { year: "numeric", month: "short" }
  );
}

const TX: Record<Lang, {
  since: string;
  open: string;
  openArticle: string;
  emptyPortfolio: string;
  contact: { email: string };
  status: { COMPLETED: string; INACTIVE: string };
  pubStatus: { inProgress: string; inPress: string };
  projectRoleLead: string;
  projectRoleCoLead: string;
  projectRoleResearcher: string;
  stats: { areas: string; projects: string; publications: string };
  sections: {
    about: string;
    areas: string;
    interests: string;
    peers: string;
    roadmap: string;
    projects: string;
    publications: string;
    collaborators: string;
    portfolio: string;
  };
}> = {
  pt: {
    since: "desde",
    open: "Abrir",
    openArticle: "Abrir artigo",
    emptyPortfolio:
      "Portfólio ainda em construção. Em breve, projetos e publicações deste pesquisador aparecerão aqui.",
    contact: { email: "E-mail" },
    status: { COMPLETED: "Concluído", INACTIVE: "Inativo" },
    pubStatus: { inProgress: "Em andamento", inPress: "No prelo" },
    projectRoleLead: "Orientador",
    projectRoleCoLead: "Co-orientador",
    projectRoleResearcher: "Pesquisador",
    stats: { areas: "Áreas de pesquisa", projects: "Projetos", publications: "Publicações" },
    sections: {
      about: "Sobre",
      areas: "Áreas de pesquisa",
      interests: "Interesses",
      peers: "Outros do mesmo grupo",
      roadmap: "Roteiro de pesquisa",
      projects: "Projetos",
      publications: "Publicações",
      collaborators: "Colaboradores",
      portfolio: "Portfólio",
    },
  },
  en: {
    since: "since",
    open: "Open",
    openArticle: "Open article",
    emptyPortfolio:
      "Portfolio still in progress. Projects and publications for this researcher will show up here soon.",
    contact: { email: "Email" },
    status: { COMPLETED: "Completed", INACTIVE: "Inactive" },
    pubStatus: { inProgress: "In progress", inPress: "In press" },
    projectRoleLead: "Advisor",
    projectRoleCoLead: "Co-advisor",
    projectRoleResearcher: "Researcher",
    stats: { areas: "Research areas", projects: "Projects", publications: "Publications" },
    sections: {
      about: "About",
      areas: "Research areas",
      interests: "Interests",
      peers: "Others in this group",
      roadmap: "Research roadmap",
      projects: "Projects",
      publications: "Publications",
      collaborators: "Collaborators",
      portfolio: "Portfolio",
    },
  },
  fr: {
    since: "depuis",
    open: "Ouvrir",
    openArticle: "Ouvrir l'article",
    emptyPortfolio:
      "Portfolio en construction. Les projets et publications de ce chercheur apparaîtront ici prochainement.",
    contact: { email: "E-mail" },
    status: { COMPLETED: "Terminé", INACTIVE: "Inactif" },
    pubStatus: { inProgress: "En cours", inPress: "Sous presse" },
    projectRoleLead: "Directeur",
    projectRoleCoLead: "Co-directeur",
    projectRoleResearcher: "Chercheur",
    stats: { areas: "Domaines de recherche", projects: "Projets", publications: "Publications" },
    sections: {
      about: "À propos",
      areas: "Domaines de recherche",
      interests: "Intérêts",
      peers: "Autres du même groupe",
      roadmap: "Feuille de route",
      projects: "Projets",
      publications: "Publications",
      collaborators: "Collaborateurs",
      portfolio: "Portfolio",
    },
  },
};
