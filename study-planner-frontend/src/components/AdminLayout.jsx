import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Users, 
  Activity, 
  LogOut, 
  BarChart3,
  Menu,
  X,
  Settings,
  Bell
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSidebarLink = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300
      ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}
    `}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[13px] font-black uppercase tracking-widest">{children}</span>
  </NavLink>
);

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white selection:bg-indigo-500 selection:text-white">
      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 w-[280px] h-screen bg-black/40 backdrop-blur-3xl border-r border-white/5 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-600/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter uppercase font-syne">Command</h2>
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">Administrator</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <AdminSidebarLink to="/admin/dashboard" icon={BarChart3}>Overview</AdminSidebarLink>
            <AdminSidebarLink to="/admin/users" icon={Users}>User Base</AdminSidebarLink>
            <AdminSidebarLink to="/admin/sessions" icon={Activity}>Active Logs</AdminSidebarLink>
            <AdminSidebarLink to="/admin/settings" icon={Settings}>System</AdminSidebarLink>
          </nav>

          <div className="mt-auto pt-8 border-t border-white/5">
            <div className="flex items-center gap-4 px-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-tight">Root Admin</p>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">v1.0.42</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 px-6 py-4 w-full rounded-2xl text-red-500/60 hover:bg-red-500/10 hover:text-red-500 transition-all text-[11px] font-black uppercase tracking-widest"
            >
              <LogOut className="w-4 h-4" />
              <span>Shutdown</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-white/40"><Menu /></button>
            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">Nexus OS</h1>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-white/20 hover:text-white transition-colors"><Bell className="w-5 h-5" /></button>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">System Online</span>
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
