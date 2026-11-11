import type { Illustration } from '../types';

// Ceres — measured axis: diameter (horizontal). The disc spans the full viewBox.
// Grey-beige dwarf planet, heavily cratered, with the bright salt spots of Occator crater.
export const art: Illustration = {
  id: 'ceres',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-body`} cx="35%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#dcd8cc" />
          <stop offset="50%" stopColor="#b8b4a8" />
          <stop offset="100%" stopColor="#5e5a52" />
        </radialGradient>
        <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="80%">
          <stop offset="55%" stopColor="#1a1812" stopOpacity="0" />
          <stop offset="100%" stopColor="#1a1812" stopOpacity="0.55" />
        </radialGradient>
        <radialGradient id={`${uid}-spot`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f2f0ea" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f2f0ea" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>

      {/* body */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-body)`} />

      {/* craters: dark floor + lighter rim on the upper-left (light source) */}
      {px > 24 && (
        <g clipPath={`url(#${uid}-clip)`}>
          {/* large crater lower-left */}
          <ellipse cx="30" cy="68" rx="11" ry="9" fill="#8a867a" />
          <ellipse cx="31" cy="69" rx="9" ry="7" fill="#777369" />
          <path d="M20 65 Q24 58 34 59" stroke="#cfcbbf" strokeWidth="1.2" fill="none" opacity="0.7" />
          {/* Occator crater, upper-right */}
          <ellipse cx="66" cy="34" rx="9" ry="7.5" fill="#8f8b7f" />
          <ellipse cx="67" cy="35" rx="7" ry="5.6" fill="#7d796e" />
          <path d="M58 32 Q62 27 69 27" stroke="#d6d2c6" strokeWidth="1.1" fill="none" opacity="0.7" />
          {/* mid-size craters */}
          <ellipse cx="22" cy="36" rx="5" ry="4.2" fill="#8c8878" />
          <ellipse cx="22.6" cy="36.6" rx="3.8" ry="3.1" fill="#7a766a" />
          <ellipse cx="50" cy="52" rx="4.2" ry="3.6" fill="#8d897d" />
          <ellipse cx="50.5" cy="52.5" rx="3.1" ry="2.6" fill="#7b776c" />
          <ellipse cx="70" cy="66" rx="5.5" ry="4.6" fill="#7e7a70" />
          <ellipse cx="70.6" cy="66.6" rx="4.2" ry="3.4" fill="#6a665d" />
          <ellipse cx="44" cy="84" rx="4.5" ry="3.4" fill="#726e65" />
          <ellipse cx="44.4" cy="84.5" rx="3.3" ry="2.4" fill="#625e56" />
        </g>
      )}

      {/* small craters only when there is room for them */}
      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`}>
          <ellipse cx="40" cy="22" rx="2.6" ry="2.2" fill="#8a867a" />
          <ellipse cx="40.3" cy="22.3" rx="1.8" ry="1.5" fill="#777369" />
          <ellipse cx="56" cy="14" rx="2" ry="1.7" fill="#9a968a" />
          <ellipse cx="56.2" cy="14.2" rx="1.4" ry="1.2" fill="#868276" />
          <ellipse cx="82" cy="48" rx="2.8" ry="2.4" fill="#767268" />
          <ellipse cx="82.3" cy="48.3" rx="2" ry="1.7" fill="#64605a" />
          <ellipse cx="60" cy="74" rx="2.3" ry="1.9" fill="#7a766c" />
          <ellipse cx="60.2" cy="74.2" rx="1.6" ry="1.3" fill="#67635b" />
          <ellipse cx="12" cy="52" rx="2.4" ry="2" fill="#8a867a" />
          <ellipse cx="12.3" cy="52.3" rx="1.7" ry="1.4" fill="#767268" />
          <ellipse cx="34" cy="46" rx="1.6" ry="1.3" fill="#8c8878" />
          <ellipse cx="78" cy="78" rx="1.8" ry="1.5" fill="#5f5b53" />
          <ellipse cx="28" cy="88" rx="1.6" ry="1.3" fill="#5e5a52" />
          <ellipse cx="16" cy="24" rx="1.5" ry="1.3" fill="#a19d91" />
          {/* faint mottled terrain */}
          <path d="M10 44 Q16 41 22 45 Q17 48 11 47z" fill="#a39f93" opacity="0.35" />
          <path d="M54 22 Q62 18 72 22 Q64 26 56 25z" fill="#cbc7bb" opacity="0.3" />
        </g>
      )}

      {/* Occator bright spots — the identifying detail; a single dot when tiny */}
      {px > 24 ? (
        <g>
          <circle cx="66" cy="34.5" r="4.2" fill={`url(#${uid}-spot)`} />
          <circle cx="66" cy="34.5" r="2" fill="#fbfaf6" />
          <circle cx="70.5" cy="36.5" r="1" fill="#f4f2ec" opacity="0.9" />
          {px > 120 && <circle cx="69.2" cy="38" r="0.6" fill="#f4f2ec" opacity="0.8" />}
        </g>
      ) : (
        <circle cx="66" cy="35" r="3" fill="#f6f4ee" />
      )}

      {/* lower-right limb shading */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-shade)`} />
    </svg>
  ),
};
