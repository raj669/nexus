import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { motion, AnimatePresence } from 'motion/react';
import { useLms } from '../../context/LmsContext';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { state, toggleSidebar } = useLms();

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-main text-text-primary">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.12),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_30%)]" />
      {state.preferences.sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-slate-950/55 backdrop-blur-sm lg:hidden"
        />
      ) : null}
      <Sidebar />
      <div className="relative z-10 flex min-h-screen flex-1 flex-col sm:pl-72 lg:pl-80">
        <Topbar />
        <main className="flex-1 overflow-x-hidden px-3 pb-6 pt-3 sm:px-4 sm:pb-8 sm:pt-4 md:px-6 lg:px-8 lg:pb-8 lg:pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-4 sm:space-y-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
