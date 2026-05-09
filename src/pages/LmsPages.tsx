import { FormEvent, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Archive,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  CloudUpload,
  Edit3,
  FolderOpen,
  GraduationCap,
  Globe,
  Grid3X3,
  HeartHandshake,
  Lightbulb,
  Lock,
  LogIn,
  MessageCircle,
  Moon,
  MoveRight,
  PanelTop,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Sun,
  Target,
  Trash2,
  Users,
  Video,
  Workflow,
} from 'lucide-react';
import { useLms } from '../context/LmsContext';
import { api } from '../lib/api';
import type { AnalyticsOverviewResponse, DashboardStateResponse } from '../lib/api';
import { analyticsByRole } from '../lib/lmsData';
import {
  Assignment,
  CalendarEvent,
  Classroom,
  DiscussionThread,
  NotificationItem,
  ResourceItem,
  Role,
  StudentSubmission,
  UserAccount,
} from '../lib/types';

const roleLabels: Record<Role, string> = {
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Admin',
};

const widgetMeta = {
  progress: {
    icon: Target,
    title: 'Progress Snapshot',
    description: 'Completion, streaks, and recent momentum.',
  },
  classes: {
    icon: BookOpen,
    title: 'Classroom Focus',
    description: 'Active classes, codes, and sections.',
  },
  assignments: {
    icon: ClipboardCheck,
    title: 'Assignment Queue',
    description: 'Due work, grading status, and rubrics.',
  },
  activity: {
    icon: MessageCircle,
    title: 'Collaboration Feed',
    description: 'Discussions, chat, mentions, and replies.',
  },
  assistant: {
    icon: Sparkles,
    title: 'Study Assistant',
    description: 'Summaries, recommendations, and quick help.',
  },
  calendar: {
    icon: CalendarDays,
    title: 'Schedule Lens',
    description: 'Deadlines, meetings, and reminders.',
  },
};

function ClipboardCheck(props: { className?: string }) {
  return <CheckCircle2 className={props.className} />;
}

const widgetOrderMap = ['progress', 'classes', 'assignments', 'activity', 'assistant', 'calendar'];

const quickAccounts = [
  { role: 'student' as const, email: 'alex@uniplanner.dev' },
  { role: 'teacher' as const, email: 'sarah@uniplanner.dev' },
  { role: 'admin' as const, email: 'admin@uniplanner.dev' },
];

const metricClass = 'rounded-3xl border border-border-subtle bg-[var(--panel)] p-5 shadow-[0_20px_80px_rgba(15,23,42,0.18)]';

function StatCard({ title, value, note, icon: Icon, accent }: { title: string; value: string | number; note: string; icon: typeof Sparkles; accent: string; key?: string | number }) {
  return (
    <div className={metricClass}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-text-muted">{title}</p>
          <h3 className="mt-2 text-3xl font-semibold text-text-primary">{value}</h3>
        </div>
        <div className={`rounded-2xl p-3 ${accent}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <p className="mt-4 text-sm text-text-secondary">{note}</p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-border-subtle">
      <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

function ShellSection({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className={metricClass}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ViewPill({ label }: { label: string; key?: string | number }) {
  return <span className="rounded-full border border-border-subtle bg-white/5 px-3 py-1 text-xs font-medium text-text-secondary">{label}</span>;
}

function getClassColor(classroom: Classroom) {
  return { backgroundColor: classroom.color };
}

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useLms();
  const [email, setEmail] = useState('alex@uniplanner.dev');
  const [password, setPassword] = useState('classroom123!');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const result = await signIn({ email, password });
    setBusy(false);

    if (!result.ok) {
      setError(result.error ?? 'Unable to sign in.');
      return;
    }

    navigate('/app', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.16),_transparent_30%),linear-gradient(180deg,#020617,#0f172a_45%,#111827)] text-text-primary">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-8 md:gap-8 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-8">
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:rounded-3xl sm:p-6 lg:rounded-[2rem] lg:p-12">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-6 sm:gap-8 lg:gap-10">
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-text-secondary sm:gap-3 sm:px-4 sm:py-2 sm:text-sm">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent sm:h-4 sm:w-4" />
                UniPlanner for modern classrooms
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Classroom software that actually moves faster than the work.
                </h1>
                <p className="max-w-xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
                  A role-aware LMS for students, teachers, and administrators with real CRUD, live collaboration, analytics, scheduling, and persistent preferences.
                </p>
              </div>
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Role access</p>
                  <p className="mt-2 text-xl font-semibold text-white">JWT-ready sessions</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Workflow</p>
                  <p className="mt-2 text-xl font-semibold text-white">Assignments, chat, files</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-muted">UX</p>
                  <p className="mt-2 text-xl font-semibold text-white">Dark, light, mobile-first</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Active classes', value: '12' },
                { label: 'Completion rate', value: '92%' },
                { label: 'Live updates', value: 'Realtime' },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-text-muted">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[var(--panel)] p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:rounded-3xl sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col items-start gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted sm:text-xs">Sign in</p>
                <h2 className="mt-1 text-2xl font-semibold text-text-primary sm:mt-2 sm:text-3xl">Access your workspace</h2>
              </div>
              <div className="rounded-2xl border border-border-subtle bg-white/5 p-2.5 sm:p-3">
                <Lock className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              </div>
            </div>

            <form className="space-y-4 sm:space-y-5" onSubmit={onSubmit}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary sm:mb-2" htmlFor="email">Email</label>
                <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="w-full rounded-xl border border-border-subtle bg-white/5 px-3 py-2 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary/60 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base" placeholder="alex@uniplanner.dev" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary sm:mb-2" htmlFor="password">Password</label>
                <input id="password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-xl border border-border-subtle bg-white/5 px-3 py-2 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary/60 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base" placeholder="classroom123!" />
              </div>

              {error ? (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200 sm:gap-3 sm:rounded-2xl sm:p-4 sm:text-sm">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                  <span>{error}</span>
                </div>
              ) : null}

              <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base">
                {busy ? 'Signing in...' : 'Open workspace'}
                <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </form>

            <div className="mt-4 space-y-2 sm:mt-6 sm:space-y-3">
              <p className="text-xs text-text-secondary sm:text-sm">Quick demo access</p>
              <div className="grid gap-2 sm:gap-3 sm:grid-cols-3">
                {quickAccounts.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword('classroom123!');
                    }}
                    className="rounded-xl border border-border-subtle bg-white/5 px-3 py-2 text-left text-sm transition hover:border-primary/50 hover:bg-primary/10 sm:rounded-2xl sm:px-4 sm:py-3"
                  >
                    <p className="text-[9px] uppercase tracking-[0.24em] text-text-muted sm:text-xs">{roleLabels[account.role]}</p>
                    <p className="mt-0.5 font-semibold text-text-primary sm:mt-1 sm:text-sm">{account.email}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { currentRole } = useLms();
  if (currentRole === 'teacher') return <TeacherDashboard />;
  if (currentRole === 'admin') return <AdminDashboard />;
  return <StudentDashboard />;
}

function StudentDashboard() {
  const navigate = useNavigate();
  const { currentUser, state } = useLms();
  const analytics = analyticsByRole['student'];
  const pendingAssignments = state.assignments.filter((a) => a.status === 'assigned' || a.status === 'draft').slice(0, 4);
  const activeCourses = state.classes.filter((c) => !c.archived).slice(0, 3);
  const upcomingEvents = state.events.filter((e) => e.type === 'deadline' || e.type === 'exam').slice(0, 4);
  const unreadNotifications = state.notifications.filter((n) => n.unread).slice(0, 3);
  const gradedWork = state.submissions.filter((s) => s.score !== undefined).slice(0, 3);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.25),rgba(56,189,248,0.1),rgba(15,118,110,0.08))] p-4 sm:rounded-3xl sm:p-6 lg:rounded-[2rem] lg:p-10">
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[9px] uppercase tracking-widest text-blue-300 sm:px-3 sm:py-1.5 sm:text-xs">
              <BookOpen className="h-3 w-3" />
              Student Portal
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Hey, {currentUser?.name.split(' ')[0] ?? 'Student'}!
            </h1>
            <p className="max-w-xl text-sm text-white/70 sm:text-base lg:text-lg">
              You have <span className="font-semibold text-white">{pendingAssignments.length} pending assignment{pendingAssignments.length !== 1 ? 's' : ''}</span> and a <span className="font-semibold text-amber-300">{analytics.streak}-day streak</span> going. Keep it up!
            </p>
            <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:gap-3">
              <button type="button" onClick={() => navigate('/app/assignments')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-primary/20 transition hover:brightness-110 sm:rounded-2xl sm:px-5 sm:py-2.5 sm:text-sm">
                <ClipboardCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                View Assignments
              </button>
              <button type="button" onClick={() => navigate('/app/classes')} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:rounded-2xl sm:px-5 sm:py-2.5 sm:text-sm">
                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                My Courses
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4 lg:grid-cols-2 lg:min-w-[260px]">
            <div className={metricClass + ' text-center'}>
              <p className="text-[9px] uppercase tracking-widest text-text-muted sm:text-xs">GPA</p>
              <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">{analytics.averageGrade}%</p>
              <p className="mt-0.5 text-[9px] text-text-secondary sm:mt-1 sm:text-xs">Current avg</p>
            </div>
            <div className={metricClass + ' text-center'}>
              <p className="text-[9px] uppercase tracking-widest text-text-muted sm:text-xs">Streak</p>
              <p className="mt-1 text-2xl font-bold text-amber-400 sm:text-3xl">{analytics.streak}d</p>
              <p className="mt-0.5 text-[9px] text-text-secondary sm:mt-1 sm:text-xs">Days active</p>
            </div>
            <div className={metricClass + ' text-center'}>
              <p className="text-[9px] uppercase tracking-widest text-text-muted sm:text-xs">Done</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400 sm:text-3xl">{analytics.completion}%</p>
              <p className="mt-0.5 text-[9px] text-text-secondary sm:mt-1 sm:text-xs">Completion</p>
            </div>
            <div className={metricClass + ' text-center'}>
              <p className="text-[9px] uppercase tracking-widest text-text-muted sm:text-xs">Courses</p>
              <p className="mt-1 text-2xl font-bold text-blue-400 sm:text-3xl">{activeCourses.length}</p>
              <p className="mt-0.5 text-[9px] text-text-secondary sm:mt-1 sm:text-xs">Enrolled</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:gap-6 lg:gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Left column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Pending assignments */}
          <ShellSection
            title="Pending Assignments"
            subtitle="Work due soon — click an assignment to submit."
            action={<button type="button" onClick={() => navigate('/app/assignments')} className="text-xs font-medium text-primary hover:underline sm:text-sm">View all</button>}
          >
            {pendingAssignments.length === 0 ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center text-xs text-emerald-300 sm:rounded-2xl sm:p-5 sm:text-sm">
                All caught up! No pending assignments.
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {pendingAssignments.map((a) => {
                  const cls = state.classes.find((c) => c.id === a.classId);
                  const urgency = a.dueDate ? 'border-l-amber-400' : 'border-l-border-subtle';
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => navigate('/app/assignments')}
                      className={`w-full rounded-xl border border-border-subtle border-l-4 ${urgency} bg-white/5 p-3 text-left transition hover:bg-white/10 sm:rounded-2xl sm:p-4`}
                    >
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-text-primary sm:text-base">{a.title}</p>
                          <p className="mt-0.5 truncate text-xs text-text-secondary sm:mt-1 sm:text-sm">{cls?.title ?? 'Unknown class'} · {a.kind}</p>
                        </div>
                        <div className="text-right">
                          <ViewPill label={a.kind} />
                          {a.dueDate && <p className="mt-1 text-[9px] text-amber-400 font-medium sm:mt-1.5 sm:text-xs">Due {a.dueDate}</p>}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[9px] text-text-muted sm:mt-3 sm:text-xs">
                        <span>{a.maxPoints} pts</span>
                        <span className="flex items-center gap-1 text-primary">Submit work →</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ShellSection>

          {/* My courses */}
          <ShellSection
            title="My Enrolled Courses"
            subtitle="Your current learning progress at a glance."
            action={<button type="button" onClick={() => navigate('/app/classes')} className="text-sm font-medium text-primary hover:underline">All courses</button>}
          >
            <div className="space-y-3">
              {activeCourses.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate(`/app/classes/${c.id}`)}
                  className="w-full rounded-2xl border border-border-subtle bg-white/5 p-4 text-left transition hover:border-primary/40 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-10 w-10 shrink-0 rounded-xl" style={{ backgroundColor: c.color }} />
                      <div>
                        <p className="font-semibold text-text-primary">{c.title}</p>
                        <p className="text-sm text-text-secondary">{c.subject} · {c.teacherName}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white">{c.progress}%</span>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={c.progress} />
                  </div>
                  <p className="mt-2 text-xs text-text-muted">{c.students} students · {c.resourceCount} resources</p>
                </button>
              ))}
            </div>
          </ShellSection>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent grades */}
          <ShellSection title="Recent Grades" subtitle="Your graded submissions and feedback.">
            {gradedWork.length === 0 ? (
              <p className="rounded-2xl border border-border-subtle bg-black/10 p-4 text-sm text-text-secondary">No graded work yet. Submit assignments to get feedback.</p>
            ) : (
              <div className="space-y-3">
                {gradedWork.map((sub) => {
                  const assignment = state.assignments.find((a) => a.id === sub.assignmentId);
                  const pct = assignment?.maxPoints ? Math.round((sub.score! / assignment.maxPoints) * 100) : 0;
                  return (
                    <div key={sub.id} className="rounded-2xl border border-border-subtle bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{assignment?.title ?? 'Assignment'}</p>
                          <p className="text-xs text-text-secondary mt-0.5">{sub.fileName}</p>
                        </div>
                        <span className={`text-lg font-bold ${pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                          {sub.score}/{assignment?.maxPoints}
                        </span>
                      </div>
                      {sub.teacherFeedback && (
                        <p className="mt-2 rounded-xl border border-border-subtle bg-black/10 px-3 py-2 text-xs italic text-text-secondary">
                          "{sub.teacherFeedback}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ShellSection>

          {/* Upcoming deadlines */}
          <ShellSection title="Upcoming Deadlines" subtitle="Exams and due dates on your calendar.">
            {upcomingEvents.length === 0 ? (
              <p className="rounded-2xl border border-border-subtle bg-black/10 p-4 text-sm text-text-secondary">No upcoming deadlines.</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((ev) => (
                  <button key={ev.id} type="button" onClick={() => navigate('/app/calendar')} className="w-full rounded-2xl border border-border-subtle bg-white/5 p-4 text-left transition hover:bg-white/10">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{ev.title}</p>
                        <p className="text-xs text-text-muted mt-0.5">{ev.date} · {ev.startTime}</p>
                      </div>
                      <ViewPill label={ev.type} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ShellSection>

          {/* Notifications */}
          <ShellSection title="Notifications" subtitle="Unread alerts from your courses.">
            <div className="space-y-3">
              {unreadNotifications.map((n) => (
                <NotificationCard key={n.id} notification={n} />
              ))}
              {unreadNotifications.length === 0 && (
                <p className="rounded-2xl border border-border-subtle bg-black/10 p-4 text-sm text-text-secondary">You're all caught up.</p>
              )}
            </div>
          </ShellSection>
        </div>
      </div>
    </div>
  );
}

function TeacherDashboard() {
  const navigate = useNavigate();
  const { currentUser, state, createAssignment } = useLms();
  const analytics = analyticsByRole['teacher'];
  const myClasses = state.classes.filter((c) => !c.archived);
  const pendingSubmissions = state.submissions.filter((s) => s.score === undefined).slice(0, 5);
  const upcomingClasses = state.events.filter((e) => e.type === 'class').slice(0, 4);
  const unreadNotifications = state.notifications.filter((n) => n.unread).slice(0, 3);
  const totalStudents = myClasses.reduce((sum, c) => sum + c.students, 0);

  const [quickTitle, setQuickTitle] = useState('');
  const [quickClassId, setQuickClassId] = useState(state.classes[0]?.id ?? '');
  const [quickDue, setQuickDue] = useState('');

  const handleQuickAssignment = (e: FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    createAssignment({ classId: quickClassId, title: quickTitle, kind: 'assignment', dueDate: quickDue, maxPoints: 100, description: '' });
    setQuickTitle('');
    setQuickDue('');
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.2),rgba(37,99,235,0.1),rgba(124,58,237,0.08))] p-7 sm:p-10">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-widest text-emerald-300">
              <GraduationCap className="h-3 w-3" />
              Educator Portal
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Welcome, {currentUser?.name.split(' ')[0] ?? 'Teacher'}!
            </h1>
            <p className="max-w-xl text-lg text-white/70">
              You have <span className="font-semibold text-white">{pendingSubmissions.length} submission{pendingSubmissions.length !== 1 ? 's' : ''} to grade</span> and <span className="font-semibold text-emerald-300">{myClasses.length} active class{myClasses.length !== 1 ? 'es' : ''}</span> running.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button type="button" onClick={() => navigate('/app/assignments')} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:brightness-110">
                <ClipboardCheck className="h-4 w-4" />
                Grade Center
              </button>
              <button type="button" onClick={() => navigate('/app/classes')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                <GraduationCap className="h-4 w-4" />
                My Classes
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:min-w-[280px]">
            <div className={metricClass + ' text-center'}>
              <p className="text-xs uppercase tracking-widest text-text-muted">Students</p>
              <p className="mt-1 text-3xl font-bold text-white">{totalStudents}</p>
              <p className="mt-1 text-xs text-text-secondary">Across all classes</p>
            </div>
            <div className={metricClass + ' text-center'}>
              <p className="text-xs uppercase tracking-widest text-text-muted">To Grade</p>
              <p className="mt-1 text-3xl font-bold text-amber-400">{pendingSubmissions.length}</p>
              <p className="mt-1 text-xs text-text-secondary">Submissions</p>
            </div>
            <div className={metricClass + ' text-center'}>
              <p className="text-xs uppercase tracking-widest text-text-muted">Avg Grade</p>
              <p className="mt-1 text-3xl font-bold text-emerald-400">{analytics.averageGrade}%</p>
              <p className="mt-1 text-xs text-text-secondary">Class avg</p>
            </div>
            <div className={metricClass + ' text-center'}>
              <p className="text-xs uppercase tracking-widest text-text-muted">Completion</p>
              <p className="mt-1 text-3xl font-bold text-blue-400">{analytics.completion}%</p>
              <p className="mt-1 text-xs text-text-secondary">Submit rate</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Submissions to grade */}
          <ShellSection
            title="Submissions Awaiting Grades"
            subtitle="Students waiting on your feedback — grade from the Grade Center."
            action={<button type="button" onClick={() => navigate('/app/assignments')} className="text-sm font-medium text-primary hover:underline">Open Grade Center</button>}
          >
            {pendingSubmissions.length === 0 ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center text-sm text-emerald-300">
                Grading queue is clear! All submissions are marked.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingSubmissions.map((sub) => {
                  const assignment = state.assignments.find((a) => a.id === sub.assignmentId);
                  const student = state.users.find((u) => u.id === sub.studentId);
                  const submittedDate = new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => navigate('/app/assignments')}
                      className="w-full rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-left transition hover:bg-amber-500/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={student?.avatar} alt={student?.name} className="h-9 w-9 rounded-xl object-cover" />
                          <div>
                            <p className="text-sm font-semibold text-text-primary">{student?.name ?? 'Student'}</p>
                            <p className="text-xs text-text-secondary">{assignment?.title ?? 'Assignment'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-text-muted">Submitted {submittedDate}</p>
                          <p className="mt-1 text-xs font-semibold text-amber-400">Needs grading</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ShellSection>

          {/* Class overview */}
          <ShellSection
            title="My Classes"
            subtitle="Active classrooms and their student progress."
            action={<button type="button" onClick={() => navigate('/app/classes')} className="text-sm font-medium text-primary hover:underline">Manage classes</button>}
          >
            <div className="space-y-3">
              {myClasses.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate(`/app/classes/${c.id}`)}
                  className="w-full rounded-2xl border border-border-subtle bg-white/5 p-4 text-left transition hover:border-primary/40 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{c.title}</p>
                        <p className="text-xs text-text-secondary">{c.subject} · Section {c.section}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-semibold text-text-primary">{c.students} students</p>
                      <p className="text-text-muted">Code: {c.code}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-text-muted">
                      <span>Class progress</span>
                      <span className="font-semibold text-text-secondary">{c.progress}%</span>
                    </div>
                    <ProgressBar value={c.progress} />
                  </div>
                </button>
              ))}
            </div>
          </ShellSection>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick create assignment */}
          <ShellSection title="Quick Create Assignment" subtitle="Post a new assignment to a class instantly.">
            <form className="space-y-3" onSubmit={handleQuickAssignment}>
              <input
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Assignment title"
                className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary/60"
              />
              <select
                value={quickClassId}
                onChange={(e) => setQuickClassId(e.target.value)}
                className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary/60"
              >
                {state.classes.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <input
                value={quickDue}
                onChange={(e) => setQuickDue(e.target.value)}
                placeholder="Due date (e.g. May 20)"
                className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary/60"
              />
              <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110">
                <Plus className="h-4 w-4" />
                Create Assignment
              </button>
            </form>
          </ShellSection>

          {/* Upcoming class schedule */}
          <ShellSection title="Upcoming Classes" subtitle="Your scheduled sessions this week.">
            {upcomingClasses.length === 0 ? (
              <p className="rounded-2xl border border-border-subtle bg-black/10 p-4 text-sm text-text-secondary">No upcoming classes scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcomingClasses.map((ev) => (
                  <button key={ev.id} type="button" onClick={() => navigate('/app/calendar')} className="w-full rounded-2xl border border-border-subtle bg-white/5 p-4 text-left transition hover:bg-white/10">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{ev.title}</p>
                        <p className="text-xs text-text-muted mt-0.5">{ev.date} · {ev.startTime} – {ev.endTime}</p>
                      </div>
                      <CalendarDays className="h-4 w-4 text-emerald-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ShellSection>

          {/* Notifications */}
          <ShellSection title="Notifications" subtitle="Recent platform alerts.">
            <div className="space-y-3">
              {unreadNotifications.length === 0 ? (
                <p className="rounded-2xl border border-border-subtle bg-black/10 p-4 text-sm text-text-secondary">No new notifications.</p>
              ) : (
                unreadNotifications.map((n) => <NotificationCard key={n.id} notification={n} />)
              )}
            </div>
          </ShellSection>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser, state } = useLms();
  const analytics = analyticsByRole['admin'];

  const totalUsers = state.users.length;
  const studentCount = state.users.filter((u) => u.role === 'student').length;
  const teacherCount = state.users.filter((u) => u.role === 'teacher').length;
  const adminCount = state.users.filter((u) => u.role === 'admin').length;
  const activeClasses = state.classes.filter((c) => !c.archived).length;
  const archivedClasses = state.classes.filter((c) => c.archived).length;
  const totalSubmissions = state.submissions.length;
  const pendingSubmissions = state.submissions.filter((s) => s.score === undefined).length;
  const recentUsers = [...state.users].slice(-5).reverse();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(124,58,237,0.22),rgba(37,99,235,0.12),rgba(239,68,68,0.06))] p-7 sm:p-10">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs uppercase tracking-widest text-purple-300">
              <Shield className="h-3 w-3" />
              Administrator Portal
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Platform Overview
            </h1>
            <p className="max-w-xl text-lg text-white/70">
              <span className="font-semibold text-white">{totalUsers} users</span> across <span className="font-semibold text-purple-300">{activeClasses} active classes</span>. Platform is operating normally.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button type="button" onClick={() => navigate('/app/admin')} className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:brightness-110">
                <Users className="h-4 w-4" />
                Manage Users
              </button>
              <button type="button" onClick={() => navigate('/app/analytics')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                <Workflow className="h-4 w-4" />
                Platform Analytics
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:min-w-[280px]">
            <div className={metricClass + ' text-center'}>
              <p className="text-xs uppercase tracking-widest text-text-muted">Total Users</p>
              <p className="mt-1 text-3xl font-bold text-white">{totalUsers}</p>
              <p className="mt-1 text-xs text-text-secondary">All roles</p>
            </div>
            <div className={metricClass + ' text-center'}>
              <p className="text-xs uppercase tracking-widest text-text-muted">Active Classes</p>
              <p className="mt-1 text-3xl font-bold text-purple-400">{activeClasses}</p>
              <p className="mt-1 text-xs text-text-secondary">{archivedClasses} archived</p>
            </div>
            <div className={metricClass + ' text-center'}>
              <p className="text-xs uppercase tracking-widest text-text-muted">Submissions</p>
              <p className="mt-1 text-3xl font-bold text-amber-400">{pendingSubmissions}</p>
              <p className="mt-1 text-xs text-text-secondary">Pending review</p>
            </div>
            <div className={metricClass + ' text-center'}>
              <p className="text-xs uppercase tracking-widest text-text-muted">Engagement</p>
              <p className="mt-1 text-3xl font-bold text-emerald-400">{analytics.engagement}%</p>
              <p className="mt-1 text-xs text-text-secondary">Platform-wide</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        {/* Left column */}
        <div className="space-y-6">
          {/* User distribution */}
          <ShellSection title="User Distribution" subtitle="Breakdown of all registered accounts by role.">
            <div className="space-y-4">
              {[
                { label: 'Students', count: studentCount, total: totalUsers, color: 'bg-blue-500', textColor: 'text-blue-400' },
                { label: 'Teachers / Educators', count: teacherCount, total: totalUsers, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                { label: 'Administrators', count: adminCount, total: totalUsers, color: 'bg-purple-500', textColor: 'text-purple-400' },
              ].map((role) => (
                <div key={role.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-text-secondary">{role.label}</span>
                    <span className={`text-sm font-bold ${role.textColor}`}>{role.count} <span className="text-text-muted font-normal">({Math.round((role.count / role.total) * 100)}%)</span></span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${role.color}`}
                      style={{ width: `${(role.count / role.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border-subtle bg-blue-500/10 p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">{studentCount}</p>
                <p className="text-xs text-text-muted">Students</p>
              </div>
              <div className="rounded-2xl border border-border-subtle bg-emerald-500/10 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">{teacherCount}</p>
                <p className="text-xs text-text-muted">Teachers</p>
              </div>
              <div className="rounded-2xl border border-border-subtle bg-purple-500/10 p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">{adminCount}</p>
                <p className="text-xs text-text-muted">Admins</p>
              </div>
            </div>
          </ShellSection>

          {/* Platform stats */}
          <ShellSection title="Platform Activity" subtitle="Content and workflow statistics.">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Classes', value: state.classes.length, sub: `${activeClasses} active` },
                { label: 'Assignments', value: state.assignments.length, sub: 'Across all classes' },
                { label: 'Submissions', value: totalSubmissions, sub: `${pendingSubmissions} pending` },
                { label: 'Resources', value: state.resources.length, sub: 'Files and links' },
                { label: 'Discussions', value: state.discussions.length, sub: 'Active threads' },
                { label: 'Events', value: state.events.length, sub: 'Scheduled' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border-subtle bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-text-muted">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold text-text-primary">{item.value}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{item.sub}</p>
                </div>
              ))}
            </div>
          </ShellSection>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent users */}
          <ShellSection
            title="Registered Users"
            subtitle="Recently added accounts on the platform."
            action={<button type="button" onClick={() => navigate('/app/admin')} className="text-sm font-medium text-primary hover:underline">Manage all</button>}
          >
            <div className="space-y-3">
              {recentUsers.map((user) => {
                const roleColors: Record<string, string> = {
                  student: 'text-blue-400 bg-blue-500/10',
                  teacher: 'text-emerald-400 bg-emerald-500/10',
                  admin: 'text-purple-400 bg-purple-500/10',
                };
                return (
                  <div key={user.id} className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-white/5 p-3">
                    <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </ShellSection>

          {/* System health */}
          <ShellSection title="System Health" subtitle="Current platform operational status.">
            <div className="space-y-3">
              {[
                { label: 'API Uptime', value: '99.98%', status: 'healthy' },
                { label: 'Auth System', value: 'Operational', status: 'healthy' },
                { label: 'File Storage', value: 'Connected', status: 'healthy' },
                { label: 'Notifications', value: `${state.notifications.filter(n => n.unread).length} unread`, status: 'info' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border-subtle bg-white/5 px-4 py-3">
                  <span className="text-sm text-text-secondary">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${item.status === 'healthy' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                    <span className="text-sm font-semibold text-text-primary">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </ShellSection>

          {/* Quick actions */}
          <ShellSection title="Quick Actions" subtitle="Common administrative tasks.">
            <div className="grid grid-cols-1 gap-3">
              <button type="button" onClick={() => navigate('/app/admin')} className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-white/5 p-4 text-left transition hover:border-purple-500/40 hover:bg-purple-500/5">
                <div className="rounded-xl bg-purple-500/20 p-2">
                  <Users className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Add New User</p>
                  <p className="text-xs text-text-muted">Create a student, teacher, or admin account</p>
                </div>
              </button>
              <button type="button" onClick={() => navigate('/app/analytics')} className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-white/5 p-4 text-left transition hover:border-blue-500/40 hover:bg-blue-500/5">
                <div className="rounded-xl bg-blue-500/20 p-2">
                  <Workflow className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">View Full Analytics</p>
                  <p className="text-xs text-text-muted">Platform-wide engagement and performance data</p>
                </div>
              </button>
              <button type="button" onClick={() => navigate('/app/classes')} className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-white/5 p-4 text-left transition hover:border-emerald-500/40 hover:bg-emerald-500/5">
                <div className="rounded-xl bg-emerald-500/20 p-2">
                  <BookOpen className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Manage Classes</p>
                  <p className="text-xs text-text-muted">Archive, review, and oversee all classrooms</p>
                </div>
              </button>
            </div>
          </ShellSection>
        </div>
      </div>
    </div>
  );
}

function NotificationCard({ notification }: { notification: NotificationItem; key?: string | number }) {
  const accent = notification.priority === 'high' ? 'bg-red-500/15 text-red-200 border-red-500/20' : notification.priority === 'normal' ? 'bg-blue-500/15 text-blue-200 border-blue-500/20' : 'bg-emerald-500/15 text-emerald-200 border-emerald-500/20';
  return (
    <div className="rounded-2xl border border-border-subtle bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.24em] ${accent}`}>{notification.priority}</span>
            {notification.unread ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
          </div>
          <p className="mt-2 text-sm font-semibold text-text-primary">{notification.title}</p>
          <p className="mt-1 text-sm text-text-secondary">{notification.description}</p>
        </div>
        <p className="text-xs text-text-muted">{notification.time}</p>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: CalendarEvent; key?: string | number }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">{event.title}</p>
          <p className="mt-1 text-sm text-text-secondary">{event.date}</p>
        </div>
        <ViewPill label={event.type} />
      </div>
      <p className="mt-3 text-xs text-text-muted">
        {event.startTime} - {event.endTime}
      </p>
    </div>
  );
}

export function ClassesPage() {
  const navigate = useNavigate();
  const { state, createClassroom, joinClassroom, archiveClassroom, unarchiveClassroom, currentUser, currentRole } = useLms();
  const [form, setForm] = useState({ title: '', subject: '', section: '', description: '' });
  const [joinCode, setJoinCode] = useState('');
  const canManageClasses = currentRole === 'teacher' || currentRole === 'admin';

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createClassroom(form);
    setForm({ title: '', subject: '', section: '', description: '' });
  };

  const pageHeader = currentRole === 'admin'
    ? { label: 'All Classes', title: 'Oversee, archive, and manage every classroom on the platform' }
    : currentRole === 'teacher'
      ? { label: 'My Classes', title: 'Create new classrooms and manage your existing sections' }
      : { label: 'My Courses', title: 'Browse your enrolled courses and join new classes with a code' };

  const createSectionTitle = currentRole === 'admin'
    ? 'Create class (Admin)'
    : 'Create new classroom';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">{pageHeader.label}</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-primary">{pageHeader.title}</h1>
        </div>
        <ViewPill label={`${state.classes.filter((item) => !item.archived).length} active`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {canManageClasses && (
          <ShellSection title={createSectionTitle} subtitle={currentRole === 'admin' ? 'Admins can create and assign classes to any teacher.' : 'Spin up a new class in seconds and share the join code with students.'}>
            <form className="space-y-4" onSubmit={onSubmit}>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Class title" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
              <input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="Subject" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
              <input value={form.section} onChange={(event) => setForm({ ...form, section: event.target.value })} placeholder="Section / group" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Short description" rows={4} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
              <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white transition hover:brightness-110">
                <Plus className="h-4 w-4" />
                Create classroom
              </button>
            </form>
          </ShellSection>
        )}

        <div className="space-y-6">
          {currentRole === 'student' && (
            <ShellSection title="Join class" subtitle="Enter a class code to join instantly.">
              <div className="flex gap-3">
                <input value={joinCode} onChange={(event) => setJoinCode(event.target.value)} placeholder="NX-2048" className="flex-1 rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
                <button type="button" onClick={() => joinClassroom(joinCode)} className="rounded-2xl bg-secondary px-4 py-3 font-semibold text-white transition hover:brightness-110">Join</button>
              </div>
            </ShellSection>
          )}

          {currentRole === 'student' ? (
            <ShellSection title="Classes you've joined" subtitle="Your enrolled classrooms and active learning spaces.">
              <div className="space-y-3">
                {state.classes.filter((item) => !item.archived).map((classroom) => (
                  <button key={classroom.id} type="button" onClick={() => navigate(`/app/classes/${classroom.id}`)} className="w-full text-left rounded-2xl border border-border-subtle bg-white/5 p-4 transition hover:border-primary/40 hover:bg-white/10 cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{classroom.title}</p>
                        <p className="text-sm text-text-secondary">{classroom.subject} · {classroom.section}</p>
                        <p className="mt-2 text-xs text-text-muted">Code {classroom.code} · {classroom.students} learners · {classroom.resourceCount} files</p>
                      </div>
                      <ViewPill label={`${classroom.progress}% done`} />
                    </div>
                    <div className="mt-3">
                      <ProgressBar value={classroom.progress} />
                    </div>
                  </button>
                ))}
              </div>
            </ShellSection>
          ) : (
            <ShellSection title="Teacher tools" subtitle="Archive stale classes and keep spaces focused.">
              <div className="space-y-3">
                {state.classes.map((classroom) => (
                  <div key={classroom.id} className="rounded-2xl border border-border-subtle bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" onClick={() => navigate(`/app/classes/${classroom.id}`)} className="flex-1 text-left transition hover:text-primary">
                        <p className="text-sm font-semibold text-text-primary hover:text-primary">{classroom.title}</p>
                        <p className="text-sm text-text-secondary">{classroom.subject} · {classroom.section}</p>
                        <p className="mt-2 text-xs text-text-muted">Code {classroom.code} · {classroom.students} learners · {classroom.resourceCount} files</p>
                      </button>
                      {!classroom.archived ? (
                        <button type="button" disabled={currentUser?.id !== classroom.teacherId && currentUser?.role !== 'admin'} onClick={() => archiveClassroom(classroom.id)} className="rounded-full border border-border-subtle p-2 text-text-secondary transition hover:border-red-500/40 hover:text-red-200 disabled:opacity-40">
                          <Archive className="h-4 w-4" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button type="button" disabled={currentUser?.id !== classroom.teacherId && currentUser?.role !== 'admin'} onClick={() => unarchiveClassroom(classroom.id)} className="rounded-full border border-border-subtle p-2 text-text-secondary transition hover:border-emerald-400/40 hover:text-emerald-200 disabled:opacity-40" title="Unarchive class">
                            <MoveRight className="h-4 w-4" />
                          </button>
                          <ViewPill label="Archived" />
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <ProgressBar value={classroom.progress} />
                    </div>
                  </div>
                ))}
              </div>
            </ShellSection>
          )}
        </div>
      </div>
    </div>
  );
}

export function AssignmentsPage() {
  const { state, createAssignment, currentRole, currentUser, addSubmission, removeSubmission, gradeSubmission } = useLms();
  const [form, setForm] = useState({ classId: state.classes[0]?.id ?? '', title: '', kind: 'assignment' as Assignment['kind'], dueDate: '', maxPoints: 100, description: '' });
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const canCreateAssignments = currentRole === 'teacher' || currentRole === 'admin';

  const mySubmissions = state.submissions.filter((s) => s.studentId === currentUser?.id);
  const submittedAssignmentIds = new Set(mySubmissions.map((s) => s.assignmentId));

  const pendingAssignments = state.assignments.filter((a) => !submittedAssignmentIds.has(a.id));
  const completedAssignments = state.assignments.filter((a) => submittedAssignmentIds.has(a.id));

  const onPublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPublishing(true);
    setPublishError('');
    try {
      createAssignment(form);
      if (materialFile) {
        const formData = new FormData();
        formData.append('file', materialFile);
        formData.append('classId', form.classId);
        formData.append('type', 'document');
        formData.append('preview', `Material for: ${form.title}`);
        await api.uploadResource(formData);
      }
      setForm({ classId: state.classes[0]?.id ?? '', title: '', kind: 'assignment', dueDate: '', maxPoints: 100, description: '' });
      setMaterialFile(null);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Failed to upload material.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteSubmission = async (sub: StudentSubmission) => {
    removeSubmission(sub.id);
    try { await api.deleteSubmission(sub.id); } catch { /* server best-effort */ }
  };

  const handleGrade = async (submissionId: string, score: number, feedback: string) => {
    try {
      await api.gradeSubmission(submissionId, score, feedback);
      gradeSubmission(submissionId, score, feedback);
    } catch (err) {
      console.error('Grade failed:', err);
    }
  };

  const assignPageHeader = currentRole === 'teacher'
    ? { label: 'Grade Center', title: 'Create assignments, review submissions, and give feedback to students' }
    : currentRole === 'admin'
      ? { label: 'Assignment Overview', title: 'Monitor and manage all assignments and submissions platform-wide' }
      : { label: 'Assignments', title: 'View your pending work, submit assignments, and check your grades' };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">{assignPageHeader.label}</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-primary">{assignPageHeader.title}</h1>
        </div>
        <ViewPill label={currentRole === 'teacher' ? 'Teacher controls' : currentRole === 'admin' ? 'Admin view' : 'Student view'} />
      </div>

      {canCreateAssignments ? (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <ShellSection title={currentRole === 'admin' ? 'Create assignment (Admin)' : 'Create new assignment'} subtitle={currentRole === 'admin' ? 'Admins can post assignments to any class.' : 'Add work with deadlines, max points, and an optional material file.'}>
              <form className="space-y-4" onSubmit={onPublish}>
                <select value={form.classId} onChange={(event) => setForm({ ...form, classId: event.target.value })} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60">
                  {state.classes.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.title}</option>)}
                </select>
                <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Assignment title" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as Assignment['kind'] })} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60">
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="project">Project</option>
                  </select>
                  <input value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} placeholder="Due date" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input value={String(form.maxPoints)} onChange={(event) => setForm({ ...form, maxPoints: Number(event.target.value) })} type="number" min="1" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
                  <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Short description" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border-subtle bg-white/5 px-4 py-3 transition hover:border-primary/50">
                  <CloudUpload className="h-4 w-4 shrink-0 text-text-muted" />
                  <span className="text-sm text-text-secondary">{materialFile ? materialFile.name : 'Attach a material file (optional)'}</span>
                  <input type="file" className="sr-only" onChange={(event) => setMaterialFile(event.target.files?.[0] ?? null)} />
                </label>
                {publishError ? <p className="text-sm text-red-300">{publishError}</p> : null}
                <button type="submit" disabled={publishing} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                  <Plus className="h-4 w-4" />
                  {publishing ? 'Publishing…' : 'Publish assignment'}
                </button>
              </form>
            </ShellSection>

            <ShellSection title="Assignment queue" subtitle="Auto-grading, manual grading, plagiarism risk, and rubrics.">
              <div className="space-y-3">
                {state.assignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} classes={state.classes} />
                ))}
              </div>
            </ShellSection>
          </div>

          {state.submissions.length > 0 && (
            <ShellSection title="Grade submissions" subtitle="Review student work and add a score with optional feedback.">
              <div className="space-y-3">
                {state.submissions.map((sub) => {
                  const assignment = state.assignments.find((a) => a.id === sub.assignmentId);
                  const student = state.users.find((u) => u.id === sub.studentId);
                  if (!assignment) return null;
                  return (
                    <TeacherGradeCard
                      key={sub.id}
                      submission={sub}
                      assignment={assignment}
                      studentName={student?.name ?? 'Student'}
                      onGrade={handleGrade}
                    />
                  );
                })}
              </div>
            </ShellSection>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <ShellSection title="Assignment queue" subtitle="Your pending work — upload a file on each card to submit.">
            <div className="space-y-3">
              {pendingAssignments.length === 0 ? (
                <p className="rounded-2xl border border-border-subtle bg-black/10 p-5 text-sm text-text-secondary">
                  No pending assignments. Check completed work below.
                </p>
              ) : (
                pendingAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    classes={state.classes}
                    isStudent
                    currentUserId={currentUser?.id ?? ''}
                    onSubmitSuccess={(sub) => addSubmission(sub)}
                  />
                ))
              )}
            </div>
          </ShellSection>

          {completedAssignments.length > 0 && (
            <ShellSection title="Completed assignments" subtitle="Your submitted work — grades and feedback appear here once marked.">
              <div className="space-y-3">
                {completedAssignments.map((assignment) => {
                  const sub = mySubmissions.find((s) => s.assignmentId === assignment.id)!;
                  const classroom = state.classes.find((c) => c.id === assignment.classId);
                  return (
                    <CompletedAssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      submission={sub}
                      classroomTitle={classroom?.title}
                      onDelete={() => handleDeleteSubmission(sub)}
                    />
                  );
                })}
              </div>
            </ShellSection>
          )}
        </div>
      )}
    </div>
  );
}

function AssignmentCard({ assignment, classes, isStudent, currentUserId, onSubmitSuccess }: {
  assignment: Assignment;
  classes: Classroom[];
  key?: string | number;
  isStudent?: boolean;
  currentUserId?: string;
  onSubmitSuccess?: (sub: StudentSubmission) => void;
}) {
  const classroom = classes.find((item) => item.id === assignment.classId);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assignmentId', assignment.id);
      formData.append('contentText', notes);
      const response = await api.uploadSubmission(formData);
      onSubmitSuccess?.({
        id: response.submission.id,
        assignmentId: assignment.id,
        studentId: currentUserId ?? response.submission.studentId,
        fileName: response.submission.fileName ?? file.name,
        fileUrl: response.submission.fileUrl,
        notes,
        submittedAt: response.submission.submittedAt,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed.');
      setSubmitting(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setSubmitError('');
    setSubmitting(false);
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-text-primary">{assignment.title}</p>
            <ViewPill label={assignment.kind} />
          </div>
          <p className="mt-1 text-sm text-text-secondary">{classroom?.title ?? 'Unlinked class'} · {assignment.dueDate}</p>
          <p className="mt-2 text-sm text-text-secondary">{assignment.description}</p>
        </div>
        <ViewPill label={isStudent ? 'assigned' : assignment.status} />
      </div>

      {!isStudent && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Submissions</p>
            <p className="mt-1 font-semibold text-text-primary">{assignment.submissions}</p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Average score</p>
            <p className="mt-1 font-semibold text-text-primary">{assignment.averageScore}/{assignment.maxPoints}</p>
          </div>
        </div>
      )}



      {isStudent && (
        <form className="mt-4 space-y-3 border-t border-border-subtle pt-4" onSubmit={handleSubmit}>
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border-subtle bg-white/5 px-4 py-3 transition hover:border-primary/50">
            <CloudUpload className="h-4 w-4 shrink-0 text-text-muted" />
            <span className="text-sm text-text-secondary">{file ? file.name : 'Attach your submission file'}</span>
            <input type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          {file ? (
            <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-black/20 px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-text-primary">{file.name}</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
              >
                <Trash2 className="h-3 w-3" />
                Remove file
              </button>
            </div>
          ) : null}
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes for your teacher (optional)" rows={2} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary/60" />
          {submitError ? <p className="text-sm text-red-300">{submitError}</p> : null}
          <button type="submit" disabled={!file || submitting} className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
            <CloudUpload className="h-4 w-4" />
            {submitting ? 'Submitting…' : 'Submit work'}
          </button>
        </form>
      )}
    </div>
  );
}

function CompletedAssignmentCard({ assignment, submission, classroomTitle, onDelete }: {
  assignment: Assignment;
  submission: StudentSubmission;
  classroomTitle?: string;
  onDelete: () => void;
  key?: string | number;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    onDelete();
  };

  const submittedDate = new Date(submission.submittedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-border-subtle bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-text-primary">{assignment.title}</p>
            <ViewPill label={assignment.kind} />
          </div>
          <p className="mt-1 text-sm text-text-secondary">{classroomTitle ?? 'Unlinked class'} · {assignment.dueDate}</p>
        </div>
        <ViewPill label={submission.score !== undefined ? 'graded' : 'submitted'} />
      </div>

      <div className="mt-3 rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Submitted file</p>
        <a
          href={submission.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          {submission.fileName}
        </a>
        <p className="mt-1 text-text-muted">{submittedDate}</p>
        {submission.notes && <p className="mt-1 text-text-secondary italic">"{submission.notes}"</p>}
      </div>

      {submission.score !== undefined && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Score</p>
            <p className="mt-1 font-semibold text-text-primary">{submission.score}/{assignment.maxPoints}</p>
          </div>
          {submission.teacherFeedback && (
            <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Teacher feedback</p>
              <p className="mt-1 text-text-secondary">{submission.teacherFeedback}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 border-t border-border-subtle pt-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {deleting ? 'Removing…' : 'Delete submission'}
        </button>
      </div>
    </div>
  );
}

function TeacherGradeCard({ submission, assignment, studentName, onGrade }: {
  submission: StudentSubmission;
  assignment: Assignment;
  studentName: string;
  onGrade: (submissionId: string, score: number, feedback: string) => Promise<void>;
  key?: string | number;
}) {
  const [score, setScore] = useState(submission.score !== undefined ? String(submission.score) : '');
  const [feedback, setFeedback] = useState(submission.teacherFeedback ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(submission.score !== undefined);

  const handleGrade = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const numScore = Number(score);
    if (!score || isNaN(numScore)) return;
    setSaving(true);
    await onGrade(submission.id, numScore, feedback);
    setSaved(true);
    setSaving(false);
  };

  const submittedDate = new Date(submission.submittedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-border-subtle bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-text-primary">{assignment.title}</p>
            <ViewPill label={assignment.kind} />
          </div>
          <p className="mt-1 text-sm text-text-secondary">{studentName} · submitted {submittedDate}</p>
        </div>
        <ViewPill label={saved ? 'graded' : 'submitted'} />
      </div>

      <div className="mt-3 rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Submitted file</p>
        <a
          href={submission.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          {submission.fileName}
        </a>
        {submission.notes && <p className="mt-1 text-text-secondary italic">"{submission.notes}"</p>}
      </div>

      <form className="mt-3 space-y-3 border-t border-border-subtle pt-3" onSubmit={handleGrade}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-text-muted">Score (max {assignment.maxPoints})</label>
            <input
              type="number"
              min="0"
              max={assignment.maxPoints}
              value={score}
              onChange={(e) => { setScore(e.target.value); setSaved(false); }}
              placeholder={`0 – ${assignment.maxPoints}`}
              className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-primary/60"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-text-muted">Feedback (optional)</label>
            <input
              value={feedback}
              onChange={(e) => { setFeedback(e.target.value); setSaved(false); }}
              placeholder="Add a comment…"
              className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-primary/60"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving || !score}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircle2 className="h-4 w-4" />
          {saving ? 'Saving…' : saved ? 'Update grade' : 'Save grade'}
        </button>
      </form>
    </div>
  );
}

export function CollaborationPage() {
  const { state, currentUser, currentRole, createThread } = useLms();
  const [classId, setClassId] = useState(state.classes[0]?.id ?? '');
  const [threadMessage, setThreadMessage] = useState('');

  const threads = state.discussions.filter((thread) => thread.classId === classId);

  const collabHeader = currentRole === 'teacher'
    ? { label: 'Discussions', placeholder: 'Post an announcement, start a discussion, or answer a student question...' }
    : currentRole === 'admin'
      ? { label: 'Community', placeholder: 'Post a platform-wide announcement or moderation note...' }
      : { label: 'Discussions', placeholder: 'Ask a question, contribute to a discussion, or @mention your teacher...' };

  const allThreads = currentRole === 'admin' ? state.discussions : threads;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">{collabHeader.label}</p>
        <h1 className="mt-2 text-3xl font-semibold text-text-primary">
          {currentRole === 'teacher' ? 'Manage class discussions and post announcements' : currentRole === 'admin' ? 'Platform-wide community and moderation' : 'Join class discussions and connect with peers'}
        </h1>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ShellSection
          title={currentRole === 'admin' ? 'All platform discussions' : 'Class discussions'}
          subtitle={currentRole === 'admin' ? 'Viewing all threads across every class.' : 'Threaded conversations, mentions, and pinned notes.'}
        >
          {currentRole !== 'admin' && (
            <div className="mb-4 flex items-center gap-3">
              <select value={classId} onChange={(event) => setClassId(event.target.value)} className="rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60">
                {state.classes.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.title}</option>)}
              </select>
              <ViewPill label={`${threads.length} threads`} />
            </div>
          )}
          {currentRole === 'admin' && (
            <div className="mb-4">
              <ViewPill label={`${allThreads.length} total threads`} />
            </div>
          )}

          <form
            className="mb-5 space-y-3 rounded-3xl border border-border-subtle bg-black/10 p-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!currentUser || !threadMessage.trim()) return;
              createThread({ classId: currentRole === 'admin' ? (state.classes[0]?.id ?? classId) : classId, author: currentUser.name, message: threadMessage, role: currentUser.role });
              setThreadMessage('');
            }}
          >
            <textarea value={threadMessage} onChange={(event) => setThreadMessage(event.target.value)} rows={3} placeholder={collabHeader.placeholder} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
            <button className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 font-semibold text-white transition hover:brightness-110">
              <MessageCircle className="h-4 w-4" />
              {currentRole === 'teacher' ? 'Post announcement' : currentRole === 'admin' ? 'Post message' : 'Post thread'}
            </button>
          </form>

          <div className="space-y-3">
            {allThreads.map((thread) => <ThreadCard key={thread.id} thread={thread} />)}
          </div>
        </ShellSection>

        <div className="space-y-6">
          {currentRole === 'admin' && (
            <ShellSection title="Moderation Summary" subtitle="Discussion health across the platform.">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-white/5 px-4 py-3">
                  <span className="text-sm text-text-secondary">Total threads</span>
                  <span className="font-bold text-text-primary">{state.discussions.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-white/5 px-4 py-3">
                  <span className="text-sm text-text-secondary">Pinned posts</span>
                  <span className="font-bold text-text-primary">{state.discussions.filter(d => d.pinned).length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-white/5 px-4 py-3">
                  <span className="text-sm text-text-secondary">By teachers</span>
                  <span className="font-bold text-emerald-400">{state.discussions.filter(d => d.role === 'teacher').length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-white/5 px-4 py-3">
                  <span className="text-sm text-text-secondary">By students</span>
                  <span className="font-bold text-blue-400">{state.discussions.filter(d => d.role === 'student').length}</span>
                </div>
              </div>
            </ShellSection>
          )}
          {currentRole === 'teacher' && (
            <ShellSection title="Class Engagement" subtitle="Discussion activity in this class.">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-white/5 px-4 py-3">
                  <span className="text-sm text-text-secondary">Threads in class</span>
                  <span className="font-bold text-text-primary">{threads.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-white/5 px-4 py-3">
                  <span className="text-sm text-text-secondary">From students</span>
                  <span className="font-bold text-blue-400">{threads.filter(t => t.role === 'student').length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-white/5 px-4 py-3">
                  <span className="text-sm text-text-secondary">Total replies</span>
                  <span className="font-bold text-text-primary">{threads.reduce((s, t) => s + t.replies, 0)}</span>
                </div>
              </div>
            </ShellSection>
          )}
          {currentRole === 'student' && (
            <ShellSection title="Activity" subtitle="Your contributions in this class.">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-white/5 px-4 py-3">
                  <span className="text-sm text-text-secondary">Total threads</span>
                  <span className="font-bold text-text-primary">{threads.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-white/5 px-4 py-3">
                  <span className="text-sm text-text-secondary">Pinned posts</span>
                  <span className="font-bold text-text-primary">{threads.filter(t => t.pinned).length}</span>
                </div>
              </div>
            </ShellSection>
          )}
        </div>
      </div>
    </div>
  );
}

function ThreadCard({ thread }: { thread: DiscussionThread; key?: string | number }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text-primary">{thread.author}</p>
            <ViewPill label={thread.role} />
            {thread.pinned ? <ViewPill label="Pinned" /> : null}
          </div>
          <p className="mt-2 text-sm text-text-secondary">{thread.message}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-muted">
            <span>{thread.time}</span>
            <span>{thread.replies} replies</span>
          </div>
        </div>
        <HeartHandshake className="h-5 w-5 text-accent" />
      </div>
    </div>
  );
}

// Live chat UI removed — ChatBubble component no longer used.

export function AnalyticsPage() {
  const { currentRole } = useLms();
  if (currentRole === 'teacher') return <TeacherAnalytics />;
  if (currentRole === 'admin') return <AdminAnalytics />;
  return <StudentAnalytics />;
}

function StudentAnalytics() {
  const { state, analyticsKey } = useLms();
  const analytics = analyticsByRole[analyticsKey] ?? analyticsByRole['student'];
  const maxWeek = Math.max(...analytics.weeklyProgress, 1);
  const gradedSubmissions = state.submissions.filter((s) => s.score !== undefined);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">My Grades</p>
        <h1 className="mt-2 text-3xl font-semibold text-text-primary">Your personal learning progress and grade history</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My GPA" value={`${analytics.averageGrade}%`} note="Weighted across all coursework" icon={GraduationCap} accent="bg-amber-500" />
        <StatCard title="Completion" value={`${analytics.completion}%`} note="Assignments submitted on time" icon={CheckCircle2} accent="bg-emerald-500" />
        <StatCard title="Attendance" value={`${analytics.attendance}%`} note="Classes attended this term" icon={Users} accent="bg-blue-500" />
        <StatCard title="Study Streak" value={`${analytics.streak} days`} note="Consecutive active days" icon={Target} accent="bg-purple-500" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ShellSection title="Weekly Study Activity" subtitle="Your learning engagement across the past 7 weeks.">
          <div className="grid grid-cols-7 gap-3">
            {analytics.weeklyProgress.map((value, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="flex h-40 w-full items-end rounded-2xl border border-border-subtle bg-black/10 p-2">
                  <div className="w-full rounded-xl bg-gradient-to-t from-blue-600 to-blue-400" style={{ height: `${(value / maxWeek) * 100}%` }} />
                </div>
                <p className="text-xs text-text-muted">W{index + 1}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-center">
              <p className="text-xs text-text-muted">Engagement</p>
              <p className="mt-1 text-xl font-bold text-text-primary">{analytics.engagement}%</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-center">
              <p className="text-xs text-text-muted">Best week</p>
              <p className="mt-1 text-xl font-bold text-text-primary">{maxWeek}h</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-center">
              <p className="text-xs text-text-muted">Courses</p>
              <p className="mt-1 text-xl font-bold text-text-primary">{state.classes.filter(c => !c.archived).length}</p>
            </div>
          </div>
        </ShellSection>

        <div className="space-y-6">
          <ShellSection title="Graded Work" subtitle="Your scored assignments and feedback.">
            {gradedSubmissions.length === 0 ? (
              <p className="rounded-2xl border border-border-subtle bg-black/10 p-4 text-sm text-text-secondary">No graded work yet.</p>
            ) : (
              <div className="space-y-3">
                {gradedSubmissions.map((sub) => {
                  const assignment = state.assignments.find((a) => a.id === sub.assignmentId);
                  const pct = assignment?.maxPoints ? Math.round((sub.score! / assignment.maxPoints) * 100) : 0;
                  return (
                    <div key={sub.id} className="rounded-2xl border border-border-subtle bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-text-primary">{assignment?.title ?? 'Assignment'}</p>
                        <span className={`text-base font-bold ${pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                          {sub.score}/{assignment?.maxPoints}
                        </span>
                      </div>
                      <ProgressBar value={pct} />
                      {sub.teacherFeedback && (
                        <p className="mt-2 text-xs italic text-text-muted">"{sub.teacherFeedback}"</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ShellSection>

          <ShellSection title="Course Progress" subtitle="Completion across your enrolled courses.">
            <div className="space-y-3">
              {state.classes.filter(c => !c.archived).slice(0, 4).map((c) => (
                <div key={c.id} className="rounded-2xl border border-border-subtle bg-white/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-text-primary">{c.title}</p>
                    <span className="text-sm font-bold text-text-primary">{c.progress}%</span>
                  </div>
                  <ProgressBar value={c.progress} />
                </div>
              ))}
            </div>
          </ShellSection>
        </div>
      </div>
    </div>
  );
}

function TeacherAnalytics() {
  const { state, analyticsKey } = useLms();
  const analytics = analyticsByRole[analyticsKey] ?? analyticsByRole['teacher'];
  const maxWeek = Math.max(...analytics.weeklyProgress, 1);
  const activeClasses = state.classes.filter(c => !c.archived);
  const totalStudents = activeClasses.reduce((sum, c) => sum + c.students, 0);
  const gradedSubs = state.submissions.filter(s => s.score !== undefined).length;
  const pendingSubs = state.submissions.filter(s => s.score === undefined).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Class Analytics</p>
        <h1 className="mt-2 text-3xl font-semibold text-text-primary">Student performance and classroom engagement insights</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={totalStudents} note="Across all active classes" icon={Users} accent="bg-blue-500" />
        <StatCard title="Avg Class Grade" value={`${analytics.averageGrade}%`} note="Weighted across assignments" icon={GraduationCap} accent="bg-amber-500" />
        <StatCard title="Graded" value={gradedSubs} note="Submissions marked this term" icon={CheckCircle2} accent="bg-emerald-500" />
        <StatCard title="Pending Review" value={pendingSubs} note="Submissions waiting for a grade" icon={Target} accent="bg-red-500" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ShellSection title="Class Submission Trends" subtitle="Weekly submission rates across your classes.">
          <div className="grid grid-cols-7 gap-3">
            {analytics.weeklyProgress.map((value, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="flex h-40 w-full items-end rounded-2xl border border-border-subtle bg-black/10 p-2">
                  <div className="w-full rounded-xl bg-gradient-to-t from-emerald-600 to-emerald-400" style={{ height: `${(value / maxWeek) * 100}%` }} />
                </div>
                <p className="text-xs text-text-muted">W{index + 1}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-center">
              <p className="text-xs text-text-muted">Attendance</p>
              <p className="mt-1 text-xl font-bold text-text-primary">{analytics.attendance}%</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-center">
              <p className="text-xs text-text-muted">Completion</p>
              <p className="mt-1 text-xl font-bold text-text-primary">{analytics.completion}%</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-center">
              <p className="text-xs text-text-muted">Engagement</p>
              <p className="mt-1 text-xl font-bold text-text-primary">{analytics.engagement}%</p>
            </div>
          </div>
        </ShellSection>

        <div className="space-y-6">
          <ShellSection title="Class Performance" subtitle="Progress and student counts per class.">
            <div className="space-y-3">
              {activeClasses.slice(0, 5).map((c) => (
                <div key={c.id} className="rounded-2xl border border-border-subtle bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{c.title}</p>
                      <p className="text-xs text-text-muted">{c.students} students</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">{c.progress}%</span>
                  </div>
                  <ProgressBar value={c.progress} />
                </div>
              ))}
            </div>
          </ShellSection>

          <ShellSection title="Grading Summary" subtitle="Submission status across your classes.">
            <div className="space-y-3">
              <div className="rounded-2xl border border-border-subtle bg-emerald-500/10 p-4">
                <p className="text-xs uppercase tracking-widest text-emerald-400">Graded</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">{gradedSubs}</p>
              </div>
              <div className="rounded-2xl border border-border-subtle bg-amber-500/10 p-4">
                <p className="text-xs uppercase tracking-widest text-amber-400">Awaiting Grade</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">{pendingSubs}</p>
              </div>
              <div className="rounded-2xl border border-border-subtle bg-blue-500/10 p-4">
                <p className="text-xs uppercase tracking-widest text-blue-400">Total Assignments</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">{state.assignments.length}</p>
              </div>
            </div>
          </ShellSection>
        </div>
      </div>
    </div>
  );
}

function AdminAnalytics() {
  const { state, analyticsKey } = useLms();
  const analytics = analyticsByRole[analyticsKey] ?? analyticsByRole['admin'];
  const maxWeek = Math.max(...analytics.weeklyProgress, 1);
  const studentCount = state.users.filter(u => u.role === 'student').length;
  const teacherCount = state.users.filter(u => u.role === 'teacher').length;
  const activeClasses = state.classes.filter(c => !c.archived).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Platform Analytics</p>
        <h1 className="mt-2 text-3xl font-semibold text-text-primary">Platform-wide metrics, user growth, and system engagement</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={state.users.length} note={`${studentCount} students, ${teacherCount} teachers`} icon={Users} accent="bg-purple-500" />
        <StatCard title="Platform Engagement" value={`${analytics.engagement}%`} note="Active sessions this month" icon={Target} accent="bg-blue-500" />
        <StatCard title="Avg Completion" value={`${analytics.completion}%`} note="Assignment completion rate" icon={CheckCircle2} accent="bg-emerald-500" />
        <StatCard title="Avg Attendance" value={`${analytics.attendance}%`} note="Check-in rate platform-wide" icon={GraduationCap} accent="bg-amber-500" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <ShellSection title="Platform Activity (Weekly)" subtitle="Engagement levels across all user roles over the past 7 weeks.">
          <div className="grid grid-cols-7 gap-3">
            {analytics.weeklyProgress.map((value, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="flex h-40 w-full items-end rounded-2xl border border-border-subtle bg-black/10 p-2">
                  <div className="w-full rounded-xl bg-gradient-to-t from-purple-600 to-purple-400" style={{ height: `${(value / maxWeek) * 100}%` }} />
                </div>
                <p className="text-xs text-text-muted">W{index + 1}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <ShellSection title="Content Overview" subtitle="">
              <div className="space-y-3">
                {[
                  { label: 'Active Classes', value: activeClasses },
                  { label: 'Total Assignments', value: state.assignments.length },
                  { label: 'Submissions', value: state.submissions.length },
                  { label: 'Resources', value: state.resources.length },
                  { label: 'Discussion Threads', value: state.discussions.length },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-border-subtle bg-black/10 px-3 py-2">
                    <span className="text-sm text-text-secondary">{item.label}</span>
                    <span className="text-sm font-bold text-text-primary">{item.value}</span>
                  </div>
                ))}
              </div>
            </ShellSection>
            <ShellSection title="Grading Status" subtitle="">
              <div className="space-y-3">
                <div className="rounded-2xl border border-border-subtle bg-emerald-500/10 p-4 text-center">
                  <p className="text-xs text-emerald-400 uppercase tracking-widest">Graded</p>
                  <p className="mt-1 text-3xl font-bold text-text-primary">{state.submissions.filter(s => s.score !== undefined).length}</p>
                </div>
                <div className="rounded-2xl border border-border-subtle bg-amber-500/10 p-4 text-center">
                  <p className="text-xs text-amber-400 uppercase tracking-widest">Pending</p>
                  <p className="mt-1 text-3xl font-bold text-text-primary">{state.submissions.filter(s => s.score === undefined).length}</p>
                </div>
              </div>
            </ShellSection>
          </div>
        </ShellSection>

        <div className="space-y-6">
          <ShellSection title="User Roster" subtitle="All registered platform accounts.">
            <div className="space-y-2">
              {state.users.map((user) => {
                const roleColors: Record<string, string> = {
                  student: 'bg-blue-500/10 text-blue-400',
                  teacher: 'bg-emerald-500/10 text-emerald-400',
                  admin: 'bg-purple-500/10 text-purple-400',
                };
                return (
                  <div key={user.id} className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-white/5 p-3">
                    <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </ShellSection>

          <ShellSection title="Notifications" subtitle="Recent platform alerts.">
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-white/5 px-4 py-3">
                <span className="text-sm text-text-secondary">Total</span>
                <span className="font-bold text-text-primary">{state.notifications.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-red-500/10 px-4 py-3">
                <span className="text-sm text-text-secondary">Unread</span>
                <span className="font-bold text-red-400">{state.notifications.filter(n => n.unread).length}</span>
              </div>
            </div>
          </ShellSection>
        </div>
      </div>
    </div>
  );
}

function GridCalendar({ events }: { events: CalendarEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // May 2026

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((event) => event.date === dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className={metricClass}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={goToPreviousMonth} className="rounded-full border border-border-subtle p-2 transition hover:border-primary/50 hover:text-text-primary">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={goToNextMonth} className="rounded-full border border-border-subtle p-2 transition hover:border-primary/50 hover:text-text-primary">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-text-muted py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square rounded-lg bg-transparent" />
        ))}
        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          return (
            <div
              key={day}
              className="aspect-square rounded-lg border border-border-subtle bg-black/20 p-2 flex flex-col transition hover:border-primary/50 hover:bg-black/30"
            >
              <p className="text-xs font-semibold text-text-secondary mb-1">{day}</p>
              <div className="flex-1 space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium truncate"
                    style={{ backgroundColor: `${event.color}30`, color: event.color }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[9px] text-text-muted px-1.5">+{dayEvents.length - 2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarPage() {
  const { state, createEvent, currentRole } = useLms();
  const [form, setForm] = useState({ title: '', classId: state.classes[0]?.id ?? '', date: '', startTime: '', endTime: '', type: 'class' as CalendarEvent['type'] });
  const canCreateEvents = currentRole === 'teacher' || currentRole === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Calendar</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-primary">View and manage your schedule</h1>
        </div>
        <ViewPill label={`${state.events.length} total events`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <ShellSection title="Add event" subtitle="Sync assignments, exams, and meetings into one schedule.">
          {canCreateEvents ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                createEvent(form);
                setForm({ title: '', classId: state.classes[0]?.id ?? '', date: '', startTime: '', endTime: '', type: 'class' });
              }}
            >
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Event title" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
              <select value={form.classId} onChange={(event) => setForm({ ...form, classId: event.target.value })} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60">
                {state.classes.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.title}</option>)}
              </select>
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} type="date" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
                <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as CalendarEvent['type'] })} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60">
                  <option value="class">Class</option>
                  <option value="deadline">Deadline</option>
                  <option value="exam">Exam</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} type="time" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
                <input value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} type="time" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white transition hover:brightness-110">
                <Plus className="h-4 w-4" />
                Save event
              </button>
            </form>
          ) : (
            <div className="rounded-3xl border border-border-subtle bg-black/10 p-5 text-sm text-text-secondary">
              Students can follow the shared schedule, while teachers and admins manage the calendar.
            </div>
          )}
        </ShellSection>

        <GridCalendar events={state.events} />
      </div>

      {/* Upcoming events list */}
      <ShellSection title="Upcoming events" subtitle="Your next 10 scheduled items in chronological order.">
        <div className="space-y-3">
          {state.events.slice(0, 10).map((event) => (
            <div key={event.id} className="rounded-2xl border border-border-subtle bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{event.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">{event.date}</p>
                  <p className="mt-2 text-xs text-text-muted">{event.startTime} - {event.endTime}</p>
                </div>
                <ViewPill label={event.type} />
              </div>
            </div>
          ))}
        </div>
      </ShellSection>
    </div>
  );
}

export function ResourcesPage() {
  const { state, currentRole } = useLms();
  const [classId, setClassId] = useState(state.classes[0]?.id ?? '');
  const [type, setType] = useState<ResourceItem['type']>('document');
  const [preview, setPreview] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [resources, setResources] = useState(state.resources);
  const canManageResources = currentRole === 'teacher' || currentRole === 'admin';

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('classId', classId);
      formData.append('type', type);
      formData.append('preview', preview);
      const result = await api.uploadResource(formData);
      setResources((previous) => [result.resource as ResourceItem, ...previous]);
      setFile(null);
      setPreview('');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <ShellSection title="Upload resource" subtitle="Store class files, folders, and videos directly — files go to Cloudinary.">
        {canManageResources ? (
          <form className="space-y-4" onSubmit={onSubmit}>
            <select value={classId} onChange={(event) => setClassId(event.target.value)} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60">
              {state.classes.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.title}</option>)}
            </select>

            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border-subtle bg-white/5 px-4 py-6 text-center transition hover:border-primary/50">
              <CloudUpload className="h-7 w-7 text-text-muted" />
              {file ? (
                <span className="text-sm font-medium text-text-primary">{file.name}</span>
              ) : (
                <span className="text-sm text-text-secondary">Click to choose a file, or drag and drop</span>
              )}
              <input
                type="file"
                className="sr-only"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <select value={type} onChange={(event) => setType(event.target.value as ResourceItem['type'])} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60">
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="folder">Folder</option>
              <option value="link">Link</option>
            </select>

            <textarea value={preview} onChange={(event) => setPreview(event.target.value)} placeholder="Short description (optional)" rows={3} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />

            {uploadError ? (
              <p className="text-sm text-red-300">{uploadError}</p>
            ) : null}

            <button type="submit" disabled={!file || uploading} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
              <CloudUpload className="h-4 w-4" />
              {uploading ? 'Uploading…' : 'Upload resource'}
            </button>
          </form>
        ) : (
          <div className="rounded-3xl border border-border-subtle bg-black/10 p-5 text-sm text-text-secondary">
            Students can browse and preview shared materials. Upload access is reserved for teachers and admins.
          </div>
        )}
      </ShellSection>

      <ShellSection title="Resource library" subtitle="Class-specific files with previews, types, and update timestamps.">
        <div className="space-y-3">
          {resources.map((resource) => (
            <div key={resource.id} className="rounded-2xl border border-border-subtle bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{resource.name}</p>
                  <p className="mt-1 text-sm text-text-secondary">{resource.preview}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-muted">
                    <span>{resource.type}</span>
                    <span>{resource.size}</span>
                    <span>{resource.updatedAt}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ViewPill label={resource.type} />
                  {resource.fileUrl ? (
                    <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary underline decoration-primary/40 underline-offset-4 transition hover:text-primary-dark">
                      Open file
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ShellSection>
    </div>
  );
}

export function SettingsPage() {
  const { state, currentUser, toggleTheme, setTheme, setLanguage, resetDemoData } = useLms();

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <ShellSection title="Preferences" subtitle="Adjust theme, language, and workspace defaults.">
        <div className="space-y-4">
          <button type="button" onClick={toggleTheme} className="flex w-full items-center justify-between rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-left transition hover:border-primary/40">
            <span className="flex items-center gap-3"><Moon className="h-4 w-4 text-text-muted" /> Theme</span>
            <span className="text-sm text-text-secondary">Toggle dark/light</span>
          </button>
          <div className="grid gap-4 sm:grid-cols-2">
            <button type="button" onClick={() => setTheme('dark')} className="rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-left transition hover:border-primary/40">
              <Sun className="mb-3 h-4 w-4 text-accent" />
              <p className="text-sm font-semibold text-text-primary">Dark mode</p>
            </button>
            <button type="button" onClick={() => setTheme('light')} className="rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-left transition hover:border-primary/40">
              <Moon className="mb-3 h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-text-primary">Light mode</p>
            </button>
          </div>
          <div>
            <label className="mb-2 block text-sm text-text-secondary">Language</label>
            <select value={state.preferences.language} onChange={(event) => setLanguage(event.target.value)} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60">
              {['English', 'Spanish', 'French', 'Japanese'].map((language) => <option key={language}>{language}</option>)}
            </select>
          </div>
          <button type="button" onClick={resetDemoData} className="inline-flex items-center gap-2 rounded-2xl border border-border-subtle px-4 py-3 text-text-secondary transition hover:border-primary/40 hover:text-text-primary">
            <RefreshCw className="h-4 w-4" />
            Reset demo data
          </button>
        </div>
      </ShellSection>

      <ShellSection title="Account and platform" subtitle="Current access level, session mode, and role-based experience.">
        <div className="space-y-4 rounded-3xl border border-border-subtle bg-black/10 p-4">
          <div className="flex items-center gap-4">
            <img src={currentUser?.avatar} alt={currentUser?.name} className="h-16 w-16 rounded-2xl object-cover" />
            <div>
              <p className="text-lg font-semibold text-text-primary">{currentUser?.name}</p>
              <p className="text-sm text-text-secondary">{currentUser?.title}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ViewPill label={currentUser?.role ?? 'guest'} />
            <ViewPill label={state.preferences.language} />
          </div>
          <div className="rounded-2xl border border-border-subtle bg-white/5 p-4 text-sm text-text-secondary">
            This shell uses persisted sessions, client-side role checks, and a storage-backed data model that is ready to swap to a real backend API.
          </div>
        </div>
      </ShellSection>
    </div>
  );
}

export function AdminPage() {
  const { state, createUser, updateUser, deleteUser, updateUserRole, currentRole } = useLms();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as const,
    title: '',
    bio: '',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    title: '',
    bio: '',
    role: 'student' as const,
  });

  const handleCreateUser = (e: FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.password) {
      createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        title: formData.title,
        bio: formData.bio,
      });
      setFormData({ name: '', email: '', password: '', role: 'student', title: '', bio: '' });
      setShowCreateForm(false);
    }
  };

  const handleEditUser = (user: UserAccount) => {
    setEditingUserId(user.id);
    setEditFormData({
      name: user.name,
      email: user.email,
      title: user.title,
      bio: user.bio,
      role: user.role,
    });
  };

  const handleUpdateUser = (e: FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      updateUser({
        userId: editingUserId,
        name: editFormData.name,
        email: editFormData.email,
        title: editFormData.title,
        bio: editFormData.bio,
        role: editFormData.role,
      });
      setEditingUserId(null);
    }
  };

  const handleChangeRole = (userId: string, newRole: Role) => {
    updateUserRole(userId, newRole);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser(userId);
    }
  };

  const isAdmin = currentRole === 'admin';

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <p className="text-[9px] uppercase tracking-[0.24em] text-text-muted sm:text-xs">Admin center</p>
        <h1 className="mt-1 text-2xl font-semibold text-text-primary sm:mt-2 sm:text-3xl">Security, health, and platform governance</h1>
      </div>
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard title="Schools online" value="24" note="Multi-tenant environments active" icon={Shield} accent="bg-emerald-500" />
        <StatCard title="Sync health" value="99.98%" note="Background jobs and integrations healthy" icon={CloudUpload} accent="bg-blue-500" />
        <StatCard title="Blocked threats" value="18" note="Rate-limit and auth defenses triggered" icon={Lock} accent="bg-red-500" />
      </div>
      <ShellSection title="Policies and access" subtitle="Admins can tune platform controls and permission models.">
        <div className="grid gap-2 sm:gap-4 md:grid-cols-2">
          {[
            'Role-based middleware',
            'Audit log retention',
            'Rate limiting',
            'OAuth provider mapping',
            'Content moderation',
            'Parent portal access',
          ].map((item) => (
            <div key={item} className="rounded-lg border border-border-subtle bg-white/5 p-2.5 text-xs text-text-secondary sm:rounded-2xl sm:p-4 sm:text-sm">
              {item}
            </div>
          ))}
        </div>
      </ShellSection>

      <ShellSection title="User management" subtitle="Create, read, update, and delete users. Grant or change roles.">
        <div className="space-y-3 sm:space-y-4">
          {isAdmin && !showCreateForm && !editingUserId && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-white/5 px-3 py-2 text-sm text-text-secondary transition hover:border-primary/40 hover:text-text-primary sm:rounded-2xl sm:px-4 sm:py-3"
            >
              <Plus className="h-4 w-4" />
              Add new user
            </button>
          )}

          {showCreateForm && (
            <form onSubmit={handleCreateUser} className="space-y-3 rounded-lg border border-border-subtle bg-black/10 p-3 sm:space-y-4 sm:rounded-2xl sm:p-6">
              <h3 className="font-semibold text-text-primary">Create new user</h3>
              <div className="grid gap-2 sm:gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-text-secondary sm:mb-2 sm:text-sm">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full rounded-lg border border-border-subtle bg-white/5 px-2.5 py-2 text-sm outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary sm:mb-2 sm:text-sm">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full rounded-lg border border-border-subtle bg-white/5 px-2.5 py-2 text-sm outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary sm:mb-2 sm:text-sm">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Secure password"
                    className="w-full rounded-lg border border-border-subtle bg-white/5 px-2.5 py-2 text-sm outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Job title"
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Bio</label>
                  <input
                    type="text"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Short bio"
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-white transition hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Create user
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border-subtle px-4 py-3 text-text-secondary transition hover:border-primary/40 hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {editingUserId && (
            <form onSubmit={handleUpdateUser} className="space-y-4 rounded-2xl border border-border-subtle bg-black/10 p-6">
              <h3 className="font-semibold text-text-primary">Edit user</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Title</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    placeholder="Job title"
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as Role })}
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm text-text-secondary">Bio</label>
                  <input
                    type="text"
                    value={editFormData.bio}
                    onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                    placeholder="Short bio"
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-white transition hover:bg-primary/90"
                >
                  <Check className="h-4 w-4" />
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUserId(null)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border-subtle px-4 py-3 text-text-secondary transition hover:border-primary/40 hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </ShellSection>

      <ShellSection title="Platform roster" subtitle="Manage users, change roles, and remove accounts.">
        <div className="space-y-3">
          {state.users.map((user) => (
            <div key={user.id} className="rounded-2xl border border-border-subtle bg-white/5 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-4 flex-1">
                <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-2xl object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">{user.name}</p>
                  <p className="text-sm text-text-secondary">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && editingUserId !== user.id && (
                  <>
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value as Role)}
                      className="rounded-2xl border border-border-subtle bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/60 text-text-primary"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="rounded-2xl border border-border-subtle bg-white/5 p-2 text-text-secondary transition hover:border-primary/40 hover:text-text-primary"
                      title="Edit user"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {state.users.filter((u) => u.role === 'admin').length > 1 || user.role !== 'admin' ? (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="rounded-2xl border border-border-subtle bg-white/5 p-2 text-text-secondary transition hover:border-red-500/40 hover:text-red-500"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="rounded-2xl border border-border-subtle bg-white/5 p-2 text-text-muted cursor-not-allowed" title="Cannot delete the only admin">
                        <Trash2 className="h-4 w-4 opacity-50" />
                      </div>
                    )}
                  </>
                )}
                {editingUserId !== user.id && !isAdmin && <ViewPill label={user.role} />}
              </div>
            </div>
          ))}
        </div>
      </ShellSection>
    </div>
  );
}

function Check(props: { className?: string }) {
  return <CheckCircle2 className={props.className} />;
}

function FlameIcon(props: { className?: string }) {
  return <Target className={props.className} />;
}

function BellIcon(props: { className?: string }) {
  return <CircleAlert className={props.className} />;
}

export function ClassDetailPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const { state } = useLms();
  const [uploadingAssignmentId, setUploadingAssignmentId] = useState<string | null>(null);
  const [assignmentFiles, setAssignmentFiles] = useState<Record<string, File[]>>({});
  const { currentRole } = useLms();
  const [deletedAssignmentIds, setDeletedAssignmentIds] = useState<Set<string>>(new Set());

  const classroom = state.classes.find((cls) => cls.id === classId);
  // Filter assignments: only show non-submitted and non-deleted ones for students
  const classAssignments = state.assignments.filter((assignment) => {
    if (assignment.classId !== classId) return false;
    if (deletedAssignmentIds.has(assignment.id)) return false;
    // Students don't see submitted/graded assignments in their view
    if (currentRole === 'student' && (assignment.status === 'submitted' || assignment.status === 'graded')) return false;
    return true;
  });

  const handleFileSelect = (assignmentId: string, files: FileList | null) => {
    if (!files) return;
    setAssignmentFiles((prev) => ({
      ...prev,
      [assignmentId]: [...(prev[assignmentId] || []), ...Array.from(files)],
    }));
  };

  const handleRemoveFile = (assignmentId: string, fileName: string) => {
    setAssignmentFiles((prev) => ({
      ...prev,
      [assignmentId]: (prev[assignmentId] || []).filter((f) => f.name !== fileName),
    }));
  };

  const handleUploadFiles = async (assignmentId: string) => {
    const files = assignmentFiles[assignmentId] || [];
    if (files.length === 0) return;

    setUploadingAssignmentId(assignmentId);
    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setAssignmentFiles((prev) => ({
        ...prev,
        [assignmentId]: [],
      }));
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingAssignmentId(null);
    }
  };

  if (!classroom) {
    return (
      <div className="rounded-[2rem] border border-border-subtle bg-white/5 p-10 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-text-muted">Class not found</p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">This classroom could not be found.</h1>
        <button type="button" onClick={() => navigate('/app/classes')} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white transition hover:brightness-110">
          <ChevronLeft className="h-4 w-4" />
          Back to Classes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <button type="button" onClick={() => navigate('/app/classes')} className="flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary">
          <ChevronLeft className="h-4 w-4" />
          Back to classes
        </button>
      </div>

      {/* Class Header */}
      <section className={metricClass}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl" style={{ backgroundColor: classroom.color }} />
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-muted">{classroom.subject}</p>
                <h1 className="mt-1 text-3xl font-semibold text-text-primary">{classroom.title}</h1>
              </div>
            </div>
            <p className="text-text-secondary mb-4">{classroom.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Section</p>
                <p className="mt-1 font-medium text-text-primary">{classroom.section}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Class Code</p>
                <p className="mt-1 font-medium text-text-primary">{classroom.code}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Learners</p>
                <p className="mt-1 font-medium text-text-primary">{classroom.students}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Resources</p>
                <p className="mt-1 font-medium text-text-primary">{classroom.resourceCount}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Progress</p>
            <p className="mt-2 text-4xl font-semibold text-text-primary">{classroom.progress}%</p>
            <div className="mt-3">
              <ProgressBar value={classroom.progress} />
            </div>
          </div>
        </div>
      </section>

      {/* Assignments */}
      <ShellSection title="Class assignments" subtitle={`${classAssignments.length} active assignments for ${classroom.title}`}>
        {classAssignments.length === 0 ? (
          <div className="rounded-3xl border border-border-subtle bg-black/10 p-5 text-sm text-text-secondary text-center">
            No assignments yet for this class.
          </div>
        ) : (
          <div className="space-y-3">
            {classAssignments.map((assignment) => (
              <div key={assignment.id} className="rounded-2xl border border-border-subtle bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-text-primary">{assignment.title}</p>
                      <ViewPill label={assignment.kind} />
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">{assignment.dueDate}</p>
                    <p className="mt-2 text-sm text-text-secondary">{assignment.description}</p>
                  </div>
                  <ViewPill label={assignment.status} />
                </div>
                {/* Delete button for completed assignments */}
                {(assignment.status === 'submitted' || assignment.status === 'graded') && state.currentUser?.role === 'student' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setDeletedAssignmentIds((prev) => new Set([...prev, assignment.id]))}
                      className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Submissions</p>
                    <p className="mt-1 font-semibold text-text-primary">{assignment.submissions}</p>
                  </div>
                  <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Average</p>
                    <p className="mt-1 font-semibold text-text-primary">{assignment.averageScore}/{assignment.maxPoints}</p>
                  </div>
                  <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Plagiarism</p>
                    <p className="mt-1 font-semibold text-text-primary">{assignment.aiPlagiarismScore}%</p>
                  </div>
                </div>

                <div className="mt-4">
                  <ProgressBar value={assignment.maxPoints ? (assignment.averageScore / assignment.maxPoints) * 100 : 0} />
                </div>

                {/* File Upload Section */}
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border-2 border-dashed border-border-subtle bg-black/10 p-4">
                    <label className="block">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileSelect(assignment.id, e.target.files)}
                        className="hidden"
                      />
                      <div className="cursor-pointer text-center">
                        <p className="text-sm font-medium text-text-secondary">+ Add files to this assignment</p>
                        <p className="mt-1 text-xs text-text-muted">Click to upload or drag and drop</p>
                      </div>
                    </label>
                  </div>

                  {/* Selected Files */}
                  {(assignmentFiles[assignment.id] || []).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.24em] text-text-muted">
                        {(assignmentFiles[assignment.id] || []).length} file(s) selected
                      </p>
                      {(assignmentFiles[assignment.id] || []).map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-border-subtle bg-black/20 p-2 text-sm"
                        >
                          <span className="text-text-secondary">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(assignment.id, file.name)}
                            className="text-xs text-text-muted transition hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleUploadFiles(assignment.id)}
                        disabled={uploadingAssignmentId === assignment.id}
                        className="w-full rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
                      >
                        {uploadingAssignmentId === assignment.id ? 'Uploading...' : 'Upload Files'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ShellSection>
    </div>
  );
}

export function GradingPage() {
  const { state, currentRole, gradeSubmission } = useLms();
  const navigate = useNavigate();

  const [selectedClassId, setSelectedClassId] = useState('all');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);

  if (currentRole !== 'teacher' && currentRole !== 'admin') {
    return <NotFoundPage />;
  }

  const myClasses = state.classes.filter((c) => !c.archived);

  const assignmentsForClass =
    selectedClassId === 'all'
      ? state.assignments
      : state.assignments.filter((a) => a.classId === selectedClassId);

  const filteredSubmissions = useMemo(() => {
    return state.submissions.filter((sub) => {
      const assignment = state.assignments.find((a) => a.id === sub.assignmentId);
      if (!assignment) return false;
      if (selectedClassId !== 'all' && assignment.classId !== selectedClassId) return false;
      if (selectedAssignmentId !== 'all' && sub.assignmentId !== selectedAssignmentId) return false;
      if (statusFilter === 'pending' && sub.score !== undefined) return false;
      if (statusFilter === 'graded' && sub.score === undefined) return false;
      return true;
    });
  }, [state.submissions, state.assignments, selectedClassId, selectedAssignmentId, statusFilter]);

  const activeSubmission = activeSubmissionId
    ? filteredSubmissions.find((s) => s.id === activeSubmissionId) ?? filteredSubmissions[0]
    : filteredSubmissions[0];

  const activeIndex = activeSubmission ? filteredSubmissions.findIndex((s) => s.id === activeSubmission.id) : -1;

  const totalCount = state.submissions.length;
  const pendingCount = state.submissions.filter((s) => s.score === undefined).length;
  const gradedCount = state.submissions.filter((s) => s.score !== undefined).length;
  const gradeRate = totalCount ? Math.round((gradedCount / totalCount) * 100) : 0;

  const handleGrade = async (submissionId: string, score: number, feedback: string) => {
    try {
      await api.gradeSubmission(submissionId, score, feedback);
      gradeSubmission(submissionId, score, feedback);
      const idx = filteredSubmissions.findIndex((s) => s.id === submissionId);
      const next = filteredSubmissions.slice(idx + 1).find((s) => s.score === undefined);
      if (next) setActiveSubmissionId(next.id);
    } catch (err) {
      console.error('Grade failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Grade Center</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-primary">SpeedGrader — Review &amp; return student work</h1>
        </div>
        <ViewPill label={currentRole === 'admin' ? 'Admin view' : 'Teacher controls'} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Submitted" value={totalCount} note="All assignments" icon={ClipboardCheck} accent="bg-blue-500" />
        <StatCard title="Pending Review" value={pendingCount} note="Awaiting your grade" icon={Clock3} accent="bg-amber-500" />
        <StatCard title="Graded" value={gradedCount} note="Feedback returned" icon={CheckCircle2} accent="bg-emerald-500" />
        <StatCard title="Grade Rate" value={`${gradeRate}%`} note="Completion progress" icon={Target} accent="bg-purple-500" />
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={selectedClassId}
          onChange={(e) => { setSelectedClassId(e.target.value); setSelectedAssignmentId('all'); setActiveSubmissionId(null); }}
          className="rounded-2xl border border-border-subtle bg-white/5 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary/60"
        >
          <option value="all">All classes</option>
          {myClasses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select
          value={selectedAssignmentId}
          onChange={(e) => { setSelectedAssignmentId(e.target.value); setActiveSubmissionId(null); }}
          className="rounded-2xl border border-border-subtle bg-white/5 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary/60"
        >
          <option value="all">All assignments</option>
          {assignmentsForClass.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
        <div className="flex overflow-hidden rounded-2xl border border-border-subtle">
          {(['all', 'pending', 'graded'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setStatusFilter(s); setActiveSubmissionId(null); }}
              className={`px-5 py-2.5 text-sm font-medium transition ${statusFilter === s ? 'bg-primary text-white' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'}`}
            >
              {s === 'all' ? 'All' : s === 'pending' ? 'Pending' : 'Graded'}
            </button>
          ))}
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="rounded-[2rem] border border-border-subtle bg-white/5 p-16 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-text-muted" />
          <p className="mt-4 text-lg font-semibold text-text-primary">No submissions yet</p>
          <p className="mt-2 text-sm text-text-secondary">Student submissions will appear here once they submit their work.</p>
          <button
            type="button"
            onClick={() => navigate('/app/assignments')}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Create an assignment
          </button>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          {/* Submission roster */}
          <div className={metricClass + ' !p-0 flex flex-col overflow-hidden'}>
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
              <div>
                <h2 className="font-semibold text-text-primary">Submissions</h2>
                <p className="mt-0.5 text-xs text-text-muted">{filteredSubmissions.length} shown</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-text-muted">{filteredSubmissions.filter((s) => s.score !== undefined).length} graded</span>
              </div>
            </div>

            {filteredSubmissions.length > 0 && (
              <div className="border-b border-border-subtle px-5 py-3">
                <div className="mb-1 flex items-center justify-between text-xs text-text-muted">
                  <span>Grading progress</span>
                  <span>{filteredSubmissions.filter((s) => s.score !== undefined).length}/{filteredSubmissions.length}</span>
                </div>
                <ProgressBar value={filteredSubmissions.length ? (filteredSubmissions.filter((s) => s.score !== undefined).length / filteredSubmissions.length) * 100 : 0} />
              </div>
            )}

            <div className="flex-1 divide-y divide-border-subtle overflow-y-auto" style={{ maxHeight: 'calc(100vh - 460px)', minHeight: '200px' }}>
              {filteredSubmissions.length === 0 ? (
                <div className="p-8 text-center text-sm text-text-secondary">No submissions match your filters.</div>
              ) : (
                filteredSubmissions.map((sub) => {
                  const assignment = state.assignments.find((a) => a.id === sub.assignmentId);
                  const student = state.users.find((u) => u.id === sub.studentId);
                  const isActive = sub.id === activeSubmission?.id;
                  const isGraded = sub.score !== undefined;
                  const pct = isGraded && assignment?.maxPoints ? Math.round((sub.score! / assignment.maxPoints) * 100) : null;

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setActiveSubmissionId(sub.id)}
                      className={`w-full border-l-[3px] px-4 py-3.5 text-left transition ${isActive ? 'border-l-primary bg-primary/15' : 'border-l-transparent hover:bg-white/[0.04]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img src={student?.avatar} alt={student?.name} className="h-10 w-10 rounded-xl object-cover" />
                          <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--panel)] ${isGraded ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-text-primary">{student?.name ?? 'Student'}</p>
                          <p className="truncate text-xs text-text-secondary">{assignment?.title ?? 'Assignment'}</p>
                          <p className="text-xs text-text-muted">{new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          {isGraded ? (
                            <span className={`text-sm font-bold ${pct! >= 80 ? 'text-emerald-400' : pct! >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                              {sub.score}/{assignment?.maxPoints}
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400">Pending</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Grading panel */}
          {activeSubmission ? (
            <GradingPanel
              key={activeSubmission.id}
              submission={activeSubmission}
              assignment={state.assignments.find((a) => a.id === activeSubmission.assignmentId)!}
              student={state.users.find((u) => u.id === activeSubmission.studentId)}
              classroom={(() => {
                const a = state.assignments.find((x) => x.id === activeSubmission.assignmentId);
                return state.classes.find((c) => c.id === a?.classId);
              })()}
              onGrade={handleGrade}
              currentIndex={activeIndex + 1}
              totalCount={filteredSubmissions.length}
              onPrev={() => { if (activeIndex > 0) setActiveSubmissionId(filteredSubmissions[activeIndex - 1].id); }}
              onNext={() => { if (activeIndex < filteredSubmissions.length - 1) setActiveSubmissionId(filteredSubmissions[activeIndex + 1].id); }}
            />
          ) : (
            <div className={metricClass + ' flex min-h-[200px] items-center justify-center'}>
              <p className="text-sm text-text-muted">Select a submission from the list to grade.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GradingPanel({
  submission,
  assignment,
  student,
  classroom,
  onGrade,
  currentIndex,
  totalCount,
  onPrev,
  onNext,
}: {
  submission: StudentSubmission;
  assignment: Assignment;
  student: UserAccount | undefined;
  classroom: Classroom | undefined;
  onGrade: (id: string, score: number, feedback: string) => Promise<void>;
  currentIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
  key?: string | number;
}) {
  const [score, setScore] = useState(submission.score !== undefined ? String(submission.score) : '');
  const [feedback, setFeedback] = useState(submission.teacherFeedback ?? '');
  const [checkedRubric, setCheckedRubric] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(submission.score !== undefined);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  useEffect(() => {
    setScore(submission.score !== undefined ? String(submission.score) : '');
    setFeedback(submission.teacherFeedback ?? '');
    setCheckedRubric(new Set());
    setSaved(submission.score !== undefined);
    setAiSuggestion(null);
  }, [submission.id]);

  const numScore = Number(score);
  const pct = score && !isNaN(numScore) && assignment.maxPoints ? Math.round((numScore / assignment.maxPoints) * 100) : null;
  const letterGrade = pct === null ? '—' : pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
  const gradeColor = pct === null ? 'text-text-muted' : pct >= 80 ? 'text-emerald-400' : pct >= 70 ? 'text-amber-300' : pct >= 60 ? 'text-amber-500' : 'text-red-400';
  const gradeBg = pct === null ? 'border-border-subtle bg-black/20' : pct >= 80 ? 'border-emerald-500/20 bg-emerald-500/10' : pct >= 60 ? 'border-amber-500/20 bg-amber-500/10' : 'border-red-500/20 bg-red-500/10';

  const submittedDate = new Date(submission.submittedAt).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
  const isLate = !!(assignment.dueDate && new Date(submission.submittedAt) > new Date(assignment.dueDate));

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!score || isNaN(numScore)) return;
    setSaving(true);
    await onGrade(submission.id, numScore, feedback);
    setSaved(true);
    setSaving(false);
  };

  const handleAiFeedback = async () => {
    setAiLoading(true);
    try {
      const res = await api.getAssignmentFeedback(submission.notes || submission.fileName, assignment.rubric);
      const parts = [
        res.strengths?.length ? `Strengths: ${res.strengths.join(' ')}` : '',
        res.concerns?.length ? `Areas to improve: ${res.concerns.join(' ')}` : '',
        res.nextSteps?.length ? `Next steps: ${res.nextSteps.join(' ')}` : '',
      ].filter(Boolean).join('\n\n');
      setAiSuggestion(parts);
      if (!feedback) {
        setFeedback(parts);
        setSaved(false);
      }
      if (!score && res.score) {
        setScore(String(Math.round((res.score / 100) * assignment.maxPoints)));
        setSaved(false);
      }
    } catch {
      setAiSuggestion('AI feedback unavailable — write your own below.');
    }
    setAiLoading(false);
  };

  const toggleRubric = (idx: number) => {
    const next = new Set(checkedRubric);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    setCheckedRubric(next);
  };

  return (
    <div className={metricClass}>
      {/* Navigation bar */}
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={currentIndex <= 1}
            className="rounded-xl border border-border-subtle p-2 transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4 text-text-secondary" />
          </button>
          <span className="min-w-[5rem] text-center text-sm text-text-muted">{currentIndex} of {totalCount}</span>
          <button
            type="button"
            onClick={onNext}
            disabled={currentIndex >= totalCount}
            className="rounded-xl border border-border-subtle p-2 transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4 text-text-secondary" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ViewPill label={assignment.kind} />
          {saved ? (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">✓ Graded</span>
          ) : (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">Needs grading</span>
          )}
          {isLate && (
            <span className="rounded-full border border-red-500/30 bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400">⚠ Late</span>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        {/* Left: submission details */}
        <div className="space-y-5">
          {/* Student header */}
          <div className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-white/5 p-4">
            <img src={student?.avatar} alt={student?.name} className="h-14 w-14 rounded-2xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-text-primary">{student?.name ?? 'Student'}</p>
              <p className="truncate text-sm text-text-secondary">{student?.email}</p>
              <p className="mt-1 text-xs text-text-muted">{classroom?.title}{classroom?.subject ? ` · ${classroom.subject}` : ''}</p>
            </div>
          </div>

          {/* Assignment info */}
          <div className="space-y-3 rounded-2xl border border-border-subtle bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Assignment</p>
                <p className="mt-1 text-base font-semibold text-text-primary">{assignment.title}</p>
                {assignment.description && <p className="mt-1 text-sm text-text-secondary">{assignment.description}</p>}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-text-muted">Max points</p>
                <p className="text-xl font-bold text-text-primary">{assignment.maxPoints}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 border-t border-border-subtle pt-3">
              {assignment.dueDate && (
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Clock3 className="h-3.5 w-3.5" />
                  Due {assignment.dueDate}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <CalendarDays className="h-3.5 w-3.5" />
                Submitted {submittedDate}
              </div>
            </div>
          </div>

          {/* Submitted file + notes */}
          <div className="space-y-3 rounded-2xl border border-border-subtle bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Submitted Work</p>
            <a
              href={submission.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/20"
            >
              <FolderOpen className="h-4 w-4" />
              {submission.fileName || 'View submission'}
            </a>
            {submission.notes && (
              <div className="rounded-xl border border-border-subtle bg-white/5 px-4 py-3">
                <p className="text-xs text-text-muted">Student notes</p>
                <p className="mt-1 text-sm italic text-text-secondary">"{submission.notes}"</p>
              </div>
            )}
          </div>

          {/* Rubric checklist */}
          {assignment.rubric.length > 0 && (
            <div className="rounded-2xl border border-border-subtle bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Rubric Checklist</p>
                <span className="text-xs font-semibold text-text-secondary">{checkedRubric.size}/{assignment.rubric.length} met</span>
              </div>
              <div className="space-y-1">
                {assignment.rubric.map((item, idx) => (
                  <label key={idx} className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={checkedRubric.has(idx)}
                      onChange={() => toggleRubric(idx)}
                      className="mt-0.5 h-4 w-4 accent-primary"
                    />
                    <span className={`text-sm transition-all ${checkedRubric.has(idx) ? 'text-text-muted line-through' : 'text-text-secondary'}`}>{item}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 border-t border-border-subtle pt-3">
                <ProgressBar value={assignment.rubric.length ? (checkedRubric.size / assignment.rubric.length) * 100 : 0} />
              </div>
            </div>
          )}
        </div>

        {/* Right: grading controls */}
        <div className="space-y-5">
          {/* Grade display */}
          <div className={`rounded-2xl border p-5 text-center transition-all ${gradeBg}`}>
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Grade</p>
            <p className={`mt-2 text-7xl font-bold tracking-tight ${gradeColor}`}>{letterGrade}</p>
            {pct !== null ? (
              <p className="mt-2 text-sm text-text-secondary">{numScore} / {assignment.maxPoints} · {pct}%</p>
            ) : (
              <p className="mt-2 text-sm text-text-muted">Enter a score below</p>
            )}
          </div>

          {/* Grade form */}
          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-muted">
                Score (0 – {assignment.maxPoints})
              </label>
              <input
                type="range"
                min="0"
                max={assignment.maxPoints}
                value={score || 0}
                onChange={(e) => { setScore(e.target.value); setSaved(false); }}
                className="mb-2 w-full accent-primary"
              />
              <input
                type="number"
                min="0"
                max={assignment.maxPoints}
                value={score}
                onChange={(e) => { setScore(e.target.value); setSaved(false); }}
                placeholder={`0 – ${assignment.maxPoints}`}
                className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-center text-lg font-bold text-text-primary outline-none focus:border-primary/60"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs uppercase tracking-[0.2em] text-text-muted">Teacher Feedback</label>
                <button
                  type="button"
                  onClick={handleAiFeedback}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/20 disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3" />
                  {aiLoading ? 'Generating…' : 'AI assist'}
                </button>
              </div>
              {aiSuggestion && (
                <div className="mb-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-text-secondary">
                  <p className="mb-1.5 font-semibold text-primary">AI suggestion</p>
                  <p className="leading-relaxed whitespace-pre-line">{aiSuggestion}</p>
                  {feedback !== aiSuggestion && (
                    <button
                      type="button"
                      onClick={() => { setFeedback(aiSuggestion); setSaved(false); }}
                      className="mt-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/20"
                    >
                      Apply to feedback
                    </button>
                  )}
                </div>
              )}
              <textarea
                value={feedback}
                onChange={(e) => { setFeedback(e.target.value); setSaved(false); }}
                rows={7}
                placeholder="Write specific feedback — highlight strengths, point out areas for improvement, and suggest next steps..."
                className="w-full resize-none rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-sm text-text-primary leading-relaxed outline-none focus:border-primary/60"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !score}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 className="h-5 w-5" />
              {saving ? 'Saving grade…' : saved ? 'Update grade' : 'Save & return grade'}
            </button>

            {saved && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Grade saved — student can now view their score and feedback.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="rounded-[2rem] border border-border-subtle bg-white/5 p-10 text-center">
      <p className="text-sm uppercase tracking-[0.24em] text-text-muted">Page not found</p>
      <h1 className="mt-3 text-3xl font-semibold text-text-primary">The requested view does not exist.</h1>
    </div>
  );
}
