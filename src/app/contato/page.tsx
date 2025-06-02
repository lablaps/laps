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
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6">
              Contato
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Entre em Contato
              <span className="text-blue-600 dark:text-blue-400 block">
                Conosco
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Estamos prontos para responder suas dúvidas, discutir colaborações 
              ou apresentar nosso trabalho. Fale conosco!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Envie uma Mensagem
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Preencha o formulário abaixo e retornaremos o contato em breve.
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input id="name" placeholder="Seu nome" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="seu@email.com" required />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input id="phone" type="tel" placeholder="(34) 99999-9999" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institution">Instituição</Label>
                      <Input id="institution" placeholder="Sua instituição" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o assunto" />
                      </SelectTrigger>
                      <SelectContent>
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
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <Send className="mr-2 h-5 w-5" />
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Localização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Laboratório de Aquisição e Processamento de Sinais (LAPS)
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Informações de Contato
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="font-medium">Email Principal</p>
                        <a href="mailto:laps@ufu.br" className="text-blue-600 dark:text-blue-400 hover:underline">
                          laps@ufu.br
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="font-medium">Telefone</p>
                        <a href="tel:+553432394411" className="text-blue-600 dark:text-blue-400 hover:underline">
                          +55 (34) 3239-4411
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="font-medium">Horário de Funcionamento</p>
                        <p className="text-gray-600 dark:text-gray-300">
                          Segunda a Sexta: 8h às 18h<br />
                          Sábado: 8h às 12h
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Redes Sociais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button variant="outline" size="sm" asChild>
                      <a href="#" target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="#" target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </a>
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">
                    Siga-nos nas redes sociais para acompanhar nossas novidades e descobertas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Key Contacts */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Contatos Principais
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Para assuntos específicos, entre em contato diretamente com nossos responsáveis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Prof. Dr. Ewaldo Eder Santana
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Diretor do LAPS
                </p>
                <div className="space-y-2 text-sm">
                  <a href="mailto:ewaldo@ufu.br" className="block text-blue-600 dark:text-blue-400 hover:underline">
                    ewaldo@ufu.br
                  </a>
                  <p className="text-gray-500 dark:text-gray-400">
                    Colaborações e parcerias institucionais
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Coordenação de Projetos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Projetos de Pesquisa
                </p>
                <div className="space-y-2 text-sm">
                  <a href="mailto:projetos@laps.ufu.br" className="block text-blue-600 dark:text-blue-400 hover:underline">
                    projetos@laps.ufu.br
                  </a>
                  <p className="text-gray-500 dark:text-gray-400">
                    Informações sobre projetos em andamento
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Coordenação Acadêmica
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Oportunidades para Estudantes
                </p>
                <div className="space-y-2 text-sm">
                  <a href="mailto:academico@laps.ufu.br" className="block text-blue-600 dark:text-blue-400 hover:underline">
                    academico@laps.ufu.br
                  </a>
                  <p className="text-gray-500 dark:text-gray-400">
                    Estágios, IC, mestrado e doutorado
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Respostas para as dúvidas mais comuns sobre o LAPS
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como posso colaborar com o LAPS?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Estamos sempre abertos a colaborações em pesquisa, parcerias com empresas 
                  e intercâmbios acadêmicos. Entre em contato conosco através do formulário 
                  acima ou pelo email principal.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vocês oferecem oportunidades para estudantes?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Sim! Oferecemos oportunidades de iniciação científica, estágios, mestrado 
                  e doutorado. Entre em contato com nossa coordenação acadêmica para mais informações.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como posso acessar as publicações do LAPS?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Nossas publicações estão disponíveis em nossa seção de notícias e também 
                  podem ser acessadas através dos perfis dos pesquisadores em plataformas 
                  acadêmicas como ResearchGate e Google Scholar.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">O LAPS oferece serviços de consultoria?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Dependendo da demanda e disponibilidade, podemos oferecer consultoria 
                  em áreas relacionadas ao processamento de sinais e inteligência artificial. 
                  Entre em contato para discutir sua necessidade específica.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Como Chegar
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Estamos localizados no Campus Santa Mônica da UFU
            </p>
          </div>
          
          <Card className="overflow-hidden">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Mapa interativo será carregado aqui
                </p>
                <Button variant="outline" className="mt-4" asChild>
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
