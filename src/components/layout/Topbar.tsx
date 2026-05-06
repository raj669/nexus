import { Search, Bell, Menu } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="h-20 glass border-b px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden text-text-secondary">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search courses, mentors, or assignments..." 
            className="w-full bg-white/[0.03] border border-border-subtle rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-text-muted"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="relative p-2 text-text-secondary hover:bg-white/5 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-bg-surface"></span>
          </button>
          <button className="p-2 text-text-secondary hover:bg-white/5 rounded-full transition-colors">
            <span className="material-symbols-outlined text-lg">dark_mode</span>
          </button>
        </div>

        <div className="h-8 w-[1px] bg-border-subtle"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">Alex Rivers</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Premium Student</p>
          </div>
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-border-subtle group-hover:border-primary/50 transition-colors">
            <img 
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&h=150&auto=format&fit=crop" 
              alt="User" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
