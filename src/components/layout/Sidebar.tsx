import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  Calendar,
  Shield,
  FolderOpen,
  ClipboardList,
  BarChart3,
  GraduationCap,
  Users,
  Trophy,
  PenLine,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';

const studentNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
  { icon: BookOpen, label: 'My Courses', path: '/app/classes' },
  { icon: ClipboardList, label: 'Assignments', path: '/app/assignments' },
  { icon: Trophy, label: 'My Grades', path: '/app/analytics' },
  { icon: Calendar, label: 'Calendar', path: '/app/calendar' },
  { icon: FolderOpen, label: 'Resources', path: '/app/resources' },
  { icon: MessageSquare, label: 'Discussions', path: '/app/collaboration' },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
];

const teacherNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
  { icon: GraduationCap, label: 'My Classes', path: '/app/classes' },
  { icon: ClipboardList, label: 'Assignments', path: '/app/assignments' },
  { icon: PenLine, label: 'SpeedGrader', path: '/app/grading' },
  { icon: Calendar, label: 'Schedule', path: '/app/calendar' },
  { icon: FolderOpen, label: 'Resources', path: '/app/resources' },
  { icon: BarChart3, label: 'Class Analytics', path: '/app/analytics' },
  { icon: MessageSquare, label: 'Discussions', path: '/app/collaboration' },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
];

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
  { icon: Users, label: 'User Management', path: '/app/admin' },
  { icon: BarChart3, label: 'Platform Analytics', path: '/app/analytics' },
  { icon: BookOpen, label: 'All Classes', path: '/app/classes' },
  { icon: ClipboardList, label: 'Assignments', path: '/app/assignments' },
  { icon: Calendar, label: 'Calendar', path: '/app/calendar' },
  { icon: Shield, label: 'System Settings', path: '/app/settings' },
];

const roleBadgeColors: Record<string, string> = {
  student: 'bg-blue-500/20 text-blue-300',
  teacher: 'bg-emerald-500/20 text-emerald-300',
  admin: 'bg-purple-500/20 text-purple-300',
};

export default function Sidebar() {
  const { currentUser, state, toggleSidebar, signOut } = useLms();

  const navItems =
    currentUser?.role === 'admin'
      ? adminNavItems
      : currentUser?.role === 'teacher'
        ? teacherNavItems
        : studentNavItems;

  const roleLabel =
    currentUser?.role === 'admin'
      ? 'Administrator'
      : currentUser?.role === 'teacher'
        ? 'Educator'
        : 'Student';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border-subtle bg-[var(--panel)] backdrop-blur-2xl transition-transform duration-300 sm:w-80 lg:translate-x-0 ${state.preferences.sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      aria-label="Primary navigation"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle p-4 sm:p-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/20 sm:h-11 sm:w-11">
            <span className="material-symbols-outlined text-xl sm:text-2xl">rocket_launch</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">UniPlanner</h1>
            <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted sm:text-xs sm:tracking-[0.28em]">Next-gen planner</p>
          </div>
        </div>
        <button type="button" onClick={toggleSidebar} className="rounded-full border border-border-subtle p-2 text-text-secondary transition hover:border-primary/40 hover:text-text-primary lg:hidden" aria-label="Close sidebar">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div className="border-b border-border-subtle px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-3 rounded-3xl border border-border-subtle bg-white/5 p-3">
          <img src={currentUser?.avatar} alt={currentUser?.name ?? 'User'} className="h-10 w-10 shrink-0 rounded-2xl object-cover sm:h-12 sm:w-12" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">{currentUser?.name}</p>
            <p className="truncate text-xs text-text-secondary">{currentUser?.title}</p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider sm:text-[10px] ${roleBadgeColors[currentUser?.role ?? 'student']}`}>
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/app'}
            onClick={() => state.preferences.sidebarOpen && toggleSidebar()}
            className={({ isActive }) => `
              flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all duration-200 group sm:px-4 sm:py-3
              ${isActive
                ? 'border border-primary/20 bg-primary/15 text-primary'
                : 'text-text-secondary hover:bg-white/[0.06] hover:text-text-primary'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : 'text-text-muted transition-colors group-hover:text-text-primary'}`} />
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border-subtle p-3 sm:p-4">
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-text-secondary transition hover:bg-red-500/10 hover:text-red-200 sm:px-4 sm:py-3">
          <LogOut className="h-5 w-5 shrink-0 text-text-muted" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
