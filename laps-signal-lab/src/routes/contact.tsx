import { createFileRoute } from "@tanstack/react-router";
import { Linkedin, Github, Youtube } from "lucide-react";
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
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-laps-navy/15 bg-laps-paper">
        <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="label-tech">/ {t.nav.contato}</p>
              <h1 className="font-display mt-6 text-[clamp(2.25rem,5vw,4.25rem)] font-extrabold leading-[0.95] text-laps-navy">
                {labels.title}
              </h1>
            </div>
            <p className="text-base leading-relaxed text-laps-navy/70 lg:col-span-5 lg:pt-3 lg:text-lg">
              {labels.lead}
            </p>
          </div>
        </div>
      </section>

      {/* ── INFO + MAP ─────────────────────────────────────────────────────
          The contact block was a 24px-radius gradient panel with an icon in a
          tinted rounded square on every row — decoration standing between the
          reader and three lines of plain fact. As a ruled definition list the
          same three facts are faster to read and the map, which is the part
          people actually came for, gets the weight. */}
      <section className="bg-surface">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-6 pb-24 pt-16 md:px-10 lg:grid-cols-12 lg:gap-16">
          {/* Info */}
          <div className="lg:col-span-4">
            <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-laps-navy/45">
              {labels.infoTitle}
            </h2>
            <dl className="mt-6 border-t border-laps-navy/15">
              <InfoRow label={labels.addrLabel} value={t.footer.address} />
              <InfoRow
                label={labels.mailLabel}
                value={CONTACT_EMAIL}
                href={`mailto:${CONTACT_EMAIL}`}
              />
              <InfoRow label={labels.phoneLabel} value="+55 (98) 3245-5400" href="tel:+559832455400" />
            </dl>

            <div className="mt-10">
              <div className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-laps-navy/45">
                {labels.socialLabel}
              </div>
              <div className="mt-4 flex gap-2">
                <a
                  href="https://www.linkedin.com/company/laborat%C3%B3rio-de-aquisi%C3%A7%C3%A3o-e-processamento-de-sinais"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-laps-navy/20 text-laps-navy/70 transition-colors hover:border-laps-signal hover:text-laps-signal"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="https://www.youtube.com/@lapslaboratorio"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-laps-navy/20 text-laps-navy/70 transition-colors hover:border-laps-signal hover:text-laps-signal"
                >
                  <Youtube className="h-4 w-4" />
                </a>
                <a
                  href="https://github.com/lablaps"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-laps-navy/20 text-laps-navy/70 transition-colors hover:border-laps-signal hover:text-laps-signal"
                >
                  <Github className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-8">
            <div className="border border-laps-navy/20">
              <iframe
                title="LAPS — Laboratório de Aquisição e Processamento de Sinais"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3985.760580136095!2d-44.20991709999999!3d-2.5842826!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7f69b74faebfacf%3A0x7b51d3fd663371da!2sLAPS%20-%20Laborat%C3%B3rio%20de%20Aquisi%C3%A7%C3%A3o%20e%20Processamento%20de%20Sinais!5e0!3m2!1sen!2sbr!4v1786840299388!5m2!1sen!2sbr"
                className="block h-[480px] w-full lg:h-[560px]"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <a
              href="https://www.google.com/maps/place/LAPS+-+Laborat%C3%B3rio+de+Aquisi%C3%A7%C3%A3o+e+Processamento+de+Sinais/@-2.5842826,-44.2099171,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-3 inline-flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-laps-navy/55 transition-colors hover:text-laps-signal"
            >
              São Cristóvão, São Luís — MA · {labels.mapsLink}
              <span className="h-px w-6 bg-laps-navy/30 transition-all duration-300 group-hover:w-10 group-hover:bg-laps-signal" />
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

/**
 * One row of the contact definition list.
 *
 * A real <dt>/<dd> pair now, not a <li> holding two divs: the label and the
 * value are a term and its definition, and saying so is free.
 */
function InfoRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="border-b border-laps-navy/15 py-4">
      <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-laps-navy/45">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-laps-navy">
        {href ? (
          <a href={href} className="transition-colors hover:text-laps-signal">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
