const shimmerClass =
  'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent';

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`h-[300px] rounded-xl bg-[#0f0f11] ${shimmerClass} ${className}`}
    />
  );
}

const textWidthMap = {
  sm: 'w-[40%]',
  md: 'w-[60%]',
  lg: 'w-[80%]',
  full: 'w-full',
};

export function SkeletonText({ width = 'md', className = '' }) {
  const w = textWidthMap[width] || textWidthMap.md;

  return (
    <div
      className={`h-4 rounded bg-[#0f0f11] ${shimmerClass} ${w} ${className}`}
    />
  );
}

export function SkeletonCircle({ size = 40, className = '' }) {
  return (
    <div
      className={`rounded-full bg-[#0f0f11] ${shimmerClass} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonGrid({ count = 10, className = '' }) {
  return (
    <div
      className={`grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${className}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/* Inject the shimmer keyframes once via a <style> tag */
if (typeof document !== 'undefined') {
  const id = '__annimverse-skeleton-shimmer';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes shimmer {
        100% { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);
  }
}

export default SkeletonGrid;
