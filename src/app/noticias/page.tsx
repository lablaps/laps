import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Search, User, ArrowRight } from "lucide-react";
import Image from "next/image";
import { news } from "@/data";

export default function NewsPage() {
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

  // Get featured article (most recent)
  const featuredArticle = news[0];
  
  // Get remaining articles
  const otherArticles = news.slice(1);

  const categories = [...new Set(news.map(article => article.category))];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6">
              Notícias
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Últimas Notícias e 
              <span className="text-blue-600 dark:text-blue-400 block">
                Descobertas do LAPS
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Acompanhe as novidades, descobertas científicas, publicações e eventos 
              do nosso laboratório de pesquisa.
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
                  placeholder="Buscar notícias..."
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
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {news.length} artigos encontrados
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4">
                Destaque
              </Badge>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Artigo em Destaque
              </h2>
            </div>
            
            <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="grid lg:grid-cols-2 gap-0">
                {featuredArticle.image && (
                  <div className="relative h-64 lg:h-auto">
                    <Image
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-900">
                        {featuredArticle.category}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <div className="p-8 lg:p-12">                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(featuredArticle.date || featuredArticle.publishDate.toISOString().split('T')[0])}</span>
                    <span>•</span>
                    <Clock className="h-4 w-4" />
                    <span>{getTimeAgo(featuredArticle.date || featuredArticle.publishDate.toISOString().split('T')[0])}</span>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {featuredArticle.title}
                  </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    {featuredArticle.excerpt}
                  </p>
                  
                  {featuredArticle.author && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                      <User className="h-4 w-4" />
                      <span>Por: <span className="font-medium">{featuredArticle.author}</span></span>
                    </div>
                  )}
                  
                  <Button size="lg">
                    Ler Artigo Completo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Todas as Notícias
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Explore todas as novidades e descobertas do nosso laboratório
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {otherArticles.map((article, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {article.image && (
                  <div className="relative h-48">
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
                
                <CardHeader>                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.date || article.publishDate.toISOString().split('T')[0])}</span>
                    <span>•</span>
                    <Clock className="h-4 w-4" />
                    <span>{getTimeAgo(article.date || article.publishDate.toISOString().split('T')[0])}</span>
                  </div>
                  <CardTitle className="text-xl line-clamp-2">{article.title}</CardTitle>
                </CardHeader>
                
                <CardContent>                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
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

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Carregar Mais Artigos
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Não Perca Nenhuma Novidade
              </h3>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Receba as últimas notícias, descobertas e eventos do LAPS 
                diretamente no seu email. Seja o primeiro a saber das nossas novidades!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  className="flex-1"
                />
                <Button size="lg">
                  Inscrever-se
                </Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Sem spam. Você pode cancelar a qualquer momento.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Categories Overview */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Explore por Categoria
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Encontre notícias específicas sobre suas áreas de interesse
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
              <div className="text-4xl mb-4">📰</div>
              <h4 className="font-semibold text-lg mb-2">Pesquisa</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Descobertas e avanços científicos
              </p>
              <Badge variant="outline">
                {news.filter(n => n.category === 'Pesquisa').length} artigos
              </Badge>
            </Card>
            
            <Card className="text-center p-6 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer">
              <div className="text-4xl mb-4">📚</div>
              <h4 className="font-semibold text-lg mb-2">Publicações</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Artigos e papers publicados
              </p>
              <Badge variant="outline">
                {news.filter(n => n.category === 'Publicação').length} artigos
              </Badge>
            </Card>
            
            <Card className="text-center p-6 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="font-semibold text-lg mb-2">Eventos</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Conferências e workshops
              </p>
              <Badge variant="outline">
                {news.filter(n => n.category === 'Evento').length} artigos
              </Badge>
            </Card>
            
            <Card className="text-center p-6 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors cursor-pointer">
              <div className="text-4xl mb-4">🏆</div>
              <h4 className="font-semibold text-lg mb-2">Conquistas</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Prêmios e reconhecimentos
              </p>
              <Badge variant="outline">
                {news.filter(n => n.category === 'Conquista').length} artigos
              </Badge>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
