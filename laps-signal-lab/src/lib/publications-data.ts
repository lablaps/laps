// Publications + authorship snapshot.
// Source of truth: /home/user/ICARO/Icaro de Jesus/01-projects/laps/laps-seed-data.md
// Authors reference member IDs from team-data.ts; external co-authors get a free-text name.

import type { AreaSlug } from "./areas-data";

export type PublicationType = "JOURNAL" | "CONFERENCE" | "DISSERTATION" | "THESIS" | "WORKSHOP";
export type PublicationStatus = "PUBLISHED" | "IN_PROGRESS" | "COMPLETED" | "IN_PRESS";

export interface AuthorRef {
  memberId?: string; // present for LAPS members
  externalName?: string; // present for external co-authors
  order: number;
  role?: "AUTHOR" | "ADVISOR" | "CO_ADVISOR";
}

export interface Publication {
  id: string;
  title: string;
  venue: string;
  year: number;
  doi?: string;
  url?: string;
  type: PublicationType;
  status: PublicationStatus;
  authors: AuthorRef[];
  areas: AuthorRef extends never ? never : AreaSlug[];
}

export const publications: Publication[] = [
  {
    id: "gan-histological-segmentation-2025",
    title:
      "Generative Adversarial Networks in Histological Image Segmentation: A Systematic Literature Review",
    venue: "Applied Sciences (MDPI)",
    year: 2025,
    doi: "10.3390/app15147802",
    type: "JOURNAL",
    status: "PUBLISHED",
    authors: [
      { memberId: "antonio-fhillipi-maciel-silva", order: 1, role: "AUTHOR" },
      { memberId: "ewaldo-eder-santana", order: 2, role: "AUTHOR" },
      { externalName: "Daniel G. Costa (Univ. Porto)", order: 3, role: "AUTHOR" },
    ],
    areas: ["computer-vision"],
  },
  {
    id: "evoimp-plos-one-2024",
    title: "EvoImp: Multiple Imputation of Multi-label Classification data with a genetic algorithm",
    venue: "PLoS One, v.19, e0297147",
    year: 2024,
    type: "JOURNAL",
    status: "PUBLISHED",
    authors: [
      { memberId: "fabricio-almeida-do-carmo", order: 1, role: "AUTHOR" },
      { externalName: "Jacob Jr.", order: 2, role: "AUTHOR" },
      { memberId: "ewaldo-eder-santana", order: 3, role: "AUTHOR" },
      { externalName: "Lobato", order: 4, role: "AUTHOR" },
    ],
    areas: ["nlp", "ml-clinical"],
  },
  {
    id: "wildemarkes-hallucinations-msc-2024",
    title:
      "Alucinações em Modelos de IA Generativa: Limitações e Desafios na Compreensão da Linguagem Humana",
    venue: "PECS/UEMA · MSc dissertation, defended 2024-05-31",
    year: 2024,
    type: "DISSERTATION",
    status: "COMPLETED",
    authors: [
      { memberId: "wildemarkes-de-almeida-da-silva", order: 1, role: "AUTHOR" },
      { externalName: "Luis Carlos Costa Fonseca", order: 2, role: "ADVISOR" },
      { memberId: "ewaldo-eder-santana", order: 3, role: "AUTHOR" },
    ],
    areas: ["generative-ai"],
  },
  {
    id: "embeddings-juridico-wcge-2023",
    title: "Embeddings Jurídico: Representações Orientadas à Linguagem Jurídica Brasileira",
    venue: "Workshop WCGE 2023",
    year: 2023,
    type: "WORKSHOP",
    status: "PUBLISHED",
    authors: [
      { externalName: "Serejo", order: 1, role: "AUTHOR" },
      { memberId: "fabricio-almeida-do-carmo", order: 2, role: "AUTHOR" },
      { externalName: "Jacob Jr.", order: 3, role: "AUTHOR" },
      { memberId: "ewaldo-eder-santana", order: 4, role: "AUTHOR" },
      { externalName: "Lobato", order: 5, role: "AUTHOR" },
    ],
    areas: ["nlp"],
  },
  {
    id: "luany-triagem-obesos-msc-2023",
    title:
      "Comparação de algoritmos de aprendizado de máquinas para desenvolvimento de um sistema para triagem de adolescentes obesos utilizando variáveis clínicas",
    venue: "PECS/UEMA · MSc dissertation, 2023",
    year: 2023,
    type: "DISSERTATION",
    status: "COMPLETED",
    authors: [
      { memberId: "luany-maiara-andrade-ribeiro", order: 1, role: "AUTHOR" },
      { memberId: "ewaldo-eder-santana", order: 2, role: "ADVISOR" },
    ],
    areas: ["ml-clinical"],
  },
  {
    id: "oocyhistdb-rsc-2022",
    title: "OOCYHISTDB: Um conjunto de dados de imagens histológicas para detecção de ovócitos",
    venue: "Revista de Sistemas e Computação (RSC), v.12, p.61–68",
    year: 2022,
    type: "JOURNAL",
    status: "PUBLISHED",
    authors: [
      { memberId: "yanna-leidy-ketley-fernandes-cruz", order: 1, role: "AUTHOR" },
      { memberId: "antonio-fhillipi-maciel-silva", order: 2, role: "AUTHOR" },
      { memberId: "ewaldo-eder-santana", order: 3, role: "AUTHOR" },
      { externalName: "Isa Rosete", order: 4, role: "AUTHOR" },
      { externalName: "Raimunda Fortes", order: 5, role: "AUTHOR" },
    ],
    areas: ["computer-vision"],
  },
  {
    id: "kassio-spectroscopy-msc-2022",
    title:
      "Estudo Teórico das Propriedades Espectroscópicas Eletrônicas e Termodinâmicas das Estruturas dos Aditivos no Combustível Espacial",
    venue: "UEMA · MSc dissertation, defended 2022-09-26",
    year: 2022,
    type: "DISSERTATION",
    status: "COMPLETED",
    authors: [{ memberId: "kassio-felipe-da-costa-serra", order: 1, role: "AUTHOR" }],
    areas: ["spectroscopy", "aerospace-telemetry"],
  },
  {
    id: "ieee-sensors-rockets-2021",
    title: "Location Analysis Probing Rockets in Ground with Telemetry Data",
    venue: "IEEE SENSORS Conference 2021",
    year: 2021,
    type: "CONFERENCE",
    status: "PUBLISHED",
    authors: [
      { memberId: "nilton-rodrigues-cantanhede", order: 1, role: "AUTHOR" },
      { memberId: "ewaldo-eder-santana", order: 2, role: "AUTHOR" },
      { externalName: "Paulo Fernandes da Silva Jr.", order: 3, role: "AUTHOR" },
      { externalName: "Raimundo Freire", order: 4, role: "AUTHOR" },
      { externalName: "Jonas Barros", order: 5, role: "AUTHOR" },
    ],
    areas: ["aerospace-telemetry", "sensors"],
  },
  {
    id: "dailan-pierce-love-msc-2021",
    title: "Oscilador Pierce com sensor a ondas Love na malha de realimentação",
    venue: "PECS/UEMA · MSc dissertation, 2021",
    year: 2021,
    type: "DISSERTATION",
    status: "COMPLETED",
    authors: [
      { memberId: "dailan-de-jesus-pereira-bernardes", order: 1, role: "AUTHOR" },
      { externalName: "Raimundo Carlos Silverio Freire", order: 2, role: "ADVISOR" },
    ],
    areas: ["sensors"],
  },
  {
    id: "nilton-trajetografia-msc-2019",
    title:
      "Proposta de um sistema de trajetografia para veículos espaciais baseado em telemetria",
    venue: "PECS/UEMA · MSc dissertation, 2019",
    year: 2019,
    type: "DISSERTATION",
    status: "COMPLETED",
    authors: [
      { memberId: "nilton-rodrigues-cantanhede", order: 1, role: "AUTHOR" },
      { memberId: "ewaldo-eder-santana", order: 2, role: "ADVISOR" },
    ],
    areas: ["aerospace-telemetry"],
  },
  {
    id: "yanna-oocyte-phd-thesis",
    title:
      "Uma abordagem para a detecção automática dos estágios de maturação ovocitária da espécie Centropomus undecimalis via aprendizagem profunda",
    venue: "UFMA · Tese de Doutorado (em andamento)",
    year: 2026,
    type: "THESIS",
    status: "IN_PROGRESS",
    authors: [
      { memberId: "yanna-leidy-ketley-fernandes-cruz", order: 1, role: "AUTHOR" },
      { memberId: "ewaldo-eder-santana", order: 2, role: "ADVISOR" },
      { externalName: "Raimunda Fortes", order: 3, role: "CO_ADVISOR" },
    ],
    areas: ["computer-vision"],
  },
  {
    id: "fabricio-long-legal-docs-inpress",
    title:
      "Análise comparativa de métodos baseados em modelos de linguagem para documentos jurídicos longos",
    venue: "In press",
    year: 2025,
    type: "JOURNAL",
    status: "IN_PRESS",
    authors: [
      { externalName: "Araújo", order: 1, role: "AUTHOR" },
      { memberId: "fabricio-almeida-do-carmo", order: 2, role: "AUTHOR" },
      { memberId: "ewaldo-eder-santana", order: 3, role: "AUTHOR" },
      { externalName: "Jacob Jr.", order: 4, role: "AUTHOR" },
      { externalName: "Lobato", order: 5, role: "AUTHOR" },
    ],
    areas: ["nlp"],
  },
];

export function publicationsByMember(memberId: string): Publication[] {
  return publications.filter((p) => p.authors.some((a) => a.memberId === memberId));
}

// Co-authorship pairs: every (memberA, memberB) that appears on at least one publication together.
export function coAuthorshipPairs(): Array<{ a: string; b: string; count: number }> {
  const counter = new Map<string, number>();
  for (const pub of publications) {
    const ids = pub.authors.map((a) => a.memberId).filter((x): x is string => Boolean(x));
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = ids[i]!;
        const b = ids[j]!;
        const key = a < b ? `${a}__${b}` : `${b}__${a}`;
        counter.set(key, (counter.get(key) ?? 0) + 1);
      }
    }
  }
  return Array.from(counter.entries()).map(([key, count]) => {
    const [a, b] = key.split("__") as [string, string];
    return { a, b, count };
  });
}
