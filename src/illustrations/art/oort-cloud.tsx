import type { Illustration } from '../types';

// Oort Cloud — measured axis: diameter (horizontal). The translucent shell spans x = 0..100.
// A predicted (speculative) spherical shell of icy bodies: a faint blue-tinted sphere whose limb
// reads denser, speckled with many tiny pale dots that thicken toward the rim (points sampled on
// a sphere surface and projected, so limb-brightening falls out naturally), with a tiny bright
// Sun dot at the centre. Light from the upper-left: pale highlight near 35%,30%, a deeper blue
// tint at the lower-right limb. Only the faint outer halo spills beyond the box.
const C = 50;
const R = 50;

// Small deterministic PRNG so every render draws the same speckle field.
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

// Uniformly scatter points over a sphere of radius `rad`, project to the x/y plane and return
// one path string of tiny filled discs (two arcs per dot) — many dots for one SVG element.
const speckles = (seed: number, count: number, dotR: number, rad: number, side: 'near' | 'far') => {
  const next = rng(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const z = next() * 2 - 1;
    if (side === 'near' ? z < 0 : z >= 0) {
      i--;
      continue;
    }
    const a = next() * Math.PI * 2;
    const q = Math.sqrt(1 - z * z) * rad;
    const x = C + q * Math.cos(a);
    const y = C + q * Math.sin(a);
    const r = dotR * (0.7 + next() * 0.6);
    d += `M${(x - r).toFixed(2)} ${y.toFixed(2)}a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(r * 2).toFixed(2)} 0a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-r * 2).toFixed(2)} 0Z`;
  }
  return d;
};

// Three speckle layers: a faint far-side field, a brighter near-side field, and a sparse
// layer of slightly larger "icy bodies". A fourth, finer layer only appears when large.
const FAR = speckles(11, 170, 0.42, 48.6, 'far');
const NEAR = speckles(23, 150, 0.55, 48.8, 'near');
const BODIES = speckles(37, 42, 0.85, 47.5, 'near');
const FINE = speckles(53, 220, 0.3, 49.1, 'near');

export const art: Illustration = {
  id: 'oort-cloud',
  aspect: 1,
  View: ({ uid, px }) => {
    const tiny = px < 24;
    const rich = px > 120;
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          {/* translucent shell body: faint centre, denser toward the limb */}
          <radialGradient id={`${uid}-shell`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7DD3FC" stopOpacity={tiny ? 0.5 : 0.1} />
            <stop offset="55%" stopColor="#7DD3FC" stopOpacity={tiny ? 0.55 : 0.16} />
            <stop offset="86%" stopColor="#7DD3FC" stopOpacity={tiny ? 0.7 : 0.3} />
            <stop offset="96%" stopColor="#BAE6FD" stopOpacity={tiny ? 0.95 : 0.62} />
            <stop offset="100%" stopColor="#E0F2FE" stopOpacity={tiny ? 1 : 0.85} />
          </radialGradient>
          {/* upper-left highlight to give the sphere volume */}
          <radialGradient id={`${uid}-hi`} cx="35%" cy="30%" r="45%">
            <stop offset="0%" stopColor="#E0F2FE" stopOpacity={tiny ? 0.45 : 0.22} />
            <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0" />
          </radialGradient>
          {/* deeper blue toward the lower-right limb */}
          <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="82%">
            <stop offset="62%" stopColor="#0C4A6E" stopOpacity="0" />
            <stop offset="100%" stopColor="#0C4A6E" stopOpacity={tiny ? 0.3 : 0.4} />
          </radialGradient>
          {/* faint halo just outside the shell */}
          <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="88%" stopColor="#7DD3FC" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0" />
          </radialGradient>
          {/* the Sun's warm glow at the centre */}
          <radialGradient id={`${uid}-sun`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF7D6" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#FDE68A" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`${uid}-clip`}>
            <circle cx={C} cy={C} r={R} />
          </clipPath>
        </defs>

        {/* soft halo (opacity <= 0.3, ~7% beyond the box) */}
        <circle cx={C} cy={C} r={R * 1.07} fill={`url(#${uid}-halo)`} />

        {/* shell body */}
        <circle cx={C} cy={C} r={R} fill={`url(#${uid}-shell)`} />

        {/* speckle field — far side faint, near side brighter, a few larger icy bodies */}
        {!tiny && (
          <g clipPath={`url(#${uid}-clip)`}>
            <path d={FAR} fill="#7DD3FC" opacity="0.45" />
            {rich && <path d={FINE} fill="#BAE6FD" opacity="0.5" />}
            <path d={NEAR} fill="#E0F2FE" opacity="0.85" />
            <path d={BODIES} fill="#F0F9FF" opacity="0.95" />
          </g>
        )}

        {/* volume: highlight upper-left, darker limb lower-right */}
        <circle cx={C} cy={C} r={R} fill={`url(#${uid}-hi)`} />
        <circle cx={C} cy={C} r={R} fill={`url(#${uid}-shade)`} />

        {/* crisp limb; dashed when large to hint the shell is predicted, not observed */}
        <circle
          cx={C}
          cy={C}
          r={R - 0.5}
          fill="none"
          stroke="#E0F2FE"
          strokeWidth={tiny ? 1.5 : 0.9}
          strokeDasharray={rich ? '3.2 1.8' : undefined}
          opacity={tiny ? 0.95 : 0.75}
        />

        {/* the Sun at the centre */}
        <circle cx={C} cy={C} r={tiny ? 7 : 6} fill={`url(#${uid}-sun)`} />
        <circle cx={C} cy={C} r={tiny ? 2.2 : 1.5} fill="#FFFBEB" />
        {rich && <circle cx={C} cy={C} r="0.8" fill="#FFFFFF" />}
      </svg>
    );
  },
};
