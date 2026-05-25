import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock } from 'lucide-react';

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const STORAGE_KEY = 'recentSearches';
const MAX_RECENT = 5;

function getRecentSearches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(term) {
  if (!term.trim()) return;
  const list = getRecentSearches().filter((s) => s !== term.trim());
  list.unshift(term.trim());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
}

export default function SearchBar({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Cari anime...',
  showRecent = true,
}) {
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState([]);
  const wrapperRef = useRef(null);
  const debouncedValue = useDebounce(value);

  /* Load recents on focus */
  useEffect(() => {
    if (focused && showRecent) {
      setRecent(getRecentSearches());
    }
  }, [focused, showRecent]);

  /* Live search on debounced value */
  useEffect(() => {
    if (debouncedValue && onSearch) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (value.trim()) {
        saveRecentSearch(value);
        setRecent(getRecentSearches());
        onSearch?.(value.trim());
        setFocused(false);
      }
    },
    [value, onSearch]
  );

  const handleRecentClick = useCallback(
    (term) => {
      onChange?.({ target: { value: term } });
      onSearch?.(term);
      setFocused(false);
    },
    [onChange, onSearch]
  );

  const handleClear = useCallback(() => {
    onChange?.({ target: { value: '' } });
  }, [onChange]);

  const showDropdown =
    focused && showRecent && recent.length > 0 && !value.trim();

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-10 text-sm text-white placeholder-gray-500 outline-none backdrop-blur-sm transition-all duration-200 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* Recent Searches Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0f0f11]/95 shadow-2xl backdrop-blur-md">
          <div className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-gray-500">
            Pencarian Terakhir
          </div>
          {recent.map((term) => (
            <button
              key={term}
              onClick={() => handleRecentClick(term)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Clock size={14} className="shrink-0 text-gray-600" />
              <span className="truncate">{term}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
