import { projects } from '@/data';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, Users, Target, FlaskConical, CheckCircle } from 'lucide-react';

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/projetos" className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Projetos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{project.category}</Badge>
              <Badge variant={project.status === 'active' ? 'default' : 'outline'}>
                {project.status === 'active' ? 'Em Andamento' : 'Concluído'}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
            <p className="text-xl text-muted-foreground">{project.description}</p>
          </div>

          {project.fullDescription && (
            <div className="prose max-w-none dark:prose-invert">
              <h3 className="text-2xl font-semibold mb-4">Sobre o Projeto</h3>
              <p>{project.fullDescription}</p>
            </div>
          )}

          {project.objectives && (
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <div className="flex items-center mb-4">
                <Target className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-xl font-semibold">Objetivos</h3>
              </div>
              <p>{project.objectives}</p>
            </div>
          )}

          {project.methodology && (
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <div className="flex items-center mb-4">
                <FlaskConical className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-xl font-semibold">Metodologia</h3>
              </div>
              <p>{project.methodology}</p>
            </div>
          )}

          {project.results && (
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-xl font-semibold">Resultados Esperados/Obtidos</h3>
              </div>
              <p>{project.results}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Informações do Projeto</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">Início</p>
                  <p className="text-sm text-muted-foreground">
                    {project.startDate.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">Pesquisadores</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {project.researchers.map((researcher, index) => (
                      <li key={index}>{researcher}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {project.fundingAgency && (
                <div className="pt-4 border-t border-muted-foreground/20">
                  <p className="text-sm font-medium text-muted-foreground">Agência de Fomento</p>
                  <p className="font-semibold">{project.fundingAgency}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, index) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
