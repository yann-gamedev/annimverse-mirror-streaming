import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/client';
import PasswordInput from '../components/ui/PasswordInput';
import Toast from '../components/ui/Toast';
import { Save, User, Mail, Lock } from 'lucide-react';

const Settings = () => {
  const { user, login } = useAuth();
  
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updates = { username, email };
      if (newPassword) {
        updates.currentPassword = password;
        updates.newPassword = newPassword;
      }
      
      const res = await userAPI.updateProfile(user.id, updates);
      login(res.data.user, localStorage.getItem('token')); // Update context
      
      setToast({ show: true, message: 'Profile updated successfully!', type: 'success' });
      setPassword('');
      setNewPassword('');
    } catch (error) {
      setToast({ show: true, message: error.response?.data?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your profile details and security preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0f0f11] rounded-xl border border-white/5 p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <User className="w-5 h-5 text-[#8b5cf6]" /> Profile Information
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-[#8b5cf6] focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-[#8b5cf6] focus:outline-none transition-colors"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <Lock className="w-5 h-5 text-[#06b6d4]" /> Change Password
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
            <PasswordInput 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
            <PasswordInput 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New secure password"
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Changes
          </button>
        </div>
      </form>

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}
    </div>
  );
};

export default Settings;
