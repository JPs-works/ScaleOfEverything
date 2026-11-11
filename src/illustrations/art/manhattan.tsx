import type { Illustration } from '../types';

// Manhattan — measured axis: length (horizontal). Map view rotated so north points right:
// the Battery touches x = 0, the Spuyten Duyvil corner x = 100. The Hudson runs along the top,
// the East River / Harlem River along the bottom. Real proportions: 21.6 km long, 3.7 km at the
// widest (14th Street), so the island proper spans y = 0 .. 17.4; Roosevelt Island, part of the
// borough, lies just off the East River shore and brings the box to 18.1. aspect = 100 / 18.1.
// Palette from #C4B5FD: highlight #E4DCFF, shade #9D8DE0; Central Park green and river blue as accents.
const H = 18.1;

type Pt = [number, number];

// Shoreline, clockwise from the Battery along the East River to Inwood, then back down the Hudson.
// x ≈ km north of the Battery × 4.63; y from widths measured across the island.
const SHORE: Pt[] = [
  [0, 4.9], [0, 6.3], // the Battery: a blunt tip, set toward the East River side
  [0.7, 7.4], [2.6, 8.7], // South Street Seaport
  [5.4, 10.2], [8.4, 11.8], // Two Bridges
  [11.2, 13.8], [13.8, 15.7], // Corlears Hook: the Lower East Side bulge
  [17.2, 16.9], [21, 17.4], // 14th Street: the island's widest point
  [25.2, 16.9], [31, 15.4], // 23rd .. 42nd: the Midtown dip
  [38, 15.7], [45, 16], // 59th .. Yorkville
  [50.5, 15.8], [56.5, 15], // 96th .. 110th
  [62, 14], [73, 12.2], // 125th: the Harlem River begins the taper
  [82, 10.5], [89, 8.9], // 181st .. Dyckman
  [95, 8.3], [99.1, 7.9],
  [100, 7], [100, 5.6], // Spuyten Duyvil: the farthest point along the axis, blunt
  [99.1, 4], [98, 2.9], // the channel cuts the north end at a slant to the Hudson corner
  [95, 2.1], [88, 1.8], // Inwood Hill
  [78, 1.5], [66, 1.1], // the Hudson shore: almost straight
  [54, 0.8], [42, 0.4],
  [32, 0.1], [24, 0], // Chelsea Piers: the shore's gentle bow touches y = 0
  [16, 0.4], [9, 1], // Tribeca
  [4, 1.7], [1.6, 2.8], // Battery Park City
  [0.4, 3.9],
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const f = (n: number) => n.toFixed(2).replace(/\.?0+$/, '');

// Closed Catmull-Rom spline through the points; control points are clamped to the box so the
// outline never overshoots the measured length.
const loop = (pts: Pt[]): string => {
  const n = pts.length;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = clamp(p1[0] + (p2[0] - p0[0]) / 6, 0, 100);
    const c1y = clamp(p1[1] + (p2[1] - p0[1]) / 6, 0, H);
    const c2x = clamp(p2[0] - (p3[0] - p1[0]) / 6, 0, 100);
    const c2y = clamp(p2[1] - (p3[1] - p1[1]) / 6, 0, H);
    d += ` C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d} Z`;
};

const ISLAND = loop(SHORE);

// Numbered cross streets (perpendicular to the island's length) from the Village up to Harlem.
const STREETS = [18, 23, 28, 33, 38, 43, 48, 53, 58, 63, 68, 73, 78, 83, 88];

// Dense skyscraper blocks: Midtown (34th .. 59th) and the Financial District.
const MIDTOWN_BLOCKS: Pt[] = [
  [28.6, 3.2], [31.4, 3.2], [34.2, 3.2],
  [28.6, 7.6], [31.4, 7.6], [34.2, 7.6],
  [28.6, 12], [31.4, 12], [34.2, 12],
];
const DOWNTOWN_BLOCKS: Pt[] = [[2.2, 4.6], [5, 4.6], [2.2, 7.4], [5, 7.4]];

export const art: Illustration = {
  id: 'manhattan',
  aspect: 100 / H,
  View: ({ uid, px }) => (
    <svg viewBox={`0 0 100 ${H}`} width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* land, lit from the upper-left */}
        <linearGradient id={`${uid}-land`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#E4DCFF" />
          <stop offset="45%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#9D8DE0" />
        </linearGradient>
        {/* shoreline rim: lit along the Hudson, shaded along the East River */}
        <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0%" stopColor="#F5F1FF" stopOpacity="0.75" />
          <stop offset="45%" stopColor="#F5F1FF" stopOpacity="0" />
          <stop offset="55%" stopColor="#7C6AC8" stopOpacity="0" />
          <stop offset="100%" stopColor="#7C6AC8" stopOpacity="0.7" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <path d={ISLAND} />
        </clipPath>
        <clipPath id={`${uid}-box`}>
          <rect x="0" y="0" width="100" height={H} />
        </clipPath>
      </defs>

      {/* rivers: a faint water glow hugging the shoreline, clipped so nothing leaves the box */}
      {px > 24 && (
        <g clipPath={`url(#${uid}-box)`} stroke="#6B96F5" opacity="0.26" fill="none" strokeLinejoin="round" strokeLinecap="round">
          <path d={ISLAND} strokeWidth="3.6" />
          <line x1="33" y1="17" x2="46.6" y2="17.6" strokeWidth="3" />
        </g>
      )}

      {/* the island silhouette */}
      <path d={ISLAND} fill={px > 24 ? `url(#${uid}-land)` : '#C4B5FD'} />

      {/* Roosevelt Island: a sliver in the East River from 46th to 85th Street */}
      <line x1="33" y1="17" x2="46.6" y2="17.6" stroke="#B8A8F5" strokeWidth="1.05" strokeLinecap="round" />

      {px > 24 && (
        <g clipPath={`url(#${uid}-clip)`}>
          {/* dense districts read a shade darker, with hard edges */}
          <rect x="0" y="0" width="9.5" height={H} fill="#9A8AE4" opacity="0.4" />
          <rect x="27.5" y="0" width="10" height={H} fill="#9A8AE4" opacity="0.4" />
          {/* Central Park: 59th to 110th Street */}
          <rect x="37.5" y="6.3" width="19" height="3.8" rx="0.3" fill="#6FBF8A" />
          {/* shoreline rim: 2 wide, half clipped away, so a 1-unit band inside the shore */}
          <path d={ISLAND} fill="none" stroke={`url(#${uid}-rim)`} strokeWidth="2" />
        </g>
      )}

      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`}>
          {/* the street grid: cross streets ... */}
          <g stroke="#7C6AC8" strokeWidth="0.25" opacity="0.45">
            {STREETS.map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2={H} />
            ))}
            {/* ... and avenues running the island's length */}
            <path d="M12 3.6 C36 3.4 62 3.8 96 4.4" fill="none" />
            <path d="M14 12.8 C30 13.2 46 13 60 12.4" fill="none" />
          </g>
          {/* skyscraper blocks */}
          <g fill="#DACFFF" opacity="0.3">
            {MIDTOWN_BLOCKS.map(([x, y]) => (
              <rect key={`m${x}-${y}`} x={x} y={y} width="1.8" height="2.6" />
            ))}
            {DOWNTOWN_BLOCKS.map(([x, y]) => (
              <rect key={`d${x}-${y}`} x={x} y={y} width="1.6" height="1.8" />
            ))}
          </g>
          {/* Broadway cuts diagonally across the grid: Battery, Union Square, Columbus Circle, Inwood */}
          <path d="M1.5 6 C8 8 14 10.4 20 11.2 C26 11.4 32 8.4 37.5 6.3 C44 6 50 6 56.5 5.8 C64 5.4 72 5 80 4.6 C88 4.2 94 4 98.6 4.2" stroke="#F5F1FF" strokeWidth="0.45" fill="none" opacity="0.7" strokeLinecap="round" />
          {/* the reservoir in Central Park */}
          <ellipse cx="49.5" cy="8.1" rx="1.8" ry="1.1" fill="#5FA3E8" />
          {/* tree cover texture on the park */}
          <circle cx="40.5" cy="7.5" r="0.8" fill="#4FA373" opacity="0.7" />
          <circle cx="44" cy="9" r="0.9" fill="#4FA373" opacity="0.7" />
          <circle cx="54.5" cy="8.4" r="0.8" fill="#4FA373" opacity="0.7" />
        </g>
      )}
    </svg>
  ),
};
