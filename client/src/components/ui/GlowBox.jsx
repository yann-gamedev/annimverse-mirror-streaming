const colorMap = {
  violet: {
    border: 'border-violet-500/20',
    shadow: 'shadow-[0_0_30px_rgba(139,92,246,0.1)]',
    hoverShadow: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.2)]',
    hoverBorder: 'hover:border-violet-500/40',
  },
  cyan: {
    border: 'border-cyan-500/20',
    shadow: 'shadow-[0_0_30px_rgba(6,182,212,0.1)]',
    hoverShadow: 'hover:shadow-[0_0_40px_rgba(6,182,212,0.2)]',
    hoverBorder: 'hover:border-cyan-500/40',
  },
  pink: {
    border: 'border-pink-500/20',
    shadow: 'shadow-[0_0_30px_rgba(236,72,153,0.1)]',
    hoverShadow: 'hover:shadow-[0_0_40px_rgba(236,72,153,0.2)]',
    hoverBorder: 'hover:border-pink-500/40',
  },
  green: {
    border: 'border-emerald-500/20',
    shadow: 'shadow-[0_0_30px_rgba(16,185,129,0.1)]',
    hoverShadow: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]',
    hoverBorder: 'hover:border-emerald-500/40',
  },
  orange: {
    border: 'border-orange-500/20',
    shadow: 'shadow-[0_0_30px_rgba(249,115,22,0.1)]',
    hoverShadow: 'hover:shadow-[0_0_40px_rgba(249,115,22,0.2)]',
    hoverBorder: 'hover:border-orange-500/40',
  },
};

export default function GlowBox({
  children,
  className = '',
  color = 'violet',
}) {
  const c = colorMap[color] || colorMap.violet;

  return (
    <div
      className={`rounded-2xl border bg-[#0f0f11]/80 backdrop-blur-sm p-6 transition-all duration-300 ${c.border} ${c.shadow} ${c.hoverShadow} ${c.hoverBorder} ${className}`}
    >
      {children}
    </div>
  );
}
