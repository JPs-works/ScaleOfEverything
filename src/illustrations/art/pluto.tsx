import type { Illustration } from '../types';

// Pluto — measured axis: diameter (horizontal). The disc spans the full viewBox.
// Identifying details: the pale heart (Sputnik Planitia / Tombaugh Regio) on the lower right
// and the dark reddish "whale" (Cthulhu Macula) along the left of the equator.
export const art: Illustration = {
  id: 'pluto',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-ice`} cx="35%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#f2dcbf" />
          <stop offset="50%" stopColor="#d9b38c" />
          <stop offset="100%" stopColor="#8a6244" />
        </radialGradient>
        <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="80%">
          <stop offset="58%" stopColor="#2a1a10" stopOpacity="0" />
          <stop offset="100%" stopColor="#2a1a10" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id={`${uid}-heart`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fbf3e6" />
          <stop offset="100%" stopColor="#e8d3b6" />
        </radialGradient>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="90%" stopColor="#e9c9a3" stopOpacity="0" />
          <stop offset="100%" stopColor="#e9c9a3" stopOpacity="0.3" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>

      {/* base icy disc */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-ice)`} />

      {px > 12 && (
        <g clipPath={`url(#${uid}-clip)`}>
          {/* Cthulhu Macula — dark reddish band on the left of the equator */}
          <path
            d="M-4 44c8-4 18-5 28-3 8 2 14 6 20 11 3 3 2 7-2 9-8 3-16 2-24 0-9-2-16-6-22-9-3-2-3-6 0-8z"
            fill="#8f5a3e"
            opacity="0.85"
          />
          {/* darker equatorial mottling under the band */}
          <path
            d="M6 56c6-1 13 0 19 2 4 2 3 5-1 6-7 1-13 0-18-2-3-1-3-5 0-6z"
            fill="#6e4530"
            opacity="0.6"
          />
          {/* Sputnik Planitia — the pale heart, lower right */}
          <path
            d="M57 46c4-5 11-6 15-1 4-5 11-4 14 1 3 6 1 13-4 19-5 6-11 11-14 15-4-6-9-11-12-17-3-6-3-13 1-17z"
            fill={`url(#${uid}-heart)`}
          />
          {/* faint lobe seam on the heart */}
          {px > 60 && (
            <path d="M72 47c-1 6-1 13 0 19" stroke="#e2cdae" strokeWidth="1.2" fill="none" opacity="0.6" strokeLinecap="round" />
          )}
        </g>
      )}

      {px > 40 && (
        <g clipPath={`url(#${uid}-clip)`}>
          {/* northern tholin-tinted patches */}
          <ellipse cx="38" cy="18" rx="9" ry="4.5" fill="#b98a66" opacity="0.5" />
          <ellipse cx="60" cy="27" rx="6" ry="3" fill="#c49973" opacity="0.45" />
          <ellipse cx="22" cy="30" rx="5" ry="2.5" fill="#c49973" opacity="0.4" />
          {/* bright polar frost */}
          <ellipse cx="46" cy="3" rx="20" ry="6" fill="#f7ead7" opacity="0.7" />
          {/* southern pits and ridges */}
          <ellipse cx="40" cy="78" rx="7" ry="3" fill="#a87a58" opacity="0.5" />
          <ellipse cx="26" cy="72" rx="4" ry="2" fill="#a87a58" opacity="0.45" />
          <ellipse cx="80" cy="76" rx="5" ry="2.5" fill="#f3e3cc" opacity="0.5" />
        </g>
      )}

      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`}>
          {/* cellular texture on the nitrogen ice plain */}
          <circle cx="65" cy="54" r="2.2" fill="#f3e6d3" opacity="0.8" />
          <circle cx="78" cy="59" r="2.6" fill="#f3e6d3" opacity="0.8" />
          <circle cx="80" cy="51" r="2" fill="#f3e6d3" opacity="0.8" />
          <circle cx="66" cy="63" r="2" fill="#f3e6d3" opacity="0.8" />
          <circle cx="77" cy="68" r="1.6" fill="#f3e6d3" opacity="0.8" />
          {/* small craters on the highlands */}
          <circle cx="30" cy="22" r="2" fill="#b58b67" opacity="0.6" />
          <circle cx="31" cy="21" r="1.1" fill="#e9d2b5" opacity="0.7" />
          <circle cx="52" cy="36" r="1.6" fill="#b58b67" opacity="0.6" />
          <circle cx="53" cy="35" r="0.9" fill="#e9d2b5" opacity="0.7" />
          <circle cx="56" cy="84" r="1.8" fill="#9a6f50" opacity="0.6" />
          <circle cx="57" cy="83" r="1" fill="#e9d2b5" opacity="0.7" />
          {/* soft specular highlight, upper left */}
          <ellipse cx="33" cy="27" rx="12" ry="8" fill="#fff6ea" opacity="0.18" />
        </g>
      )}

      {/* limb shading, lower right */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-shade)`} />
      {/* faint thin atmosphere halo */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-halo)`} />
    </svg>
  ),
};
