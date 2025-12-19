'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface Collaboration {
  id: string;
  memberId1: string;
  memberId2: string;
  type: string;
  strength: number;
  description?: string;
}

export function CollaborationsManager() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Collaboration>>({});

  // Carrega dados
  useEffect(() => {
    Promise.all([fetchCollaborations(), fetchMembers()]).finally(() =>
      setLoading(false)
    );
  }, []);

  async function fetchCollaborations() {
    try {
      const res = await fetch('/api/collaborations');
      const data = await res.json();
      setCollaborations(data);
    } catch (error) {
      console.error('Erro ao carregar colaborações:', error);
    }
  }

  async function fetchMembers() {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  }

  async function handleSave() {
    try {
      const res = await fetch('/api/collaborations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const newCollab = await res.json();
        setCollaborations([...collaborations, newCollab]);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja deletar esta colaboração?')) return;

    try {
      const res = await fetch(`/api/collaborations?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCollaborations(collaborations.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  }

  function resetForm() {
    setFormData({});
    setShowForm(false);
  }

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || id;
  };

  if (loading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Colaborações</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Nova Colaboração
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-panel backdrop-blur-xl bg-white/80 border border-white/50 rounded-2xl p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Membro 1
                </label>
                <select
                  value={formData.memberId1 || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, memberId1: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Selecione...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Membro 2
                </label>
                <select
                  value={formData.memberId2 || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, memberId2: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Selecione...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Tipo
                </label>
                <input
                  type="text"
                  placeholder="ex: artigo, projeto, orientação"
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Força (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.strength || 3}
                  onChange={(e) =>
                    setFormData({ ...formData, strength: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Descrição (opcional)
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
              <button
                onClick={resetForm}
                className="flex items-center gap-2 bg-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-400 transition"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collaborations List */}
      <div className="space-y-3">
        {collaborations.map((collab) => (
          <div
            key={collab.id}
            className="glass-panel backdrop-blur-xl bg-white/80 border border-white/50 rounded-xl p-4 flex justify-between items-start"
          >
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">
                {getMemberName(collab.memberId1)} ↔ {getMemberName(collab.memberId2)}
              </h3>
              <p className="text-sm text-slate-600">
                {collab.type} • Força: {collab.strength}/5
              </p>
              {collab.description && (
                <p className="text-xs text-slate-500 mt-1">{collab.description}</p>
              )}
            </div>
            <button
              onClick={() => handleDelete(collab.id)}
              className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
