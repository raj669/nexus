import express, { Request, Response } from 'express';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { analyticsByRole, createInitialState } from '../src/lib/lmsData.ts';
import type { AppState, Assignment, CalendarEvent, Classroom, DiscussionThread, NotificationItem, ResourceItem, Role } from '../src/lib/types.ts';
import { generateAssignmentFeedback, generateQuiz, summarizeDiscussion, summarizeText } from './ai.ts';
import { buildPlatformHealth, deriveNextBestAction, scoreSubmissionQuality } from './learning.ts';
import { getJwtSecret, hashPassword, signJwt, verifyJwt } from './security.ts';
import { store } from './store.ts';
import { toPublicAppState, toPublicSnapshot, toPublicUser, type AuthContext, type BackendSnapshot } from './types.ts';

const API_PREFIX = '/api';
const DEFAULT_PORT = 4000;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const PUBLIC_ROUTES = new Set(['health', 'meta', 'auth/login', 'ai/study-copilot/summary', 'ai/study-copilot/quiz', 'ai/assignment-feedback', 'ai/discussion-summary']);

const requireAuth = (req: Request, res: Response): AuthContext | null => {
  const authorization = req.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing bearer token.' });
    return null;
  }

  const token = authorization.slice('Bearer '.length).trim();
  const payload = verifyJwt(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token.' });
    return null;
  }

  const session = store.getSession(token);
  if (!session || session.expiresAt <= Date.now()) {
    res.status(401).json({ error: 'Session has expired.' });
    return null;
  }

  const user = store.findUserById(session.userId);
  if (!user) {
    res.status(401).json({ error: 'Unknown user.' });
    return null;
  }

  return {
    token,
    user: toPublicUser(user),
    role: user.role,
  };
};

const requireRole = (auth: AuthContext, roles: Role[]) => roles.includes(auth.role);

const createClassCode = () => `NX-${Math.floor(1000 + Math.random() * 8999)}`;

const classColor = () => {
  const palette = ['#3b82f6', '#7c3aed', '#0f766e', '#f59e0b', '#db2777'];
  return palette[Math.floor(Math.random() * palette.length)];
};

const mentionsFromMessage = (message: string) => {
  const matches = message.match(/@([a-zA-Z0-9_]+)/g) ?? [];
  return matches.map((item) => item.slice(1));
};

const getCurrentSnapshot = () => store.getSnapshot();

const sanitizeAndReturnState = (snapshot: BackendSnapshot, res: Response) => {
  res.json(toPublicSnapshot(snapshot));
};

const createJsonRoute = (handler: (req: Request, res: Response) => void | Promise<void>) => async (req: Request, res: Response) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while processing the request.' });
  }
};

export const createLearningOsApp = () => {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '5mb' }));

  app.get(`${API_PREFIX}/health`, createJsonRoute((_req, res) => {
    res.json({
      ok: true,
      service: 'learning-os-api',
      version: '1.0.0',
      secretConfigured: Boolean(getJwtSecret()),
      timestamp: new Date().toISOString(),
    });
  }));

  app.get(`${API_PREFIX}/meta`, createJsonRoute((_req, res) => {
    res.json({
      modules: ['auth', 'classes', 'assignments', 'collaboration', 'analytics', 'notifications', 'ai', 'storage'],
      capabilities: ['jwt-auth', 'role-based-access', 'real-time-ready', 'file-storage-ready', 'ai-assistance', 'sse-streams'],
      database: 'postgresql',
      cache: 'redis',
      storage: 's3-compatible',
      realtime: 'sse/websocket-ready',
    });
  }));

  app.post(`${API_PREFIX}/auth/login`, createJsonRoute((req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = store.findUserByEmail(email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const { token, expiresAt } = signJwt({ sub: user.id, role: user.role }, SESSION_TTL_MS);
    store.recordSession({
      token,
      userId: user.id,
      role: user.role,
      issuedAt: Date.now(),
      expiresAt,
    });

    store.createAnalyticsEvent('auth', 'login_success', { role: user.role }, user.id);

    res.json({
      token,
      expiresAt,
      user: toPublicUser(user),
    });
  }));

  app.get(`${API_PREFIX}/auth/me`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    res.json({
      user: auth.user,
      role: auth.role,
      permissions: getCurrentSnapshot().permissions.filter((permission) => permission.userId === auth.user.id),
    });
  }));

  app.get(`${API_PREFIX}/state`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    const snapshot = getCurrentSnapshot();
    res.json({
      ...toPublicSnapshot(snapshot),
      session: {
        token: auth.token,
        userId: auth.user.id,
        role: auth.role,
      },
    });
  }));

  app.put(`${API_PREFIX}/state`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    const { app: nextApp } = req.body as { app?: AppState };
    if (!nextApp) {
      res.status(400).json({ error: 'Missing app payload.' });
      return;
    }

    store.replaceApp({
      ...nextApp,
      session: null,
    });

    res.json({ ok: true, state: store.getPublicSnapshot() });
  }));

  app.get(`${API_PREFIX}/classes`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    const { classes } = getCurrentSnapshot().app;
    res.json({ classes });
  }));

  app.post(`${API_PREFIX}/classes`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth || !requireRole(auth, ['teacher', 'admin'])) {
      res.status(403).json({ error: 'Only teachers and admins can create classes.' });
      return;
    }

    const { title, subject, section, description } = req.body as { title?: string; subject?: string; section?: string; description?: string };
    if (!title || !subject || !section || !description) {
      res.status(400).json({ error: 'All class fields are required.' });
      return;
    }

    const snapshot = store.update((draft) => {
      const classroom: Classroom = {
        id: `class-${randomUUID()}`,
        code: createClassCode(),
        title,
        subject,
        section,
        teacherId: auth.user.id,
        teacherName: auth.user.name,
        color: classColor(),
        description,
        students: 0,
        archived: false,
        progress: 0,
        nextDeadline: 'No deadline set',
        meetingTime: 'TBD',
        tags: [subject, section],
        sections: [{ id: `section-${randomUUID()}`, name: section, studentCount: 0 }],
        resourceCount: 0,
        unreadMessages: 0,
      };

      draft.app.classes = [classroom, ...draft.app.classes];
      draft.app.notifications = [
        {
          id: `note-${randomUUID()}`,
          title: 'Class created',
          description: `${title} is now available for invites.`,
          priority: 'normal',
          unread: true,
          time: 'Just now',
          kind: 'class',
        },
        ...draft.app.notifications,
      ];
      draft.goals = [
        ...draft.goals,
        {
          id: `goal-${randomUUID()}`,
          userId: auth.user.id,
          classId: classroom.id,
          title: `Launch ${title}`,
          targetType: 'classroom',
          targetValue: 1,
          progressValue: 0,
          status: 'active',
        },
      ];
      draft.analyticsEvents = [
        {
          id: `event-${randomUUID()}`,
          userId: auth.user.id,
          classId: classroom.id,
          type: 'classroom',
          name: 'class_created',
          payload: { title },
          createdAt: new Date().toISOString(),
        },
        ...draft.analyticsEvents,
      ];
    });

    res.status(201).json({ class: snapshot.app.classes[0] });
  }));

  app.post(`${API_PREFIX}/classes/join`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    const { code } = req.body as { code?: string };
    if (!code) {
      res.status(400).json({ error: 'Class code is required.' });
      return;
    }

    const classroom = store.getSnapshot().app.classes.find((item) => item.code.toLowerCase() === code.toLowerCase().trim());
    if (!classroom) {
      res.status(404).json({ error: 'Class not found.' });
      return;
    }

    const snapshot = store.update((draft) => {
      draft.app.classes = draft.app.classes.map((item) => item.id === classroom.id ? { ...item, students: item.students + 1 } : item);
      draft.app.notifications = [
        {
          id: `note-${randomUUID()}`,
          title: 'Joined class',
          description: `You joined ${classroom.title}.`,
          priority: 'normal',
          unread: true,
          time: 'Just now',
          kind: 'enrollment',
        },
        ...draft.app.notifications,
      ];
    });

    res.json({ class: snapshot.app.classes.find((item) => item.id === classroom.id) });
  }));

  app.post(`${API_PREFIX}/classes/:classId/archive`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth || !requireRole(auth, ['teacher', 'admin'])) {
      res.status(403).json({ error: 'Only teachers and admins can archive classes.' });
      return;
    }

    const { classId } = req.params;
    const classroom = store.findClassById(classId);
    if (!classroom) {
      res.status(404).json({ error: 'Class not found.' });
      return;
    }

    if (auth.role === 'teacher' && classroom.teacherId !== auth.user.id) {
      res.status(403).json({ error: 'You can only archive classes you own.' });
      return;
    }

    store.update((draft) => {
      draft.app.classes = draft.app.classes.map((item) => item.id === classId ? { ...item, archived: true } : item);
    });

    res.json({ ok: true });
  }));

  app.get(`${API_PREFIX}/assignments`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    res.json({ assignments: getCurrentSnapshot().app.assignments });
  }));

  app.post(`${API_PREFIX}/assignments`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth || !requireRole(auth, ['teacher', 'admin'])) {
      res.status(403).json({ error: 'Only teachers and admins can create assignments.' });
      return;
    }

    const { classId, title, kind, dueDate, maxPoints, description } = req.body as {
      classId?: string;
      title?: string;
      kind?: Assignment['kind'];
      dueDate?: string;
      maxPoints?: number;
      description?: string;
    };

    if (!classId || !title || !kind || !dueDate || !maxPoints || !description) {
      res.status(400).json({ error: 'Missing assignment fields.' });
      return;
    }

    const assignment: Assignment = {
      id: `assignment-${randomUUID()}`,
      classId,
      title,
      kind,
      dueDate,
      status: 'assigned',
      maxPoints,
      submissions: 0,
      averageScore: 0,
      manualReview: kind !== 'quiz',
      aiPlagiarismScore: 0,
      description,
      rubric: ['Accuracy', 'Clarity', 'Timeliness'],
    };

    store.update((draft) => {
      draft.app.assignments = [assignment, ...draft.app.assignments];
      draft.analyticsEvents = [
        {
          id: `event-${randomUUID()}`,
          userId: auth.user.id,
          classId,
          type: 'assignment',
          name: 'assignment_created',
          payload: { assignmentId: assignment.id, title },
          createdAt: new Date().toISOString(),
        },
        ...draft.analyticsEvents,
      ];
    });

    res.status(201).json({ assignment });
  }));

  app.get(`${API_PREFIX}/discussions/:classId`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    res.json({ discussions: getCurrentSnapshot().app.discussions.filter((item) => item.classId === req.params.classId) });
  }));

  app.post(`${API_PREFIX}/discussions`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    const { classId, author, message, role } = req.body as { classId?: string; author?: string; message?: string; role?: Role };
    if (!classId || !author || !message || !role) {
      res.status(400).json({ error: 'Missing discussion fields.' });
      return;
    }

    const thread: DiscussionThread = {
      id: `thread-${randomUUID()}`,
      classId,
      author,
      role,
      message,
      time: 'Just now',
      replies: 0,
      mentions: mentionsFromMessage(message),
      pinned: false,
    };

    store.update((draft) => {
      draft.app.discussions = [thread, ...draft.app.discussions];
      draft.analyticsEvents = [
        {
          id: `event-${randomUUID()}`,
          userId: auth.user.id,
          classId,
          type: 'discussion',
          name: 'thread_created',
          payload: { threadId: thread.id },
          createdAt: new Date().toISOString(),
        },
        ...draft.analyticsEvents,
      ];
    });

    res.status(201).json({ thread });
  }));

  app.get(`${API_PREFIX}/messages/:classId`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    res.json({ messages: getCurrentSnapshot().app.messages.filter((item) => item.classId === req.params.classId) });
  }));

  app.post(`${API_PREFIX}/messages`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    const { classId, sender, role, message } = req.body as { classId?: string; sender?: string; role?: Role; message?: string };
    if (!classId || !sender || !role || !message) {
      res.status(400).json({ error: 'Missing message fields.' });
      return;
    }

    const chatMessage = {
      id: `message-${randomUUID()}`,
      classId,
      sender,
      role,
      message,
      time: 'Now',
    };

    store.update((draft) => {
      draft.app.messages = [...draft.app.messages, chatMessage];
    });

    res.status(201).json({ message: chatMessage });
  }));

  app.get(`${API_PREFIX}/notifications`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    res.json({ notifications: getCurrentSnapshot().app.notifications });
  }));

  app.patch(`${API_PREFIX}/notifications/:notificationId/read`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    const { notificationId } = req.params;
    store.update((draft) => {
      draft.app.notifications = draft.app.notifications.map((item) => item.id === notificationId ? { ...item, unread: false } : item);
    });

    res.json({ ok: true });
  }));

  app.get(`${API_PREFIX}/events`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    res.json({ events: getCurrentSnapshot().app.events });
  }));

  app.post(`${API_PREFIX}/events`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth || !requireRole(auth, ['teacher', 'admin'])) {
      res.status(403).json({ error: 'Only teachers and admins can create events.' });
      return;
    }

    const { title, classId, date, startTime, endTime, type } = req.body as { title?: string; classId?: string; date?: string; startTime?: string; endTime?: string; type?: CalendarEvent['type'] };
    if (!title || !classId || !date || !startTime || !endTime || !type) {
      res.status(400).json({ error: 'Missing event fields.' });
      return;
    }

    const event: CalendarEvent = {
      id: `event-${randomUUID()}`,
      title,
      classId,
      date,
      startTime,
      endTime,
      type,
      color: classColor(),
    };

    store.update((draft) => {
      draft.app.events = [event, ...draft.app.events];
    });

    res.status(201).json({ event });
  }));

  app.get(`${API_PREFIX}/resources`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    res.json({ resources: getCurrentSnapshot().app.resources });
  }));

  app.post(`${API_PREFIX}/resources`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth || !requireRole(auth, ['teacher', 'admin'])) {
      res.status(403).json({ error: 'Only teachers and admins can add resources.' });
      return;
    }

    const { classId, name, type, size, preview } = req.body as { classId?: string; name?: string; type?: ResourceItem['type']; size?: string; preview?: string };
    if (!classId || !name || !type || !size || !preview) {
      res.status(400).json({ error: 'Missing resource fields.' });
      return;
    }

    const resource: ResourceItem = {
      id: `resource-${randomUUID()}`,
      classId,
      name,
      type,
      size,
      preview,
      updatedAt: 'Just now',
    };

    store.update((draft) => {
      draft.app.resources = [resource, ...draft.app.resources];
    });

    res.status(201).json({ resource });
  }));

  app.get(`${API_PREFIX}/analytics/overview`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    const role = (req.query.role as Role | undefined) ?? auth.role;
    const analytics = analyticsByRole[role] ?? analyticsByRole.student;
    res.json({
      role,
      analytics,
      health: buildPlatformHealth(getCurrentSnapshot()),
      nextBestAction: deriveNextBestAction(getCurrentSnapshot(), auth.user.id),
    });
  }));

  app.get(`${API_PREFIX}/insights/next-best-action/:userId`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    const { userId } = req.params;
    if (auth.user.id !== userId && auth.role !== 'admin') {
      res.status(403).json({ error: 'You can only view your own recommendations.' });
      return;
    }

    res.json({ recommendation: deriveNextBestAction(getCurrentSnapshot(), userId) });
  }));

  app.post(`${API_PREFIX}/ai/study-copilot/summary`, createJsonRoute((req, res) => {
    const { title, text } = req.body as { title?: string; text?: string };
    if (!title || !text) {
      res.status(400).json({ error: 'Title and text are required.' });
      return;
    }

    res.json(summarizeText(title, text));
  }));

  app.post(`${API_PREFIX}/ai/study-copilot/quiz`, createJsonRoute((req, res) => {
    const { title, text, count } = req.body as { title?: string; text?: string; count?: number };
    if (!title || !text) {
      res.status(400).json({ error: 'Title and text are required.' });
      return;
    }

    res.json(generateQuiz(title, text, count ?? 3));
  }));

  app.post(`${API_PREFIX}/ai/assignment-feedback`, createJsonRoute((req, res) => {
    const { submissionText, rubric } = req.body as { submissionText?: string; rubric?: string[] };
    if (!submissionText) {
      res.status(400).json({ error: 'Submission text is required.' });
      return;
    }

    res.json(generateAssignmentFeedback(submissionText, rubric ?? []));
  }));

  app.post(`${API_PREFIX}/ai/discussion-summary`, createJsonRoute((req, res) => {
    const { title, messages } = req.body as { title?: string; messages?: string[] };
    if (!title || !messages?.length) {
      res.status(400).json({ error: 'Title and messages are required.' });
      return;
    }

    res.json(summarizeDiscussion(title, messages));
  }));

  app.get(`${API_PREFIX}/notifications/stream`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = () => {
      const snapshot = getCurrentSnapshot();
      const unread = snapshot.app.notifications.filter((item) => item.unread).length;
      res.write(`data: ${JSON.stringify({ unread, timestamp: new Date().toISOString() })}\n\n`);
    };

    sendEvent();
    const timer = setInterval(sendEvent, 15000);

    req.on('close', () => {
      clearInterval(timer);
      res.end();
    });
  }));

  app.post(`${API_PREFIX}/admin/reset-demo`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth || auth.role !== 'admin') {
      res.status(403).json({ error: 'Only admins can reset the demo state.' });
      return;
    }

    store.replaceApp({
      ...createInitialState(),
      session: null,
    });

    res.json({ ok: true, state: store.getPublicSnapshot() });
  }));

  const distPath = resolve(process.cwd(), 'dist');
  const hasFrontendBuild = existsSync(join(distPath, 'index.html'));

  if (hasFrontendBuild) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith(API_PREFIX)) {
        next();
        return;
      }

      res.sendFile(join(distPath, 'index.html'));
    });
  }

  app.use((error: unknown, _req: Request, res: Response, _next: express.NextFunction) => {
    console.error(error);
    res.status(500).json({ error: 'Unexpected server error.' });
  });

  return app;
};
