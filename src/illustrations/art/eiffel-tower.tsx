import type { Illustration } from '../types';

// Eiffel Tower — measured axis: height (vertical). Antenna tip touches y = 0, the feet y = 100.
// Real proportions: 125 m across the base for 330 m to the antenna tip, so a 38-unit-wide box
// for 100 units of height. Floors sit at their true heights (57 m, 115 m, 276 m -> y 83, 65, 16).
// Three stacked wrought-iron volumes (legs with the great arch, mid section, upper pylon) carry
// the lattice as thin dark struts and two zigzag braces per section, clipped to the silhouette.
// aspect = width / height of the bounding box: 38 / 100.
const W = 38;
const CX = W / 2;

// Lower section: four splayed legs seen as two, joined by the arch (apex 39 m -> y 88).
const LEGS = `M0 100 Q5 91 7.5 84 L${W - 7.5} 84 Q${W - 5} 91 ${W} 100 L${W - 7.5} 100 A11.5 12 0 0 0 7.5 100 Z`;
// Mid section between first and second floors.
const MID = `M7.5 81.5 Q11 72 12.5 65 L${W - 12.5} 65 Q${W - 11} 72 ${W - 7.5} 81.5 Z`;
// Upper pylon between second floor and summit platform.
const UPPER = `M12.5 64 C14.5 50 17 32 17.5 17 L${W - 17.5} 17 C${W - 17} 32 ${W - 14.5} 50 ${W - 12.5} 64 Z`;
const SILHOUETTE = `${LEGS} ${MID} ${UPPER}`;

// Zigzag braces: alternating left/right edge points, mirrored for the second direction.
const mirror = (pts: [number, number][]) => pts.map(([x, y]) => [W - x, y] as [number, number]);
const toPoints = (pts: [number, number][]) => pts.map(([x, y]) => `${x},${y}`).join(' ');

const UPPER_ZIG: [number, number][] = [
  [12.5, 64], [25, 58], [13.6, 52], [23.7, 46], [15, 40], [22.3, 34], [16.3, 28], [21, 22], [17.5, 17],
];
const MID_ZIG: [number, number][] = [[7.5, 81.5], [28.8, 76], [10.8, 71], [25.5, 65]];
const LEFT_LEG_ZIG: [number, number][] = [[0, 100], [8.2, 96], [3.5, 92], [10.4, 88], [7, 84]];
const LEFT_LEG_ZIG_B: [number, number][] = [[7.5, 100], [1.8, 96], [10.4, 92], [5.5, 88], [15, 84]];

// Horizontal struts across every section, as one multi-subpath line.
const STRUTS = [
  'M13.1 58H24.9', 'M13.8 52H24.2', 'M14.4 46H23.6', 'M15.1 40H22.9', 'M15.7 34H22.3', 'M16.3 28H21.7', 'M17 22H21',
  'M9.3 76H28.7', 'M11 71H27',
  'M1.8 96H8.2', `M${W - 8.2} 96H${W - 1.8}`, 'M3.5 92H10.4', `M${W - 10.4} 92H${W - 3.5}`, 'M7 88H31',
].join(' ');

export const art: Illustration = {
  id: 'eiffel-tower',
  aspect: W / 100,
  View: ({ uid, px }) => {
    const tiny = px < 24;
    return (
      <svg viewBox={`0 0 ${W} 100`} width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          {/* light from the upper-left: bright left flank, base grey mid, shaded right */}
          <linearGradient id={`${uid}-iron`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D9DDE3" />
            <stop offset="45%" stopColor="#9CA3AF" />
            <stop offset="100%" stopColor="#6B7280" />
          </linearGradient>
          <linearGradient id={`${uid}-deck`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E5E7EB" />
            <stop offset="50%" stopColor="#B6BCC6" />
            <stop offset="100%" stopColor="#7C838D" />
          </linearGradient>
          <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D1D5DB" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#D1D5DB" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`${uid}-clip`}>
            <path d={SILHOUETTE} />
          </clipPath>
        </defs>

        {/* faint ground glow at the feet */}
        <ellipse cx={CX} cy="97" rx="20" ry="4" fill={`url(#${uid}-halo)`} />

        {/* antenna — widened when tiny so the needle still reads */}
        <rect x={tiny ? CX - 1.25 : CX - 0.5} y="0" width={tiny ? 2.5 : 1} height="13" fill="#D1D5DB" />
        {!tiny && <circle cx={CX} cy="0.8" r="0.8" fill="#F3F4F6" />}

        {/* iron body: three stacked volumes */}
        <path d={SILHOUETTE} fill={`url(#${uid}-iron)`} />

        {/* summit cabin and the three platforms, each catching the light on top */}
        <rect x={CX - 2} y="12.5" width="4" height="3.2" fill={`url(#${uid}-deck)`} />
        <rect x={CX - 3.75} y="15.3" width="7.5" height="2.2" fill={`url(#${uid}-deck)`} />
        <rect x={CX - 8.75} y="63.3" width="17.5" height="2.4" fill={`url(#${uid}-deck)`} />
        <rect x={CX - 14} y="81" width="28" height="3" fill={`url(#${uid}-deck)`} />
        {!tiny && (
          <g fill="#F3F4F6" opacity="0.85">
            <rect x={CX - 3.75} y="15.3" width="7.5" height="0.5" />
            <rect x={CX - 8.75} y="63.3" width="17.5" height="0.5" />
            <rect x={CX - 14} y="81" width="28" height="0.5" />
          </g>
        )}

        {px > 120 && (
          <g clipPath={`url(#${uid}-clip)`} fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* dark lattice struts and braces */}
            <g stroke="#4B5563" strokeWidth="0.45" opacity="0.6">
              <path d={STRUTS} />
              <polyline points={toPoints(UPPER_ZIG)} />
              <polyline points={toPoints(mirror(UPPER_ZIG))} />
              <polyline points={toPoints(MID_ZIG)} />
              <polyline points={toPoints(mirror(MID_ZIG))} />
              <polyline points={toPoints(LEFT_LEG_ZIG)} />
              <polyline points={toPoints(LEFT_LEG_ZIG_B)} />
              <polyline points={toPoints(mirror(LEFT_LEG_ZIG))} />
              <polyline points={toPoints(mirror(LEFT_LEG_ZIG_B))} />
            </g>
            {/* decorative arch lace under the first floor, and lit outer edges */}
            <g stroke="#F3F4F6" strokeWidth="0.5" opacity="0.6">
              <path d={`M9 100 A10 10.5 0 0 1 ${W - 9} 100`} />
              <path d="M0.4 100 Q5.3 91 7.9 84" />
              <path d="M7.9 81.5 Q11.3 72 12.9 65" />
              <path d="M12.9 64 C14.9 50 17.4 32 17.9 17" />
            </g>
          </g>
        )}
      </svg>
    );
  },
};
