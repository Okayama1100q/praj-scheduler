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
  XCircle,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { requestNotificationPermission, sendNotification } from '../services/notificationService';

const CompactScheduleCard = ({ schedule, isCompleted, isMissed, onStart, onDelete }) => (
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
        <div className="flex items-center gap-1 z-10">
          {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-emerald-500" />}
          {isMissed && <XCircle className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-red-500" />}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(schedule._id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-500/20 rounded text-white/20 hover:text-red-400 ml-1"
            title="Delete Plan"
          >
            <Trash2 className="w-2.5 h-2.5 lg:w-3 h-3" />
          </button>
        </div>
      </div>
      <h4 className={`text-[9px] lg:text-[12px] font-bold leading-tight font-syne transition-colors truncate pr-4 ${
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

const F1Background = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none opacity-40">
    
    {/* Animated grid background */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] animate-grid-drift" />
    
    {/* Moving Speed Stripes */}
    <div className="speed-stripe-red left-[10%] animate-[speed-line-red_5s_linear_infinite]" />
    <div className="speed-stripe-white left-[25%] animate-[speed-line-white_7s_linear_infinite_1.5s]" />
    <div className="speed-stripe-red left-[45%] animate-[speed-line-red_6s_linear_infinite_3s]" />
    <div className="speed-stripe-white left-[65%] animate-[speed-line-white_8s_linear_infinite_0.5s]" />
    <div className="speed-stripe-red left-[85%] animate-[speed-line-red_4s_linear_infinite_2s]" />

    {/* Racetrack curbs/lines at the bottom */}
    <div className="absolute bottom-10 left-0 w-full h-1 bg-[repeating-linear-gradient(45deg,#ff453a,#ff453a_10px,#fff_10px,#fff_20px)] shadow-[0_0_15px_#ff453a55]" />

    {/* Zooming F1 Car */}
    <div className="absolute bottom-[28px] left-0 w-full animate-f1-zoom">
      <svg className="w-[140px] h-[45px]" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Rear wing */}
        <path d="M5 8H12V14H5V8Z" fill="#FF453A" />
        <path d="M10 8L7 28H11L14 8H10Z" fill="#E5E5EA" />
        
        {/* Rear Wheel */}
        <g className="f1-wheel" style={{ transformOrigin: '25px 28px' }}>
          <circle cx="25" cy="28" r="9" fill="#151515" stroke="#FF453A" strokeWidth="2" />
          <circle cx="25" cy="28" r="4" fill="#CCCCCC" />
          <line x1="25" y1="19" x2="25" y2="37" stroke="#ffffff33" strokeWidth="1.5" />
          <line x1="16" y1="28" x2="34" y2="28" stroke="#ffffff33" strokeWidth="1.5" />
        </g>

        {/* Chassis Body */}
        <path d="M12 28C24 28 32 20 46 20C60 20 75 25 100 25C106 25 110 22 113 28H12Z" fill="#FF453A" />
        <path d="M42 20C45 13 52 13 56 20H42Z" fill="#111" />
        <circle cx="49" cy="16" r="3" fill="#FFF" /> {/* Helmet */}
        
        {/* Front nose / Wing */}
        <path d="M96 25L112 28H96V25Z" fill="#FF453A" />
        <path d="M108 28H118V30H108V28Z" fill="#CCCCCC" />

        {/* Front Wheel */}
        <g className="f1-wheel" style={{ transformOrigin: '95px 28px' }}>
          <circle cx="95" cy="28" r="8" fill="#151515" stroke="#FF453A" strokeWidth="2" />
          <circle cx="95" cy="28" r="3.5" fill="#CCCCCC" />
          <line x1="95" y1="20" x2="95" y2="36" stroke="#ffffff33" strokeWidth="1.5" />
          <line x1="87" y1="28" x2="103" y2="28" stroke="#ffffff33" strokeWidth="1.5" />
        </g>

        {/* Jet flame exhaust */}
        <path d="M1 28L8 26L6 29L1 28Z" fill="#FF9500" />
        <path d="M-5 28L4 27L2 29L-5 28Z" fill="#FF3B30" opacity="0.6" />
      </svg>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const times = ['12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'];

  const fetchData = async () => {
    try {
      const [schedulesRes, historyRes] = await Promise.all([
        api.get('/schedule'),
        api.get('/session/history')
      ]);
      setSchedules(schedulesRes.data);
      
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Reset on Sunday
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
    
    const dayValues = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };

    const scheduleDayVal = dayValues[schedule.day];
    const todayVal = now.getDay(); // 0-6 starting on Sunday

    if (scheduleDayVal < todayVal) return true; // Past day
    if (scheduleDayVal === todayVal) {
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

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule? This will also clear session history for it.")) return;
    try {
      await api.delete(`/schedule/${id}`);
      fetchData();
    } catch (err) {
      console.error("Failed to delete schedule", err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("WARNING: This will permanently DELETE all plans and all session history! Are you absolutely sure you want to start completely fresh?")) return;
    try {
      setLoading(true);
      await api.delete('/schedule/clear-all');
      await fetchData();
    } catch (err) {
      console.error("Failed to clear schedules", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="bg-racing-mesh min-h-screen text-white relative overflow-hidden font-syne">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-0 h-[calc(100vh-64px)] lg:h-[calc(100vh-100px)] flex flex-col relative z-10 lg:pb-12">
        <F1Background />
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 lg:mb-8 gap-4 flex-shrink-0 pt-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-[10px] lg:text-[11px] font-black text-[#FF453A] uppercase tracking-[0.3em] font-mono flex items-center gap-1.5 pt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF453A] animate-pulse" />
              Live Telemetry Grid
            </h2>
          </motion.div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button 
              onClick={handleClearAll}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 lg:px-5 h-10 lg:h-12 text-[9px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-xl lg:rounded-2xl border border-[#FF453A]/30 bg-[#FF453A]/10 text-[#FF453A] hover:bg-[#FF453A]/20 active:scale-[0.98] font-mono"
              title="Delete Everything"
            >
              <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#FF453A]" />
              <span>Delete Everything</span>
            </button>
            <button 
              onClick={() => openAddModal(selectedDay || 'Monday')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 lg:px-8 h-10 lg:h-12 text-[9px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-xl lg:rounded-2xl bg-white text-black hover:bg-neutral-200 active:scale-[0.98] font-mono shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>New Plan</span>
            </button>
          </div>
        </div>

      <div className="flex-1 min-h-0 relative pb-4 overflow-hidden">
        {/* Desktop-only Header */}
        <div className="hidden lg:grid grid-cols-7 gap-1 lg:gap-2 mb-2 lg:mb-4 pr-1 lg:pr-0 lg:pl-16">
          {days.map((day) => (
            <div key={day} className="text-center">
              <h3 className="text-[7px] lg:text-[10px] font-black text-white/20 uppercase tracking-[0.1em] lg:tracking-[0.2em] font-syne">
                {day.substring(0, 3)}
                <span className="hidden lg:inline">{day.substring(3)}</span>
              </h3>
            </div>
          ))}
        </div>

        {/* Mobile Nothing Phone (3a) Layout */}
        <div className="lg:hidden flex flex-col h-full min-h-0 gap-3">
          {/* Day Selector Pills Widget */}
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none snap-x">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`snap-center px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 ${
                  selectedDay === day 
                    ? 'bg-[#FF453A] text-white font-black shadow-[0_0_15px_rgba(255,69,58,0.4)] scale-[1.03]' 
                    : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white/60'
                }`}
              >
                {day.substring(0, 3)}
                {selectedDay === day && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF453A]" />
                )}
              </button>
            ))}
          </div>

          {/* Timeline List Widget */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-20">
            {schedules.filter(s => s.day === selectedDay).length === 0 ? (
              <div className="h-48 rounded-[2rem] border border-white/5 bg-white/[0.01] backdrop-blur-md flex flex-col items-center justify-center text-white/20 gap-3">
                <BookOpen className="w-8 h-8 opacity-20" />
                <p className="text-[10px] uppercase tracking-widest font-black font-mono">No Plans Scheduled</p>
                <button
                  onClick={() => openAddModal(selectedDay)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-white/60 uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                >
                  Create Plan
                </button>
              </div>
            ) : (
              schedules
                .filter(s => s.day === selectedDay)
                .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                .map((schedule) => {
                  const isCompleted = completedSessions.includes(schedule._id);
                  const isMissed = !isCompleted && isScheduleMissed(schedule);
                  return (
                    <motion.div 
                      key={schedule._id}
                      onClick={() => !isCompleted && !isMissed && handleStartStudy(schedule._id)}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-[2rem] border transition-all flex justify-between items-center relative overflow-hidden group ${
                        isCompleted 
                          ? 'bg-emerald-500/10 border-emerald-500/20' 
                          : isMissed
                            ? 'bg-red-500/10 border-red-500/20 opacity-60'
                            : 'bg-white/5 border-white/10 active:bg-white/10'
                      }`}
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold text-white/40 tracking-wider">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                          <span className={`w-1 h-1 rounded-full ${isCompleted ? 'bg-emerald-500' : isMissed ? 'bg-red-500' : 'bg-indigo-500'}`} />
                        </div>
                        <h4 className="text-xs lg:text-sm font-bold text-white font-syne truncate tracking-tight">{schedule.subject}</h4>
                      </div>
                      
                      <div className="flex items-center gap-2 z-10">
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {isMissed && <XCircle className="w-4 h-4 text-red-500" />}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSchedule(schedule._id);
                          }}
                          className="p-2 hover:bg-red-500/20 rounded-xl text-white/30 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
            )}

            {schedules.filter(s => s.day === selectedDay).length > 0 && (
              <button 
                onClick={() => openAddModal(selectedDay)}
                className="w-full py-4 rounded-[2rem] bg-white/5 border border-dashed border-white/10 flex items-center justify-center gap-2 text-white/40 hover:text-white hover:border-white/20 transition-all active:scale-[0.99]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Add Plan</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop-only Body Grid */}
        <div className="hidden lg:flex h-full min-h-0">
          <div className="hidden lg:block relative w-16 flex-shrink-0 h-full">
            {times.map((time) => {
              const [h, m] = time.split(':').map(Number);
              let adjustedH = h;
              if (h < 12) adjustedH += 24;
              const totalMins = (adjustedH * 60 + m) - (12 * 60);
              const percentage = (totalMins / 720) * 100;
              return (
                <div 
                  key={time} 
                  className="absolute text-[10px] font-black text-white/20 font-mono tracking-tighter text-right pr-4 w-full"
                  style={{ top: `${percentage}%`, transform: 'translateY(-50%)' }}
                >
                  {time}
                </div>
              );
            })}
          </div>

          <div className="flex-1 grid grid-cols-7 lg:grid-cols-7 gap-1 lg:gap-2 h-full min-h-0">
            {days.map((day) => {
              const daySchedules = schedules.filter(s => s.day === day).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
              
              const calculateTop = (timeStr) => {
                if (!timeStr) return 0;
                let [h, m] = timeStr.split(':').map(Number);
                if (h < 12) h += 24; // Progression past midnight
                const totalMins = (h * 60 + m) - (12 * 60);
                const percentage = (totalMins / 720) * 100;
                return Math.max(0, Math.min(percentage, 100));
              };

              return (
                <div key={day} className="relative h-full bg-white/[0.02] backdrop-blur-md rounded-xl lg:rounded-[2.5rem] border border-white/5 p-1 lg:p-3 group hover:bg-white/[0.05] transition-all overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(18)].map((_, i) => (
                      <div key={i} className="w-full h-[1px] bg-white/[0.02]" style={{ top: `${(i / 18) * 100}%` }} />
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
                            onDelete={handleDeleteSchedule}
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
    </div>
  );
};

export default Dashboard;
