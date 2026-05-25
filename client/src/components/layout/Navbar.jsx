import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlayCircle, LayoutGrid, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Library', to: '/explore' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* ── Logo ─────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <PlayCircle size={28} className="text-violet-500" />
          <span className="text-lg font-bold tracking-wide">
            <span className="text-white">ANNIM</span>
            <span className="text-violet-500">VERSE</span>
          </span>
        </Link>

        {/* ── Desktop Nav ──────────────────────── */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors ${
                isActive(link.to)
                  ? 'bg-violet-500/10 text-violet-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.to === '/explore' && <LayoutGrid size={16} />}
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Desktop Auth ─────────────────────── */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-violet-500/10 text-violet-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2 text-sm font-semibold text-white no-underline shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/30 hover:brightness-110"
              >
                <User size={16} />
                <span className="max-w-[120px] truncate">
                  {user?.username || 'Profile'}
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 no-underline transition-colors hover:text-white"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2 text-sm font-semibold text-white no-underline shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/30 hover:brightness-110"
              >
                Daftar Sekarang
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile Hamburger ─────────────────── */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* ── Mobile Menu Panel ──────────────────── */}
      {mobileOpen && (
        <div className="border-t border-white/5 bg-black/95 backdrop-blur-lg md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium no-underline transition-colors ${
                  isActive(link.to)
                    ? 'bg-violet-500/10 text-violet-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.to === '/explore' && <LayoutGrid size={16} />}
                {link.label}
              </Link>
            ))}

            <div className="my-2 border-t border-white/5" />

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-3 text-sm font-medium no-underline transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-violet-500/10 text-violet-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white no-underline"
                >
                  <User size={16} />
                  {user?.username || 'Profile'}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 text-center text-sm font-medium text-gray-300 no-underline transition-colors hover:text-white"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-3 text-center text-sm font-semibold text-white no-underline shadow-lg shadow-violet-500/20"
                >
                  Daftar Sekarang
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
