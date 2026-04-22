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
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Background from '../components/Background';

const StudyMode = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarningToast, setShowWarningToast] = useState(false);
  
  const timerRef = useRef(null);
  const statusPollRef = useRef(null);

  // 1. Initialize Session
  useEffect(() => {
    const startSession = async () => {
      try {
        const res = await api.get(`/session/start/${id}`);
        setSession(res.data);
        
        // Start status polling
        startPolling(res.data.sessionId);
        
        // Start local timer (count up)
        timerRef.current = setInterval(() => {
          setTime(prev => prev + 1);
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

  // 2. Status Polling
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

  // 3. Tab Switch Detection
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden' && session?.sessionId && !status?.isLocked) {
        try {
          const res = await api.post(`/session/warn/${session.sessionId}`);
          setStatus(prev => ({ ...prev, warnings: res.data.warnings, isLocked: res.data.locked }));
          setShowWarningToast(true);
          setTimeout(() => setShowWarningToast(false), 3000);
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
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <Background />
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 relative z-10" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden selection:bg-indigo-100">
      <Background />
      
      {/* Immersive Header */}
      <header className="h-20 border-b border-white/40 flex items-center justify-between px-8 z-20 relative bg-white/20 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')}
            className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-8 w-[1px] bg-gray-200"></div>
          <h2 className="font-satoshi font-bold text-xl text-gray-900">{session.subject}</h2>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50/50 px-4 py-2 rounded-2xl border border-amber-100/50 shadow-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-bold font-satoshi">Session Warnings: {status?.warnings || 0}/3</span>
          </div>
          <button 
            onClick={toggleFullscreen}
            className="p-3 hover:bg-white rounded-2xl text-gray-400 transition-all shadow-sm"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button 
            onClick={handleEndSession}
            className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-[15px] font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200"
          >
            End session
          </button>
        </div>
      </header>

      {/* Main Study Area */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left: PDF Viewer */}
        <div className="flex-[3] border-r border-white/40 bg-white/10 flex flex-col">
          {session.pdf ? (
            <iframe 
              src={session.pdf} 
              className="w-full h-full border-none shadow-inner"
              title="Study Material"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-300 flex-col gap-6">
              <BookOpen className="w-24 h-24 opacity-10" />
              <p className="font-satoshi font-medium">No study material provided.</p>
            </div>
          )}
        </div>

        {/* Right: Focus Area */}
        <div className="flex-[1.4] flex flex-col items-center justify-center p-12 relative overflow-hidden">
          <div className="text-center relative z-10 w-full max-w-md">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-bold text-indigo-500 mb-6 tracking-[0.2em] uppercase font-satoshi"
            >
              Current Focus Time
            </motion.p>
            
            <div className="mb-12 relative">
              <h1 className="text-9xl font-mono font-bold tracking-tighter text-gray-900 animate-subtle-pulse select-none">
                {formatTime(time)}
              </h1>
            </div>
            
            <div className="space-y-6">
              <div className="p-8 glass-panel rounded-[2.5rem] border-white text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/20"></div>
                <p className="text-gray-600 text-lg leading-relaxed font-satoshi font-medium italic">
                  "Deep work is the superpower of the 21st century."
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 font-satoshi mt-12 bg-white/40 px-4 py-2 rounded-full border border-white/60">
                <Lock className="w-3 h-3" />
                <span>Security Active</span>
              </div>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-2xl px-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-md bg-white border border-gray-200 p-10 rounded-[2rem] shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Lock className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Session Locked</h2>
              <p className="text-gray-500 leading-relaxed mb-10">
                This study session was automatically locked due to multiple distractions. Focus is progress—take a short break and try again later.
              </p>
              <button 
                onClick={() => navigate('/')}
                className="w-full py-4 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
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
            initial={{ y: -100, x: '-50%', opacity: 0 }}
            animate={{ y: 24, x: '-50%', opacity: 1 }}
            exit={{ y: -100, x: '-50%', opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 shadow-xl rounded-full"
          >
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="pr-2">
              <p className="text-sm font-bold text-gray-900">Distraction Detected</p>
              <p className="text-xs text-gray-500">Please stay focused on your study material.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyMode;
