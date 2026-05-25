/**
 * Annimverse Constants
 */

export const GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mecha',
  'Music',
  'Mystery',
  'Psychological',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
];

export const SORT_OPTIONS = [
  { value: 'latest', label: 'Terbaru' },
  { value: 'rating', label: 'Rating Tertinggi' },
  { value: 'title-asc', label: 'A-Z' },
  { value: 'title-desc', label: 'Z-A' },
  { value: 'year-desc', label: 'Tahun (Baru)' },
  { value: 'year-asc', label: 'Tahun (Lama)' },
];

export const STATUS_OPTIONS = [
  { value: '', label: 'Semua' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Movie', label: 'Movie' },
];

export const BADGE_CATEGORIES = {
  WATCH: 'Menonton',
  STREAK: 'Streak',
  SOCIAL: 'Sosial',
  SPECIAL: 'Spesial',
};

export const ITEMS_PER_PAGE = 24;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};
