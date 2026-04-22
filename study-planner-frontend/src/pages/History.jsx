import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Lock,
  Loader2,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

const HistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/session');
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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">History</h1>
        <p className="text-gray-500">Review your past study sessions and focus performance.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center">
          <History className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No session history yet.</p>
          <p className="text-sm text-gray-400">Your completed sessions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={session._id}
              className="glass-card p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${session.isLocked ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                  {session.isLocked ? <Lock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-satoshi font-bold text-gray-900">{session.schedule?.subject || 'Terminated Session'}</h3>
                  <div className="flex items-center gap-4 text-[13px] text-gray-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDate(session.createdAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {formatTime(session.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-amber-500 bg-amber-50/50 px-3 py-1.5 rounded-xl border border-amber-100">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-bold">{session.warnings} Warnings</span>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] ${session.isLocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {session.isLocked ? 'Locked' : 'Perfect'}
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

export default HistoryPage;
