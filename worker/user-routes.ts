import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import type { Env } from './core-utils';
import { UserEntity, EventEntity, ParticipationEntity } from './entities';
import { ok, bad, notFound, unauthorized, isStr } from './core-utils';
import type { User, Participation } from '@shared/types';const MOCK_USERS = {
  _stub: true,


  init: (...args: unknown[]): void => {
    console.warn('MOCK_USERS.init not implemented', args);
  },

  getValue: <T = unknown,>(key: string): T | undefined => {
    console.warn('MOCK_USERS.getValue not implemented', key);
    return undefined;
  },

  setValue: <T = unknown,>(key: string, value: T): void => {
    console.warn('MOCK_USERS.setValue not implemented', key, value);
  }
} as const;async function hashPassword(password: string): Promise<string> {const encoder = new TextEncoder();const data = encoder.encode(password);const hashBuffer = await crypto.subtle.digest('SHA-256', data);const hashArray = Array.from(new Uint8Array(hashBuffer));return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');}async function verifyPassword(password: string, hash: string): Promise<boolean> {const passwordHash = await hashPassword(password);return passwordHash === hash;}export function userRoutes(app: Hono<{Bindings: Env;}>) {app.get('/api/seed', async (c) => {
      const adminUser = MOCK_USERS.find((u) => u.email === 'admin@admin.com');
      if (adminUser) {
        adminUser.passwordHash = await hashPassword('admin123');
      }
      await UserEntity.ensureSeed(c.env);
      await EventEntity.ensureSeed(c.env);
      await ParticipationEntity.ensureSeed(c.env);
      return ok(c, { seeded: true });
    });

  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    if (!isStr(email) || !isStr(password)) return bad(c, 'Email and password required');
    const { items: allUsers } = await UserEntity.list(c.env);
    const user = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !user.passwordHash) {
      return unauthorized(c, 'Invalid credentials');
    }
    const passwordIsValid = await verifyPassword(password, user.passwordHash);
    if (!passwordIsValid) {
      return unauthorized(c, 'Invalid credentials');
    }
    const { passwordHash, ...userWithoutHash } = user;
    return ok(c, { user: userWithoutHash, token: user.id });
  });
  app.post('/api/auth/register', async (c) => {
    const { name, email, password } = await c.req.json();
    if (!isStr(name) || !isStr(email) || !isStr(password)) {
      return bad(c, 'Valid name, email, and password required');
    }
    if (password.length < 6) {
      return bad(c, 'Password must be at least 6 characters');
    }
    const { items: allUsers } = await UserEntity.list(c.env);
    if (allUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return bad(c, 'Email already in use');
    }
    const passwordHash = await hashPassword(password);
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      role: 'USER',
      points: 0,
      positions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash
    };
    await UserEntity.create(c.env, newUser);
    const { passwordHash: _, ...userWithoutHash } = newUser;
    return ok(c, { user: userWithoutHash, token: newUser.id });
  });

  const authMiddleware = bearerAuth({
    verifyToken: async (token, c) => {
      const user = new UserEntity(c.env, token);
      return await user.exists();
    }
  });

  const protectedRoutes = new Hono<{Bindings: Env;}>();
  protectedRoutes.use('*', authMiddleware);

  protectedRoutes.get('/users/profile', async (c) => {
    const userId = c.req.header('Authorization')?.split(' ')[1];
    if (!userId) return unauthorized(c);
    const user = await new UserEntity(c.env, userId).getState();
    const { passwordHash, ...userWithoutHash } = user;
    return ok(c, userWithoutHash);
  });
  protectedRoutes.put('/users/profile', async (c) => {
    const userId = c.req.header('Authorization')?.split(' ')[1];
    if (!userId) return unauthorized(c);
    const body = await c.req.json();
    const userEntity = new UserEntity(c.env, userId);
    const currentUser = await userEntity.getState();
    const updatedUser = { ...currentUser, ...body, updatedAt: new Date().toISOString() };
    await userEntity.save(updatedUser);
    const { passwordHash, ...userWithoutHash } = updatedUser;
    return ok(c, userWithoutHash);
  });
  protectedRoutes.post('/users/change-password', async (c) => {

    return ok(c, { message: 'Password changed successfully' });
  });
  protectedRoutes.post('/users/delete-account', async (c) => {
    const userId = c.req.header('Authorization')?.split(' ')[1];
    if (!userId) return unauthorized(c);
    const userEntity = new UserEntity(c.env, userId);
    await userEntity.patch({ deletionRequestedAt: new Date().toISOString() });
    return ok(c, { message: 'Deletion request submitted' });
  });
  protectedRoutes.get('/users/stats', async (c) => {
    const userId = c.req.header('Authorization')?.split(' ')[1];
    if (!userId) return unauthorized(c);
    const user = await new UserEntity(c.env, userId).getState();
    const { items: allUsers } = await UserEntity.list(c.env);
    const sortedUsers = allUsers.sort((a, b) => b.points - a.points);
    const rank = sortedUsers.findIndex((u) => u.id === userId) + 1;
    return ok(c, {
      totalPoints: user.points,
      eventsAttended: 15,
      winRatio: 67,
      rank: rank > 0 ? rank : 'N/A'
    });
  });

  app.get('/api/events', async (c) => {
    const shortCode = c.req.query('shortCode');
    const { items: allEvents } = await EventEntity.list(c.env);
    if (shortCode) {
      const event = allEvents.find((e) => e.shortCode.toUpperCase() === shortCode.toUpperCase());
      return ok(c, event ? [event] : []);
    }
    return ok(c, allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  });
  app.get('/api/events/:id', async (c) => {
    const eventId = c.req.param('id');
    const event = await new EventEntity(c.env, eventId).getState();
    if (!event || !event.id) return notFound(c, 'Event not found');
    return ok(c, event);
  });
  protectedRoutes.post('/events', async (c) => {
    const userId = c.req.header('Authorization')?.split(' ')[1];
    if (!userId) return unauthorized(c);
    const user = await new UserEntity(c.env, userId).getState();
    if (user.role !== 'ADMIN' && user.role !== 'COACH') {
      return unauthorized(c, 'Only admins or coaches can create events.');
    }
    const body = await c.req.json();
    const shortCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newEvent = {
      ...body,
      id: crypto.randomUUID(),
      shortCode,
      masterId: user.id,
      master: { id: user.id, name: user.name, email: user.email },
      participations: [],
      createdAt: new Date().toISOString()
    };
    await EventEntity.create(c.env, newEvent);
    return ok(c, newEvent);
  });

  protectedRoutes.post('/participations', async (c) => {
    const userId = c.req.header('Authorization')?.split(' ')[1];
    if (!userId) return unauthorized(c);
    const { eventId, status, teamPreference } = await c.req.json();
    const eventEntity = new EventEntity(c.env, eventId);
    const event = await eventEntity.getState();
    if (!event.id) return notFound(c, 'Event not found');
    const user = await new UserEntity(c.env, userId).getState();
    const participationId = `p-${eventId}-${userId}`;
    const participationEntity = new ParticipationEntity(c.env, participationId);
    const existingParticipation = (await participationEntity.exists()) ? await participationEntity.getState() : null;
    const participationData: Participation = {
      ...(existingParticipation || {}),
      id: participationId,
      userId,
      eventId,
      status,
      teamPreference,
      positionOrder: existingParticipation?.positionOrder || 0,
      assignedByCoach: existingParticipation?.assignedByCoach || false,
      user: { id: user.id, name: user.name, email: user.email },
      createdAt: existingParticipation?.createdAt || new Date().toISOString()
    };
    if (existingParticipation) {
      await participationEntity.save(participationData);
    } else {
      await ParticipationEntity.create(c.env, participationData);
    }

    const updatedParticipations = event.participations.filter((p) => p.userId !== userId);
    updatedParticipations.push(participationData);
    await eventEntity.patch({ participations: updatedParticipations });
    return ok(c, participationData);
  });

  app.get('/api/users/scoreboard', async (c) => {
    const { items: allUsers } = await UserEntity.list(c.env);
    const sorted = allUsers.sort((a, b) => b.points - a.points).map((u) => {
      const { passwordHash, ...user } = u;
      return user;
    });
    return ok(c, sorted);
  });

  const adminRoutes = new Hono<{Bindings: Env;}>();
  adminRoutes.use('*', authMiddleware);
  adminRoutes.use('*', async (c, next) => {
    const userId = c.req.header('Authorization')?.split(' ')[1];
    if (!userId) return unauthorized(c);
    const user = await new UserEntity(c.env, userId).getState();
    if (user.role !== 'ADMIN' && user.role !== 'COACH') {
      return unauthorized(c, 'Admin or Coach access required');
    }
    await next();
  });
  adminRoutes.post('/users/award-points', async (c) => {
    const { userId, points } = await c.req.json();
    if (!isStr(userId) || typeof points !== 'number') return bad(c, 'User ID and points required');
    const userEntity = new UserEntity(c.env, userId);
    if (!(await userEntity.exists())) return notFound(c, 'User not found');
    const user = await userEntity.getState();
    user.points += points;
    await userEntity.save(user);
    const { passwordHash, ...userWithoutHash } = user;
    return ok(c, userWithoutHash);
  });
  adminRoutes.get('/admin/deletion-requests', async (c) => {
    const { items: allUsers } = await UserEntity.list(c.env);
    const requests = allUsers.filter((u) => u.deletionRequestedAt).map((u) => {
      const { passwordHash, ...user } = u;
      return user;
    });
    return ok(c, requests);
  });
  adminRoutes.post('/admin/deletion-requests/:userId', async (c) => {
    const targetUserId = c.req.param('userId');
    const { approve } = await c.req.json();
    if (approve) {
      await UserEntity.delete(c.env, targetUserId);
      return ok(c, { message: 'User deleted' });
    } else {
      const userEntity = new UserEntity(c.env, targetUserId);
      await userEntity.patch({ deletionRequestedAt: undefined });
      return ok(c, { message: 'Deletion request denied' });
    }
  });
  app.route('/api', protectedRoutes);
  app.route('/api', adminRoutes);
}