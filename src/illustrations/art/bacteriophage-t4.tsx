import type { Illustration } from '../types';

// T4 bacteriophage — measured axis: length (horizontal). The phage lies on its side:
// the icosahedral head touches x = 0, the tail-tube spike touches x = 100 (head-to-baseplate
// is the quoted length), and the long tail fibres fold back to land level with it.
// aspect = width / height of the bounding box: 100 / 70.
const BASE = '#34D399';
const LIGHT = '#9BF2D2';
const DARK = '#0E8F63';
const DEEP = '#0A5E44';

export const art: Illustration = {
  id: 'bacteriophage-t4',
  aspect: 100 / 70,
  View: ({ uid, px }) => {
    const tiny = px < 24;
    const fiberStyle = {
      stroke: DARK,
      strokeWidth: tiny ? 3.2 : 1.4,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
      fill: 'none',
    };
    return (
      <svg viewBox="0 0 100 70" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${uid}-head`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor={LIGHT} />
            <stop offset="45%" stopColor={BASE} />
            <stop offset="100%" stopColor={DEEP} />
          </radialGradient>
          <linearGradient id={`${uid}-sheath`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={LIGHT} />
            <stop offset="45%" stopColor={BASE} />
            <stop offset="100%" stopColor={DEEP} />
          </linearGradient>
          <linearGradient id={`${uid}-plate`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={BASE} />
            <stop offset="100%" stopColor={DEEP} />
          </linearGradient>
          <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor={BASE} stopOpacity="0.25" />
            <stop offset="100%" stopColor={BASE} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* faint halo behind the head */}
        {!tiny && <ellipse cx="23" cy="35" rx="28" ry="25" fill={`url(#${uid}-halo)`} />}

        {/* long tail fibres: lunar-lander legs, kinked, feet landing level with the spike */}
        <g {...fiberStyle}>
          {!tiny && <path d="M94 31.5 L77 16 L100 9" opacity="0.65" />}
          {!tiny && <path d="M94 38.5 L77 54 L100 61" opacity="0.65" />}
          <path d="M94 29.5 L72 11 L100 2" />
          <path d="M94 40.5 L72 59 L100 68" />
        </g>
        {px > 48 && (
          <g fill={LIGHT}>
            <circle cx="72" cy="11" r="1.3" />
            <circle cx="72" cy="59" r="1.3" />
            <circle cx="77" cy="16" r="1" opacity="0.7" />
            <circle cx="77" cy="54" r="1" opacity="0.7" />
            <circle cx="99" cy="2.3" r="1.3" />
            <circle cx="99" cy="67.7" r="1.3" />
            <circle cx="99" cy="9.3" r="1" opacity="0.7" />
            <circle cx="99" cy="60.7" r="1" opacity="0.7" />
          </g>
        )}

        {/* neck and collar */}
        <rect x="45" y="30.5" width="8" height="9" fill={DEEP} />
        <ellipse cx="52.5" cy="35" rx="1.6" ry="7.5" fill={LIGHT} />

        {/* contractile tail sheath */}
        <rect x="52" y={tiny ? 29 : 30} width="40" height={tiny ? 12 : 10} rx="1.5" fill={`url(#${uid}-sheath)`} />
        {px > 120 && (
          <path
            d="M55 30 V40 M58 30 V40 M61 30 V40 M64 30 V40 M67 30 V40 M70 30 V40 M73 30 V40 M76 30 V40 M79 30 V40 M82 30 V40 M85 30 V40 M88 30 V40"
            stroke={DEEP}
            strokeWidth="0.7"
            opacity="0.45"
          />
        )}

        {/* baseplate, tail-tube spike (touches x = 100) and short tail fibres */}
        <polygon points="91,28 96,26.5 96,43.5 91,42" fill={`url(#${uid}-plate)`} />
        <rect x="95.5" y="33.5" width="4.5" height="3" rx="1" fill={LIGHT} />
        {px > 120 && (
          <path d="M95 27 L98 23 M95 43 L98 47 M93 27.5 L92 23.5 M93 42.5 L92 46.5" stroke={DARK} strokeWidth="0.9" strokeLinecap="round" />
        )}

        {/* icosahedral head: elongated hexagon lying on its side */}
        <polygon points="0,35 11,19 35,19 46,35 35,51 11,51" fill={`url(#${uid}-head)`} />
        {!tiny && (
          <g>
            {/* upper-left facets catch the light */}
            <polygon points="0,35 11,19 15,35" fill="#ffffff" opacity="0.3" />
            <polygon points="11,19 35,19 31,35 15,35" fill="#ffffff" opacity="0.16" />
            {/* lower-right facets fall into shade */}
            <polygon points="31,35 35,51 46,35" fill={DEEP} opacity="0.45" />
            <polygon points="15,35 31,35 35,51 11,51" fill={DEEP} opacity="0.3" />
            <polygon points="0,35 15,35 11,51" fill={DEEP} opacity="0.12" />
          </g>
        )}
        {px > 120 && (
          <g fill="none" strokeLinecap="round">
            {/* facet edges */}
            <path
              d="M0 35 L15 35 L11 19 M15 35 L11 51 M15 35 L31 35 L46 35 M31 35 L35 19 M31 35 L35 51"
              stroke={LIGHT}
              strokeWidth="0.6"
              opacity="0.45"
            />
            {/* packed DNA glimpsed inside */}
            <path d="M9 31 Q16 26 23 31 T37 31 M9 39 Q16 44 23 39 T37 39" stroke="#ffffff" strokeWidth="0.8" opacity="0.22" />
          </g>
        )}
      </svg>
    );
  },
};
