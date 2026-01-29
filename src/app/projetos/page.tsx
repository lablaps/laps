import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  Brain,
  Heart,
  Microscope,
  Zap,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'planning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Ativo';
    case 'completed':
      return 'Concluído';
    case 'planning':
      return 'Planejamento';
    default:
      return status;
  }
};

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'IA': Brain,
    'Biomédico': Heart,
    'Diagnóstico': Microscope,
  };
  return iconMap[category] || Zap;
};

const categories = [...new Set(projects.map(p => p.category))];
const activeProjects = projects.filter(p => p.status === 'active');

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Pesquisa e Inovação em 
              <span className="text-blue-600 dark:text-blue-400 block">
                Processamento de Sinais
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Desenvolvemos projetos de pesquisa que aplicam tecnologias avançadas 
              para resolver problemas reais e gerar impacto positivo na sociedade.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <Badge variant="secondary" className="mb-4">
              Projetos em Destaque
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Projetos Ativos
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Conheça os projetos de pesquisa que estão em desenvolvimento no LAPS
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {activeProjects.slice(0, 3).map((project, index) => (
              <Link key={index} href={`/projetos/${project.slug}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full">
                  {project.image && (
                    <div className="relative h-48 overflow-hidden bg-gray-200">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex gap-2 mb-3">
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                      {project.category && (
                        <Badge variant="outline">
                          {project.category}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm">
                      {project.description}
                    </p>
                    
                    <div className="space-y-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
                      {project.startDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(project.startDate).getFullYear()}</span>
                        </div>
                      )}
                      {project.teamMembers && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{project.teamMembers.length} pesquisadores</span>
                        </div>
                      )}
                    </div>

                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologies.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Projects */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Todos os Projetos
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Explore todo o portfólio de projetos de pesquisa do LAPS
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <Link key={index} href={`/projetos/${project.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <div className="flex h-full">
                    {project.image && (
                      <div className="relative w-40 h-40 flex-shrink-0 overflow-hidden bg-gray-200">
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex gap-2 mb-3">
                          <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                            {getStatusLabel(project.status)}
                          </Badge>
                          {project.category && (
                            <Badge variant="outline" className="text-xs">
                              {project.category}
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {project.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                          {project.description}
                        </p>
                        
                        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                          {project.startDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(project.startDate).getFullYear()}
                            </div>
                          )}
                          {project.teamMembers && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {project.teamMembers.length}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="flex-1">
                          Ver Detalhes
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Research Areas */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Áreas de Pesquisa
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Nossos projetos abrangem diversas áreas de conhecimento
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = getCategoryIcon(category);
              const count = projects.filter(p => p.category === category).length;
              
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{category}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {count} {count === 1 ? 'projeto' : 'projetos'}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Interessado em Colaborar?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Estamos sempre abertos a novas parcerias e colaborações em pesquisa. 
            Entre em contato para discutir oportunidades.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/contato">
                Entre em Contato
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sobre">
                Conheça o LAPS
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
