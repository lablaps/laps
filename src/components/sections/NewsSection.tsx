"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { news } from "@/data";

export default function NewsSection() {
  // Get latest news (first 3)
  const latestNews = news.slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} meses atrás`;
    return `${Math.floor(diffInDays / 365)} anos atrás`;
  };

  return (
    <section className="py-24 md:py-32 bg-gray-50 dark:from-gray-950">
      <div className="container mx-auto px-6">
        {/* Header - academic professional style */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 px-4 py-2 rounded-lg border-gray-200 dark:border-gray-800 text-blue-700 dark:text-blue-400 font-semibold">
            Últimas Notícias
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
            Acompanhe Nossas Novidades
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed font-normal">
            Fique por dentro das últimas descobertas, publicações, eventos 
            e conquistas do nosso laboratório de pesquisa.
          </p>
        </div>

        {/* Latest News - academic professional style */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {latestNews.map((article, index) => (
            <Card key={index} className="overflow-hidden rounded-lg shadow-sm hover-lift transition-ios border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              {article.image && (
                <div className="relative h-56 overflow-hidden bg-gray-100 dark:from-gray-800">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-1 rounded-lg font-semibold border border-gray-200 dark:border-gray-800 shadow-sm">
                      {article.category}
                    </Badge>
                  </div>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{formatDate(article.date || article.publishDate.toISOString().split('T')[0])}</span>
                  <span>•</span>
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{getTimeAgo(article.date || article.publishDate.toISOString().split('T')[0])}</span>
                </div>
                <CardTitle className="text-2xl line-clamp-2 font-bold leading-tight">{article.title}</CardTitle>
              </CardHeader>
                
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>
                
                {article.author && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium">
                    Por: <span className="font-semibold text-gray-900 dark:text-white">{article.author}</span>
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full rounded-lg shadow-sm active-press transition-ios font-semibold">
                  Ler Mais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* News Categories - academic professional style */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center rounded-lg shadow-sm hover-lift transition-ios border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 cursor-pointer active-press">
            <div className="w-16 h-16 bg-blue-700 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm text-3xl">
              📰
            </div>
            <h4 className="font-bold text-base mb-2 text-gray-900 dark:text-white">Pesquisa</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Descobertas e estudos</p>
          </Card>
          
          <Card className="text-center rounded-lg shadow-sm hover-lift transition-ios border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 cursor-pointer active-press">
            <div className="w-16 h-16 bg-green-700 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm text-3xl">
              📚
            </div>
            <h4 className="font-bold text-base mb-2 text-gray-900 dark:text-white">Publicações</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Artigos e papers</p>
          </Card>
          
          <Card className="text-center rounded-lg shadow-sm hover-lift transition-ios border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 cursor-pointer active-press">
            <div className="w-16 h-16 bg-purple-700 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm text-3xl">
              🎯
            </div>
            <h4 className="font-bold text-base mb-2 text-gray-900 dark:text-white">Eventos</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Conferências e workshops</p>
          </Card>
          
          <Card className="text-center rounded-lg shadow-sm hover-lift transition-ios border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 cursor-pointer active-press">
            <div className="w-16 h-16 bg-orange-700 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm text-3xl">
              🏆
            </div>
            <h4 className="font-bold text-base mb-2 text-gray-900 dark:text-white">Conquistas</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Prêmios e reconhecimentos</p>
          </Card>
        </div>

        {/* Newsletter Signup - academic professional style */}
        <Card className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 bg-blue-50 dark:from-blue-950 mb-16 overflow-hidden">
          <CardContent className="p-10 md:p-12 text-center">
            <div className="w-16 h-16 bg-blue-700 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-sm text-4xl">
              ✉️
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Mantenha-se Atualizado
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Receba as últimas notícias, descobertas e eventos do LAPS 
              diretamente no seu email.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu email"
                className="flex-1 px-6 py-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm font-medium transition-ios focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button className="px-8 py-4 rounded-lg shadow-sm active-press transition-ios font-semibold bg-blue-700 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-800 border-0">
                Inscrever-se
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA - academic professional style */}
        <div className="text-center">
          <Button asChild size="lg" className="text-lg px-10 py-7 rounded-lg shadow-sm hover-lift active-press font-semibold bg-blue-700 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-800 border-0">
            <Link href="/noticias">
              Ver Todas as Notícias
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
