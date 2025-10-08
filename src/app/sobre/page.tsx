import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Heart, 
  Microscope, 
  Zap, 
  Target, 
  Users,
  Award,
  MapPin
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const milestones = [
    {
      year: "2008",
      title: "Fundação do LAPS",
      description: "Criação do laboratório com foco em processamento de sinais biomédicos"
    },
    {
      year: "2012",
      title: "Primeiro Projeto Internacional",
      description: "Colaboração com universidades europeias em análise de sinais cardiovasculares"
    },
    {
      year: "2015",
      title: "Expansão para IA",
      description: "Incorporação de técnicas de inteligência artificial nos projetos"
    },
    {
      year: "2018",
      title: "Laboratório de Excelência",
      description: "Reconhecimento como centro de excelência em pesquisa"
    },
    {
      year: "2023",
      title: "50+ Publicações",
      description: "Marco de mais de 50 publicações em periódicos internacionais"
    }
  ];

  const areas = [
    {
      icon: Brain,
      title: "Inteligência Artificial",
      description: "Desenvolvimento de algoritmos de machine learning e deep learning para análise de sinais biomédicos, incluindo redes neurais convolucionais, recorrentes e arquiteturas transformer.",
      applications: ["Classificação de sinais", "Detecção de anomalias", "Predição de eventos"]
    },
    {
      icon: Heart,
      title: "Sinais Biomédicos",
      description: "Processamento e análise de sinais cardiovasculares, neurológicos, respiratórios e outros sinais vitais para diagnóstico e monitoramento.",
      applications: ["ECG", "EEG", "EMG", "Sinais de pressão arterial"]
    },
    {
      icon: Microscope,
      title: "Diagnóstico Médico",
      description: "Ferramentas computacionais para auxílio ao diagnóstico e detecção precoce de doenças, baseadas em análise de imagens e sinais.",
      applications: ["Análise de imagens médicas", "Diagnóstico assistido", "Triagem automática"]
    },
    {
      icon: Zap,
      title: "Processamento de Sinais",
      description: "Técnicas avançadas para filtragem, análise espectral, extração de características e transformadas aplicadas a diversos tipos de sinais.",
      applications: ["Filtragem adaptativa", "Análise tempo-frequência", "Extração de características"]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section - clean professional */}
      <section className="py-24 md:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2 rounded-md border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 font-medium">
              Sobre o LAPS
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight">
              Inovação e Excelência em 
              <span className="text-blue-700 dark:text-blue-400 block mt-2">
                Pesquisa Científica
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Há mais de 15 anos desenvolvendo tecnologias inovadoras que conectam 
              ciência, tecnologia e impacto social através do processamento de sinais 
              e inteligência artificial.
            </p>
          </div>
        </div>
      </section>

      {/* Mission and Vision - professional cards */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-6xl mx-auto">
            <Card className="rounded-lg ios-shadow-lg hover-lift transition-ios border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-700"></div>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center ios-shadow">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  Nossa Missão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Desenvolver soluções tecnológicas inovadoras em processamento de sinais 
                  e inteligência artificial que contribuam para o avanço da ciência e 
                  melhoria da qualidade de vida da sociedade, formando pesquisadores 
                  de alto nível e promovendo a transferência de conhecimento.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg ios-shadow-lg hover-lift transition-ios border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-700"></div>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-lg bg-green-700 flex items-center justify-center ios-shadow">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  Nossa Visão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Ser reconhecido como um centro de excelência em pesquisa e desenvolvimento 
                  de tecnologias de processamento de sinais, mantendo colaborações 
                  internacionais e produzindo conhecimento de impacto mundial na 
                  interface entre engenharia e medicina.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values - professional style */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-16 tracking-tight">
              Nossos Valores
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-700 rounded-lg flex items-center justify-center mx-auto mb-6 ios-shadow">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Excelência</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Buscamos sempre os mais altos padrões de qualidade em pesquisa
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-700 rounded-lg flex items-center justify-center mx-auto mb-6 ios-shadow">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Colaboração</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Acreditamos no poder da colaboração interdisciplinar
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-700 rounded-lg flex items-center justify-center mx-auto mb-6 ios-shadow">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Inovação</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Promovemos soluções criativas para desafios complexos
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-700 rounded-lg flex items-center justify-center mx-auto mb-6 ios-shadow">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Impacto Social</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Focamos em pesquisa que gere benefícios para a sociedade
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Areas - clean professional */}
      <section className="py-24 md:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
              Áreas de Pesquisa
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Nosso laboratório atua em diversas frentes de pesquisa, sempre buscando 
              a integração entre teoria e aplicação prática.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {areas.map((area, index) => (
              <Card key={index} className="rounded-lg ios-shadow-lg hover-lift transition-ios border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center ios-shadow">
                      <area.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{area.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {area.description}
                  </p>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide text-xs">
                      Aplicações
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {area.applications.map((app, appIndex) => (
                        <Badge key={appIndex} variant="outline" className="text-xs px-2 py-1 rounded-md border-gray-300 dark:border-gray-700 font-normal">
                          {app}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline - clean professional */}
      <section className="py-24 md:py-32 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
              Nossa História
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Uma jornada de descobertas e inovações que moldaram nosso laboratório
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start gap-8 mb-12 last:mb-0">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-700 text-white rounded-lg flex items-center justify-center font-bold text-sm ios-shadow">
                    {milestone.year}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location and Contact - clean professional */}
      <section className="py-24 md:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
                Onde Estamos
              </h2>
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center ios-shadow flex-shrink-0">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      Universidade Federal de Uberlândia
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Faculdade de Engenharia Elétrica<br />
                      Campus Santa Mônica<br />
                      Uberlândia - MG, Brasil
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="rounded-lg ios-shadow hover-lift active-press font-medium bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 border-0 px-6 py-5">
                  <Link href="/contato">
                    Entre em Contato
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-lg ios-shadow hover-lift active-press font-medium px-6 py-5 border-gray-300 dark:border-gray-700">
                  <Link href="/equipe">
                    Conheça Nossa Equipe
                  </Link>
                </Button>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
                Em Números
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <Card className="text-center rounded-lg ios-shadow hover-lift transition-ios border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8">
                  <div className="text-4xl font-bold text-blue-700 dark:text-blue-400 mb-3">
                    15+
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Anos de Pesquisa
                  </div>
                </Card>
                
                <Card className="text-center rounded-lg ios-shadow hover-lift transition-ios border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8">
                  <div className="text-4xl font-bold text-green-700 dark:text-green-400 mb-3">
                    50+
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Publicações
                  </div>
                </Card>
                
                <Card className="text-center rounded-lg ios-shadow hover-lift transition-ios border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8">
                  <div className="text-4xl font-bold text-purple-700 dark:text-purple-400 mb-3">
                    20+
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Projetos Ativos
                  </div>
                </Card>
                
                <Card className="text-center rounded-lg ios-shadow hover-lift transition-ios border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8">
                  <div className="text-4xl font-bold text-orange-700 dark:text-orange-400 mb-3">
                    30+
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Pesquisadores
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
