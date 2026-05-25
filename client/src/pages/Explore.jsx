import React, { useState, useEffect } from 'react';
import { animeAPI } from '../api/client';
import AnimeCard from '../components/ui/AnimeCard';
import SkeletonGrid from '../components/ui/SkeletonGrid';
import { Search, SlidersHorizontal } from 'lucide-react';
import { GENRES, SORT_OPTIONS, STATUS_OPTIONS } from '../utils/constants';

const Explore = () => {
  const [animes, setAnimes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, hasMore: false });
  const [filters, setFilters] = useState({
    q: '',
    genres: '',
    sort: 'popular',
    status: '',
    year: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAnimes(1, true);
  }, [filters]);

  const fetchAnimes = async (page = 1, reset = false) => {
    setIsLoading(true);
    try {
      const res = await animeAPI.getAll({ ...filters, page });
      setAnimes(prev => reset ? res.data.results : [...prev, ...res.data.results]);
      setPagination({
        page,
        hasMore: res.data.page < res.data.totalPages
      });
    } catch (error) {
      console.error('Failed to fetch animes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const loadMore = () => {
    if (!isLoading && pagination.hasMore) {
      fetchAnimes(pagination.page + 1);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold text-white mb-6">Explore Anime</h1>
        
        {/* Filter Bar */}
        <div className="bg-[#0f0f11] p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              name="q"
              value={filters.q}
              onChange={handleFilterChange}
              placeholder="Search anime..."
              className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap gap-3">
            <div className="relative">
              <select 
                name="genres" 
                value={filters.genres} 
                onChange={handleFilterChange}
                className="appearance-none bg-black/40 border border-white/10 rounded-lg py-2.5 px-4 pr-10 text-gray-300 focus:outline-none focus:border-[#8b5cf6]"
              >
                <option value="">All Genres</option>
                {GENRES?.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                name="status" 
                value={filters.status} 
                onChange={handleFilterChange}
                className="appearance-none bg-black/40 border border-white/10 rounded-lg py-2.5 px-4 pr-10 text-gray-300 focus:outline-none focus:border-[#06b6d4]"
              >
                <option value="">All Status</option>
                {STATUS_OPTIONS?.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div className="relative">
              <select 
                name="sort" 
                value={filters.sort} 
                onChange={handleFilterChange}
                className="appearance-none bg-black/40 border border-white/10 rounded-lg py-2.5 px-4 pr-10 text-gray-300 focus:outline-none focus:border-[#8b5cf6]"
              >
                {SORT_OPTIONS?.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Anime Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {animes.map(anime => (
          <AnimeCard key={anime._id} anime={anime} />
        ))}
        {isLoading && <SkeletonGrid count={10} />}
      </div>

      {!isLoading && animes.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No anime found matching your criteria.
        </div>
      )}

      {/* Load More */}
      {pagination.hasMore && (
        <div className="mt-8 flex justify-center">
          <button 
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Explore;
