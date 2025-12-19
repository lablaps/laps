"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import MapComponent from "@/components/ui/MapComponent";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Email inválido." }),
  phone: z.string().optional(),
  institution: z.string().optional(),
  subject: z.string({ required_error: "Por favor selecione um assunto." }),
  message: z.string().min(10, { message: "A mensagem deve ter pelo menos 10 caracteres." }),
});

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      institution: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setError(null);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(values);
      setIsSuccess(true);
      form.reset();
    } catch (error) {
      console.error('Erro ao enviar:', error);
      setError("Ocorreu um erro ao enviar sua mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Mensagem Enviada!</h3>
                    <p className="text-gray-600 max-w-md">
                      Obrigado pelo contato. Nossa equipe responderá o mais breve possível.
                    </p>
                    <Button onClick={() => setIsSuccess(false)} variant="outline">
                      Enviar nova mensagem
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome Completo *</FormLabel>
                              <FormControl>
                                <Input placeholder="Seu nome" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="seu@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="(34) 99999-9999" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="institution"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instituição</FormLabel>
                              <FormControl>
                                <Input placeholder="Sua instituição" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assunto *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o assunto" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="collaboration">Colaboração em Pesquisa</SelectItem>
                                <SelectItem value="partnership">Parceria</SelectItem>
                                <SelectItem value="student">Oportunidades para Estudantes</SelectItem>
                                <SelectItem value="publication">Publicações</SelectItem>
                                <SelectItem value="presentation">Apresentação do LAPS</SelectItem>
                                <SelectItem value="other">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensagem *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Digite sua mensagem aqui..." 
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {error}
                        </div>
                      )}

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>

            {/* FAQ Section (Simplified for layout) */}
            <div className="space-y-6">
               <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Perguntas Frequentes
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Respostas para as dúvidas mais comuns sobre o LAPS
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Como posso colaborar com o LAPS?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Estamos sempre abertos a colaborações em pesquisa, parcerias com empresas 
                    e intercâmbios acadêmicos. Entre em contato conosco através do formulário 
                    ao lado ou pelo email principal.
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
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
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
          
          <div className="max-w-5xl mx-auto">
             <MapComponent />
             <div className="text-center mt-4">
                <Button variant="outline" asChild>
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
        </div>
      </section>
    </div>
  );
}
