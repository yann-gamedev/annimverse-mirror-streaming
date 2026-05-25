import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { badgeAPI } from '../api/client';
import { Trophy, Star, Shield, Zap } from 'lucide-react';

const Achievements = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      setIsLoading(true);
      try {
        const [allRes, userRes] = await Promise.all([
          badgeAPI.getAll(),
          badgeAPI.getUserBadges(user?.id)
        ]);
        setBadges(allRes.data || []);
        setUserBadges(userRes.data?.map(b => b._id) || []);
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) fetchBadges();
  }, [user]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading achievements...</div>;
  }

  const earnedCount = userBadges.length;
  const totalCount = badges.length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-[#0f0f11] rounded-2xl p-8 border border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b5cf6]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] rounded-2xl flex items-center justify-center shadow-lg shadow-[#8b5cf6]/20">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Achievements</h1>
            <p className="text-gray-400">Complete tasks and watch anime to unlock exclusive badges.</p>
          </div>
        </div>

        <div className="relative z-10 bg-black/40 px-6 py-4 rounded-xl border border-white/5 text-center min-w-[200px]">
          <div className="text-sm text-gray-400 mb-1">Completion</div>
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4]">
            {earnedCount} / {totalCount}
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {badges.map((badge) => {
          const isUnlocked = userBadges.includes(badge._id);
          
          return (
            <div 
              key={badge._id} 
              className={`bg-[#0f0f11] rounded-xl p-6 border transition-all duration-300 flex flex-col items-center text-center gap-3
                ${isUnlocked 
                  ? 'border-[#8b5cf6]/30 shadow-[0_0_20px_rgba(139,92,246,0.1)] hover:border-[#8b5cf6]/60' 
                  : 'border-white/5 grayscale opacity-60'}`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2
                ${isUnlocked ? 'bg-gradient-to-br from-[#8b5cf6]/20 to-[#06b6d4]/20' : 'bg-white/5'}`}>
                {badge.iconUrl ? (
                  <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10 object-contain" />
                ) : (
                  <Star className={`w-8 h-8 ${isUnlocked ? 'text-[#8b5cf6]' : 'text-gray-500'}`} />
                )}
              </div>
              
              <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                {badge.name}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2">
                {badge.description}
              </p>
              
              {isUnlocked && (
                <div className="mt-2 text-[10px] uppercase tracking-wider font-semibold text-[#06b6d4] bg-[#06b6d4]/10 px-2 py-1 rounded-full">
                  Unlocked
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
