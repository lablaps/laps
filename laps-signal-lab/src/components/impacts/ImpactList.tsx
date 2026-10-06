import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/hooks/use-lang";
import { impactApi, impactCopy, impactKinds, impactText, type Impact } from "@/lib/impacts";

export const impactButton = "inline-flex min-h-10 items-center justify-center rounded-md border border-laps-navy/25 px-4 py-2 text-sm font-semibold text-laps-navy transition-colors hover:bg-laps-ghost disabled:opacity-50 active:scale-[0.96]";
export const impactField = "w-full min-h-11 rounded-md border border-laps-navy/25 bg-surface px-3 py-2 text-sm text-laps-navy focus:outline-2 focus:outline-laps-signal";

export function ImpactCard({ impact, showMember = false }: { impact: Impact; showMember?: boolean }) {
  const { lang } = useLang();
  const t = impactCopy[lang];
  const d = impact.details;
  return (
    <article className="min-w-0 border-t border-laps-navy/15 py-6">
      <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-laps-navy/60">
        <time dateTime={d.occurredOn}>{new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${d.occurredOn}T12:00:00Z`))}</time>
        <span>{t.categories[impactKinds.indexOf(d.kind)]}</span>
      </div>
      <h3 className="mt-3 text-balance text-xl font-semibold text-laps-navy">{impactText(d.title, lang)}</h3>
      {showMember && <Link to="/team/$uuid" params={{ uuid: impact.memberSlug || impact.memberId }} className="mt-2 inline-flex min-h-10 items-center text-sm font-semibold text-laps-signal underline underline-offset-4">{impact.memberName}</Link>}
      {d.organization && <p className="mt-2 text-sm text-laps-navy/65">{d.organization}</p>}
      <dl className="mt-5 grid gap-4 text-sm">
        {(["role", "outcome", "contribution"] as const).map(key => <div key={key}><dt className="font-semibold text-laps-navy">{t[key]}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-pretty leading-relaxed text-laps-navy/75">{impactText(d[key], lang)}</dd></div>)}
        {d.collaborators.length > 0 && <div><dt className="font-semibold">{t.collaborators}</dt><dd className="mt-1 break-words text-laps-navy/75">{d.collaborators.join(" · ")}</dd></div>}
        <div><dt className="font-semibold">{t.supervisors}</dt><dd className="mt-1 break-words text-laps-navy/75">{d.supervisors.length ? d.supervisors.join(" · ") : t.noneSupervisors}</dd></div>
      </dl>
      {d.tools.length > 0 && <div className="mt-5"><h4 className="text-sm font-semibold">{t.tools}</h4><ul className="mt-2 flex flex-wrap gap-2">{d.tools.map((tool, i) => <li key={i} className="max-w-full break-words bg-laps-ghost px-2.5 py-1 font-mono text-xs text-laps-navy">{tool}</li>)}</ul></div>}
      {d.evidence.length > 0 && <div className="mt-5"><h4 className="text-sm font-semibold">{t.evidence}</h4><ul className="mt-1">{d.evidence.map((link, i) => /^https?:\/\//i.test(link.url) && <li key={i}><a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center break-words text-sm text-laps-signal underline underline-offset-4">{link.title} ↗</a></li>)}</ul></div>}
    </article>
  );
}

export function ImpactPagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  const { lang } = useLang(); const t = impactCopy[lang];
  if (totalPages <= 1) return null;
  return <div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" className={impactButton} disabled={!page} onClick={() => onPage(page - 1)}>{t.previous}</button><span className="text-sm tabular-nums">{t.page} {page + 1} {t.of} {totalPages}</span><button type="button" className={impactButton} disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)}>{t.next}</button></div>;
}

export function MemberImpacts({ memberId }: { memberId: string }) {
  const { lang } = useLang(); const t = impactCopy[lang];
  const [page, setPage] = useState(0);
  const query = useQuery({ queryKey: ["impacts", memberId, page], queryFn: () => impactApi.list({ memberId, page }) });
  return <section aria-label={t.title} className="rounded-lg border border-laps-navy/15 bg-surface p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{t.title}{query.data && <span className="ml-3 font-mono text-sm font-normal tabular-nums text-laps-navy/55">{query.data.totalElements}</span>}</h2><Link to="/impactos" className="inline-flex min-h-10 items-center text-sm text-laps-signal underline underline-offset-4">{t.browse}</Link></div>
    {query.isPending ? <p role="status">{t.loading}</p> : query.isError ? <div role="alert"><p>{t.error}</p><button className={impactButton} onClick={() => query.refetch()}>{t.retry}</button></div> : <>
      {!query.data.content.length && <p className="mt-4 text-sm text-laps-navy/60">{t.empty}</p>}
      {query.data.content.map(impact => <ImpactCard key={impact.id} impact={impact} />)}
      <ImpactPagination page={page} totalPages={query.data.totalPages} onPage={setPage} />
    </>}
  </section>;
}
