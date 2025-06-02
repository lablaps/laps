export interface Member {
  id: string;
  name: string;
  title: string;
  category: 'director' | 'doctor' | 'phd_student' | 'master_student' | 'undergraduate';
  image?: string;
  lattesUrl?: string;
  email?: string;
  phone?: string; // For form compatibility
  bio?: string; // For form compatibility
  role?: string; // For form compatibility (legacy)
  specialties?: string[]; // For form compatibility
  education?: string[]; // For form compatibility
  description?: string;
  researchAreas?: string[];
  active: boolean;
  joinDate: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  fullDescription?: string; // For form compatibility
  researchers: string[];
  startDate: Date;
  endDate?: Date;
  startDateString?: string; // For form handling
  endDateString?: string; // For form handling
  status: 'active' | 'completed' | 'paused';
  category: string;
  tags: string[];  technologies?: string[]; // For form compatibility
  team?: string[]; // For form compatibility
  teamMembers?: string[]; // Alternative team field for consistency
  image?: string; // Single image for form compatibility
  images?: string[];
  publications?: string[];
  publicationUrl?: string; // Publication URL
  fundingAgency?: string;
  budget?: number;
}

export interface News {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  date?: string; // Date in string format for form handling
  publishDate: Date;
  featured: boolean;
  image?: string;
  category: string;
  tags: string[];
  externalUrl?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // Date in string format for form handling
  time: string;
  startDate?: Date; // Keep for compatibility
  endDate?: Date;
  location: string;
  type: 'conference' | 'seminar' | 'workshop' | 'meeting' | 'defense' | 'other';
  status: 'upcoming' | 'ongoing' | 'past';
  speaker?: string;
  organizer?: string;
  registrationUrl?: string;
  maxAttendees?: number;
  currentAttendees?: number;
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  type: 'journal' | 'conference' | 'book' | 'thesis' | 'technical_report';
  doi?: string;
  url?: string;
  abstract?: string;
  keywords: string[];
  citationCount?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: Date;
  lastLogin?: Date;
  active: boolean;
}

export interface DashboardStats {
  totalMembers: number;
  activeProjects: number;
  totalPublications: number;
  recentNews: number;
  upcomingEvents: number;
  monthlyVisitors: number;
}
