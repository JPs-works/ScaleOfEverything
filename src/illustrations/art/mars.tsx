import type { Illustration } from '../types';

// Mars — measured axis: diameter (horizontal). The rusty disc spans the full viewBox.
// Palette built from #E07A4F: highlight #F3A77F, base #E07A4F, shade #9C4326, deep #6B2A17.
export const art: Illustration = {
  id: 'mars',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-surface`} cx="36%" cy="31%" r="78%">
          <stop offset="0%" stopColor="#f3a77f" />
          <stop offset="50%" stopColor="#e07a4f" />
          <stop offset="100%" stopColor="#8f3b21" />
        </radialGradient>
        <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="80%">
          <stop offset="58%" stopColor="#2a0d05" stopOpacity="0" />
          <stop offset="100%" stopColor="#2a0d05" stopOpacity="0.6" />
        </radialGradient>
        <radialGradient id={`${uid}-haze`} cx="50%" cy="50%" r="50%">
          <stop offset="90%" stopColor="#f6b58f" stopOpacity="0" />
          <stop offset="100%" stopColor="#f6b58f" stopOpacity="0.3" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>

      {/* globe */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-surface)`} />

      {px > 12 && (
        <g clipPath={`url(#${uid}-clip)`}>
          {/* dark volcanic lowlands (Syrtis Major / Acidalia) */}
          <g fill="#9c4326" opacity="0.75">
            <path d="M58 12c7-3 15 0 19 6 3 5 1 11-3 15-4 4-10 3-13-1-3-5-5-14-3-20z" />
            <path d="M18 30c5-3 11-1 13 4 1 5-3 9-7 10-5 1-9-3-9-7 0-3 1-5 3-7z" />
            <path d="M62 62c6-2 13 0 16 5 2 4-1 9-5 11-5 2-11 0-13-4-2-4-1-9 2-12z" />
          </g>
          {/* Valles Marineris — the great canyon */}
          <path
            d="M30 56c8-2 16-4 26-4.5 9-0.5 17 1 24 3.5-7 0.5-15 0.5-24 1.5-9 1-18 2-26-0.5z"
            fill="#6b2a17"
            opacity="0.8"
          />
          {/* bright dusty highlands (Tharsis / Arabia) */}
          <g fill="#f3a77f" opacity="0.55">
            <path d="M28 38c6-4 14-3 18 1 3 3 1 7-3 8-6 2-13 1-16-2-2-2-2-5 1-7z" />
            <ellipse cx="70" cy="42" rx="9" ry="4" />
          </g>
          {/* polar caps */}
          <ellipse cx="50" cy="2" rx="17" ry="6" fill="#fbeee6" opacity="0.95" />
          <ellipse cx="48" cy="99" rx="11" ry="4" fill="#fbeee6" opacity="0.8" />
        </g>
      )}

      {px > 40 && (
        <g clipPath={`url(#${uid}-clip)`}>
          {/* Olympus Mons and the Tharsis volcanoes */}
          <circle cx="24" cy="44" r="4.2" fill="#c8623c" opacity="0.7" />
          <circle cx="24" cy="44" r="1.1" fill="#9c4326" opacity="0.8" />
          <circle cx="31" cy="36" r="1.8" fill="#c8623c" opacity="0.7" />
          <circle cx="35" cy="42" r="1.6" fill="#c8623c" opacity="0.7" />
          <circle cx="38" cy="48" r="1.4" fill="#c8623c" opacity="0.7" />
          {/* Hellas basin and scattered craters */}
          <ellipse cx="70" cy="78" rx="7" ry="5" fill="#f0996f" opacity="0.5" />
          <circle cx="82" cy="58" r="2.5" fill="#8f3b21" opacity="0.6" />
          <circle cx="82.6" cy="58.4" r="1.4" fill="#f0996f" opacity="0.6" />
          <circle cx="56" cy="80" r="1.8" fill="#8f3b21" opacity="0.55" />
          <circle cx="20" cy="68" r="2.2" fill="#8f3b21" opacity="0.5" />
          <circle cx="20.5" cy="68.4" r="1.2" fill="#f0996f" opacity="0.55" />
        </g>
      )}

      {/* limb shading and thin dusty atmosphere */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-shade)`} />
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-haze)`} />
    </svg>
  ),
};
