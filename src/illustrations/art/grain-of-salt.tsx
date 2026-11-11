import type { Illustration } from '../types';

// Grain of Salt — measured axis: width (horizontal). A single translucent NaCl cube in slight
// three-quarter view: light top face, mid front face, shaded right side face. The hexagonal
// silhouette spans x = 0..100 and y = 0..100, so aspect = 1.
//
// Vertices (front face is a 68-wide square, side and top recede up-right by 32):
//   top face   : (0,30) (32,0) (100,0) (68,30)
//   front face : (0,30) (68,30) (68,100) (0,100)
//   side face  : (68,30) (100,0) (100,70) (68,100)
const BASE = '#f1f1ea';
const LIGHT = '#ffffff';
const MID = '#e2e2d9';
const SHADE = '#c3c3b8';
const DARK = '#a2a299';
const EDGE = '#ffffff';

export const art: Illustration = {
  id: 'grain-of-salt',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* light falls from the upper-left */}
        <linearGradient id={`${uid}-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={LIGHT} />
          <stop offset="60%" stopColor={BASE} />
          <stop offset="100%" stopColor={MID} />
        </linearGradient>
        <linearGradient id={`${uid}-front`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={BASE} />
          <stop offset="55%" stopColor={MID} />
          <stop offset="100%" stopColor={SHADE} />
        </linearGradient>
        <linearGradient id={`${uid}-side`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={SHADE} />
          <stop offset="100%" stopColor={DARK} />
        </linearGradient>
        {/* soft sheen on the front face, suggesting glassy translucency */}
        <radialGradient id={`${uid}-sheen`} cx="30%" cy="28%" r="70%">
          <stop offset="0%" stopColor={LIGHT} stopOpacity="0.55" />
          <stop offset="100%" stopColor={LIGHT} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---- the three faces ---- */}
      <path d="M0 30 L32 0 L100 0 L68 30 Z" fill={`url(#${uid}-top)`} />
      <path d="M0 30 L68 30 L68 100 L0 100 Z" fill={`url(#${uid}-front)`} />
      <path d="M68 30 L100 0 L100 70 L68 100 Z" fill={`url(#${uid}-side)`} />

      {px >= 24 && (
        <>
          {/* translucency: the hidden back edges show faintly through the crystal */}
          <g fill="none" stroke={DARK} strokeWidth="0.8" strokeLinecap="round" opacity="0.28">
            <path d="M32 0 L32 70" />
            <path d="M32 70 L100 70" />
            <path d="M32 70 L0 100" />
          </g>
          <rect x="0" y="30" width="68" height="70" fill={`url(#${uid}-sheen)`} />

          {/* bevelled edges: soft bright rims along the lit edges, a darker seam on the shaded ones */}
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M0 30 L32 0 L100 0" stroke={EDGE} strokeWidth="1.5" opacity="0.9" />
            <path d="M0 30 L68 30 L100 0" stroke={EDGE} strokeWidth="1.3" opacity="0.75" />
            <path d="M68 30 L68 100" stroke={EDGE} strokeWidth="1.2" opacity="0.55" />
            <path d="M0 30 L0 100" stroke={EDGE} strokeWidth="1.2" opacity="0.6" />
            <path d="M0 100 L68 100 L100 70 L100 0" stroke={SHADE} strokeWidth="1.2" opacity="0.7" />
          </g>
        </>
      )}

      {px > 120 && (
        <g fill={LIGHT}>
          {/* internal glints and tiny facets caught in the light */}
          <path d="M10 42 L18 38 L20 44 L12 48 Z" opacity="0.6" />
          <ellipse cx="26" cy="60" rx="3.2" ry="1.6" transform="rotate(-30 26 60)" opacity="0.5" />
          <ellipse cx="46" cy="80" rx="2.4" ry="1.1" transform="rotate(-30 46 80)" opacity="0.4" />
          <ellipse cx="52" cy="14" rx="4" ry="1.4" transform="rotate(-18 52 14)" opacity="0.7" />
          <ellipse cx="76" cy="10" rx="2" ry="0.9" transform="rotate(-18 76 10)" opacity="0.5" />
          <ellipse cx="84" cy="48" rx="1.6" ry="3" transform="rotate(12 84 48)" opacity="0.35" />
          <circle cx="40" cy="52" r="1.1" opacity="0.7" />
          <circle cx="58" cy="44" r="0.8" opacity="0.6" />
          <circle cx="16" cy="88" r="0.9" opacity="0.5" />
          {/* faint cleavage lines, the cubic lattice showing through */}
          <g fill="none" stroke={SHADE} strokeWidth="0.6" strokeLinecap="round" opacity="0.35">
            <path d="M6 70 L30 70" />
            <path d="M44 36 L44 62" />
            <path d="M74 56 L90 41" />
          </g>
        </g>
      )}
    </svg>
  ),
};
