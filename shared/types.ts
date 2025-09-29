export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'COACH' | 'USER';
  points: number;
  whatsapp?: string;
  city?: string;
  district?: string;
  positions: string[];
  birthDate?: string;
  favoriteTeam?: string;
  createdAt: string;
  updatedAt: string;
  deletionRequestedAt?: string;
  passwordHash?: string;
}
export interface Event {
  id: string;
  date: string;
  time: string;
  location: string;
  teamALimit: number;
  teamBLimit: number;
  shortCode: string;
  masterId: string;
  master: {
    id: string;
    name: string;
    email: string;
  };
  participations: Participation[];
  createdAt: string;
}
export interface Participation {
  id: string;
  userId: string;
  eventId: string;
  status: 'DEFINITELY' | 'MAYBE' | 'CANT';
  teamPreference: 'TEAM_A' | 'TEAM_B';
  positionOrder: number;
  assignedByCoach: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}