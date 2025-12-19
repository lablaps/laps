/**
 * Dados da rede de equipe para visualização em grafo
 * Contém nós (membros) e links (colaborações)
 */

export interface TeamNode {
  id: string;
  name: string;
  role: 'director' | 'doctor' | 'phd_student' | 'master_student' | 'undergraduate';
  image?: string;
  bio: string;
  expertise: string[];
  email?: string;
  researchAreas?: string[];
}

export interface TeamLink {
  source: string;
  target: string;
  strength: number; // 1-5, onde 5 é colaboração muito forte
  collaborationType: string; // ex: "artigo", "projeto", "orientação"
}

export interface TeamNetworkData {
  nodes: TeamNode[];
  links: TeamLink[];
}

export const teamNetworkData: TeamNetworkData = {
  nodes: [
    {
      id: "ewaldo",
      name: "Prof. Ewaldo Eder Santana",
      role: "director",
      image: "https://via.placeholder.com/150?text=Ewaldo",
      bio: "Doutor em Engenharia Elétrica com foco em processamento de sinais biomédicos. Líder do laboratório LAPS desde 2015.",
      expertise: ["Processamento de Sinais", "Machine Learning", "Sinais Biomédicos", "IoT"],
      email: "ewaldo@uema.br",
      researchAreas: ["Sleep Stage Classification", "EEG Processing"],
    },
    {
      id: "carlos",
      name: "Dr. Carlos Magno Sousa",
      role: "doctor",
      image: "https://via.placeholder.com/150?text=Carlos",
      bio: "Especialista em Deep Learning aplicado a problemas de saúde. Colabora em projetos de classificação automática.",
      expertise: ["Deep Learning", "Neural Networks", "Computer Vision", "Medical AI"],
      email: "carlos@uema.br",
      researchAreas: ["Sleep Classification", "Medical Imaging"],
    },
    {
      id: "yanna",
      name: "Dra. Yanna Cruz",
      role: "doctor",
      image: "https://via.placeholder.com/150?text=Yanna",
      bio: "Pesquisadora em visão computacional. Trabalha com detecção e análise automática de imagens médicas.",
      expertise: ["Computer Vision", "YOLO", "Image Processing", "Microscopy Analysis"],
      email: "yanna@uema.br",
      researchAreas: ["Oocyte Detection", "Biological Image Analysis"],
    },
    {
      id: "wesley",
      name: "Wesley Batista Dominices de Araújo",
      role: "phd_student",
      image: "https://via.placeholder.com/150?text=Wesley",
      bio: "Doutorando em diagnóstico assistido por computador. Desenvolvendo sistema de auxílio ao diagnóstico de câncer de próstata.",
      expertise: ["Medical Diagnosis", "Machine Learning", "Software Development"],
      email: "wesley@uema.br",
      researchAreas: ["Prostate Cancer Diagnosis", "CAD Systems"],
    },
    {
      id: "Ana",
      name: "Ana Paula Silva",
      role: "master_student",
      image: "https://via.placeholder.com/150?text=Ana",
      bio: "Mestranda estudando análise de sinais cardiológicos em tempo real com IoT.",
      expertise: ["IoT", "Cardiac Signal Processing", "Real-time Systems"],
      email: "ana@uema.br",
      researchAreas: ["Cardiac Monitoring", "Wearable Devices"],
    },
    {
      id: "bruno",
      name: "Bruno Costa Ferreira",
      role: "master_student",
      image: "https://via.placeholder.com/150?text=Bruno",
      bio: "Mestrando em análise de movimentos corporais para reabilitação. Utiliza sensores IMU e processamento de sinais.",
      expertise: ["Motion Analysis", "Sensor Fusion", "Rehabilitation Engineering"],
      email: "bruno@uema.br",
      researchAreas: ["Rehabilitation", "Kinematics"],
    },
    {
      id: "lucas",
      name: "Lucas Oliveira",
      role: "undergraduate",
      image: "https://via.placeholder.com/150?text=Lucas",
      bio: "Graduando em Engenharia Elétrica. Trabalha no desenvolvimento de firmware para plataformas IoT.",
      expertise: ["Embedded Systems", "C/C++", "Arduino", "IoT Platforms"],
      email: "lucas@uema.br",
      researchAreas: ["Sensor Integration", "Data Acquisition"],
    },
    {
      id: "marina",
      name: "Marina Tavares",
      role: "undergraduate",
      image: "https://via.placeholder.com/150?text=Marina",
      bio: "Graduanda trabalhando em análise de dados de EEG e desenvolvimento de interfaces de visualização.",
      expertise: ["EEG Analysis", "Data Visualization", "Python", "Signal Processing"],
      email: "marina@uema.br",
      researchAreas: ["Brain Signal Analysis", "Visualization"],
    },
  ],
  links: [
    // Colaborações do Prof. Ewaldo (centro da rede)
    { source: "ewaldo", target: "carlos", strength: 5, collaborationType: "Deep Learning for Sleep Classification (2024)" },
    { source: "ewaldo", target: "yanna", strength: 5, collaborationType: "Oocyte Detection Project (2023)" },
    { source: "ewaldo", target: "wesley", strength: 4, collaborationType: "Orientação de Doutorado" },
    { source: "ewaldo", target: "Ana", strength: 4, collaborationType: "Orientação de Mestrado" },
    { source: "ewaldo", target: "bruno", strength: 4, collaborationType: "Orientação de Mestrado" },
    { source: "ewaldo", target: "lucas", strength: 3, collaborationType: "Supervisão de Pesquisa" },
    { source: "ewaldo", target: "marina", strength: 3, collaborationType: "Supervisão de Pesquisa" },

    // Colaborações entre doutores
    { source: "carlos", target: "yanna", strength: 4, collaborationType: "ML Pipeline Development (2023)" },
    { source: "carlos", target: "wesley", strength: 3, collaborationType: "Mentoria em Deep Learning" },

    // Colaborações entre mestrandos
    { source: "Ana", target: "bruno", strength: 3, collaborationType: "Projeto Integrado IoT" },
    { source: "Ana", target: "lucas", strength: 2, collaborationType: "Desenvolvimento de Sensor" },

    // Graduandos com mestrandos
    { source: "marina", target: "carlos", strength: 2, collaborationType: "Análise de Dados Sleep" },
    { source: "lucas", target: "bruno", strength: 2, collaborationType: "Integração de Sensores" },
    { source: "marina", target: "wesley", strength: 2, collaborationType: "Visualização de Resultados" },

    // Colaboração externa (yanna com wesley)
    { source: "yanna", target: "wesley", strength: 2, collaborationType: "Análise de Imagens Médicas" },
  ],
};
