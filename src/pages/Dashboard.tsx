import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Clock, 
  Award, 
  BookOpen, 
  PlayCircle,
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';

const stats = [
  { label: 'Courses Completed', value: '12', change: 4, icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Learning Hours', value: '128h', change: 12, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Resources Accessed', value: '45', change: 2, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { label: 'Current Progress', value: '78%', change: 5, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

const activeCourses = [
  {
    id: '1',
    title: 'Advanced UI/UX Architecture',
    instructor: 'Sarah Jenkins',
    progress: 65,
    lessons: 24,
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Modern Frontend Mechanics',
    instructor: 'David Chen',
    progress: 42,
    lessons: 18,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop'
  }
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent border border-white/10">
        <div className="relative z-10 max-w-2xl">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-display font-bold text-white mb-4"
          >
            Welcome back, Alex! 👋
          </motion.h2>
          <p className="text-text-secondary text-lg mb-6 leading-relaxed">
            You've completed <span className="text-white font-semibold">85%</span> of your weekly goals. 
            Your "Advanced UI Architecture" assignment is due in 3 hours.
          </p>
          <div className="flex gap-4">
            <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              Continue Learning
            </button>
            <button className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-semibold border border-white/10 transition-all">
              View Schedule
            </button>
          </div>
        </div>
        
        {/* Background purely decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-secondary/20 blur-[60px] rounded-full"></div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-elevated p-6 rounded-2xl group hover:border-primary/30 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-emerald-500 text-xs font-bold flex items-center bg-emerald-500/10 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {stat.change}%
              </span>
            </div>
            <p className="text-text-muted text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Courses */}
        <section className="xl:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-display font-bold text-white">Active Courses</h3>
            <button className="text-primary text-sm font-semibold hover:underline">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeCourses.map((course) => (
              <div key={course.id} className="glass border-border-subtle rounded-2xl overflow-hidden flex flex-col group hover:shadow-2xl transition-all">
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      Ongoing
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{course.title}</h4>
                  <p className="text-text-muted text-sm mb-6 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-text-muted rounded-full"></span>
                    {course.instructor}
                  </p>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex justify-between items-end text-xs mb-1">
                      <span className="text-text-secondary font-medium">Course Progress</span>
                      <span className="text-white font-bold">{course.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                       <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{course.lessons} Lessons Total</span>
                       <button className="p-2 bg-white/5 rounded-lg text-white hover:bg-primary hover:text-white transition-all">
                        <PlayCircle className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sidebar Mini-feed / Upcoming */}
        <section className="space-y-6">
          <h3 className="text-xl font-display font-bold text-white">Upcoming Events</h3>
          <div className="space-y-4">
            {[
              { title: 'Project Review', time: '10:00 AM', date: 'Today', type: 'Meet' },
              { title: 'UX Research Q&A', time: '02:30 PM', date: 'Today', type: 'Webinar' },
              { title: 'Design Patterns', time: '09:00 AM', date: 'Tomorrow', type: 'Class' },
            ].map((event, idx) => (
              <div key={idx} className="glass p-4 rounded-xl flex items-center gap-4 group hover:bg-white/[0.05] transition-all cursor-pointer border-l-4 border-l-primary/30">
                <div className="text-center min-w-[50px]">
                  <p className="text-[10px] uppercase font-bold text-text-muted">{event.date}</p>
                  <p className="text-sm font-bold text-white">{event.time.split(' ')[0]}</p>
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{event.title}</h5>
                  <p className="text-xs text-text-muted">{event.type}</p>
                </div>
                <button className="text-text-muted hover:text-white transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-secondary/40 to-primary/40 p-6 rounded-2xl relative overflow-hidden group cursor-pointer">
            <div className="relative z-10">
              <h4 className="text-lg font-bold text-white mb-1">Upgrade to Pro</h4>
              <p className="text-xs text-white/70 mb-4">Unlock 200+ exclusive courses and mentorship.</p>
              <button className="bg-white text-bg-main px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-transform">Get Started</button>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 blur-xl rounded-full group-hover:scale-150 transition-transform"></div>
          </div>
        </section>
      </div>
    </div>
  );
}
