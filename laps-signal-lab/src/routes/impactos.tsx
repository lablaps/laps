import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/PublicLayout";
import { ImpactCard, ImpactPagination, impactButton, impactField } from "@/components/impacts/ImpactList";
import { impactApi, impactCopy, impactKinds, type ImpactFilters } from "@/lib/impacts";
import { useLang } from "@/hooks/use-lang";

export const Route = createFileRoute("/impactos")({ component: ImpactsPage });

function ImpactsPage() {
  const { lang } = useLang(); const t = impactCopy[lang];
  const [draft, setDraft] = useState({ q: "", kind: "", from: "", to: "" });
  const [filters, setFilters] = useState<ImpactFilters>({ page: 0 });
  const query = useQuery({ queryKey: ["impacts", "directory", filters], queryFn: () => impactApi.list(filters) });
  return <PublicLayout><main className="mx-auto max-w-[1280px] px-6 py-16 md:px-10">
    <p className="label-tech">LAPS / {t.title}</p>
    <h1 className="mt-6 text-balance font-display text-5xl font-extrabold text-laps-navy">{t.title}</h1>
    <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-laps-navy/70">{t.intro}</p>
    <form className="mt-10 grid items-end gap-4 border-y border-laps-navy/15 py-6 sm:grid-cols-2 lg:grid-cols-[2fr_1.4fr_1fr_1fr_auto]" onSubmit={e => { e.preventDefault(); setFilters({ ...draft, page: 0 }); }}>
      <label className="space-y-2 text-sm font-medium"><span>{t.search}</span><input type="search" className={impactField} maxLength={200} value={draft.q} onChange={e => setDraft({ ...draft, q: e.target.value })} /></label>
      <label className="space-y-2 text-sm font-medium"><span>{t.kind}</span><select className={impactField} value={draft.kind} onChange={e => setDraft({ ...draft, kind: e.target.value })}><option value="">{t.all}</option>{impactKinds.map((kind, i) => <option key={kind} value={kind}>{t.categories[i]}</option>)}</select></label>
      <label className="space-y-2 text-sm font-medium"><span>{t.from}</span><input className={impactField} type="date" max={draft.to || undefined} value={draft.from} onChange={e => setDraft({ ...draft, from: e.target.value })} /></label>
      <label className="space-y-2 text-sm font-medium"><span>{t.to}</span><input className={impactField} type="date" min={draft.from || undefined} value={draft.to} onChange={e => setDraft({ ...draft, to: e.target.value })} /></label>
      <button type="submit" className={impactButton}>{t.filter}</button>
    </form>
    <div className="mt-8" aria-live="polite">
      {query.isPending ? <p>{t.loading}</p> : query.isError ? <div role="alert"><p>{t.error}</p><button className={`${impactButton} mt-4`} onClick={() => query.refetch()}>{t.retry}</button></div> : <>
        <p className="mb-6 font-mono text-xs text-laps-navy/60"><span className="tabular-nums">{query.data.totalElements}</span> {t.results}</p>
        {!query.data.content.length && <p className="py-12 text-laps-navy/65">{t.noResults}</p>}
        <div className="grid gap-x-12 md:grid-cols-2">{query.data.content.map(impact => <ImpactCard key={impact.id} impact={impact} showMember />)}</div>
        <ImpactPagination page={filters.page ?? 0} totalPages={query.data.totalPages} onPage={page => setFilters({ ...filters, page })} />
      </>}
    </div>
  </main></PublicLayout>;
}
