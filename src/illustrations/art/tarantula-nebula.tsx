import type { Illustration } from '../types';

// Tarantula Nebula — measured axis: diameter (horizontal). The gas spans x = 0..100; bounding box 100 x 87.
// Silhouette: a lopsided web of translucent rose/magenta gas. The dense white-blue cluster R136 sits well
// up-left of centre (38, 36) inside ONE irregular feathered body mass (a flat-centred radial gradient that only
// fades in its last quarter, plus four bulges filled with the same gradient so the rim is ragged, not a ring of
// discs). Eight filament "legs" grow out of the body: each is two feathered ellipse segments bent at a knee that
// sits 12-16 units off the root-tip line, so the segments run at clearly different angles; two legs end in a
// curled toe. Legs are longer down-right and shorter up-left. Dark cavities are punched into the body between
// the leg roots, and a few short pink loop arcs bridge neighbouring legs like web strands. Gradients only, no
// filters. Only halo-level opacity (<= 0.3) drifts past the box.
const BASE = '#EF6D8F';
const LIGHT = '#FFC1D2';
const DEEP = '#C94B74';
const DARK = '#7A2449';
const DUST = '#2A0E26';
const BLUE = '#9FD1FF';
const CORE = '#FFFFFF';
const CORE_BLUE = '#E6F2FF';

// R136, well up-left of the box centre
const CX = 38;
const CY = 36;

// the body mass: two elongated ellipses crossing at the cluster (so the mass is lumpy, not a disc) plus two
// low-opacity bulges whose centres sit on the rim: [cx, cy, rx, ry, rotate, opacity]
const BODY: [number, number, number, number, number, number][] = [
  [41, 39, 27, 21, -25, 1],
  [39, 41, 30, 16, 40, 0.7],
  [22, 34, 12, 8, -30, 0.45],
  [60, 54, 13, 8, -35, 0.45],
];

// legs: [rootX, rootY, kneeX, kneeY, tipX, tipY, halfWidth, toeX?, toeY?]. Two feathered ellipse segments (root
// to knee, knee to tip) at clearly different angles; a toe adds a short curl past the tip.
type Leg = [number, number, number, number, number, number, number, number?, number?];
const LEGS: Leg[] = [
  // left: out to x = 0, then curling up
  [26, 34, 13, 48, 1, 30, 3.6, 4, 20],
  // upper-left, short
  [30, 26, 11, 20, 12, 2, 3],
  // top: up to y = 0
  [43, 22, 57, 11, 46, 0, 3],
  // upper-right, medium
  [52, 30, 75, 33, 94, 7, 3.2],
  // right: out to x = 100
  [54, 40, 70, 57, 100, 52, 3.4],
  // lower-right: the longest leg, down to y = 87, then curling right
  [48, 50, 60, 76, 90, 87, 3.4, 98, 80],
  // bottom: down to y = 87
  [36, 52, 25, 72, 50, 87, 3.2],
  // lower-left: out to x = 0
  [28, 44, 8, 46, 0, 70, 3.2],
];

// a feathered segment from (x0, y0) to (x1, y1), stretched a little past each end so segments overlap at the knee
const segment = (x0: number, y0: number, x1: number, y1: number, hw: number, stretch: number) => {
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const rx = Math.hypot(x1 - x0, y1 - y0) / 2 + stretch;
  const rot = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
  return { cx, cy, rx, ry: hw, rot };
};

// short, wobbly pink loop arcs bridging neighbouring legs (bubble rims in the real nebula)
const LOOPS = [
  'M14 22 C22 10 34 14 40 8',
  'M76 36 C88 40 84 52 72 56',
  'M28 70 C34 82 48 78 58 76',
  'M12 50 C4 56 6 48 10 44',
];

// dark cavities punched into the body between the leg roots: [cx, cy, rx, ry, rotate, opacity]
const CAVITIES: [number, number, number, number, number, number][] = [
  [58, 46, 9, 5.5, -20, 0.9],
  [44, 58, 8, 5, 10, 0.85],
  [22, 40, 7, 4.5, 20, 0.8],
  [52, 18, 7, 4, 35, 0.75],
];

// R136: a tight knot of hot young stars
const CLUSTER: [number, number, number][] = [
  [38, 36, 1.3],
  [40.5, 34.5, 0.9],
  [36, 34.5, 0.85],
  [39.5, 38.5, 0.9],
  [35.5, 38, 0.75],
];

const FIELD_STARS: [number, number, number][] = [
  [8, 10, 0.5], [24, 6, 0.5], [66, 4, 0.55], [86, 18, 0.5], [96, 36, 0.5],
  [92, 70, 0.55], [72, 82, 0.5], [34, 80, 0.5], [6, 58, 0.45], [16, 76, 0.5],
  [80, 48, 0.5], [64, 66, 0.4],
];

export const art: Illustration = {
  id: 'tarantula-nebula',
  aspect: 100 / 87,
  View: ({ uid, px }) => {
    const tiny = px <= 24;
    return (
      <svg viewBox="0 0 100 87" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          {/* radial gradients are centred (r = 50%) so every ellipse feathers to nothing at its rim */}
          <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="30%" stopColor={DEEP} stopOpacity="0.22" />
            <stop offset="100%" stopColor={DEEP} stopOpacity="0" />
          </radialGradient>
          {/* body: flat across the first 70%, fading only in the last quarter, so bulges merge into one mass */}
          <radialGradient id={`${uid}-body`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={BASE} stopOpacity={tiny ? 1 : 0.88} />
            <stop offset="70%" stopColor={BASE} stopOpacity={tiny ? 0.98 : 0.8} />
            <stop offset="88%" stopColor={DEEP} stopOpacity={tiny ? 0.6 : 0.4} />
            <stop offset="100%" stopColor={DEEP} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-deep`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={DARK} stopOpacity="0.6" />
            <stop offset="100%" stopColor={DARK} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-light`} cx="42%" cy="40%" r="50%">
            <stop offset="0%" stopColor={LIGHT} stopOpacity="0.6" />
            <stop offset="100%" stopColor={LIGHT} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-core`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={CORE} stopOpacity="1" />
            <stop offset="20%" stopColor={CORE_BLUE} stopOpacity="0.92" />
            <stop offset="55%" stopColor={BLUE} stopOpacity="0.35" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-blue`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.42" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-dust`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={DUST} stopOpacity="0.95" />
            <stop offset="55%" stopColor={DUST} stopOpacity="0.7" />
            <stop offset="100%" stopColor={DUST} stopOpacity="0" />
          </radialGradient>
          {/* leg segments: feathered on every side, so the filament has no rim */}
          <radialGradient id={`${uid}-leg`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={BASE} stopOpacity="0.88" />
            <stop offset="60%" stopColor={BASE} stopOpacity="0.55" />
            <stop offset="100%" stopColor={DEEP} stopOpacity="0" />
          </radialGradient>
          {/* one core-centred gradient in user space: every strand dims with distance from the cluster */}
          <radialGradient id={`${uid}-web`} gradientUnits="userSpaceOnUse" cx={CX} cy={CY} r="70">
            <stop offset="0%" stopColor={LIGHT} stopOpacity="0.85" />
            <stop offset="45%" stopColor={BASE} stopOpacity="0.55" />
            <stop offset="100%" stopColor={DEEP} stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {/* faint outer haze: opacity <= 0.22, the only thing allowed to drift past the box */}
        <ellipse cx="46" cy="42" rx="56" ry="48" fill={`url(#${uid}-halo)`} />

        {/* ---- gas body: one lumpy feathered mass, no outline anywhere ---- */}
        {BODY.map(([cx, cy, rx, ry, rot, o], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot} ${cx} ${cy})`} fill={`url(#${uid}-body)`} opacity={o} />
        ))}

        {/* ---- spider legs: bent, feathered filament masses growing out of the body ---- */}
        {LEGS.map(([x0, y0, kx, ky, x1, y1, hw, tx, ty], i) => {
          const a = segment(x0, y0, kx, ky, tiny ? hw * 1.6 : hw, 4);
          const b = segment(kx, ky, x1, y1, tiny ? hw * 1.2 : hw * 0.7, 2.5);
          const toe = tx !== undefined && ty !== undefined ? segment(x1, y1, tx, ty, tiny ? hw * 0.9 : hw * 0.45, 1.5) : null;
          return (
            <g key={i} fill={`url(#${uid}-leg)`}>
              <ellipse cx={a.cx} cy={a.cy} rx={a.rx} ry={a.ry} transform={`rotate(${a.rot} ${a.cx} ${a.cy})`} />
              <ellipse cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} transform={`rotate(${b.rot} ${b.cx} ${b.cy})`} opacity="0.92" />
              {toe && <ellipse cx={toe.cx} cy={toe.cy} rx={toe.rx} ry={toe.ry} transform={`rotate(${toe.rot} ${toe.cx} ${toe.cy})`} opacity="0.85" />}
            </g>
          );
        })}

        {/* deeper, dimmer gas away from the upper-left light: lower-right of the body */}
        <ellipse cx="58" cy="54" rx="18" ry="11" transform="rotate(-30 58 54)" fill={`url(#${uid}-deep)`} />
        <ellipse cx="40" cy="62" rx="14" ry="7" transform="rotate(15 40 62)" fill={`url(#${uid}-deep)`} opacity="0.7" />

        {!tiny && (
          <>
            {/* dark cavities between the leg roots */}
            {CAVITIES.map(([cx, cy, rx, ry, rot, o], i) => (
              <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot} ${cx} ${cy})`} fill={`url(#${uid}-dust)`} opacity={o} />
            ))}

            {/* curved filament spines bent through each knee, brightest near the cluster */}
            <g fill="none" stroke={`url(#${uid}-web)`} strokeLinecap="round" strokeWidth="1.3" opacity="0.6">
              {LEGS.map(([x0, y0, kx, ky, x1, y1], i) => (
                <path key={i} d={`M${x0} ${y0} C${kx} ${ky} ${kx} ${ky} ${x1} ${y1}`} />
              ))}
            </g>

            {/* lighter gas near the cluster, pulled toward the upper-left light */}
            <ellipse cx="32" cy="30" rx="16" ry="9" transform="rotate(-30 32 30)" fill={`url(#${uid}-light)`} opacity="0.7" />
            <ellipse cx="46" cy="42" rx="13" ry="7" transform="rotate(-30 46 42)" fill={`url(#${uid}-light)`} opacity="0.45" />
          </>
        )}

        {px > 120 && (
          <g fill="none" stroke={`url(#${uid}-web)`} strokeLinecap="round" strokeWidth="1.1" opacity="0.45">
            {/* pink loop arcs bridging neighbouring legs */}
            {LOOPS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        )}

        {/* blue reflection haze around the hot cluster */}
        <ellipse cx="36" cy="34" rx="20" ry="14" transform="rotate(-25 36 34)" fill={`url(#${uid}-blue)`} opacity="0.7" />

        {/* R136: bright white-blue core */}
        <ellipse cx={CX} cy={CY} rx={tiny ? 17 : 13} ry={tiny ? 13 : 10} transform={`rotate(-25 ${CX} ${CY})`} fill={`url(#${uid}-core)`} />
        <circle cx={CX} cy={CY} r="5.5" fill={`url(#${uid}-core)`} />

        {!tiny && (
          <g fill={CORE}>
            {CLUSTER.map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} />
            ))}
          </g>
        )}

        {px > 120 && (
          <g fill={CORE} opacity="0.85">
            {FIELD_STARS.map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} />
            ))}
          </g>
        )}
      </svg>
    );
  },
};
