import { STORAGE_KEY } from './lmsData';
import type {
  AnalyticsSnapshot,
  AppState,
  Role,
  UserAccount,
} from './types';

export interface LoginResult {
  token: string;
  expiresAt: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    title: string;
    avatar: string;
    bio: string;
    locale: string;
    xp: number;
    badges: string[];
  };
}

export type PublicUserAccount = Omit<UserAccount, 'passwordHash'>;

export interface PublicAppState extends Omit<AppState, 'users'> {
  users: PublicUserAccount[];
}

export interface DashboardStateResponse {
  app: PublicAppState;
  session: {
    token: string;
    userId: string;
    role: Role;
  } | null;
}

export interface AnalyticsOverviewResponse {
  role: Role;
  analytics: AnalyticsSnapshot;
  health: {
    score: number;
    uptime: string;
    activeUsers: number;
    openClasses: number;
    pendingActions: number;
  };
  nextBestAction: {
    title: string;
    reason: string;
    action: string;
    priority: 'high' | 'normal' | 'low';
    entityType: string;
    entityId: string;
  };
}

export interface WidgetOrderResponse {
  ok: true;
  state: DashboardStateResponse;
}

const API_BASE = '/api';

const jsonHeaders = {
  'Content-Type': 'application/json',
};

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { session?: { token?: string } };
    return parsed.session?.token ?? null;
  } catch {
    return null;
  }
};

const authHeaders = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...jsonHeaders,
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error ?? 'Request failed');
  }

  return data as T;
}

export const api = {
  login: (email: string, password: string) => request<LoginResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  health: () => request('/health'),
  state: () => request<DashboardStateResponse>('/state', {
    headers: authHeaders(),
  }),
  analyticsOverview: () => request<AnalyticsOverviewResponse>('/analytics/overview', {
    headers: authHeaders(),
  }),
  updateWidgetOrder: (widgetOrder: string[]) => request<WidgetOrderResponse>('/preferences/widget-order', {
    method: 'PUT',
    body: JSON.stringify({ widgetOrder }),
    headers: authHeaders(),
  }),
  nextBestAction: (userId: string, token: string) => request(`/insights/next-best-action/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }),
};
