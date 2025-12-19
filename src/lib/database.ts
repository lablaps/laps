import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/data/team-db.json');

export interface TeamMember {
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
  createdAt: string;
  updatedAt: string;
}

export interface TeamCollaboration {
  id: string;
  memberId1: string;
  memberId2: string;
  type: string; // projeto, artigo, orientação, etc
  strength: number; // 1-5
  description?: string;
  createdAt: string;
}

export interface DatabaseSchema {
  members: TeamMember[];
  collaborations: TeamCollaboration[];
  metadata: {
    lastUpdated: string;
    version: string;
  };
}

// Inicializa o banco de dados se não existir
export function initializeDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_PATH)) {
    const defaultData: DatabaseSchema = {
      members: [],
      collaborations: [],
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
      },
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return readDatabase();
}

// Lê o banco de dados
export function readDatabase(): DatabaseSchema {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler banco de dados:', error);
    return initializeDatabase();
  }
}

// Escreve no banco de dados
export function writeDatabase(data: DatabaseSchema): void {
  try {
    data.metadata.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erro ao escrever no banco de dados:', error);
    throw error;
  }
}

// CRUD Operations para Members
export function getAllMembers(): TeamMember[] {
  const db = readDatabase();
  return db.members;
}

export function getMemberById(id: string): TeamMember | null {
  const db = readDatabase();
  return db.members.find((m) => m.id === id) || null;
}

export function createMember(member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): TeamMember {
  const db = readDatabase();
  const newMember: TeamMember = {
    ...member,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.members.push(newMember);
  writeDatabase(db);
  return newMember;
}

export function updateMember(id: string, updates: Partial<Omit<TeamMember, 'id' | 'createdAt'>>): TeamMember | null {
  const db = readDatabase();
  const index = db.members.findIndex((m) => m.id === id);
  if (index === -1) return null;

  db.members[index] = {
    ...db.members[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeDatabase(db);
  return db.members[index];
}

export function deleteMember(id: string): boolean {
  const db = readDatabase();
  const initialLength = db.members.length;
  db.members = db.members.filter((m) => m.id !== id);
  
  // Remove também as colaborações deste membro
  db.collaborations = db.collaborations.filter(
    (c) => c.memberId1 !== id && c.memberId2 !== id
  );

  if (db.members.length < initialLength) {
    writeDatabase(db);
    return true;
  }
  return false;
}

// CRUD Operations para Collaborations
export function getAllCollaborations(): TeamCollaboration[] {
  const db = readDatabase();
  return db.collaborations;
}

export function createCollaboration(
  collab: Omit<TeamCollaboration, 'id' | 'createdAt'>
): TeamCollaboration {
  const db = readDatabase();
  const newCollab: TeamCollaboration = {
    ...collab,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  db.collaborations.push(newCollab);
  writeDatabase(db);
  return newCollab;
}

export function deleteCollaboration(id: string): boolean {
  const db = readDatabase();
  const initialLength = db.collaborations.length;
  db.collaborations = db.collaborations.filter((c) => c.id !== id);

  if (db.collaborations.length < initialLength) {
    writeDatabase(db);
    return true;
  }
  return false;
}

// Inicializa o banco quando o módulo é carregado
initializeDatabase();
