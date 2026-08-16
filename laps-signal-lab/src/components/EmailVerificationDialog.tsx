import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2, MailCheck, ShieldCheck, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { ApiError, api, type MyProfile } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface Issued {
  channel: "EMAIL" | "MANUAL";
  /** Present only in MANUAL mode — see api.meRequestEmailVerification. */
  code?: string;
  expiresAt?: string;
}

/**
 * The "check your inbox" step of email verification.
 *
 * <p>Requesting a code and entering it are one interaction, so they are one
 * component: the button issues the code and opens the dialog on success, which
 * means the dialog never appears in a state where there is nothing to type.
 */
export function EmailVerificationDialog({ me }: { me: MyProfile }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [issued, setIssued] = useState<Issued | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const requestCode = useMutation({
    mutationFn: () => api.meRequestEmailVerification(),
    onSuccess: (res) => {
      if (res.alreadyVerified) {
        qc.invalidateQueries({ queryKey: ["me"] });
        toast.success("Email já verificado.");
        return;
      }
      setIssued({
        channel: res.channel ?? "EMAIL",
        code: res.code,
        expiresAt: res.expiresAt,
      });
      setCode("");
      setError(null);
      setOpen(true);
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Falha ao solicitar o código."),
  });

  const verify = useMutation({
    mutationFn: (value: string) => api.meVerifyEmail(value),
    onSuccess: async () => {
      setOpen(false);
      setIssued(null);
      setCode("");
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Email verificado com sucesso!");
    },
    onError: (err) => {
      // Inline, not a toast: the message says how many attempts are left, and
      // it has to stay on screen next to the field it refers to.
      setError(err instanceof ApiError ? err.message : "Código inválido ou expirado.");
      setCode("");
    },
  });

  const submit = (value: string) => {
    if (value.length === 6 && !verify.isPending) verify.mutate(value);
  };

  const busy = verify.isPending;
  const resending = requestCode.isPending && open;

  return (
    <>
      <button
        type="button"
        onClick={() => requestCode.mutate()}
        disabled={requestCode.isPending}
        className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-800 transition-colors duration-150 hover:border-amber-500 hover:text-amber-900 active:scale-[0.98] disabled:opacity-60"
      >
        {requestCode.isPending && !open ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ShieldCheck className="h-3.5 w-3.5" />
        )}
        {requestCode.isPending && !open ? "Enviando código…" : `Verificar ${me.email}`}
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setError(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <MailCheck className="h-5 w-5" />
            </div>
            <DialogTitle className="text-center text-base">
              Confira sua caixa de entrada
            </DialogTitle>
            <DialogDescription className="text-center text-pretty">
              Enviamos um código de 6 dígitos para{" "}
              <strong className="font-semibold text-laps-navy">{me.email}</strong>. Se ele não
              aparecer em alguns segundos, procure também na pasta de{" "}
              <strong className="font-semibold">spam</strong> ou lixo eletrônico.
            </DialogDescription>
          </DialogHeader>

          {issued?.channel === "MANUAL" && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Nenhum provedor de email configurado.</p>
                <p className="mt-0.5 text-amber-900/80">
                  Nada foi enviado. Use o código abaixo — e configure{" "}
                  <code className="rounded bg-white/70 px-1 font-mono">LAPS_EMAIL_PROVIDER</code> no
                  servidor para que a verificação signifique alguma coisa.
                </p>
                <code className="mt-2 block rounded bg-white px-2 py-1 text-center font-mono text-base font-bold tracking-[0.3em] text-amber-900">
                  {issued.code}
                </code>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-3 py-2">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(next) => {
                setCode(next);
                if (error) setError(null);
              }}
              onComplete={submit}
              pattern={REGEXP_ONLY_DIGITS}
              inputMode="numeric"
              autoFocus
              disabled={busy}
              aria-label="Código de verificação de 6 dígitos"
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} className="h-12 w-10 text-lg tabular-nums" />
                ))}
              </InputOTPGroup>
            </InputOTP>

            {error ? (
              <p role="alert" className="text-center text-xs font-semibold text-red-600">
                {error}
              </p>
            ) : (
              <Countdown expiresAt={issued?.expiresAt} />
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => requestCode.mutate()}
              disabled={requestCode.isPending || busy}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-laps-navy/70 transition-colors duration-150 hover:text-laps-blue active:scale-[0.98] disabled:opacity-60"
            >
              {resending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {resending ? "Reenviando…" : "Reenviar código"}
            </button>
            <button
              type="button"
              onClick={() => submit(code)}
              disabled={code.length !== 6 || busy}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-amber-700 px-5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-amber-800 active:scale-[0.98] disabled:opacity-60"
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {busy ? "Verificando…" : "Verificar"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Ticks down to the code's expiry, so "it stopped working" is never a surprise. */
function Countdown({ expiresAt }: { expiresAt?: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) return null;
  const remaining = Math.max(0, new Date(expiresAt).getTime() - now);
  if (remaining === 0) {
    return (
      <p className="text-center text-xs text-laps-navy/55">
        O código expirou. Peça um novo abaixo.
      </p>
    );
  }
  const minutes = Math.floor(remaining / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  return (
    <p className="text-center text-xs text-laps-navy/55">
      O código expira em{" "}
      <span className="font-semibold tabular-nums text-laps-navy/75">
        {minutes}:{String(seconds).padStart(2, "0")}
      </span>
    </p>
  );
}
