/**
 * Deterministic track colors — hashed from track name so color is always stable.
 * Curated 12-color categorical palette designed for dark backgrounds.
 */

const PALETTE = [
  '#f59e0b', // amber
  '#6366f1', // indigo
  '#10b981', // emerald
  '#ef4444', // red
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#f97316', // orange
  '#ec4899', // pink
  '#14b8a6', // teal
  '#a3e635', // lime
  '#0ea5e9', // sky
  '#f43f5e', // rose
];

function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getTrackColor(trackName: string): string {
  return PALETTE[hashStr(trackName) % PALETTE.length];
}

/** Returns a CSS hex color with specified opacity (0–1) as rgba */
export function getTrackColorAlpha(trackName: string, alpha: number): string {
  const hex = getTrackColor(trackName);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
