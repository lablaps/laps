import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  ImagePlus,
  Loader2,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api, ApiError, resolveMediaUrl } from "@/lib/api";
import { useAdminRoster } from "@/hooks/use-admin-roster";
import { searchMembers } from "@/lib/member-search";
import {
  NEWS_CATEGORY_LABEL,
  newsApi,
  newsCategories,
  type ApiNews,
  type NewsCategory,
  type NewsInput,
} from "@/lib/news";

/**
 * Notícias in the Central de Comando: list, create, edit, delete.
 *
 * Lives in its own file rather than in routes/admin.tsx, which is already the
 * largest file in the SPA. Limits mirror the API's (NewsInput.java) so a
 * manager sees the problem before the request is sent; the server still
 * enforces them, and its message is shown verbatim when it disagrees.
 */

const MAX_TAGS = 12;
const MAX_PEOPLE = 30;

export function NewsSection() {
  const queryClient = useQueryClient();
  const newsQuery = useQuery({
    queryKey: ["news", "admin"],
    // 100 is the API's page ceiling. The console lists everything it can in
    // one go; paging can come when the lab has published that much.
    queryFn: () => newsApi.list({ size: 100 }),
  });
  const [editing, setEditing] = useState<null | "new" | ApiNews>(null);

  const remove = useMutation({
    mutationFn: (id: string) => newsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["news"] }),
  });

  const items = newsQuery.data?.content ?? [];

  return (
    <section className="mb-8 rounded-2xl border border-laps-light/25 bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-laps-navy">
          <Newspaper className="h-5 w-5 text-laps-blue" />
          Notícias
          {newsQuery.data && (
            <span className="font-mono text-xs font-normal tabular-nums text-laps-navy/50">
              {newsQuery.data.totalElements}
            </span>
          )}
        </h3>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex min-h-10 items-center gap-1 rounded-md bg-laps-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-laps-cta active:scale-[0.96]"
        >
          <Plus className="h-3.5 w-3.5" /> Nova notícia
        </button>
      </div>

      {newsQuery.isLoading && (
        <div className="flex justify-center py-6 text-laps-navy/55">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      {newsQuery.isError && (
        <p role="alert" className="text-sm text-rose-700">
          Não foi possível carregar as notícias.
        </p>
      )}
      {!newsQuery.isLoading && items.length === 0 && (
        <p className="rounded-lg border border-dashed py-8 text-center text-xs text-laps-navy/50">
          Nenhuma notícia publicada.
        </p>
      )}

      <ul className="divide-y divide-laps-navy/10">
        {items.map((n) => (
          <li key={n.id} className="flex items-start gap-3 py-3">
            <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-laps-ghost">
              {n.imageUrl && (
                <img
                  src={resolveMediaUrl(n.imageUrl)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-laps-navy">{n.title.pt}</p>
              <p className="mt-0.5 flex flex-wrap gap-x-2 font-mono text-[10px] uppercase tracking-wider text-laps-navy/50">
                <span className="tabular-nums">{n.publishedOn}</span>
                {n.categories.map((c) => (
                  <span key={c}>{NEWS_CATEGORY_LABEL[c].pt}</span>
                ))}
                {n.people.length > 0 && <span>{n.people.length} pessoa(s)</span>}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <IconButton label="Editar" onClick={() => setEditing(n)}>
                <Pencil className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton
                label="Excluir"
                danger
                onClick={() => {
                  if (window.confirm(`Excluir a notícia "${n.title.pt}"?`)) remove.mutate(n.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </IconButton>
            </div>
          </li>
        ))}
      </ul>
      {remove.isError && (
        <p role="alert" className="mt-2 text-xs text-rose-700">
          Não foi possível excluir: {errorMessage(remove.error)}
        </p>
      )}

      {editing && (
        <NewsEditor
          existing={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["news"] });
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}

function NewsEditor({
  existing,
  onClose,
  onSaved,
}: {
  existing: ApiNews | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<NewsInput>(() =>
    existing
      ? {
          title: { pt: existing.title.pt ?? "", en: existing.title.en, fr: existing.title.fr },
          subtitle: existing.subtitle,
          imageUrl: existing.imageUrl,
          linkUrl: existing.linkUrl,
          publishedOn: existing.publishedOn,
          categories: existing.categories,
          tags: existing.tags,
          memberIds: existing.people.map((p) => p.id),
        }
      : {
          title: { pt: "", en: null, fr: null },
          subtitle: { pt: null, en: null, fr: null },
          imageUrl: null,
          linkUrl: null,
          publishedOn: new Date().toISOString().slice(0, 10),
          categories: [],
          tags: [],
          memberIds: [],
        },
  );
  const [tagDraft, setTagDraft] = useState("");

  const upload = useMutation({
    mutationFn: (file: File) => api.admin.uploadMemberPhoto(file),
    onSuccess: ({ url }) => setForm((f) => ({ ...f, imageUrl: url })),
  });

  const save = useMutation({
    mutationFn: () => {
      const body: NewsInput = { ...form, tags: withDraftTag(form.tags, tagDraft) };
      return existing ? newsApi.update(existing.id, body) : newsApi.create(body);
    },
    onSuccess: onSaved,
  });

  const titleMissing = !form.title.pt.trim();
  const tooManyTags = withDraftTag(form.tags, tagDraft).length > MAX_TAGS;

  function toggleCategory(c: NewsCategory) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(c)
        ? f.categories.filter((x) => x !== c)
        : [...f.categories, c],
    }));
  }

  function commitTags(raw: string) {
    setForm((f) => ({ ...f, tags: withDraftTag(f.tags, raw) }));
    setTagDraft("");
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[90vh] max-w-3xl overflow-y-auto"
        aria-describedby={undefined}
      >
        <DialogTitle>{existing ? "Editar notícia" : "Nova notícia"}</DialogTitle>

        <form
          className="mt-2 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!titleMissing && !tooManyTags) save.mutate();
          }}
        >
          <Group title="Título">
            <Field label="Português (obrigatório)">
              <Input
                required
                maxLength={200}
                value={form.title.pt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: { ...f.title, pt: e.target.value } }))
                }
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Inglês (opcional)">
                <Input
                  maxLength={200}
                  value={form.title.en ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: { ...f.title, en: e.target.value } }))
                  }
                />
              </Field>
              <Field label="Francês (opcional)">
                <Input
                  maxLength={200}
                  value={form.title.fr ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: { ...f.title, fr: e.target.value } }))
                  }
                />
              </Field>
            </div>
          </Group>

          <Group title="Subtítulo (opcional)">
            {(["pt", "en", "fr"] as const).map((l) => (
              <Field key={l} label={l === "pt" ? "Português" : l === "en" ? "Inglês" : "Francês"}>
                <textarea
                  rows={2}
                  maxLength={400}
                  value={form.subtitle[l] ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subtitle: { ...f.subtitle, [l]: e.target.value } }))
                  }
                  className="w-full rounded-md border border-laps-navy/15 bg-surface px-3 py-2 text-sm text-laps-navy focus:outline-2 focus:outline-laps-signal"
                />
              </Field>
            ))}
          </Group>

          <div className="grid gap-6 sm:grid-cols-2">
            <Group title="Imagem">
              <div className="flex items-center gap-3">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-laps-ghost">
                  {form.imageUrl && (
                    <img
                      src={resolveMediaUrl(form.imageUrl)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-col items-start gap-1">
                  <label className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-md bg-laps-accent/10 px-3 py-1.5 text-xs font-semibold text-laps-blue hover:bg-laps-accent/15">
                    {upload.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ImagePlus className="h-3.5 w-3.5" />
                    )}
                    {upload.isPending
                      ? "Enviando…"
                      : form.imageUrl
                        ? "Trocar imagem"
                        : "Enviar imagem"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={upload.isPending}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.currentTarget.value = "";
                        if (file) upload.mutate(file);
                      }}
                    />
                  </label>
                  {form.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, imageUrl: null }))}
                      className="text-[10px] font-semibold uppercase tracking-wider text-laps-navy/45 hover:text-rose-600"
                    >
                      Remover imagem
                    </button>
                  )}
                  {upload.isError && (
                    <span role="alert" className="text-[11px] text-rose-700">
                      {errorMessage(upload.error)}
                    </span>
                  )}
                </div>
              </div>
            </Group>

            <Group title="Data e link">
              <Field label="Data de publicação">
                <Input
                  type="date"
                  required
                  max={new Date().toISOString().slice(0, 10)}
                  value={form.publishedOn}
                  onChange={(e) => setForm((f) => ({ ...f, publishedOn: e.target.value }))}
                />
              </Field>
              <Field label="Link externo (opcional)">
                <div className="relative">
                  <ExternalLink className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-laps-navy/40" />
                  <Input
                    type="url"
                    placeholder="https://www.uema.br/…"
                    maxLength={2000}
                    value={form.linkUrl ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                    className="pl-9"
                  />
                </div>
              </Field>
            </Group>
          </div>

          <Group title="Categorias">
            <p className="-mt-1 mb-2 text-xs text-laps-navy/55">
              Prêmio ou Bolsa colocam a notícia em “Prêmios e Bolsas”.
            </p>
            <div className="flex flex-wrap gap-2">
              {newsCategories.map((c) => {
                const on = form.categories.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleCategory(c)}
                    className={`min-h-10 rounded-md border px-3 text-xs font-semibold transition-colors ${
                      on
                        ? "border-laps-accent bg-laps-accent text-white"
                        : "border-laps-navy/20 bg-surface text-laps-navy/75 hover:border-laps-blue/40"
                    }`}
                  >
                    {NEWS_CATEGORY_LABEL[c].pt}
                  </button>
                );
              })}
            </div>
          </Group>

          <Group title={`Tags livres (até ${MAX_TAGS})`}>
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-sm bg-laps-ghost px-2 py-1 text-xs text-laps-navy"
                >
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remover ${tag}`}
                    onClick={() =>
                      setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
                    }
                    className="text-laps-navy/45 hover:text-rose-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <Input
              className="mt-2"
              placeholder="Digite e pressione Enter ou vírgula (ex: CAPES, EEG)"
              maxLength={200}
              value={tagDraft}
              onChange={(e) => {
                const v = e.target.value;
                if (/[,;\n]/.test(v)) commitTags(v);
                else setTagDraft(v);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitTags(tagDraft);
                }
              }}
            />
            {tooManyTags && (
              <p role="alert" className="mt-1 text-xs text-rose-700">
                Use no máximo {MAX_TAGS} tags.
              </p>
            )}
          </Group>

          <Group title={`Pessoas associadas (até ${MAX_PEOPLE}, na ordem exibida)`}>
            <PeoplePicker
              value={form.memberIds}
              initial={existing?.people ?? []}
              onChange={(memberIds) => setForm((f) => ({ ...f, memberIds }))}
            />
          </Group>

          {save.isError && (
            <p
              role="alert"
              className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
            >
              Não foi possível salvar: {errorMessage(save.error)}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-laps-navy/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-10 rounded-md border border-laps-navy/20 px-4 text-sm font-semibold text-laps-navy hover:bg-laps-ghost"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={save.isPending || upload.isPending || titleMissing || tooManyTags}
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-laps-accent px-4 text-sm font-semibold text-white hover:bg-laps-cta disabled:opacity-50 active:scale-[0.96]"
            >
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {existing ? "Salvar alterações" : "Publicar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Ordered list of members. Order is meaningful (it is how the card lists
 * them), so it can be changed with the arrows rather than only appended to.
 */
function PeoplePicker({
  value,
  initial,
  onChange,
}: {
  value: string[];
  initial: { id: string; fullName: string }[];
  onChange: (next: string[]) => void;
}) {
  const { members: roster } = useAdminRoster();
  const nameOf = useMemo(() => {
    const map = new Map<string, string>(initial.map((p) => [p.id, p.fullName]));
    for (const m of roster) map.set(m.id, m.fullName);
    return map;
  }, [roster, initial]);

  const [q, setQ] = useState("");
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const taken = new Set(value);
    return searchMembers(
      roster.filter((m) => !m.deletedAt && !taken.has(m.id)),
      q,
      8,
    );
  }, [q, roster, value]);

  const full = value.length >= MAX_PEOPLE;

  function move(index: number, delta: number) {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-laps-navy/40" />
        <Input
          value={q}
          disabled={full}
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            full ? `Limite de ${MAX_PEOPLE} pessoas atingido` : "Buscar membro por nome ou iniciais"
          }
          className="pl-10"
        />
        {results.length > 0 && (
          <div className="absolute inset-x-0 top-11 z-20 max-h-64 overflow-y-auto rounded-lg border border-laps-light/40 bg-surface shadow-xl">
            {results.map(({ member }) => (
              <button
                key={member.id}
                type="button"
                onClick={() => {
                  onChange([...value, member.id]);
                  setQ("");
                }}
                className="flex min-h-10 w-full items-center px-3 py-2 text-left text-sm text-laps-navy hover:bg-laps-ghost"
              >
                {member.fullName}
              </button>
            ))}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <ol className="divide-y divide-laps-navy/10 rounded-md border border-laps-navy/10">
          {value.map((id, i) => (
            <li key={id} className="flex items-center gap-2 px-3 py-1.5 text-sm text-laps-navy">
              <span className="w-5 font-mono text-[11px] tabular-nums text-laps-navy/45">
                {i + 1}
              </span>
              <span className="flex-1 truncate">{nameOf.get(id) ?? id.slice(0, 8)}</span>
              <IconButton label="Mover para cima" disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton
                label="Mover para baixo"
                disabled={i === value.length - 1}
                onClick={() => move(i, 1)}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton
                label="Remover"
                danger
                onClick={() => onChange(value.filter((x) => x !== id))}
              >
                <X className="h-3.5 w-3.5" />
              </IconButton>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-[10px] font-bold uppercase tracking-wider text-laps-navy/55">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-laps-navy/70">{label}</span>
      {children}
    </label>
  );
}

function IconButton({
  label,
  onClick,
  children,
  danger = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-md text-laps-navy/50 transition-colors disabled:opacity-30 ${
        danger ? "hover:bg-rose-50 hover:text-rose-600" : "hover:bg-laps-ghost hover:text-laps-blue"
      }`}
    >
      {children}
    </button>
  );
}

/** Adds the half-typed tag (if any) using the same rules as the server. */
function withDraftTag(tags: string[], draft: string): string[] {
  const next = [...tags];
  for (const raw of draft.split(/[,;\n]+/)) {
    const clean = raw.trim().replace(/\s+/g, " ").slice(0, 40);
    if (clean && !next.some((t) => t.toLowerCase() === clean.toLowerCase())) next.push(clean);
  }
  return next;
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "erro desconhecido";
}
