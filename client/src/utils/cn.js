export const cn = (...a) => a.filter(Boolean).join(' ');
export const errMsg = (e, fallback = 'Something went wrong. Please try again.') =>
  e?.response?.data?.message || (e?.code === 'ERR_NETWORK' ? 'Cannot reach the server. Check your connection.' : e?.message) || fallback;
export const timeAgo = (d) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(d)) / 1000));
  const t = [[31536000, 'y'], [2592000, 'mo'], [86400, 'd'], [3600, 'h'], [60, 'm']];
  for (const [n, u] of t) if (s >= n) return `${Math.floor(s / n)}${u} ago`;
  return 'just now';
};
export const scoreTone = (n) => (n >= 75 ? '#16a34a' : n >= 50 ? '#d97706' : '#dc2626');
export const uid = () => Math.random().toString(36).slice(2, 10);
export const copy = async (text, toast) => {
  try { await navigator.clipboard.writeText(text); toast?.success('Copied'); } catch { toast?.error('Copy failed'); }
};
export const saveBlob = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
