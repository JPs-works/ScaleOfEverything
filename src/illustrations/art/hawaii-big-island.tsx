import type { Illustration } from '../types';

// Island of Hawaiʻi — measured axis: width (horizontal), map view with north up.
// Keahole Point (the Kona coast) touches x = 0 and Cape Kumukahi (Puna) touches x = 100;
// Upolu Point (Kohala) rests on y = 0 and Ka Lae (South Point) on y = H. The real island is
// ~150 km east-west by ~137 km north-south, so H = 91 and aspect = 100 / 91 ≈ 1.1.
// Coordinates come from real longitude / latitude: x = (156.06° W − lon) / 1.25° × 100,
// y = (20.27° N − lat) / 1.36° × 91. Flat elevation bands, like a museum relief map: green
// lowlands (a drier, yellower strip on the leeward Kona coast, deeper rainforest green on the
// windward Hāmākua and Puna side), a tan mid-slope band, brown upper slopes, snow on the two
// tall summits, and Kīlauea's dark lava field with one tongue down to the shore at Kalapana.
const H = 91;

const LOW = '#5c9e6a';
const LOW_DRY = '#8db46e';
const LOW_WET = '#3d8552';
const MID = '#a89672';
const HIGH = '#7a6553';
const LAVA = '#3b3338';
const LAVA_FRESH = '#26202a';
const SNOW = '#f6f8fa';
const SHORE = '#e8e3c8';
const SEA = '#6fb7d9';

type Pt = [number, number];

// Shoreline, clockwise from Upolu Point along the Hāmākua coast to Hilo and Cape Kumukahi,
// south-west along Puna and Kaʻū to Ka Lae, then north up the Kona and Kohala coasts.
const COAST: Pt[] = [
  [16, 0], [22, 1], // Upolu Point: the north tip of the Kohala peninsula
  [30, 5], [38, 10], // Waipiʻo
  [46, 16], [56, 24], // Hāmākua coast, straight and south-east
  [66, 31], [74, 36],
  [79, 38], [85, 40], // Hilo Bay
  [92, 45], [100, 50], // Cape Kumukahi: the easternmost point
  [98, 55], [92, 60],
  [86, 63], [76, 67], // Kalapana
  [64, 71], [52, 75],
  [44, 78], [36, 85], // Punaluʻu and the Kaʻū coast
  [30, 91], [26, 89], // Ka Lae: South Point
  [20, 83], [14, 74], // Miloliʻi
  [9, 63], [5, 52],
  [2, 44], [0, 36], // Keahole Point: the westernmost point
  [3, 28], [8, 20],
  [13, 14], [15, 8], // Kawaihae and the narrow Kohala neck
  [15, 3],
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const f = (n: number) => n.toFixed(2).replace(/\.?0+$/, '');

// Closed Catmull-Rom spline; control points are clamped to the box so the coast never overshoots.
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

const ISLAND = loop(COAST);

export const art: Illustration = {
  id: 'hawaii-big-island',
  aspect: 100 / H,
  View: ({ uid, px }) => (
    <svg viewBox={`0 0 100 ${H}`} width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id={`${uid}-clip`}><path d={ISLAND} /></clipPath>
      </defs>

      {/* a thin ring of lighter, shallow sea just off the coast */}
      {px > 24 && <path d={ISLAND} fill="none" stroke={SEA} strokeWidth="1.5" strokeLinejoin="round" opacity="0.3" />}

      {/* the island: green lowlands, a solid silhouette at every size */}
      <path d={ISLAND} fill={LOW} />

      {px > 24 && (
        <g clipPath={`url(#${uid}-clip)`}>
          {px > 48 && (
            <>
              {/* windward rainforest: the Hāmākua and Puna slopes */}
              <path d="M34 7 C40 16 46 30 54 42 C57 48 58 54 60 58 L84 66 C90 62 96 56 96 50 C86 38 68 24 50 14 Z" fill={LOW_WET} />
              {/* leeward Kona coast: dry, sunlit grassland */}
              <path d="M0 36 C2 44 5 52 9 63 C14 74 20 83 26 89 C23 80 21 71 19 63 C16 55 12 48 7 41 Z" fill={LOW_DRY} />
            </>
          )}

          {/* mid-slope band: Kohala, Hualālai, Mauna Loa and Mauna Kea share one flat tan */}
          <g fill={MID}>
            <ellipse cx="27" cy="12" rx="9" ry="5.5" transform="rotate(-40 27 12)" />
            <ellipse cx="15" cy="39" rx="8" ry="6" transform="rotate(-25 15 39)" />
            <ellipse cx="38" cy="54" rx="24" ry="18" transform="rotate(-38 38 54)" />
            <circle cx="47" cy="30" r="11.5" />
          </g>

          {/* upper slopes: brown */}
          <g fill={HIGH}>
            <ellipse cx="37" cy="53.5" rx="13" ry="7.5" transform="rotate(-38 37 53.5)" />
            <ellipse cx="47.5" cy="30.5" rx="7.5" ry="5.5" transform="rotate(-20 47.5 30.5)" />
          </g>

          {/* Kīlauea's lava field along the east rift, with a tongue down to the sea at Kalapana */}
          <path d="M57 54 C62 52 69 53 76 55 C80 56 83 59 86 64 L82 66 C78 62 74 60 70 60 C64 60 59 60 57 58 Z" fill={LAVA} />
          {px > 48 && <path d="M70 57 C75 58 80 60 84 65 L81 66 C78 62 74 60 69 59 Z" fill={LAVA_FRESH} />}
          {px > 120 && (
            <>
              {/* Kīlauea caldera with a glowing vent */}
              <ellipse cx="62" cy="57" rx="2.4" ry="1.6" fill={LAVA_FRESH} />
              <ellipse cx="62" cy="57" rx="1.1" ry="0.7" fill="#d45a3a" />
              {/* Hilo Bay, a shallow blue bite in the east coast */}
              <path d="M76 36 C78 38.5 81 39.5 85 39.8 C83 41 79 41.2 76 39.5 Z" fill={SEA} opacity="0.7" />
            </>
          )}

          {/* snow-tipped summits */}
          <ellipse cx="47" cy="30" rx="2.7" ry="1.9" transform="rotate(-20 47 30)" fill={SNOW} />
          <ellipse cx="36.5" cy="53" rx="2.6" ry="1.8" transform="rotate(-38 36.5 53)" fill={SNOW} />

          {/* a thin pale shoreline, painted inside the coast */}
          {px > 48 && <path d={ISLAND} fill="none" stroke={SHORE} strokeWidth="2" strokeLinejoin="round" opacity="0.85" />}
        </g>
      )}
    </svg>
  ),
};
