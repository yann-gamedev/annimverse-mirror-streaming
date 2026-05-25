import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { recommendAPI, interactAPI, animeAPI } from '../api/client';
import AnimeCard from '../components/ui/AnimeCard';
import SkeletonGrid from '../components/ui/SkeletonGrid';
import { Clock, BookMarked, MessageSquarePlus, Settings, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ level: 1, xp: 0, nextLevelXp: 1000 });
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [recsRes, trendingRes, historyRes] = await Promise.all([
          recommendAPI.getRecommendations(),
          recommendAPI.getTrending(),
          interactAPI.getHistory(user?.id)
        ]);
        
        setRecommendations(recsRes.data || []);
        setTrending(trendingRes.data || []);
        setContinueWatching(historyRes.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const handleHideRecommendation = async (animeId) => {
    try {
      await recommendAPI.submitFeedback(animeId, 'hide');
      setRecommendations(prev => prev.filter(anime => anime._id !== animeId));
    } catch (error) {
      console.error('Failed to hide recommendation:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <SkeletonGrid count={8} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome & Stats */}
      <div className="bg-[#0f0f11] rounded-xl p-6 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img 
            src={user?.avatar || '/default-avatar.png'} 
            alt={user?.username} 
            className="w-16 h-16 rounded-full object-cover border-2 border-[#8b5cf6]"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {user?.username}!</h1>
            <p className="text-gray-400">Ready to explore more anime?</p>
          </div>
        </div>
        
        <div className="bg-black/40 rounded-lg p-4 min-w-[200px]">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#06b6d4] font-medium">Level {stats.level}</span>
            <span className="text-gray-400">{stats.xp} / {stats.nextLevelXp} XP</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] h-2 rounded-full" 
              style={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/profile" className="bg-[#0f0f11] hover:bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors">
          <Clock className="w-6 h-6 text-[#8b5cf6]" />
          <span className="text-sm font-medium text-gray-200">History</span>
        </Link>
        <Link to="/library" className="bg-[#0f0f11] hover:bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors">
          <BookMarked className="w-6 h-6 text-[#06b6d4]" />
          <span className="text-sm font-medium text-gray-200">Library</span>
        </Link>
        <Link to="/requests" className="bg-[#0f0f11] hover:bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors">
          <MessageSquarePlus className="w-6 h-6 text-[#8b5cf6]" />
          <span className="text-sm font-medium text-gray-200">Requests</span>
        </Link>
        <Link to="/settings" className="bg-[#0f0f11] hover:bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors">
          <Settings className="w-6 h-6 text-[#06b6d4]" />
          <span className="text-sm font-medium text-gray-200">Settings</span>
        </Link>
      </div>

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#8b5cf6]" /> Continue Watching
          </h2>
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
            {continueWatching.map((item) => (
              <div key={item._id} className="min-w-[200px] flex-shrink-0">
                <AnimeCard anime={item.anime} />
                <div className="mt-2 text-sm text-gray-400">
                  Episode {item.episodeNumber}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Trending Now</h2>
        <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
          {trending.map((anime) => (
            <div key={anime._id} className="min-w-[200px] flex-shrink-0">
              <AnimeCard anime={anime} />
            </div>
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Recommended for You</h2>
        <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
          {recommendations.map((anime) => (
            <div key={anime._id} className="min-w-[200px] flex-shrink-0 relative group">
              <AnimeCard anime={anime} />
              <button 
                onClick={() => handleHideRecommendation(anime._id)}
                className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-md text-gray-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                title="Hide recommendation"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
