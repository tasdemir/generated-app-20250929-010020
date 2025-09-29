import { IndexedEntity } from './core-utils';
import type { User, Event, Participation } from '@shared/types';
import { MOCK_USERS, MOCK_EVENTS, MOCK_PARTICIPATIONS } from '@shared/mock-data';
// --- USER ENTITY ---
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = 'user';
  static readonly indexName = 'users';
  static readonly initialState: User = {
    id: '',
    email: '',
    name: '',
    role: 'USER',
    points: 0,
    positions: [],
    createdAt: '',
    updatedAt: '',
  };
  static seedData = MOCK_USERS;
}
// --- EVENT ENTITY ---
export class EventEntity extends IndexedEntity<Event> {
  static readonly entityName = 'event';
  static readonly indexName = 'events';
  static readonly initialState: Event = {
    id: '',
    date: '',
    time: '',
    location: '',
    teamALimit: 0,
    teamBLimit: 0,
    shortCode: '',
    masterId: '',
    master: { id: '', name: '', email: '' },
    participations: [],
    createdAt: '',
  };
  static seedData = MOCK_EVENTS;
}
// --- PARTICIPATION ENTITY ---
export class ParticipationEntity extends IndexedEntity<Participation> {
  static readonly entityName = 'participation';
  static readonly indexName = 'participations';
  static readonly initialState: Participation = {
    id: '',
    userId: '',
    eventId: '',
    status: 'MAYBE',
    teamPreference: 'TEAM_A',
    positionOrder: 0,
    assignedByCoach: false,
    user: { id: '', name: '', email: '' },
    createdAt: '',
  };
  static seedData = MOCK_PARTICIPATIONS;
}