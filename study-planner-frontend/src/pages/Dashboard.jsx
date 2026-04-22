import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Play, Clock, Calendar, BookOpen, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ScheduleCard = ({ schedule, onStart }) => (
  <motion.div 
    whileHover={{ y: -6, transition: { duration: 0.3 } }}
    className="glass-card p-8 rounded-[2rem] hover:shadow-xl hover:shadow-indigo-100/50 transition-all group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <BookOpen className="w-24 h-24 -mr-8 -mt-8" />
    </div>

    <div className="flex justify-between items-start mb-8 relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-lg shadow-gray-200 group-hover:bg-indigo-600 transition-colors">
        <BookOpen className="w-7 h-7" />
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 border border-white/80">
        <Clock className="w-4 h-4 text-indigo-500" />
        <span className="text-[13px] font-bold text-gray-700 font-satoshi uppercase tracking-wider">{schedule.startTime} - {schedule.endTime}</span>
      </div>
    </div>

    <h3 className="text-2xl font-satoshi font-bold text-gray-900 mb-2 relative z-10">{schedule.subject}</h3>
    <div className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-8 relative z-10">
      <Calendar className="w-4 h-4" />
      <span>{schedule.day}</span>
    </div>

    <button
      onClick={() => onStart(schedule._id)}
      className="w-full py-4 rounded-2xl bg-white text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-all transform active:scale-95 flex items-center justify-center gap-2 border border-gray-100 relative z-10 shadow-sm"
    >
      <Play className="w-4 h-4 fill-current" />
      <span>Start Session</span>
    </button>
  </motion.div>
);

const Dashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await api.get('/schedule');
        setSchedules(res.data);
      } catch (err) {
        console.error('Failed to fetch schedules', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const handleStartStudy = (id) => {
    navigate(`/study/${id}`);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Dashboard</h1>
        <p className="text-gray-500">Pick a subject and start your focus session.</p>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-20 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No study schedules found.</p>
          <p className="text-sm text-gray-400">Add some schedules from the admin panel to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((schedule) => (
            <ScheduleCard 
              key={schedule._id} 
              schedule={schedule} 
              onStart={handleStartStudy} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
