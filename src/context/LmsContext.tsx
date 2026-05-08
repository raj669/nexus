import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import {
  AppState,
  Assignment,
  CalendarEvent,
  Classroom,
  ChatMessage,
  DiscussionThread,
  NotificationItem,
  ResourceItem,
  SessionInfo,
  ThemeMode,
  UserAccount,
} from '../lib/types';
import {
  STORAGE_KEY,
  createInitialState,
  defaultPreferences,
} from '../lib/lmsData';
import { api } from '../lib/api';

interface SignInPayload {
  email: string;
  password: string;
}

interface ClassPayload {
  title: string;
  subject: string;
  section: string;
  description: string;
}

interface AssignmentPayload {
  classId: string;
  title: string;
  kind: Assignment['kind'];
  dueDate: string;
  maxPoints: number;
  description: string;
}

interface EventPayload {
  title: string;
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: CalendarEvent['type'];
}

interface ResourcePayload {
  classId: string;
  name: string;
  type: ResourceItem['type'];
  size: string;
  preview: string;
}

interface LmsContextValue {
  state: AppState;
  currentUser: UserAccount | null;
  currentRole: UserAccount['role'] | null;
  analyticsKey: string;
  signIn: (payload: SignInPayload) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  setLanguage: (language: string) => void;
  reorderWidgets: (nextOrder: string[]) => void;
  createClassroom: (payload: ClassPayload) => void;
  joinClassroom: (code: string) => void;
  archiveClassroom: (classId: string) => void;
  createAssignment: (payload: AssignmentPayload) => void;
  createThread: (payload: { classId: string; author: string; message: string; role: UserAccount['role'] }) => void;
  sendMessage: (payload: { classId: string; sender: string; role: UserAccount['role']; message: string }) => void;
  markNotificationRead: (notificationId: string) => void;
  createEvent: (payload: EventPayload) => void;
  addResource: (payload: ResourcePayload) => void;
  resetDemoData: () => void;
}

const LmsContext = createContext<LmsContextValue | undefined>(undefined);

const loadState = (): AppState => {
  if (typeof window === 'undefined') {
    return createInitialState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createInitialState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const base = createInitialState();

    // Normalize classrooms to ensure they have enrolledStudentIds
    const classes = parsed.classes?.length 
      ? parsed.classes.map((classroom: any) => ({
          ...classroom,
          enrolledStudentIds: classroom.enrolledStudentIds || [],
        }))
      : base.classes;

    return {
      ...base,
      ...parsed,
      preferences: {
        ...base.preferences,
        ...parsed.preferences,
        widgetOrder: parsed.preferences?.widgetOrder?.length ? parsed.preferences.widgetOrder : base.preferences.widgetOrder,
      },
      users: parsed.users?.length ? parsed.users : base.users,
      classes,
      assignments: parsed.assignments?.length ? parsed.assignments : base.assignments,
      discussions: parsed.discussions?.length ? parsed.discussions : base.discussions,
      messages: parsed.messages?.length ? parsed.messages : base.messages,
      notifications: parsed.notifications?.length ? parsed.notifications : base.notifications,
      events: parsed.events?.length ? parsed.events : base.events,
      resources: parsed.resources?.length ? parsed.resources : base.resources,
    };
  } catch {
    return createInitialState();
  }
};

const saveState = (state: AppState) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const sha256 = async (value: string) => {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const buildId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export function LmsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    saveState(state);
    document.documentElement.dataset.theme = state.preferences.theme;
    document.body.dataset.theme = state.preferences.theme;
  }, [state]);

  const currentUser = state.session ? state.users.find((user) => user.id === state.session?.userId) ?? null : null;
  const currentRole = currentUser?.role ?? null;
  const analyticsKey = currentRole ?? 'student';

  const updateSession = (session: SessionInfo | null) => {
    setState((previous) => ({ ...previous, session }));
  };

  const signIn = async ({ email, password }: SignInPayload) => {
    try {
      const response = await api.login(email, password);
      const user = state.users.find((candidate) => candidate.id === response.user.id) ?? null;

      updateSession({
        token: response.token,
        userId: response.user.id,
        issuedAt: Date.now(),
      });

      if (user) {
        setState((previous) => ({
          ...previous,
          users: previous.users.map((candidate) => candidate.id === user.id ? { ...candidate, ...response.user } : candidate),
        }));
      }

      return { ok: true };
    } catch {
      const user = state.users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return { ok: false, error: 'No account matches that email address.' };
      }

      const hashedPassword = await sha256(password);
      if (hashedPassword !== user.passwordHash) {
        return { ok: false, error: 'Incorrect password.' };
      }

      updateSession({
        token: buildId('jwt'),
        userId: user.id,
        issuedAt: Date.now(),
      });

      return { ok: true };
    }
  };

  const signOut = () => {
    updateSession(null);
  };

  const toggleTheme = () => {
    setState((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        theme: previous.preferences.theme === 'dark' ? 'light' : 'dark',
      },
    }));
  };

  const setTheme = (theme: ThemeMode) => {
    setState((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        theme,
      },
    }));
  };

  const toggleSidebar = () => {
    setState((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        sidebarOpen: !previous.preferences.sidebarOpen,
      },
    }));
  };

  const setLanguage = (language: string) => {
    setState((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        language,
      },
    }));
  };

  const reorderWidgets = (nextOrder: string[]) => {
    setState((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        widgetOrder: nextOrder,
      },
    }));
  };

  const createClassroom = ({ title, subject, section, description }: ClassPayload) => {
    if (!currentUser) {
      return;
    }

    const classroom: Classroom = {
      id: buildId('class'),
      code: `NX-${Math.floor(1000 + Math.random() * 8999)}`,
      title,
      subject,
      section,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      color: '#3b82f6',
      description,
      students: 0,
      archived: false,
      progress: 0,
      nextDeadline: 'No deadline set',
      meetingTime: 'TBD',
      tags: [subject, section],
      sections: [{ id: buildId('section'), name: section, studentCount: 0 }],
      resourceCount: 0,
      unreadMessages: 0,
      enrolledStudentIds: [],
    };

    setState((previous) => ({
      ...previous,
      classes: [classroom, ...previous.classes],
      notifications: [
        {
          id: buildId('note'),
          title: 'Class created',
          description: `${title} is now live and ready for invites.`,
          priority: 'normal',
          unread: true,
          time: 'Just now',
          kind: 'class',
        },
        ...previous.notifications,
      ],
    }));
  };

  const joinClassroom = (code: string) => {
    const classroom = state.classes.find((item) => item.code.toLowerCase() === code.toLowerCase().trim());
    if (!classroom) {
      return;
    }

    // Check if the current user is already enrolled in this class
    if (currentUser && classroom.enrolledStudentIds.includes(currentUser.id)) {
      setState((previous) => ({
        ...previous,
        notifications: [
          {
            id: buildId('note'),
            title: 'Already enrolled',
            description: `You are already enrolled in ${classroom.title}.`,
            priority: 'normal',
            unread: true,
            time: 'Just now',
            kind: 'enrollment',
          },
          ...previous.notifications,
        ],
      }));
      return;
    }

    setState((previous) => ({
      ...previous,
      classes: previous.classes.map((item) =>
        item.id === classroom.id 
          ? { ...item, students: item.students + 1, enrolledStudentIds: currentUser ? [...item.enrolledStudentIds, currentUser.id] : item.enrolledStudentIds } 
          : item,
      ),
      notifications: [
        {
          id: buildId('note'),
          title: 'Joined class',
          description: `You joined ${classroom.title}.`,
          priority: 'normal',
          unread: true,
          time: 'Just now',
          kind: 'enrollment',
        },
        ...previous.notifications,
      ],
    }));
  };

  const archiveClassroom = (classId: string) => {
    setState((previous) => ({
      ...previous,
      classes: previous.classes.map((item) =>
        item.id === classId ? { ...item, archived: true } : item,
      ),
    }));
  };

  const createAssignment = (payload: AssignmentPayload) => {
    const assignment: Assignment = {
      id: buildId('assignment'),
      classId: payload.classId,
      title: payload.title,
      kind: payload.kind,
      dueDate: payload.dueDate,
      status: 'assigned',
      maxPoints: payload.maxPoints,
      submissions: 0,
      averageScore: 0,
      manualReview: payload.kind !== 'quiz',
      aiPlagiarismScore: 0,
      description: payload.description,
      rubric: ['Accuracy', 'Clarity', 'Timeliness'],
    };

    setState((previous) => ({
      ...previous,
      assignments: [assignment, ...previous.assignments],
    }));
  };

  const createThread = ({ classId, author, message, role }: { classId: string; author: string; message: string; role: UserAccount['role'] }) => {
    const thread: DiscussionThread = {
      id: buildId('thread'),
      classId,
      author,
      role,
      message,
      time: 'Just now',
      replies: 0,
      mentions: message.includes('@') ? [message.split('@')[1].split(' ')[0]] : [],
      pinned: false,
    };

    setState((previous) => ({
      ...previous,
      discussions: [thread, ...previous.discussions],
    }));
  };

  const sendMessage = ({ classId, sender, role, message }: { classId: string; sender: string; role: UserAccount['role']; message: string }) => {
    const chatMessage: ChatMessage = {
      id: buildId('message'),
      classId,
      sender,
      role,
      message,
      time: 'Now',
    };

    setState((previous) => ({
      ...previous,
      messages: [...previous.messages, chatMessage],
    }));
  };

  const markNotificationRead = (notificationId: string) => {
    setState((previous) => ({
      ...previous,
      notifications: previous.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, unread: false } : notification,
      ),
    }));
  };

  const createEvent = (payload: EventPayload) => {
    const event: CalendarEvent = {
      id: buildId('event'),
      title: payload.title,
      classId: payload.classId,
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      type: payload.type,
      color: '#3b82f6',
    };

    setState((previous) => ({
      ...previous,
      events: [event, ...previous.events],
    }));
  };

  const addResource = (payload: ResourcePayload) => {
    const resource: ResourceItem = {
      id: buildId('resource'),
      classId: payload.classId,
      name: payload.name,
      type: payload.type,
      size: payload.size,
      updatedAt: 'Just now',
      preview: payload.preview,
    };

    setState((previous) => ({
      ...previous,
      resources: [resource, ...previous.resources],
    }));
  };

  const resetDemoData = () => {
    setState(createInitialState());
  };

  return (
    <LmsContext.Provider
      value={{
        state,
        currentUser,
        currentRole,
        analyticsKey,
        signIn,
        signOut,
        toggleTheme,
        setTheme,
        toggleSidebar,
        setLanguage,
        reorderWidgets,
        createClassroom,
        joinClassroom,
        archiveClassroom,
        createAssignment,
        createThread,
        sendMessage,
        markNotificationRead,
        createEvent,
        addResource,
        resetDemoData,
      }}
    >
      {children}
    </LmsContext.Provider>
  );
}

export const useLms = () => {
  const context = useContext(LmsContext);
  if (!context) {
    throw new Error('useLms must be used within a LmsProvider');
  }

  return context;
};

export const guestPreferences = defaultPreferences;
