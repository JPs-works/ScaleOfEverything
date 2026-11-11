import type { Illustration } from '../types';

// Neutron star — measured axis: diameter (horizontal). The small, smooth, blue-white-to-indigo sphere
// spans the full viewBox (x = 0..100). Drawn as a pulsar: the magnetic axis is tilted 30° from vertical
// and two long lighthouse beams leave the polar hot spots, tapering to pointed tips far beyond the
// sphere (y = -60..160 in the tilted frame; vertical spill is allowed, horizontal spill stays ≤ 6%) and
// fading to fully transparent before the path ends. Light from the upper-left, one body gradient and
// one soft highlight. Field lines were dropped so nothing reads as a ring. Below 56 px it is a clean ball.
const TILT = 'rotate(-30 50 50)';

// One beam in the tilted frame: rooted inside the disc (y = 8, fading in over the polar cap), ~10 wide
// at the pole (y = 0) and pointed at y = -60. A 180° copy covers the opposite pole.
const SHEATH = 'M45.2 8 C43.2 -14 46.8 -40 50 -60 C53.2 -40 56.8 -14 54.8 8 Z';
const CORE = 'M48.1 8 C47 -12 48.8 -36 50 -54 C51.2 -36 53 -12 51.9 8 Z';

export const art: Illustration = {
  id: 'neutron-star',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        {/* the single body gradient: white-hot upper-left, indigo body, a gently shaded limb */}
        <radialGradient id={`${uid}-body`} cx="36%" cy="30%" r="76%">
          <stop offset="0%" stopColor="#f5f7ff" />
          <stop offset="22%" stopColor="#c7d2fe" />
          <stop offset="58%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4039b8" />
        </radialGradient>
        {/* one soft highlight */}
        <radialGradient id={`${uid}-hi`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        {/* polar hot spots, blending into the body */}
        <radialGradient id={`${uid}-cap`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0" />
        </radialGradient>
        {/* beam fade along the tilted axis: transparent at the root (y = 8) so it blends into the cap,
            bright at the pole (y = 0), fully transparent by ~y = -50, before the pointed tip at y = -60.
            userSpaceOnUse follows the 180° copy as well. */}
        <linearGradient id={`${uid}-sheath`} gradientUnits="userSpaceOnUse" x1="0" y1="8" x2="0" y2="-60">
          <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0" />
          <stop offset="12%" stopColor="#c7d2fe" stopOpacity="0.5" />
          <stop offset="45%" stopColor="#c7d2fe" stopOpacity="0.2" />
          <stop offset="85%" stopColor="#c7d2fe" stopOpacity="0" />
          <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-core`} gradientUnits="userSpaceOnUse" x1="0" y1="8" x2="0" y2="-60">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="12%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#eef2ff" stopOpacity="0.45" />
          <stop offset="80%" stopColor="#eef2ff" stopOpacity="0" />
          <stop offset="100%" stopColor="#eef2ff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>

      {/* the star: one gradient, one highlight */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-body)`} />
      <ellipse cx="34" cy="29" rx="17" ry="12" fill={`url(#${uid}-hi)`} />

      {/* polar hot spots on the tilted axis, clipped to the disc */}
      {px > 56 && (
        <g clipPath={`url(#${uid}-clip)`} transform={TILT}>
          <circle cx="50" cy="0" r="13" fill={`url(#${uid}-cap)`} />
          <circle cx="50" cy="100" r="13" fill={`url(#${uid}-cap)`} opacity="0.7" />
        </g>
      )}

      {/* lighthouse beams leaving both hot spots */}
      {px > 56 && (
        <g transform={TILT}>
          <path d={SHEATH} fill={`url(#${uid}-sheath)`} />
          <path d={CORE} fill={`url(#${uid}-core)`} />
          <g transform="rotate(180 50 50)">
            <path d={SHEATH} fill={`url(#${uid}-sheath)`} />
            <path d={CORE} fill={`url(#${uid}-core)`} />
          </g>
        </g>
      )}
    </svg>
  ),
};
