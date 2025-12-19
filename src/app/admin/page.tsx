'use client';

import React, { useState } from 'react';
import { Settings, Users, Link2 } from 'lucide-react';
import { MembersManager } from '@/components/admin/MembersManager';
import { CollaborationsManager } from '@/components/admin/CollaborationsManager';

type TabType = 'members' | 'collaborations';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('members');

  return (
    <main className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-black text-slate-900">
              Painel Administrativo
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Gerenciar equipe, colaborações e dados do laboratório
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all border-b-2 ${
              activeTab === 'members'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5" />
            Equipe
          </button>

          <button
            onClick={() => setActiveTab('collaborations')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all border-b-2 ${
              activeTab === 'collaborations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-5 h-5" />
            Colaborações
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          {activeTab === 'members' && <MembersManager />}
          {activeTab === 'collaborations' && <CollaborationsManager />}
        </div>

        {/* Info Box */}
        <div className="mt-8 glass-panel backdrop-blur-xl bg-white/80 border border-white/50 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 mb-3">💡 Dicas</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Adicione membros da equipe com seus papéis, áreas de expertise e de pesquisa</li>
            <li>• Crie colaborações entre membros para visualizar a rede de relações</li>
            <li>• A força da colaboração (1-5) afeta o tamanho da conexão no grafo</li>
            <li>• Todos os dados são salvos automaticamente</li>
            <li>• O grafo da página de equipe é atualizado em tempo real</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
