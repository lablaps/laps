import { publications } from '@/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BookOpen, Award, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Publicações | LAPS - Laboratório de Aquisição e Processamento de Sinais',
  description: 'Artigos científicos, teses e publicações técnicas do LAPS.',
};

export default function PublicationsPage() {
  // Sort publications by year (descending)
  const sortedPublications = [...publications].sort((a, b) => b.year - a.year);

  const getIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-5 w-5" />;
      case 'thesis': return <BookOpen className="h-5 w-5" />;
      case 'patent': return <Award className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'article': return 'Artigo';
      case 'thesis': return 'Tese/Dissertação';
      case 'patent': return 'Patente';
      default: return 'Outro';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Publicações</h1>
          <p className="text-xl text-muted-foreground">
            Produção científica e técnica do laboratório.
          </p>
        </div>

        <div className="space-y-6">
          {sortedPublications.map((pub) => (
            <Card key={pub.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    {getIcon(pub.type)}
                    <span className="text-sm font-medium uppercase tracking-wider">
                      {getLabel(pub.type)} • {pub.year}
                    </span>
                  </div>
                  {pub.doi && (
                    <Badge variant="outline" className="font-mono text-xs">
                      DOI: {pub.doi}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl leading-tight">
                  {pub.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {pub.authors.join(', ')}
                </p>
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-sm font-medium">
                    {pub.journal && <span className="text-primary">{pub.journal}</span>}
                    {pub.conference && <span className="text-primary">{pub.conference}</span>}
                  </div>
                  
                  {pub.url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={pub.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Acessar Publicação
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
