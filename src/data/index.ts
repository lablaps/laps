import { Member, Project, News, Event } from '@/types';

export const members: Member[] = [
  {
    id: '1',
    name: 'Ph.D Ewaldo Eder Santana',
    title: 'Head of the Laboratory of Signals Acquisition and Processing',
    category: 'director',
    image: '/images/prof.ewaldo.png',
    lattesUrl: 'http://lattes.cnpq.br/0660692009750374',
    email: 'ewaldo@engcomp.uema.br',
    active: true,
    joinDate: new Date('2015-01-01'),
    researchAreas: ['Signal Processing', 'Machine Learning', 'IoT']
  },
  {
    id: '2',
    name: 'Dr. Carlos Magno Sousa Júnior',
    title: 'Pesquisador',
    category: 'doctor',
    image: '/images/professor-magno.jpg',
    lattesUrl: 'http://lattes.cnpq.br/9561853644051629',
    active: true,
    joinDate: new Date('2018-03-01'),
    researchAreas: ['Sleep Quality Assessment', 'Biomedical Signals']
  },
  {
    id: '3',
    name: 'Dr. Lúcio Flávio de Albuquerque Campos',
    title: 'Pesquisador',
    category: 'doctor',
    image: '/images/prof-lucio.jpg',
    lattesUrl: 'http://lattes.cnpq.br/6876234739101371',
    active: true,
    joinDate: new Date('2017-06-01'),
    researchAreas: ['Naval Systems', 'Quality Control']
  },
  {
    id: '4',
    name: 'Wesley Batista Dominices de Araújo',
    title: 'Pesquisador',
    category: 'phd_student',
    image: '/images/fundo-preto-com-textura-de-tecido.jpg',
    lattesUrl: 'http://lattes.cnpq.br/6048598111441819',
    active: true,
    joinDate: new Date('2021-03-01'),
    researchAreas: ['Cancer Diagnosis', 'Machine Learning', 'Medical AI']
  },
  {
    id: '5',
    name: 'Yanna Leidy Ketley Fernandes Cruz',
    title: 'Pesquisadora',
    category: 'phd_student',
    image: '/images/fundo-preto-com-textura-de-tecido.jpg',
    lattesUrl: 'http://lattes.cnpq.br/1613229145306715',
    active: true,
    joinDate: new Date('2020-08-01'),
    researchAreas: ['Oocyte Detection', 'Neural Networks', 'Computer Vision']
  }
];

export const projects: Project[] = [
  {
    id: '1',
    title: 'Avaliação da Qualidade do Sono',
    description: 'Desenvolvimento de metodologias para avaliar e monitorar a qualidade do sono utilizando sensores não invasivos e algoritmos de aprendizado de máquina.',
    researchers: ['Carlos Magno Sousa', 'Georlene Lima Morais'],
    startDate: new Date('2023-01-01'),
    status: 'active',
    category: 'Saúde',
    tags: ['sono', 'sensores', 'machine learning', 'saúde'],
    fundingAgency: 'CNPq'
  },
  {
    id: '2',
    title: 'Sistema de Auxílio ao Diagnóstico de Câncer de Próstata',
    description: 'Propor um sistema de auxílio ao diagnóstico de câncer de próstata utilizando informações dos pacientes e exames de rotina.',
    researchers: ['Wesley Batista Dominices de Araújo'],
    startDate: new Date('2022-08-01'),
    status: 'active',
    category: 'Medicina',
    tags: ['câncer', 'diagnóstico', 'IA', 'próstata'],
    fundingAgency: 'FAPEMA'
  },
  {
    id: '3',
    title: 'Detecção de Ovócitos',
    description: 'Desenvolvimento de uma metodologia para detectar automaticamente ovócitos utilizando redes neurais.',
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
    title: 'LAPS desenvolve novo sistema de monitoramento ambiental',
    content: 'O Laboratório de Aquisição e Processamento de Sinais (LAPS) da UEMA está desenvolvendo um inovador sistema de monitoramento ambiental...',
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
    title: 'Laboratório da UEMA estimula desenvolvimento científico e tecnológico',
    content: 'O LAPS tem sido reconhecido como um importante centro de inovação...',
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
