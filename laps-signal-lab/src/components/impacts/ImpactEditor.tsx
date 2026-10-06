import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/hooks/use-lang";
import type { Lang } from "@/lib/i18n";
import { impactApi, impactCopy, impactKinds, type Impact, type ImpactInput } from "@/lib/impacts";
import { ImpactCard, ImpactPagination, impactButton, impactField } from "./ImpactList";

const blank = (): ImpactInput => ({ kind: "SCHOLARSHIP", occurredOn: "", title: { pt: "", en: "", fr: "" }, outcome: { pt: "", en: "", fr: "" }, contribution: { pt: "", en: "", fr: "" }, role: { pt: "", en: "", fr: "" }, organization: "", tools: [], collaborators: [], supervisors: [], evidence: [] });
const lines = (value: string) => value.split("\n").map(s => s.trim()).filter(Boolean);
const today = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };

function ImpactForm({ impact, onClose, onSaved }: { impact?: Impact; onClose: () => void; onSaved: () => void }) {
  const { lang } = useLang(); const t = impactCopy[lang];
  const [draft, setDraft] = useState<ImpactInput>(() => impact ? structuredClone(impact.details) : blank());
  const [contentLang, setContentLang] = useState<Lang>("pt");
  const [tools, setTools] = useState(draft.tools.join("\n"));
  const [collaborators, setCollaborators] = useState(draft.collaborators.join("\n"));
  const [supervisors, setSupervisors] = useState(draft.supervisors.join("\n"));
  const [invalid, setInvalid] = useState(false);
  const save = useMutation({ mutationFn: (body: ImpactInput) => impactApi.save(body, impact?.id), onSuccess: onSaved });
  const toolCount = lines(tools).length;
  return <form className="mt-5 space-y-5 border-t border-laps-navy/20 pt-5" onSubmit={event => {
    event.preventDefault();
    const body = { ...draft, tools: lines(tools), collaborators: lines(collaborators), supervisors: lines(supervisors) };
    const valid = [body.title, body.outcome, body.contribution, body.role].every(text => text.pt.trim() && Object.values(text).every(v => !v || v.length <= 3000))
      && body.occurredOn && body.occurredOn <= today() && toolCount <= 10 && body.tools.every(v => v.length <= 80)
      && body.collaborators.length <= 50 && body.supervisors.length <= 10
      && [...body.collaborators, ...body.supervisors].every(v => v.length <= 200)
      && body.evidence.length <= 20 && body.evidence.every(e => { try { const u = new URL(e.url); return e.title.trim() && ["http:", "https:"].includes(u.protocol) && !u.username && !u.password; } catch { return false; } });
    setInvalid(!valid); if (!valid) { setContentLang("pt"); return; } save.mutate(body);
  }}>
    <fieldset disabled={save.isPending} className="space-y-5 disabled:opacity-60">
      <legend className="sr-only">{impact ? t.edit : t.add}</legend>
      <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium"><span>{t.kind}</span><select className={impactField} value={draft.kind} onChange={e => setDraft({ ...draft, kind: e.target.value as ImpactInput["kind"] })}>{impactKinds.map((kind, i) => <option key={kind} value={kind}>{t.categories[i]}</option>)}</select></label><label className="space-y-2 text-sm font-medium"><span>{t.date}</span><input className={impactField} type="date" required max={today()} value={draft.occurredOn} onChange={e => setDraft({ ...draft, occurredOn: e.target.value })} /></label></div>
      <label className="block space-y-2 text-sm font-medium"><span>{t.translations}</span><select className={impactField} value={contentLang} onChange={e => setContentLang(e.target.value as Lang)}><option value="pt">Português</option><option value="en">English</option><option value="fr">Français</option></select></label>
      <p className="text-sm leading-relaxed text-laps-navy/65">{t.translationHint}</p>
      {(["title", "outcome", "contribution", "role"] as const).map(key => <label key={key} className="block space-y-2 text-sm font-medium"><span>{key === "title" ? t.heading : t[key]} ({contentLang.toUpperCase()})</span><textarea rows={key === "title" || key === "role" ? 2 : 3} className={impactField} maxLength={3000} required={contentLang === "pt"} value={draft[key][contentLang] ?? ""} onChange={e => setDraft({ ...draft, [key]: { ...draft[key], [contentLang]: e.target.value } })} /></label>)}
      <label className="block space-y-2 text-sm font-medium"><span>{t.organization} — {t.optional}</span><input className={impactField} maxLength={200} value={draft.organization ?? ""} onChange={e => setDraft({ ...draft, organization: e.target.value })} /></label>
      <label className="block space-y-2 text-sm font-medium"><span>{t.tools} <span className="tabular-nums">({toolCount}/10)</span></span><textarea className={impactField} rows={3} value={tools} onChange={e => setTools(e.target.value)} aria-invalid={toolCount > 10} /><span className="block text-xs font-normal text-laps-navy/65">{t.toolsHint}</span></label>
      {toolCount > 10 && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{t.toolLimit}</p>}
      <label className="block space-y-2 text-sm font-medium"><span>{t.collaborators} (0–50)</span><textarea className={impactField} rows={3} value={collaborators} onChange={e => setCollaborators(e.target.value)} /><span className="block text-xs font-normal text-laps-navy/65">{t.peopleHint}</span></label>
      <label className="block space-y-2 text-sm font-medium"><span>{t.supervisors} (0–10)</span><textarea className={impactField} rows={2} value={supervisors} onChange={e => setSupervisors(e.target.value)} /><span className="block text-xs font-normal text-laps-navy/65">{t.supervisorHint}</span></label>
      <fieldset className="space-y-3"><legend className="mb-3 text-sm font-semibold">{t.evidence} ({draft.evidence.length}/20)</legend>{draft.evidence.map((evidence, index) => <div key={index} className="grid gap-3 border-l-2 border-laps-navy/20 pl-4"><label className="space-y-1 text-sm"><span>{t.linkTitle}</span><input className={impactField} required maxLength={200} value={evidence.title} onChange={e => setDraft({ ...draft, evidence: draft.evidence.map((item, i) => i === index ? { ...item, title: e.target.value } : item) })} /></label><label className="space-y-1 text-sm"><span>{t.url}</span><input className={impactField} type="url" required maxLength={2000} value={evidence.url} onChange={e => setDraft({ ...draft, evidence: draft.evidence.map((item, i) => i === index ? { ...item, url: e.target.value } : item) })} /></label><button className={`${impactButton} justify-self-start`} type="button" onClick={() => setDraft({ ...draft, evidence: draft.evidence.filter((_, i) => i !== index) })}>{t.removeLink}</button></div>)}<button type="button" className={impactButton} disabled={draft.evidence.length >= 20} onClick={() => setDraft({ ...draft, evidence: [...draft.evidence, { title: "", url: "" }] })}>{t.addLink}</button></fieldset>
    </fieldset>
    {invalid && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{t.invalid}</p>}
    {save.isError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{t.saveError}</p>}
    <div className="flex flex-wrap gap-3"><button className={`${impactButton} bg-laps-ghost`} disabled={save.isPending || toolCount > 10} type="submit">{save.isPending ? t.saving : t.save}</button><button className={impactButton} type="button" disabled={save.isPending} onClick={onClose}>{t.cancel}</button></div>
  </form>;
}

export function ImpactEditor({ locked }: { locked: boolean }) {
  const { lang } = useLang(); const t = impactCopy[lang];
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Impact | "new" | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const query = useQuery({ queryKey: ["my-impacts", page], queryFn: () => impactApi.mine(page) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["my-impacts"] }); qc.invalidateQueries({ queryKey: ["impacts"] }); };
  const remove = useMutation({ mutationFn: impactApi.remove, onSuccess: () => { setDeleting(null); if (query.data?.content.length === 1 && page > 0) setPage(page - 1); refresh(); } });
  return <section className="rounded-lg border border-laps-navy/15 bg-surface p-6" aria-label={t.title}>
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{t.title}</h2><button className={impactButton} disabled={locked || editing !== null} onClick={() => setEditing("new")}>{t.add}</button></div>
    <p className="mt-3 text-sm leading-relaxed text-laps-navy/65">{locked ? t.locked : t.publicNotice}</p>
    {editing && !locked && <ImpactForm key={editing === "new" ? "new" : editing.id} impact={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setPage(0); refresh(); }} />}
    {query.isPending ? <p className="mt-5" role="status">{t.loading}</p> : query.isError ? <div className="mt-5" role="alert"><p>{t.error}</p><button className={impactButton} onClick={() => query.refetch()}>{t.retry}</button></div> : <>
      {!query.data.content.length && <p className="mt-5 text-sm text-laps-navy/60">{t.empty}</p>}
      {query.data.content.map(impact => <div key={impact.id} className="mt-4"><ImpactCard impact={impact} /><div className="flex flex-wrap gap-3"><button className={impactButton} disabled={locked || editing !== null} onClick={() => setEditing(impact)}>{t.edit}</button><button className={impactButton} disabled={locked || remove.isPending} onClick={() => { remove.reset(); setDeleting(impact.id); }}>{t.remove}</button></div>{deleting === impact.id && <div className="mt-3 space-y-3" role="group" aria-label={t.confirm}><p className="text-sm">{t.confirm}</p>{remove.isError && <p role="alert">{t.deleteError}</p>}<div className="flex gap-3"><button className={impactButton} disabled={remove.isPending} onClick={() => remove.mutate(impact.id)}>{t.remove}</button><button className={impactButton} disabled={remove.isPending} onClick={() => setDeleting(null)}>{t.cancel}</button></div></div>}</div>)}
      <ImpactPagination page={page} totalPages={query.data.totalPages} onPage={setPage} />
    </>}
  </section>;
}
