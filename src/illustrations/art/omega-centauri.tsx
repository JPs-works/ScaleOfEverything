import type { Illustration } from '../types';

// Omega Centauri — measured axis: diameter (horizontal). The star swarm spans x = 0 .. 100.
// A globular cluster: a round swarm of pale yellow-white pinpoints, densest at the core and thinning
// to the rim, sitting on a soft central glow that fades to nothing (no hard edge, no visible disc).
// The swarm is drawn as a few stroked paths of zero-length "M x y h.01" subpaths with round caps,
// so hundreds of dots cost a handful of elements. Two rim stars pin the measured extent.

// Deterministic pseudo-random so every render is identical.
function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALE = '#FFFBEA';
const CREAM = '#FFF3C4';
const GOLD = '#FDE68A';
const TINTS = [PALE, CREAM, GOLD];

interface Swarm {
  /** path data: one zero-length subpath per star */
  d: string;
  tint: string;
  /** dot diameter in viewBox units */
  w: number;
  o: number;
}

/**
 * Scatter `count` stars with a centre-heavy radial distribution and bucket them by tint and size.
 * `exp` controls the concentration (higher = denser core); `minDist`/`maxDist` bound the radius.
 */
function makeSwarm(count: number, seed: number, sizes: number[], exp: number, minDist: number, maxDist: number): Swarm[] {
  const rnd = mulberry(seed);
  const buckets = new Map<string, { d: string[]; tint: string; w: number }>();
  for (let i = 0; i < count; i++) {
    const u = rnd();
    const dist = minDist + (maxDist - minDist) * Math.pow(u, exp);
    const ang = rnd() * Math.PI * 2;
    const x = 50 + Math.cos(ang) * dist;
    const y = 50 + Math.sin(ang) * dist;
    // Smaller toward the rim.
    const edge = dist / maxDist;
    const sizeIdx = Math.min(sizes.length - 1, Math.floor(rnd() * sizes.length * (1 - edge * 0.5)));
    const tint = TINTS[Math.floor(rnd() * TINTS.length)];
    const key = `${tint}-${sizeIdx}`;
    let b = buckets.get(key);
    if (!b) {
      b = { d: [], tint, w: sizes[sizeIdx] };
      buckets.set(key, b);
    }
    b.d.push(`M${x.toFixed(1)} ${y.toFixed(1)}h.01`);
  }
  return [...buckets.values()].map((b) => ({ d: b.d.join(''), tint: b.tint, w: b.w, o: b.w < 0.8 ? 0.8 : 0.95 }));
}

// Rich: a dense core and a long tail of pinpoints out to the rim.
const RICH_CORE = makeSwarm(330, 7291, [0.6, 0.9, 1.3], 1.7, 0, 49.2);
// A few brighter foreground stars scattered through the halo.
const RICH_BRIGHT = makeSwarm(28, 4111, [1.7], 1.0, 8, 48.5);
// Mid (24 < px <= 120): fewer, fatter dots so the speckle survives at ~48 px.
const MID_CORE = makeSwarm(110, 7291, [1.6, 2.2], 1.6, 0, 48.5);
// A sparse ring of dots that keeps the rim legible at small sizes.
const MID_RING = makeSwarm(26, 9013, [2.0], 1.0, 38, 48.5);

// Two fixed rim stars pin the swarm to the measured edges x = 0 and x = 100.
const RIM = [
  { x: 1.1, y: 53, r: 1.1 },
  { x: 98.9, y: 47, r: 1.1 },
];

export const art: Illustration = {
  id: 'omega-centauri',
  aspect: 1,
  View: ({ uid, px }) => {
    const rich = px > 120;
    const mid = px > 24 && !rich;
    const tiny = px <= 24;
    const swarms = rich ? [...RICH_CORE, ...RICH_BRIGHT] : mid ? [...MID_CORE, ...MID_RING] : [];
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          {/* broad glow: centred, fading to fully transparent at the rim so there is no disc edge */}
          <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={CREAM} stopOpacity="0.95" />
            <stop offset="18%" stopColor={CREAM} stopOpacity="0.8" />
            <stop offset="40%" stopColor={GOLD} stopOpacity={tiny ? 0.6 : 0.42} />
            <stop offset="70%" stopColor={GOLD} stopOpacity={tiny ? 0.3 : 0.14} />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
          </radialGradient>
          {/* tight bright core */}
          <radialGradient id={`${uid}-core`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={PALE} stopOpacity="1" />
            <stop offset="45%" stopColor={CREAM} stopOpacity="0.7" />
            <stop offset="100%" stopColor={CREAM} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* the soft body: spans the full diameter x = 0 .. 100 but has no visible rim */}
        <circle cx="50" cy="50" r="50" fill={`url(#${uid}-glow)`} />
        <circle cx="50" cy="50" r={tiny ? 22 : 16} fill={`url(#${uid}-core)`} />
        {/* the star swarm: one path per tint/size, each subpath a round-capped dot */}
        {swarms.map((s, i) => (
          <path
            key={i}
            d={s.d}
            fill="none"
            stroke={s.tint}
            strokeWidth={s.w}
            strokeLinecap="round"
            opacity={s.o}
          />
        ))}
        {!tiny && RIM.map((s, i) => <circle key={`rim-${i}`} cx={s.x} cy={s.y} r={s.r} fill={GOLD} opacity="0.95" />)}
      </svg>
    );
  },
};
