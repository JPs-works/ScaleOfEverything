import type { Illustration } from '../types';

// Astronomical unit (Earth to Sun) — measured axis: distance (horizontal).
// A measured span from x = 0 (the Sun's left limb) to x = 100 (Earth's right limb):
// a small bright Sun disc at the left, a tiny blue Earth dot at the right, joined by a thin
// gold line with full-height end caps. aspect = width / height of the bounding box: 100 / 12.
const H = 12;
const MID = H / 2;

const BASE = '#FBBF24';
const LIGHT = '#FDE68A';
const PALE = '#FFF7D6';
const DARK = '#B45309';

const EARTH = '#3B82F6';
const EARTH_LIGHT = '#93C5FD';
const EARTH_DARK = '#1E3A8A';

// Endpoint radii grow as the rendering shrinks so the span still reads as "disc — line — dot".
// The Sun stays tangent to x = 0 and Earth tangent to x = 100 at every tier.
function radii(px: number) {
  if (px > 120) return { sun: 2.4, earth: 1.4, line: 0.6, tick: 0.7 };
  if (px > 24) return { sun: 3.2, earth: 2.0, line: 1.6, tick: 1.2 };
  return { sun: 4.5, earth: 3.2, line: 5, tick: 0 };
}

// Short corona rays around the Sun: [angle in degrees]
const RAYS = [-150, -110, -70, -30, 30, 70, 110, 150];

export const art: Illustration = {
  id: 'astronomical-unit',
  aspect: 100 / H,
  View: ({ uid, px }) => {
    const { sun: SUN_R, earth: EARTH_R, line: LINE_W, tick: TICK_W } = radii(px);
    const SUN_CX = SUN_R;
    const EARTH_CX = 100 - EARTH_R;
    return (
      <svg viewBox={`0 0 100 ${H}`} width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${uid}-sun`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={PALE} />
            <stop offset="45%" stopColor={LIGHT} />
            <stop offset="80%" stopColor={BASE} />
            <stop offset="100%" stopColor={DARK} />
          </radialGradient>
          <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="30%" stopColor={BASE} stopOpacity="0.35" />
            <stop offset="100%" stopColor={BASE} stopOpacity="0" />
          </radialGradient>
          {/* userSpaceOnUse: a horizontal line has a zero-height bounding box, so objectBoundingBox gradients would not paint */}
          <linearGradient id={`${uid}-span`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="0">
            <stop offset="0%" stopColor={PALE} />
            <stop offset="35%" stopColor={BASE} />
            <stop offset="100%" stopColor={LIGHT} />
          </linearGradient>
          <radialGradient id={`${uid}-earth`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={EARTH_LIGHT} />
            <stop offset="55%" stopColor={EARTH} />
            <stop offset="100%" stopColor={EARTH_DARK} />
          </radialGradient>
        </defs>

        {/* soft glow around the Sun (spills a little past x = 0, well under the 15% allowance) */}
        {px > 24 && <circle cx={SUN_CX} cy={MID} r={MID} fill={`url(#${uid}-halo)`} />}

        {/* the span: a thin line from Sun to Earth */}
        <line
          x1={SUN_CX}
          y1={MID}
          x2={EARTH_CX}
          y2={MID}
          stroke={px > 24 ? `url(#${uid}-span)` : BASE}
          strokeWidth={LINE_W}
          strokeLinecap="butt"
        />

        {/* end caps: full-height ticks at both extremes of the measured span */}
        {px > 24 && (
          <g stroke={LIGHT} strokeWidth={TICK_W} strokeLinecap="butt" opacity="0.85">
            <line x1="0.35" y1="0" x2="0.35" y2={H} />
            <line x1="99.65" y1="0" x2="99.65" y2={H} />
          </g>
        )}

        {/* faint midpoint tick, a quiet hint of measurement */}
        {px > 120 && (
          <line x1="50" y1={MID - 1.6} x2="50" y2={MID + 1.6} stroke={LIGHT} strokeWidth="0.4" opacity="0.5" />
        )}

        {/* corona rays */}
        {px > 120 && (
          <g stroke={LIGHT} strokeWidth="0.35" strokeLinecap="round" opacity="0.8">
            {RAYS.map((deg) => {
              const a = (deg * Math.PI) / 180;
              const r0 = SUN_R + 0.5;
              const r1 = SUN_R + 1.5;
              return (
                <line
                  key={deg}
                  x1={(SUN_CX + r0 * Math.cos(a)).toFixed(2)}
                  y1={(MID + r0 * Math.sin(a)).toFixed(2)}
                  x2={(SUN_CX + r1 * Math.cos(a)).toFixed(2)}
                  y2={(MID + r1 * Math.sin(a)).toFixed(2)}
                />
              );
            })}
          </g>
        )}

        {/* the Sun: tangent to x = 0 */}
        <circle cx={SUN_CX} cy={MID} r={SUN_R} fill={px > 24 ? `url(#${uid}-sun)` : LIGHT} />
        {px > 120 && <circle cx={SUN_CX - 0.7} cy={MID - 0.8} r="0.6" fill="#FFFFFF" opacity="0.8" />}

        {/* Earth: a tiny blue dot tangent to x = 100 */}
        <circle cx={EARTH_CX} cy={MID} r={EARTH_R} fill={px > 24 ? `url(#${uid}-earth)` : EARTH} />
        {px > 120 && <circle cx={EARTH_CX - 0.45} cy={MID - 0.5} r="0.35" fill="#FFFFFF" opacity="0.85" />}
      </svg>
    );
  },
};
