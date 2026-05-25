import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Server, Trophy, History, ArrowRight } from 'lucide-react';
import { recommendAPI } from '../api/client';
import AnimeCard from '../components/ui/ui/AnimeCard';
import { SkeletonGrid } from '../components/ui/ui/Skeleton';
import GlowBox from '../components/ui/ui/GlowBox';

const Home = () => {
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setIsLoading(true);
        const res = await recommendAPI.getTrending({ limit: 5 });
        setTrendingAnime(res.data?.data || res.data || []);
      } catch (error) {
        console.error("Failed to fetch trending:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/40 via-[#050505] to-[#050505] -z-10"></div>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              Annimverse
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Streaming anime mirror platform dengan kualitas premium, tanpa iklan mengganggu, dan fitur gamifikasi yang menarik.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/anime" className="px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]">
              <Play size={20} className="fill-current" />
              Mulai Menonton
            </Link>
            <Link to="/register" className="px-8 py-4 rounded-xl bg-[#0f0f11] hover:bg-white/10 border border-white/5 text-white font-semibold flex items-center justify-center gap-2 transition-all">
              Daftar Sekarang
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Features Section */}
      <section className="py-20 px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlowBox className="p-8">
              <div className="h-12 w-12 rounded-lg bg-violet-500/20 flex items-center justify-center mb-6 text-violet-400">
                <Server size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Mirror Cepat</h3>
              <p className="text-gray-400 leading-relaxed">
                Server mirror berkecepatan tinggi memastikan pengalaman menonton tanpa buffering.
              </p>
            </GlowBox>
            
            <GlowBox className="p-8" glowColor="rgba(6, 182, 212, 0.15)">
              <div className="h-12 w-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400">
                <Trophy size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Gamifikasi</h3>
              <p className="text-gray-400 leading-relaxed">
                Kumpulkan poin, capai level baru, dan pamerkan badge eksklusif ke komunitas.
              </p>
            </GlowBox>

            <GlowBox className="p-8">
              <div className="h-12 w-12 rounded-lg bg-violet-500/20 flex items-center justify-center mb-6 text-violet-400">
                <History size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Riwayat & Bookmark</h3>
              <p className="text-gray-400 leading-relaxed">
                Lanjutkan tontonan dari episode terakhir dan simpan anime favoritmu dengan mudah.
              </p>
            </GlowBox>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-20 px-6 lg:px-8 bg-[#0a0a0c]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold">Trending Saat Ini</h2>
            <Link to="/anime?sort=trending" className="text-violet-400 hover:text-violet-300 flex items-center gap-2 transition-colors">
              Lihat Semua <ArrowRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <SkeletonGrid count={5} />
          ) : trendingAnime.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {trendingAnime.map((anime) => (
                <AnimeCard key={anime.id || anime.slug} anime={anime} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Belum ada data trending
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
