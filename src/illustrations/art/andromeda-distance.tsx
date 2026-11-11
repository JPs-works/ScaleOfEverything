import type { Illustration } from '../types';

// Distance to Andromeda (Milky Way to M31) — measured axis: distance (horizontal).
// A measured span from x = 0 (the Milky Way's left edge) to x = 100 (Andromeda's right edge):
// a tiny face-on violet spiral at the left (~4 wide), a tilted blue-white spiral at the right
// (~9 wide), joined by a thin pale-blue dimension bar with full-height end caps. The bar fades
// toward the middle to suggest the 2.5 million light-years of nothing in between.
// aspect = width / height of the bounding box: 100 / 12.
// Palette built from #8aa4e8: highlight #c7d4f7, base #8aa4e8, shade #5a73c4.
const H = 12;
const MID = H / 2;

const BASE = '#8aa4e8';
const LIGHT = '#c7d4f7';
const DARK = '#5a73c4';
const DEEP = '#34488f';

// Milky Way: violet, seen face-on
const MW = '#a98cf0';
const MW_LIGHT = '#dccfff';
const MW_DARK = '#6d4fc9';
const MW_CORE = '#f6f0ff';

// Andromeda: blue-white disc with a warm yellowish core
const AND = '#c3d3fa';
const AND_LIGHT = '#eef3ff';
const AND_CORE = '#fff4dc';
const AND_DARK = '#6f86d4';

// Milky Way face-on radius (4% of the span); a touch larger when tiny so the dot survives.
const MW_R = 2;
const MW_R_SMALL = 2.6;
const MW_CX = MW_R;

// Andromeda: face-on radius 4.5 (9% of the span), squashed to 36% and tilted -25°.
const AND_R = 4.5;
const AND_TILT = 0.36;
const AND_ROT = -25;
// Horizontal half-extent of the rotated ellipse so its right limb is tangent to x = 100.
const rotRad = (AND_ROT * Math.PI) / 180;
const AND_HALF_W = Math.sqrt(
  (AND_R * Math.cos(rotRad)) ** 2 + (AND_R * AND_TILT * Math.sin(rotRad)) ** 2,
);
const AND_CX = 100 - AND_HALF_W;
// Left limb of the tilted ellipse, where the span bar ends.
const AND_LEFT = AND_CX - AND_HALF_W;
const AND_R_SMALL = 4.6; // when tiny: a plain squashed ellipse, no rotation

/** Logarithmic spiral arm about the origin, in unit-radius face-on coordinates. */
function arm(phase: number, r0: number, r1: number, turns: number): string {
  const thetaMax = turns * Math.PI * 2;
  const b = Math.log(r1 / r0) / thetaMax;
  const pts: string[] = [];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const t = (thetaMax * i) / steps;
    const r = r0 * Math.exp(b * t);
    pts.push(`${(r * Math.cos(t + phase)).toFixed(2)} ${(r * Math.sin(t + phase)).toFixed(2)}`);
  }
  return `M${pts.join(' L')}`;
}

// Arms drawn in unit-radius space (r = 1 is the disc edge) and scaled per galaxy.
const MW_ARM_A = arm(0, 0.3, 0.98, 0.65);
const MW_ARM_B = arm(Math.PI, 0.3, 0.98, 0.65);
const AND_ARM_A = arm(0.4, 0.28, 0.97, 0.8);
const AND_ARM_B = arm(Math.PI + 0.4, 0.28, 0.97, 0.8);
const AND_DUST_A = arm(0.75, 0.3, 0.96, 0.8);
const AND_DUST_B = arm(Math.PI + 0.75, 0.3, 0.96, 0.8);

// A few faint background stars scattered along the dark gulf between the galaxies: [x, y, r]
const STARS: [number, number, number][] = [
  [12, 2.1, 0.26],
  [23, 9.8, 0.2],
  [35, 1.5, 0.22],
  [48, 10.3, 0.26],
  [57, 2.6, 0.18],
  [70, 9.4, 0.24],
  [81, 1.8, 0.2],
];

export const art: Illustration = {
  id: 'andromeda-distance',
  aspect: 100 / H,
  View: ({ uid, px }) => {
    const tiny = px <= 24;
    const rich = px > 120;
    const mwR = tiny ? MW_R_SMALL : MW_R;
    const mwCx = tiny ? mwR : MW_CX;
    const barStart = mwCx + mwR;
    const barEnd = tiny ? 100 - AND_R_SMALL * 2 : AND_LEFT;
    // The span bar: drawn as a rect (not a zero-height line) so its gradient always renders.
    const small = px <= 64;
    const barH = rich ? 0.9 : tiny ? 4.5 : small ? 2.2 : 1.4;

    return (
      <svg viewBox={`0 0 100 ${H}`} width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${uid}-mwhalo`} cx="50%" cy="50%" r="50%">
            <stop offset="30%" stopColor={MW} stopOpacity="0.35" />
            <stop offset="100%" stopColor={MW} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-andhalo`} cx="50%" cy="50%" r="50%">
            <stop offset="35%" stopColor={AND} stopOpacity="0.32" />
            <stop offset="100%" stopColor={AND} stopOpacity="0" />
          </radialGradient>
          {/* Milky Way disc: bright violet core fading to a dim rim, highlight toward the upper-left */}
          <radialGradient id={`${uid}-mwdisc`} cx="42%" cy="40%" r="60%">
            <stop offset="0%" stopColor={MW_LIGHT} />
            <stop offset="45%" stopColor={MW} />
            <stop offset="100%" stopColor={MW_DARK} stopOpacity="0.55" />
          </radialGradient>
          {/* Andromeda disc: warm core, blue-white body, dark blue limb */}
          <radialGradient id={`${uid}-anddisc`} cx="42%" cy="40%" r="60%">
            <stop offset="0%" stopColor={AND_CORE} />
            <stop offset="30%" stopColor={AND} />
            <stop offset="100%" stopColor={AND_DARK} stopOpacity="0.6" />
          </radialGradient>
          {/* userSpaceOnUse: an objectBoundingBox gradient on a flat bar would collapse.
              The bar thins out in the middle to suggest the emptiness between galaxies. */}
          <linearGradient
            id={`${uid}-span`}
            gradientUnits="userSpaceOnUse"
            x1={barStart}
            x2={barEnd}
            y1={MID}
            y2={MID}
          >
            <stop offset="0%" stopColor={LIGHT} stopOpacity="0.95" />
            <stop offset="15%" stopColor={BASE} stopOpacity="0.9" />
            <stop offset="50%" stopColor={DARK} stopOpacity="0.45" />
            <stop offset="85%" stopColor={BASE} stopOpacity="0.9" />
            <stop offset="100%" stopColor={LIGHT} stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* soft glows around both galaxies (spill a little past the ends, well under the 15% allowance) */}
        {!tiny && <circle cx={mwCx} cy={MID} r={MID * 0.7} fill={`url(#${uid}-mwhalo)`} />}
        {!tiny && <ellipse cx={AND_CX} cy={MID} rx={AND_HALF_W * 1.25} ry={MID} fill={`url(#${uid}-andhalo)`} />}

        {/* the span: a thin bar from the Milky Way to Andromeda, fading toward the middle */}
        <rect
          x={barStart}
          y={MID - barH / 2}
          width={barEnd - barStart}
          height={barH}
          fill={tiny ? LIGHT : `url(#${uid}-span)`}
        />

        {/* end caps: full-height ticks at both extremes of the measured span */}
        {!tiny && (
          <g stroke={LIGHT} strokeWidth={rich ? 0.7 : 1.1} strokeLinecap="butt" opacity="0.85">
            <line x1="0.35" y1="0" x2="0.35" y2={H} />
            <line x1="99.65" y1="0" x2="99.65" y2={H} />
          </g>
        )}

        {/* faint ticks every half-million light-years: Andromeda lies ~2.5 Mly away */}
        {rich && (
          <g stroke={LIGHT} strokeWidth="0.35" opacity="0.5">
            {[1, 2, 3, 4].map((n) => {
              const x = barStart + ((barEnd - barStart) * n) / 5;
              return <line key={n} x1={x.toFixed(2)} y1={MID - 1.3} x2={x.toFixed(2)} y2={MID + 1.3} />;
            })}
          </g>
        )}

        {/* a few faint background stars in the gulf between */}
        {rich && (
          <g fill={LIGHT} opacity="0.55">
            {STARS.map(([x, y, r]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
            ))}
          </g>
        )}

        {/* ---- the Milky Way: a tiny face-on violet spiral tangent to x = 0 ---- */}
        {tiny ? (
          <circle cx={mwCx} cy={MID} r={mwR} fill={MW_LIGHT} />
        ) : (
          <g transform={`translate(${mwCx} ${MID})`}>
            <circle r={MW_R} fill={`url(#${uid}-mwdisc)`} />
            {/* two arms, drawn in unit space and scaled to the disc */}
            <g transform={`scale(${MW_R})`} fill="none" stroke={MW_LIGHT} strokeLinecap="round">
              <path d={MW_ARM_A} strokeWidth={rich ? 0.14 : 0.22} opacity={rich ? 0.75 : 0.6} />
              <path d={MW_ARM_B} strokeWidth={rich ? 0.14 : 0.22} opacity={rich ? 0.6 : 0.5} />
            </g>
            {/* central bar and bright bulge */}
            {rich && <ellipse rx="0.7" ry="0.28" transform="rotate(-30)" fill={MW_LIGHT} opacity="0.9" />}
            <circle cx="-0.1" cy="-0.1" r={rich ? 0.3 : 0.5} fill={MW_CORE} />
          </g>
        )}

        {/* ---- Andromeda: a tilted blue-white spiral tangent to x = 100 ---- */}
        {tiny ? (
          <ellipse cx={100 - AND_R_SMALL} cy={MID} rx={AND_R_SMALL} ry={AND_R_SMALL * 0.45} fill={AND_LIGHT} />
        ) : (
          <g transform={`translate(${AND_CX} ${MID}) rotate(${AND_ROT})`}>
            {/* the disc, squashed to a thin ellipse */}
            <g transform={`scale(1 ${AND_TILT})`}>
              <circle r={AND_R} fill={`url(#${uid}-anddisc)`} />
              {/* arms and dust lanes in unit space, scaled to the disc then foreshortened with it */}
              <g transform={`scale(${AND_R})`} fill="none" strokeLinecap="round">
                {rich && (
                  <g stroke={DEEP} strokeWidth="0.09" opacity="0.45">
                    <path d={AND_DUST_A} />
                    <path d={AND_DUST_B} />
                  </g>
                )}
                <g stroke={AND_LIGHT} strokeWidth={rich ? 0.11 : 0.2}>
                  <path d={AND_ARM_A} opacity={rich ? 0.8 : 0.65} />
                  <path d={AND_ARM_B} opacity={rich ? 0.65 : 0.55} />
                </g>
              </g>
            </g>
            {/* warm bulge, lit from the upper-left */}
            <ellipse cx="-0.15" cy="-0.1" rx={rich ? 0.9 : 1.1} ry={rich ? 0.45 : 0.55} fill={AND_CORE} opacity="0.95" />
            {rich && <circle cx="-0.3" cy="-0.2" r="0.28" fill="#ffffff" opacity="0.9" />}
            {/* the two little companions, M32 below the disc and M110 above it */}
            {rich && (
              <g fill={AND} opacity="0.85">
                <circle cx="1.2" cy="1.9" r="0.28" />
                <circle cx="-2.4" cy="-2.1" r="0.36" />
              </g>
            )}
          </g>
        )}
      </svg>
    );
  },
};
