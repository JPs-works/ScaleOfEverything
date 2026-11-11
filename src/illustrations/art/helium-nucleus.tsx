import type { Illustration } from '../types';

// Helium nucleus (alpha particle) — measured axis: diameter (horizontal). The cluster's outline spans x = 0..100.
// Four nucleons packed in a tetrahedron seen face-on: three form an equilateral triangle (apex touching y = 0,
// base spheres touching x = 0 and x = 100) and the fourth sits in front at the centroid.
// Protons are warm orange (the object's colour), neutrons a cool grey-blue; the two protons sit on a diagonal.
const R = 26;
// Nucleons back to front: apex, bottom-left, bottom-right, front (centroid).
const NUCLEONS: [number, number, 'p' | 'n'][] = [
  [50, 26, 'n'],
  [26, 67.6, 'p'],
  [74, 67.6, 'n'],
  [50, 53.7, 'p'],
];

export const art: Illustration = {
  id: 'helium-nucleus',
  aspect: 100 / 93.6,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 93.6" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* proton: object colour, lit from the upper-left */}
        <radialGradient id={`${uid}-p`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFDCB8" />
          <stop offset="45%" stopColor="#F4A261" />
          <stop offset="100%" stopColor="#9A4A14" />
        </radialGradient>
        {/* neutron: cool grey-blue */}
        <radialGradient id={`${uid}-n`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#DCE4F0" />
          <stop offset="45%" stopColor="#8FA3BF" />
          <stop offset="100%" stopColor="#3E4D66" />
        </radialGradient>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="76%" stopColor="#F4A261" stopOpacity="0" />
          <stop offset="100%" stopColor="#F4A261" stopOpacity="0.32" />
        </radialGradient>
      </defs>
      {/* faint strong-force glow around the cluster */}
      {px > 24 && <ellipse cx="50" cy="48" rx="55" ry="52" fill={`url(#${uid}-halo)`} opacity="0.35" />}
      {/* the front sphere covers the sliver between the three behind, so the silhouette stays solid at any size */}
      {NUCLEONS.map(([x, y, t], i) => (
        <circle key={i} cx={x} cy={y} r={R} fill={`url(#${uid}-${t})`} />
      ))}
      {/* soft upper-left highlights on the visible shoulder of each sphere */}
      {px > 40 && (
        <g fill="#FFFFFF" opacity="0.28">
          <ellipse cx="42" cy="15" rx="7" ry="4.2" transform="rotate(-35 42 15)" />
          <ellipse cx="17" cy="57" rx="6" ry="3.6" transform="rotate(-35 17 57)" />
          <ellipse cx="65" cy="56" rx="6" ry="3.6" transform="rotate(-35 65 56)" />
          <ellipse cx="41" cy="43" rx="7" ry="4.2" transform="rotate(-35 41 43)" />
        </g>
      )}
      {/* plus marks: the two protons carry positive charge */}
      {px > 120 && (
        <g fill="#FFF4E8" opacity="0.95">
          <rect x="45.5" y="55" width="9" height="2.4" rx="1.2" />
          <rect x="48.8" y="51.7" width="2.4" height="9" rx="1.2" />
          <rect x="9.5" y="71.8" width="8" height="2.2" rx="1.1" />
          <rect x="12.4" y="68.9" width="2.2" height="8" rx="1.1" />
        </g>
      )}
      {/* tiny glints */}
      {px > 120 && (
        <g fill="#FFFFFF" opacity="0.85">
          <circle cx="40" cy="12.5" r="1.6" />
          <circle cx="15.5" cy="55" r="1.4" />
          <circle cx="63.5" cy="54" r="1.4" />
          <circle cx="39.5" cy="40.5" r="1.6" />
        </g>
      )}
    </svg>
  ),
};
