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
  ClipboardCheck,
  PanelsTopLeft,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';

const baseNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
  { icon: BookOpen, label: 'Classes', path: '/app/classes' },
  { icon: ClipboardCheck, label: 'Assignments', path: '/app/assignments' },
  { icon: MessageSquare, label: 'Collaboration', path: '/app/collaboration' },
  { icon: Calendar, label: 'Calendar', path: '/app/calendar' },
  { icon: FolderOpen, label: 'Resources', path: '/app/resources' },
  { icon: PanelsTopLeft, label: 'Analytics', path: '/app/analytics' },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
];

const adminItem = { icon: Shield, label: 'Admin', path: '/app/admin' };

export default function Sidebar() {
  const { currentUser, state, toggleSidebar, signOut } = useLms();
  const navItems = currentUser?.role === 'admin' ? [...baseNavItems, adminItem] : baseNavItems;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-80 flex-col border-r border-border-subtle bg-[var(--panel)] backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${state.preferences.sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      aria-label="Primary navigation"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-2xl">rocket_launch</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">Nexus</h1>
            <p className="text-xs uppercase tracking-[0.28em] text-text-muted">Next-gen LMS</p>
          </div>
        </div>
        <button type="button" onClick={toggleSidebar} className="rounded-full border border-border-subtle p-2 text-text-secondary transition hover:border-primary/40 hover:text-text-primary lg:hidden">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div className="border-b border-border-subtle px-6 py-5">
        <div className="flex items-center gap-3 rounded-3xl border border-border-subtle bg-white/5 p-3">
          <img src={currentUser?.avatar} alt={currentUser?.name ?? 'User'} className="h-12 w-12 rounded-2xl object-cover" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">{currentUser?.name}</p>
            <p className="truncate text-xs text-text-secondary">{currentUser?.title}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => state.preferences.sidebarOpen && toggleSidebar()}
            className={({ isActive }) => `
              flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 group
              ${isActive 
                ? 'border border-primary/20 bg-primary/15 text-primary' 
                : 'text-text-secondary hover:bg-white/[0.06] hover:text-text-primary'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-text-muted transition-colors group-hover:text-text-primary'}`} />
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border-subtle p-4">
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-text-secondary transition hover:bg-red-500/10 hover:text-red-200">
          <LogOut className="h-5 w-5 text-text-muted" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
