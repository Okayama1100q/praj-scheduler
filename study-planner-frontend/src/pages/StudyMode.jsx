import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  X, 
  AlertTriangle, 
  Lock, 
  ArrowLeft,
  Loader2,
  Maximize2,
  Minimize2,
  BookOpen,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudyMode = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarningToast, setShowWarningToast] = useState(false);
  
  const timerRef = useRef(null);
  const statusPollRef = useRef(null);

  useEffect(() => {
    const startSession = async () => {
      try {
        const res = await api.get(`/session/start/${id}`);
        setSession(res.data);
        startPolling(res.data.sessionId);
        
        // Calculate initial time left
        updateTimer(res.data.endTime);
        
        timerRef.current = setInterval(() => {
          updateTimer(res.data.endTime);
        }, 1000);
      } catch (err) {
        console.error('Failed to start session', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    startSession();

    return () => {
      clearInterval(timerRef.current);
      clearInterval(statusPollRef.current);
    };
  }, [id, navigate]);

  const updateTimer = (endTimeStr) => {
    if (!endTimeStr) return;
    
    const now = new Date();
    const [hours, minutes] = endTimeStr.split(':').map(Number);
    const end = new Date();
    end.setHours(hours, minutes, 0, 0);
    
    // If end time is earlier than now, it might be for the next day?
    // But usually sessions are within the same day.
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) {
      setTimeLeft(0);
      clearInterval(timerRef.current);
      // Optional: Auto-end session when time is up
    } else {
      setTimeLeft(Math.floor(diff / 1000));
    }
  };

  const startPolling = (sessionId) => {
    statusPollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/session/status/${sessionId}`);
        setStatus(res.data);
        if (res.data.isLocked) {
          clearInterval(timerRef.current);
        }
      } catch (err) {
        console.error('Status poll failed', err);
      }
    }, 3000);
  };

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden' && session?.sessionId && !status?.isLocked) {
        try {
          const res = await api.post(`/session/warn/${session.sessionId}`);
          setStatus(prev => ({ ...prev, warnings: res.data.warnings, isLocked: res.data.locked }));
          setShowWarningToast(true);
          setTimeout(() => setShowWarningToast(false), 4000);
        } catch (err) {
          console.error('Failed to send warning', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session, status]);

  const handleEndSession = async () => {
    if (!session?.sessionId) return;
    try {
      await api.post(`/session/end/${session.sessionId}`);
      navigate('/');
    } catch (err) {
      console.error('Failed to end session', err);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="w-8 h-8 animate-spin text-white mb-4" />
        <p className="text-sm font-medium text-white/40">Initializing focus chamber...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--bg-primary)] text-white overflow-hidden selection:bg-indigo-500/30">
      {/* Immersive Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 z-20 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <h2 className="font-bold text-sm text-white tracking-tight font-syne uppercase">{session.subject}</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Warnings: {status?.warnings || 0}/3</span>
          </div>
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/5 rounded-xl text-white/40 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleEndSession}
            className="premium-button px-6 py-2 h-10 text-xs shadow-none"
          >
            End Session
          </button>
        </div>
      </header>

      {/* Main Study Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: PDF Viewer */}
        <div className="flex-[3] border-r border-white/5 bg-black/20">
          {session.pdf ? (
            <iframe 
              src={session.pdf} 
              className="w-full h-full border-none invert brightness-90 contrast-110"
              title="Study Material"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center h-full text-white/10 flex-col gap-4">
              <BookOpen className="w-16 h-16 opacity-10" />
              <p className="text-sm font-medium">No material uploaded.</p>
            </div>
          )}
        </div>

        {/* Right: Focus Area */}
        <div className="flex-[1.5] flex flex-col items-center justify-center p-12 bg-black/40 relative">
          {/* Subtle Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full -z-1" />

          <div className="text-center w-full max-w-sm relative z-10">
            <p className="text-[10px] font-black text-white/20 mb-8 tracking-[0.4em] uppercase">
              Time Remaining
            </p>
            
            <div className="mb-12">
              <h1 className="text-8xl font-mono font-medium tracking-tight text-white select-none gradient-text" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {formatTime(timeLeft)}
              </h1>
              <p className="text-[11px] font-bold text-white/20 mt-4 uppercase tracking-[0.2em]">
                Ends at {session.endTime}
              </p>
            </div>
            
            <div className="glass-panel p-8 border-white/5 bg-white/[0.02]">
              <p className="text-white/60 text-sm leading-relaxed italic">
                "The successful warrior is the average man, with laser-like focus."
              </p>
            </div>

            <div className="mt-12 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.2em] font-black text-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Distraction Shield Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lock Screen Overlay */}
      <AnimatePresence>
        {status?.isLocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl px-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="glass-panel w-full max-w-md p-12 text-center shadow-[0_0_100px_rgba(239,68,68,0.1)] border-red-500/20"
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white mb-4 font-syne uppercase">Session Locked</h2>
              <p className="text-white/40 text-sm leading-relaxed mb-10">
                This study session was automatically locked due to distractions. Focus is essential for progress. Take a break and try again later.
              </p>
              <button 
                onClick={() => navigate('/')}
                className="premium-button w-full h-14 bg-white text-black shadow-none"
              >
                Return to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Toast */}
      <AnimatePresence>
        {showWarningToast && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-12 right-12 z-[110] flex items-center gap-4 px-6 py-4 glass-panel shadow-2xl rounded-2xl max-w-xs border-white/10"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white">Focus Warning</p>
              <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">Tab switch detected. Your session will lock after 3 warnings.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyMode;
