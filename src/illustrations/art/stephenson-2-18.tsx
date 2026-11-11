import type { Illustration } from '../types';

// Stephenson 2-18 — measured axis: diameter (horizontal). The bloated photosphere disc spans the
// full viewBox; only the faint dusty halo and a few tenuous mass-loss plumes (opacity <= 0.35, within
// 14% of the box) spill beyond it. Unlike the Sun this is a cool red hypergiant: a handful of enormous
// convection cells mottle the surface, cool dark patches sit between them, and the limb is soft and
// dusty. Light from the upper-left, warm orange highlight at about 35%,30%, deep crimson limb at the
// lower right.
export const art: Illustration = {
  id: 'stephenson-2-18',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-photo`} cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="24%" stopColor="#F97352" />
          <stop offset="58%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </radialGradient>
        <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="82%">
          <stop offset="58%" stopColor="#450A0A" stopOpacity="0" />
          <stop offset="100%" stopColor="#450A0A" stopOpacity="0.55" />
        </radialGradient>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="84%" stopColor="#F87171" stopOpacity="0.32" />
          <stop offset="92%" stopColor="#F87171" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#F87171" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-gleam`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFEDD5" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFEDD5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-cell`} cx="45%" cy="42%" r="50%">
          <stop offset="0%" stopColor="#FDBA74" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#FB923C" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-cool`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#991B1B" stopOpacity="0.7" />
          <stop offset="70%" stopColor="#991B1B" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#991B1B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-plume`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FCA5A5" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FCA5A5" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>

      {/* dusty halo of shed gas hugging the limb */}
      <circle cx="50" cy="50" r="57" fill={`url(#${uid}-halo)`} />

      {/* tenuous mass-loss plumes drifting off the limb, never part of the silhouette */}
      {px > 24 && (
        <g>
          <ellipse cx="88" cy="18" rx="14" ry="9" fill={`url(#${uid}-plume)`} transform="rotate(-35 88 18)" />
          <ellipse cx="12" cy="80" rx="13" ry="8" fill={`url(#${uid}-plume)`} transform="rotate(-40 12 80)" />
          <ellipse cx="50" cy="-4" rx="12" ry="7" fill={`url(#${uid}-plume)`} />
          <ellipse cx="96" cy="68" rx="9" ry="12" fill={`url(#${uid}-plume)`} />
        </g>
      )}

      {/* the swollen photosphere */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-photo)`} />

      {/* a handful of giant convection cells: bright warm centres */}
      {px > 24 && (
        <g clipPath={`url(#${uid}-clip)`}>
          <circle cx="28" cy="30" r="17" fill={`url(#${uid}-cell)`} />
          <circle cx="60" cy="22" r="14" fill={`url(#${uid}-cell)`} />
          <circle cx="24" cy="62" r="15" fill={`url(#${uid}-cell)`} />
          <circle cx="54" cy="54" r="16" fill={`url(#${uid}-cell)`} />
          <circle cx="80" cy="48" r="13" fill={`url(#${uid}-cell)`} />
          <circle cx="46" cy="84" r="13" fill={`url(#${uid}-cell)`} />
        </g>
      )}

      {/* cool dark patches pooling between the cells */}
      {px > 24 && (
        <g clipPath={`url(#${uid}-clip)`}>
          <ellipse cx="44" cy="38" rx="9" ry="6" fill={`url(#${uid}-cool)`} transform="rotate(-20 44 38)" />
          <ellipse cx="70" cy="70" rx="12" ry="8" fill={`url(#${uid}-cool)`} transform="rotate(25 70 70)" />
          <ellipse cx="38" cy="70" rx="7" ry="5" fill={`url(#${uid}-cool)`} transform="rotate(10 38 70)" />
          <ellipse cx="78" cy="30" rx="6" ry="4.5" fill={`url(#${uid}-cool)`} transform="rotate(-30 78 30)" />
        </g>
      )}

      {/* intergranular lanes: soft darker seams tracing the cell boundaries */}
      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`} fill="none" stroke="#991B1B" strokeWidth="1" strokeLinecap="round" opacity="0.3">
          <path d="M10 46 q14 -6 26 2 q10 7 22 -2" />
          <path d="M40 10 q4 12 -2 22" />
          <path d="M66 36 q6 10 2 22 q-3 10 6 20" />
          <path d="M14 74 q12 -4 22 4 q10 8 24 2" />
          <path d="M60 84 q10 -6 24 -2" />
        </g>
      )}

      {/* smaller warm knots inside the large cells */}
      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`} fill="#FDBA74" opacity="0.35">
          <circle cx="30" cy="27" r="4" />
          <circle cx="62" cy="20" r="3.2" />
          <circle cx="22" cy="60" r="3.4" />
          <circle cx="56" cy="52" r="3.6" />
          <circle cx="82" cy="46" r="2.6" />
          <circle cx="45" cy="86" r="2.4" />
        </g>
      )}

      {/* soft dusty limb: the edge fades rather than cuts */}
      {px > 24 && (
        <circle cx="50" cy="50" r="49" fill="none" stroke="#F87171" strokeWidth="1.5" opacity="0.35" />
      )}

      {/* darker limb and warm highlight */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-shade)`} />
      <ellipse cx="35" cy="30" rx="18" ry="14" fill={`url(#${uid}-gleam)`} />
    </svg>
  ),
};
