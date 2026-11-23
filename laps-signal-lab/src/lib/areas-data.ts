// Research areas / "cores" — the cluster anchors for the team neural graph.
// Each member gets a primary area + 0..n secondary areas.
// Spec: /home/user/ICARO/Icaro de Jesus/01-projects/laps/laps-data-model.md

export type AreaSlug =
  | "signal-processing"
  | "computer-vision"
  | "nlp"
  | "generative-ai"
  | "aerospace-telemetry"
  | "sensors"
  | "ml-clinical"
  | "spectroscopy"
  | "microelectronics"
  | "iot";

export interface ResearchArea {
  slug: AreaSlug;
  name: { pt: string; en: string; fr: string };
  color: string;
}

export const areas: ResearchArea[] = [
  {
    slug: "signal-processing",
    name: { pt: "Processamento de Sinais", en: "Signal Processing", fr: "Traitement du Signal" },
    color: "#0B4E8D",
  },
  {
    slug: "computer-vision",
    name: { pt: "Visão Computacional", en: "Computer Vision", fr: "Vision par Ordinateur" },
    color: "#7C3AED",
  },
  {
    slug: "nlp",
    name: { pt: "Processamento de Linguagem", en: "Natural Language Processing", fr: "Traitement du Langage" },
    color: "#0EA5E9",
  },
  {
    slug: "generative-ai",
    name: { pt: "IA Generativa", en: "Generative AI", fr: "IA Générative" },
    color: "#EC4899",
  },
  {
    slug: "aerospace-telemetry",
    name: { pt: "Aeroespacial & Telemetria", en: "Aerospace & Telemetry", fr: "Aérospatial & Télémétrie" },
    color: "#F59E0B",
  },
  {
    slug: "sensors",
    name: { pt: "Sensores Eletrônicos", en: "Electronic Sensors", fr: "Capteurs Électroniques" },
    color: "#10B981",
  },
  {
    slug: "ml-clinical",
    name: { pt: "ML Clínico", en: "Clinical ML", fr: "ML Clinique" },
    color: "#EF4444",
  },
  {
    slug: "spectroscopy",
    name: { pt: "Espectroscopia", en: "Spectroscopy", fr: "Spectroscopie" },
    color: "#A855F7",
  },
  {
    slug: "microelectronics",
    name: { pt: "Microeletrônica", en: "Microelectronics", fr: "Microélectronique" },
    color: "#64748B",
  },
  {
    slug: "iot",
    name: { pt: "IoT & Redes de Sensores", en: "IoT & Sensor Networks", fr: "IoT & Réseaux de Capteurs" },
    color: "#14B8A6",
  },
];

export const areasBySlug: Record<AreaSlug, ResearchArea> = Object.fromEntries(
  areas.map((a) => [a.slug, a]),
) as Record<AreaSlug, ResearchArea>;
