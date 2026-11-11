import type { Illustration } from '../types';

// Burj Khalifa — measured axis: height (vertical). Spire tip touches y = 0, the podium floor y = 100.
// A stack of spiralling setback tiers narrowing to a long needle; the setbacks are offset a little
// left/right to hint at the Y-shaped plan rotating as it rises. Real proportions are very slender:
// a 22-unit-wide box for 100 units of height.
// aspect = width / height of the bounding box: 22 / 100.
const W = 22;

// Tiers from the top down: [x1, x2, y1, y2]. Each tier sits a little off-centre, alternating sides.
const TIERS: [number, number, number, number][] = [
  [9.7, 12.5, 26, 36],
  [9.1, 13.7, 36, 46],
  [7.5, 14.3, 46, 56],
  [6.9, 15.9, 56, 66],
  [5.1, 16.7, 66, 76],
  [4.1, 18.5, 76, 86],
  [2.3, 19.7, 86, 95],
];

// Whole silhouette as one path, used alone at tiny sizes and as a clip for the floor lines.
const SILHOUETTE = [
  // needle + spire
  'M10.75 0 L11.25 0 L11.5 10 L11.9 12 L11.9 26 L10.1 26 L10.1 12 L10.5 10 Z',
  // tiers
  ...TIERS.map(([x1, x2, y1, y2]) => `M${x1} ${y1} H${x2} V${y2} H${x1} Z`),
  // podium
  `M0 95 H${W} V100 H0 Z`,
].join(' ');

export const art: Illustration = {
  id: 'burj-khalifa',
  aspect: W / 100,
  View: ({ uid, px }) => (
    <svg viewBox={`0 0 ${W} 100`} width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* light from the upper-left: bright left edge, base grey mid, shaded right */}
        <linearGradient id={`${uid}-lit`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F3F4F6" />
          <stop offset="45%" stopColor="#D1D5DB" />
          <stop offset="100%" stopColor="#8B929C" />
        </linearGradient>
        <linearGradient id={`${uid}-spire`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F9FAFB" />
          <stop offset="50%" stopColor="#D1D5DB" />
          <stop offset="100%" stopColor="#7C838D" />
        </linearGradient>
        {/* sky reflection in the glass: cool blue, stronger at the top */}
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.06" />
        </linearGradient>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E5E7EB" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#E5E7EB" stopOpacity="0" />
        </radialGradient>
        {/* floor lines */}
        <pattern id={`${uid}-floors`} width="4" height="1.6" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="4" height="0.35" fill="#4B5563" opacity="0.45" />
        </pattern>
        <clipPath id={`${uid}-clip`}>
          <path d={SILHOUETTE} />
        </clipPath>
      </defs>

      {/* faint ground glow at the foot */}
      <ellipse cx={W / 2} cy="97" rx="12" ry="4" fill={`url(#${uid}-halo)`} />

      {px <= 24 ? (
        // tiny: one solid, light silhouette so it stays visible against the navy
        <path d={SILHOUETTE} fill="#DDE1E7" />
      ) : (
        <g>
          {/* podium */}
          <rect x="0" y="95" width={W} height="5" fill={`url(#${uid}-lit)`} />
          {/* tiers, each lit as its own volume */}
          {TIERS.map(([x1, x2, y1, y2]) => (
            <rect key={y1} x={x1} y={y1} width={x2 - x1} height={y2 - y1} fill={`url(#${uid}-lit)`} />
          ))}
          {/* spire body and needle */}
          <path d="M10.1 12 L10.5 10 L11.5 10 L11.9 12 L11.9 26 L10.1 26 Z" fill={`url(#${uid}-spire)`} />
          <path d="M10.75 0 L11.25 0 L11.5 10.2 L10.5 10.2 Z" fill="#E5E7EB" />

          {/* glass sky-tint over the whole tower */}
          <path d={SILHOUETTE} fill={`url(#${uid}-glass)`} />

          {/* the three wings: shaded vertical seams either side of the central core */}
          {TIERS.map(([x1, x2, y1, y2]) => {
            const w = x2 - x1;
            return (
              <g key={`seam-${y1}`}>
                <rect x={x1 + w * 0.34} y={y1} width={w * 0.07} height={y2 - y1} fill="#6B7280" opacity="0.35" />
                <rect x={x1 + w * 0.62} y={y1} width={w * 0.07} height={y2 - y1} fill="#6B7280" opacity="0.5" />
              </g>
            );
          })}

          {/* setback roofs catching the light */}
          {TIERS.map(([x1, x2, y1]) => (
            <rect key={`cap-${y1}`} x={x1} y={y1} width={x2 - x1} height="0.5" fill="#F9FAFB" opacity="0.9" />
          ))}
          <rect x="0" y="95" width={W} height="0.5" fill="#F9FAFB" opacity="0.9" />

          {px > 120 && (
            <g clipPath={`url(#${uid}-clip)`}>
              {/* floor lines */}
              <rect x="0" y="12" width={W} height="88" fill={`url(#${uid}-floors)`} />
              {/* lit left edge of each tier */}
              {TIERS.map(([x1, , y1, y2]) => (
                <rect key={`edge-${y1}`} x={x1} y={y1} width="0.35" height={y2 - y1} fill="#FFFFFF" opacity="0.6" />
              ))}
              {/* observation deck band near the top of the occupied floors */}
              <rect x="9.5" y="29" width="3.4" height="1.2" fill="#BFDBFE" opacity="0.8" />
            </g>
          )}
        </g>
      )}
    </svg>
  ),
};
