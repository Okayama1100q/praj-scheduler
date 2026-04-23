import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Plus, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Loader2, 
  X, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { requestNotificationPermission, sendNotification } from '../services/notificationService';

const CompactScheduleCard = ({ schedule, isCompleted, isMissed, onStart }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className={`p-2 lg:p-3 rounded-lg lg:rounded-xl border shadow-2xl transition-all group relative cursor-pointer ${
      isCompleted 
        ? 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' 
        : isMissed
          ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20 opacity-60'
          : 'bg-white/5 border-white/5 hover:bg-white/10'
    }`}
    onClick={() => !isCompleted && !isMissed && onStart(schedule._id)}
  >
    <div className="flex flex-col gap-0.5 lg:gap-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <div className={`w-1 h-1 rounded-full ${isCompleted ? 'bg-emerald-500' : isMissed ? 'bg-red-500' : 'bg-indigo-500'}`} />
          <span className="text-[7px] lg:text-[9px] font-bold text-white/40 tracking-tight lg:tracking-widest font-mono">
            {schedule.startTime}
          </span>
        </div>
        {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-emerald-500" />}
        {isMissed && <XCircle className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-red-500" />}
      </div>
      <h4 className={`text-[9px] lg:text-[12px] font-bold leading-tight font-syne transition-colors truncate ${
        isCompleted 
          ? 'text-emerald-400' 
          : isMissed
            ? 'text-red-400'
            : 'text-white group-hover:text-indigo-400'
      }`}>
        {schedule.subject}
      </h4>
    </div>
  </motion.div>
);

const CreateScheduleModal = ({ isOpen, onClose, onSuccess, preselectedDay }) => {
  const [formData, setFormData] = useState({
    subject: '',
    day: preselectedDay || 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    pdf: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preselectedDay) setFormData(prev => ({ ...prev, day: preselectedDay }));
  }, [preselectedDay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('subject', formData.subject);
    data.append('day', formData.day);
    data.append('startTime', formData.startTime);
    data.append('endTime', formData.endTime);
    if (formData.pdf) data.append('pdf', formData.pdf);

    try {
      await api.post('/schedule/create', data);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-panel w-full max-w-lg p-8 lg:p-12 relative z-10 shadow-[0_0_100px_rgba(99,102,241,0.1)] border-white/10"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-white font-syne uppercase">New Architecture</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-6 h-6 text-white/40" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Calculus"
                  className="input-field"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Day</label>
                  <select 
                    className="input-field appearance-none cursor-pointer"
                    value={formData.day}
                    onChange={(e) => setFormData({...formData, day: e.target.value})}
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d} value={d} className="bg-zinc-900 text-white">{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Material (PDF)</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="input-field file:hidden text-[10px]"
                    onChange={(e) => setFormData({...formData, pdf: e.target.files[0]})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Start Time</label>
                  <input
                    type="time"
                    className="input-field cursor-pointer"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">End Time</label>
                  <input
                    type="time"
                    className="input-field cursor-pointer"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="premium-button w-full h-16 flex items-center justify-center gap-3 mt-4"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Create Session</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const times = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

  const fetchData = async () => {
    try {
      const [schedulesRes, historyRes] = await Promise.all([
        api.get('/schedule'),
        api.get('/session/history')
      ]);
      setSchedules(schedulesRes.data);
      
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1));
      startOfWeek.setHours(0, 0, 0, 0);

      const thisWeekSessions = historyRes.data.filter(s => {
        const sessionDate = new Date(s.startTime);
        return sessionDate >= startOfWeek && !s.isActive && !s.isLocked;
      });
      
      setCompletedSessions(thisWeekSessions.map(s => s.schedule?._id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    requestNotificationPermission();

    const interval = setInterval(() => {
      const now = new Date();
      const currentDay = days[now.getDay() === 0 ? 6 : now.getDay() - 1];
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      schedules.forEach(s => {
        if (s.day === currentDay && s.startTime === currentTime) {
          sendNotification(`Time to Study: ${s.subject}`, `Your ${s.subject} session is starting now!`);
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [schedules]);

  const isScheduleMissed = (schedule) => {
    const now = new Date();
    const currentDay = days[now.getDay() === 0 ? 6 : now.getDay() - 1];
    
    // Only check for current day and past days of the week
    const dayIndex = days.indexOf(schedule.day);
    const currentDayIndex = days.indexOf(currentDay);

    if (dayIndex < currentDayIndex) return true; // Past day
    if (dayIndex === currentDayIndex) {
      const [endH, endM] = schedule.endTime.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(endH, endM, 0, 0);
      return now > endTime; // Today but time passed
    }
    return false; // Future day
  };

  const openAddModal = (day) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleStartStudy = (id) => {
    navigate(`/study/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-2 lg:px-0 h-screen flex flex-col">
      <div className="flex flex-row justify-between items-end mb-6 lg:mb-8 gap-4 flex-shrink-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl lg:text-5xl font-black text-white mb-1 lg:mb-2 tracking-tighter font-syne uppercase gradient-text">Planner</h1>
          <p className="text-white/40 font-medium text-[10px] lg:text-sm uppercase tracking-widest">Week Architecture</p>
        </motion.div>
        <button 
          onClick={() => openAddModal('Monday')}
          className="premium-button flex items-center gap-2 lg:gap-3 px-4 lg:px-8 h-10 lg:h-12 text-[10px] lg:text-xs"
        >
          <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          <span>New Plan</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 relative pb-4 overflow-hidden">
        <div className="grid grid-cols-7 lg:grid-cols-8 gap-1 lg:gap-2 mb-2 lg:mb-4 pr-1 lg:pr-0 lg:pl-16">
          {days.map((day) => (
            <div key={day} className="text-center">
              <h3 className="text-[7px] lg:text-[10px] font-black text-white/20 uppercase tracking-[0.1em] lg:tracking-[0.2em] font-syne">
                {day.substring(0, 3)}
                <span className="hidden lg:inline">{day.substring(3)}</span>
              </h3>
            </div>
          ))}
        </div>

        <div className="flex h-full min-h-0">
          <div className="hidden lg:flex flex-col gap-[40px] pt-4 w-16 flex-shrink-0">
            {times.map((time) => (
              <div key={time} className="text-[10px] font-black text-white/20 font-mono tracking-tighter text-right pr-4">
                {time}
              </div>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-7 lg:grid-cols-7 gap-1 lg:gap-2 h-full min-h-0">
            {days.map((day) => {
              const daySchedules = schedules.filter(s => s.day === day).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
              
              const calculateTop = (timeStr) => {
                if (!timeStr) return 0;
                const [h, m] = timeStr.split(':').map(Number);
                const totalMins = (h * 60 + m) - (8 * 60);
                const percentage = (totalMins / 840) * 100;
                return Math.max(0, Math.min(percentage, 100));
              };

              return (
                <div key={day} className="relative h-full bg-white/[0.02] backdrop-blur-md rounded-xl lg:rounded-[2.5rem] border border-white/5 p-1 lg:p-3 group hover:bg-white/[0.05] transition-all overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(14)].map((_, i) => (
                      <div key={i} className="w-full h-[1px] bg-white/[0.02]" style={{ top: `${(i / 14) * 100}%` }} />
                    ))}
                  </div>

                  <div className="relative h-full">
                    {daySchedules.map((schedule) => {
                      const isCompleted = completedSessions.includes(schedule._id);
                      const isMissed = !isCompleted && isScheduleMissed(schedule);
                      
                      return (
                        <div 
                          key={schedule._id} 
                          className="absolute w-full left-0 transition-all px-0.5"
                          style={{ top: `${calculateTop(schedule.startTime)}%` }}
                        >
                          <CompactScheduleCard 
                            schedule={schedule} 
                            isCompleted={isCompleted}
                            isMissed={isMissed}
                            onStart={handleStartStudy} 
                          />
                        </div>
                      );
                    })}
                    
                    {daySchedules.length === 0 && (
                      <div className="h-full flex items-center justify-center">
                        <button 
                          onClick={() => openAddModal(day)}
                          className="w-8 h-8 lg:w-12 lg:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:border-white/40 transition-all lg:opacity-0 lg:group-hover:opacity-100 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {daySchedules.length > 0 && (
                    <button 
                      onClick={() => openAddModal(day)}
                      className="absolute bottom-2 lg:bottom-6 left-1/2 -translate-x-1/2 w-6 h-6 lg:w-10 lg:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:border-white/40 transition-all lg:opacity-0 lg:group-hover:opacity-100 shadow-sm z-10"
                    >
                      <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CreateScheduleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData}
        preselectedDay={selectedDay}
      />
    </div>
  );
};

export default Dashboard;
