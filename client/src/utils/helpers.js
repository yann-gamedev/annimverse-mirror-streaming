/**
 * Format a date to Indonesian relative time string.
 * e.g., 'Baru saja', '5 menit lalu', '2 jam lalu', 'kemarin', '3 hari lalu', etc.
 *
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted relative time string
 */
export function formatDate(date) {
  if (!date) return '';

  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffWeeks < 4) return `${diffWeeks} minggu lalu`;
  if (diffMonths < 12) return `${diffMonths} bulan lalu`;
  return `${diffYears} tahun lalu`;
}

/**
 * Escape HTML entities to prevent XSS.
 *
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  if (!str) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Format duration in minutes to a human-readable string.
 * e.g., 90 -> '1j 30m', 25 -> '25m', 120 -> '2j 0m'
 *
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '';
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) return `${hours}j`;
  return `${hours}j ${remainingMinutes}m`;
}

/**
 * Format file size in bytes to a human-readable string.
 *
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  if (!bytes) return '';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = (bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0);

  return `${size} ${units[i]}`;
}

/**
 * Get avatar URL for a user. Falls back to ui-avatars.com if no avatar is set.
 *
 * @param {object} user - User object with optional avatar and username
 * @returns {string} Avatar URL
 */
export function getAvatarUrl(user) {
  if (!user) return 'https://ui-avatars.com/api/?name=U&background=7c3aed&color=fff&bold=true';

  if (user.avatar) {
    // If avatar is an absolute URL, use as-is
    if (user.avatar.startsWith('http')) return user.avatar;
    // Otherwise treat as a relative path
    return user.avatar;
  }

  const name = encodeURIComponent(user.username || user.name || 'User');
  return `https://ui-avatars.com/api/?name=${name}&background=7c3aed&color=fff&bold=true&size=128`;
}

/**
 * Truncate text to a max length, appending '...' if truncated.
 *
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum character length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}
