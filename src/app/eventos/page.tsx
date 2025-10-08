"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock, Users, Search, Filter } from "lucide-react";
import { events } from "@/data";
import { Event } from "@/types";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredEvents = events.filter((event: Event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || event.type === filterType;
    const matchesStatus = filterStatus === "all" || event.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const upcomingEvents = filteredEvents.filter((event: Event) => event.status === "upcoming");
  const pastEvents = filteredEvents.filter((event: Event) => event.status === "past");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-green-100 text-green-800";
      case "ongoing": return "bg-blue-100 text-blue-800";
      case "past": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "conference": return "bg-purple-100 text-purple-800";
      case "workshop": return "bg-orange-100 text-orange-800";
      case "seminar": return "bg-blue-100 text-blue-800";
      case "meeting": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section - professional academic */}
      <section className="py-24 md:py-32 bg-blue-700 dark:bg-blue-800 text-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-16 h-16 mx-auto rounded-lg bg-white/10 flex items-center justify-center mb-6 ios-shadow">
                <CalendarDays className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight leading-tight">
              Eventos LAPS
            </h1>
            <p className="text-lg md:text-xl text-blue-50 mb-12 leading-relaxed">
              Acompanhe nossos eventos, workshops, seminários e conferências
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <div className="flex items-center gap-3 text-blue-50 bg-white/10 rounded-lg px-6 py-3 ios-shadow">
                <CalendarDays className="h-5 w-5" />
                <span className="font-medium">{upcomingEvents.length} eventos próximos</span>
              </div>
              <div className="flex items-center gap-3 text-blue-50 bg-white/10 rounded-lg px-6 py-3 ios-shadow">
                <Users className="h-5 w-5" />
                <span className="font-medium">Acesso gratuito</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section with iOS-style */}
      <section className="py-8 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-6xl mx-auto">
            <div className="flex-1 max-w-md w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 rounded-2xl border-gray-200 dark:border-gray-800 ios-shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-44 h-12 rounded-2xl border-gray-200 dark:border-gray-800 ios-shadow-sm">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="conference">Conferência</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="seminar">Seminário</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-44 h-12 rounded-2xl border-gray-200 dark:border-gray-800 ios-shadow-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="upcoming">Próximos</SelectItem>
                  <SelectItem value="ongoing">Em andamento</SelectItem>
                  <SelectItem value="past">Passados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events - professional academic */}
      {upcomingEvents.length > 0 && (
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <div className="mb-12 max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Próximos Eventos
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Confira os eventos que estão por vir
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {upcomingEvents.map((event: Event) => (
                <Card key={event.id} className="rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-ios hover-lift active-press overflow-hidden">
                  <div className="h-1 bg-blue-700"></div>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <Badge className={`${getTypeColor(event.type)} rounded-md px-3 py-1 font-medium`}>
                        {event.type}
                      </Badge>
                      <Badge className={`${getStatusColor(event.status)} rounded-md px-3 py-1 font-medium`}>
                        {event.status === "upcoming" ? "Próximo" : event.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-medium">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="font-medium">{event.location}</span>
                      </div>
                      {event.speaker && (
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                            <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span className="font-medium">Palestrante: {event.speaker}</span>
                        </div>
                      )}
                    </div>
                    <Button className="w-full h-11 rounded-lg font-medium ios-shadow-sm transition-ios hover-lift active-press">
                      Mais Informações
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Past Events - professional academic */}
      {pastEvents.length > 0 && (
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="mb-12 max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Eventos Realizados
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Veja os eventos que já aconteceram
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pastEvents.map((event: Event) => (
                <Card key={event.id} className="rounded-lg ios-shadow border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-ios hover-lift active-press overflow-hidden">
                  <div className="h-1 bg-gray-400"></div>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <Badge className={`${getTypeColor(event.type)} rounded-md px-3 py-1 font-medium`}>
                        {event.type}
                      </Badge>
                      <Badge className={`${getStatusColor(event.status)} rounded-md px-3 py-1 font-medium`}>
                        Realizado
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <CalendarDays className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="font-medium">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="font-medium">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="font-medium">{event.location}</span>
                      </div>
                      {event.speaker && (
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="font-medium">Palestrante: {event.speaker}</span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" className="w-full h-11 rounded-lg font-medium ios-shadow-sm transition-ios hover-lift active-press">
                      Ver Resumo
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Events Found - professional academic */}
      {filteredEvents.length === 0 && (
        <section className="py-32 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center ios-shadow">
                <CalendarDays className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Nenhum evento encontrado
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                Não encontramos eventos que correspondam aos seus critérios de busca.
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                  setFilterStatus("all");
                }}
                className="h-12 rounded-lg px-8 font-medium ios-shadow transition-ios hover-lift active-press"
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action - professional academic */}
      <section className="py-20 bg-blue-700 dark:bg-blue-800 text-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="w-14 h-14 mx-auto rounded-lg bg-white/10 flex items-center justify-center mb-6 ios-shadow">
                <span className="text-3xl">📬</span>
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
              Fique por dentro dos nossos eventos
            </h2>
            <p className="text-base md:text-lg text-blue-50 mb-10 leading-relaxed">
              Receba notificações sobre novos eventos e atividades do LAPS
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Input 
                placeholder="Seu email"
                className="bg-white dark:bg-white text-gray-900 h-12 rounded-lg border-0 ios-shadow placeholder:text-gray-500"
              />
              <Button className="h-12 rounded-lg px-8 bg-white text-blue-700 hover:bg-gray-100 font-medium transition-ios hover-lift active-press">
                Inscrever-se
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
