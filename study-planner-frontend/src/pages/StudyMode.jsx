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
  ShieldCheck,
  Play,
  Zap,
  FileText,
  CheckCircle2,
  HelpCircle
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
  const [isStarted, setIsStarted] = useState(false);
  const [activeView, setActiveView] = useState('pdf');
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const timerRef = useRef(null);
  const statusPollRef = useRef(null);
  const lastWarningTime = useRef(0);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.get(`/session/start/${id}`);
        setSession(res.data);

        const [startH, startM] = res.data.startTime.split(':').map(Number);
        const [endH, endM] = res.data.endTime.split(':').map(Number);

        let durationSeconds = (endH * 3600 + endM * 60) - (startH * 3600 + startM * 60);
        if (durationSeconds < 0) durationSeconds += 24 * 3600;

        setTimeLeft(durationSeconds);
      } catch (err) {
        console.error('Failed to fetch session info', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();

    return () => {
      clearInterval(timerRef.current);
      clearInterval(statusPollRef.current);
    };
  }, [id, navigate]);

  const handleStartSession = () => {
    setIsStarted(true);
    startPolling(session.sessionId);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
    const triggerWarning = async () => {
      const now = Date.now();
      if (now - lastWarningTime.current < 2000) return;
      lastWarningTime.current = now;

      if (!isStarted || !session?.sessionId || status?.isLocked) return;
      
      try {
        const res = await api.post(`/session/warn/${session.sessionId}`);

        setStatus((prev) => ({
          ...prev,
          warnings: res.data.warnings,
          isLocked: res.data.isLocked,
        }));

        setShowWarningToast(true);

        setTimeout(() => {
          setShowWarningToast(false);
        }, 4000);

      } catch (err) {
        console.error("Warning API error:", err);
      }
    };


      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') triggerWarning();
      };
      const handleBlur = () => triggerWarning();

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleBlur);
      window.addEventListener('pagehide', handleBlur);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleBlur);
        window.removeEventListener('pagehide', handleBlur);
      };
    }, [session, status, isStarted]);

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
    if (seconds === null) return '--:--';
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-sm font-medium text-white/40 uppercase tracking-widest">Warping to Focus Chamber...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--bg-primary)] text-white overflow-hidden selection:bg-indigo-500/30">
      {/* Immersive Header */}
      <header className="h-16 lg:h-20 border-b border-white/5 flex items-center justify-between px-4 lg:px-6 z-20 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-2 lg:gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <h2 className="font-bold text-[10px] lg:text-sm text-white tracking-tight font-syne uppercase truncate max-w-[100px] lg:max-w-none">
            {session.subject}
          </h2>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          {isStarted && (
            <div className="flex items-center gap-1.5 lg:gap-2 text-amber-400 bg-amber-400/10 px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg border border-amber-400/20">
              <AlertTriangle className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
              <span className="text-[9px] lg:text-[11px] font-bold uppercase tracking-wider">W: {status?.warnings || 0}/3</span>
            </div>
          )}
          <button
            onClick={toggleFullscreen}
            className="hidden lg:block p-2 hover:bg-white/5 rounded-xl text-white/40 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowEndConfirm(true)}
            className="premium-button px-3 lg:px-6 py-2 h-8 lg:h-10 text-[9px] lg:text-xs shadow-none whitespace-nowrap"
          >
            End Session
          </button>
        </div>
      </header>

      {/* Mobile Toggle Bar */}
      <div className="lg:hidden flex border-b border-white/5 bg-black/40">
        <button
          onClick={() => setActiveView('pdf')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${activeView === 'pdf' ? 'text-white bg-white/5' : 'text-white/20'}`}
        >
          <FileText className="w-3.5 h-3.5" />
          Material
        </button>
        <button
          onClick={() => setActiveView('timer')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${activeView === 'timer' ? 'text-white bg-white/5' : 'text-white/20'}`}
        >
          <Clock className="w-3.5 h-3.5" />
          Focus
        </button>
      </div>

      {/* Main Study Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className={`
          flex-[3] border-r border-white/5 bg-black/20 overflow-hidden
          ${activeView === 'pdf' ? 'flex' : 'hidden lg:flex'}
        `}>
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

        <div className={`
          flex-[1.5] flex flex-col items-center justify-center p-6 lg:p-12 bg-black/40 relative overflow-hidden
          ${activeView === 'timer' ? 'flex' : 'hidden lg:flex'}
        `}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] lg:w-[400px] h-[300px] lg:h-[400px] bg-indigo-500/10 blur-[120px] rounded-full -z-1" />

          <div className="text-center w-full max-w-sm relative z-10">
            <p className="text-[8px] lg:text-[10px] font-black text-white/20 mb-4 lg:mb-8 tracking-[0.4em] uppercase">
              {isStarted ? 'Time Remaining' : 'Ready to Start'}
            </p>

            <div className="mb-8 lg:mb-12">
              <h1 className="text-6xl lg:text-8xl font-mono font-medium tracking-tight text-white select-none gradient-text" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {formatTime(timeLeft)}
              </h1>
              <p className="text-[9px] lg:text-[11px] font-bold text-white/20 mt-2 lg:mt-4 uppercase tracking-[0.2em]">
                Duration: {formatTime(timeLeft)}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!isStarted ? (
                <motion.button
                  key="start-btn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  onClick={handleStartSession}
                  className="w-full h-16 lg:h-20 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl lg:rounded-3xl flex items-center justify-center gap-4 group transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)]"
                >
                  <Play className="w-5 h-5 lg:w-6 lg:h-6 fill-white" />
                  <span className="text-sm lg:text-lg font-black uppercase tracking-widest">Start Focus</span>
                </motion.button>
              ) : (
                <motion.div
                  key="active-state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 lg:space-y-8"
                >
                  <div className="glass-panel p-6 lg:p-8 border-white/5 bg-white/[0.02]">
                    <p className="text-white/60 text-[12px] lg:text-sm leading-relaxed italic">
                      "The successful warrior is the average man, with laser-like focus."
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[8px] lg:text-[9px] uppercase tracking-[0.2em] font-black text-white/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Shield Active</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showEndConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
              onClick={() => setShowEndConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-panel w-full max-w-sm p-8 lg:p-10 text-center relative z-10 border-white/10"
            >
              <div className="w-14 lg:w-16 h-14 lg:h-16 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                <HelpCircle className="w-7 lg:w-8 h-7 lg:h-8" />
              </div>
              <h2 className="text-xl lg:text-2xl font-black text-white mb-4 font-syne uppercase">End Session?</h2>
              <p className="text-white/40 text-[12px] lg:text-sm leading-relaxed mb-10">
                Are you sure you want to complete your session now? Your progress will be archived.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleEndSession}
                  className="premium-button w-full h-14 bg-white text-black"
                >
                  Yes, Complete
                </button>
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  No, Continue Studying
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              className="glass-panel w-full max-w-md p-8 lg:p-12 text-center shadow-[0_0_100px_rgba(239,68,68,0.1)] border-red-500/20"
            >
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 lg:mb-8 border border-red-500/20">
                <Lock className="w-6 h-6 lg:w-8 lg:h-8" />
              </div>
              <h2 className="text-xl lg:text-2xl font-black text-white mb-4 font-syne uppercase">Locked</h2>
              <p className="text-white/40 text-[12px] lg:text-sm leading-relaxed mb-8 lg:mb-10">
                Session locked due to distractions.
              </p>
              <button
                onClick={() => navigate('/')}
                className="premium-button w-full h-12 lg:h-14 bg-white text-black shadow-none"
              >
                Return
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyMode;
