import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare, ChevronLeft, ChevronRight, Loader2, Send } from 'lucide-react';
import { animeAPI, streamAPI, interactAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const Watch = () => {
  const { slug, eps } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  const [watchData, setWatchData] = useState(null);
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchWatchData = async () => {
      setIsLoading(true);
      try {
        const [animeRes, epsRes] = await Promise.all([
          animeAPI.getBySlug(slug),
          animeAPI.getEpisodes(slug)
        ]);
        
        const anime = animeRes.data;
        const episodes = epsRes.data || [];
        const currentEp = episodes.find(e => e.number === Number(eps));
        
        setWatchData({ anime, episode: currentEp });
        setAllEpisodes(episodes);

        if (currentEp) {
          const commentsRes = await interactAPI.getComments(currentEp._id);
          setComments(commentsRes.data || []);
          
          if (isAuthenticated) {
            try {
              await interactAPI.addToHistory(anime._id, currentEp._id);
            } catch (err) {
              console.error('Failed to add to history', err);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching watch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWatchData();
  }, [slug, eps, isAuthenticated]);

  const toggleLike = async () => {
    if (!isAuthenticated || !watchData?.episode) return;
    try {
      await interactAPI.toggleLike(watchData.episode._id);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !newComment.trim() || !watchData?.episode) return;
    try {
      const res = await interactAPI.postComment(watchData.episode._id, newComment);
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  if (!watchData?.episode) {
    return <div className="min-h-screen pt-24 p-8 text-center text-white bg-[#050505]">Episode not found</div>;
  }

  const currentEpIndex = allEpisodes.findIndex(e => e.number === Number(eps));
  const prevEp = currentEpIndex > 0 ? allEpisodes[currentEpIndex - 1] : null;
  const nextEp = currentEpIndex < allEpisodes.length - 1 ? allEpisodes[currentEpIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link to={`/anime/${slug}`} className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 font-medium transition-colors">
          <ChevronLeft size={18} /> Back to {watchData.anime.title}
        </Link>
        
        {/* Video Player Area */}
        <div className="bg-[#0f0f11] rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/10 border border-gray-800">
          <div className="aspect-video bg-black w-full relative">
            <video 
              src={streamAPI.getStreamUrl(watchData.episode._id)} 
              controls 
              className="w-full h-full"
              poster={watchData.anime.backdropImage || watchData.anime.coverImage}
            />
          </div>
          
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-800 pb-8 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Episode {watchData.episode.number}: {watchData.episode.title || `Episode ${watchData.episode.number}`}</h1>
                <p className="text-gray-400">Now playing from <span className="text-purple-400 font-medium">{watchData.anime.title}</span></p>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={toggleLike}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                    isLiked 
                      ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 border border-transparent'
                  }`}
                >
                  <ThumbsUp size={18} className={isLiked ? 'fill-current' : ''} />
                  Like
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              {prevEp ? (
                <Link 
                  to={`/watch/${slug}/${prevEp.number}`} 
                  className="flex items-center gap-2 px-4 py-2 bg-[#050505] rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-all"
                >
                  <ChevronLeft size={20} /> Prev Episode
                </Link>
              ) : <div />}
              
              {nextEp ? (
                <Link 
                  to={`/watch/${slug}/${nextEp.number}`} 
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
                >
                  Next Episode <ChevronRight size={20} />
                </Link>
              ) : <div />}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 bg-[#0f0f11] rounded-2xl p-6 md:p-8 border border-gray-800 shadow-xl">
          <h2 className="text-2xl font-bold flex items-center gap-3 mb-8">
            <MessageSquare size={24} className="text-cyan-500" /> Comments ({comments.length})
          </h2>
          
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-10 relative">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center font-bold text-lg shadow-lg">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this episode..."
                    className="w-full bg-[#050505] border border-gray-700 rounded-xl p-4 pr-16 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none shadow-inner"
                    rows={3}
                  />
                  <button 
                    type="submit"
                    disabled={!newComment.trim()}
                    className="absolute bottom-3 right-3 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border border-purple-500/30 rounded-xl p-6 text-center mb-10 shadow-inner">
              <p className="text-gray-300">
                Please <Link to="/login" className="text-purple-400 font-bold hover:text-purple-300 underline-offset-4 hover:underline mx-1">log in</Link> 
                to join the discussion and share your thoughts.
              </p>
            </div>
          )}

          <div className="space-y-8">
            {comments.map((comment, idx) => (
              <div key={comment._id || idx} className="flex gap-4 group">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center font-bold text-gray-400 border border-gray-700">
                  {comment.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="font-bold text-gray-200">{comment.user?.username || 'Anonymous User'}</span>
                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <p className="text-gray-300 text-[15px] leading-relaxed bg-[#050505] p-4 rounded-xl border border-gray-800/60 rounded-tl-none">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-12 bg-[#050505] rounded-xl border border-dashed border-gray-800">
                <MessageSquare size={32} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No comments yet. Be the first to start the discussion!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
