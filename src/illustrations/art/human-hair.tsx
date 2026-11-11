import type { Illustration } from '../types';

// Human hair — measured axis: width (horizontal). A short snipped segment of one strand stands upright,
// its cut face spanning x = 0..100 at the top. The shaft is a straight-edged cylinder in two tones
// (lit left, shadowed right) with one soft highlight stripe, a slim light cut face showing a soft
// medulla tone, and a small tight split at the bottom tip so it reads as hair rather than a barrel.
// Faint, sparse cuticle seams appear only when large. aspect = width / height: 100 / 150.
const BASE = '#D97706';
const LIGHT = '#F2A72E';
const PALE = '#FBD98A';
const DARK = '#9A5208';

// Cut face: a slim ellipse whose top rests on y = 0.
const TOP_CY = 8;
const TOP_RX = 50;
const TOP_RY = 8;
// Split end: a small notch whose apex sits well below the shaft's midpoint.
const APEX_Y = 130;
const SPLIT_L = 32;
const SPLIT_R = 68;

// Inner edges of the two prongs, meeting at a softly rounded apex.
const INNER_L = `C${SPLIT_L + 6} 141 ${SPLIT_L + 12} 134 48 ${APEX_Y + 0.6}`;
const INNER_R = `M52 ${APEX_Y + 0.6} C${SPLIT_R - 12} 134 ${SPLIT_R - 6} 141 ${SPLIT_R} 150`;

// Shaft silhouette, drawn clockwise from the top-left: the left edge runs straight down x = 0, turns
// across the left prong's foot, the inner edges rise to the apex and fall again, the right prong's foot
// returns to x = 100, and the right edge rises straight to the cut face, closing along the front rim.
const SHAFT =
  `M0 ${TOP_CY} L0 147 Q0 150 3 150 L${SPLIT_L} 150 ` +
  `${INNER_L} Q50 ${APEX_Y - 1.2} 52 ${APEX_Y + 0.6} ${INNER_R.slice(INNER_R.indexOf('C'))} ` +
  `L97 150 Q100 150 100 147 L100 ${TOP_CY} A${TOP_RX} ${TOP_RY} 0 0 1 0 ${TOP_CY} Z`;

// Cuticle edges: sparse, shallow, broken seams at irregular spacing, never a full ring.
const CUTICLE = [
  'M3 32 q11 1.3 22 0.2 M34 33 q13 -0.9 25 0.3',
  'M8 49 q12 -1 23 0.4 M58 48.5 q14 1.1 30 -0.2',
  'M3 66 q9 1.2 20 0.1 M40 65.4 q12 -1 22 0.5 M70 66.2 q10 0.8 26 -0.4',
  'M14 84 q13 0.9 26 -0.3 M60 83.4 q12 1.2 28 0.1',
  'M4 100 q10 -1.1 22 0.2 M46 100.6 q12 -0.8 24 0.3 M80 99.8 l17 -0.4',
];

export const art: Illustration = {
  id: 'human-hair',
  aspect: 100 / 150,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 150" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        {/* two bands with a soft seam: lit left, shadowed right */}
        <linearGradient id={`${uid}-shaft`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={LIGHT} />
          <stop offset="46%" stopColor={LIGHT} />
          <stop offset="58%" stopColor={BASE} />
          <stop offset="100%" stopColor={DARK} />
        </linearGradient>
        <linearGradient id={`${uid}-stripe`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={PALE} stopOpacity="0" />
          <stop offset="40%" stopColor={PALE} stopOpacity="0.7" />
          <stop offset="100%" stopColor={PALE} stopOpacity="0" />
        </linearGradient>
        {/* the split's inner faces: the left one shadowed, the right one catching light */}
        <linearGradient id={`${uid}-prongShade`} gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2={APEX_Y - 4}>
          <stop offset="0%" stopColor={DARK} stopOpacity="0.55" />
          <stop offset="100%" stopColor={DARK} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-prongLit`} gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2={APEX_Y - 4}>
          <stop offset="0%" stopColor={PALE} stopOpacity="0.5" />
          <stop offset="100%" stopColor={PALE} stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <path d={SHAFT} />
        </clipPath>
      </defs>

      {/* shaft with a small split at the tip */}
      <path d={SHAFT} fill={`url(#${uid}-shaft)`} />
      <g clipPath={`url(#${uid}-clip)`}>
        {/* soft highlight stripe on the lit side */}
        <rect x="9" y="0" width="12" height="150" fill={`url(#${uid}-stripe)`} />
        {/* shadow cast by the cut face onto the shaft just below the rim */}
        {px > 24 && <ellipse cx="50" cy={TOP_CY} rx={TOP_RX} ry={TOP_RY + 3} fill={DARK} opacity="0.18" />}
        {/* rounding on the split's inner edges */}
        {px > 24 && (
          <g fill="none" strokeWidth="4" strokeLinecap="round">
            <path d={`M${SPLIT_L} 150 ${INNER_L}`} stroke={`url(#${uid}-prongShade)`} />
            <path d={INNER_R} stroke={`url(#${uid}-prongLit)`} />
          </g>
        )}
        {/* faint cuticle texture only when large */}
        {px > 120 && (
          <g fill="none" stroke={DARK} strokeWidth="0.7" strokeLinecap="round" opacity="0.24">
            {CUTICLE.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        )}
      </g>

      {/* slim light cut face with a soft medulla tone */}
      <ellipse cx="50" cy={TOP_CY} rx={TOP_RX} ry={TOP_RY} fill={LIGHT} />
      <ellipse cx="50" cy={TOP_CY} rx={TOP_RX} ry={TOP_RY} fill="none" stroke={DARK} strokeWidth="0.6" opacity="0.8" />
      {px > 24 && <ellipse cx="50" cy={TOP_CY} rx="5" ry="1.3" fill={DARK} opacity="0.28" />}
    </svg>
  ),
};
