"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Mail, ExternalLink, Users, GraduationCap, Award } from "lucide-react";
import Link from "next/link";
import { members } from "@/data";

export default function TeamSection() {
  // Get the director/chief of the lab
  const director = members.find(member => member.category === 'director');
  
  // Get team statistics
  const doctors = members.filter(member => member.category === 'doctor');
  const phdStudents = members.filter(member => member.category === 'phd_student');
  const masterStudents = members.filter(member => member.category === 'master_student');
  const undergraduates = members.filter(member => member.category === 'undergraduate');

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'director':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'doctor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'phd_student':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'master_student':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'undergraduate':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'director':
        return 'Chefe do Laboratório';
      case 'doctor':
        return 'Doutor';
      case 'phd_student':
        return 'Doutorando';
      case 'master_student':
        return 'Mestrando';
      case 'undergraduate':
        return 'Graduando';
      default:
        return category;
    }
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Nossa Equipe
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Estrutura Hierárquica do LAPS
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            O LAPS é estruturado de forma hierárquica, seguindo os padrões acadêmicos de excelência. 
            Nossa equipe é composta por pesquisadores de diferentes níveis, desde estudantes de graduação 
            até doutores experientes, todos unidos pelo compromisso com a pesquisa de qualidade.
          </p>
        </div>

        {/* Director Section */}
        {director && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Chefe do Laboratório
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Liderança científica e administrativa do LAPS
              </p>
            </div>
            
            <Card className="max-w-2xl mx-auto text-center hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <Avatar className="w-32 h-32 mx-auto mb-6 border-4 border-purple-200">
                  <AvatarImage src={director.image} alt={director.name} />
                  <AvatarFallback className="text-2xl bg-purple-100 text-purple-800">
                    {director.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {director.name}
                </h4>
                
                <Badge variant="secondary" className={`mb-4 text-sm px-4 py-2 ${getCategoryColor(director.category)}`}>
                  <Award className="w-4 h-4 mr-2" />
                  {getCategoryLabel(director.category)}
                </Badge>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {director.title}
                </p>
                
                {director.researchAreas && director.researchAreas.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Áreas de Pesquisa:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {director.researchAreas.map((area, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center gap-3">
                  {director.email && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${director.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        E-mail
                      </a>
                    </Button>
                  )}
                  {director.lattesUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={director.lattesUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Lattes
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Hierarchy Overview */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Composição da Equipe
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {doctors.length}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Doutores
              </div>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-green-600 dark:text-green-300" />
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {phdStudents.length}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Doutorandos
              </div>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600 dark:text-orange-300" />
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {masterStudents.length}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Mestrandos
              </div>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {undergraduates.length}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Graduandos
              </div>
            </Card>
          </div>
        </div>

        {/* Preview of other members */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Alguns de Nossos Pesquisadores
          </h3>          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...doctors.slice(0, 2), ...phdStudents.slice(0, 2)].map((member) => (
              <Card key={member.id} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback className="text-sm">
                      {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {member.name}
                  </h4>
                  
                  <Badge variant="secondary" className={`text-xs mb-2 ${getCategoryColor(member.category)}`}>
                    {getCategoryLabel(member.category)}
                  </Badge>
                  
                  {member.researchAreas && member.researchAreas.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {member.researchAreas.slice(0, 2).join(', ')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="/equipe">
              <Users className="mr-2 h-5 w-5" />
              Conheça Todos os Integrantes
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Veja o perfil completo de cada membro da nossa equipe
          </p>
        </div>
      </div>
    </section>
  );
}
