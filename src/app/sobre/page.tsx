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
  BookOpen,
  Calendar,
  MapPin
} from "lucide-react";
import Image from "next/image";
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
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6">
              Sobre o LAPS
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Inovação e Excelência em 
              <span className="text-blue-600 dark:text-blue-400 block">
                Pesquisa Científica
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Há mais de 15 anos desenvolvendo tecnologias inovadoras que conectam 
              ciência, tecnologia e impacto social através do processamento de sinais 
              e inteligência artificial.
            </p>
          </div>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Target className="h-8 w-8 text-blue-500" />
                  Nossa Missão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  Desenvolver soluções tecnológicas inovadoras em processamento de sinais 
                  e inteligência artificial que contribuam para o avanço da ciência e 
                  melhoria da qualidade de vida da sociedade, formando pesquisadores 
                  de alto nível e promovendo a transferência de conhecimento.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Users className="h-8 w-8 text-green-500" />
                  Nossa Visão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  Ser reconhecido como um centro de excelência em pesquisa e desenvolvimento 
                  de tecnologias de processamento de sinais, mantendo colaborações 
                  internacionais e produzindo conhecimento de impacto mundial na 
                  interface entre engenharia e medicina.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
              Nossos Valores
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Excelência</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Buscamos sempre os mais altos padrões de qualidade em pesquisa
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Colaboração</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Acreditamos no poder da colaboração interdisciplinar
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Inovação</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Promovemos soluções criativas para desafios complexos
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Impacto Social</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Focamos em pesquisa que gere benefícios para a sociedade
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Areas */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Áreas de Pesquisa
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Nosso laboratório atua em diversas frentes de pesquisa, sempre buscando 
              a integração entre teoria e aplicação prática.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {areas.map((area, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <area.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{area.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {area.description}
                  </p>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Aplicações:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {area.applications.map((app, appIndex) => (
                        <Badge key={appIndex} variant="outline" className="text-xs">
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

      {/* Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Nossa História
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Uma jornada de descobertas e inovações que moldaram nosso laboratório
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start gap-8 mb-12 last:mb-0">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {milestone.year}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location and Contact */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Onde Estamos
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Universidade Federal de Uberlândia
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Faculdade de Engenharia Elétrica<br />
                      Campus Santa Mônica<br />
                      Uberlândia - MG, Brasil
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button asChild>
                  <Link href="/contato">
                    Entre em Contato
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/equipe">
                    Conheça Nossa Equipe
                  </Link>
                </Button>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Em Números
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    15+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Anos de Pesquisa
                  </div>
                </div>
                
                <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    50+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Publicações
                  </div>
                </div>
                
                <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    20+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Projetos Ativos
                  </div>
                </div>
                
                <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                    30+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Pesquisadores
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
