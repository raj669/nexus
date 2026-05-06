import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';

// Simple placeholder components for other routes
const Courses = () => <div className="space-y-6">
  <h2 className="text-3xl font-display font-bold text-white">My Courses</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[1,2,3,4,5,6].map(i => (
      <div key={i} className="glass aspect-[4/3] rounded-2xl border-white/5 animate-pulse" />
    ))}
  </div>
</div>;

const Messages = () => <div className="h-[calc(100vh-200px)] glass rounded-3xl flex items-center justify-center border-white/5">
  <div className="text-center space-y-4">
    <div className="material-symbols-outlined text-6xl text-text-muted">forum</div>
    <h2 className="text-2xl font-display font-bold text-white">Message Hub</h2>
    <p className="text-text-muted">Select a conversation to start chatting.</p>
  </div>
</div>;

const Profile = () => <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
  <div className="flex items-center gap-6">
    <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-primary/20">
      <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300" alt="Avatar" className="w-full h-full object-cover" />
    </div>
    <div>
      <h2 className="text-4xl font-display font-bold text-white">Alex Rivers</h2>
      <p className="text-primary font-medium tracking-wide border-b border-primary/20 inline-block">Product Design Student</p>
    </div>
  </div>
</div>;

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}
