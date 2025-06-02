"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Heart, 
  Microscope, 
  Zap, 
  Target, 
  Users,
  ArrowRight 
} from "lucide-react";
import Link from "next/link";

export default function AboutSection() {
  const areas = [
    {
      icon: Brain,
      title: "Inteligência Artificial",
      description: "Desenvolvimento de algoritmos de machine learning e deep learning para análise de sinais biomédicos.",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
    },
    {
      icon: Heart,
      title: "Sinais Biomédicos",
      description: "Processamento e análise de sinais cardiovasculares, neurológicos e outros sinais vitais.",
      color: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
    },
    {
      icon: Microscope,
      title: "Diagnóstico Médico",
      description: "Ferramentas computacionais para auxílio ao diagnóstico e detecção precoce de doenças.",
      color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
    },
    {
      icon: Zap,
      title: "Processamento de Sinais",
      description: "Técnicas avançadas para filtragem, análise espectral e extração de características.",
      color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Sobre o LAPS
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Inovação em Processamento de Sinais
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            O LAPS é um laboratório de pesquisa dedicado ao desenvolvimento de tecnologias 
            inovadoras em processamento de sinais e inteligência artificial, com foco 
            especial em aplicações biomédicas e diagnóstico auxiliado por computador.
          </p>
        </div>

        {/* Mission and Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-blue-500" />
                Nossa Missão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Desenvolver soluções tecnológicas inovadoras em processamento de sinais 
                e inteligência artificial que contribuam para o avanço da ciência e 
                melhoria da qualidade de vida da sociedade.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-green-500" />
                Nossa Visão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Ser reconhecido como um centro de excelência em pesquisa e desenvolvimento 
                de tecnologias de processamento de sinais, formando pesquisadores de 
                alto nível e produzindo conhecimento de impacto internacional.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Research Areas */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Áreas de Pesquisa
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {areas.map((area, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full ${area.color} flex items-center justify-center mx-auto mb-4`}>
                    <area.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-lg">{area.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {area.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/sobre">
              Saiba Mais Sobre o LAPS
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
