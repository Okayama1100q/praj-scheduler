import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  History, 
  LogOut, 
  BookOpen, 
  Menu,
  X,
  User,
  ChevronRight,
  ShieldCheck,
  UserCircle,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarLink = ({ to, icon: Icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `
      nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive group'}
    `}
  >
    {({ isActive }) => (
      <>
        <div className="flex items-center gap-4">
          <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'group-hover:text-red-400'}`} />
          <span className="text-[13px] font-black uppercase tracking-[0.15em]">{children}</span>
        </div>
        <ChevronRight className={`w-3 h-3 ${isActive ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-100'} transition-all`} />
      </>
    )}
  </NavLink>
);

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isStudyMode = location.pathname.startsWith('/study/');
  const isAdmin = user?.role === 'admin';

  if (isStudyMode) return <>{children}</>;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-[var(--bg-primary)]">
      {/* Mesh Background */}
      <div className="mesh-container">
        <div className="mesh-blob mesh-blob-1" />
        <div className="mesh-blob mesh-blob-2" />
        <div className="mesh-blob mesh-blob-3" />
      </div>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-black/40 backdrop-blur-xl border-b border-white/5 flex items-center px-8 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-white"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="flex-1 text-center font-black text-xl tracking-tighter uppercase font-syne text-white">Praj</div>
        <button 
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white"
        >
          <UserCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-40 w-[260px] h-screen bg-black/20 backdrop-blur-3xl border-r border-white/5 transition-transform duration-500 ease-[0.16, 1, 0.3, 1]

        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full pt-32 lg:pt-12 pb-12 px-8">

          <div className="flex items-center gap-4 mb-16 px-2">
            <div className="w-10 h-10 rounded-2xl bg-[#E81C23] flex items-center justify-center shadow-2xl shadow-[#E81C23]/25">
              <Zap className="w-5 h-5 text-white animate-pulse" strokeWidth={3} />
            </div>
            <h2 className="text-xl font-black tracking-tighter text-white font-syne uppercase leading-none">
              Praj<br />
              <span className="text-[#E81C23]">Scheduler</span>
            </h2>
          </div>

          <nav className="flex-1 space-y-3">
            <SidebarLink to="/" icon={LayoutDashboard} onClick={() => setIsOpen(false)}>Grid</SidebarLink>
            <SidebarLink to="/history" icon={History} onClick={() => setIsOpen(false)}>Archives</SidebarLink>
          </nav>

          {/* Animated F1 Sidebar Widget */}
          <div className="hidden lg:flex flex-col items-center justify-center my-6 p-4 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E81C23] to-transparent opacity-40" />
            
            <p className="text-[7px] font-bold text-[#E81C23] tracking-[0.25em] uppercase mb-3 font-mono">
              F1 telemetry status
            </p>
            
            {/* Racetrack curve */}
            <div className="w-full h-10 relative bg-black/40 rounded-xl overflow-hidden flex items-center border border-white/5">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-[repeating-linear-gradient(90deg,#e81c23,#e81c23_5px,#fff_5px,#fff_10px)] opacity-20" />
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[repeating-linear-gradient(90deg,#e81c23,#e81c23_5px,#fff_5px,#fff_10px)] opacity-20" />
              
              {/* Drifting grid backdrop */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px)] bg-[size:10px_10px]" />
              
              {/* Zooming Mini F1 Car */}
              <div className="absolute w-full animate-[f1-sidebar-zoom_6s_linear_infinite]">
                <svg className="w-8 h-6" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle className="f1-wheel" cx="25" cy="28" r="9" fill="#111" stroke="#E81C23" strokeWidth="2" style={{ transformOrigin: '25px 28px' }} />
                  <circle cx="25" cy="28" r="4" fill="#FFF" />
                  <path d="M5 8H12V14H5V8Z" fill="#E81C23" />
                  <path d="M10 8L7 28H11L14 8H10Z" fill="#FFF" />
                  <path d="M12 28C24 28 32 20 46 20C60 20 75 25 100 25C106 25 110 22 113 28H12Z" fill="#E81C23" />
                  <circle cx="49" cy="16" r="3" fill="#FFF" />
                  <circle className="f1-wheel" cx="95" cy="28" r="8" fill="#111" stroke="#E81C23" strokeWidth="2" style={{ transformOrigin: '95px 28px' }} />
                  <circle cx="95" cy="28" r="3.5" fill="#FFF" />
                  <path d="M1 28L8 26L6 29L1 28Z" fill="#FF9500" />
                </svg>
              </div>
            </div>
            
            <span className="text-[6px] font-mono text-white/30 uppercase mt-2">V8 ACTIVE</span>
          </div>

          <div className="mt-auto pt-10 border-t border-white/5">
            <NavLink
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 px-3 mb-8 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-white/10 transition-all">
                <User className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[13px] font-black text-white truncate uppercase tracking-tight">{user?.username || 'User'}</p>
                <p className="text-[10px] font-bold text-white/40 truncate tracking-wider uppercase">{user?.email}</p>
              </div>
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 text-[11px] font-black uppercase tracking-[0.2em]"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 bg-transparent">
        <div className="max-w-7xl mx-auto p-4 lg:p-8 mt-24 lg:mt-0">


          <AnimatePresence mode="wait">
            <motion.div
              key={location.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Overlay for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
