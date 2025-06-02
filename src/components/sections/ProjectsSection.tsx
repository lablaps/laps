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
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Nossos Projetos
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Pesquisa e Inovação
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Desenvolvemos projetos de pesquisa que aplicam tecnologias avançadas 
            de processamento de sinais e inteligência artificial para resolver 
            problemas reais da sociedade.
          </p>
        </div>

        {/* Featured Projects */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {featuredProjects.map((project, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              {project.image && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className={getStatusColor(project.status)}>
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
                  <Button variant="outline" size="sm" className="flex-1">
                    Saiba Mais
                  </Button>
                  {project.publicationUrl && (
                    <Button variant="ghost" size="sm" asChild>
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

        {/* Project Categories */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-2xl">🧠</div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Inteligência Artificial</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Algoritmos de machine learning e deep learning para análise de dados complexos
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-2xl">🏥</div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Aplicações Médicas</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Ferramentas de diagnóstico e análise de sinais biomédicos
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-2xl">📊</div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Processamento de Sinais</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Técnicas avançadas de análise e filtragem de sinais digitais
            </p>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild size="lg">
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
