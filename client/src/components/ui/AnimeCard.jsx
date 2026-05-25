import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const statusConfig = {
  ongoing: { label: 'Ongoing', color: 'bg-violet-500/80 text-violet-100' },
  completed: { label: 'Completed', color: 'bg-red-500/80 text-red-100' },
  movie: { label: 'Movie', color: 'bg-emerald-500/80 text-emerald-100' },
};

export default function AnimeCard({ anime, onClick }) {
  const {
    title = 'Untitled',
    slug = '',
    posterUrl,
    rating,
    genres = [],
    status = 'ongoing',
    totalEpisodes,
  } = anime || {};

  const badge = statusConfig[status?.toLowerCase()] || statusConfig.ongoing;

  const content = (
    <div className="group relative h-[300px] overflow-hidden rounded-xl cursor-pointer bg-[#0f0f11]">
      {/* Poster Image */}
      <img
        src={posterUrl || '/placeholder-poster.jpg'}
        alt={title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* Status Badge */}
      <div className="absolute left-2.5 top-2.5">
        <span
          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.color}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Episodes count */}
      {totalEpisodes != null && (
        <div className="absolute right-2.5 top-2.5">
          <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-gray-300 backdrop-blur-sm">
            {totalEpisodes} Eps
          </span>
        </div>
      )}

      {/* Bottom Info */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <h3 className="mb-1 truncate text-sm font-semibold text-white transition-colors duration-200 group-hover:text-violet-400">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {rating != null && (
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <Star size={12} fill="currentColor" />
              {Number(rating).toFixed(1)}
            </span>
          )}
          {genres.length > 0 && (
            <span className="truncate text-xs text-gray-400">
              {genres[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick} role="button" tabIndex={0}>
        {content}
      </div>
    );
  }

  return (
    <Link to={`/anime/${slug}`} className="block no-underline">
      {content}
    </Link>
  );
}
