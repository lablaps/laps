export type Lang = "pt" | "en" | "fr";

export const translations = {
  pt: {
    nav: { sobre: "Sobre", equipe: "Equipe", home: "Home", projetos: "Projetos", intercambio: "Intercâmbio", contato: "Contato", portal: "Meu Perfil", admin: "Gerenciar", login: "Entrar" },
    tagline: "Laboratório de Aquisição e Processamento de Sinais",
    hero: {
      label: "LAPS · Laboratório de Aquisição e Processamento de Sinais",
      title1: "Laboratório de Aquisição e",
      title2: "Processamento de Sinais",
      subtitle:
        "Desenvolvendo tecnologias inovadoras em processamento de sinais e inteligência artificial para impactar positivamente a sociedade.",
      cta1: "Nossos Projetos",
      cta2: "Conheça o LAPS",
      scrollHint: "Explorar mais",
    },
    stats: {
      anos: "Anos de Pesquisa",
      pubs: "Publicações",
      proj: "Projetos Ativos",
      pesq: "Pesquisadores",
    },
    about: {
      chip: "Sobre o LAPS",
      title: "Inovação em Processamento de Sinais",
      body:
        "O LAPS é um laboratório de pesquisa dedicado ao desenvolvimento de tecnologias avançadas em processamento de sinais e inteligência artificial. Nossa equipe multidisciplinar trabalha na fronteira entre engenharia, computação e ciência de dados.",
      missionTitle: "Nossa Missão",
      missionBody:
        "Desenvolver soluções tecnológicas inovadoras em processamento de sinais e inteligência artificial que contribuam para o avanço da ciência e melhoria da qualidade de vida da sociedade.",
      visionTitle: "Nossa Visão",
      visionBody:
        "Ser reconhecido como um centro de excelência em pesquisa e desenvolvimento de tecnologias de processamento de sinais, formando pesquisadores de alto nível e produzindo conhecimento de impacto internacional.",
    },
    areas: {
      title: "Áreas de Pesquisa",
      items: [
        { t: "Inteligência Artificial", d: "Algoritmos de machine learning e deep learning para análise e classificação de sinais." },
        { t: "Processamento de Sinais", d: "Filtragem, análise espectral, extração de características e separação de fontes em qualquer domínio de sinal." },
        { t: "Diagnóstico Médico", d: "Ferramentas computacionais para auxílio ao diagnóstico e detecção precoce de doenças." },
        { t: "Sensores e Aquisição", d: "Instrumentação, redes de sensores e sistemas embarcados para captura de sinais do mundo real." },
      ],
    },
    values: { title: "Nossos Valores", items: ["Confiabilidade", "Tecnologia", "Avanço", "Conhecimento"] },
    team: { title: "Nossa Equipe", cta: "Ver todos os pesquisadores" },
    structure: {
      chip: "Nossa Equipe",
      title: "Rede de Pesquisadores do LAPS",
      body: "Explore nossa equipe como uma rede neural viva — chefe, doutorandos, mestrandos e graduandos conectados pelo trabalho colaborativo. Clique em qualquer nó para conhecer o pesquisador.",
      headTitle: "Chefe do Laboratório",
      headSubtitle: "Liderança científica e administrativa do LAPS",
      headRole: "Chefe do Laboratório",
      headHeadline: "Head of the Laboratory of Signals Acquisition and Processing",
      areasLabel: "Áreas de Pesquisa:",
      compTitle: "Composição da Equipe",
      tiers: [
        { label: "Doutorandos", value: 10 },
        { label: "Mestrandos", value: 14 },
        { label: "Graduandos", value: 21 },
        { label: "Total", value: 46 },
      ],
      researchersTitle: "Rede de Pesquisadores",
      roles: { chefe: "Chefe do Laboratório", doutor: "Doutor", doutorando: "Doutorando" },
      network: {
        helper: "Passe o mouse sobre um nó para ver as conexões. Clique para abrir o perfil.",
        legendTitle: "Legenda:",
        tier: { head: "Head", coordinator: "Coordenador", manager: "Gerenciador", doctorate: "Doutorando", master: "Mestrando", undergrad: "Graduando" },
        linkedin: "Ver no LinkedIn",
        noLinkedin: "LinkedIn em breve",
        areas: "Áreas de Atuação",
        bioPending: "Biografia em breve — informações detalhadas serão adicionadas pela coordenação do LAPS.",
        views: {
          mesh: "Rede Neural",
          pyramid: "Hierarquia",
          list: "Lista",
          search: "Buscar por nome...",
          filterByRole: "Nível",
          filterByProject: "Projeto",
          allRoles: "Todos os níveis",
          allProjects: "Todos os projetos",
          clearFilters: "Limpar filtros",
          noResults: "Nenhum pesquisador encontrado.",
        },
      },
    },
    projects: {
      title: "Projetos",
      status: { active: "Ativo", done: "Concluído" },
      more: "Saiba mais",
      items: [
        { t: "NeuroSignal AI", d: "Detecção precoce de epilepsia através de redes neurais profundas em sinais EEG." },
        { t: "CardioWave", d: "Plataforma de análise de variabilidade da frequência cardíaca em tempo real." },
        { t: "BioFilter", d: "Biblioteca open-source de filtros adaptativos para sinais ruidosos." },
      ],
    },
    exchange: {
      chip: "Intercâmbio",
      heroTitle: "Nossos Intercambistas",
      heroBody:
        "Pesquisadores e estudantes do LAPS construindo pontes científicas com universidades parceiras na Europa e nas Américas. Cada perfil resume a destinação, o nível acadêmico e os idiomas de trabalho em campo.",
      summary: {
        label: "Visão geral",
        countWithCount: (n: number) => `${n} integrantes do LAPS que tiveram mobilidade internacional`,
        countries: "4 países: França, Canadá, Portugal e Itália",
        languages: "Português + idiomas dos países anfitriões em uso ativo",
      },
      reality: {
        title: "Desafios e imersão cultural",
        body:
          "Mudar-se para outro país durante a pós-graduação é uma vitória — e também uma rotina dura. Burocracia de visto, custo de vida em outra moeda, distância dos familiares, primeiro inverno fora dos trópicos, idioma técnico em sala de aula e idioma cotidiano na rua: tudo acontece ao mesmo tempo. Nossos intercambistas aprendem a navegar o sistema acadêmico local, defender pesquisa em outra língua, cozinhar em outra cozinha e descobrir que saudade do Maranhão é um sentimento que vira combustível. A imersão cultural não é só turismo: é fazer ciência colaborando lado a lado com pesquisadores de tradições diferentes.",
      },
      opportunity: {
        title: "Oportunidades no LAPS — em qualquer nível",
        body:
          "O LAPS apoia mobilidade internacional para todo o corpo de pesquisa: graduação, mestrado e doutorado. Acordos com universidades parceiras, editais de cooperação CAPES/CNPq, programas Erasmus+, BRAFITEC e bolsas de instituições anfitriãs abrem portas em laboratórios da Europa e das Américas. Se você está no laboratório, há um caminho para você fazer parte da próxima geração de intercambistas.",
      },
      labels: {
        students: "intercambistas",
        country: "País",
        languages: "Idiomas em uso",
        tier: "Nível",
        seeProfile: "Ver perfil",
      },
      tier: {
        head: "Chefe do Laboratório",
        coordinator: "Coordenador(a)",
        manager: "Gerenciador(a)",
        doctorate: "Doutorando(a)",
        master: "Mestrando(a)",
        undergrad: "Graduando(a)",
      },
      langName: { pt: "Português", en: "Inglês", fr: "Francês", it: "Italiano" },
    },
    footer: {
      desc: "Pesquisa de ponta em processamento de sinais e inteligência artificial.",
      navTitle: "Navegação",
      contactTitle: "Contato",
      address: "Universidade Estadual do Maranhão — UEMA — São Cristóvão, São Luís - MA",
      rights: "© 2026 LAPS — Todos os direitos reservados",
      made: "Desenvolvido com ❤ pelo LAPS",
    },
  },
  en: {
    nav: { sobre: "About", equipe: "Team", home: "Home", projetos: "Projects", intercambio: "International Exchange", contato: "Contact", portal: "My Profile", admin: "Manage", login: "Sign in" },
    tagline: "Signal Acquisition and Processing Laboratory",
    hero: {
      label: "LAPS · Signal Acquisition and Processing Laboratory",
      title1: "Signal Acquisition and",
      title2: "Processing Laboratory",
      subtitle:
        "Building innovative signal processing and artificial intelligence technologies to positively impact society.",
      cta1: "Our Projects",
      cta2: "Discover LAPS",
      scrollHint: "Explore more",
    },
    stats: { anos: "Years of Research", pubs: "Publications", proj: "Active Projects", pesq: "Researchers" },
    about: {
      chip: "About LAPS",
      title: "Innovation in Signal Processing",
      body:
        "LAPS is a research laboratory dedicated to advanced signal processing and artificial intelligence. Our multidisciplinary team works at the frontier of engineering, computing and data science.",
      missionTitle: "Our Mission",
      missionBody:
        "To develop innovative technological solutions in signal processing and artificial intelligence that contribute to the advancement of science and improve quality of life.",
      visionTitle: "Our Vision",
      visionBody:
        "To be recognized as a center of excellence in signal processing R&D, training top-tier researchers and producing knowledge with international impact.",
    },
    areas: {
      title: "Research Areas",
      items: [
        { t: "Artificial Intelligence", d: "Machine learning and deep learning algorithms for signal analysis and classification." },
        { t: "Signal Processing", d: "Filtering, spectral analysis, feature extraction and source separation across any signal domain." },
        { t: "Medical Diagnostics", d: "Computational tools for diagnostic support and early disease detection." },
        { t: "Sensors & Acquisition", d: "Instrumentation, sensor networks and embedded systems for real-world signal capture." },
      ],
    },
    values: { title: "Our Values", items: ["Reliability", "Technology", "Advancement", "Knowledge"] },
    team: { title: "Our Team", cta: "See all researchers" },
    structure: {
      chip: "Our Team",
      title: "LAPS Researcher Network",
      body: "Explore our team as a living neural network — the head, doctoral students, MSc students and undergrads connected through collaborative work. Click any node to meet the researcher.",
      headTitle: "Head of the Laboratory",
      headSubtitle: "Scientific and administrative leadership of LAPS",
      headRole: "Head of the Laboratory",
      headHeadline: "Head of the Laboratory of Signals Acquisition and Processing",
      areasLabel: "Research Areas:",
      compTitle: "Team Composition",
      tiers: [
        { label: "Doutorando(a)s", value: 10 },
        { label: "MSc Students", value: 14 },
        { label: "Undergrads", value: 21 },
        { label: "Total", value: 46 },
      ],
      researchersTitle: "Researcher Network",
      roles: { chefe: "Head of Laboratory", doutor: "Doutor", doutorando: "Doutorando" },
      network: {
        helper: "Hover a node to reveal its connections. Click to open the profile.",
        legendTitle: "Legend:",
        tier: { head: "Head", coordinator: "Coordinator", manager: "Manager", doctorate: "Doutorando", master: "Mestrando", undergrad: "Graduando" },
        linkedin: "View on LinkedIn",
        noLinkedin: "LinkedIn coming soon",
        areas: "Research Areas",
        bioPending: "Bio coming soon — detailed information will be added by the LAPS coordination.",
        views: {
          mesh: "Neural Mesh",
          pyramid: "Hierarchy",
          list: "List",
          search: "Search by name...",
          filterByRole: "Level",
          filterByProject: "Project",
          allRoles: "All levels",
          allProjects: "All projects",
          clearFilters: "Clear filters",
          noResults: "No researchers found.",
        },
      },
    },
    projects: {
      title: "Projects",
      status: { active: "Active", done: "Completed" },
      more: "Learn more",
      items: [
        { t: "NeuroSignal AI", d: "Early epilepsy detection via deep neural networks on EEG signals." },
        { t: "CardioWave", d: "Real-time heart rate variability analysis platform." },
        { t: "BioFilter", d: "Open-source adaptive filter library for noisy signals." },
      ],
    },
    exchange: {
      chip: "International Exchange",
      heroTitle: "Our Exchange Researchers",
      heroBody:
        "LAPS researchers and students building scientific bridges with partner universities across Europe and the Americas. Each profile shows the destination, academic level and working languages on the ground.",
      summary: {
        label: "Overview",
        countWithCount: (n: number) => `${n} LAPS members currently on international mobility`,
        countries: "4 host countries: France, Canada, Portugal and Italy",
        languages: "Portuguese + the host country's language, in active daily use",
      },
      reality: {
        title: "Real challenges and cultural immersion",
        body:
          "Moving abroad during graduate research is a milestone — and also a hard routine. Visa paperwork, living costs in a new currency, distance from family, the first winter outside the tropics, technical language in the classroom and street language on the metro: it all happens at once. Our exchange researchers learn to navigate a foreign academic system, defend their work in another language, cook in a new kitchen and discover that missing Maranhão becomes its own kind of fuel. Cultural immersion is not tourism — it's doing science alongside researchers from different traditions.",
      },
      opportunity: {
        title: "Opportunities at LAPS — at every level",
        body:
          "LAPS supports international mobility for the entire research body: undergrads, MSc and doctoral students. Partner-university agreements, CAPES/CNPq cooperation calls, Erasmus+ and BRAFITEC programs and host-institution grants open doors in European and American labs. If you're in the lab, there's a path for you to join the next generation of exchange researchers.",
      },
      labels: {
        students: "exchange researchers",
        country: "Country",
        languages: "Working languages",
        tier: "Level",
        seeProfile: "Open profile",
      },
      tier: {
        head: "Head of Laboratory",
        coordinator: "Coordinator",
        manager: "Manager",
        doctorate: "Doutorando",
        master: "MSc Student",
        undergrad: "Undergrad",
      },
      langName: { pt: "Portuguese", en: "English", fr: "French", it: "Italian" },
    },
    footer: {
      desc: "Frontier research in signal processing and artificial intelligence.",
      navTitle: "Navigation",
      contactTitle: "Contact",
      address: "State University of Maranhão — UEMA — São Cristóvão, São Luís - MA",
      rights: "© 2026 LAPS — All rights reserved",
      made: "Built with ❤ by LAPS",
    },
  },
  fr: {
    nav: { sobre: "À propos", equipe: "Équipe", home: "Accueil", projetos: "Projets", intercambio: "Échange International", contato: "Contact", portal: "Mon Profil", admin: "Gérer", login: "Connexion" },
    tagline: "Laboratoire d'Acquisition et Traitement des Signaux",
    hero: {
      label: "LAPS · Laboratoire d'Acquisition et Traitement des Signaux",
      title1: "Laboratoire d'Acquisition et",
      title2: "Traitement des Signaux",
      subtitle:
        "Développer des technologies innovantes en traitement du signal et intelligence artificielle pour un impact positif sur la société.",
      cta1: "Nos Projets",
      cta2: "Découvrir LAPS",
      scrollHint: "Explorer plus",
    },
    stats: { anos: "Années de Recherche", pubs: "Publications", proj: "Projets Actifs", pesq: "Chercheurs" },
    about: {
      chip: "À propos de LAPS",
      title: "Innovation en Traitement du Signal",
      body:
        "LAPS est un laboratoire de recherche dédié au traitement avancé des signaux et à l'intelligence artificielle. Notre équipe pluridisciplinaire travaille à la frontière de l'ingénierie, de l'informatique et de la science des données.",
      missionTitle: "Notre Mission",
      missionBody:
        "Développer des solutions technologiques innovantes en traitement du signal et IA qui contribuent à l'avancement de la science et à l'amélioration de la qualité de vie.",
      visionTitle: "Notre Vision",
      visionBody:
        "Être reconnu comme un centre d'excellence en R&D du traitement du signal, formant des chercheurs de haut niveau à impact international.",
    },
    areas: {
      title: "Domaines de Recherche",
      items: [
        { t: "Intelligence Artificielle", d: "Algorithmes de machine learning et deep learning pour l'analyse et la classification des signaux." },
        { t: "Traitement du Signal", d: "Filtrage, analyse spectrale, extraction de caractéristiques et séparation de sources dans tout domaine de signal." },
        { t: "Diagnostic Médical", d: "Outils computationnels pour l'aide au diagnostic et la détection précoce." },
        { t: "Capteurs & Acquisition", d: "Instrumentation, réseaux de capteurs et systèmes embarqués pour la capture de signaux réels." },
      ],
    },
    values: { title: "Nos Valeurs", items: ["Fiabilité", "Technologie", "Avancée", "Connaissance"] },
    team: { title: "Notre Équipe", cta: "Voir tous les chercheurs" },
    structure: {
      chip: "Notre Équipe",
      title: "Réseau de Chercheurs du LAPS",
      body: "Découvrez notre équipe sous la forme d'un réseau neuronal vivant — le chef, les doctorants, les étudiants en master et les étudiants en licence connectés par le travail collaboratif. Cliquez sur un nœud pour découvrir le chercheur.",
      headTitle: "Chef du Laboratoire",
      headSubtitle: "Direction scientifique et administrative du LAPS",
      headRole: "Chef du Laboratoire",
      headHeadline: "Head of the Laboratory of Signals Acquisition and Processing",
      areasLabel: "Domaines de Recherche :",
      compTitle: "Composition de l'Équipe",
      tiers: [
        { label: "Doctorants", value: 10 },
        { label: "Master", value: 14 },
        { label: "Licence", value: 21 },
        { label: "Total", value: 46 },
      ],
      researchersTitle: "Réseau de Chercheurs",
      roles: { chefe: "Chef du Laboratoire", doutor: "Docteur", doutorando: "Doctorant" },
      network: {
        helper: "Survolez un nœud pour révéler ses connexions. Cliquez pour ouvrir le profil.",
        legendTitle: "Légende :",
        tier: { head: "Head", coordinator: "Coordonnateur", manager: "Gérant", doctorate: "Doctorant", master: "Master", undergrad: "Licence" },
        linkedin: "Voir sur LinkedIn",
        noLinkedin: "LinkedIn bientôt",
        areas: "Domaines de Recherche",
        bioPending: "Biographie à venir — des informations détaillées seront ajoutées par la coordination du LAPS.",
        views: {
          mesh: "Réseau Neural",
          pyramid: "Hiérarchie",
          list: "Liste",
          search: "Rechercher par nom...",
          filterByRole: "Niveau",
          filterByProject: "Projet",
          allRoles: "Tous les niveaux",
          allProjects: "Tous les projets",
          clearFilters: "Effacer les filtres",
          noResults: "Aucun chercheur trouvé.",
        },
      },
    },
    projects: {
      title: "Projets",
      status: { active: "Actif", done: "Terminé" },
      more: "En savoir plus",
      items: [
        { t: "NeuroSignal AI", d: "Détection précoce de l'épilepsie via réseaux neuronaux profonds sur signaux EEG." },
        { t: "CardioWave", d: "Plateforme d'analyse en temps réel de la variabilité cardiaque." },
        { t: "BioFilter", d: "Bibliothèque open-source de filtres adaptatifs pour signaux bruités." },
      ],
    },
    exchange: {
      chip: "Échange International",
      heroTitle: "Nos Chercheurs en Échange",
      heroBody:
        "Chercheurs et étudiants du LAPS construisant des ponts scientifiques avec des universités partenaires en Europe et dans les Amériques. Chaque profil indique la destination, le niveau académique et les langues de travail sur le terrain.",
      summary: {
        label: "Vue d'ensemble",
        countWithCount: (n: number) => `${n} membres du LAPS actuellement en mobilité internationale`,
        countries: "4 pays d'accueil : France, Canada, Portugal et Italie",
        languages: "Portugais + langue du pays d'accueil, en usage quotidien actif",
      },
      reality: {
        title: "Défis réels et immersion culturelle",
        body:
          "Partir à l'étranger pendant la recherche supérieure est une étape majeure — et aussi un quotidien exigeant. Démarches de visa, coût de la vie dans une autre devise, éloignement de la famille, premier hiver hors des tropiques, langue technique en classe et langue de la rue dans le métro : tout arrive en même temps. Nos chercheurs en échange apprennent à naviguer un système universitaire étranger, à défendre leur recherche dans une autre langue, à cuisiner dans une nouvelle cuisine et à découvrir que la nostalgie du Maranhão devient son propre carburant. L'immersion culturelle n'est pas du tourisme — c'est faire de la science aux côtés de chercheurs d'autres traditions.",
      },
      opportunity: {
        title: "Opportunités au LAPS — à chaque niveau",
        body:
          "Le LAPS soutient la mobilité internationale pour l'ensemble de ses chercheurs : étudiants en licence, en master et en doctorat. Accords de partenariat universitaire, appels CAPES/CNPq, programmes Erasmus+ et BRAFITEC, bourses des institutions d'accueil : autant de portes ouvertes vers des laboratoires européens et américains. Si vous êtes au laboratoire, il existe un chemin pour rejoindre la prochaine génération de chercheurs en échange.",
      },
      labels: {
        students: "chercheurs en échange",
        country: "Pays",
        languages: "Langues de travail",
        tier: "Niveau",
        seeProfile: "Voir le profil",
      },
      tier: {
        head: "Chef du Laboratoire",
        coordinator: "Coordonnateur",
        manager: "Gérant",
        doctorate: "Doctorant",
        master: "Master",
        undergrad: "Licence",
      },
      langName: { pt: "Portugais", en: "Anglais", fr: "Français", it: "Italien" },
    },
    footer: {
      desc: "Recherche de pointe en traitement des signaux et intelligence artificielle.",
      navTitle: "Navigation",
      contactTitle: "Contact",
      address: "Université d'État du Maranhão — UEMA — São Cristóvão, São Luís - MA",
      rights: "© 2026 LAPS — Tous droits réservés",
      made: "Conçu avec ❤ par LAPS",
    },
  },
} as const;

export const stats = [
  { value: 15, suffix: "+", key: "anos" as const },
  { value: 50, suffix: "+", key: "pubs" as const },
  { value: 20, suffix: "+", key: "proj" as const },
  { value: 30, suffix: "+", key: "pesq" as const },
];
