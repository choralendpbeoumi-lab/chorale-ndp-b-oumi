export type VoicePart = 'Soprano' | 'Alto' | 'Ténor' | 'Basse' | 'Maître de Chœur';

export type Role = 
  | 'Simple choriste' 
  | 'Maître de Chœur' 
  | 'Président' 
  | 'Vice-président' 
  | 'Secrétaire' 
  | 'Trésorier' 
  | 'Commissariat aux comptes' 
  | 'Bureau' 
  | 'PCO';

export type Status = 'Actif' | 'En congé' | 'Inactif';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  voicePart: VoicePart;
  role: Role;
  status: Status;
  photoUrl?: string;
}

export type AttendanceStatus = 'Présent' | 'Absent' | 'Retard';

export interface AttendanceSession {
  id: string;
  date: string;
  type: 'Répétition' | 'Messe';
  records: Record<string, AttendanceStatus>; // memberId -> status
}

export interface Transaction {
  id: string;
  type: 'Recette' | 'Dépense';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface Contribution {
  memberId: string;
  year: number;
  paidMonths: number[]; // 1-12
}

export interface ExceptionalContribution {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  description: string;
}

export interface Credit {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  description: string;
  status: 'En attente' | 'Remboursé' | 'Annulé';
  dueDate?: string;
}

export interface Activity {
  id: string;
  type: 'payment' | 'attendance' | 'member';
  description: string;
  date: string;
}