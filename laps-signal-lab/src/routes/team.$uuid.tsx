import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import {
  Linkedin,
  ExternalLink,
  GraduationCap,
  ArrowLeft,
  Mail,
  Github,
  BookOpen,
  Calendar,
  Globe,
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
  type ApiMember,
  type ApiPublication,
} from "@/lib/api";
import { applyOverlay, decoratePhotoUrl } from "@/lib/static-source";
import {
  impactApi,
  impactCopy,
  impactKinds,
  impactText,
  type Impact,
  type ImpactKind,
} from "@/lib/impacts";
import { PublicLayout } from "@/components/PublicLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { countryName, brStateName } from "@/lib/exchange-data";
import { DestinationFlag } from "@/lib/flags";
import { UNDERGRAD_PROGRAMS, toProgramCode } from "@/lib/undergrad-programs";
import { formatJoined } from "@/lib/joined-laps";
import {
  parseLanguages,
  LANGUAGE_BY_CODE,
  levelShortLabel,
  levelBadgeClass,
} from "@/lib/languages-data";

type Lang = "pt" | "en" | "fr";

const TIER_BY_ROLE: Record<string, Tier> = {
  HEAD: "head",
  COLLABORATOR: "collaborator",
  DOCTORATE: "doctorate",
  MASTER: "master",
  UNDERGRAD: "undergrad",
};

/**
 * Impact kinds that count as an honour or award on the profile.
 *
 * The profile used to embed the full Impacts feed, which also carries
 * contributions, international experiences and "other" — useful on /impactos,
 * but on a researcher's page it buried the recognitions under self-reported
 * activity. Funding and prizes are what a reader of an academic profile looks
 * for, so the profile shows those and links nothing else.
 */
const HONOUR_KINDS: ImpactKind[] = ["AWARD", "SCHOLARSHIP", "DOCTORAL_SCHOLARSHIP"];

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

/**
 * The member's Google Scholar profile, when they have published one.
 *
 * There is no dedicated column yet, so the only source today is the
 * member-curated custom link when it points at Scholar. The hostname is
 * matched exactly against Scholar's domains — a substring test would accept
 * "scholar.google.com.attacker.example", and this link is rendered as the
 * page's primary call to action in the Publications section.
 */
const SCHOLAR_HOST = /^scholar\.google\.(com|[a-z]{2}|com?\.[a-z]{2})$/i;
function googleScholarUrl(candidate: string | null): string | null {
  if (!candidate) return null;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return SCHOLAR_HOST.test(u.hostname) ? u.href : null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/team/$uuid")({
  loader: async ({ params }) => {
    // Parallel fan-out: the detail view needs the member, the full roster
    // (for co-author chips), and all projects (for the Projects section).
    // One round-trip cost, three queries.
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
  const L = lang as Lang;
  const tx = TX[L];

  const tierKey = TIER_BY_ROLE[member.currentRole] ?? "undergrad";
  const cfg = TIER_CONFIG[tierKey];
  // The full, gender-neutral role title ("Doutorando(a)", "Doctoral Student"),
  // shared with /exchange — not the short graph-legend label.
  const roleTitle = t.exchange.tier[tierKey];

  const seed = staticTeam.find((s) => s.id === member.slug);
  const memberAreas: AreaSlug[] = member.areas
    ? (member.areas
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) as AreaSlug[])
    : (seed?.areas ?? []);
  const interests = member.interests
    ? member.interests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : (seed?.tags ?? []);

  // Publications come from two places. The seed file keys authors by slug and
  // still holds the lab's historical record; the API holds everything since —
  // including what members submit from their portal, once a manager approves
  // it. Without the merge an added publication would never reach this page.
  const pubs = mergePublications(publicationsByMember(member.slug), data.apiPublications ?? []);
  const languages = parseLanguages(member.languages);

  const isMine = (l: { memberId: string; member?: { slug?: string; id?: string } }) =>
    l.memberId === member.id || l.member?.id === member.id || l.member?.slug === member.slug;

  const memberProjects = apiProjects
    .filter((p) => p.leaders?.some(isMine))
    .map((p) => {
      const mine = p.leaders?.find(isMine);
      return {
        id: p.id,
        status: p.status,
        year: p.year ?? null,
        articleUrl: p.articleUrl ?? null,
        tags: p.tags || [],
        role: mine?.role || "RESEARCHER",
        contribution: mine?.contribution || null,
        i18n: {
          pt: { title: p.titlePt || p.titleEn || "", description: p.descriptionPt || "" },
          en: { title: p.titleEn || p.titlePt || "", description: p.descriptionEn || "" },
          fr: { title: p.titleFr || p.titleEn || "", description: p.descriptionFr || "" },
        },
      };
    });

  // Co-authors derived from publications: anyone the member has published with
  // at least once. Cross-reference back to the API roster for the photo.
  const coAuthorSlugs = new Set<string>();
  for (const pub of publications) {
    if (!pub.authors.some((a) => a.memberId === member.slug)) continue;
    for (const a of pub.authors) {
      if (a.memberId && a.memberId !== member.slug) coAuthorSlugs.add(a.memberId);
    }
  }
  const coAuthors = Array.from(coAuthorSlugs)
    .map((slug) => allMembers.find((m) => m.slug === slug))
    .filter((m): m is ApiMember => Boolean(m));

  // One query per honour kind: the endpoint filters a single kind at a time,
  // and a client-side filter over one page of the unfiltered feed would drop
  // honours that fell onto page two. 100 is the server's page-size ceiling.
  const honourQueries = useQueries({
    queries: HONOUR_KINDS.map((kind) => ({
      queryKey: ["impacts", member.id, kind, "honours"],
      queryFn: () => impactApi.list({ memberId: member.id, kind, size: 100 }),
      staleTime: 5 * 60 * 1000,
    })),
  });
  const honoursSettled = honourQueries.every((q) => !q.isPending);
  const honours: Impact[] = honourQueries
    .flatMap((q) => q.data?.content ?? [])
    .sort((a, b) => b.details.occurredOn.localeCompare(a.details.occurredOn));

  const roleStart = member.currentRoleStartedAt ? formatDate(member.currentRoleStartedAt, L) : null;

  // Distinct from roleStart: that is when the CURRENT role began and is
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
  const scholarUrl = googleScholarUrl(publicCustomUrl);

  // contactEmail is the address meant for correspondence; the login email is
  // the fallback only when the member has published it.
  const primaryContact = publicContactEmail || publicEmail;
  const hasAnyContact = !!(
    primaryContact ||
    publicLinkedin ||
    publicLattes ||
    publicGithub ||
    publicCustomUrl
  );
  const projectRoleLabel = (role: string) => {
    if (role === "LEAD") return tx.projectRoleLead;
    if (role === "CO_LEAD") return tx.projectRoleCoLead;
    return tx.projectRoleResearcher;
  };

  const roadmap = member.roadmap?.trim() ?? "";
  const showPublications = pubs.length > 0 || !!scholarUrl;

  // Section order is reading priority on an academic profile. The first one
  // present starts open so the page never lands as a stack of closed bars.
  const sectionOrder = [
    memberProjects.length > 0 && "projects",
    showPublications && "publications",
    honours.length > 0 && "honours",
    roadmap && "roadmap",
    languages.length > 0 && "languages",
    coAuthors.length > 0 && "coauthors",
  ].filter(Boolean) as string[];
  const isEmpty = sectionOrder.length === 0 && honoursSettled;

  return (
    <PublicLayout>
      <section className="bg-laps-paper pb-20">
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
          <Link
            to="/team"
            className="mb-6 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-laps-navy/70 transition-colors hover:text-laps-blue"
          >
            <ArrowLeft className="h-4 w-4" /> {t.structure.title}
          </Link>

          {/* HERO — the person first. A portrait card with the name set on the
              photo, then what they work on. The cover banner and the three
              count tiles that used to sit here are gone: the banner was
              decoration, and "N publications" measures volume, which says
              nothing about what a researcher actually does. */}
          <div className="grid gap-8 md:grid-cols-[minmax(0,20rem)_1fr] md:items-start lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-12">
            <figure className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-md bg-laps-ink md:mx-0 md:max-w-none">
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={tx.photoAlt(member.fullName)}
                  className="absolute inset-0 h-full w-full object-cover object-top outline outline-1 -outline-offset-1 outline-black/10"
                />
              ) : (
                <div
                  aria-hidden
                  className={`absolute inset-0 flex items-center justify-center ${cfg.fill}`}
                >
                  <span className="font-display text-7xl font-bold text-white/90">
                    {initials(member.fullName)}
                  </span>
                </div>
              )}
              {/* Scrim sized to the caption, not the frame: it exists so white
                  text clears contrast over a bright photo, and covering the
                  whole image would mute the face the card is for. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/45 to-transparent"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <h1 className="font-display text-2xl font-bold leading-tight text-balance text-white md:text-3xl">
                  {member.fullName}
                </h1>
                <p className="mt-1.5 text-sm font-medium text-white/85">{roleTitle}</p>
              </figcaption>
            </figure>

            <div className="flex min-w-0 flex-col gap-8 md:pt-1">
              {(member.exchangeCountry ||
                programMeta ||
                (member.status && member.status !== "ACTIVE") ||
                joinedLaps ||
                roleStart) && (
                <div className="flex flex-wrap items-center gap-2">
                  {member.exchangeCountry && (
                    <span className={CHIP}>
                      <span className="inline-block h-3.5 w-5 shrink-0 overflow-hidden rounded-sm">
                        <DestinationFlag
                          country={member.exchangeCountry}
                          state={member.exchangeState}
                        />
                      </span>
                      {/* Domestic placements name the state — "Exchange ·
                          Brazil" would say nothing about where they went. */}
                      {tx.exchange} ·{" "}
                      {member.exchangeState
                        ? `${brStateName(member.exchangeState)} — ${countryName(member.exchangeCountry, L)}`
                        : countryName(member.exchangeCountry, L)}
                    </span>
                  )}
                  {programMeta && (
                    <span className={CHIP}>
                      <GraduationCap className="h-3.5 w-3.5 text-laps-blue" />
                      {programMeta.short[L]}
                    </span>
                  )}
                  {member.status && member.status !== "ACTIVE" && (
                    <span className={CHIP}>
                      {tx.status[member.status as "COMPLETED" | "INACTIVE"]}
                    </span>
                  )}
                  {joinedLaps && (
                    <span className={CHIP}>
                      <Calendar className="h-3.5 w-3.5" /> {tx.joinedLaps} {joinedLaps}
                    </span>
                  )}
                  {roleStart && (
                    <span className={CHIP}>
                      <Calendar className="h-3.5 w-3.5" /> {roleTitle} {tx.since} {roleStart}
                    </span>
                  )}
                </div>
              )}

              {(memberAreas.length > 0 || interests.length > 0) && (
                <div>
                  <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-laps-navy/55">
                    {tx.researchInterests}
                  </h2>
                  {memberAreas.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {memberAreas.map((slug) => {
                        const area = researchAreas.find((a) => a.slug === slug);
                        return (
                          <li
                            key={slug}
                            className="inline-flex items-center gap-2 rounded-sm border border-laps-navy/15 bg-surface px-3 py-1.5 text-sm font-medium text-laps-navy"
                          >
                            <span
                              aria-hidden
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ background: area?.color ?? "#94a3b8" }}
                            />
                            {area?.name[L] ?? slug}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {interests.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {interests.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-sm bg-laps-ghost px-2 py-0.5 text-xs font-medium text-laps-blue"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {hasAnyContact && (
                <div className="flex flex-wrap items-center gap-2">
                  {primaryContact && (
                    <a href={`mailto:${primaryContact}`} className={CONTACT} title={primaryContact}>
                      <Mail className="h-3.5 w-3.5" /> {tx.contact.email}
                    </a>
                  )}
                  {publicLinkedin && (
                    <a
                      href={publicLinkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={CONTACT}
                    >
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                  )}
                  {publicLattes && (
                    <a
                      href={publicLattes}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={CONTACT}
                    >
                      <Globe className="h-3.5 w-3.5" /> Lattes
                    </a>
                  )}
                  {publicGithub && (
                    <a
                      href={publicGithub}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={CONTACT}
                    >
                      <Github className="h-3.5 w-3.5" /> GitHub
                    </a>
                  )}
                  {publicCustomUrl && (
                    <a
                      href={publicCustomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={CONTACT}
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
          </div>

          {/* BODY — every section collapsible, one column, ruled like the rest
              of the site. "Sobre", the Impacts feed and "Outros do mesmo grupo"
              were removed: the profile is about this person's research, and
              peers-by-tier is a roster concern that /team already answers. */}
          {sectionOrder.length > 0 && (
            <Accordion
              // Keyed by member: defaultValue is read once on mount, and
              // co-author links reuse this component for a different person.
              key={member.id}
              type="multiple"
              defaultValue={sectionOrder.slice(0, 1)}
              className="mt-14 border-t border-laps-navy/15"
            >
              {memberProjects.length > 0 && (
                <Section
                  value="projects"
                  title={tx.sections.projects}
                  count={memberProjects.length}
                >
                  <Accordion type="multiple" className="border-t border-laps-navy/10">
                    {memberProjects.map((proj) => {
                      const { title, description } = proj.i18n[L];
                      const hasDetails =
                        !!description ||
                        !!proj.contribution ||
                        proj.tags.length > 0 ||
                        !!proj.articleUrl;
                      const summary = (
                        <span className="min-w-0 flex-1 text-left">
                          <span className="block text-sm font-semibold text-pretty text-laps-navy md:text-base">
                            {title}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-laps-navy/55">
                            <span
                              className={proj.status === "ACTIVE" ? "text-laps-signal" : undefined}
                            >
                              {proj.status === "ACTIVE"
                                ? t.projects.status.active
                                : t.projects.status.done}
                            </span>
                            {proj.year && <span className="tabular-nums">{proj.year}</span>}
                            {proj.role !== "RESEARCHER" && (
                              <span>{projectRoleLabel(proj.role)}</span>
                            )}
                          </span>
                        </span>
                      );
                      // A row with nothing behind it is not collapsible — a
                      // chevron that opens onto an empty panel reads as broken.
                      if (!hasDetails) {
                        return (
                          <div key={proj.id} className="flex border-b border-laps-navy/10 py-4">
                            {summary}
                          </div>
                        );
                      }
                      return (
                        <AccordionItem
                          key={proj.id}
                          value={proj.id}
                          className="border-laps-navy/10"
                        >
                          <AccordionTrigger className="gap-4 hover:no-underline">
                            {summary}
                          </AccordionTrigger>
                          <AccordionContent className="space-y-3 pb-5">
                            {proj.tags.length > 0 && (
                              <ul className="flex flex-wrap gap-1.5">
                                {proj.tags.map((tag) => (
                                  <li
                                    key={tag}
                                    className="rounded-sm border border-laps-navy/15 px-1.5 py-0.5 font-mono text-[10px] text-laps-navy/70"
                                  >
                                    {tag}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {description && (
                              <p className="max-w-prose leading-relaxed text-pretty text-laps-navy/75">
                                {description}
                              </p>
                            )}
                            {proj.contribution && (
                              <div className="max-w-prose border-l-2 border-laps-navy/15 pl-3">
                                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-laps-navy/50">
                                  {tx.contribution}
                                </p>
                                <p className="mt-1 leading-relaxed text-pretty text-laps-navy/75">
                                  {proj.contribution}
                                </p>
                              </div>
                            )}
                            {proj.articleUrl && (
                              <a
                                href={proj.articleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={TEXT_LINK}
                              >
                                {tx.openArticle} <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </Section>
              )}

              {showPublications && (
                <Section
                  value="publications"
                  title={tx.sections.publications}
                  count={pubs.length || undefined}
                >
                  {scholarUrl && (
                    <a
                      href={scholarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-laps-cta px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-laps-accent active:scale-[0.96]"
                    >
                      <BookOpen className="h-4 w-4" />
                      {tx.scholar}
                      <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden />
                    </a>
                  )}
                  {pubs.length > 0 && (
                    <ol className="border-t border-laps-navy/10">
                      {pubs.map((pub) => (
                        <li key={pub.id} className="border-b border-laps-navy/10 py-4">
                          <p className="font-semibold leading-snug text-pretty text-laps-navy">
                            {pub.title}
                          </p>
                          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-laps-navy/65">
                            <span className="italic">{pub.venue}</span>
                            <span className="font-mono tabular-nums">{pub.year}</span>
                            <span className="font-mono uppercase tracking-[0.08em] text-laps-navy/50">
                              {PUB_TYPE_LABELS[pub.type]?.[L] ?? pub.type}
                            </span>
                            {pub.status === "IN_PROGRESS" && (
                              <span className="font-medium text-amber-700">
                                {tx.pubStatus.inProgress}
                              </span>
                            )}
                            {pub.status === "IN_PRESS" && (
                              <span className="font-medium text-emerald-700">
                                {tx.pubStatus.inPress}
                              </span>
                            )}
                          </p>
                          {(pub.doi || pub.url) && (
                            <div className="mt-1 flex flex-wrap gap-x-4">
                              {pub.doi && (
                                <a
                                  href={`https://doi.org/${pub.doi}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={TEXT_LINK}
                                >
                                  DOI <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              {pub.url && (
                                <a
                                  href={pub.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={TEXT_LINK}
                                >
                                  {tx.open} <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </Section>
              )}

              {honours.length > 0 && (
                <Section value="honours" title={tx.sections.honours} count={honours.length}>
                  <ul className="border-t border-laps-navy/10">
                    {honours.map((h) => {
                      const d = h.details;
                      const link = d.evidence.find((e) => /^https?:\/\//i.test(e.url));
                      return (
                        <li key={h.id} className="border-b border-laps-navy/10 py-4">
                          <p className="font-semibold leading-snug text-pretty text-laps-navy">
                            {impactText(d.title, L)}
                          </p>
                          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-laps-navy/65">
                            {d.organization && <span>{d.organization}</span>}
                            <time dateTime={d.occurredOn} className="font-mono tabular-nums">
                              {formatDate(d.occurredOn, L)}
                            </time>
                            <span className="font-mono uppercase tracking-[0.08em] text-laps-navy/50">
                              {impactCopy[L].categories[impactKinds.indexOf(d.kind)]}
                            </span>
                          </p>
                          {link && (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`mt-1 ${TEXT_LINK}`}
                            >
                              {link.title} <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </Section>
              )}

              {roadmap && (
                <Section value="roadmap" title={tx.sections.roadmap}>
                  <p className="max-w-prose whitespace-pre-line leading-relaxed text-pretty text-laps-navy/80">
                    {roadmap}
                  </p>
                </Section>
              )}

              {languages.length > 0 && (
                <Section value="languages" title={tx.sections.languages} count={languages.length}>
                  <ul className="grid max-w-xl gap-2 sm:grid-cols-2">
                    {languages.map((entry) => {
                      const meta = LANGUAGE_BY_CODE[entry.code];
                      return (
                        <li key={entry.code} className="flex items-center justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-2">
                            <span aria-hidden className="text-base leading-none">
                              {meta?.flag ?? "🌐"}
                            </span>
                            <span className="truncate text-sm text-laps-navy/85">
                              {meta?.name[L] ?? entry.code}
                            </span>
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${levelBadgeClass(entry.level)}`}
                          >
                            {levelShortLabel(entry.level, L)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </Section>
              )}

              {coAuthors.length > 0 && (
                <Section value="coauthors" title={tx.sections.coauthors} count={coAuthors.length}>
                  <ul className="flex flex-wrap gap-2">
                    {coAuthors.map((c) => (
                      <li key={c.id}>
                        <Link
                          to="/team/$uuid"
                          params={{ uuid: c.id }}
                          className="group flex min-h-10 items-center gap-2 rounded-full border border-laps-navy/15 bg-surface py-1 pl-1 pr-3 text-sm font-medium text-laps-navy/85 transition-colors hover:border-laps-blue/40 hover:text-laps-blue"
                        >
                          <span
                            className={`flex h-7 w-7 items-center justify-center overflow-hidden rounded-full ${
                              TIER_CONFIG[TIER_BY_ROLE[c.currentRole] ?? "undergrad"].fill
                            } font-mono text-[9px] font-semibold text-white`}
                          >
                            {c.photoUrl ? (
                              <img src={c.photoUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              initials(c.fullName)
                            )}
                          </span>
                          {c.fullName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </Accordion>
          )}

          {isEmpty && (
            <p className="mt-14 border-t border-laps-navy/15 pt-8 text-sm italic text-laps-navy/55">
              {tx.emptyPortfolio}
            </p>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

const CHIP =
  "inline-flex items-center gap-1.5 rounded-sm border border-laps-navy/15 bg-surface px-2.5 py-1 text-xs font-medium text-laps-navy/75";

const CONTACT =
  "inline-flex min-h-10 items-center gap-1.5 rounded-md border border-laps-navy/20 bg-surface px-3 py-2 text-xs font-semibold text-laps-navy/80 transition-colors duration-150 hover:border-laps-blue hover:text-laps-blue active:scale-[0.96]";

const TEXT_LINK =
  "inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-laps-blue underline-offset-4 hover:underline";

function Section({
  value,
  title,
  count,
  children,
}: {
  value: string;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem value={value} className="border-laps-navy/15">
      <AccordionTrigger className="gap-4 py-5 hover:no-underline">
        <span className="flex items-baseline gap-3">
          <span className="font-display text-lg font-bold text-laps-navy md:text-xl">{title}</span>
          {count !== undefined && (
            <span className="font-mono text-xs tabular-nums text-laps-navy/45">{count}</span>
          )}
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-8">{children}</AccordionContent>
    </AccordionItem>
  );
}

function formatDate(iso: string, lang: Lang): string {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "pt" ? "pt-BR" : lang === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

const TX: Record<
  Lang,
  {
    since: string;
    joinedLaps: string;
    exchange: string;
    open: string;
    openArticle: string;
    contribution: string;
    scholar: string;
    researchInterests: string;
    photoAlt: (name: string) => string;
    emptyPortfolio: string;
    contact: { email: string; website: string };
    status: { COMPLETED: string; INACTIVE: string };
    pubStatus: { inProgress: string; inPress: string };
    projectRoleLead: string;
    projectRoleCoLead: string;
    projectRoleResearcher: string;
    sections: {
      projects: string;
      publications: string;
      honours: string;
      roadmap: string;
      languages: string;
      coauthors: string;
    };
  }
> = {
  pt: {
    since: "desde",
    joinedLaps: "No LAPS desde",
    exchange: "Intercâmbio",
    open: "Abrir",
    openArticle: "Abrir artigo",
    contribution: "Contribuição",
    scholar: "Ver no Google Scholar",
    researchInterests: "Áreas de pesquisa",
    photoAlt: (name) => `Foto de ${name}`,
    emptyPortfolio:
      "Portfólio ainda em construção. Em breve, projetos e publicações deste pesquisador aparecerão aqui.",
    contact: { email: "E-mail", website: "Site" },
    status: { COMPLETED: "Concluído", INACTIVE: "Inativo" },
    pubStatus: { inProgress: "Em andamento", inPress: "No prelo" },
    projectRoleLead: "Orientador",
    projectRoleCoLead: "Co-orientador",
    projectRoleResearcher: "Pesquisador",
    sections: {
      projects: "Projetos",
      publications: "Publicações",
      honours: "Honras e Bolsas",
      roadmap: "Roteiro de pesquisa",
      languages: "Idiomas",
      coauthors: "Coautores no LAPS",
    },
  },
  en: {
    since: "since",
    joinedLaps: "At LAPS since",
    exchange: "Exchange",
    open: "Open",
    openArticle: "Open article",
    contribution: "Contribution",
    scholar: "View on Google Scholar",
    researchInterests: "Research Interests",
    photoAlt: (name) => `Photo of ${name}`,
    emptyPortfolio:
      "Portfolio still in progress. Projects and publications for this researcher will show up here soon.",
    contact: { email: "Email", website: "Website" },
    status: { COMPLETED: "Completed", INACTIVE: "Inactive" },
    pubStatus: { inProgress: "In progress", inPress: "In press" },
    projectRoleLead: "Advisor",
    projectRoleCoLead: "Co-advisor",
    projectRoleResearcher: "Researcher",
    sections: {
      projects: "Projects",
      publications: "Publications",
      honours: "Honours & Awards",
      roadmap: "Research roadmap",
      languages: "Languages",
      coauthors: "Co-authors at LAPS",
    },
  },
  fr: {
    since: "depuis",
    joinedLaps: "Au LAPS depuis",
    exchange: "Échange",
    open: "Ouvrir",
    openArticle: "Ouvrir l'article",
    contribution: "Contribution",
    scholar: "Voir sur Google Scholar",
    researchInterests: "Domaines de recherche",
    photoAlt: (name) => `Photo de ${name}`,
    emptyPortfolio:
      "Portfolio en construction. Les projets et publications de ce chercheur apparaîtront ici prochainement.",
    contact: { email: "E-mail", website: "Site" },
    status: { COMPLETED: "Terminé", INACTIVE: "Inactif" },
    pubStatus: { inProgress: "En cours", inPress: "Sous presse" },
    projectRoleLead: "Directeur",
    projectRoleCoLead: "Co-directeur",
    projectRoleResearcher: "Chercheur",
    sections: {
      projects: "Projets",
      publications: "Publications",
      honours: "Distinctions et bourses",
      roadmap: "Feuille de route",
      languages: "Langues",
      coauthors: "Co-auteurs au LAPS",
    },
  },
};
