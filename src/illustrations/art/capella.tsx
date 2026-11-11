import type { Illustration } from '../types';

// Capella — measured axis: diameter (horizontal). The yellow giant's disc spans the full viewBox;
// only a faint golden corona (opacity <= 0.3) spills a little beyond the box.
// Flat museum style matching arcturus.tsx: one warm golden body gradient lit from the upper-left,
// a single soft highlight, a gentle limb-darkening ring at the lower right, and a few faint
// granulation patches once the disc is large. Flatter and calmer than the Sun: no rays, no spots.
export const art: Illustration = {
  id: 'capella',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-body`} cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#FFF0C4" />
          <stop offset="40%" stopColor="#FFD27A" />
          <stop offset="100%" stopColor="#D49A3A" />
        </radialGradient>
        <radialGradient id={`${uid}-limb`} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#8A5A14" stopOpacity="0" />
          <stop offset="100%" stopColor="#8A5A14" stopOpacity="0.42" />
        </radialGradient>
        <radialGradient id={`${uid}-corona`} cx="50%" cy="50%" r="50%">
          <stop offset="84%" stopColor="#FFD27A" stopOpacity="0.3" />
          <stop offset="92%" stopColor="#FFD27A" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FFD27A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-gleam`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBEA" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFFBEA" stopOpacity="0" />
        </radialGradient>
        {/* soft-edged granule: flat lighter tone fading out, no dark rim */}
        <radialGradient id={`${uid}-granule`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE7A8" stopOpacity="0.34" />
          <stop offset="65%" stopColor="#FFE7A8" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FFE7A8" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>

      {/* faint golden corona hugging the limb (never more than ~15% beyond the disc) */}
      <circle cx="50" cy="50" r="57" fill={`url(#${uid}-corona)`} />

      {/* the star itself */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-body)`} />

      {/* a few faint convection granules — irregular placement so nothing pairs up into a face */}
      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`} fill={`url(#${uid}-granule)`}>
          <ellipse cx="62" cy="30" rx="16" ry="12" transform="rotate(18 62 30)" />
          <ellipse cx="28" cy="58" rx="14" ry="17" transform="rotate(-10 28 58)" />
          <ellipse cx="58" cy="74" rx="20" ry="12" transform="rotate(-8 58 74)" />
          <ellipse cx="80" cy="52" rx="9" ry="12" transform="rotate(14 80 52)" />
          <ellipse cx="40" cy="20" rx="11" ry="8" transform="rotate(-20 40 20)" />
        </g>
      )}

      {/* one small cool patch near the lower-right limb and a couple of bright flecks when large */}
      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`}>
          <ellipse cx="78" cy="76" rx="3.4" ry="2" fill="#B8761E" opacity="0.32" transform="rotate(-38 78 76)" />
          <g fill="#FFF7DC">
            <circle cx="22" cy="30" r="1" opacity="0.5" />
            <circle cx="54" cy="46" r="0.8" opacity="0.4" />
          </g>
        </g>
      )}

      {/* limb darkening, gentle at the lower right */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-limb)`} />

      {/* a single soft highlight at the upper-left */}
      {px > 24 && <ellipse cx="35" cy="30" rx="18" ry="14" fill={`url(#${uid}-gleam)`} />}
    </svg>
  ),
};
