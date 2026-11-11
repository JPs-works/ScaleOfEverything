import type { Illustration } from '../types';

// Uranium nucleus — measured axis: diameter (horizontal). A packed ball of nucleons spans x = 0..100.
// Protons are rose (the object's colour); neutrons a muted mauve-grey so the mix of the two reads at a glance.
// Positions are a jittered close-packed lattice projected to 2D, listed back to front.
const R = 12.2;
const NUCLEONS: [number, number, 'p' | 'n'][] = [
  [12.2, 57.4, 'p'],
  [49.2, 12.2, 'n'],
  [16.9, 43.8, 'p'],
  [37.3, 21.2, 'n'],
  [79, 76.9, 'n'],
  [30.8, 76.6, 'n'],
  [18.5, 62.4, 'n'],
  [71.8, 30.4, 'p'],
  [23.4, 29.1, 'n'],
  [55.3, 18.3, 'p'],
  [63.1, 85.7, 'n'],
  [36.9, 59.9, 'p'],
  [83.8, 62, 'n'],
  [51.9, 72.4, 'p'],
  [71.3, 52, 'n'],
  [43.9, 26.2, 'p'],
  [22.9, 50.4, 'n'],
  [56.2, 37.3, 'n'],
  [49.4, 91.5, 'n'],
  [71.2, 71.5, 'n'],
  [56.3, 57.1, 'p'],
  [36.2, 82.5, 'n'],
  [87.8, 47.3, 'p'],
  [25, 71.4, 'n'],
  [74.1, 37.6, 'p'],
  [61.7, 26, 'n'],
  [57.2, 79.4, 'p'],
  [77.4, 56.7, 'n'],
  [41.9, 65.6, 'p'],
  [30.2, 54.9, 'n'],
  [61.4, 42.9, 'n'],
  [46.4, 33.6, 'n'],
  [46.4, 51.6, 'n'],
  [61.5, 66, 'p'],
  [34.3, 39.7, 'n'],
];
// The front-most nucleons get a small specular highlight at large sizes.
const FRONT = NUCLEONS.slice(-14);

export const art: Illustration = {
  id: 'uranium-nucleus',
  aspect: 100 / 103.7,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 103.7" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* proton: object colour, lit from the upper-left */}
        <radialGradient id={`${uid}-p`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFC2CB" />
          <stop offset="45%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#9F1239" />
        </radialGradient>
        {/* neutron: muted mauve-grey */}
        <radialGradient id={`${uid}-n`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#D9CBDD" />
          <stop offset="45%" stopColor="#9C8AA3" />
          <stop offset="100%" stopColor="#4F3F57" />
        </radialGradient>
        {/* whole-ball silhouette used when tiny */}
        <radialGradient id={`${uid}-ball`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFB4BF" />
          <stop offset="50%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#8E1038" />
        </radialGradient>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="78%" stopColor="#FB7185" stopOpacity="0" />
          <stop offset="100%" stopColor="#FB7185" stopOpacity="0.3" />
        </radialGradient>
      </defs>
      {/* faint strong-force glow */}
      <ellipse cx="50" cy="51.85" rx="54" ry="56" fill={`url(#${uid}-halo)`} opacity="0.3" />
      {px < 24 ? (
        <ellipse cx="50" cy="51.85" rx="50" ry="51.85" fill={`url(#${uid}-ball)`} />
      ) : (
        <>
          {/* dark core fills any gaps between nucleons so the silhouette stays solid */}
          <ellipse cx="50" cy="51.85" rx="40" ry="42" fill="#5E1230" />
          {NUCLEONS.map(([x, y, t], i) => (
            <circle key={i} cx={x} cy={y} r={R} fill={`url(#${uid}-${t})`} />
          ))}
          {px > 120 && (
            <g fill="#FFF5F7" opacity="0.7">
              {FRONT.map(([x, y], i) => (
                <ellipse key={i} cx={x - 4.2} cy={y - 4.8} rx="2.6" ry="1.7" transform={`rotate(-35 ${x - 4.2} ${y - 4.8})`} />
              ))}
            </g>
          )}
        </>
      )}
    </svg>
  ),
};
