import type { Illustration } from '../types';

// Observable Universe — measured axis: diameter (horizontal). The pale sphere spans x = 0..100.
// The sphere of space from which light has had time to reach us: a translucent pale disc filled
// with a fine foam-like cosmic web (thin faint filaments joining tiny bright nodes), brighter
// toward the rim like the cosmic microwave background. Light from the upper-left: a soft white
// highlight near 35%,30% and a cooler slate limb at the lower-right. Only a faint halo spills out.
const C = 50;
const R = 50;

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

// Jittered grid of nodes inside the disc: a foam needs roughly even spacing, not pure noise.
const nodes = (seed: number, cell: number, rad: number): Pt[] => {
  const next = rng(seed);
  const pts: Pt[] = [];
  for (let gy = -rad; gy < rad; gy += cell) {
    for (let gx = -rad; gx < rad; gx += cell) {
      const x = gx + cell * (0.15 + next() * 0.7);
      const y = gy + cell * (0.15 + next() * 0.7);
      if (x * x + y * y <= rad * rad) pts.push({ x: C + x, y: C + y });
    }
  }
  return pts;
};

// Join every node to its k nearest neighbours with slightly bowed filaments, one path for all.
const filaments = (pts: Pt[], k: number, bow: number, seed: number) => {
  const next = rng(seed);
  const seen = new Set<string>();
  let d = '';
  pts.forEach((p, i) => {
    const near = pts
      .map((q, j) => ({ j, d2: (q.x - p.x) ** 2 + (q.y - p.y) ** 2 }))
      .filter((e) => e.j !== i)
      .sort((a, b) => a.d2 - b.d2)
      .slice(0, k);
    for (const e of near) {
      const key = i < e.j ? `${i}-${e.j}` : `${e.j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const q = pts[e.j];
      const mx = (p.x + q.x) / 2;
      const my = (p.y + q.y) / 2;
      const len = Math.sqrt(e.d2) || 1;
      const off = (next() - 0.5) * bow * len;
      const cx = mx + (-(q.y - p.y) / len) * off;
      const cy = my + ((q.x - p.x) / len) * off;
      d += `M${p.x.toFixed(2)} ${p.y.toFixed(2)}Q${cx.toFixed(2)} ${cy.toFixed(2)} ${q.x.toFixed(2)} ${q.y.toFixed(2)}`;
    }
  });
  return d;
};

// Tiny filled discs at the nodes (two arcs per dot), one path for all.
const dots = (pts: Pt[], dotR: number, seed: number) => {
  const next = rng(seed);
  let d = '';
  for (const p of pts) {
    const r = dotR * (0.6 + next() * 0.8);
    d += `M${(p.x - r).toFixed(2)} ${p.y.toFixed(2)}a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(r * 2).toFixed(2)} 0a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-r * 2).toFixed(2)} 0Z`;
  }
  return d;
};

// Coarse web (always drawn when not tiny) and a finer web layered in when large.
const COARSE = nodes(7, 9, 48.5);
const COARSE_WEB = filaments(COARSE, 3, 0.35, 19);
const COARSE_DOTS = dots(COARSE, 0.9, 31);
const FINE = nodes(43, 5.2, 49);
const FINE_WEB = filaments(FINE, 2, 0.3, 59);
const FINE_DOTS = dots(FINE, 0.45, 71);

export const art: Illustration = {
  id: 'observable-universe',
  aspect: 1,
  View: ({ uid, px }) => {
    const tiny = px < 24;
    const rich = px > 120;
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          {/* translucent body: faint pale centre, brightening toward the rim like the CMB */}
          <radialGradient id={`${uid}-body`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F8FAFC" stopOpacity={tiny ? 0.72 : 0.14} />
            <stop offset="60%" stopColor="#F8FAFC" stopOpacity={tiny ? 0.78 : 0.2} />
            <stop offset="88%" stopColor="#F8FAFC" stopOpacity={tiny ? 0.9 : 0.4} />
            <stop offset="97%" stopColor="#FFFFFF" stopOpacity={tiny ? 1 : 0.72} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={tiny ? 1 : 0.9} />
          </radialGradient>
          {/* faint warm CMB tint sitting just inside the rim */}
          <radialGradient id={`${uid}-cmb`} cx="50%" cy="50%" r="50%">
            <stop offset="78%" stopColor="#FDE68A" stopOpacity="0" />
            <stop offset="94%" stopColor="#FDE68A" stopOpacity={tiny ? 0 : 0.16} />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </radialGradient>
          {/* upper-left highlight to give the sphere volume */}
          <radialGradient id={`${uid}-hi`} cx="35%" cy="30%" r="42%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={tiny ? 0.5 : 0.28} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          {/* cooler slate shade toward the lower-right limb */}
          <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="82%">
            <stop offset="60%" stopColor="#334155" stopOpacity="0" />
            <stop offset="100%" stopColor="#334155" stopOpacity={tiny ? 0.3 : 0.42} />
          </radialGradient>
          {/* faint halo just outside the sphere */}
          <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="86%" stopColor="#F8FAFC" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`${uid}-clip`}>
            <circle cx={C} cy={C} r={R} />
          </clipPath>
        </defs>

        {/* soft halo (opacity <= 0.3, ~8% beyond the box) */}
        <circle cx={C} cy={C} r={R * 1.08} fill={`url(#${uid}-halo)`} />

        {/* sphere body and CMB rim tint */}
        <circle cx={C} cy={C} r={R} fill={`url(#${uid}-body)`} />
        <circle cx={C} cy={C} r={R} fill={`url(#${uid}-cmb)`} />

        {/* cosmic web: faint filaments joining tiny bright nodes */}
        {!tiny && (
          <g clipPath={`url(#${uid}-clip)`}>
            {rich && (
              <path d={FINE_WEB} fill="none" stroke="#CBD5E1" strokeWidth="0.22" strokeLinecap="round" opacity="0.4" />
            )}
            <path d={COARSE_WEB} fill="none" stroke="#E2E8F0" strokeWidth={rich ? 0.4 : 0.55} strokeLinecap="round" opacity="0.62" />
            {rich && <path d={FINE_DOTS} fill="#F1F5F9" opacity="0.7" />}
            <path d={COARSE_DOTS} fill="#FFFFFF" opacity="0.95" />
          </g>
        )}

        {/* volume: highlight upper-left, slate shade lower-right */}
        <circle cx={C} cy={C} r={R} fill={`url(#${uid}-hi)`} />
        <circle cx={C} cy={C} r={R} fill={`url(#${uid}-shade)`} />

        {/* crisp pale limb so the sphere reads against the dark sky */}
        <circle
          cx={C}
          cy={C}
          r={R - 0.5}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={tiny ? 1.4 : 0.8}
          opacity={tiny ? 0.95 : 0.8}
        />
      </svg>
    );
  },
};
