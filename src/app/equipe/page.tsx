import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Mail, 
  Linkedin, 
  ExternalLink,
  GraduationCap,
  Award,
  BookOpen,
  User
} from "lucide-react";
import { members } from "@/data";

export default function TeamPage() {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'director':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'doctor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'phd_student':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'master_student':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'undergrad_student':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'director':
        return 'Diretor';
      case 'doctor':
        return 'Doutor';
      case 'phd_student':
        return 'Doutorando';
      case 'master_student':
        return 'Mestrando';
      case 'undergrad_student':
        return 'Graduando';
      default:
        return role;
    }
  };


  // Organize members by role
  const director = members.filter(member => member.role === 'director');
  const doctors = members.filter(member => member.role === 'doctor');
  const phdStudents = members.filter(member => member.role === 'phd_student');
  const masterStudents = members.filter(member => member.role === 'master_student');
  const undergradStudents = members.filter(member => member.role === 'undergrad_student');

  type Member = {
    name: string;
    role?: string;
    image?: string;
    specialization?: string;
    description?: string;
    email?: string;
    linkedin?: string;
    lattes?: string;
  };

  const MemberCard = ({ member, featured = false }: { member: Member; featured?: boolean }) => (
    <Card className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${featured ? 'border-2 border-blue-200 dark:border-blue-800' : ''}`}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className={`${featured ? 'w-32 h-32' : 'w-24 h-24'} mb-4`}>
            <AvatarImage src={member.image} alt={member.name} />
            <AvatarFallback className="text-lg">
              {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <h3 className={`font-semibold ${featured ? 'text-xl' : 'text-lg'} text-gray-900 dark:text-white mb-2`}>
            {member.name}
          </h3>
          
          <Badge variant="secondary" className={`mb-3 ${getRoleColor(member.role ?? "")}`}>
            {getRoleLabel(member.role ?? "")}
          </Badge>
          
          {member.specialization && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Especialização:
              </p>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {member.specialization}
              </p>
            </div>
          )}
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {member.description}
          </p>
          
          {/* Contact Links */}
          <div className="flex justify-center gap-2">
            {member.email && (
              <Button variant="ghost" size="sm" asChild>
                <a href={`mailto:${member.email}`}>
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            )}
            {member.linkedin && (
              <Button variant="ghost" size="sm" asChild>
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            )}
            {member.lattes && (
              <Button variant="ghost" size="sm" asChild>
                <a href={member.lattes} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6">
              Nossa Equipe
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Pesquisadores de 
              <span className="text-blue-600 dark:text-blue-400 block">
                Excelência
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Conheça os pesquisadores que fazem do LAPS um centro de referência 
              em processamento de sinais e inteligência artificial.
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar pesquisador..."
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Stats */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {director.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Diretor</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {doctors.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Doutores</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {phdStudents.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Doutorandos</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {masterStudents.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Mestrandos</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-1">
                {undergradStudents.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Graduandos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Director */}
      {director.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Direção
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Liderança acadêmica e científica do laboratório
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              {director.map((member, index) => (
                <MemberCard key={index} member={member} featured={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Doctors */}
      {doctors.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Doutores
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Pesquisadores seniores com vasta experiência
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.map((member, index) => (
                <MemberCard key={index} member={member} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PhD Students */}
      {phdStudents.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Doutorandos
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Pesquisadores em formação avançada
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {phdStudents.map((member, index) => (
                <MemberCard key={index} member={member} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Master Students */}
      {masterStudents.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Mestrandos
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Estudantes de pós-graduação em desenvolvimento
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {masterStudents.map((member, index) => (
                <MemberCard key={index} member={member} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Undergraduate Students */}
      {undergradStudents.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Graduandos
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Estudantes de iniciação científica
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {undergradStudents.map((member, index) => (
                <MemberCard key={index} member={member} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Join Our Team */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Junte-se à Nossa Equipe
              </h3>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Estamos sempre em busca de novos talentos para integrar nossa equipe 
                de pesquisa. Confira as oportunidades disponíveis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  Ver Oportunidades
                </Button>
                <Button variant="outline" size="lg">
                  Entre em Contato
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Alumni Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Alumni do LAPS
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Mais de 50 pesquisadores se formaram no LAPS e hoje atuam em 
            universidades, empresas e instituições de pesquisa no Brasil e no exterior.
          </p>
          <Button variant="outline">
            Conheça Nossos Alumni
          </Button>
        </div>
      </section>
    </div>
  );
}
