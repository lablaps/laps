"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { projects } from "@/data";

export default function ProjectsSection() {
  // Get featured projects (first 3)
  const featuredProjects = projects.slice(0, 3);

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

  return (
    <section className="py-24 md:py-32 bg-white dark:from-black">
      <div className="container mx-auto px-6">
        {/* Header - academic professional style */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 px-4 py-2 rounded-lg border-gray-200 dark:border-gray-800 text-blue-700 dark:text-blue-400 font-semibold">
            Nossos Projetos
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
            Pesquisa e Inovação
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed font-normal">
            Desenvolvemos projetos de pesquisa que aplicam tecnologias avançadas 
            de processamento de sinais e inteligência artificial para resolver 
            problemas reais da sociedade.
          </p>
        </div>

        {/* Featured Projects - academic professional style */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {featuredProjects.map((project, index) => (
            <Card key={index} className="overflow-hidden rounded-lg shadow-sm hover-lift transition-ios border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              {project.image && (
                <div className="relative h-56 overflow-hidden bg-gray-100 dark:from-gray-800">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <Badge variant="secondary" className={`${getStatusColor(project.status)} px-3 py-1 rounded-lg text-xs font-semibold border-0`}>
                    {getStatusLabel(project.status)}
                  </Badge>
                  {project.category && (
                    <Badge variant="outline" className="px-3 py-1 rounded-lg text-xs font-semibold border-gray-300 dark:border-gray-700">
                      {project.category}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold leading-tight">{project.title}</CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>
                
                {/* Project Details */}
                <div className="space-y-3 mb-6">
                  {project.startDate && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">
                        {new Date(project.startDate).getFullYear()}
                        {project.endDate && ` - ${new Date(project.endDate).getFullYear()}`}
                      </span>
                    </div>
                  )}
                  
                  {project.teamMembers && project.teamMembers.length > 0 && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{project.teamMembers.length} pesquisadores</span>
                    </div>
                  )}
                </div>

                {/* Technologies */}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 3).map((tech, techIndex) => (
                        <Badge key={techIndex} variant="outline" className="text-xs px-2 py-1 rounded-lg border-gray-300 dark:border-gray-700 font-medium">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-1 rounded-lg border-gray-300 dark:border-gray-700 font-medium">
                          +{project.technologies.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg shadow-sm active-press transition-ios font-semibold">
                    Saiba Mais
                  </Button>
                  {project.publicationUrl && (
                    <Button variant="ghost" size="sm" className="w-10 h-10 rounded-lg active-press transition-ios" asChild>
                      <a href={project.publicationUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Project Categories - academic professional style */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center rounded-lg shadow-sm hover-lift transition-ios border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
            <div className="w-16 h-16 bg-blue-700 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-sm text-4xl">
              🧠
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">Inteligência Artificial</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Algoritmos de machine learning e deep learning para análise de dados complexos
            </p>
          </Card>
          
          <Card className="text-center rounded-lg shadow-sm hover-lift transition-ios border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
            <div className="w-16 h-16 bg-green-700 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-sm text-4xl">
              🏥
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">Aplicações Médicas</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Ferramentas de diagnóstico e análise de sinais biomédicos
            </p>
          </Card>
          
          <Card className="text-center rounded-lg shadow-sm hover-lift transition-ios border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
            <div className="w-16 h-16 bg-purple-700 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-sm text-4xl">
              📊
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">Processamento de Sinais</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Técnicas avançadas de análise e filtragem de sinais digitais
            </p>
          </Card>
        </div>

        {/* CTA - academic professional style */}
        <div className="text-center">
          <Button asChild size="lg" className="text-lg px-10 py-7 rounded-lg shadow-sm hover-lift active-press font-semibold bg-blue-700 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-800 border-0">
            <Link href="/projetos">
              Ver Todos os Projetos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
