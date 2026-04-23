import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Activity, Lock, BookOpen, Loader2, ChevronRight, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className="glass-panel p-8 flex flex-col border-white/5 relative overflow-hidden group bg-white/[0.01]">
    <div className={`absolute top-0 right-0 w-32 h-32 blur-[100px] opacity-20 -mr-16 -mt-16 transition-all group-hover:opacity-40 ${color}`} />
    <div className="flex items-center gap-4 mb-6 relative z-10">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{title}</p>
    </div>
    <h3 className="text-4xl font-black text-white font-syne relative z-10">{value}</h3>
  </div>
);

const AdminPanel = ({ activeTab: initialTab }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab || 'users');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, sessionsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/sessions')
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data.users);
        setSessions(sessionsRes.data.sessions);
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h > 0 ? h + 'h ' : ''}${m}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {activeTab === 'dashboard' || !initialTab ? (
        <>
          <div className="mb-12">
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter font-syne uppercase">Overview</h1>
            <p className="text-white/40 font-medium">Real-time system metrics and health.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard icon={Users} title="Registered Users" value={stats?.totalUsers || 0} color="bg-blue-500" />
            <StatCard icon={BookOpen} title="Total Schedules" value={stats?.totalSchedules || 0} color="bg-indigo-500" />
            <StatCard icon={Activity} title="Total Sessions" value={stats?.totalSessions || 0} color="bg-emerald-500" />
            <StatCard icon={ShieldAlert} title="Security Locks" value={stats?.lockedSessions || 0} color="bg-red-500" />
          </div>
        </>
      ) : null}

      <div className="glass-panel p-1 border-white/5 mb-8 flex gap-1 bg-white/[0.02] max-w-md">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'
          }`}
        >
          Users
        </button>
        <button 
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'sessions' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'
          }`}
        >
          Sessions
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'users' ? (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-4"
          >
            <div className="glass-panel p-4 lg:px-8 border-white/5 bg-white/[0.01] grid grid-cols-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
              <span>User Identity</span>
              <span className="text-center">Email</span>
              <span className="text-center">XP Points</span>
              <span className="text-right">Account Type</span>
            </div>
            {users.map((user) => (
              <div key={user._id} className="glass-panel p-6 lg:px-8 grid grid-cols-4 items-center border-white/5 group hover:bg-white/[0.03] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-syne">{user.name}</h3>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">@{user.username}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-white/40 text-center truncate px-4">{user.email}</span>
                <span className="text-lg font-black text-white text-center font-syne">{user.points || 0}</span>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40">
                    {user.role || 'Standard'}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-4"
          >
            <div className="glass-panel p-4 lg:px-8 border-white/5 bg-white/[0.01] grid grid-cols-5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
              <span className="col-span-2">Study Session</span>
              <span className="text-center">Duration</span>
              <span className="text-center">Attempts Used</span>
              <span className="text-right">Final Status</span>
            </div>
            {sessions.map((session) => (
              <div key={session._id} className="glass-panel p-6 lg:px-8 grid grid-cols-5 items-center border-white/5 group hover:bg-white/[0.03] transition-all">
                <div className="flex items-center gap-4 col-span-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    session.isLocked ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-500'
                  }`}>
                    {session.isLocked ? <ShieldAlert className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-syne">{session.schedule?.subject || 'Ind. Session'}</h3>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                      User: {session.user?.name || 'Unknown'} &bull; {new Date(session.startTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-white/60 text-center">{formatDuration(session.duration)}</span>
                <div className="flex items-center justify-center gap-1.5">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full ${i < session.warnings ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-white/10'}`} 
                    />
                  ))}
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    session.isLocked ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                    session.isActive ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                    'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    {session.isLocked ? 'Locked' : session.isActive ? 'Active' : 'Completed'}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
