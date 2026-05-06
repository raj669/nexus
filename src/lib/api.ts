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

const API_BASE = '/api';

const jsonHeaders = {
  'Content-Type': 'application/json',
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
  nextBestAction: (userId: string, token: string) => request(`/insights/next-best-action/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }),
};
