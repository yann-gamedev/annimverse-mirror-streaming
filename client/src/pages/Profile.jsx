import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, interactAPI } from '../api/client';
import { Camera, Settings, LogOut, Clock, Star, PlayCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout, login } = useAuth(); // assuming login updates user context
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState(user);
  const [history, setHistory] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      try {
        const [profileRes, historyRes] = await Promise.all([
          userAPI.getProfile(user.id),
          interactAPI.getHistory(user.id)
        ]);
        setProfile(profileRes.data);
        setHistory(historyRes.data || []);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await userAPI.uploadAvatar(user.id, formData);
      setProfile(prev => ({ ...prev, avatar: res.data.avatarUrl }));
      // Update context user if supported
      login({ ...user, avatar: res.data.avatarUrl }, localStorage.getItem('token'));
    } catch (error) {
      console.error('Avatar upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) return <div className="p-8 text-center text-gray-400">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header / Avatar */}
      <div className="bg-[#0f0f11] rounded-2xl p-8 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#8b5cf6]/20 to-[#06b6d4]/20"></div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-6 mt-12">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img 
              src={profile?.avatar || '/default-avatar.png'} 
              alt="Avatar" 
              className={`w-32 h-32 rounded-full object-cover border-4 border-[#0f0f11] shadow-xl ${isUploading ? 'opacity-50' : ''}`}
            />
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleAvatarUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-white">{profile?.username}</h1>
            <p className="text-gray-400">{profile?.email}</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-[#8b5cf6]/10 text-[#8b5cf6] rounded-full text-sm font-medium border border-[#8b5cf6]/20">
                {profile?.role || 'Member'}
              </span>
              <span className="px-3 py-1 bg-[#06b6d4]/10 text-[#06b6d4] rounded-full text-sm font-medium border border-[#06b6d4]/20">
                Lvl {profile?.level || 1}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/settings" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-300">
              <Settings className="w-5 h-5" />
            </Link>
            <button onClick={handleLogout} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Anime Watched', value: profile?.stats?.watched || 0, icon: PlayCircle, color: 'text-blue-400' },
          { label: 'Bookmarks', value: profile?.stats?.bookmarks || 0, icon: Star, color: 'text-yellow-400' },
          { label: 'Watch Time', value: `${profile?.stats?.watchTimeHours || 0}h`, icon: Clock, color: 'text-green-400' },
          { label: 'XP', value: profile?.xp || 0, icon: Star, color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0f0f11] p-5 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-2">
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
            <span className="text-2xl font-bold text-white">{stat.value}</span>
            <span className="text-sm text-gray-400">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Recent History */}
      <div className="bg-[#0f0f11] rounded-xl border border-white/5 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#8b5cf6]" /> Recent History
        </h2>
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.slice(0, 5).map(item => (
              <div key={item._id} className="flex gap-4 items-center p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" onClick={() => navigate(`/anime/${item.anime.slug}`)}>
                <img src={item.anime.coverImage} alt={item.anime.title} className="w-16 h-20 object-cover rounded-md" />
                <div>
                  <h3 className="text-white font-medium line-clamp-1">{item.anime.title}</h3>
                  <p className="text-sm text-gray-400">Episode {item.episodeNumber}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">No recent history.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
