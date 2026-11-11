// Scale bands: named zones of the size ladder that drive the background tint and the rail.
// Boundaries are in log10(metres). Items belong to a band by size alone; their `kind` is separate.

export interface Band {
  id: string;
  label: string;
  /** Shorter label for tight spaces. */
  short: string;
  /** Inclusive lower bound in log10(m). */
  from: number;
  /** Background gradient (top, bottom) and an accent for UI chrome. */
  top: string;
  bottom: string;
  accent: string;
  /** Star density 0..1 for the background field. */
  stars: number;
}

export const BANDS: Band[] = [
  { id: 'subatomic',    label: 'Subatomic', short: 'Quantum',      from: -Infinity, top: '#0c0a1e', bottom: '#1d1136', accent: '#a78bfa', stars: 0 },
  { id: 'atomic',       label: 'Atoms & molecules', short: 'Atomic', from: -12,   top: '#08111f', bottom: '#0f2740', accent: '#38bdf8', stars: 0 },
  { id: 'microscopic',  label: 'Microscopic life', short: 'Micro', from: -8,     top: '#07160f', bottom: '#0f2e21', accent: '#34d399', stars: 0 },
  { id: 'everyday',     label: 'Human scale', short: 'Human',    from: -4,        top: '#141724', bottom: '#2a2b3d', accent: '#fbbf24', stars: 0 },
  { id: 'colossal',     label: 'Colossal', short: 'Colossal',       from: 2,         top: '#0f1726', bottom: '#1d2b45', accent: '#94a3b8', stars: 0.15 },
  { id: 'worlds',       label: 'Worlds', short: 'Worlds',         from: 5,         top: '#04081a', bottom: '#0a1733', accent: '#60a5fa', stars: 0.6 },
  { id: 'stellar',      label: 'Stars', short: 'Stars',          from: 10,        top: '#120804', bottom: '#2b1206', accent: '#fb923c', stars: 0.7 },
  { id: 'interstellar', label: 'Interstellar', short: 'Interstellar',   from: 14,        top: '#060a1c', bottom: '#150f35', accent: '#22d3ee', stars: 0.9 },
  { id: 'galactic',     label: 'Galaxies', short: 'Galaxies',       from: 19,        top: '#040410', bottom: '#170a2c', accent: '#c084fc', stars: 0.5 },
  { id: 'cosmic',       label: 'The cosmos', short: 'Cosmos',     from: 24,        top: '#000000', bottom: '#0b0b16', accent: '#f1f5f9', stars: 0.25 },
];

export const bandIndexForLog = (log10m: number): number => {
  let idx = 0;
  for (let i = 0; i < BANDS.length; i++) if (log10m >= BANDS[i].from) idx = i;
  return idx;
};

export const bandForSize = (meters: number): Band => BANDS[bandIndexForLog(Math.log10(meters))];

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (rgb: number[]) => '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
};

export interface Backdrop {
  top: string;
  bottom: string;
  accent: string;
  stars: number;
  band: Band;
}

/**
 * Continuous backdrop for a given log10 scale. Blends across ±0.75 dex either side
 * of a band boundary so the tint drifts rather than snaps.
 */
export function backdropForLog(log10m: number): Backdrop {
  const i = bandIndexForLog(log10m);
  const band = BANDS[i];
  const next = BANDS[i + 1];
  const prev = BANDS[i - 1];
  const SOFT = 0.75;
  let t = 0;
  let other: Band | undefined;
  if (next && log10m > next.from - SOFT) {
    other = next; t = (log10m - (next.from - SOFT)) / (2 * SOFT) * 0.5; // approach from below: 0 → 0.5 at boundary
  } else if (prev && log10m < band.from + SOFT) {
    other = prev; t = ((band.from + SOFT) - log10m) / (2 * SOFT) * 0.5; // leave boundary: 0.5 → 0
  }
  if (!other || t <= 0) return { top: band.top, bottom: band.bottom, accent: band.accent, stars: band.stars, band };
  return {
    top: mix(band.top, other.top, t),
    bottom: mix(band.bottom, other.bottom, t),
    accent: mix(band.accent, other.accent, t),
    stars: band.stars + (other.stars - band.stars) * t,
    band,
  };
}
