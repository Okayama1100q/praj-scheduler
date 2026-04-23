import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Mail, Shield, Lock, Trash2, Loader2, Save, LogOut, Bell } from 'lucide-react';

import { motion } from 'framer-motion';

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', content: '' });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setMsg({ type: 'error', content: 'Passwords do not match' });
    }
    
    setLoading(true);
    setMsg({ type: '', content: '' });
    
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setMsg({ type: 'success', content: 'Password updated successfully' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMsg({ type: 'error', content: err.response?.data?.msg || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSessions = async () => {
    if (!window.confirm('Are you sure you want to terminate all other sessions and restart?')) return;
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-16">
        <h1 className="text-6xl font-black text-white mb-4 tracking-tighter font-syne uppercase gradient-text">Profile</h1>
        <p className="text-white/40 font-medium text-lg">Manage your identity and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6 shadow-2xl">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white font-syne uppercase">{user?.name}</h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">@{user?.username}</p>
            
            <div className="w-full mt-10 pt-10 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-bold text-white truncate">{user?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Account Role</p>
                  <p className="text-sm font-bold text-white uppercase">{user?.role || 'User'}</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleTerminateSessions}
            className="w-full p-6 glass-panel flex items-center justify-between group hover:bg-red-500/10 transition-all border-red-500/10"
          >
            <div className="flex items-center gap-4">
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="text-sm font-black text-red-500 uppercase tracking-widest">Terminate Sessions</span>
            </div>
            <Trash2 className="w-4 h-4 text-red-500/40 group-hover:text-red-500" />
          </button>

          <button 
            onClick={() => {
              import('../services/notificationService').then(n => {
                n.requestNotificationPermission().then(granted => {
                  if (granted) n.sendNotification('Test Notification', 'It works! Reminders are active.');
                });
              });
            }}
            className="w-full p-6 glass-panel flex items-center justify-between group hover:bg-indigo-500/10 transition-all border-indigo-500/10 mt-4"
          >
            <div className="flex items-center gap-4">
              <Bell className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-black text-indigo-400 uppercase tracking-widest">Test Notifications</span>
            </div>
          </button>
        </div>


        {/* Settings Card */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-10 h-full">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-white font-syne uppercase">Security Settings</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6">
              {msg.content && (
                <div className={`p-4 rounded-2xl border text-[13px] font-bold ${
                  msg.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {msg.content}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Current Password</label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">New Password</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Confirm New</label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="premium-button w-full h-16 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
