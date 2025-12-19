import { news } from '@/data';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';

interface NewsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return news.map((item) => ({
    slug: item.slug,
  }));
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { slug } = await params;
  const newsItem = news.find((n) => n.slug === slug);

  if (!newsItem) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/noticias" className="inline-flex items-center text-primary hover:underline mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Notícias
      </Link>

      <article>
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>{newsItem.category}</Badge>
            {newsItem.featured && <Badge variant="secondary">Destaque</Badge>}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{newsItem.title}</h1>
          
          <div className="flex items-center text-muted-foreground space-x-6 border-b pb-8 mb-8">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{newsItem.publishDate.toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>{newsItem.author}</span>
            </div>
          </div>
        </div>

        {newsItem.image && (
          <div className="relative w-full h-[400px] mb-10 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={newsItem.image}
              alt={newsItem.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <p className="lead text-xl text-muted-foreground mb-8 font-medium">
            {newsItem.excerpt}
          </p>
          <div className="whitespace-pre-wrap">
            {newsItem.content}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold mr-2">Tags:</span>
            <div className="flex flex-wrap gap-2">
              {newsItem.tags.map((tag, index) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>

        {newsItem.externalUrl && (
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Esta notícia foi publicada originalmente em uma fonte externa.
            </p>
            <a 
              href={newsItem.externalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Ler na fonte original &rarr;
            </a>
          </div>
        )}
      </article>
    </div>
  );
}
