import { Bell, LogOut, Menu, Moon, Search, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';

const titleMap: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/classes': 'Classes',
  '/app/assignments': 'Assignments',
  '/app/collaboration': 'Collaboration',
  '/app/calendar': 'Calendar',
  '/app/resources': 'Resources',
  '/app/analytics': 'Analytics',
  '/app/settings': 'Settings',
  '/app/admin': 'Admin',
};

export default function Topbar() {
  const location = useLocation();
  const { currentUser, currentRole, signOut, state, toggleSidebar, toggleTheme } = useLms();
  const unreadCount = state.notifications.filter((notification) => notification.unread).length;
  const title = titleMap[location.pathname] ?? 'Workspace';

  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle bg-[var(--panel)]/92 backdrop-blur-2xl">
      <div className="flex min-h-[4.75rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center gap-4">
          <button type="button" onClick={toggleSidebar} className="rounded-2xl border border-border-subtle p-2 text-text-secondary transition hover:border-primary/40 hover:text-text-primary lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block">
            <p className="text-xs uppercase tracking-[0.28em] text-text-muted">Nexus LMS</p>
            <h1 className="mt-1 text-2xl font-semibold text-text-primary">{title}</h1>
          </div>
          <div className="relative flex-1 max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              aria-label="Search the workspace"
              placeholder="Search classes, assignments, messages, and files"
              className="w-full rounded-2xl border border-border-subtle bg-white/5 py-3 pl-11 pr-4 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" className="relative rounded-2xl border border-border-subtle p-2 text-text-secondary transition hover:border-primary/40 hover:text-text-primary">
            <Bell className="h-5 w-5" />
            {unreadCount ? <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[var(--panel)]" /> : null}
          </button>
          <button type="button" onClick={toggleTheme} className="rounded-2xl border border-border-subtle p-2 text-text-secondary transition hover:border-primary/40 hover:text-text-primary">
            {state.preferences.theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button type="button" onClick={signOut} className="hidden items-center gap-2 rounded-2xl border border-border-subtle px-3 py-2 text-sm text-text-secondary transition hover:border-red-500/40 hover:text-red-200 sm:flex">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <div className="hidden items-center gap-3 rounded-2xl border border-border-subtle bg-white/5 px-3 py-2 lg:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-text-primary">{currentUser?.name}</p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">{currentRole}</p>
            </div>
            <img src={currentUser?.avatar} alt={currentUser?.name ?? 'User'} className="h-10 w-10 rounded-xl object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}
