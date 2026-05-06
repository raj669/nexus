import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  GraduationCap, 
  Settings, 
  LogOut,
  Calendar,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: BookOpen, label: 'My Courses', path: '/courses' },
  { icon: Calendar, label: 'Schedule', path: '/schedule' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: GraduationCap, label: 'Grades', path: '/grades' },
  { icon: Users, label: 'Community', path: '/community' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen flex flex-col glass border-r sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-white font-bold text-2xl">rocket_launch</span>
        </div>
        <h1 className="text-xl font-display font-bold tracking-tight text-white">
          Nexus<span className="text-primary text-2xl leading-none">.</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-primary/20 text-primary border border-primary/20' 
                : 'text-text-secondary hover:bg-white/[0.05] hover:text-white'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-text-muted transition-colors group-hover:text-white'}`} />
                <span className="font-medium">{item.label}</span>
                {item.path === '/messages' && (
                  <span className="ml-auto bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border-subtle">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all group">
          <LogOut className="w-5 h-5 text-text-muted group-hover:text-red-400" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
