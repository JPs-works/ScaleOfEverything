import type { Illustration } from '../types';

// Virgo Supercluster — measured axis: diameter (horizontal). The flattened cloud spans x = 0 .. 100.
// Over a hundred galaxy groups: small violet smudges strung along faint filaments, brightest at the
// centre (the Virgo Cluster), thinning toward the rim. viewBox 100 x 56, aspect = 100 / 56.

interface Smudge {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rot: number;
  fill: string;
  o: number;
}

interface Filament {
  // Quadratic bezier from the centre (CX, CY) through control (cx, cy) to end (ex, ey).
  cx: number;
  cy: number;
  ex: number;
  ey: number;
}

const CX = 50;
const CY = 28;

// Six filaments radiating from the core to the rim of the flattened cloud.
const FILAMENTS: Filament[] = [
  { cx: 28, cy: 21, ex: 1.5, ey: 25 },
  { cx: 74, cy: 35, ex: 98.5, ey: 31 },
  { cx: 38, cy: 15, ex: 21, ey: 5 },
  { cx: 62, cy: 43, ex: 79, ey: 51 },
  { cx: 66, cy: 19, ex: 81, ey: 8 },
  { cx: 36, cy: 40, ex: 23, ey: 49 },
];

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

const TINTS = ['#C4B5FD', '#A78BFA', '#DDD6FE', '#A78BFA', '#8F6FEE'];

function bezier(f: Filament, t: number): [number, number] {
  const u = 1 - t;
  const x = u * u * CX + 2 * u * t * f.cx + t * t * f.ex;
  const y = u * u * CY + 2 * u * t * f.cy + t * t * f.ey;
  return [x, y];
}

function makeSmudges(count: number, seed: number): Smudge[] {
  const rnd = mulberry(seed);
  const out: Smudge[] = [];
  for (let i = 0; i < count; i++) {
    const f = FILAMENTS[Math.floor(rnd() * FILAMENTS.length)];
    // Bias toward the core, but let groups reach the rim.
    const t = Math.pow(rnd(), 1.25);
    const [bx, by] = bezier(f, t);
    // Scatter sideways: tight near the core, looser near the rim.
    const spread = 1.5 + 5 * t;
    const x = bx + (rnd() - 0.5) * spread * 1.6;
    const y = by + (rnd() - 0.5) * spread;
    const r = 0.7 + rnd() * 1.3 * (1 - t * 0.4);
    const rx = r;
    const ry = r * (0.45 + rnd() * 0.5);
    const rot = rnd() * 180;
    const fill = TINTS[Math.floor(rnd() * TINTS.length)];
    const o = 0.5 + 0.45 * (1 - t) * rnd() + 0.1;
    out.push({ x, y, rx, ry, rot, fill, o: Math.min(o, 0.95) });
  }
  return out;
}

// Two fixed rim groups pin the cloud to the measured edges.
const RIM: Smudge[] = [
  { x: 1.6, y: 25, rx: 1.6, ry: 0.9, rot: 20, fill: '#C4B5FD', o: 0.9 },
  { x: 98.4, y: 31, rx: 1.6, ry: 1, rot: -15, fill: '#C4B5FD', o: 0.9 },
];

// A few bright foreground stars.
const STARS: Array<[number, number, number]> = [
  [14, 12, 0.6],
  [88, 46, 0.55],
  [70, 4, 0.5],
  [31, 50, 0.5],
  [58, 8, 0.45],
];

const SMUDGES_RICH = makeSmudges(70, 4127);
const SMUDGES_MID = makeSmudges(22, 4127);

function filamentPath(f: Filament): string {
  return `M${CX} ${CY} Q${f.cx} ${f.cy} ${f.ex} ${f.ey}`;
}

export const art: Illustration = {
  id: 'virgo-supercluster',
  aspect: 100 / 56,
  View: ({ uid, px }) => {
    const smudges = px > 120 ? SMUDGES_RICH : px > 24 ? SMUDGES_MID : [];
    return (
      <svg viewBox="0 0 100 56" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${uid}-cloud`} cx="47%" cy="46%" r="52%">
            <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.95" />
            <stop offset="22%" stopColor="#A78BFA" stopOpacity="0.8" />
            <stop offset="55%" stopColor="#7C5BD6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#4C3390" stopOpacity="0.34" />
          </radialGradient>
          <radialGradient id={`${uid}-core`} cx="42%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#F3EEFF" stopOpacity="1" />
            <stop offset="35%" stopColor="#DDD6FE" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#A78BFA" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* faint outer halo, spilling a little beyond the measured cloud */}
        <ellipse cx="50" cy="28" rx="55" ry="30" fill={`url(#${uid}-halo)`} opacity="0.35" />
        {/* the flattened cloud body: spans the full diameter x = 0 .. 100 */}
        <ellipse cx="50" cy="28" rx="50" ry="26" fill={`url(#${uid}-cloud)`} />
        {/* filaments */}
        {px > 24 && (
          <g fill="none" stroke="#C4B5FD" strokeLinecap="round">
            {FILAMENTS.map((f, i) => (
              <path key={i} d={filamentPath(f)} strokeWidth={1.4 - (i % 3) * 0.25} opacity={0.22 + (i % 2) * 0.08} />
            ))}
          </g>
        )}
        {/* the Virgo Cluster at the heart */}
        <ellipse cx="50" cy="28" rx="13" ry="8.5" fill={`url(#${uid}-core)`} />
        {/* galaxy groups strung along the filaments */}
        {smudges.map((s, i) => (
          <ellipse
            key={i}
            cx={s.x}
            cy={s.y}
            rx={s.rx}
            ry={s.ry}
            transform={`rotate(${s.rot} ${s.x} ${s.y})`}
            fill={s.fill}
            opacity={s.o}
          />
        ))}
        {/* rim groups pinning the measured edges */}
        {RIM.map((s, i) => (
          <ellipse
            key={`rim-${i}`}
            cx={s.x}
            cy={s.y}
            rx={s.rx}
            ry={s.ry}
            transform={`rotate(${s.rot} ${s.x} ${s.y})`}
            fill={s.fill}
            opacity={px > 24 ? s.o : 0.6}
          />
        ))}
        {/* bright foreground stars */}
        {px > 120 && (
          <g fill="#F8F5FF">
            {STARS.map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} opacity="0.9" />
            ))}
          </g>
        )}
      </svg>
    );
  },
};
