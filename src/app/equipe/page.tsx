'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Mail } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  level: number;
  description?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role_id: number;
  bio?: string;
  expertise: string[];
  research_areas: string[];
  email?: string;
  photo_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const RoleColors: { [key: number]: { bg: string; border: string; text: string; badge: string } } = {
  5: {
    bg: 'bg-gradient-to-br from-cyan-50 to-blue-50',
    border: 'border-cyan-200',
    text: 'text-cyan-900',
    badge: 'bg-cyan-100 text-cyan-800',
  },
  4: {
    bg: 'bg-gradient-to-br from-sky-50 to-blue-50',
    border: 'border-sky-200',
    text: 'text-sky-900',
    badge: 'bg-sky-100 text-sky-800',
  },
  3: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-800',
  },
  2: {
    bg: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    border: 'border-indigo-200',
    text: 'text-indigo-900',
    badge: 'bg-indigo-100 text-indigo-800',
  },
  1: {
    bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    badge: 'bg-purple-100 text-purple-800',
  },
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [membersRes, rolesRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/roles'),
        ]);

        if (membersRes.ok) {
          const data = await membersRes.json();
          setMembers(data);
        }

        if (rolesRes.ok) {
          const data = await rolesRes.json();
          setRoles(data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const groupByRole = (members: TeamMember[]) => {
    const grouped: { [key: number]: TeamMember[] } = {};

    members.forEach((member) => {
      if (!grouped[member.role_id]) {
        grouped[member.role_id] = [];
      }
      grouped[member.role_id].push(member);
    });

    return grouped;
  };

  const getRoleInfo = (roleId: number): Role | undefined => {
    return roles.find((r) => r.id === roleId);
  };

  const hierarchyOrder = roles.sort((a, b) => b.level - a.level).map((r) => r.id);
  const grouped = groupByRole(members);

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando equipe...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            <span className="text-slate-900">Nossa</span>
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
              {' '}Equipe
            </span>
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Conheça a hierarquia e a estrutura do Laboratório de Análise de Padrões e Sistemas (LAPS),
            do topo com a liderança até os estudantes em formação.
          </p>
        </div>

        {/* Hierarchy Structure */}
        <div className="space-y-12">
          {hierarchyOrder.map((roleId) => {
            const membersOfRole = grouped[roleId] || [];

            if (membersOfRole.length === 0) return null;

            const roleInfo = getRoleInfo(roleId);
            if (!roleInfo) return null;

            const colors = RoleColors[roleId];

            return (
              <div key={roleId}>
                {/* Connector Line (top) */}
                {roleId !== 5 && (
                  <div className="flex justify-center mb-4">
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-300 to-blue-200"></div>
                  </div>
                )}

                {/* Section Header */}
                <div className="flex justify-center mb-8">
                  <div className={`px-8 py-3 rounded-full border-2 ${colors.border} ${colors.bg} shadow-lg`}>
                    <h2 className={`text-xl font-bold ${colors.text}`}>{roleInfo.description || roleInfo.name}</h2>
                  </div>
                </div>

                {/* Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {membersOfRole.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 transform`}
                    >
                      {/* Avatar */}
                      <div className="mb-4">
                        <div className="w-full aspect-square bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                          <Image
                            src={
                              member.photo_url ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`
                            }
                            alt={member.name}
                            width={256}
                            height={256}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Name */}
                      <h3 className={`text-lg font-bold ${colors.text} mb-2`}>{member.name}</h3>

                      {/* Bio */}
                      {member.bio && (
                        <p className="text-sm text-slate-700 mb-4 line-clamp-2">{member.bio}</p>
                      )}

                      {/* Expertise Tags */}
                      {member.expertise && member.expertise.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {member.expertise.slice(0, 2).map((skill, idx) => (
                              <span
                                key={idx}
                                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${colors.badge}`}
                              >
                                {skill}
                              </span>
                            ))}
                            {member.expertise.length > 2 && (
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                                +{member.expertise.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Contact Info */}
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className={`hover:text-blue-600 transition-colors flex items-center gap-1`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="w-4 h-4" />
                            <span className="hidden sm:inline truncate">{member.email}</span>
                          </a>
                        )}
                      </div>

                      {/* Created Date */}
                      <div className="text-xs text-slate-500">
                        Membro desde {new Date(member.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Connector Line (bottom) */}
                {roleId !== 1 && (
                  <div className="flex justify-center">
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-200 to-blue-300"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {members.length === 0 && !loading && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Nenhum membro encontrado</h3>
              <p className="text-slate-600">
                Comece a adicionar membros da equipe no painel de administração.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedMember.name}</h2>
                  {getRoleInfo(selectedMember.role_id) && (
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${RoleColors[selectedMember.role_id].badge}`}>
                      {getRoleInfo(selectedMember.role_id)!.description || getRoleInfo(selectedMember.role_id)!.name}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Bio */}
                {selectedMember.bio && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Sobre</h3>
                    <p className="text-slate-700 leading-relaxed">{selectedMember.bio}</p>
                  </div>
                )}

                {/* Expertise */}
                {selectedMember.expertise && selectedMember.expertise.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.expertise.map((skill, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${RoleColors[selectedMember.role_id].badge}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Research Areas */}
                {selectedMember.research_areas && selectedMember.research_areas.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Áreas de Pesquisa</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.research_areas.map((area, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="space-y-3">
                    {selectedMember.email && (
                      <a
                        href={`mailto:${selectedMember.email}`}
                        className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Mail className="w-5 h-5" />
                        <span>{selectedMember.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
