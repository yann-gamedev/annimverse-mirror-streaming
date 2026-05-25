import { PlayCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#020202] pb-6 pt-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 text-center">
        {/* Branding */}
        <div className="mb-4 flex items-center gap-2">
          <PlayCircle size={24} className="text-violet-500" />
          <span className="text-lg font-bold tracking-wide text-white">
            ANNIMVERSE
          </span>
        </div>

        {/* Subtitle */}
        <p className="mb-6 max-w-md text-sm leading-relaxed text-gray-500">
          Private Anime Streaming Platform dengan Sistem Gamifikasi
          Terintegrasi.
        </p>

        {/* Divider */}
        <div className="mb-4 h-px w-full max-w-xs bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Copyright */}
        <p className="text-xs text-gray-600">
          &copy; 2024 Annimverse Project. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
