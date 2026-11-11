import type { Illustration } from '../types';

// Electron — measured axis: diameter (horizontal). The glowing sphere spans x = 0 to x = 100.
// Its size is only an upper bound (it may be a true point), so at large sizes a faint dashed
// ring marks the bound and a bright core sits inside the fuzzy charge cloud.
export const art: Illustration = {
  id: 'electron',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-body`} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#e6fdff" />
          <stop offset="28%" stopColor="#a5f3fc" />
          <stop offset="62%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#0e7490" />
        </radialGradient>
        <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="80%">
          <stop offset="60%" stopColor="#0c4a5e" stopOpacity="0" />
          <stop offset="100%" stopColor="#0c4a5e" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="78%" stopColor="#67E8F9" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#67E8F9" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-core`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#cffafe" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#cffafe" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* soft halo, kept within 15% of the box */}
      <circle cx="50" cy="50" r="57" fill={`url(#${uid}-halo)`} />
      {/* charge cloud: the measured sphere */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-body)`} />
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-shade)`} />
      {px > 24 && (
        <>
          {/* bright point-like core, hinting that the electron may be a true point */}
          <circle cx="50" cy="50" r="22" fill={`url(#${uid}-core)`} />
          {/* negative charge */}
          <rect x="39" y="47.5" width="22" height="5" rx="2.5" fill="#0c4a5e" opacity="0.85" />
          {/* glossy highlight, light from the upper-left */}
          <ellipse cx="35" cy="30" rx="11" ry="7" transform="rotate(-30 35 30)" fill="#ffffff" opacity="0.45" />
        </>
      )}
      {px > 120 && (
        <>
          {/* dashed ring: the experimental upper bound on its size */}
          <circle cx="50" cy="50" r="46" fill="none" stroke="#e6fdff" strokeWidth="0.9" strokeDasharray="4 4" opacity="0.5" />
          {/* a few sparkles in the cloud */}
          <circle cx="72" cy="27" r="1.3" fill="#ffffff" opacity="0.8" />
          <circle cx="24" cy="66" r="1" fill="#ffffff" opacity="0.7" />
          <circle cx="66" cy="72" r="0.9" fill="#e6fdff" opacity="0.6" />
          <circle cx="30" cy="48" r="0.8" fill="#ffffff" opacity="0.6" />
        </>
      )}
    </svg>
  ),
};
