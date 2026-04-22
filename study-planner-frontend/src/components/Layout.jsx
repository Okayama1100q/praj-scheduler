import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  History, 
  LogOut, 
  BookOpen, 
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Background from './Background';

const SidebarLink = ({ to, icon: Icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300
      ${isActive 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-semibold' 
        : 'text-gray-500 hover:bg-white hover:text-gray-900'}
    `}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[15px] font-satoshi">{children}</span>
  </NavLink>
);

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Don't show sidebar in Study Mode (Full Immersion)
  const isStudyMode = location.pathname.startsWith('/study/');

  if (isStudyMode) return <>{children}</>;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-[#fafafa]">
      <Background />

      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 p-3 glass-card rounded-2xl text-gray-600 border-white/50"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 h-screen transition-transform duration-500 ease-[0.16, 1, 0.3, 1] transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center gap-4 mb-14 px-2">
            <div className="w-10 h-10 rounded-[14px] bg-gray-900 flex items-center justify-center shadow-lg shadow-gray-200">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-satoshi font-bold tracking-tight text-gray-900">Praj-Scheduler</h2>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarLink to="/" icon={LayoutDashboard}>Dashboard</SidebarLink>
            <SidebarLink to="/history" icon={History}>History</SidebarLink>
          </nav>

          <div className="mt-auto pt-8 border-t border-white/40">
            <div className="px-4 mb-6">
              <p className="text-[15px] font-satoshi font-bold text-gray-900 truncate">{user?.name || 'Student'}</p>
              <p className="text-[13px] font-medium text-gray-400 truncate mt-0.5">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[15px] font-satoshi">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <div className="p-6 lg:p-12 h-screen overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/5 backdrop-blur-md z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
