import type { Illustration } from '../types';

// Planck Length — measured axis: length (horizontal). A short shimmering span from x = 0 to x = 100,
// closed by end caps, with a glowing core, two interleaved shimmer waves and translucent
// "quantum foam" bubbles filling the band. aspect = 100 / H.
const H = 30;
const MID = H / 2;

const BASE = '#A78BFA';
const LIGHT = '#DDD6FE';
const PALE = '#F3F0FF';
const DARK = '#6D4FC2';
const DEEP = '#3F2E7A';

// Quantum foam bubbles: [cx, cy, r, opacity]
const FOAM: [number, number, number, number][] = [
  [9, 7, 3.2, 0.5], [16, 24, 2.4, 0.45], [24, 5, 2.0, 0.4], [31, 25.5, 3.4, 0.5],
  [38, 8, 2.6, 0.45], [45, 24, 2.0, 0.4], [52, 5.5, 3.0, 0.5], [60, 25, 2.6, 0.45],
  [67, 7, 2.2, 0.4], [74, 24.5, 3.2, 0.5], [82, 6, 2.6, 0.45], [90, 23, 2.2, 0.4],
  [5, 20, 1.6, 0.35], [95, 10, 1.6, 0.35],
];

// Tiny bright specks: [cx, cy, r]
const SPECKS: [number, number, number][] = [
  [12, 12, 0.5], [21, 19, 0.45], [35, 11, 0.5], [47, 20, 0.45], [58, 10, 0.5],
  [69, 19.5, 0.45], [79, 11.5, 0.5], [88, 18, 0.45],
];

// Four-point sparkles: [cx, cy, size]
const SPARKS: [number, number, number][] = [
  [28, 11, 1.8], [50, 15, 2.6], [72, 19, 1.8], [41, 20.5, 1.2], [61, 9.5, 1.2],
];

// A sine wave along the core, drawn as a smooth path of quadratic curves.
function wave(amp: number, period: number, phase: number, x0 = 0, x1 = 100): string {
  const step = period / 4;
  let d = `M${x0} ${(MID + amp * Math.sin((2 * Math.PI * (x0 + phase)) / period)).toFixed(2)}`;
  for (let x = x0; x < x1 - 0.001; x += step) {
    const xm = x + step / 2;
    const xe = Math.min(x + step, x1);
    const ym = MID + amp * Math.sin((2 * Math.PI * (xm + phase)) / period);
    const ye = MID + amp * Math.sin((2 * Math.PI * (xe + phase)) / period);
    // control point for a quadratic through the midpoint: 2*ym - (ys+ye)/2
    const ys = MID + amp * Math.sin((2 * Math.PI * (x + phase)) / period);
    const cy = 2 * ym - (ys + ye) / 2;
    d += ` Q${xm.toFixed(2)} ${cy.toFixed(2)} ${xe.toFixed(2)} ${ye.toFixed(2)}`;
  }
  return d;
}

const WAVE_A = wave(3.2, 14, 0, 3, 97);
const WAVE_B = wave(2.2, 10, 5, 3, 97);

const sparkle = (cx: number, cy: number, s: number): string =>
  `M${cx} ${cy - s} Q${cx} ${cy} ${cx + s} ${cy} Q${cx} ${cy} ${cx} ${cy + s} Q${cx} ${cy} ${cx - s} ${cy} Q${cx} ${cy} ${cx} ${cy - s} Z`;

export const art: Illustration = {
  id: 'planck',
  aspect: 100 / H,
  View: ({ uid, px }) => (
    <svg viewBox={`0 0 100 ${H}`} width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-glow`} cx="46%" cy="45%" r="50%">
          <stop offset="0%" stopColor={LIGHT} stopOpacity="0.5" />
          <stop offset="45%" stopColor={BASE} stopOpacity="0.28" />
          <stop offset="100%" stopColor={BASE} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-core`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={DARK} />
          <stop offset="22%" stopColor={BASE} />
          <stop offset="42%" stopColor={PALE} />
          <stop offset="60%" stopColor={LIGHT} />
          <stop offset="80%" stopColor={BASE} />
          <stop offset="100%" stopColor={DARK} />
        </linearGradient>
        <linearGradient id={`${uid}-cap`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={LIGHT} />
          <stop offset="100%" stopColor={DARK} />
        </linearGradient>
        <radialGradient id={`${uid}-foam`} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor={PALE} stopOpacity="0.9" />
          <stop offset="55%" stopColor={BASE} stopOpacity="0.35" />
          <stop offset="100%" stopColor={DEEP} stopOpacity="0.1" />
        </radialGradient>
      </defs>

      {/* soft halo filling the band */}
      <ellipse cx="50" cy={MID} rx="50" ry={MID} fill={`url(#${uid}-glow)`} />

      {/* quantum foam bubbles */}
      {px > 24 && (
        <g>
          {FOAM.map(([cx, cy, r, o], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill={`url(#${uid}-foam)`} opacity={o} />
          ))}
        </g>
      )}
      {px > 120 && (
        <g fill="none" stroke={LIGHT} strokeWidth="0.35" opacity="0.45">
          {FOAM.map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      )}

      {/* shimmer waves around the core */}
      {px > 40 && (
        <g fill="none" strokeLinecap="round">
          <path d={WAVE_A} stroke={DARK} strokeWidth="0.9" opacity="0.55" />
          <path d={WAVE_B} stroke={LIGHT} strokeWidth="0.7" opacity="0.7" />
        </g>
      )}

      {/* the measured span: core bar from x = 0 to x = 100 */}
      <rect
        x="0"
        y={px > 24 ? MID - 1.5 : MID - 2.5}
        width="100"
        height={px > 24 ? 3 : 5}
        rx={px > 24 ? 1.5 : 2.5}
        fill={`url(#${uid}-core)`}
      />
      {px > 24 && <rect x="14" y={MID - 0.45} width="72" height="0.9" rx="0.45" fill="#ffffff" opacity="0.75" />}

      {/* end caps */}
      <rect x="0" y="5" width="1.5" height="20" rx="0.75" fill={px > 24 ? `url(#${uid}-cap)` : LIGHT} />
      <rect x="98.5" y="5" width="1.5" height="20" rx="0.75" fill={px > 24 ? `url(#${uid}-cap)` : LIGHT} />
      {px > 40 && (
        <g fill={PALE}>
          <circle cx="0.75" cy={MID} r="1.6" />
          <circle cx="99.25" cy={MID} r="1.6" />
        </g>
      )}

      {/* specks and sparkles */}
      {px > 40 && (
        <g fill={PALE} opacity="0.85">
          {SPECKS.map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      )}
      {px > 120 && (
        <g fill="#ffffff" opacity="0.9">
          {SPARKS.map(([cx, cy, s], i) => (
            <path key={i} d={sparkle(cx, cy, s)} />
          ))}
        </g>
      )}
    </svg>
  ),
};
