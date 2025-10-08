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
    <Card className={`rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-ios hover-lift active-press ${featured ? 'ios-shadow-lg bg-blue-50 dark:bg-blue-950/50' : ''}`}>
      <CardContent className="p-8">
        <div className="flex flex-col items-center text-center">
          <div className={`${featured ? 'w-32 h-32' : 'w-24 h-24'} mb-6 relative`}>
            <Avatar className="w-full h-full ring-4 ring-white dark:ring-gray-800 ios-shadow-md">
              <AvatarImage src={member.image} alt={member.name} className="object-cover" />
              <AvatarFallback className={`text-lg font-bold bg-blue-700 text-white ${featured ? 'text-xl' : ''}`}>
                {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <h3 className={`font-bold ${featured ? 'text-xl md:text-2xl' : 'text-lg'} text-gray-900 dark:text-white mb-3 tracking-tight`}>
            {member.name}
          </h3>
          
          <Badge className={`mb-4 rounded-md px-3 py-1 font-medium ${getRoleColor(member.role ?? "")}`}>
            {getRoleLabel(member.role ?? "")}
          </Badge>
          
          {member.specialization && (
            <div className={`mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 ${featured ? 'w-full' : ''}`}>
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium uppercase tracking-wide">
                Especialização
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {member.specialization}
              </p>
            </div>
          )}
          
          <p className={`text-sm text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 leading-relaxed ${featured ? 'text-base' : ''}`}>
            {member.description}
          </p>
          
          {/* Contact Links */}
          <div className="flex justify-center gap-2">
            {member.email && (
              <Button variant="ghost" size="sm" className="rounded-lg w-9 h-9 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 transition-ios" asChild>
                <a href={`mailto:${member.email}`}>
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            )}
            {member.linkedin && (
              <Button variant="ghost" size="sm" className="rounded-lg w-9 h-9 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 transition-ios" asChild>
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            )}
            {member.lattes && (
              <Button variant="ghost" size="sm" className="rounded-lg w-9 h-9 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 transition-ios" asChild>
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
      {/* Hero Section - professional academic */}
      <section className="py-24 md:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2 rounded-md border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 font-medium">
              Nossa Equipe
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight">
              Pesquisadores de 
              <span className="text-blue-700 dark:text-blue-400 block mt-2">
                Excelência
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
              Conheça os pesquisadores que fazem do LAPS um centro de referência 
              em processamento de sinais e inteligência artificial.
            </p>
          </div>
        </div>
      </section>

      {/* Search - professional academic */}
      <section className="py-8 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar pesquisador..."
                className="pl-12 h-12 rounded-lg border-gray-200 dark:border-gray-700 ios-shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Stats - professional academic */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-700 dark:bg-purple-800 rounded-lg flex items-center justify-center mx-auto mb-4 ios-shadow">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                {director.length}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Diretor</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-700 dark:bg-blue-800 rounded-lg flex items-center justify-center mx-auto mb-4 ios-shadow">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2">
                {doctors.length}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Doutores</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-700 dark:bg-green-800 rounded-lg flex items-center justify-center mx-auto mb-4 ios-shadow">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-700 dark:text-green-400 mb-2">
                {phdStudents.length}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Doutorandos</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-700 dark:bg-orange-800 rounded-lg flex items-center justify-center mx-auto mb-4 ios-shadow">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-400 mb-2">
                {masterStudents.length}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Mestrandos</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-700 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4 ios-shadow">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-700 dark:text-gray-400 mb-2">
                {undergradStudents.length}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Graduandos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Director - professional academic */}
      {director.length > 0 && (
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Direção
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
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

      {/* Doctors - professional academic */}
      {doctors.length > 0 && (
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Doutores
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Pesquisadores seniores com vasta experiência
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {doctors.map((member, index) => (
                <MemberCard key={index} member={member} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PhD Students - professional academic */}
      {phdStudents.length > 0 && (
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Doutorandos
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Pesquisadores em formação avançada
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {phdStudents.map((member, index) => (
                <MemberCard key={index} member={member} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Master Students - professional academic */}
      {masterStudents.length > 0 && (
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Mestrandos
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Estudantes de pós-graduação em desenvolvimento
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {masterStudents.map((member, index) => (
                <MemberCard key={index} member={member} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Undergraduate Students - professional academic */}
      {undergradStudents.length > 0 && (
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Graduandos
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Estudantes de iniciação científica
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {undergradStudents.map((member, index) => (
                <MemberCard key={index} member={member} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Join Our Team - professional academic */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <Card className="rounded-lg ios-shadow-xl border border-gray-200 dark:border-gray-700 bg-blue-700 dark:bg-blue-800 max-w-4xl mx-auto overflow-hidden">
            <CardContent className="p-10 md:p-16 text-center relative z-10">
              <div className="mb-6">
                <div className="w-14 h-14 mx-auto rounded-lg bg-white/10 flex items-center justify-center mb-6">
                  <span className="text-3xl">🎓</span>
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 tracking-tight">
                Junte-se à Nossa Equipe
              </h3>
              <p className="text-base md:text-lg text-blue-50 mb-10 max-w-2xl mx-auto leading-relaxed">
                Estamos sempre em busca de novos talentos para integrar nossa equipe 
                de pesquisa. Confira as oportunidades disponíveis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="h-12 rounded-lg px-8 bg-white text-blue-700 hover:bg-gray-100 font-medium transition-ios hover-lift active-press">
                  Ver Oportunidades
                </Button>
                <Button variant="outline" size="lg" className="h-12 rounded-lg px-8 border-2 border-white text-white hover:bg-white/10 font-medium transition-ios hover-lift active-press">
                  Entre em Contato
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Alumni Section - professional academic */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="w-14 h-14 mx-auto rounded-lg bg-blue-700 dark:bg-blue-800 flex items-center justify-center mb-6 ios-shadow">
                <span className="text-3xl">🎯</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Alumni do LAPS
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Mais de 50 pesquisadores se formaram no LAPS e hoje atuam em 
              universidades, empresas e instituições de pesquisa no Brasil e no exterior.
            </p>
            <Button variant="outline" className="h-12 rounded-lg px-8 font-medium ios-shadow transition-ios hover-lift active-press">
              Conheça Nossos Alumni
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
