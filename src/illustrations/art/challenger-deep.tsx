import type { Illustration } from '../types';

// Challenger Deep — measured axis: depth (vertical). Ocean surface at y = 0, trench floor at y = 100.
// A cross-section: open water over the abyssal plain, with the trench cutting down to the deepest point,
// a survey ship at the surface and a sounding line dropping to a tiny submersible on the floor.
// aspect = width / height of the bounding box: 60 / 100.
export const art: Illustration = {
  id: 'challenger-deep',
  aspect: 0.6,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 60 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${uid}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5ccbf9" />
          <stop offset="25%" stopColor="#1aa3e3" />
          <stop offset="55%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0b3f73" />
        </linearGradient>
        <linearGradient id={`${uid}-side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#031a3a" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={`${uid}-rockL`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#6e7d99" />
          <stop offset="100%" stopColor="#3b4860" />
        </linearGradient>
        <linearGradient id={`${uid}-rockR`} x1="1" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#56647f" />
          <stop offset="100%" stopColor="#2f3a50" />
        </linearGradient>
        <radialGradient id={`${uid}-lamp`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* water column */}
      <rect x="0" y="0" width="60" height="100" fill={`url(#${uid}-water)`} />
      <rect x="0" y="0" width="60" height="100" fill={`url(#${uid}-side)`} />
      {/* sunlight shafts fading into the twilight zone */}
      {px > 40 && (
        <g fill="#e0f2fe" opacity="0.16">
          <path d="M9 1 L15 1 L19 42 L16 44 Z" />
          <path d="M23 1 L27 1 L29 36 L27 37 Z" />
          <path d="M39 1 L46 1 L47 30 L44 31 Z" />
        </g>
      )}
      {/* abyssal plain and trench walls — left face catches the light */}
      <path d="M0 46 L9 47 L15 50 L19 56 L22 66 L25 80 L27.5 94 L28.3 100 L0 100 Z" fill={`url(#${uid}-rockL)`} />
      <path d="M60 44 L51 45.5 L44 49 L39 55 L36 66 L33.5 80 L32 94 L31.4 100 L60 100 Z" fill={`url(#${uid}-rockR)`} />
      {/* lit rim along the left wall */}
      {px > 40 && (
        <path d="M0 46 L9 47 L15 50 L19 56 L22 66 L25 80 L27.5 94 L28.3 100" fill="none" stroke="#9aa7c0" strokeWidth="0.6" opacity="0.5" />
      )}
      {/* sediment strata */}
      {px > 120 && (
        <g stroke="#8a97b0" strokeWidth="0.5" fill="none" opacity="0.4">
          <path d="M0 54 L10 55.5 L16 59" />
          <path d="M0 64 L14 65.5 L20 69" />
          <path d="M0 76 L19 77.5 L24 80" />
          <path d="M60 52 L50 53.5 L43 57" />
          <path d="M60 62 L48 63.5 L40 67" />
          <path d="M60 74 L45 75.5 L36 79" />
        </g>
      )}
      {/* surface waves */}
      <path d="M0 0 H60 V2.2 Q55 3.8 50 2.2 T40 2.2 T30 2.2 T20 2.2 T10 2.2 T0 2.2 Z" fill="#bae6fd" opacity="0.92" />
      {/* survey ship, sounding line and submersible on the floor */}
      {px > 24 && (
        <g>
          <line x1="30" y1="3.4" x2="30" y2="95" stroke="#e0f2fe" strokeWidth="0.35" opacity="0.55" />
          <path d="M25.5 0.8 H33.6 L35.4 2.2 L33.2 3.6 H27 L25.5 2.2 Z" fill="#1e293b" />
          <rect x="28.4" y="0.1" width="3" height="1" rx="0.3" fill="#f1f5f9" />
          <circle cx="30" cy="95.5" r="4.5" fill={`url(#${uid}-lamp)`} />
          <ellipse cx="30" cy="95.6" rx="1.7" ry="1.1" fill="#f59e0b" />
          <circle cx="30.6" cy="95.4" r="0.45" fill="#fff7ed" />
        </g>
      )}
      {/* rising bubbles */}
      {px > 120 && (
        <g fill="#e0f2fe" opacity="0.6">
          <circle cx="31.2" cy="88" r="0.45" />
          <circle cx="29.1" cy="82" r="0.35" />
          <circle cx="31.5" cy="76" r="0.3" />
        </g>
      )}
    </svg>
  ),
};
