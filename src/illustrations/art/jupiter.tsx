import type { Illustration } from '../types';

// Jupiter — measured axis: diameter (horizontal). The disc spans the full viewBox.
// Horizontal cloud belts (dark) and zones (light) built from the base colour #D97706,
// with the Great Red Spot in the southern hemisphere (lower half of the disc).
export const art: Illustration = {
  id: 'jupiter',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-base`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#F6D9A6" />
          <stop offset="55%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#8A4A08" />
        </radialGradient>
        <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="80%">
          <stop offset="50%" stopColor="#3a1d05" stopOpacity="0" />
          <stop offset="100%" stopColor="#3a1d05" stopOpacity="0.6" />
        </radialGradient>
        <radialGradient id={`${uid}-hilite`} cx="35%" cy="30%" r="45%">
          <stop offset="0%" stopColor="#FFF4DC" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFF4DC" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="91%" stopColor="#F5B860" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F5B860" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-spot`} cx="40%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#E8703E" />
          <stop offset="70%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#8F2E0A" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>

      {/* faint halo, stays within 15% of the box */}
      <circle cx="50" cy="50" r="54" fill={`url(#${uid}-halo)`} />

      {/* solid disc */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-base)`} />

      {/* cloud belts and zones */}
      {px > 12 && (
        <g clipPath={`url(#${uid}-clip)`}>
          {/* north polar region */}
          <rect x="0" y="0" width="100" height="11" fill="#B9742A" />
          {/* north temperate zone */}
          <rect x="0" y="11" width="100" height="9" fill="#F1D5A4" />
          {/* north temperate belt */}
          <rect x="0" y="20" width="100" height="7" fill="#B8651A" />
          {/* north tropical zone */}
          <rect x="0" y="27" width="100" height="10" fill="#F6E1B8" />
          {/* north equatorial belt */}
          <rect x="0" y="37" width="100" height="8" fill="#C77A24" />
          {/* equatorial zone */}
          <rect x="0" y="45" width="100" height="11" fill="#F2CF95" />
          {/* south equatorial belt */}
          <rect x="0" y="56" width="100" height="9" fill="#A6560E" />
          {/* south tropical zone */}
          <rect x="0" y="65" width="100" height="9" fill="#EFC98F" />
          {/* south temperate belt */}
          <rect x="0" y="74" width="100" height="7" fill="#B8651A" />
          {/* south temperate zone */}
          <rect x="0" y="81" width="100" height="9" fill="#EBCDA0" />
          {/* south polar region */}
          <rect x="0" y="90" width="100" height="10" fill="#B9742A" />
        </g>
      )}

      {/* turbulent band edges and festoons, only at generous sizes */}
      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`}>
          {/* gentle scalloped belt edges */}
          <path d="M0 20 C 12 19, 22 21.5, 34 20.5 S 56 18.8, 68 20.5 S 90 21.5, 100 20 L100 21.6 C 88 23, 74 21.2, 60 21.8 S 36 23, 24 21.6 S 8 21.6, 0 22 Z" fill="#F1D5A4" opacity="0.9" />
          <path d="M0 45 C 14 43.8, 28 46.2, 42 45 S 66 43.6, 80 45.2 S 94 46, 100 45 L100 46.6 C 86 48, 70 46.4, 56 46.8 S 32 48, 18 46.4 S 6 46.6, 0 47 Z" fill="#F2CF95" opacity="0.85" />
          <path d="M0 56 C 14 55, 28 57.4, 42 56.2 S 64 54.8, 78 56.4 S 94 57.2, 100 56 L100 57.6 C 88 59, 72 57.4, 58 57.8 S 32 59, 18 57.4 S 6 57.6, 0 58 Z" fill="#A6560E" opacity="0.9" />
          <path d="M0 74 C 14 73, 28 75.4, 42 74.2 S 64 72.8, 80 74.4 S 94 75.2, 100 74 L100 75.6 C 88 77, 74 75.4, 60 75.8 S 34 77, 20 75.4 S 6 75.6, 0 76 Z" fill="#B8651A" opacity="0.9" />
          {/* darker streaks within the equatorial belts */}
          <rect x="8" y="40" width="40" height="1.4" rx="0.7" fill="#9A5210" opacity="0.6" />
          <rect x="58" y="41.5" width="30" height="1.2" rx="0.6" fill="#9A5210" opacity="0.5" />
          <rect x="4" y="59" width="34" height="1.4" rx="0.7" fill="#7E400A" opacity="0.5" />
          <rect x="12" y="24" width="28" height="1.1" rx="0.55" fill="#9A5210" opacity="0.5" />
          {/* small white ovals in the southern temperate zone */}
          <ellipse cx="22" cy="78" rx="3.2" ry="1.3" fill="#FBEFD6" opacity="0.8" />
          <ellipse cx="33" cy="84" rx="2.6" ry="1.1" fill="#FBEFD6" opacity="0.75" />
        </g>
      )}

      {/* Great Red Spot, southern hemisphere */}
      {px > 12 && (
        <g clipPath={`url(#${uid}-clip)`}>
          {/* pale wake around the storm */}
          {px > 40 && <ellipse cx="64" cy="61.5" rx="15" ry="7.5" fill="#F3D9A8" opacity="0.7" />}
          <ellipse cx="64" cy="61.5" rx="11.5" ry="5.6" fill={`url(#${uid}-spot)`} />
          {px > 40 && <ellipse cx="62" cy="60.5" rx="6" ry="2.6" fill="#E67A4A" opacity="0.55" />}
        </g>
      )}

      {/* volume: upper-left highlight, lower-right limb shade */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-hilite)`} />
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-shade)`} />
    </svg>
  ),
};
