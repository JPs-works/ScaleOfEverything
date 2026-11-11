import type { Illustration } from '../types';

// Arcturus — measured axis: diameter (horizontal). The orange giant's disc spans the full viewBox;
// only a faint warm corona (opacity <= 0.3) spills a little beyond the box.
// Flat museum style: one body gradient lit from the upper-left, a simple limb-darkening ring,
// a few soft, slightly lighter granules, a single cool spot near the limb and one arching
// prominence loop (both feet on the limb) so it reads as a star rather than a planet.
export const art: Illustration = {
  id: 'arcturus',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-body`} cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#FFD9A0" />
          <stop offset="45%" stopColor="#F6AD55" />
          <stop offset="100%" stopColor="#C9732A" />
        </radialGradient>
        <radialGradient id={`${uid}-limb`} cx="50%" cy="50%" r="50%">
          <stop offset="68%" stopColor="#7A3410" stopOpacity="0" />
          <stop offset="100%" stopColor="#7A3410" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id={`${uid}-corona`} cx="50%" cy="50%" r="50%">
          <stop offset="84%" stopColor="#F6AD55" stopOpacity="0.3" />
          <stop offset="92%" stopColor="#F6AD55" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#F6AD55" stopOpacity="0" />
        </radialGradient>
        {/* soft-edged granule: flat lighter tone fading out, no dark rim */}
        <radialGradient id={`${uid}-granule`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD79A" stopOpacity="0.42" />
          <stop offset="65%" stopColor="#FFD79A" stopOpacity="0.36" />
          <stop offset="100%" stopColor="#FFD79A" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>

      {/* faint corona hugging the limb (never more than ~15% beyond the disc) */}
      <circle cx="50" cy="50" r="57" fill={`url(#${uid}-corona)`} />

      {/* the star itself */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-body)`} />

      {/* a few huge convection granules — irregular placement so nothing pairs up into a face */}
      {px > 24 && (
        <g clipPath={`url(#${uid}-clip)`} fill={`url(#${uid}-granule)`}>
          <ellipse cx="30" cy="34" rx="19" ry="15" transform="rotate(-12 30 34)" />
          <ellipse cx="70" cy="40" rx="14" ry="11" transform="rotate(22 70 40)" />
          <ellipse cx="46" cy="72" rx="21" ry="13" transform="rotate(-6 46 72)" />
          <ellipse cx="16" cy="64" rx="9" ry="12" transform="rotate(10 16 64)" />
        </g>
      )}

      {/* one cool star spot near the lower-right limb, plus a few bright flecks when large */}
      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`}>
          <ellipse cx="81" cy="69" rx="4" ry="2.4" fill="#9A4512" opacity="0.45" transform="rotate(-35 81 69)" />
          <g fill="#FFF0CF">
            <circle cx="24" cy="28" r="1.1" opacity="0.6" />
            <circle cx="56" cy="20" r="0.8" opacity="0.5" />
            <circle cx="62" cy="62" r="0.9" opacity="0.4" />
          </g>
        </g>
      )}

      {/* limb darkening */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-limb)`} />

      {/* one arching prominence loop, both feet anchored on the upper-right limb */}
      {px > 24 && (
        <path
          d="M80.8 10.6 Q101.3 6.9 94.1 26.5"
          fill="none"
          stroke="#FFB55A"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.35"
        />
      )}
    </svg>
  ),
};
