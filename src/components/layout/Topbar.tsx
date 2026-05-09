import { useState } from 'react';
import { Bell, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';
import type { Role } from '../../lib/types';

const staticTitleMap: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/collaboration': 'Discussions',
  '/app/calendar': 'Calendar',
  '/app/resources': 'Resources',
  '/app/settings': 'Settings',
  '/app/admin': 'User Management',
};

const rolePageTitles: Record<string, Partial<Record<Role, string>>> = {
  '/app/classes': {
    student: 'My Courses',
    teacher: 'My Classes',
    admin: 'All Classes',
  },
  '/app/assignments': {
    student: 'Assignments',
    teacher: 'Grade Center',
    admin: 'Assignment Overview',
  },
  '/app/analytics': {
    student: 'My Grades',
    teacher: 'Class Analytics',
    admin: 'Platform Analytics',
  },
};

function getTitle(pathname: string, role: Role | null): string {
  const roleMap = rolePageTitles[pathname];
  if (roleMap && role && roleMap[role]) return roleMap[role]!;
  return staticTitleMap[pathname] ?? 'Workspace';
}

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, currentRole, signOut, state, toggleSidebar, toggleTheme, markNotificationRead } = useLms();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = state.notifications.filter((notification) => notification.unread).length;
  const title = getTitle(location.pathname, currentRole);

  const roleColors: Record<Role, string> = {
    student: 'text-blue-400',
    teacher: 'text-emerald-400',
    admin: 'text-purple-400',
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle bg-[var(--panel)]/92 backdrop-blur-2xl">
      <div className="flex min-h-12 items-center justify-between gap-2 px-3 py-2 sm:min-h-[3.75rem] sm:gap-4 sm:px-4 md:px-6 lg:min-h-[4.75rem] lg:px-8 lg:py-3">
        <div className="flex flex-1 items-center gap-2 sm:gap-4">
          <button type="button" onClick={toggleSidebar} className="rounded-2xl border border-border-subtle p-1.5 text-text-secondary transition hover:border-primary/40 hover:text-text-primary lg:hidden sm:p-2" aria-label="Toggle sidebar">
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div className="hidden lg:block">
            <p className="text-[9px] uppercase tracking-[0.2em] text-text-muted sm:text-[10px] sm:tracking-[0.24em]\">UniPlanner</p>
            <h1 className="mt-0.5 text-lg font-semibold text-text-primary sm:mt-1 sm:text-2xl">{title}</h1>
          </div>
          <div className="flex-1" />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((previous) => !previous)}
              aria-expanded={notificationsOpen}
              aria-label="Open notifications"
              className="relative rounded-2xl border border-border-subtle p-2 text-text-secondary transition hover:border-primary/40 hover:text-text-primary"
            >
              <Bell className="h-5 w-5" />
              {unreadCount ? <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[var(--panel)]" /> : null}
            </button>

            {notificationsOpen ? (
              <div className="absolute right-0 top-full z-30 mt-3 w-80 overflow-hidden rounded-3xl border border-border-subtle bg-[var(--panel)] shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                  <p className="text-sm font-semibold text-text-primary">Notifications</p>
                  <button type="button" onClick={() => navigate('/app/settings')} className="text-xs font-medium text-primary hover:underline">
                    Settings
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto p-2">
                  {state.notifications.length ? (
                    state.notifications.slice(0, 5).map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => {
                          markNotificationRead(notification.id);
                          setNotificationsOpen(false);
                        }}
                        className={`w-full rounded-2xl px-4 py-3 text-left transition hover:bg-white/5 ${notification.unread ? 'bg-primary/10' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-text-primary">{notification.title}</p>
                            <p className="mt-1 text-sm text-text-secondary">{notification.description}</p>
                          </div>
                          {notification.unread ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-6 text-sm text-text-secondary">No notifications yet.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
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
              <p className={`text-[10px] uppercase tracking-[0.24em] font-semibold ${currentRole ? roleColors[currentRole] : 'text-text-muted'}`}>
                {currentRole === 'admin' ? 'Administrator' : currentRole === 'teacher' ? 'Educator' : 'Student'}
              </p>
            </div>
            <img src={currentUser?.avatar} alt={currentUser?.name ?? 'User'} className="h-10 w-10 rounded-xl object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}
