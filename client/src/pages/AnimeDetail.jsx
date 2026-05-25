import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Bookmark, Star, Calendar, Clock } from 'lucide-react';
import { animeAPI, interactAPI, recommendAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AnimeCard from '../components/ui/AnimeCard';
import SkeletonGrid from '../components/ui/SkeletonGrid';

const AnimeDetail = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnimeDetail = async () => {
      setIsLoading(true);
      try {
        const [animeRes, epRes] = await Promise.all([
          animeAPI.getBySlug(slug),
          animeAPI.getEpisodes(slug)
        ]);
        
        setAnime(animeRes.data);
        setEpisodes(epRes.data || []);
        
        if (animeRes.data?._id) {
          const simRes = await recommendAPI.getSimilar(animeRes.data._id);
          setSimilar(simRes.data || []);
        }
        
        if (isAuthenticated) {
          try {
            const bmRes = await interactAPI.checkBookmark(animeRes.data._id);
            setIsBookmarked(bmRes.data.isBookmarked);
          } catch (e) {
            console.error('Bookmark check failed', e);
          }
        }
      } catch (error) {
        console.error('Error fetching anime detail:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnimeDetail();
  }, [slug, isAuthenticated]);

  const toggleBookmark = async () => {
    if (!isAuthenticated) return;
    try {
      await interactAPI.toggleBookmark(anime._id);
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  if (isLoading) return <div className="p-8 pt-24"><SkeletonGrid /></div>;
  if (!anime) return <div className="p-8 pt-24 text-center text-white">Anime not found</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Hero Backdrop */}
      <div className="relative h-[400px] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10" />
        <img 
          src={anime.backdropImage || anime.coverImage} 
          alt={anime.title} 
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster & Actions */}
          <div className="w-48 md:w-64 flex-shrink-0">
            <img 
              src={anime.coverImage} 
              alt={anime.title} 
              className="w-full rounded-lg shadow-xl shadow-purple-500/20 border border-gray-800"
            />
            <button 
              onClick={toggleBookmark}
              className={`mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                isBookmarked 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                  : 'bg-[#0f0f11] text-purple-400 hover:bg-purple-900/40 border border-purple-500/30'
              }`}
            >
              <Bookmark className={isBookmarked ? 'fill-current' : ''} size={20} />
              {isBookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
            </button>
            {episodes.length > 0 && (
              <Link 
                to={`/watch/${slug}/${episodes[0].number}`}
                className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20"
              >
                <Play size={20} className="fill-current" />
                Watch First Ep
              </Link>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pt-8 md:pt-32 pb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">{anime.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
              <span className="flex items-center gap-1"><Star size={16} className="text-yellow-500" /> {anime.rating || 'N/A'}</span>
              <span className="flex items-center gap-1"><Calendar size={16} /> {anime.releaseYear || 'Unknown'}</span>
              <span className="flex items-center gap-1"><Clock size={16} /> {anime.status || 'Ongoing'}</span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs uppercase tracking-wider font-semibold border border-purple-500/30">
                {anime.type || 'TV'}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {anime.genres?.map(genre => (
                <span key={genre} className="px-3 py-1 bg-[#0f0f11] border border-gray-800 rounded-full text-sm text-gray-300 hover:border-purple-500/50 transition-colors cursor-default">
                  {genre}
                </span>
              ))}
            </div>

            <p className="text-gray-300 leading-relaxed mb-10 text-lg">{anime.synopsis}</p>

            {/* Episodes */}
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <Play size={24} className="text-cyan-500" />
              Episodes
            </h2>
            {episodes.length === 0 ? (
              <p className="text-gray-500 italic bg-[#0f0f11] p-6 rounded-xl border border-gray-800">No episodes available yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-12">
                {episodes.map(ep => (
                  <Link 
                    key={ep._id} 
                    to={`/watch/${slug}/${ep.number}`}
                    className="flex items-center justify-center py-3 px-4 bg-[#0f0f11] border border-gray-800 rounded-lg hover:border-cyan-500 hover:text-cyan-400 hover:bg-cyan-950/20 transition-all text-gray-300 font-medium"
                  >
                    Ep {ep.number}
                  </Link>
                ))}
              </div>
            )}
            
            {/* Similar Anime */}
            {similar.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mb-6 text-white">Similar Anime</h2>
                <div className="flex overflow-x-auto gap-4 pb-6 snap-x hide-scrollbar">
                  {similar.map(sim => (
                    <div key={sim._id} className="min-w-[200px] snap-start">
                      <AnimeCard anime={sim} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetail;
