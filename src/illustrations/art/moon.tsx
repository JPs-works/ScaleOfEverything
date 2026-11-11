import type { Illustration } from '../types';

// The Moon — measured axis: diameter (horizontal). The disc spans the full viewBox x = 0..100.
// Palette built from #94A3B8: highlight #d8e0ea, base #94A3B8, shade #5b6a80, deep #3d4a5e.
export const art: Illustration = {
  id: 'moon',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-rock`} cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#dde4ed" />
          <stop offset="45%" stopColor="#a9b5c6" />
          <stop offset="100%" stopColor="#6b7a90" />
        </radialGradient>
        <radialGradient id={`${uid}-limb`} cx="35%" cy="30%" r="82%">
          <stop offset="58%" stopColor="#1e2a3d" stopOpacity="0" />
          <stop offset="100%" stopColor="#1e2a3d" stopOpacity="0.6" />
        </radialGradient>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="88%" stopColor="#c7d2e0" stopOpacity="0" />
          <stop offset="100%" stopColor="#c7d2e0" stopOpacity="0.22" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>

      {/* faint halo, stays within 10% of the box */}
      {px > 24 && <circle cx="50" cy="50" r="54" fill={`url(#${uid}-halo)`} />}

      {/* disc */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-rock)`} />

      {/* maria — the dark seas */}
      {px > 24 && (
        <g clipPath={`url(#${uid}-clip)`} fill="#7c8a9f" opacity="0.75">
          {/* Mare Imbrium / Oceanus Procellarum cluster, upper left */}
          <path d="M18 30c6-8 18-11 27-6 6 3 7 10 3 16-4 7-13 9-21 6-7-2-11-9-9-16z" />
          {/* Mare Serenitatis / Tranquillitatis, upper right */}
          <path d="M57 26c7-3 15 0 18 6 3 7-1 14-8 16-7 2-13-2-15-8-2-6 0-11 5-14z" />
          {/* Mare Nubium, lower left */}
          <path d="M30 60c5-3 12-2 15 3 2 4 0 9-4 11-5 2-11 0-13-4-2-4 0-8 2-10z" />
          {/* Mare Fecunditatis, right */}
          <path d="M72 50c4-2 9 0 10 4 1 5-2 9-6 9-5 0-8-4-7-8 0-2 1-4 3-5z" />
        </g>
      )}

      {/* craters: dark floor + lighter rim catching the upper-left light */}
      {px > 24 && (
        <g clipPath={`url(#${uid}-clip)`}>
          {/* Tycho, lower centre — the big one */}
          <circle cx="47" cy="80" r="7.5" fill="#5b6a80" />
          <circle cx="46.2" cy="79.2" r="6" fill="#4b5970" />
          <path d="M40.5 76.5a7.5 7.5 0 0 1 11.5-3.5" fill="none" stroke="#d2dae5" strokeWidth="1.3" strokeLinecap="round" />
          {/* Copernicus, left middle */}
          <circle cx="24" cy="48" r="5" fill="#5b6a80" />
          <circle cx="23.4" cy="47.4" r="3.9" fill="#4b5970" />
          <path d="M19.8 45.5a5 5 0 0 1 7.5-2.3" fill="none" stroke="#d2dae5" strokeWidth="1.1" strokeLinecap="round" />
          {/* Kepler, small, far left */}
          <circle cx="11" cy="58" r="3" fill="#5b6a80" />
          <circle cx="10.6" cy="57.6" r="2.2" fill="#4b5970" />
          {/* Plato, upper middle */}
          <circle cx="50" cy="14" r="4" fill="#5b6a80" />
          <circle cx="49.5" cy="13.5" r="3.1" fill="#4b5970" />
          <path d="M46.6 12a4 4 0 0 1 6-1.8" fill="none" stroke="#d2dae5" strokeWidth="1" strokeLinecap="round" />
          {/* Langrenus, right limb */}
          <circle cx="86" cy="62" r="4.5" fill="#55637a" />
          <circle cx="85.5" cy="61.5" r="3.5" fill="#46536a" />
          {/* small craters upper right */}
          <circle cx="78" cy="30" r="2.4" fill="#5b6a80" />
          <circle cx="77.7" cy="29.7" r="1.7" fill="#4b5970" />
          <circle cx="66" cy="72" r="2.8" fill="#5b6a80" />
          <circle cx="65.7" cy="71.7" r="2" fill="#4b5970" />
        </g>
      )}

      {/* fine detail — tiny craterlets and a bright ray from Tycho */}
      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`}>
          <circle cx="34" cy="22" r="1.4" fill="#6b7a90" />
          <circle cx="60" cy="42" r="1.2" fill="#6b7a90" />
          <circle cx="38" cy="92" r="1.6" fill="#6b7a90" />
          <circle cx="90" cy="45" r="1.3" fill="#55637a" />
          <circle cx="16" cy="74" r="1.8" fill="#6b7a90" />
          <circle cx="70" cy="88" r="1.5" fill="#55637a" />
          <circle cx="27" cy="36" r="1.1" fill="#8d9aae" />
          {/* bright ejecta rays from Tycho */}
          <g stroke="#e2e8f0" strokeWidth="0.9" strokeLinecap="round" opacity="0.4" fill="none">
            <path d="M47 71 L45 54" />
            <path d="M52 73 L62 58" />
            <path d="M41 74 L30 65" />
            <path d="M54 80 L70 80" />
          </g>
        </g>
      )}

      {/* limb shade — darker toward the lower right */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-limb)`} />
    </svg>
  ),
};
