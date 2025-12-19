import { Member, Project, News, Event, Publication } from '@/types';

export const members: Member[] = [
  {
    id: '1',
    name: 'Ph.D Ewaldo Eder Santana',
    title: 'Head of the Laboratory of Signals Acquisition and Processing',
    category: 'director',
    image: '/images/prof.ewaldo.png',
    lattesUrl: 'http://lattes.cnpq.br/0660692009750374',
    researchGateUrl: 'https://www.researchgate.net/profile/Ewaldo-Santana',
    email: 'ewaldo@engcomp.uema.br',
    active: true,
    joinDate: new Date('2015-01-01'),
    researchAreas: ['Signal Processing', 'Machine Learning', 'IoT'],
    bio: 'Professor Adjunto da Universidade Estadual do Maranhão (UEMA). Possui graduação em Engenharia Elétrica pela Universidade Federal do Maranhão (2008), mestrado em Engenharia Elétrica pela Universidade Federal do Maranhão (2011) e doutorado em Engenharia Elétrica pela Universidade Federal do Maranhão (2015).'
  },
  {
    id: '2',
    name: 'Dr. Carlos Magno Sousa Júnior',
    title: 'Pesquisador',
    category: 'doctor',
    image: '/images/professor-magno.jpg',
    lattesUrl: 'http://lattes.cnpq.br/9561853644051629',
    researchGateUrl: 'https://www.researchgate.net/',
    active: true,
    joinDate: new Date('2018-03-01'),
    researchAreas: ['Sleep Quality Assessment', 'Biomedical Signals'],
    bio: 'Doutor em Engenharia Elétrica. Atua principalmente nos seguintes temas: processamento digital de sinais, reconhecimento de padrões e inteligência computacional.'
  },
  {
    id: '3',
    name: 'Dr. Lúcio Flávio de Albuquerque Campos',
    title: 'Pesquisador',
    category: 'doctor',
    image: '/images/prof-lucio.jpg',
    lattesUrl: 'http://lattes.cnpq.br/6876234739101371',
    researchGateUrl: 'https://www.researchgate.net/',
    active: true,
    joinDate: new Date('2017-06-01'),
    researchAreas: ['Naval Systems', 'Quality Control'],
    bio: 'Doutor em Engenharia Elétrica. Tem experiência na área de Engenharia Elétrica, com ênfase em Eletrônica Industrial, Sistemas e Controles Eletrônicos.'
  },
  {
    id: '4',
    name: 'Wesley Batista Dominices de Araújo',
    title: 'Pesquisador',
    category: 'phd_student',
    image: '/images/fundo-preto-com-textura-de-tecido.jpg',
    lattesUrl: 'http://lattes.cnpq.br/6048598111441819',
    researchGateUrl: 'https://www.researchgate.net/',
    active: true,
    joinDate: new Date('2021-03-01'),
    researchAreas: ['Cancer Diagnosis', 'Machine Learning', 'Medical AI'],
    bio: 'Doutorando em Engenharia de Computação e Sistemas. Pesquisa aplicações de IA no diagnóstico médico.'
  },
  {
    id: '5',
    name: 'Yanna Leidy Ketley Fernandes Cruz',
    title: 'Pesquisadora',
    category: 'phd_student',
    image: '/images/fundo-preto-com-textura-de-tecido.jpg',
    lattesUrl: 'http://lattes.cnpq.br/1613229145306715',
    researchGateUrl: 'https://www.researchgate.net/',
    active: true,
    joinDate: new Date('2020-08-01'),
    researchAreas: ['Oocyte Detection', 'Neural Networks', 'Computer Vision'],
    bio: 'Doutoranda em Engenharia de Computação. Foca em visão computacional aplicada à biologia.'
  }
];

export const projects: Project[] = [
  {
    id: '1',
    slug: 'avaliacao-qualidade-sono',
    title: 'Avaliação da Qualidade do Sono',
    description: 'Desenvolvimento de metodologias para avaliar e monitorar a qualidade do sono utilizando sensores não invasivos e algoritmos de aprendizado de máquina.',
    fullDescription: 'Este projeto visa criar um sistema robusto e não invasivo para monitoramento do sono, utilizando acelerômetros e sensores de batimento cardíaco integrados a dispositivos vestíveis. Os dados coletados são processados por algoritmos de Deep Learning para classificar os estágios do sono e identificar distúrbios.',
    objectives: '1. Desenvolver hardware de baixo custo para monitoramento. 2. Criar algoritmos de classificação de estágios do sono. 3. Validar o sistema com polissonografia.',
    methodology: 'Coleta de dados com voluntários utilizando sensores vestíveis e polissonografia simultânea. Treinamento de redes neurais convolucionais (CNN) para classificação.',
    results: 'Protótipo funcional desenvolvido com acurácia de 85% na detecção de estágios do sono em comparação com o padrão ouro.',
    researchers: ['Carlos Magno Sousa', 'Georlene Lima Morais'],
    startDate: new Date('2023-01-01'),
    status: 'active',
    category: 'Saúde',
    tags: ['sono', 'sensores', 'machine learning', 'saúde'],
    fundingAgency: 'CNPq'
  },
  {
    id: '2',
    slug: 'diagnostico-cancer-prostata',
    title: 'Sistema de Auxílio ao Diagnóstico de Câncer de Próstata',
    description: 'Propor um sistema de auxílio ao diagnóstico de câncer de próstata utilizando informações dos pacientes e exames de rotina.',
    fullDescription: 'O projeto utiliza técnicas de aprendizado de máquina para analisar dados clínicos e exames de sangue (PSA) para auxiliar médicos na detecção precoce do câncer de próstata, reduzindo a necessidade de biópsias desnecessárias.',
    objectives: 'Reduzir falsos positivos em diagnósticos de câncer de próstata e auxiliar na decisão clínica.',
    methodology: 'Análise estatística e modelagem preditiva utilizando bases de dados públicas e de hospitais parceiros.',
    results: 'Modelo preditivo com sensibilidade de 90% e especificidade de 80%.',
    researchers: ['Wesley Batista Dominices de Araújo'],
    startDate: new Date('2022-08-01'),
    status: 'active',
    category: 'Medicina',
    tags: ['câncer', 'diagnóstico', 'IA', 'próstata'],
    fundingAgency: 'FAPEMA'
  },
  {
    id: '3',
    slug: 'deteccao-ovocitos',
    title: 'Detecção de Ovócitos',
    description: 'Desenvolvimento de uma metodologia para detectar automaticamente ovócitos utilizando redes neurais.',
    fullDescription: 'Automação do processo de contagem e classificação de ovócitos em imagens de microscopia, visando otimizar processos de fertilização in vitro em animais.',
    objectives: 'Automatizar a contagem de ovócitos e classificar sua qualidade.',
    methodology: 'Uso de redes YOLO (You Only Look Once) para detecção de objetos em tempo real em imagens microscópicas.',
    results: 'Sistema capaz de detectar ovócitos com 95% de precisão em imagens de baixa resolução.',
    researchers: ['Yanna Cruz', 'Lethicia', 'Manuele'],
    startDate: new Date('2023-03-01'),
    status: 'active',
    category: 'Biologia',
    tags: ['ovócitos', 'redes neurais', 'detecção automática'],
    fundingAgency: 'UEMA'
  }
];

export const news: News[] = [
  {
    id: '1',
    slug: 'laps-desenvolve-novo-sistema-monitoramento',
    title: 'LAPS desenvolve novo sistema de monitoramento ambiental',
    content: 'O Laboratório de Aquisição e Processamento de Sinais (LAPS) da UEMA está desenvolvendo um inovador sistema de monitoramento ambiental. O projeto utiliza sensores IoT distribuídos para coletar dados de qualidade do ar, temperatura e umidade em tempo real. Os dados são transmitidos para uma central onde algoritmos de IA analisam padrões e prevêem possíveis riscos ambientais.',
    excerpt: 'Novo sistema utiliza IoT e IA para monitoramento em tempo real.',
    author: 'Equipe LAPS',
    publishDate: new Date('2025-05-15'),
    featured: true,
    image: '/images/news/uema.jpg',
    category: 'Pesquisa',
    tags: ['IoT', 'meio ambiente', 'monitoramento']
  },
  {
    id: '2',
    slug: 'laps-destaque-midia',
    title: 'Laboratório da UEMA estimula desenvolvimento científico e tecnológico',
    content: 'O LAPS tem sido reconhecido como um importante centro de inovação no estado do Maranhão. Recentemente, o portal Imirante destacou as contribuições do laboratório para o desenvolvimento tecnológico regional, citando projetos na área de saúde e agricultura de precisão.',
    excerpt: 'LAPS ganha destaque na mídia local pelo impacto científico.',
    author: 'Imirante',
    publishDate: new Date('2025-04-20'),
    featured: false,
    image: '/images/news/imirante.jpg',
    category: 'Mídia',
    tags: ['reconhecimento', 'inovação', 'UEMA'],
    externalUrl: 'https://imaranhense.com/noticia/23500/laboratorio-de-aquisicao-e-processamento-de-sinais-da-uema-estimula-o-desenvolvimento-cientifico-e-tecnologico-do-estado'
  }
];

export const events: Event[] = [
  {
    id: '1',
    title: 'Seminário de Inteligência Artificial aplicada à Saúde',
    description: 'Apresentação dos últimos avanços em IA para diagnóstico médico.',
    date: '2025-06-15',
    time: '14:00 - 16:00',
    startDate: new Date('2025-06-15'),
    endDate: new Date('2025-06-15'),
    location: 'Auditório CCT - UEMA',
    type: 'seminar',
    status: 'upcoming',
    speaker: 'Dr. Carlos Magno',
    organizer: 'LAPS',
    maxAttendees: 100
  },
  {
    id: '2',
    title: 'Workshop de Processamento de Sinais',
    description: 'Curso prático sobre técnicas modernas de processamento de sinais.',
    date: '2025-07-10',
    time: '08:00 - 17:00',
    startDate: new Date('2025-07-10'),
    endDate: new Date('2025-07-12'),
    location: 'Laboratório LAPS',
    type: 'workshop',
    status: 'upcoming',
    speaker: 'Prof. Ewaldo Eder',
    organizer: 'LAPS',
    maxAttendees: 30,
    registrationUrl: 'https://forms.gle/example'
  }
];

export const publications: Publication[] = [
  {
    id: '1',
    title: 'Deep Learning for Sleep Stage Classification',
    authors: ['Carlos Magno Sousa', 'Ewaldo Eder Santana'],
    journal: 'IEEE Transactions on Biomedical Engineering',
    year: 2024,
    type: 'article',
    doi: '10.1109/TBME.2024.1234567'
  },
  {
    id: '2',
    title: 'Automated Oocyte Detection using YOLOv8',
    authors: ['Yanna Cruz', 'Ewaldo Eder Santana'],
    conference: 'International Conference on Image Processing (ICIP)',
    year: 2023,
    type: 'article'
  },
  {
    id: '3',
    title: 'Sistema de Auxílio ao Diagnóstico de Câncer de Próstata',
    authors: ['Wesley Batista Dominices de Araújo'],
    year: 2022,
    type: 'thesis',
    url: 'https://repositorio.uema.br/handle/123456789/1234'
  }
];
