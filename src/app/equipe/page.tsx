'use client';

import React, { useState } from 'react';
import { NetworkGraph } from '@/components/sections/NetworkGraph';
import { TeamNode } from '@/data/teamNetworkData';
import { X, Mail, Globe, BookOpen } from 'lucide-react';

/**
 * Página de equipe com grafo interativo
 * Exibe uma rede de colaborações e detalhes dos membros em um sidebar
 */
export default function TeamPage() {
  const [selectedMember, setSelectedMember] = useState<TeamNode | null>(null);

  const getRoleLabel = (role: string): string => {
    const labels: { [key: string]: string } = {
      director: 'Diretor',
      doctor: 'Doutor(a)',
      phd_student: 'Doutorando(a)',
      master_student: 'Mestrando(a)',
      undergraduate: 'Graduando(a)',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string): string => {
    const colors: { [key: string]: string } = {
      director: 'bg-cyan-100 text-cyan-800',
      doctor: 'bg-sky-100 text-sky-800',
      phd_student: 'bg-blue-100 text-blue-800',
      master_student: 'bg-blue-50 text-blue-700',
      undergraduate: 'bg-indigo-50 text-indigo-700',
    };
    return colors[role] || 'bg-blue-100 text-blue-800';
  };

  return (
    <main className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-slate-900">Nossa</span>
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
              {' '}Equipe
            </span>
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Conheça os pesquisadores, doutores e estudantes que formam a rede de colaboração do LAPS.
            Explore as conexões e as relações de pesquisa entre os membros.
          </p>
        </div>

        {/* Network Graph Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Graph */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden" style={{ minHeight: '600px' }}>
              <NetworkGraph 
                onNodeClick={setSelectedMember}
                selectedNodeId={selectedMember?.id}
              />
            </div>
          </div>

          {/* Member Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedMember ? (
              <div className="sticky top-32 glass-panel backdrop-blur-xl bg-white/80 border border-white/50 rounded-2xl p-6 shadow-2xl animate-fade-in-down">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>

                {/* Avatar */}
                <div className="mb-6">
                  <div className="w-full aspect-square bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={selectedMember.image || `https://via.placeholder.com/200?text=${encodeURIComponent(selectedMember.name)}`}
                      alt={selectedMember.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Name and Role */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    {selectedMember.name}
                  </h2>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(selectedMember.role)}`}>
                    {getRoleLabel(selectedMember.role)}
                  </span>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedMember.bio}
                  </p>
                </div>

                {/* Expertise */}
                {selectedMember.expertise && selectedMember.expertise.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                      Áreas de Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.expertise.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Research Areas */}
                {selectedMember.researchAreas && selectedMember.researchAreas.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                      Áreas de Pesquisa
                    </h3>
                    <ul className="space-y-2">
                      {selectedMember.researchAreas.map((area, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                          <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contact */}
                <div className="border-t border-slate-200 pt-4">
                  {selectedMember.email && (
                    <a
                      href={`mailto:${selectedMember.email}`}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors mb-3"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{selectedMember.email}</span>
                    </a>
                  )}
                  <a
                    href="#"
                    className="flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Lattes CV</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="glass-panel backdrop-blur-xl bg-white/60 border border-white/50 rounded-2xl p-6 text-center sticky top-32">
                <div className="text-slate-400 mb-3">👆</div>
                <p className="text-sm text-slate-600 font-medium">
                  Clique em um nó para ver os detalhes do membro
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-12 glass-panel backdrop-blur-xl bg-white/80 border border-white/50 rounded-2xl p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Legenda</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { role: 'director', label: 'Diretor(a)', color: 'bg-cyan-500' },
              { role: 'doctor', label: 'Doutor(a)', color: 'bg-sky-500' },
              { role: 'phd_student', label: 'Doutorando(a)', color: 'bg-blue-500' },
              { role: 'master_student', label: 'Mestrando(a)', color: 'bg-blue-400' },
              { role: 'undergraduate', label: 'Graduando(a)', color: 'bg-blue-300' },
            ].map((item) => (
              <div key={item.role} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full ${item.color} border-2 border-white shadow-md`} />
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-6 pt-6 border-t border-slate-200">
            💡 <strong>Dica:</strong> Passe o mouse sobre os nós para destacar conexões e clique para ver detalhes completos.
          </p>
        </div>
      </div>
    </main>
  );
}
