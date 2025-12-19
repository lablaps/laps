'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: 'director' | 'doctor' | 'phd_student' | 'master_student' | 'undergraduate';
  bio: string;
  expertise: string[];
  researchAreas: string[];
  email?: string;
  image?: string;
  active: boolean;
  joinDate: string;
}

export function MembersManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<TeamMember>>({});

  // Carrega membros
  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (editingId) {
        // Atualizar
        const res = await fetch(`/api/members?id=${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const updated = await res.json();
          setMembers(members.map((m) => (m.id === editingId ? updated : m)));
        }
      } else {
        // Criar novo
        const res = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const newMember = await res.json();
          setMembers([...members, newMember]);
        }
      }
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja deletar este membro?')) return;

    try {
      const res = await fetch(`/api/members?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMembers(members.filter((m) => m.id !== id));
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  }

  function startEdit(member: TeamMember) {
    setFormData(member);
    setEditingId(member.id);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({});
    setEditingId(null);
    setShowForm(false);
  }

  const roleLabels: Record<string, string> = {
    director: 'Diretor',
    doctor: 'Doutor',
    phd_student: 'Doutorando',
    master_student: 'Mestrando',
    undergraduate: 'Graduando',
  };

  if (loading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Equipe</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Novo Membro
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-panel backdrop-blur-xl bg-white/80 border border-white/50 rounded-2xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Papel
                </label>
                <select
                  value={formData.role || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as TeamMember['role'],
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Selecione...</option>
                  <option value="director">Diretor</option>
                  <option value="doctor">Doutor</option>
                  <option value="phd_student">Doutorando</option>
                  <option value="master_student">Mestrando</option>
                  <option value="undergraduate">Graduando</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Biografia
              </label>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Áreas de Expertise (separadas por vírgula)
              </label>
              <input
                type="text"
                value={(formData.expertise || []).join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expertise: e.target.value.split(',').map((s) => s.trim()),
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Áreas de Pesquisa (separadas por vírgula)
              </label>
              <input
                type="text"
                value={(formData.researchAreas || []).join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    researchAreas: e.target.value.split(',').map((s) => s.trim()),
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
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

      {/* Members List */}
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="glass-panel backdrop-blur-xl bg-white/80 border border-white/50 rounded-xl p-4 flex justify-between items-start"
          >
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">{member.name}</h3>
              <p className="text-sm text-slate-600">{roleLabels[member.role]}</p>
              <p className="text-xs text-slate-500 mt-1">{member.bio}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(member)}
                className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
