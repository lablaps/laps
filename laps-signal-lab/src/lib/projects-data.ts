import type { AreaSlug } from "./areas-data";

export type ProjectStatus = "ACTIVE" | "COMPLETED";

export interface ProjectLeader {
  memberId: string;
  role: "LEAD" | "CO_LEAD" | "RESEARCHER";
}

export interface ProjectTranslation {
  title: string;
  description: string;
}

export interface Project {
  id: string;
  slug: string;
  status: ProjectStatus;
  tags: string[];
  areas?: AreaSlug[];
  leaders: ProjectLeader[];
  i18n: {
    pt: ProjectTranslation;
    en: ProjectTranslation;
    fr: ProjectTranslation;
  };
}

export const projects: Project[] = [
  // 1. GAN Histological
  {
    id: "proj-gan-histological",
    slug: "gan-histological",
    status: "COMPLETED",
    tags: ["Generative Adversarial Networks", "HistopatholAlogical Images", "Computer Vision"],
    areas: ["computer-vision"],
    leaders: [
      { memberId: "antonio-fhillipi-maciel-silva", role: "LEAD" },
      { memberId: "ewaldo-eder-santana", role: "CO_LEAD" },
    ],
    i18n: {
      pt: {
        title: "Modelos GAN em Imagens Histológicas",
        description: "Revisão e aplicação de redes adversárias generativas para segmentação de imagens histológicas.",
      },
      en: {
        title: "GANs on Histological Images",
        description: "Systematic review and application of Generative Adversarial Networks in histological image segmentation.",
      },
      fr: {
        title: "Modèles GAN en Images Histologiques",
        description: "Revue et application de réseaux antagonistes génératifs pour la segmentation d'images histologiques.",
      },
    },
  },

  // 2. EvoImp
  {
    id: "proj-evoimp",
    slug: "evoimp",
    status: "COMPLETED",
    tags: ["Genetic Algorithms", "Data Imputation", "Multi-label Classification"],
    areas: ["nlp", "ml-clinical"],
    leaders: [
      { memberId: "fabricio-almeida-do-carmo", role: "LEAD" },
      { memberId: "ewaldo-eder-santana", role: "CO_LEAD" },
    ],
    i18n: {
      pt: {
        title: "EvoImp: Imputação de Dados via Algoritmo Genético",
        description: "Sistema para imputação múltipla de dados de classificação multirrótulo usando algoritmos genéticos.",
      },
      en: {
        title: "EvoImp: Genetic Algorithm Data Imputation",
        description: "Multiple imputation of multi-label classification data with a genetic algorithm.",
      },
      fr: {
        title: "EvoImp: Imputation de Données par Algorithme Génétique",
        description: "Imputation multiple de données de classification multi-labels à l'aide d'un algorithme génétique.",
      },
    },
  },

  // 3. Hallucinations in GenAI
  {
    id: "proj-ai-hallucinations",
    slug: "ai-hallucinations",
    status: "COMPLETED",
    tags: ["Generative AI", "NLP", "LLM Hallucinations"],
    areas: ["generative-ai"],
    leaders: [
      { memberId: "wildemarkes-de-almeida-da-silva", role: "LEAD" },
      { memberId: "ewaldo-eder-santana", role: "CO_LEAD" },
    ],
    i18n: {
      pt: {
        title: "Alucinações em Modelos de IA Generativa",
        description: "Mapeamento das limitações e desafios na compreensão da linguagem humana por LLMs.",
      },
      en: {
        title: "Hallucinations in Generative AI",
        description: "Mapping limitations and challenges in human language understanding by Large Language Models.",
      },
      fr: {
        title: "Hallucinations dans les Modèles d'IA Générative",
        description: "Cartographie des limites et défis dans la compréhension du langage humain par les LLMs.",
      },
    },
  },

  // 4. Embeddings Juridicos
  {
    id: "proj-embeddings-juridico",
    slug: "legal-embeddings",
    status: "COMPLETED",
    tags: ["NLP", "Legal Text", "Word Embeddings", "Brazilian Law"],
    areas: ["nlp"],
    leaders: [
      { memberId: "fabricio-almeida-do-carmo", role: "LEAD" },
      { memberId: "ewaldo-eder-santana", role: "CO_LEAD" },
    ],
    i18n: {
      pt: {
        title: "Embeddings para o Judiciário",
        description: "Representações orientadas à Linguagem Jurídica Brasileira e documentos judiciais longos.",
      },
      en: {
        title: "Legal Embeddings",
        description: "Representations oriented to long Brazilian Legal texts and judicial language documents.",
      },
      fr: {
        title: "Embeddings Juridiques",
        description: "Représentations orientées vers les textes juridiques brésiliens et les documents judiciaires longs.",
      },
    },
  },

  // 5. Obesity Triage
  {
    id: "proj-obesity-triage",
    slug: "obesity-triage",
    status: "COMPLETED",
    tags: ["Machine Learning", "Adolescent Obesity", "Clinical Triage"],
    areas: ["ml-clinical"],
    leaders: [
      { memberId: "luany-maiara-andrade-ribeiro", role: "LEAD" },
      { memberId: "ewaldo-eder-santana", role: "CO_LEAD" },
    ],
    i18n: {
      pt: {
        title: "Triagem Clínica de Adolescentes",
        description: "Construção de sistemas baseados em machine learning para triagem de adolescentes obesos.",
      },
      en: {
        title: "Clinical Triage for Adolescents",
        description: "Building machine learning-based systems for clinical triage of obese adolescents.",
      },
      fr: {
        title: "Triage Clinique d'Adolescents",
        description: "Construction de systèmes basés sur le machine learning pour le triage clinique d'adolescents obèses.",
      },
    },
  },

  // 6. OOCYHISTDB
  {
    id: "proj-oocyhistdb",
    slug: "oocyhistdb",
    status: "ACTIVE",
    tags: ["Oocyte Detection", "Deep Learning", "Histopathology"],
    areas: ["computer-vision"],
    leaders: [
      { memberId: "yanna-leidy-ketley-fernandes-cruz", role: "LEAD" },
      { memberId: "antonio-fhillipi-maciel-silva", role: "RESEARCHER" },
      { memberId: "ewaldo-eder-santana", role: "CO_LEAD" },
    ],
    i18n: {
      pt: {
        title: "OOCYHISTDB e Maturação Ovocitária",
        description: "Dataset e métodos avançados via deep learning para detecção dos estágios de maturação de ovócitos.",
      },
      en: {
        title: "OOCYHISTDB and Oocyte Maturation",
        description: "Dataset and advanced deep learning methods for detecting maturation stages of oocytes.",
      },
      fr: {
        title: "OOCYHISTDB et Maturation des Ovocytes",
        description: "Ensemble de données et méthodes de deep learning pour la détection des stades de maturation des ovocytes.",
      },
    },
  },

  // 7. Space Fuel Spectroscopy
  {
    id: "proj-space-fuel-spectroscopy",
    slug: "space-fuel-spectroscopy",
    status: "COMPLETED",
    tags: ["Spectroscopy", "Thermodynamics", "Aerospace Additives"],
    areas: ["spectroscopy", "aerospace-telemetry"],
    leaders: [
      { memberId: "kassio-felipe-da-costa-serra", role: "LEAD" },
    ],
    i18n: {
      pt: {
        title: "Análise Termodinâmica e Espectroscópica",
        description: "Estudo teórico das propriedades espectroscópicas de estruturas e aditivos no combustível espacial.",
      },
      en: {
        title: "Thermodynamic and Spectroscopic Analysis",
        description: "Theoretical study of spectroscopic properties of structures and additives in space fuels.",
      },
      fr: {
        title: "Analyse Thermodynamique et Spectroscopique",
        description: "Étude théorique des propriétés spectroscopiques des structures et additifs dans les carburants spatiaux.",
      },
    },
  },

  // 8. Rockets Telemetry
  {
    id: "proj-telemetry-rockets",
    slug: "telemetry-rockets",
    status: "COMPLETED",
    tags: ["Probing Rockets", "Telemetry", "Trajectography"],
    areas: ["aerospace-telemetry", "sensors", "signal-processing"],
    leaders: [
      { memberId: "nilton-rodrigues-cantanhede", role: "LEAD" },
      { memberId: "ewaldo-eder-santana", role: "CO_LEAD" },
    ],
    i18n: {
      pt: {
        title: "Trajetografia de Foguetes via Telemetria",
        description: "Sistemas de trajetografia e análise de localização voltados para veículos espaciais e foguetes de sondagem.",
      },
      en: {
        title: "Rocket Trajectography via Telemetry",
        description: "Trajectography and location analysis systems aimed at space vehicles and probing rockets.",
      },
      fr: {
        title: "Trajectographie de Fusées via Télémétrie",
        description: "Systèmes de trajectographie et analyse de localisation destinés aux véhicules spatiaux et fusées sondes.",
      },
    },
  },

  // 9. Pierce-Love Oscillator Sensor
  {
    id: "proj-pierce-love-sensor",
    slug: "pierce-love-sensor",
    status: "COMPLETED",
    tags: ["Pierce Oscillator", "Love Wave Sensor", "Feedback Loop"],
    areas: ["sensors", "microelectronics"],
    leaders: [
      { memberId: "dailan-de-jesus-pereira-bernardes", role: "LEAD" },
    ],
    i18n: {
      pt: {
        title: "Sensor Oscilador Pierce Love",
        description: "Oscilador Pierce acoplado a sensores a ondas Love integrados na malha de realimentação.",
      },
      en: {
        title: "Pierce Love Oscillator Sensor",
        description: "Pierce oscillator coupled with Love wave sensors integrated into the feedback loop.",
      },
      fr: {
        title: "Capteur Oscillateur Pierce Love",
        description: "Oscillateur Pierce couplé à des capteurs d'ondes Love intégrés dans la boucle de rétroaction.",
      },
    },
  },

  // 11. Gurupi Ecological Database
  {
    id: "proj-gurupi-ecological-db",
    slug: "gurupi-ecological-db",
    status: "ACTIVE",
    tags: ["PostGIS", "Ecological Database", "Geospatial", "Biodiversity Monitoring"],
    areas: ["iot", "sensors"],
    leaders: [
      { memberId: "laysa-cristinna-de-souza-cordeiro", role: "LEAD" },
      { memberId: "icaro-de-jesus-silva", role: "RESEARCHER" },
      { memberId: "ewaldo-eder-santana", role: "CO_LEAD" },
    ],
    i18n: {
      pt: {
        title: "Base de Dados Ecológica — Reserva Biológica do Gurupi",
        description: "Modelagem de banco de dados geoespacial multidimensional (PostgreSQL + PostGIS) para o monitoramento ecológico contínuo da biodiversidade na Reserva Biológica do Gurupi.",
      },
      en: {
        title: "Ecological Database — Gurupi Biological Reserve",
        description: "Multidimensional geospatial database (PostgreSQL + PostGIS) for continuous ecological biodiversity monitoring at the Gurupi Biological Reserve.",
      },
      fr: {
        title: "Base de Données Écologique — Réserve Biologique de Gurupi",
        description: "Modélisation d'une base de données géospatiale multidimensionnelle (PostgreSQL + PostGIS) pour le suivi écologique continu de la biodiversité à la Réserve Biologique de Gurupi.",
      },
    },
  },

  // 10. Long Document Legal NLP
  {
    id: "proj-long-legal-documents",
    slug: "long-legal-documents",
    status: "ACTIVE",
    tags: ["Large Language Models", "Legal Operations", "Document Parsing"],
    areas: ["nlp"],
    leaders: [
      { memberId: "fabricio-almeida-do-carmo", role: "LEAD" },
      { memberId: "ewaldo-eder-santana", role: "CO_LEAD" },
    ],
    i18n: {
      pt: {
        title: "Análise de Documentos Jurídicos Extensos",
        description: "Modelos de linguagem modernos finamente ajustados (fine-tuning) para varredura comparativa de grandes volumes legais.",
      },
      en: {
        title: "Extended Legal Document Analysis",
        description: "Modern finely-tuned language models for comparative scanning of large-volume legal documents.",
      },
      fr: {
        title: "Analyse de Documents Juridiques Longs",
        description: "Modèles de langage modernes affinés pour l'analyse comparative de documents juridiques à grand volume.",
      },
    },
  },
];

export function projectsByMember(memberId: string): Project[] {
  return projects.filter((p) => p.leaders.some((l) => l.memberId === memberId));
}
