import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { Clock, Calendar, CheckCircle, Loader2, BookOpen, BarChart3, TrendingUp, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

const History = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/session/history');
        setSessions(res.data);
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h > 0 ? h + 'h ' : ''}${m}m`;
  };

  const analysis = useMemo(() => {
    const stats = {};
    let totalTime = 0;
    
    sessions.forEach(s => {
      const subject = s.schedule?.subject || 'Independent';
      const duration = s.duration || 0;
      stats[subject] = (stats[subject] || 0) + duration;
      totalTime += duration;
    });

    const bySubject = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    const maxTime = Math.max(...bySubject.map(s => s[1]), 1);

    return {
      bySubject,
      totalTime,
      maxTime
    };
  }, [sessions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-0">
      <div className="mb-12">
        <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 tracking-tighter font-syne uppercase gradient-text">Archives</h1>
        <p className="text-white/40 font-medium text-lg">Your legacy of deep work.</p>
      </div>

      {sessions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Summary Card */}
          <div className="glass-panel p-8 border-indigo-500/20 bg-indigo-500/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Total Focus</p>
            </div>
            <h3 className="text-4xl font-black text-white font-syne">{formatDuration(analysis.totalTime)}</h3>
            <p className="text-[10px] font-bold text-white/20 mt-4 uppercase tracking-widest">Cumulative across all sessions</p>
          </div>
          
          {/* Detailed Graph Card */}
          <div className="lg:col-span-2 glass-panel p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Subject Intensity</p>
              </div>
              <PieChart className="w-5 h-5 text-white/10" />
            </div>

            <div className="space-y-6">
              {analysis.bySubject.map(([subject, time]) => (
                <div key={subject} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">{subject}</span>
                    <span className="text-xs font-black text-white">{formatDuration(time)}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(time / analysis.maxTime) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="glass-panel p-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-white/20 mb-8">
            <BookOpen className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Empty Archives</h2>
          <p className="text-white/40 max-w-sm">You haven't completed any sessions yet. Start your first session to see it here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 ml-4">Detailed Logs</h2>
          {sessions.map((session, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={session._id}
              className="glass-panel p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 group hover:bg-white/10 transition-all border-white/5"
            >
              <div className="flex items-center gap-6 lg:gap-8">
                <div className="w-12 lg:w-14 h-12 lg:h-14 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 border border-white/10 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-6 lg:w-7 h-6 lg:h-7" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-lg lg:text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors font-syne truncate">
                    {session.schedule?.subject || 'Independent Session'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-white/40">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {formatDate(session.startTime)}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatDuration(session.duration)} spent</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-none border-white/5 pt-4 lg:pt-0">
                <div className="text-left lg:text-right">
                  <p className="text-[9px] lg:text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Warnings</p>
                  <div className="flex gap-1 justify-start lg:justify-end">
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full ${i < session.warnings ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-white/10'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
