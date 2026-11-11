import type { Illustration } from '../types';

// Laniakea — measured axis: diameter (horizontal). The oval web spans x = 0..100.
// Our home supercluster is defined by flow: galaxies streaming toward a common point (the Great
// Attractor). Drawn as a feathery oval of thin indigo filaments, each a gently curling streamline
// from the rim toward a slightly off-centre bright core, with small galaxy dots strung along them.
// Strokes share one user-space radial gradient centred on the attractor, so every filament
// brightens as it converges. Light from the upper-left; a deeper indigo tint at the lower-right.
// aspect = width / height of the bounding box: 100 / 72.
const W = 100;
const H = 72;
const CX = 50;
const CY = 36;
const RX = 50;
const RY = 36;
// The attractor sits a little right of and below the oval's centre.
const AX = 57;
const AY = 39;

// Small deterministic PRNG so every render draws the same web.
const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

type Pt = { x: number; y: number };
type Curve = { p0: Pt; p1: Pt; p2: Pt; p3: Pt };

const f = (n: number) => n.toFixed(2);

// One cubic streamline from a rim point toward the attractor, bending sideways so the whole
// web curls the same way like iron filings around a pole.
const streamline = (angle: number, scale: number, curl: number): Curve => {
  const p0 = { x: CX + RX * scale * Math.cos(angle), y: CY + RY * scale * Math.sin(angle) };
  const p3 = { x: AX, y: AY };
  const dx = p3.x - p0.x;
  const dy = p3.y - p0.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const p1 = { x: p0.x + dx * 0.38 + nx * len * curl * 0.28, y: p0.y + dy * 0.38 + ny * len * curl * 0.28 };
  const p2 = { x: p0.x + dx * 0.74 + nx * len * curl * 0.12, y: p0.y + dy * 0.74 + ny * len * curl * 0.12 };
  return { p0, p1, p2, p3 };
};

const pathOf = (c: Curve) =>
  `M${f(c.p0.x)} ${f(c.p0.y)}C${f(c.p1.x)} ${f(c.p1.y)} ${f(c.p2.x)} ${f(c.p2.y)} ${f(c.p3.x)} ${f(c.p3.y)}`;

const pointAt = (c: Curve, t: number): Pt => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const d = 3 * u * t * t;
  const e = t * t * t;
  return {
    x: a * c.p0.x + b * c.p1.x + d * c.p2.x + e * c.p3.x,
    y: a * c.p0.y + b * c.p1.y + d * c.p2.y + e * c.p3.y,
  };
};

// Many tiny filled discs as one path element (two arcs per dot).
const disc = (x: number, y: number, r: number) =>
  `M${f(x - r)} ${f(y)}a${f(r)} ${f(r)} 0 1 0 ${f(r * 2)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-r * 2)} 0Z`;

// Primary filaments start on the rim so the artwork touches the bounding box all round.
const MAIN_N = 18;
const mainRng = rng(7);
const MAIN: Curve[] = [];
for (let i = 0; i < MAIN_N; i++) {
  const angle = (i / MAIN_N) * Math.PI * 2 + (mainRng() - 0.5) * 0.18;
  MAIN.push(streamline(angle, 1, 0.75 + mainRng() * 0.5));
}
// Four of them are pinned to the exact extremes so the measured axis is honest.
MAIN[0] = streamline(0, 1, 0.9);
MAIN[MAIN_N / 2] = streamline(Math.PI, 1, 0.9);
MAIN[Math.round(MAIN_N / 4)] = streamline(Math.PI / 2, 1, 0.9);
MAIN[Math.round((3 * MAIN_N) / 4)] = streamline((3 * Math.PI) / 2, 1, 0.9);

// Secondary, shorter feathers start inside the oval between the main ones.
const SUB_N = 14;
const subRng = rng(19);
const SUB: Curve[] = [];
for (let i = 0; i < SUB_N; i++) {
  const angle = ((i + 0.5) / SUB_N) * Math.PI * 2 + (subRng() - 0.5) * 0.25;
  SUB.push(streamline(angle, 0.62 + subRng() * 0.22, 0.6 + subRng() * 0.6));
}

const MAIN_D = MAIN.map(pathOf);
const SUB_D = SUB.map(pathOf);

// Galaxy dots strung along the filaments: a coarse set for medium sizes, a fine set for large.
const dots = (seed: number, curves: Curve[], ts: number[], base: number, grow: number) => {
  const next = rng(seed);
  let d = '';
  for (const c of curves) {
    for (const t0 of ts) {
      const t = Math.min(0.96, Math.max(0.04, t0 + (next() - 0.5) * 0.1));
      const p = pointAt(c, t);
      const r = base * (0.7 + next() * 0.6) + grow * t;
      d += disc(p.x + (next() - 0.5) * 1.2, p.y + (next() - 0.5) * 1.2, r);
    }
  }
  return d;
};
const COARSE = dots(31, MAIN, [0.2, 0.5, 0.78], 0.75, 0.35);
const FINE = dots(43, [...MAIN, ...SUB], [0.1, 0.3, 0.45, 0.62, 0.88], 0.38, 0.3);

export const art: Illustration = {
  id: 'laniakea',
  aspect: W / H,
  View: ({ uid, px }) => {
    const tiny = px < 24;
    const rich = px > 120;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          {/* faint halo spilling just beyond the oval (allowed spill, opacity <= 0.35) */}
          <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="72%" stopColor="#818CF8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
          </radialGradient>
          {/* body of the web: lit from the upper-left, denser toward the attractor */}
          <radialGradient id={`${uid}-body`} cx="52%" cy="48%" r="60%" fx="44%" fy="38%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity={tiny ? 0.95 : 0.6} />
            <stop offset="55%" stopColor="#4F46E5" stopOpacity={tiny ? 0.9 : 0.42} />
            <stop offset="100%" stopColor="#3730A3" stopOpacity={tiny ? 0.85 : 0.28} />
          </radialGradient>
          {/* deeper indigo at the lower-right limb */}
          <radialGradient id={`${uid}-limb`} cx="40%" cy="36%" r="78%">
            <stop offset="60%" stopColor="#1E1B4B" stopOpacity="0" />
            <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0.4" />
          </radialGradient>
          {/* shared stroke gradient: filaments brighten as they converge on the attractor */}
          <radialGradient id={`${uid}-flow`} gradientUnits="userSpaceOnUse" cx={AX} cy={AY} r="54">
            <stop offset="0%" stopColor="#E0E7FF" stopOpacity="1" />
            <stop offset="35%" stopColor="#C7D2FE" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#A5B4FC" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.35" />
          </radialGradient>
          {/* the Great Attractor glow */}
          <radialGradient id={`${uid}-core`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#E0E7FF" stopOpacity="0.7" />
            <stop offset="65%" stopColor="#A5B4FC" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* halo */}
        <ellipse cx={CX} cy={CY} rx={RX + 6} ry={RY + 4.5} fill={`url(#${uid}-halo)`} />

        {/* oval body — touches x = 0 and x = 100 */}
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill={`url(#${uid}-body)`} />

        {!tiny && (
          <g fill="none" stroke={`url(#${uid}-flow)`} strokeLinecap="round">
            {/* secondary feathers */}
            <g strokeWidth={0.55} strokeOpacity={0.75}>
              {SUB_D.map((d, i) => (
                <path key={`s${i}`} d={d} />
              ))}
            </g>
            {/* primary filaments from the rim */}
            <g strokeWidth={0.9}>
              {MAIN_D.map((d, i) => (
                <path key={`m${i}`} d={d} />
              ))}
            </g>
          </g>
        )}

        {/* galaxy dots along the filaments */}
        {!tiny && <path d={COARSE} fill="#E0E7FF" fillOpacity={rich ? 0.8 : 0.9} />}
        {rich && <path d={FINE} fill="#C7D2FE" fillOpacity="0.7" />}

        {/* lower-right limb shading */}
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill={`url(#${uid}-limb)`} />

        {/* the attractor: bright core where the flow converges */}
        <circle cx={AX} cy={AY} r={tiny ? 15 : 13} fill={`url(#${uid}-core)`} />
        <circle cx={AX} cy={AY} r={tiny ? 2.4 : 1.6} fill="#FFFFFF" />
      </svg>
    );
  },
};
