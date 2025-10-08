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
      {/* Hero Section - clean professional */}
      <section className="py-24 md:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2 rounded-md border-gray-300 dark:border-gray-700 text-blue-700 dark:text-blue-400 font-medium">
              Notícias
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight">
              Últimas Notícias e 
              <span className="text-blue-700 dark:text-blue-400 block mt-2">
                Descobertas do LAPS
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Acompanhe as novidades, descobertas científicas, publicações e eventos 
              do nosso laboratório de pesquisa.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters with iOS-style */}
      <section className="py-8 bg-gradient-to-b from-white via-gray-50 to-white dark:from-black dark:via-gray-950 dark:to-black">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-6xl mx-auto">
            <div className="flex gap-4 items-center flex-1 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar notícias..."
                  className="pl-12 h-12 rounded-2xl border-gray-200 dark:border-gray-800 ios-shadow-sm"
                />
              </div>
              <Select>
                <SelectTrigger className="w-[180px] h-12 rounded-2xl border-gray-200 dark:border-gray-800">
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

      {/* Featured Article - clean professional */}
      {featuredArticle && (
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="mb-10 max-w-6xl mx-auto">
              <Badge className="mb-4 px-3 py-1.5 rounded-md bg-blue-700 text-white font-medium">
                ⭐ Destaque
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Artigo em Destaque
              </h2>
            </div>
            
            <Card className="overflow-hidden rounded-lg ios-shadow-xl border border-gray-200 dark:border-gray-700 max-w-6xl mx-auto bg-white dark:bg-gray-800 transition-ios hover-lift active-press">
              <div className="grid lg:grid-cols-2 gap-0">
                {featuredArticle.image && (
                  <div className="relative h-80 lg:h-auto">
                    <Image
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md px-3 py-1.5 font-medium border border-gray-200 dark:border-gray-700">
                        {featuredArticle.category}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <div className="p-8 lg:p-12">
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(featuredArticle.date || featuredArticle.publishDate.toISOString().split('T')[0])}</span>
                    </div>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{getTimeAgo(featuredArticle.date || featuredArticle.publishDate.toISOString().split('T')[0])}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                  
                  {featuredArticle.author && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span>Por: <span className="font-semibold text-gray-900 dark:text-white">{featuredArticle.author}</span></span>
                    </div>
                  )}
                  
                  <Button size="lg" className="rounded-2xl px-8 h-14 text-base font-semibold ios-shadow-md hover-lift active-press">
                    Ler Artigo Completo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* All Articles with iOS-style */}
      <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-black dark:to-gray-950">
        <div className="container mx-auto px-6">
          <div className="mb-12 max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Todas as Notícias
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Explore todas as novidades e descobertas do nosso laboratório
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {otherArticles.map((article, index) => (
              <Card key={index} className="overflow-hidden rounded-lg ios-shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-ios hover-lift active-press">
                {article.image && (
                  <div className="relative h-56">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md px-2 py-1 text-xs font-medium border border-gray-200 dark:border-gray-700">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(article.date || article.publishDate.toISOString().split('T')[0])}</span>
                    </div>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{getTimeAgo(article.date || article.publishDate.toISOString().split('T')[0])}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold line-clamp-2 text-gray-900 dark:text-white leading-tight">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 text-sm leading-relaxed">
                    {article.excerpt}
                  </p>
                  
                  {article.author && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs">
                        {article.author[0]}
                      </div>
                      <span>Por: <span className="font-semibold text-gray-900 dark:text-white">{article.author}</span></span>
                    </div>
                  )}

                  <Button variant="outline" className="w-full rounded-2xl h-12 font-semibold ios-shadow-sm transition-ios hover-lift active-press">
                    Ler Mais
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More with iOS-style */}
          <div className="text-center mt-16">
            <Button variant="outline" size="lg" className="rounded-2xl px-10 h-14 text-base font-semibold ios-shadow-md hover-lift active-press">
              Carregar Mais Artigos
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter - clean professional */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <Card className="rounded-lg ios-shadow-xl border border-gray-200 dark:border-gray-700 bg-blue-700 dark:bg-blue-800 max-w-4xl mx-auto overflow-hidden">
            <CardContent className="p-10 md:p-16 text-center relative z-10">
              <div className="mb-6">
                <div className="w-14 h-14 mx-auto rounded-lg bg-white/10 flex items-center justify-center mb-6">
                  <span className="text-3xl">📬</span>
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
                Não Perca Nenhuma Novidade
              </h3>
              <p className="text-base md:text-lg text-blue-50 mb-10 max-w-2xl mx-auto leading-relaxed">
                Receba as últimas notícias, descobertas e eventos do LAPS 
                diretamente no seu email. Seja o primeiro a saber das nossas novidades!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  className="flex-1 h-12 rounded-lg border-0 bg-white dark:bg-white text-gray-900 placeholder:text-gray-500"
                />
                <Button size="lg" className="h-12 rounded-lg px-8 bg-white text-blue-700 hover:bg-gray-100 font-medium transition-ios hover-lift active-press">
                  Inscrever-se
                </Button>
              </div>
              <p className="text-sm text-blue-100 mt-6">
                Sem spam. Você pode cancelar a qualquer momento.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Categories Overview - professional academic */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Explore por Categoria
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Encontre notícias específicas sobre suas áreas de interesse
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="text-center p-8 rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-ios hover-lift active-press cursor-pointer">
              <div className="text-4xl mb-4">📰</div>
              <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Pesquisa</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                Descobertas e avanços científicos
              </p>
              <Badge className="rounded-md px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                {news.filter(n => n.category === 'Pesquisa').length} artigos
              </Badge>
            </Card>
            
            <Card className="text-center p-8 rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-ios hover-lift active-press cursor-pointer">
              <div className="text-4xl mb-4">📚</div>
              <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Publicações</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                Artigos e papers publicados
              </p>
              <Badge className="rounded-md px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-medium">
                {news.filter(n => n.category === 'Publicação').length} artigos
              </Badge>
            </Card>
            
            <Card className="text-center p-8 rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-ios hover-lift active-press cursor-pointer">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Eventos</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                Conferências e workshops
              </p>
              <Badge className="rounded-md px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium">
                {news.filter(n => n.category === 'Evento').length} artigos
              </Badge>
            </Card>
            
            <Card className="text-center p-8 rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-ios hover-lift active-press cursor-pointer">
              <div className="text-4xl mb-4">🏆</div>
              <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Conquistas</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                Prêmios e reconhecimentos
              </p>
              <Badge className="rounded-md px-3 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 font-medium">
                {news.filter(n => n.category === 'Conquista').length} artigos
              </Badge>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
