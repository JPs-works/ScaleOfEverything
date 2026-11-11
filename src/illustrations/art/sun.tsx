import type { Illustration } from '../types';

// The Sun — measured axis: diameter (horizontal). The photosphere disc spans the full viewBox;
// only the faint corona glow, a few soft rays and two prominence loops (opacity <= 0.35, within 14%
// of the box) spill beyond it. Light from the upper-left, hot pale-yellow highlight at about 35%,30%,
// deeper orange limb at the lower right, dark sunspot groups along the equatorial band.
export const art: Illustration = {
  id: 'sun',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-photo`} cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#FFF4C2" />
          <stop offset="22%" stopColor="#FDD26A" />
          <stop offset="58%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#C2410C" />
        </radialGradient>
        <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="82%">
          <stop offset="60%" stopColor="#7C2D12" stopOpacity="0" />
          <stop offset="100%" stopColor="#7C2D12" stopOpacity="0.45" />
        </radialGradient>
        <radialGradient id={`${uid}-corona`} cx="50%" cy="50%" r="50%">
          <stop offset="86%" stopColor="#FDBA4A" stopOpacity="0.35" />
          <stop offset="92%" stopColor="#FDBA4A" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#FDBA4A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-gleam`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFBEB" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-cell`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE7A3" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFE7A3" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>

      {/* faint corona glow hugging the limb */}
      <circle cx="50" cy="50" r="57" fill={`url(#${uid}-corona)`} />

      {/* soft corona rays — faint streamers, never part of the silhouette */}
      {px > 24 && (
        <g fill="#FDBA4A" opacity="0.22">
          <path d="M50 -7 L53 43 L47 43 Z" />
          <path d="M50 107 L53 57 L47 57 Z" />
          <path d="M-7 50 L43 47 L43 53 Z" />
          <path d="M107 50 L57 47 L57 53 Z" />
          <path d="M90 10 L55 42 L58 45 Z" />
          <path d="M10 90 L45 58 L42 55 Z" />
          <path d="M10 10 L42 45 L45 42 Z" />
          <path d="M90 90 L58 55 L55 58 Z" />
        </g>
      )}

      {/* prominence loops arching just beyond the limb */}
      {px > 24 && (
        <g fill="none" stroke="#FDBA4A" strokeWidth="1.4" strokeLinecap="round" opacity="0.35">
          <path d="M84 20 Q96 20 98 32" />
          <path d="M26 96 Q16 94 12 85" />
        </g>
      )}

      {/* the photosphere */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-photo)`} />

      {/* granulation: large soft convection cells over the bright hemisphere */}
      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`}>
          <circle cx="24" cy="26" r="9" fill={`url(#${uid}-cell)`} />
          <circle cx="44" cy="16" r="8" fill={`url(#${uid}-cell)`} />
          <circle cx="58" cy="30" r="10" fill={`url(#${uid}-cell)`} />
          <circle cx="18" cy="48" r="8" fill={`url(#${uid}-cell)`} />
          <circle cx="40" cy="44" r="9" fill={`url(#${uid}-cell)`} />
          <circle cx="70" cy="48" r="8" fill={`url(#${uid}-cell)`} />
          <circle cx="30" cy="66" r="8" fill={`url(#${uid}-cell)`} />
          <circle cx="56" cy="64" r="9" fill={`url(#${uid}-cell)`} />
          <circle cx="78" cy="70" r="7" fill={`url(#${uid}-cell)`} />
          <circle cx="46" cy="84" r="7" fill={`url(#${uid}-cell)`} />
        </g>
      )}

      {/* filaments: faint darker arcs tracing magnetic structure */}
      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`} fill="none" stroke="#B45309" strokeWidth="0.9" strokeLinecap="round" opacity="0.35">
          <path d="M12 44 q8 -7 20 -5" />
          <path d="M48 14 q10 1 15 7" />
          <path d="M64 78 q10 -8 22 -8" />
          <path d="M24 74 q5 6 13 6" />
        </g>
      )}

      {/* sunspot groups along the equatorial band: dark umbra inside a softer penumbra */}
      {px > 24 && (
        <g clipPath={`url(#${uid}-clip)`}>
          <ellipse cx="33" cy="56" rx="5.2" ry="3.6" fill="#B45309" opacity="0.85" />
          <ellipse cx="33" cy="56" rx="2.8" ry="1.9" fill="#5C1D0A" />
          <ellipse cx="41" cy="60" rx="2.6" ry="1.9" fill="#B45309" opacity="0.85" />
          <ellipse cx="41" cy="60" rx="1.3" ry="0.9" fill="#5C1D0A" />
          <ellipse cx="68" cy="40" rx="4" ry="2.9" fill="#B45309" opacity="0.85" />
          <ellipse cx="68" cy="40" rx="2.1" ry="1.5" fill="#5C1D0A" />
          <ellipse cx="74" cy="44" rx="2" ry="1.5" fill="#B45309" opacity="0.85" />
          <ellipse cx="74" cy="44" rx="1" ry="0.7" fill="#5C1D0A" />
        </g>
      )}
      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`}>
          <ellipse cx="56" cy="80" rx="2.4" ry="1.7" fill="#B45309" opacity="0.8" />
          <ellipse cx="56" cy="80" rx="1.1" ry="0.8" fill="#5C1D0A" />
          <ellipse cx="22" cy="34" rx="1.8" ry="1.3" fill="#B45309" opacity="0.8" />
          <ellipse cx="22" cy="34" rx="0.8" ry="0.6" fill="#5C1D0A" />
        </g>
      )}

      {/* darker limb and soft highlight */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-shade)`} />
      <ellipse cx="35" cy="30" rx="17" ry="13" fill={`url(#${uid}-gleam)`} />
    </svg>
  ),
};
