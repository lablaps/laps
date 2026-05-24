import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Linkedin, Github } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — LAPS" },
      { name: "description", content: "Get in touch with LAPS — Signal Acquisition and Processing Laboratory." },
    ],
  }),
});

const CONTACT_EMAIL = "laps@engcomp.uema.br";

const COPY = {
  pt: {
    title: "Entre em contato",
    lead: "Tem interesse em colaborar, fazer uma visita ou tirar dúvidas? Fale com a equipe do LAPS.",
    infoTitle: "Informações de contato",
    addrLabel: "Endereço",
    mailLabel: "E-mail",
    phoneLabel: "Telefone",
    socialLabel: "Redes",
    mapsLink: "Ver no Google Maps",
  },
  en: {
    title: "Get in touch",
    lead: "Looking to collaborate, schedule a visit or ask a question? Reach the LAPS team directly.",
    infoTitle: "Contact information",
    addrLabel: "Address",
    mailLabel: "Email",
    phoneLabel: "Phone",
    socialLabel: "Social",
    mapsLink: "View on Google Maps",
  },
  fr: {
    title: "Contactez-nous",
    lead: "Vous souhaitez collaborer, organiser une visite ou poser une question ? Écrivez directement à l'équipe du LAPS.",
    infoTitle: "Coordonnées",
    addrLabel: "Adresse",
    mailLabel: "E-mail",
    phoneLabel: "Téléphone",
    socialLabel: "Réseaux",
    mapsLink: "Voir sur Google Maps",
  },
};

function ContactPage() {
  const { t, lang } = useLang();
  const labels = COPY[lang];

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative bg-gradient-to-b from-laps-ghost/40 via-white to-white py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-block rounded-full bg-laps-ghost px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-laps-blue">
            {t.nav.contato}
          </span>
          <h1 className="font-display mt-6 text-4xl font-bold text-laps-navy md:text-5xl">
            {labels.title}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-laps-navy/75 md:text-lg">
            {labels.lead}
          </p>
        </div>
      </section>

      {/* INFO + MAP */}
      <section className="bg-white pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1fr_1.8fr]">
          {/* Info */}
          <div className="rounded-3xl bg-gradient-to-br from-laps-navy to-laps-blue p-8 text-white shadow-[0_8px_30px_rgba(11,78,141,0.18)] md:p-10">
            <h3 className="font-display text-xl font-bold">{labels.infoTitle}</h3>
            <ul className="mt-6 space-y-5 text-sm">
              <InfoRow Icon={MapPin} label={labels.addrLabel} value={t.footer.address} />
              <InfoRow
                Icon={Mail}
                label={labels.mailLabel}
                value={CONTACT_EMAIL}
                href={`mailto:${CONTACT_EMAIL}`}
              />
              <InfoRow Icon={Phone} label={labels.phoneLabel} value="+55 (98) 3245-5400" />
            </ul>
            <div className="mt-7 border-t border-white/15 pt-5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-laps-light">
                {labels.socialLabel}
              </div>
              <div className="mt-3 flex gap-3">
                <a
                  href="https://www.linkedin.com/company/laborat%C3%B3rio-de-aquisi%C3%A7%C3%A3o-e-processamento-de-sinais"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/80 transition hover:border-laps-light hover:text-laps-light"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="https://github.com/lablaps"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/80 transition hover:border-laps-light hover:text-laps-light"
                >
                  <Github className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="overflow-hidden rounded-3xl border border-laps-blue/15 bg-white p-2 shadow-[0_2px_20px_rgba(25,58,89,0.06)]">
            <iframe
              title="LAPS — Laboratório de Aquisição e Processamento de Sinais"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1992.8811438987434!2d-44.2089354114887!3d-2.5837386652048453!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7f69b74faebfacf%3A0x7b51d3fd663371da!2sLAPS%20-%20Laborat%C3%B3rio%20de%20Aquisi%C3%A7%C3%A3o%20e%20Processamento%20de%20Sinais!5e0!3m2!1sen!2sbr!4v1779115150419!5m2!1sen!2sbr"
              className="h-[480px] w-full rounded-2xl lg:h-full lg:min-h-[520px]"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href="https://www.google.com/maps/place/LAPS+-+Laborat%C3%B3rio+de+Aquisi%C3%A7%C3%A3o+e+Processamento+de+Sinais/@-2.5837386,-44.2089354,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block px-3 pb-1 text-[11px] font-medium text-laps-blue hover:underline"
            >
              São Cristóvão, São Luís — MA · {labels.mapsLink} ↗
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function InfoRow({
  Icon,
  label,
  value,
  href,
}: {
  Icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-laps-light">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-laps-light">{label}</div>
        <div className="mt-1 text-sm text-white/85">{value}</div>
      </div>
    </>
  );

  return (
    <li>
      {href ? (
        <a href={href} className="flex gap-3 transition hover:text-laps-light">
          {body}
        </a>
      ) : (
        <div className="flex gap-3">{body}</div>
      )}
    </li>
  );
}
