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
    <section className="py-24 md:py-32 bg-gray-50 dark:from-gray-950">
      <div className="container mx-auto px-6">
        {/* Header - academic professional style */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 px-4 py-2 rounded-lg border-gray-200 dark:border-gray-800 text-blue-700 dark:text-blue-400 font-semibold">
            Nossa Equipe
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
            Estrutura Hierárquica do LAPS
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed font-normal">
            O LAPS é estruturado de forma hierárquica, seguindo os padrões acadêmicos de excelência. 
            Nossa equipe é composta por pesquisadores de diferentes níveis, desde estudantes de graduação 
            até doutores experientes, todos unidos pelo compromisso com a pesquisa de qualidade.
          </p>
        </div>

        {/* Director Section with iOS-style */}
        {director && (
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                Chefe do Laboratório
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-normal">
                Liderança científica e administrativa do LAPS
              </p>
            </div>
            
            <Card className="max-w-3xl mx-auto text-center rounded-lg shadow-sm hover-lift transition-ios border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-700"></div>
              <CardContent className="p-10">
                <Avatar className="w-36 h-36 mx-auto mb-6 border-4 border-blue-100 dark:border-blue-900 shadow-sm">
                  <AvatarImage src={director.image} alt={director.name} />
                  <AvatarFallback className="text-3xl bg-blue-700 text-white font-bold">
                    {director.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {director.name}
                </h4>
                
                <Badge variant="secondary" className="mb-6 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-50 dark:from-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <Award className="w-4 h-4 mr-2" />
                  {getCategoryLabel(director.category)}
                </Badge>
                
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
                  {director.title}
                </p>
                
                {director.researchAreas && director.researchAreas.length > 0 && (
                  <div className="mb-8">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                      Áreas de Pesquisa
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {director.researchAreas.map((area, index) => (
                        <Badge key={index} variant="outline" className="text-sm px-3 py-1 rounded-lg border-gray-300 dark:border-gray-700">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center gap-3">
                  {director.email && (
                    <Button variant="outline" size="sm" className="rounded-lg shadow-sm active-press transition-ios px-6 py-5 font-semibold" asChild>
                      <a href={`mailto:${director.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        E-mail
                      </a>
                    </Button>
                  )}
                  {director.lattesUrl && (
                    <Button variant="outline" size="sm" className="rounded-lg shadow-sm active-press transition-ios px-6 py-5 font-semibold" asChild>
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

        {/* Hierarchy Overview - academic professional style */}
        <div className="mb-20">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12 tracking-tight">
            Composição da Equipe
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="text-center p-8 rounded-lg shadow-sm hover-lift transition-ios border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="w-16 h-16 bg-blue-700 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <div className="text-4xl font-bold text-blue-700 dark:text-blue-400 mb-2">
                {doctors.length}
              </div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Doutores
              </div>
            </Card>
            
            <Card className="text-center p-8 rounded-lg shadow-sm hover-lift transition-ios border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="w-16 h-16 bg-green-700 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <div className="text-4xl font-bold text-green-700 dark:text-green-400 mb-2">
                {phdStudents.length}
              </div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Doutorandos
              </div>
            </Card>
            
            <Card className="text-center p-8 rounded-lg shadow-sm hover-lift transition-ios border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="w-16 h-16 bg-orange-700 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Users className="h-10 w-10 text-white" />
              </div>
              <div className="text-4xl font-bold text-orange-700 dark:text-orange-400 mb-2">
                {masterStudents.length}
              </div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Mestrandos
              </div>
            </Card>
            
            <Card className="text-center p-8 rounded-lg shadow-sm hover-lift transition-ios border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="w-16 h-16 bg-purple-700 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Users className="h-10 w-10 text-white" />
              </div>
              <div className="text-4xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                {undergraduates.length}
              </div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Graduandos
              </div>
            </Card>
          </div>
        </div>

        {/* Preview of other members with iOS-style */}
        <div className="mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12 tracking-tight">
            Alguns de Nossos Pesquisadores
          </h3>          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...doctors.slice(0, 2), ...phdStudents.slice(0, 2)].map((member) => (
              <Card key={member.id} className="text-center rounded-3xl ios-shadow-md hover-lift transition-ios border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <Avatar className="w-20 h-20 mx-auto mb-4 ios-shadow">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback className="text-base bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                      {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h4 className="font-bold text-base text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {member.name}
                  </h4>
                  
                  <Badge variant="secondary" className={`text-xs mb-3 px-3 py-1 rounded-full font-semibold ${getCategoryColor(member.category)}`}>
                    {getCategoryLabel(member.category)}
                  </Badge>
                  
                  {member.researchAreas && member.researchAreas.length > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {member.researchAreas.slice(0, 2).join(', ')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA with iOS-style */}
        <div className="text-center">
          <Button asChild size="lg" className="text-lg px-10 py-7 rounded-2xl ios-shadow-md hover-lift active-press font-semibold bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 border-0">
            <Link href="/equipe">
              <Users className="mr-2 h-5 w-5" />
              Conheça Todos os Integrantes
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-4 font-normal">
            Veja o perfil completo de cada membro da nossa equipe
          </p>
        </div>
      </div>
    </section>
  );
}
