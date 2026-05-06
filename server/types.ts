import type { AppState, Role, UserAccount } from '../src/lib/types.ts';

export type PublicUserAccount = Omit<UserAccount, 'passwordHash'>;

export interface SessionRecord {
  token: string;
  userId: string;
  role: Role;
  issuedAt: number;
  expiresAt: number;
}

export interface SubmissionRecord {
  id: string;
  assignmentId: string;
  studentId: string;
  contentText: string;
  fileUrl?: string;
  submittedAt: string;
  score?: number;
  teacherFeedback?: string;
  aiFeedback?: string;
  plagiarismScore: number;
  qualityScore: number;
  lateFlag: boolean;
}

export interface AnalyticsEventRecord {
  id: string;
  userId: string;
  classId?: string;
  type: string;
  name: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface GoalRecord {
  id: string;
  userId: string;
  classId?: string;
  title: string;
  targetType: string;
  targetValue: number;
  progressValue: number;
  dueAt?: string;
  status: 'active' | 'completed' | 'paused';
}

export interface PermissionRecord {
  id: string;
  userId: string;
  permissionKey: string;
  scopeType: 'global' | 'class';
  scopeId: string;
  createdAt: string;
}

export interface BackendSnapshot {
  app: AppState;
  submissions: SubmissionRecord[];
  analyticsEvents: AnalyticsEventRecord[];
  sessions: SessionRecord[];
  goals: GoalRecord[];
  permissions: PermissionRecord[];
}

export interface PublicAppState extends Omit<AppState, 'users'> {
  users: PublicUserAccount[];
}

export interface PublicSnapshot extends Omit<BackendSnapshot, 'app'> {
  app: PublicAppState;
}

export interface LoginResponse {
  token: string;
  expiresAt: number;
  user: PublicUserAccount;
}

export interface AuthContext {
  token: string;
  user: PublicUserAccount;
  role: Role;
}

export interface NextBestAction {
  title: string;
  reason: string;
  action: string;
  priority: 'high' | 'normal' | 'low';
  entityType: string;
  entityId: string;
}

export interface AiSummaryResponse {
  title: string;
  summary: string;
  simpleExplanation: string;
  keyPoints: string[];
}

export interface QuizQuestion {
  question: string;
  answer: string;
  hint: string;
}

export interface AiQuizResponse {
  title: string;
  questions: QuizQuestion[];
}

export interface AiFeedbackResponse {
  title: string;
  score: number;
  strengths: string[];
  concerns: string[];
  nextSteps: string[];
}

export interface DiscussionSummaryResponse {
  title: string;
  summary: string;
  highlights: string[];
  actionItems: string[];
}

export const toPublicUser = (user: UserAccount): PublicUserAccount => {
  const { passwordHash, ...rest } = user;
  return rest;
};

export const toPublicAppState = (app: AppState): PublicAppState => ({
  ...app,
  users: app.users.map(toPublicUser),
});

export const toPublicSnapshot = (snapshot: BackendSnapshot): PublicSnapshot => ({
  ...snapshot,
  app: toPublicAppState(snapshot.app),
});
