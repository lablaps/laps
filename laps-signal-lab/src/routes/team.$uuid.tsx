import { createFileRoute, notFound, useNavigate, Link } from "@tanstack/react-router";
// Crown / Shield / Briefcase / Microscope went with the per-tier icon chips and
// ArrowRight with the arrows stapled to link rows. Sparkles is replaced rather
// than dropped: it was labelling both "projects" and "interests", which is the
// glyph doing decoration instead of meaning. FlaskConical and Tag say which
// section you are looking at.
import {
  Linkedin,
  ExternalLink,
  GraduationCap,
  Users,
  FlaskConical,
  Tag,
  ArrowLeft,
  Mail,
  Github,
  BookOpen,
  Calendar,
  Globe,
  Languages,
  FileText,
  Compass,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { type Tier, initials, team as staticTeam } from "@/lib/team-data";
import { TIER_CONFIG } from "@/lib/tier-visual";
import { areas as researchAreas, type AreaSlug } from "@/lib/areas-data";
import { publications, publicationsByMember } from "@/lib/publications-data";
import {
  api,
  fetchMember,
  fetchMembers,
  fetchProjects,
  resolveMediaUrl,
  type ApiMember,
  type ApiPublication,
} from "@/lib/api";
import { applyOverlay, decoratePhotoUrl } from "@/lib/static-source";
import { PublicLayout } from "@/components/PublicLayout";
import { countryName, brStateName } from "@/lib/exchange-data";
import { DestinationFlag } from "@/lib/flags";
import { UNDERGRAD_PROGRAMS, toProgramCode } from "@/lib/undergrad-programs";
import { formatJoined } from "@/lib/joined-laps";
import {
  parseLanguages, LANGUAGE_BY_CODE, levelShortLabel, levelBadgeClass,
} from "@/lib/languages-data";

type Lang = "pt" | "en" | "fr";

// The tier table lives in lib/tier-visual.ts — shared with /team, /exchange,
// the network graph, /portal and the console, so a member's role reads the same
// on every screen that shows it.
const tierConfig = TIER_CONFIG;

const PUB_TYPE_LABELS: Record<string, { pt: string; en: string; fr: string }> = {
  JOURNAL: { pt: "Periódico", en: "Journal", fr: "Revue" },
  CONFERENCE: { pt: "Conferência", en: "Conference", fr: "Conférence" },
  WORKSHOP: { pt: "Workshop", en: "Workshop", fr: "Atelier" },
  DISSERTATION: { pt: "Dissertação", en: "MSc Dissertation", fr: "Mémoire" },
  THESIS: { pt: "Tese de Doutorado", en: "Doctoral Thesis", fr: "Thèse de Doctorat" },
};

/** The fields this page renders for a publication, from either source. */
interface ProfilePublication {
  id: string;
  title: string;
  venue: string;
  year: number;
  type: string;
  status: string;
  doi?: string | null;
  url?: string | null;
}

/**
 * Seed entries and API entries side by side, without showing anything twice.
 *
 * Several seeded publications were later entered into the database as well, so
 * a naive concat double-renders them. Identity is the DOI when there is one —
 * that is what a DOI is for — and otherwise the title and year, normalised,
 * which catches the same paper typed with different capitalisation or spacing.
 * The seed entry wins a collision: it is the curated copy, and it carries the
 * authorship the co-author section reads.
 */
function mergePublications(
  seeded: ProfilePublication[],
  fromApi: ApiPublication[],
): ProfilePublication[] {
  const identity = (p: { doi?: string | null; title: string; year: number }) =>
    p.doi?.trim()
      ? `doi:${p.doi.trim().toLowerCase()}`
      : `t:${p.title.trim().toLowerCase().replace(/\s+/g, " ")}|${p.year}`;

  const seen = new Set(seeded.map(identity));
  const merged = [...seeded];

  for (const p of fromApi) {
    if (seen.has(identity(p))) continue;
    seen.add(identity(p));
    merged.push({
      id: p.id,
      title: p.title,
      venue: p.venue,
      year: p.year,
      type: p.type,
      status: p.status,
      doi: p.doi,
      url: p.url,
    });
  }

  return merged.sort((a, b) => b.year - a.year);
}

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

    // Sequential rather than part of the fan-out above: the filter keys on the
    // member's UUID, and params.uuid is usually the slug, so the id is not
    // known until fetchMember resolves. Only approved rows come back — the
    // endpoint has no way to return anything else (PublicationSpecifications).
    //
    // Degrades to the seed list on failure: a publications outage should not
    // take a member's whole profile page down with it.
    const apiPublications = await api
      .publicationsByMember(member.id)
      .then((page) => page.content)
      .catch(() => []);

    return { member, allMembers, apiProjects, apiPublications };
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
    leaders?: Array<{
      memberId: string;
      role?: string;
      contribution?: string | null;
      member?: { slug?: string; id?: string };
    }>;
  }>;

  const { lang, t } = useLang();
  const navigate = useNavigate();
  const L = lang as Lang;
  const tx = TX[L];

  const tierMap: Record<string, Tier> = {
    HEAD: "head",
    COLLABORATOR: "collaborator",
    DOCTORATE: "doctorate",
    MASTER: "master",
    UNDERGRAD: "undergrad",
  };
  const tierKey = tierMap[member.currentRole] ?? "undergrad";
  const cfg = tierConfig[tierKey];

  const seed = staticTeam.find((s) => s.id === member.slug);
  const memberAreas: AreaSlug[] = member.areas
    ? (member.areas.split(",").map((s) => s.trim()).filter(Boolean) as AreaSlug[])
    : (seed?.areas ?? []);
  const tags = member.interests
    ? member.interests.split(",").map((s) => s.trim()).filter(Boolean)
    : (seed?.tags ?? []);

  const bioObj: Record<string, string | null> = {
    pt: member.bioPt,
    en: member.bioEn,
    fr: member.bioFr,
  };
  const bio = bioObj[lang] || member.bioPt;

  const labels = t.structure.network;

  // Publications come from two places now. The seed file keys authors by slug
  // and still holds the lab's historical record; the API holds everything since
  // — including what members submit from their portal, once a manager approves
  // it. Without the merge an added publication would never reach this page.
  const pubs = mergePublications(publicationsByMember(member.slug), data.apiPublications ?? []);
  const languages = parseLanguages(member.languages);

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
      contribution:
        p.leaders?.find(
          (l) => l.memberId === member.id || l.member?.id === member.id || l.member?.slug === member.slug
        )?.contribution || null,
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

  // Hidden fields arrive as null from the API (MemberPublicView redacts them),
  // so presence is the only check needed here — no client-side flag filtering.
  // Distinct from roleStart below: that is when the CURRENT role began and is
  // rewritten on promotion, so it understates how long someone has been here.
  const joinedLaps = formatJoined(member, L);

  const programCode = toProgramCode(member.undergradProgram);
  const programMeta = programCode ? UNDERGRAD_PROGRAMS[programCode] : null;

  // Visibility is enforced here, not just server-side.
  //
  // The API redacts hidden fields to null — but only for ordinary callers.
  // MemberPublicView.of(m, includeHidden) skips redaction entirely when the
  // request carries the MANAGER authority, which the admin console depends on
  // (it reads the same /api/v1/members endpoint). The consequence on THIS page
  // was that a logged-in manager saw every member's hidden email, LinkedIn,
  // Lattes and GitHub rendered as though they were public — including their
  // own, which is what made it look like the "hide" toggle did nothing.
  //
  // So presence is not sufficient; the flag has to be checked. These are the
  // values the public actually sees, and this page shows the public view to
  // everyone, managers included.
  const publicEmail = member.showEmail ? member.email : null;
  const publicContactEmail = member.showContactEmail ? member.contactEmail : null;
  const publicLinkedin = member.showLinkedin ? member.linkedinUrl : null;
  const publicLattes = member.showLattes ? member.lattesUrl : null;
  const publicGithub = member.showGithub ? member.githubUrl : null;
  const publicCustomUrl = member.showCustomUrl ? member.customUrl : null;

  // contactEmail is the address meant for correspondence; the login email is
  // the fallback only when the member has published it.
  const primaryContact = publicContactEmail || publicEmail;
  const hasAnyContact = !!(
    primaryContact || publicLinkedin || publicLattes || publicGithub || publicCustomUrl
  );
  const projectRoleLabel = (role: string) => {
    if (role === "LEAD") return tx.projectRoleLead;
    if (role === "CO_LEAD") return tx.projectRoleCoLead;
    return tx.projectRoleResearcher;
  };

  return (
    <PublicLayout>
      <section className="bg-laps-paper pb-16">
        <div className="mx-auto max-w-6xl px-6 pt-8">
          <Link
            to="/team"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-laps-navy/70 transition hover:text-laps-blue"
          >
            <ArrowLeft className="h-4 w-4" /> {t.structure.title}
          </Link>

          {/* HERO — cover band + identity */}
          <div className="relative overflow-hidden rounded-md border border-laps-navy/20 bg-surface">
            <div
              className={`relative h-40 md:h-48 ${!member.bannerImageUrl ? cfg.band : ""}`}
              style={member.bannerImageUrl
                ? { backgroundImage: `url(${resolveMediaUrl(member.bannerImageUrl)})`, backgroundSize: "cover", backgroundPosition: "center" }
                : member.bannerColor
                  ? { background: `linear-gradient(to right, ${member.bannerColor}, ${member.bannerColor}99)` }
                  : undefined}
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
            </div>

            <div className="px-6 pb-10 md:px-10">
              {/* Avatar — overlaps the colored band, but every text element sits
                  fully below the band so nothing ever gets clipped. */}
              <div className="-mt-20 flex justify-start">
                <div
                  className={`relative h-36 w-36 shrink-0 rounded-full bg-surface p-1 ring-2 ${cfg.ring}`}
                >
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.fullName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`flex h-full w-full items-center justify-center rounded-full ${cfg.fill} text-4xl font-bold text-white`}
                    >
                      {initials(member.fullName)}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-8">
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-3xl font-bold leading-tight text-laps-navy md:text-4xl">
                    {member.fullName}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-sm border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] ${cfg.chip}`}
                    >
                      {labels.tier[tierKey as Tier]}
                    </span>
                    {member.exchangeCountry && (
                      <span className="inline-flex items-center gap-1.5 rounded-sm border border-laps-navy/20 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-laps-navy/75">
                        <span className="inline-block h-3.5 w-5 shrink-0 overflow-hidden rounded-sm shadow-sm">
                          <DestinationFlag
                            country={member.exchangeCountry}
                            state={member.exchangeState}
                          />
                        </span>
                        {/* Domestic placements name the state — "Intercambista ·
                            Brasil" would say nothing about where they went. */}
                        Intercambista ·{" "}
                        {member.exchangeState
                          ? `${brStateName(member.exchangeState)} — ${countryName(member.exchangeCountry, "pt")}`
                          : countryName(member.exchangeCountry, "pt")}
                      </span>
                    )}
                    {programMeta && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-laps-blue/20 bg-surface px-3 py-1.5 text-xs font-semibold text-laps-navy">
                        <GraduationCap className="h-3.5 w-3.5 text-laps-blue" />
                        {programMeta.short[L]}
                      </span>
                    )}
                    {member.status && member.status !== "ACTIVE" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                        {tx.status[member.status as "COMPLETED" | "INACTIVE"]}
                      </span>
                    )}
                    {joinedLaps && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-laps-ghost/70 px-3 py-1.5 text-xs font-medium text-laps-navy/75">
                        <Calendar className="h-3.5 w-3.5" /> {tx.joinedLaps} {joinedLaps}
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
                        className="inline-flex items-center gap-1.5 rounded-lg border border-laps-blue/20 bg-surface px-3 py-2 text-xs font-semibold text-laps-navy/80 transition hover:border-laps-blue hover:text-laps-blue"
                        title={primaryContact}
                      >
                        <Mail className="h-3.5 w-3.5" /> {tx.contact.email}
                      </a>
                    )}
                    {publicLinkedin && (
                      <a
                        href={publicLinkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-laps-cta px-3 py-2 text-xs font-semibold text-white transition hover:bg-laps-accent"
                      >
                        <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                      </a>
                    )}
                    {publicLattes && (
                      <a
                        href={publicLattes}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-laps-blue/20 bg-surface px-3 py-2 text-xs font-semibold text-laps-navy/80 transition hover:border-laps-blue hover:text-laps-blue"
                      >
                        <Globe className="h-3.5 w-3.5" /> Lattes
                      </a>
                    )}
                    {publicGithub && (
                      <a
                        href={publicGithub}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-laps-blue/20 bg-surface px-3 py-2 text-xs font-semibold text-laps-navy/80 transition hover:border-laps-blue hover:text-laps-blue"
                      >
                        <Github className="h-3.5 w-3.5" /> GitHub
                      </a>
                    )}
                    {publicCustomUrl && (
                      <a
                        href={publicCustomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-laps-blue/20 bg-surface px-3 py-2 text-xs font-semibold text-laps-navy/80 transition hover:border-laps-blue hover:text-laps-blue"
                        title={publicCustomUrl}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="max-w-[14rem] truncate">
                          {member.customUrlLabel || tx.contact.website}
                        </span>
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
                  icon={FlaskConical}
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
                      return (
                        <span
                          key={slug}
                          className="inline-flex items-center gap-1.5 rounded-full border border-laps-light/40 bg-surface px-2.5 py-1 text-[11px] font-medium text-laps-navy/80"
                        >
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ background: area?.color ?? "#94a3b8" }}
                          />
                          {area?.name[L] ?? slug}
                        </span>
                      );
                    })}
                  </div>
                </PortfolioCard>
              )}

              {/* Languages */}
              {languages.length > 0 && (
                <PortfolioCard title={tx.sections.languages} icon={Languages}>
                  <div className="space-y-1.5">
                    {languages.map((entry) => {
                      const lang = LANGUAGE_BY_CODE[entry.code];
                      return (
                        <div
                          key={entry.code}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base leading-none">{lang?.flag ?? "🌐"}</span>
                            <span className="text-xs font-medium text-laps-navy/85 truncate">
                              {lang?.name[L] ?? entry.code}
                            </span>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${levelBadgeClass(entry.level)}`}
                          >
                            {levelShortLabel(entry.level, L)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </PortfolioCard>
              )}

              {/* Tags / interests */}
              {tags.length > 0 && (
                <PortfolioCard title={tx.sections.interests} icon={Tag}>
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
                          className={`flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full ${
                            tierConfig[tierMap[p.currentRole] ?? "undergrad"].fill
                          } font-mono text-[9px] font-semibold text-white`}
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
                        <span className="h-px w-4 shrink-0 bg-laps-navy/25 transition-all duration-300 group-hover:w-6 group-hover:bg-laps-signal" />
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
                <PortfolioCard title={tx.sections.projects} icon={FlaskConical}>
                  <div className="flex flex-col gap-3">
                    {memberProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="rounded-md border border-laps-navy/15 bg-surface p-4 transition-colors hover:border-laps-navy/35 hover:bg-laps-ghost/50"
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <h4 className="text-sm font-bold text-laps-navy">
                            {proj.i18n[L].title}
                          </h4>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                proj.status === "ACTIVE"
                                  ? "bg-laps-accent/10 text-laps-blue"
                                  : "bg-laps-ink/10 text-laps-navy"
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
                                className="rounded border border-laps-light/40 bg-surface px-1.5 py-0.5 text-[9px] font-semibold text-laps-navy/70"
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
                        {proj.contribution && (
                          <p className="mt-2 rounded-lg border border-laps-navy/10 bg-laps-ghost/30 px-2.5 py-2 text-[11px] leading-relaxed text-laps-navy/70">
                            {proj.contribution}
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
                          className="rounded-xl border border-laps-light/30 bg-surface p-4 transition hover:border-laps-light/60 hover:shadow-sm"
                        >
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <h4 className="text-sm font-semibold leading-tight text-laps-navy">
                              {pub.title}
                            </h4>
                            <span className="shrink-0 rounded-full bg-laps-accent/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-laps-blue">
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
                          className="group flex items-center gap-2 rounded-full border border-laps-light/25 bg-surface px-2.5 py-1 text-xs font-medium text-laps-navy/85 transition hover:border-laps-blue/40 hover:text-laps-blue"
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center overflow-hidden rounded-full ${cv.fill} font-mono text-[8px] font-semibold text-white`}
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
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-laps-navy/15 bg-surface p-5">
      <div className="mb-4 flex items-center gap-2 border-b border-laps-navy/15 pb-3">
        <IconComp className="h-3.5 w-3.5 shrink-0 text-laps-navy/45" />
        <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-laps-navy/55">
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
  icon: LucideIcon;
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
  joinedLaps: string;
  open: string;
  openArticle: string;
  emptyPortfolio: string;
  contact: { email: string; website: string };
  status: { COMPLETED: string; INACTIVE: string };
  pubStatus: { inProgress: string; inPress: string };
  projectRoleLead: string;
  projectRoleCoLead: string;
  projectRoleResearcher: string;
  stats: { areas: string; projects: string; publications: string };
  sections: {
    about: string;
    areas: string;
    languages: string;
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
    joinedLaps: "No LAPS desde",
    open: "Abrir",
    openArticle: "Abrir artigo",
    emptyPortfolio:
      "Portfólio ainda em construção. Em breve, projetos e publicações deste pesquisador aparecerão aqui.",
    contact: { email: "E-mail", website: "Site" },
    status: { COMPLETED: "Concluído", INACTIVE: "Inativo" },
    pubStatus: { inProgress: "Em andamento", inPress: "No prelo" },
    projectRoleLead: "Orientador",
    projectRoleCoLead: "Co-orientador",
    projectRoleResearcher: "Pesquisador",
    stats: { areas: "Áreas de pesquisa", projects: "Projetos", publications: "Publicações" },
    sections: {
      about: "Sobre",
      areas: "Áreas de pesquisa",
      languages: "Idiomas",
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
    joinedLaps: "At LAPS since",
    open: "Open",
    openArticle: "Open article",
    emptyPortfolio:
      "Portfolio still in progress. Projects and publications for this researcher will show up here soon.",
    contact: { email: "Email", website: "Website" },
    status: { COMPLETED: "Completed", INACTIVE: "Inactive" },
    pubStatus: { inProgress: "In progress", inPress: "In press" },
    projectRoleLead: "Advisor",
    projectRoleCoLead: "Co-advisor",
    projectRoleResearcher: "Researcher",
    stats: { areas: "Research areas", projects: "Projects", publications: "Publications" },
    sections: {
      about: "About",
      areas: "Research areas",
      languages: "Languages",
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
    joinedLaps: "Au LAPS depuis",
    open: "Ouvrir",
    openArticle: "Ouvrir l'article",
    emptyPortfolio:
      "Portfolio en construction. Les projets et publications de ce chercheur apparaîtront ici prochainement.",
    contact: { email: "E-mail", website: "Site" },
    status: { COMPLETED: "Terminé", INACTIVE: "Inactif" },
    pubStatus: { inProgress: "En cours", inPress: "Sous presse" },
    projectRoleLead: "Directeur",
    projectRoleCoLead: "Co-directeur",
    projectRoleResearcher: "Chercheur",
    stats: { areas: "Domaines de recherche", projects: "Projets", publications: "Publications" },
    sections: {
      about: "À propos",
      areas: "Domaines de recherche",
      languages: "Langues",
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
