'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, AlertCircle } from 'lucide-react';

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

interface FormData {
  name: string;
  role_id: number;
  bio: string;
  expertise: string[];
  research_areas: string[];
  email: string;
  active: boolean;
}

export function MembersManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<FormData>>({
    expertise: [],
    research_areas: [],
    active: true,
  });

  // Carrega membros e roles
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [membersRes, rolesRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/roles'),
      ]);

      if (!membersRes.ok) throw new Error('Erro ao carregar membros');
      if (!rolesRes.ok) throw new Error('Erro ao carregar papéis');

      const membersData = await membersRes.json();
      const rolesData = await rolesRes.json();

      setMembers(membersData);
      setRoles(rolesData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!formData.name || !formData.role_id || !formData.bio) {
      setError('Preencha os campos obrigatórios: Nome, Papel e Biografia');
      return;
    }

    try {
      setError(null);
      if (editingId) {
        // Atualizar
        const res = await fetch(`/api/members?id=${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Erro ao atualizar membro');
        }
        const updated = await res.json();
        setMembers(members.map((m) => (m.id === editingId ? updated : m)));
      } else {
        // Criar novo
        const res = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Erro ao criar membro');
        }
        const newMember = await res.json();
        setMembers([...members, newMember]);
      }
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      console.error('Erro ao salvar:', err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja deletar este membro?')) return;

    try {
      setError(null);
      const res = await fetch(`/api/members?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao deletar membro');
      }
      setMembers(members.filter((m) => m.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      console.error('Erro ao deletar:', err);
    }
  }

  function startEdit(member: TeamMember) {
    setFormData({
      name: member.name,
      role_id: member.role_id,
      bio: member.bio || '',
      expertise: member.expertise,
      research_areas: member.research_areas,
      email: member.email,
      active: member.active,
    });
    setEditingId(member.id);
    setShowForm(true);
    setError(null);
  }

  function resetForm() {
    setFormData({
      expertise: [],
      research_areas: [],
      active: true,
    });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  }

  const getRoleName = (roleId: number) => {
    return roles.find((r) => r.id === roleId)?.name || 'Desconhecido';
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

      {/* Error Message */}
      {error && (
        <div className="glass-panel backdrop-blur-xl bg-red-50/80 border border-red-200 rounded-2xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">Erro</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="glass-panel backdrop-blur-xl bg-white/80 border border-white/50 rounded-2xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Nome <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome completo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Papel <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.role_id || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role_id: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.description || role.name}
                    </option>
                  ))}
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Biografia <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Breve descrição sobre o membro"
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
                    expertise: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter((s) => s),
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Machine Learning, Image Processing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Áreas de Pesquisa (separadas por vírgula)
              </label>
              <input
                type="text"
                value={(formData.research_areas || []).join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    research_areas: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter((s) => s),
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Computer Vision, Pattern Recognition"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active !== false}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 border border-slate-300 rounded"
              />
              <label htmlFor="active" className="text-sm font-medium text-slate-900">
                Membro ativo
              </label>
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
        {members.length === 0 ? (
          <p className="text-center text-slate-500 py-8">Nenhum membro cadastrado</p>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="glass-panel backdrop-blur-xl bg-white/80 border border-white/50 rounded-xl p-4 flex justify-between items-start"
            >
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{member.name}</h3>
                <p className="text-sm text-slate-600">{getRoleName(member.role_id)}</p>
                <p className="text-xs text-slate-500 mt-1">{member.bio}</p>
                {member.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.expertise.slice(0, 2).map((exp, i) => (
                      <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {exp}
                      </span>
                    ))}
                    {member.expertise.length > 2 && (
                      <span className="text-xs text-slate-500">+{member.expertise.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(member)}
                  className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                  title="Deletar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
