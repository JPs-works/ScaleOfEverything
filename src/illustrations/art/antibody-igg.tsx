import type { Illustration } from '../types';

// Antibody (IgG) — measured axis: length (horizontal). The Y spans x = 0 (left Fab tip) to x = 100
// (right Fab tip); the Fc stem reaches y = 100 and the arm tips touch y = 0, so aspect = 1.
// Two heavy chains (stem + inner arm) and two shorter light chains (outer arm), hinge in the middle.
const heavyL = 'M44 95 L44 52 L14 5.2';
const heavyR = 'M56 95 L56 52 L86 5.2';
const lightL = 'M29.96 49.47 L4.95 11.1';
const lightR = 'M70.04 49.47 L95.05 11.1';

export const art: Illustration = {
  id: 'antibody-igg',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${uid}-heavy`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="45%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#C2660A" />
        </linearGradient>
        <linearGradient id={`${uid}-light`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="45%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#E08A12" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#FBBF24" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
      </defs>

      {px > 40 && <circle cx="50" cy="50" r="57" fill={`url(#${uid}-glow)`} />}

      {/* heavy chains: Fc stem up through the hinge and along the inside of each Fab arm */}
      <g fill="none" stroke={`url(#${uid}-heavy)`} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
        <path d={heavyL} />
        <path d={heavyR} />
      </g>
      {/* light chains: run along the outside of each Fab arm */}
      <g fill="none" stroke={`url(#${uid}-light)`} strokeWidth="10" strokeLinecap="round">
        <path d={lightL} />
        <path d={lightR} />
      </g>

      {px > 60 && (
        <>
          {/* soft upper-left highlight running down each chain */}
          <g
            fill="none"
            stroke="#FFF4C2"
            strokeOpacity="0.42"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(-1.3 -1.3)"
          >
            <path d={heavyL} />
            <path d={heavyR} />
            <path d={lightL} />
            <path d={lightR} />
          </g>
          {/* domain boundaries (variable/constant on the arms, CH2/CH3 on the stem) */}
          <g stroke="#92400E" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round">
            <line x1="25.06" y1="31.33" x2="33.44" y2="25.87" />
            <line x1="13.27" y1="33.01" x2="21.65" y2="27.55" />
            <line x1="74.94" y1="31.33" x2="66.56" y2="25.87" />
            <line x1="86.73" y1="33.01" x2="78.35" y2="27.55" />
            <line x1="39" y1="76" x2="49" y2="76" />
            <line x1="51" y1="76" x2="61" y2="76" />
          </g>
          {/* hinge disulfide bonds joining the two heavy chains */}
          <g stroke="#FFF7D6" strokeWidth="1.3" strokeLinecap="round">
            <line x1="48.6" y1="56" x2="51.4" y2="56" />
            <line x1="48.6" y1="59.8" x2="51.4" y2="59.8" />
          </g>
        </>
      )}

      {px > 120 && (
        <>
          {/* heavy–light disulfide bond on each arm */}
          <g stroke="#FFF7D6" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.9">
            <line x1="20.2" y1="19.8" x2="15.8" y2="22.7" />
            <line x1="79.8" y1="19.8" x2="84.2" y2="22.7" />
          </g>
          {/* Fc glycan tucked between the CH2 domains */}
          <g fill="#FEF3C7" opacity="0.95">
            <circle cx="50" cy="65" r="1.5" />
            <circle cx="48.4" cy="67.6" r="1.4" />
            <circle cx="51.6" cy="67.6" r="1.4" />
            <circle cx="50" cy="70.1" r="1.3" />
          </g>
          {/* antigen-binding clefts at the Fab tips */}
          <g fill="#B45309" opacity="0.45">
            <circle cx="9.6" cy="7.4" r="1.6" />
            <circle cx="90.4" cy="7.4" r="1.6" />
          </g>
        </>
      )}
    </svg>
  ),
};
