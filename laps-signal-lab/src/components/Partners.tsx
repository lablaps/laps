import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { useLang } from "@/hooks/use-lang";

const partners = [
  { id: "uema", title: "UEMA", name: "Universidade Estadual do Maranhão" },
  { id: "abin", title: "ABIN Maranhão", name: "Agência Brasileira de Inteligência" },
  { id: "imesc", title: "IMESC", name: "Instituto Maranhense de Estudos Socioeconômicos e Cartográficos" },
  { id: "biosolo", title: "BioSolo", name: "Laboratório de Biologia do Solo" },
];

export function Partners() {
  const { t } = useLang();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash === "parceiros") {
      document.getElementById("parceiros")?.scrollIntoView();
    }
  }, [hash]);

  return (
    <section id="parceiros" aria-labelledby="partners-title" className="scroll-mt-24 border-t border-laps-navy/15 bg-laps-paper">
      <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-10 lg:py-32">
        <p className="label-tech">02 / {t.partners.nav}</p>
        <h2 id="partners-title" className="font-display mt-6 max-w-2xl text-balance text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[0.98] text-laps-navy">
          {t.partners.title}
        </h2>
        <ul className="mt-14 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4 lg:gap-x-10">
          {partners.map((partner) => (
            <li key={partner.id} className="min-w-0">
              <div className="flex h-44 items-center justify-center sm:h-52">
                <img
                  src={`/images/partners/${partner.id}.png`}
                  alt={partner.name}
                  loading="lazy"
                  decoding="async"
                  className={`partner-logo partner-logo--${partner.id} h-full w-full object-contain ${partner.id === "uema" ? "dark:hidden" : ""}`}
                />
                {partner.id === "uema" && (
                  <img src="/images/partners/uema-white.png" alt={partner.name} loading="lazy" decoding="async" className="hidden h-full w-full object-contain dark:block" />
                )}
              </div>
              <div className="mt-7 border-t border-laps-navy/15 pt-5">
                <h3 className="text-lg font-semibold text-laps-navy">{partner.title}</h3>
                {partner.name !== partner.title && <p className="mt-2 text-pretty text-sm leading-relaxed text-laps-navy/65">{partner.name}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
