import ewaldoPhoto from "@/assets/ewaldo.jpeg";
import fhilipiPhoto from "@/assets/fhilipi.jpeg";
import icaroPhoto from "@/assets/icaro.png";
import jovinoPhoto from "@/assets/jovino.jpeg";
import laysaPhoto from "@/assets/laysa.jpeg";
import luisPhoto from "@/assets/luis.jpeg";
import marceloPhoto from "@/assets/marcelo.jpeg";
import patrickPhoto from "@/assets/patrick.jpeg";
import pauloPhoto from "@/assets/paulo.jpg";
import pedroPhoto from "@/assets/pedro.jpeg";
import renanPhoto from "@/assets/renan.jpeg";
import suamiPhoto from "@/assets/suami.jpeg";
import yannaPhoto from "@/assets/yanna.jpeg";
import type { AreaSlug } from "./areas-data";

export type Tier = "head" | "coordinator" | "manager" | "doctorate" | "master" | "undergrad";
export type MemberStatus = "ACTIVE" | "COMPLETED" | "INACTIVE";

export interface TeamMember {
  /** Slug — stable foreign key used by projects-data.ts and publications-data.ts. */
  id: string;
  /** Stable UUID used in /team/$uuid URLs. Never reuse — generated once per member. */
  uuid: string;
  fullName: string;
  tier: Tier;
  status?: MemberStatus;
  /** Primary research area — used for cluster placement in the team graph. */
  primaryArea?: AreaSlug;
  /** All research areas the member touches (always includes primaryArea). */
  areas?: AreaSlug[];
  linkedin?: string;
  lattes?: string;
  photo?: string;
  bio?: { pt?: string; en?: string; fr?: string };
  tags?: string[];
}

export const team: TeamMember[] = [
  {
    id: "ewaldo-eder-santana",
    uuid: "f1c1c1e5-2087-4d7d-bbc0-ab2eaf140afb",
    fullName: "Dr. Ewaldo Eder Santana",
    tier: "head",
    status: "ACTIVE",
    primaryArea: "signal-processing",
    areas: ["signal-processing", "iot", "ml-clinical"],
    linkedin: "https://www.linkedin.com/in/ewaldo-santana-4383a874/",
    photo: ewaldoPhoto,
    tags: ["Signal Processing", "Machine Learning", "IoT"],
    bio: {
      pt: "Chefe do Laboratório de Aquisição e Processamento de Sinais (LAPS) na UEMA.",
      en: "Head of the Laboratory of Signals Acquisition and Processing (LAPS) at UEMA.",
      fr: "Chef du Laboratoire d'Acquisition et Traitement des Signaux (LAPS) à l'UEMA.",
    },
  },

  // Coordenação — corpo discente sênior que apoia a operação do laboratório.
  {
    id: "luis-guilherme-busaglo-lopes",
    uuid: "8c4d04b2-0fc0-4e9d-8739-4f0a69739fb7",
    fullName: "Luis Guilherme Busaglo Lopes",
    tier: "coordinator",
    status: "ACTIVE",
    photo: luisPhoto,
  },
  {
    id: "patrick-melo-albuquerque",
    uuid: "f38fd36d-879b-40dc-b3d0-f0ab6fa8ad54",
    fullName: "Patrick Melo Albuquerque",
    tier: "coordinator",
    status: "ACTIVE",
    photo: patrickPhoto,
  },

  // Doutorado
  {
    id: "antonio-fhillipi-maciel-silva",
    uuid: "c894d827-6138-4f5b-9870-73d53adb45d3",
    fullName: "Antonio Fhillipi Maciel Silva",
    tier: "doctorate",
    status: "ACTIVE",
    primaryArea: "computer-vision",
    areas: ["computer-vision", "signal-processing"],
    photo: fhilipiPhoto,
  },
  {
    id: "dailan-de-jesus-pereira-bernardes",
    uuid: "6f1d7604-03f6-4a92-928a-a3bcd9ca9b7e",
    fullName: "Dailan de Jesus Pereira Bernardes",
    tier: "doctorate",
    status: "ACTIVE",
    primaryArea: "sensors",
    areas: ["sensors", "microelectronics"],
  },
  {
    id: "fabricio-almeida-do-carmo",
    uuid: "be38b457-012d-453f-b8e3-8ec2280fb55d",
    fullName: "Fabrício Almeida do Carmo",
    tier: "doctorate",
    status: "ACTIVE",
    primaryArea: "nlp",
    areas: ["nlp", "ml-clinical"],
  },
  {
    id: "freud-sebastian-bach-carvalho-lima",
    uuid: "7ee1851b-2470-4104-9728-5c5c7d9014d0",
    fullName: "Freud Sebastian Bach Carvalho Lima",
    tier: "doctorate",
    status: "ACTIVE",
  },
  {
    id: "kassio-felipe-da-costa-serra",
    uuid: "fd99a219-eae1-4c5f-bb9d-bfc5c0bfdfa7",
    fullName: "Kassio Felipe da Costa Serra",
    tier: "doctorate",
    status: "ACTIVE",
    primaryArea: "spectroscopy",
    areas: ["spectroscopy", "aerospace-telemetry"],
  },
  {
    id: "marcelo-viana-da-silva",
    uuid: "5f5499b2-e867-4443-9850-188b767ab2fd",
    fullName: "Marcelo Viana da Silva",
    tier: "doctorate",
    status: "ACTIVE",
    photo: marceloPhoto,
  },
  {
    id: "nilton-rodrigues-cantanhede",
    uuid: "baa1b0cc-fc57-4826-99ac-b11afdba1d34",
    fullName: "Nilton Rodrigues Cantanhede",
    tier: "doctorate",
    status: "ACTIVE",
    primaryArea: "aerospace-telemetry",
    areas: ["aerospace-telemetry", "sensors", "signal-processing"],
  },
  {
    id: "paulo-henrique-bezerra-de-carvalho",
    uuid: "d7cfa326-5503-4cc7-afd9-4f3955ee43f7",
    fullName: "Paulo Henrique Bezerra de Carvalho",
    tier: "doctorate",
    status: "ACTIVE",
  },
  {
    id: "wildemarkes-de-almeida-da-silva",
    uuid: "e8cef7cb-d773-441a-98aa-447505503522",
    fullName: "Wildemarkes de Almeida da Silva",
    tier: "doctorate",
    status: "ACTIVE",
    primaryArea: "generative-ai",
    areas: ["generative-ai", "nlp"],
  },
  {
    id: "yanna-leidy-ketley-fernandes-cruz",
    uuid: "623d875f-d1a9-4264-91cb-218dedd85131",
    fullName: "Yanna Leidy Ketley Fernandes Cruz",
    tier: "doctorate",
    status: "ACTIVE",
    primaryArea: "computer-vision",
    areas: ["computer-vision", "signal-processing"],
    photo: yannaPhoto,
  },

  // Mestrado
  { id: "cely-gabrielle-santos-silva", uuid: "ea86e4ad-bfd2-4017-9685-a03c9490a37b", fullName: "Cély Gabrielle Santos Silva", tier: "master", status: "ACTIVE" },
  { id: "elias-nazareno-de-oliveira-azevedo", uuid: "57132ae6-e60f-4502-ad83-79ce2bbd900e", fullName: "Elias Nazareno de Oliveira Azevedo", tier: "master", status: "ACTIVE" },
  { id: "felipe-castro-viana", uuid: "80609c40-7d6b-4c87-a0b2-adeafc65c00b", fullName: "Felipe Castro Viana", tier: "master", status: "ACTIVE" },
  { id: "francisco-soares-fonseca", uuid: "149549b4-b00f-4ef2-8832-fd7e65cbf170", fullName: "Francisco Soares Fonseca", tier: "master", status: "ACTIVE" },
  { id: "geise-alves-da-silva-serra", uuid: "773b4e57-1406-45ca-9fa4-1f416689076a", fullName: "Geise Alves da Silva Serra", tier: "master", status: "ACTIVE" },
  { id: "jose-carlos-costa-junior", uuid: "7130efd5-120c-42fc-8644-81869ad95e13", fullName: "José Carlos Costa Júnior", tier: "master", status: "ACTIVE" },
  { id: "jose-eduardo-carvalho-thomaz", uuid: "60c1cab9-faa7-4cb6-ad95-1f7ee2b8eaaf", fullName: "José Eduardo Carvalho Thomaz", tier: "master", status: "ACTIVE" },
  { id: "joao-marcos-rodrigues-coelho", uuid: "0423aef4-d5c1-40d9-8e78-5f1dbe8cfd08", fullName: "João Marcos Rodrigues Coelho", tier: "master", status: "ACTIVE" },
  {
    id: "luany-maiara-andrade-ribeiro",
    uuid: "17896c55-2299-4379-b734-5af1a0af5076",
    fullName: "Luany Maiara Andrade Ribeiro",
    tier: "master",
    status: "COMPLETED",
    primaryArea: "ml-clinical",
    areas: ["ml-clinical"],
  },
  { id: "lucas-souza-rodrigues", uuid: "53f25eec-a4b3-4b0f-a329-4330a4d2d2e3", fullName: "Lucas Souza Rodrigues", tier: "master", status: "ACTIVE" },
  { id: "luis-augusto-da-costa-cardoso", uuid: "16c2210f-4135-478e-8d87-ba7deec89e42", fullName: "Luis Augusto da Costa Cardoso", tier: "master", status: "ACTIVE" },
  { id: "nildson-de-castro-pinheiro-mello", uuid: "1e04aa5e-b193-4b5f-9cad-fca37e32fbde", fullName: "Nildson de Castro Pinheiro Mello", tier: "master", status: "ACTIVE" },
  { id: "pedro-victor-de-sousa-dantas", uuid: "ef0f142d-1ba8-4638-ab9d-a4268e59b121", fullName: "Pedro Victor de Sousa Dantas", tier: "master", status: "ACTIVE" },
  { id: "tiago-pereira-santana", uuid: "887a7d0a-9e2e-40ab-8747-5598dd2411c2", fullName: "Tiago Pereira Santana", tier: "master", status: "ACTIVE" },

  // Graduandos
  { id: "ana-luiza-brasil-barbosa", uuid: "e2b23d5d-7b5c-4c94-9f24-b2084d807d16", fullName: "Ana Luiza Brasil Barbosa", tier: "undergrad", status: "ACTIVE" },
  { id: "ayrton-cesar-teixeira-e-silva", uuid: "61e79ef2-8c5b-483c-be28-0f8fad41666e", fullName: "Ayrton César Teixeira e Silva", tier: "undergrad", status: "ACTIVE" },
  { id: "felipe-sammuel-martins", uuid: "3325a78c-4a0e-4e76-9736-0a3daab5b03c", fullName: "Felipe Sammuel Martins", tier: "undergrad", status: "ACTIVE" },
  { id: "gabriel-rodrigues-ramalho", uuid: "aa619e11-cca7-4377-a25e-ced4ded0ba9e", fullName: "Gabriel Rodrigues Ramalho", tier: "undergrad", status: "ACTIVE" },
  {
    id: "icaro-de-jesus-silva",
    uuid: "4f877fc0-459c-40e9-8839-98f99ef5742c",
    fullName: "Icaro de Jesus Silva",
    tier: "undergrad",
    status: "ACTIVE",
    primaryArea: "iot",
    areas: ["iot", "signal-processing"],
    tags: ["Spring Boot", "Angular", "AI Tooling"],
    photo: icaroPhoto,
    bio: {
      pt: "Engenharia da Computação (UEMA), pesquisador PIBIC no projeto CISMA / Dataearth.",
      en: "Computer Engineering (UEMA), PIBIC researcher on the CISMA / Dataearth platform.",
      fr: "Génie Informatique (UEMA), chercheur PIBIC sur la plateforme CISMA / Dataearth.",
    },
  },
  { id: "igor-barros-grilo", uuid: "ca04864b-1c5b-4eca-888a-ab154ef22223", fullName: "Igor Barros Grilo", tier: "undergrad", status: "ACTIVE" },
  { id: "joao-vitor-coelho-ferreira", uuid: "60ab7d44-1d60-4308-8006-094dacc1adbb", fullName: "João Vitor Coelho Ferreira", tier: "undergrad", status: "ACTIVE" },
  { id: "julia-emmyle-lima-cabral", uuid: "0e95a5be-c464-49d3-a3fd-50c4ebc9b7d7", fullName: "Júlia Emmyle Lima Cabral", tier: "undergrad", status: "ACTIVE" },
  { id: "laysa-cristinna-de-souza-cordeiro", uuid: "981b473f-07dd-45e4-92be-d6afa6275b30", fullName: "Laysa Cristinna de Souza Cordeiro", tier: "undergrad", status: "ACTIVE", photo: laysaPhoto },
  { id: "lethicia-kelly-silva-sousa", uuid: "25c67b6b-3a32-4043-82f6-b24e1bc319fc", fullName: "Lethicia Kelly Silva Sousa", tier: "undergrad", status: "ACTIVE" },
  { id: "maiza-yumi-ueda-almeida", uuid: "a540686b-cc4a-429b-8bfb-ef6c1dd834a8", fullName: "Maiza Yumi Ueda Almeida", tier: "undergrad", status: "ACTIVE" },
  { id: "maria-tereza-cunha-de-albuquerque", uuid: "cf975ef2-d1ea-4482-b06b-db5e2c9effda", fullName: "Maria Tereza Cunha de Albuquerque", tier: "undergrad", status: "ACTIVE" },
  { id: "paulo-alex-carvalho-barata", uuid: "db47fcd3-e7e7-447b-859e-fb25cc58ec24", fullName: "Paulo Alex Carvalho Barata", tier: "undergrad", status: "ACTIVE", photo: pauloPhoto },
  { id: "pedro-gabriel-moreira-goncalves", uuid: "81092b08-a5fb-4795-9931-3fcd4cd714d7", fullName: "Pedro Gabriel Moreira Gonçalves", tier: "undergrad", status: "ACTIVE", photo: pedroPhoto },
  { id: "pedro-luis-jovino-da-silva", uuid: "334294fd-2f48-4462-b229-295868bb6f11", fullName: "Pedro Luis Jovino da Silva", tier: "undergrad", status: "ACTIVE", photo: jovinoPhoto },
  { id: "renan-de-jesus-montenegro-da-silva", uuid: "cdc82b7b-5d19-4799-9a5b-777898e620d6", fullName: "Renan de Jesus Montenegro da Silva", tier: "undergrad", status: "ACTIVE", photo: renanPhoto },
  { id: "sofia-barros-coimbra", uuid: "bb4eee65-ff42-4b82-afc1-dfbedaef24b5", fullName: "Sofia Barros Coimbra", tier: "undergrad", status: "ACTIVE" },
  { id: "suami-gomes-santos", uuid: "22ec0a50-f245-4c41-bdf3-69525b749aa5", fullName: "Suamí Gomes Santos", tier: "undergrad", status: "ACTIVE", photo: suamiPhoto },
  { id: "thassia-raquel-silva-ribeiro", uuid: "b9d90c22-131c-4619-98b1-4a197f7a4ed7", fullName: "Thassia Raquel Silva Ribeiro", tier: "undergrad", status: "ACTIVE" },

  // Calouros 2026 — Sensores
  {
    id: "marcio-henrique-da-silva-sousa",
    uuid: "6f658db2-ce5a-43f1-9b34-acb84211c160",
    fullName: "Márcio Henrique da Silva Sousa",
    tier: "undergrad",
    status: "ACTIVE",
    primaryArea: "sensors",
    areas: ["sensors"],
  },
  {
    id: "vital-ribamar-silva-santos-neto",
    uuid: "8515a52f-2be8-46fe-b52a-c8d73f7cb33b",
    fullName: "Vital Ribamar Silva Santos Neto",
    tier: "undergrad",
    status: "ACTIVE",
    primaryArea: "sensors",
    areas: ["sensors"],
  },
  {
    id: "aylton-kalebe-ribeiro-lacerda",
    uuid: "6bed2e64-9f80-4b5e-baee-7eb47f054048",
    fullName: "Aylton Kalebe Ribeiro Lacerda",
    tier: "undergrad",
    status: "ACTIVE",
    primaryArea: "sensors",
    areas: ["sensors"],
  },
];

export const tierCounts = {
  head: team.filter((m) => m.tier === "head").length,
  coordinator: team.filter((m) => m.tier === "coordinator").length,
  doctorate: team.filter((m) => m.tier === "doctorate").length,
  master: team.filter((m) => m.tier === "master").length,
  undergrad: team.filter((m) => m.tier === "undergrad").length,
};

export function initials(name: string): string {
  const parts = name.replace(/^(Ph\.?D|Dr\.?|Prof\.?)\s+/i, "").split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}
