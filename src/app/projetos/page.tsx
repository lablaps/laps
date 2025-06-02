import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Users, 
  ExternalLink, 
  Search, 
  Brain,
  Heart,
  Microscope,  Zap,
  ArrowRight,
  FileText
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data";

export default function ProjectsPage() {
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
    switch (category) {
      case 'IA':
        return Brain;
      case 'Biomédico':
        return Heart;
      case 'Diagnóstico':
        return Microscope;
      default:
        return Zap;
    }
  };

  // Get featured projects (active ones)
  const featuredProjects = projects.filter(p => p.status === 'active').slice(0, 3);
  
  // Get all projects organized by category
  const categories = [...new Set(projects.map(p => p.category))];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6">
              Nossos Projetos
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Pesquisa e Inovação em 
              <span className="text-blue-600 dark:text-blue-400 block">
                Processamento de Sinais
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Desenvolvemos projetos de pesquisa que aplicam tecnologias avançadas 
              para resolver problemas reais e gerar impacto positivo na sociedade.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar projetos..."
                  className="pl-10"
                />
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="planning">Planejamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {projects.length} projetos encontrados
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16">
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

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {featuredProjects.map((project, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                {project.image && (
                  <div className="relative h-48">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge variant="secondary" className={getStatusColor(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                      {project.category && (
                        <Badge variant="outline" className="bg-white/90 text-gray-900">
                          {project.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  
                  {/* Project Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    {project.startDate && (
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(project.startDate).getFullYear()}
                          {project.endDate && ` - ${new Date(project.endDate).getFullYear()}`}
                        </span>
                      </div>
                    )}
                    
                    {project.teamMembers && project.teamMembers.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>{project.teamMembers.length} pesquisadores</span>
                      </div>
                    )}
                  </div>

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologies.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Ver Detalhes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    {project.publicationUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={project.publicationUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Projects */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Todos os Projetos
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Explore todo o portfólio de projetos de pesquisa do LAPS
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <div className="flex">
                  {project.image && (
                    <div className="relative w-48 h-32 flex-shrink-0">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover rounded-l-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2">
                        <Badge variant="secondary" className={getStatusColor(project.status)}>
                          {getStatusLabel(project.status)}
                        </Badge>
                        {project.category && (
                          <Badge variant="outline">
                            {project.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {project.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    
                    {/* Quick Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {project.startDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(project.startDate).getFullYear()}</span>
                        </div>
                      )}
                      {project.teamMembers && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{project.teamMembers.length}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Technologies */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.technologies.slice(0, 2).map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologies.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Ver Mais
                      </Button>
                      {project.publicationUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={project.publicationUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Research Areas */}
      <section className="py-16">
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
              const categoryProjects = projects.filter(p => p.category === category);
              
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{category}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {categoryProjects.length} projetos ativos
                  </p>
                  <Button variant="outline" size="sm">
                    Explorar
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Interessado em Colaborar?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
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
