import { createClient } from '@supabase/supabase-js';

// Validar variáveis de ambiente
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
}

// Cliente do lado do servidor (com service role key para operações administrativas)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Tipos de banco de dados
export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role_id: number;
  bio?: string;
  photo_url?: string;
  expertise: string[];
  research_areas: string[];
  social_links?: Record<string, string>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collaboration {
  id: string;
  member_id_1: string;
  member_id_2: string;
  collaboration_type?: string;
  strength: number;
  description?: string;
  start_date?: string;
  end_date?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  level: number;
  description?: string;
  created_at: string;
}

// ============================================
// Team Members CRUD
// ============================================

export async function getAllMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching members:', error);
    throw new Error(`Failed to fetch members: ${error.message}`);
  }

  return data || [];
}

export async function getMemberById(id: string): Promise<TeamMember | null> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching member:', error);
    throw new Error(`Failed to fetch member: ${error.message}`);
  }

  return data;
}

export async function createMember(
  member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      name: member.name,
      email: member.email,
      role_id: member.role_id,
      bio: member.bio,
      photo_url: member.photo_url,
      expertise: member.expertise || [],
      research_areas: member.research_areas || [],
      social_links: member.social_links || {},
      active: member.active,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating member:', error);
    throw new Error(`Failed to create member: ${error.message}`);
  }

  return data;
}

export async function updateMember(
  id: string,
  updates: Partial<Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>>
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating member:', error);
    throw new Error(`Failed to update member: ${error.message}`);
  }

  return data;
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await supabase.from('team_members').delete().eq('id', id);

  if (error) {
    console.error('Error deleting member:', error);
    throw new Error(`Failed to delete member: ${error.message}`);
  }
}

// ============================================
// Collaborations CRUD
// ============================================

export async function getAllCollaborations(): Promise<
  (Collaboration & { member1?: TeamMember; member2?: TeamMember })[]
> {
  const { data, error } = await supabase
    .from('collaborations_with_details')
    .select('*')
    .eq('active', true);

  if (error) {
    console.error('Error fetching collaborations:', error);
    throw new Error(`Failed to fetch collaborations: ${error.message}`);
  }

  return data || [];
}

export async function getCollaborationById(id: string): Promise<Collaboration | null> {
  const { data, error } = await supabase
    .from('collaborations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching collaboration:', error);
    throw new Error(`Failed to fetch collaboration: ${error.message}`);
  }

  return data;
}

export async function createCollaboration(
  collab: Omit<Collaboration, 'id' | 'created_at' | 'updated_at'>
): Promise<Collaboration> {
  const { data, error } = await supabase
    .from('collaborations')
    .insert({
      member_id_1: collab.member_id_1,
      member_id_2: collab.member_id_2,
      collaboration_type: collab.collaboration_type,
      strength: collab.strength,
      description: collab.description,
      start_date: collab.start_date,
      end_date: collab.end_date,
      active: collab.active,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating collaboration:', error);
    throw new Error(`Failed to create collaboration: ${error.message}`);
  }

  return data;
}

export async function deleteCollaboration(id: string): Promise<void> {
  const { error } = await supabase.from('collaborations').delete().eq('id', id);

  if (error) {
    console.error('Error deleting collaboration:', error);
    throw new Error(`Failed to delete collaboration: ${error.message}`);
  }
}

// ============================================
// Roles
// ============================================

export async function getAllRoles(): Promise<Role[]> {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('level', { ascending: true });

  if (error) {
    console.error('Error fetching roles:', error);
    throw new Error(`Failed to fetch roles: ${error.message}`);
  }

  return data || [];
}

export async function getRoleById(id: number): Promise<Role | null> {
  const { data, error } = await supabase.from('roles').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching role:', error);
    throw new Error(`Failed to fetch role: ${error.message}`);
  }

  return data;
}
