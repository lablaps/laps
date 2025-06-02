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
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Últimas Notícias
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Acompanhe Nossas Novidades
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Fique por dentro das últimas descobertas, publicações, eventos 
            e conquistas do nosso laboratório de pesquisa.
          </p>
        </div>

        {/* Latest News */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {latestNews.map((article, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              {article.image && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      {article.category}
                    </Badge>
                  </div>
                </div>
              )}
              
              <CardHeader>                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.date || article.publishDate.toISOString().split('T')[0])}</span>
                  <span>•</span>
                  <Clock className="h-4 w-4" />
                  <span>{getTimeAgo(article.date || article.publishDate.toISOString().split('T')[0])}</span>
                </div>
                <CardTitle className="text-xl line-clamp-2">{article.title}</CardTitle>
              </CardHeader>
                <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                
                {article.author && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Por: <span className="font-medium">{article.author}</span>
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full">
                  Ler Mais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* News Categories */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <Card className="text-center p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
            <div className="text-2xl mb-2">📰</div>
            <h4 className="font-medium text-sm">Pesquisa</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Descobertas e estudos</p>
          </Card>
          
          <Card className="text-center p-4 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer">
            <div className="text-2xl mb-2">📚</div>
            <h4 className="font-medium text-sm">Publicações</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Artigos e papers</p>
          </Card>
          
          <Card className="text-center p-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-medium text-sm">Eventos</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Conferências e workshops</p>
          </Card>
          
          <Card className="text-center p-4 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors cursor-pointer">
            <div className="text-2xl mb-2">🏆</div>
            <h4 className="font-medium text-sm">Conquistas</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Prêmios e reconhecimentos</p>
          </Card>
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Mantenha-se Atualizado
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Receba as últimas notícias, descobertas e eventos do LAPS 
              diretamente no seu email.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu email"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <Button>
                Inscrever-se
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button asChild size="lg">
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
