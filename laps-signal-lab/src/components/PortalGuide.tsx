import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowUp, Check, HelpCircle, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

/**
 * First-run guide for the member portal, in Portuguese.
 *
 * The portal's onboarding is a three-step chain with a hard ordering imposed by
 * the API, and getting the order wrong is not a soft failure — it is a 403 with
 * an English message the member cannot act on. The password must be rotated
 * FIRST: `PUT /api/v1/me` refuses every profile write while the temporary
 * password is live, so "cadastre seu email" cannot be step one no matter how
 * natural it reads. `PUT /api/v1/me/password` deliberately exempts that first
 * rotation from the verified-email requirement precisely so this order works.
 *
 * A static checklist had already proven not to be enough — it is rendered in a
 * sidebar the member scrolls past. So each step opens once, explains itself, and
 * can point a literal arrow at the card it is talking about.
 *
 * The spotlight is deliberately click-through (`pointer-events-none`, with the
 * dimming drawn as one enormous box-shadow spread around the cut-out): the
 * member should be able to start typing in the highlighted field while the arrow
 * is still on screen, rather than having to dismiss the coach mark first.
 */

export type GuideStepId = "password" | "email" | "verify";

interface GuideStep {
  id: GuideStepId;
  /** Value of the `data-guide` attribute on the card this step talks about. */
  target: string;
  icon: typeof KeyRound;
  title: string;
  body: string;
  cta: string;
  /** Short label shown in the arrow chip pinned to the target. */
  pin: string;
}

const STEPS: GuideStep[] = [
  {
    id: "password",
    target: "password",
    icon: KeyRound,
    title: "Primeiro, troque a senha temporária",
    body: "Este passo não exige email — pode ser feito agora mesmo. Digite a senha temporária que você recebeu no campo «Senha atual» e escolha a sua senha definitiva, com pelo menos 8 caracteres. Enquanto a senha temporária estiver ativa, o resto do perfil fica bloqueado para edição, então comece por aqui.",
    cta: "Mostrar onde trocar",
    pin: "Troque sua senha aqui",
  },
  {
    id: "email",
    target: "email",
    icon: Mail,
    title: "Agora cadastre seu email",
    body: "Senha trocada — seu perfil está liberado. Abra o cartão «Contato & Links», toque em «Editar» e preencha o campo «Email (login e recuperação)». Esse email passa a ser o seu login e o caminho para recuperar a conta se você esquecer a senha. Não esqueça de salvar.",
    cta: "Mostrar onde cadastrar",
    pin: "Toque em «Editar» aqui",
  },
  {
    id: "verify",
    target: "verify",
    icon: ShieldCheck,
    title: "Por último, verifique o email",
    body: "Enviamos um código de 6 dígitos para o seu email — digite-o para confirmar (olhe também no spam). Com o email verificado sua conta fica completa e você pode trocar a senha quando quiser, sem depender da coordenação.",
    cta: "Mostrar a verificação",
    pin: "Confirme seu email aqui",
  },
];

/** How long the arrow and highlight stay on screen before fading out on their own. */
const SPOTLIGHT_MS = 9000;

/** Session-scoped so the modal explains each step once, not on every re-render. */
function seenKey(step: GuideStepId) {
  return `laps.portal.guide.${step}`;
}

function markSeen(step: GuideStepId) {
  try {
    window.sessionStorage.setItem(seenKey(step), "1");
  } catch {
    /* private mode — the guide just opens again, which is harmless */
  }
}

function wasSeen(step: GuideStepId) {
  try {
    return window.sessionStorage.getItem(seenKey(step)) === "1";
  } catch {
    return false;
  }
}

/**
 * @param step The step the member is actually on, or null when onboarding is
 *   complete and the guide should disappear entirely.
 */
export default function PortalGuide({ step }: { step: GuideStepId | null }) {
  const [open, setOpen] = useState(false);
  const [spotlight, setSpotlight] = useState<string | null>(null);

  // Auto-open once per step per session. Re-opens when the member advances
  // (password → email → verify), which is what turns three separate cards into
  // something that reads as one guided flow.
  useEffect(() => {
    if (!step) return;
    if (wasSeen(step)) return;
    markSeen(step);
    setOpen(true);
  }, [step]);

  // Onboarding finished — drop the help button and any lingering coach mark.
  useEffect(() => {
    if (!step) {
      setOpen(false);
      setSpotlight(null);
    }
  }, [step]);

  const clearSpotlight = useCallback(() => setSpotlight(null), []);

  if (!step) return null;

  const current = STEPS.find((s) => s.id === step);
  if (!current) return null;

  const activeIndex = STEPS.indexOf(current);

  function showMe() {
    setOpen(false);
    // Let the dialog finish closing before measuring, or the target's rect is
    // taken while the overlay is still animating over it.
    window.setTimeout(() => setSpotlight(current!.target), 180);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md gap-0 overflow-hidden rounded-2xl border-laps-blue/15 p-0 sm:rounded-2xl">
          <div className="rounded-t-2xl bg-gradient-to-br from-laps-ghost/70 to-surface px-6 pb-4 pt-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-laps-accent/15 text-laps-blue">
                <current.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-laps-blue">
                  Passo {activeIndex + 1} de {STEPS.length}
                </p>
                <DialogTitle className="mt-1 text-balance font-display text-base font-bold text-laps-navy">
                  {current.title}
                </DialogTitle>
              </div>
            </div>
          </div>

          <div className="px-6">
            <DialogDescription className="text-pretty text-sm leading-relaxed text-laps-navy/70">
              {current.body}
            </DialogDescription>

            <ol className="mt-4 space-y-2">
              {STEPS.map((s, i) => {
                const done = i < activeIndex;
                const active = i === activeIndex;
                return (
                  <li
                    key={s.id}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs ${
                      active ? "bg-laps-ghost/70 font-semibold text-laps-navy" : "text-laps-navy/45"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        done
                          ? "bg-emerald-100 text-emerald-700"
                          : active
                            ? "bg-laps-accent text-white"
                            : "bg-laps-ink/8 text-laps-navy/50"
                      }`}
                    >
                      {done ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span className={done ? "line-through" : ""}>{s.title}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="flex flex-col-reverse gap-2 px-6 pb-6 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 items-center justify-center rounded-md px-4 text-xs font-semibold text-laps-navy/60 transition hover:bg-laps-ghost/70 hover:text-laps-navy"
            >
              Depois
            </button>
            <button
              type="button"
              onClick={showMe}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-laps-accent px-4 text-xs font-bold text-white shadow-[0_8px_24px_-10px_rgba(11,78,141,0.7)] transition hover:bg-laps-ink active:scale-[0.98]"
            >
              {current.cta}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {spotlight && <Spotlight target={spotlight} label={current.pin} onDone={clearSpotlight} />}

      {/* Always reachable — the member can re-open the explanation after
          dismissing it, instead of being stuck with a step they half-read. */}
      {!open && !spotlight && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-laps-blue/20 bg-surface/95 px-4 py-2.5 text-xs font-bold text-laps-blue shadow-[0_10px_30px_-10px_rgba(11,78,141,0.5)] backdrop-blur transition hover:bg-laps-ghost active:scale-[0.97]"
        >
          <HelpCircle className="h-4 w-4" />
          Preciso de ajuda
        </button>
      )}
    </>
  );
}

/**
 * Dims the page, cuts a hole around the target card and parks a bouncing arrow
 * beside it. The rect is re-read every frame so the highlight stays glued to the
 * card through the smooth-scroll that brings it into view, and through any
 * layout shift caused by the member starting to type.
 */
function Spotlight({
  target,
  label,
  onDone,
}: {
  target: string;
  label: string;
  onDone: () => void;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(`[data-guide="${target}"]`);
    if (!el) {
      onDone();
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    let frame = 0;
    const track = () => {
      const next = el.getBoundingClientRect();
      // Only re-render when the card actually moved. Once the smooth-scroll
      // settles the rect stops changing, so this drops the coach mark from 60
      // renders a second to none while it just sits there.
      setRect((prev) =>
        prev && prev.top === next.top && prev.left === next.left && prev.height === next.height
          ? prev
          : next,
      );
      frame = window.requestAnimationFrame(track);
    };
    track();

    const timer = window.setTimeout(onDone, SPOTLIGHT_MS);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [target, onDone]);

  if (!rect || typeof document === "undefined") return null;

  // Prefer the arrow above the card; flip below when the card is near the top of
  // the viewport and there is no room for the chip.
  const above = rect.top > 132;
  const anchorY = above ? rect.top - 10 : rect.bottom + 10;
  // Keep the chip fully on screen on a 390px-wide phone.
  const centerX = Math.min(
    Math.max(rect.left + rect.width / 2, 110),
    Math.max(window.innerWidth - 110, 110),
  );

  return createPortal(
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed z-[60] rounded-[18px] ring-2 ring-laps-blue transition-[top,left,width,height] duration-150"
        style={{
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12,
          boxShadow: "0 0 0 9999px rgba(15, 42, 66, 0.55)",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none fixed z-[61]"
        style={{
          top: anchorY,
          left: centerX,
          transform: above ? "translate(-50%, -100%)" : "translate(-50%, 0)",
        }}
      >
        <div className="flex animate-bounce flex-col items-center gap-1 motion-reduce:animate-none">
          {!above && <ArrowUp className="h-6 w-6 text-white drop-shadow" strokeWidth={2.5} />}
          <span className="max-w-[calc(100vw-2rem)] rounded-full bg-laps-accent px-3.5 py-2 text-xs font-bold text-white shadow-[0_12px_30px_-8px_rgba(0,0,0,0.6)]">
            {label}
          </span>
          {above && <ArrowDown className="h-6 w-6 text-white drop-shadow" strokeWidth={2.5} />}
        </div>
      </div>

      {/* The only clickable part of the overlay — everything else lets clicks
          through to the highlighted form. */}
      <button
        type="button"
        onClick={onDone}
        className="fixed bottom-5 left-1/2 z-[62] -translate-x-1/2 rounded-full bg-surface/95 px-5 py-2.5 text-xs font-bold text-laps-navy shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)] backdrop-blur transition hover:bg-surface active:scale-[0.97]"
      >
        Entendi
      </button>
    </>,
    document.body,
  );
}
