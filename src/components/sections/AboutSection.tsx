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
      color: "bg-blue-700"
    },
    {
      icon: Heart,
      title: "Sinais Biomédicos",
      description: "Processamento e análise de sinais cardiovasculares, neurológicos e outros sinais vitais.",
      color: "bg-red-700"
    },
    {
      icon: Microscope,
      title: "Diagnóstico Médico",
      description: "Ferramentas computacionais para auxílio ao diagnóstico e detecção precoce de doenças.",
      color: "bg-green-700"
    },
    {
      icon: Zap,
      title: "Processamento de Sinais",
      description: "Técnicas avançadas para filtragem, análise espectral e extração de características.",
      color: "bg-yellow-700"
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        {/* Header - clean and professional */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 px-4 py-2 rounded-md border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 font-medium">
            Sobre o LAPS
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
            Inovação em Processamento de Sinais
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            O LAPS é um laboratório de pesquisa dedicado ao desenvolvimento de tecnologias 
            inovadoras em processamento de sinais e inteligência artificial, com foco 
            especial em aplicações biomédicas e diagnóstico auxiliado por computador.
          </p>
        </div>

        {/* Mission and Vision - professional cards */}
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
                melhoria da qualidade de vida da sociedade.
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
                de tecnologias de processamento de sinais, formando pesquisadores de 
                alto nível e produzindo conhecimento de impacto internacional.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Research Areas - clean professional cards */}
        <div className="mb-20">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16 tracking-tight">
            Áreas de Pesquisa
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {areas.map((area, index) => (
              <Card key={index} className="text-center rounded-lg ios-shadow hover-lift transition-ios border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <div className={`w-16 h-16 rounded-lg ${area.color} flex items-center justify-center mx-auto mb-4 ios-shadow`}>
                    <area.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold">{area.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {area.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA - simple professional button */}
        <div className="text-center">
          <Button asChild size="lg" className="text-base px-8 py-6 rounded-lg ios-shadow hover-lift active-press font-medium bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 border-0">
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
