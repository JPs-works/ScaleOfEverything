import type { Illustration } from '../types';

// Distance to Proxima Centauri (Sun to the nearest other star) — measured axis: distance (horizontal).
// A measured span from x = 0 (the Sun's left limb) to x = 100 (Proxima's right limb): a small yellow
// Sun disc at the left, a smaller dim red dwarf at the right, joined by a thin red dimension bar
// with full-height end caps. aspect = width / height of the bounding box: 100 / 12.
// Palette built from #FCA5A5: highlight #FEE2E2, base #FCA5A5, shade #B91C1C.
const H = 12;
const MID = H / 2;

const BASE = '#FCA5A5';
const LIGHT = '#FEE2E2';
const DARK = '#B91C1C';
const DEEP = '#7F1D1D';

const SUN = '#FBBF24';
const SUN_LIGHT = '#FDE68A';
const SUN_PALE = '#FFF7D6';

// Sun: tangent to x = 0 (a touch larger when tiny so the bright dot survives at 14 px).
const SUN_R = 2.4;
const SUN_R_SMALL = 3;
// Proxima: a red dwarf, far smaller than the Sun, tangent to x = 100.
const PROX_R = 1.3;
const PROX_R_SMALL = 2;

// Short corona rays around the Sun: [angle in degrees]
const RAYS = [-150, -110, -70, -30, 30, 70, 110, 150];

// A few faint background stars scattered along the dark gulf between the two suns: [x, y, r]
const STARS: [number, number, number][] = [
  [14, 2.2, 0.28],
  [27, 9.6, 0.22],
  [41, 1.6, 0.2],
  [56, 10.2, 0.26],
  [63, 2.8, 0.18],
  [78, 9.1, 0.24],
  [88, 1.9, 0.2],
];

export const art: Illustration = {
  id: 'proxima-centauri-distance',
  aspect: 100 / H,
  View: ({ uid, px }) => {
    const tiny = px <= 24;
    const rich = px > 120;
    const sunR = tiny ? SUN_R_SMALL : SUN_R;
    const sunCx = sunR;
    const proxR = tiny ? PROX_R_SMALL : PROX_R;
    const proxCx = 100 - proxR;
    // The span bar: drawn as a rect (not a zero-height line) so its gradient always renders.
    const barH = rich ? 0.9 : tiny ? 3.5 : 1.4;

    return (
      <svg viewBox={`0 0 100 ${H}`} width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${uid}-sunhalo`} cx="50%" cy="50%" r="50%">
            <stop offset="30%" stopColor={SUN} stopOpacity="0.35" />
            <stop offset="100%" stopColor={SUN} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-proxhalo`} cx="50%" cy="50%" r="50%">
            <stop offset="30%" stopColor={BASE} stopOpacity="0.35" />
            <stop offset="100%" stopColor={BASE} stopOpacity="0" />
          </radialGradient>
          {/* userSpaceOnUse: an objectBoundingBox gradient on a flat bar would collapse */}
          <linearGradient
            id={`${uid}-span`}
            gradientUnits="userSpaceOnUse"
            x1={sunCx}
            x2={proxCx}
            y1={MID}
            y2={MID}
          >
            <stop offset="0%" stopColor={SUN_LIGHT} />
            <stop offset="20%" stopColor={BASE} />
            <stop offset="100%" stopColor={BASE} />
          </linearGradient>
        </defs>

        {/* soft glows around both stars (spill a little past the ends, well under the 15% allowance) */}
        {!tiny && <circle cx={sunCx} cy={MID} r={MID} fill={`url(#${uid}-sunhalo)`} />}
        {!tiny && <circle cx={proxCx} cy={MID} r={MID * 0.75} fill={`url(#${uid}-proxhalo)`} />}

        {/* the span: a thin bar from the Sun to Proxima */}
        <rect
          x={sunCx}
          y={MID - barH / 2}
          width={proxCx - sunCx}
          height={barH}
          fill={rich ? `url(#${uid}-span)` : BASE}
        />

        {/* end caps: full-height ticks at both extremes of the measured span */}
        {!tiny && (
          <g stroke={LIGHT} strokeWidth={rich ? 0.7 : 1.1} strokeLinecap="butt" opacity="0.85">
            <line x1="0.35" y1="0" x2="0.35" y2={H} />
            <line x1="99.65" y1="0" x2="99.65" y2={H} />
          </g>
        )}

        {/* faint light-year ticks: Proxima lies ~4.25 ly away, so one tick per light-year */}
        {rich && (
          <g stroke={LIGHT} strokeWidth="0.35" opacity="0.55">
            {[1, 2, 3, 4].map((ly) => {
              const x = sunCx + ((proxCx - sunCx) * ly) / 4.25;
              return <line key={ly} x1={x.toFixed(2)} y1={MID - 1.4} x2={x.toFixed(2)} y2={MID + 1.4} />;
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

        {/* corona rays around the Sun */}
        {rich && (
          <g stroke={SUN_LIGHT} strokeWidth="0.35" strokeLinecap="round" opacity="0.8">
            {RAYS.map((deg) => {
              const a = (deg * Math.PI) / 180;
              const r0 = SUN_R + 0.5;
              const r1 = SUN_R + 1.5;
              return (
                <line
                  key={deg}
                  x1={(sunCx + r0 * Math.cos(a)).toFixed(2)}
                  y1={(MID + r0 * Math.sin(a)).toFixed(2)}
                  x2={(sunCx + r1 * Math.cos(a)).toFixed(2)}
                  y2={(MID + r1 * Math.sin(a)).toFixed(2)}
                />
              );
            })}
          </g>
        )}

        {/* the Sun: a flat disc tangent to x = 0, with a lighter offset crescent toward the upper-left */}
        <circle cx={sunCx} cy={MID} r={sunR} fill={tiny ? SUN_LIGHT : SUN} />
        {!tiny && <circle cx={sunCx - 0.45} cy={MID - 0.45} r={SUN_R * 0.7} fill={SUN_LIGHT} />}
        {rich && <circle cx={sunCx - 0.8} cy={MID - 0.8} r="0.7" fill={SUN_PALE} />}

        {/* Proxima Centauri: a small flat red dwarf tangent to x = 100 */}
        <circle cx={proxCx} cy={MID} r={proxR} fill={tiny ? BASE : DARK} />
        {!tiny && <circle cx={proxCx - 0.25} cy={MID - 0.25} r={PROX_R * 0.72} fill={BASE} />}
        {rich && (
          <g>
            {/* a couple of dark starspots — red dwarfs are famously spotty */}
            <circle cx={proxCx + 0.3} cy={MID + 0.25} r="0.2" fill={DEEP} opacity="0.7" />
            <circle cx={proxCx - 0.35} cy={MID + 0.5} r="0.14" fill={DEEP} opacity="0.6" />
            {/* small lighter highlight toward the upper-left */}
            <circle cx={proxCx - 0.5} cy={MID - 0.5} r="0.3" fill={LIGHT} />
          </g>
        )}
      </svg>
    );
  },
};
