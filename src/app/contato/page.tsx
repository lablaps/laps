import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Send,
  User,
  Building,
  MessageSquare,
  Globe,
  Linkedin,
  Twitter
} from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section - professional academic */}
      <section className="py-24 md:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2 rounded-md border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 font-medium">
              Contato
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight">
              Entre em Contato
              <span className="text-blue-700 dark:text-blue-400 block mt-2">
                Conosco
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
              Estamos prontos para responder suas dúvidas, discutir colaborações 
              ou apresentar nosso trabalho. Fale conosco!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info - professional academic */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="rounded-lg ios-shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center ios-shadow">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  Envie uma Mensagem
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Preencha o formulário abaixo e retornaremos o contato em breve.
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo *</Label>
                      <Input id="name" placeholder="Seu nome" required className="h-11 rounded-lg border-gray-200 dark:border-gray-700 ios-shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email *</Label>
                      <Input id="email" type="email" placeholder="seu@email.com" required className="h-11 rounded-lg border-gray-200 dark:border-gray-700 ios-shadow-sm" />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</Label>
                      <Input id="phone" type="tel" placeholder="(34) 99999-9999" className="h-11 rounded-lg border-gray-200 dark:border-gray-700 ios-shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institution" className="text-sm font-medium text-gray-700 dark:text-gray-300">Instituição</Label>
                      <Input id="institution" placeholder="Sua instituição" className="h-11 rounded-lg border-gray-200 dark:border-gray-700 ios-shadow-sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">Assunto *</Label>
                    <Select>
                      <SelectTrigger className="h-11 rounded-lg border-gray-200 dark:border-gray-700 ios-shadow-sm">
                        <SelectValue placeholder="Selecione o assunto" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="collaboration">Colaboração em Pesquisa</SelectItem>
                        <SelectItem value="partnership">Parceria</SelectItem>
                        <SelectItem value="student">Oportunidades para Estudantes</SelectItem>
                        <SelectItem value="publication">Publicações</SelectItem>
                        <SelectItem value="presentation">Apresentação do LAPS</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Descreva sua solicitação, dúvida ou proposta..."
                      rows={5}
                      required 
                      className="rounded-lg border-gray-200 dark:border-gray-700 min-h-[160px] ios-shadow-sm"
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-lg text-base font-medium ios-shadow transition-ios hover-lift active-press" size="lg">
                    <Send className="mr-2 h-5 w-5" />
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Location */}
              <Card className="rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
                    <div className="w-9 h-9 rounded-lg bg-purple-700 flex items-center justify-center ios-shadow">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    Localização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white mb-2">
                        Laboratório de Aquisição e Processamento de Sinais (LAPS)
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Universidade Federal de Uberlândia<br />
                        Faculdade de Engenharia Elétrica<br />
                        Campus Santa Mônica<br />
                        Uberlândia - MG, Brasil<br />
                        CEP: 38400-902
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Details */}
              <Card className="rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
                    <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center ios-shadow">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    Informações de Contato
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center flex-shrink-0 ios-shadow-sm">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-1">Email Principal</p>
                        <a href="mailto:laps@ufu.br" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                          laps@ufu.br
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div className="w-9 h-9 rounded-lg bg-green-700 flex items-center justify-center flex-shrink-0 ios-shadow-sm">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-1">Telefone</p>
                        <a href="tel:+553432394411" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                          +55 (34) 3239-4411
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div className="w-9 h-9 rounded-lg bg-orange-700 flex items-center justify-center flex-shrink-0 ios-shadow-sm">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-1">Horário de Funcionamento</p>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          Segunda a Sexta: 8h às 18h<br />
                          Sábado: 8h às 12h
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
                    <div className="w-9 h-9 rounded-lg bg-orange-700 flex items-center justify-center ios-shadow">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    Redes Sociais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="rounded-2xl h-12 border-2 ios-shadow-sm transition-ios hover-lift active-press" asChild>
                      <a href="#" target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                    <Button variant="outline" className="rounded-2xl h-12 border-2 ios-shadow-sm transition-ios hover-lift active-press" asChild>
                      <a href="#" target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </a>
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
                    Siga-nos nas redes sociais para acompanhar nossas novidades e descobertas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Key Contacts - professional academic */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Contatos Principais
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Para assuntos específicos, entre em contato diretamente com nossos responsáveis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-ios hover-lift active-press">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-700 rounded-lg flex items-center justify-center mx-auto mb-6 ios-shadow">
                  <User className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Prof. Dr. Ewaldo Eder Santana
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4">
                  Diretor do LAPS
                </p>
                <div className="space-y-3 text-sm">
                  <a href="mailto:ewaldo@ufu.br" className="block text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    ewaldo@ufu.br
                  </a>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Colaborações e parcerias institucionais
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-ios hover-lift active-press">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-700 rounded-lg flex items-center justify-center mx-auto mb-6 ios-shadow">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Coordenação de Projetos
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-4">
                  Projetos de Pesquisa
                </p>
                <div className="space-y-3 text-sm">
                  <a href="mailto:projetos@laps.ufu.br" className="block text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    projetos@laps.ufu.br
                  </a>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Informações sobre projetos em andamento
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-ios hover-lift active-press">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-700 rounded-lg flex items-center justify-center mx-auto mb-6 ios-shadow">
                  <User className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Coordenação Acadêmica
                </h3>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-4">
                  Oportunidades para Estudantes
                </p>
                <div className="space-y-3 text-sm">
                  <a href="mailto:academico@laps.ufu.br" className="block text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    academico@laps.ufu.br
                  </a>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Estágios, IC, mestrado e doutorado
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ - professional academic */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Respostas para as dúvidas mais comuns sobre o LAPS
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Como posso colaborar com o LAPS?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Estamos sempre abertos a colaborações em pesquisa, parcerias com empresas 
                  e intercâmbios acadêmicos. Entre em contato conosco através do formulário 
                  acima ou pelo email principal.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Vocês oferecem oportunidades para estudantes?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Sim! Oferecemos oportunidades de iniciação científica, estágios, mestrado 
                  e doutorado. Entre em contato com nossa coordenação acadêmica para mais informações.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Como posso acessar as publicações do LAPS?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Nossas publicações estão disponíveis em nossa seção de notícias e também 
                  podem ser acessadas através dos perfis dos pesquisadores em plataformas 
                  acadêmicas como ResearchGate e Google Scholar.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  O LAPS oferece serviços de consultoria?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Dependendo da demanda e disponibilidade, podemos oferecer consultoria 
                  em áreas relacionadas ao processamento de sinais e inteligência artificial. 
                  Entre em contato para discutir sua necessidade específica.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Map Section - professional academic */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Como Chegar
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Estamos localizados no Campus Santa Mônica da UFU
            </p>
          </div>
          
          <Card className="overflow-hidden rounded-3xl ios-shadow-xl border-0 max-w-5xl mx-auto">
            <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ios-shadow-lg">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 font-medium">
                  Mapa interativo será carregado aqui
                </p>
                <Button variant="outline" className="h-12 rounded-2xl px-8 font-semibold ios-shadow-md transition-ios hover-lift active-press" asChild>
                  <a 
                    href="https://maps.google.com/maps?q=Universidade+Federal+de+Uberlândia+Campus+Santa+Mônica" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Abrir no Google Maps
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
