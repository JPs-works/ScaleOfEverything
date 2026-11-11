import type { Illustration } from '../types';

// Grain of Sand — measured axis: diameter (horizontal). The grain spans x = 0 to x = 100.
// An irregular, faceted quartz grain: bounding box 100 x 86, aspect = 100 / 86.
const OUTLINE =
  'M0 42 L8 18 Q10 12 15 10 L32 2 Q36 0 40 0 L62 0 Q67 0 71 3 L90 16 Q94 19 96 24 ' +
  'L100 44 L96 66 Q95 70 92 73 L78 83 Q74 86 69 86 L48 86 L26 81 Q21 80 18 76 L6 62 Q3 58 2 52 Z';

export const art: Illustration = {
  id: 'grain-sand',
  aspect: 100 / 86,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 86" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-body`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#FFE99C" />
          <stop offset="45%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#C98A1E" />
        </radialGradient>
        <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="85%">
          <stop offset="55%" stopColor="#5C3A06" stopOpacity="0" />
          <stop offset="100%" stopColor="#5C3A06" stopOpacity="0.55" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}>
          <path d={OUTLINE} />
        </clipPath>
      </defs>

      {/* faint warm halo — keeps the grain legible on the dark backdrop */}
      {px > 40 && <ellipse cx="50" cy="43" rx="56" ry="50" fill="#FCD34D" opacity="0.08" />}

      {/* grain body */}
      <path d={OUTLINE} fill={`url(#${uid}-body)`} />

      {px > 24 && (
        <g clipPath={`url(#${uid}-clip)`}>
          {/* crystal facets: lit toward the upper-left, shaded toward the lower-right */}
          <polygon points="8,18 32,2 40,0 50,22 30,36 12,32" fill="#FFF3C4" opacity="0.5" />
          <polygon points="50,22 62,0 90,16 80,40 58,36" fill="#FDE68A" opacity="0.35" />
          <polygon points="30,36 50,22 58,36 60,60 40,62 22,54" fill="#FCD34D" opacity="0.25" />
          <polygon points="80,40 100,44 96,66 78,83 60,70 60,60" fill="#B7791F" opacity="0.45" />
          <polygon points="22,54 40,62 60,70 69,86 48,86 26,81 12,66" fill="#A16207" opacity="0.4" />
          <polygon points="0,42 8,18 12,32 30,36 22,54 12,66 6,62" fill="#E0A82E" opacity="0.35" />
          {/* facet edges */}
          <g fill="none" stroke="#FFF8E1" strokeWidth="0.8" strokeLinejoin="round" opacity="0.45">
            <polyline points="8,18 12,32 30,36 50,22 62,0" />
            <polyline points="30,36 22,54 12,66" />
            <polyline points="50,22 58,36 80,40 100,44" />
            <polyline points="58,36 60,60 40,62 22,54" />
            <polyline points="60,60 78,83" />
            <polyline points="60,60 60,70 69,86" />
          </g>
          {/* soft specular highlight, upper-left */}
          <ellipse cx="30" cy="22" rx="11" ry="5.5" transform="rotate(-28 30 22)" fill="#FFFFFF" opacity="0.5" />
        </g>
      )}

      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`}>
          {/* quartz sparkle and mineral inclusions */}
          <circle cx="44" cy="12" r="1.3" fill="#FFFFFF" opacity="0.8" />
          <circle cx="72" cy="26" r="0.9" fill="#FFFFFF" opacity="0.7" />
          <circle cx="36" cy="48" r="0.8" fill="#FFFFFF" opacity="0.6" />
          <circle cx="18" cy="40" r="0.7" fill="#FFFFFF" opacity="0.6" />
          <circle cx="66" cy="50" r="1.6" fill="#8A5A12" opacity="0.5" />
          <circle cx="84" cy="60" r="1.1" fill="#8A5A12" opacity="0.5" />
          <circle cx="40" cy="74" r="1.3" fill="#8A5A12" opacity="0.45" />
          <circle cx="54" cy="44" r="0.9" fill="#8A5A12" opacity="0.4" />
          {/* pitted surface texture */}
          <ellipse cx="74" cy="66" rx="3" ry="1.6" transform="rotate(-20 74 66)" fill="#7A4E0E" opacity="0.25" />
          <ellipse cx="30" cy="66" rx="2.4" ry="1.3" transform="rotate(15 30 66)" fill="#7A4E0E" opacity="0.25" />
        </g>
      )}

      {/* darker limb, lower-right */}
      <path d={OUTLINE} fill={`url(#${uid}-shade)`} />
    </svg>
  ),
};
