import type { Illustration } from '../types';

// Saturn V — measured axis: height (vertical). The stack spans y = 0 (tip of the launch
// escape tower) to y = 100 (F-1 engine bells). Fins span the full 18-unit width.
// Real proportions: S-IC 42 m, S-II 25 m, S-IVB 18 m, spacecraft + LES 25 m; body 10.1 m,
// fin span ~18.9 m on a 110.6 m vehicle. aspect = 18 / 100.
const CX = 9;

export const art: Illustration = {
  id: 'saturn-v',
  aspect: 0.18,
  View: ({ uid, px }) => {
    const body = `url(#${uid}-body)`;
    const shade = `url(#${uid}-shade)`;
    const steel = `url(#${uid}-steel)`;
    const band = '#1E293B';
    const detailed = px >= 24;
    const rich = px > 120;
    return (
      <svg viewBox="0 0 18 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          {/* cream hull lit from the upper-left, warming to the object's orange on the shadow side */}
          <linearGradient id={`${uid}-body`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#FFF4E6" />
            <stop offset="45%" stopColor="#FDE3C2" />
            <stop offset="80%" stopColor="#FDBA74" />
            <stop offset="100%" stopColor="#B9681F" />
          </linearGradient>
          <linearGradient id={`${uid}-shade`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#FDBA74" />
            <stop offset="100%" stopColor="#8F4B14" />
          </linearGradient>
          <linearGradient id={`${uid}-steel`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#B4BCCB" />
            <stop offset="60%" stopColor="#6B7484" />
            <stop offset="100%" stopColor="#3B4352" />
          </linearGradient>
        </defs>

        {/* full silhouette — escape tower, capsule, three stages, fins, engines */}
        <path
          d={`M${CX} 0 L9.6 1.2 L9.6 5 L9.3 5 L9.3 8 L10.75 12.2 L10.75 19.2 L12 22.5 L12 39.5
              L13.55 43 L13.55 89 L18 96.5 L18 99 L13.2 99 L13.2 100 L4.8 100 L4.8 99 L0 99 L0 96.5
              L4.45 89 L4.45 43 L6 39.5 L6 22.5 L7.25 19.2 L7.25 12.2 L8.7 8 L8.7 5 L8.4 5 L8.4 1.2 Z`}
          fill={body}
        />

        {detailed && (
          <g>
            {/* launch escape tower: motor + lattice, steel */}
            <path d={`M${CX} 0 L9.6 1.2 L9.6 5 L8.4 5 L8.4 1.2 Z`} fill={steel} />
            <rect x="8.7" y="5" width="0.6" height="3" fill="#6B7484" />
            {/* boost protective cover over the command module */}
            <path d="M9.3 8 L10.75 12.2 L7.25 12.2 L8.7 8 Z" fill={steel} />
            {/* service module seam + SLA adapter cone */}
            <path d="M7.25 19.2 L10.75 19.2 L12 22.5 L6 22.5 Z" fill={shade} opacity="0.55" />
            {/* interstage cone between S-IVB and S-II */}
            <path d="M6 39.5 L12 39.5 L13.55 43 L4.45 43 Z" fill={shade} opacity="0.55" />

            {/* roll-pattern bands (dark slate, never pure black) */}
            {/* S-IVB forward stripes */}
            <rect x="6" y="22.5" width="1.6" height="4" fill={band} />
            <rect x="10.4" y="22.5" width="1.6" height="4" fill={band} />
            {/* S-II aft interstage stripes */}
            <rect x="4.45" y="58" width="2.3" height="4" fill={band} />
            <rect x="9" y="58" width="2.3" height="4" fill={band} />
            {/* S-IC forward skirt stripes */}
            <rect x="4.45" y="62" width="2.3" height="6" fill={band} />
            <rect x="9" y="62" width="2.3" height="6" fill={band} />
            {/* S-IC intertank / fin-region quadrants */}
            <rect x="4.45" y="78" width="2.3" height="7" fill={band} />
            <rect x="9" y="78" width="2.3" height="7" fill={band} />
            <rect x="4.45" y="90" width="2.3" height="9" fill={band} />
            <rect x="9" y="90" width="2.3" height="9" fill={band} />

            {/* engine fairings + fins */}
            <path d="M4.45 89 L0 96.5 L0 99 L4.8 99 Z" fill={shade} />
            <path d="M13.55 89 L18 96.5 L18 99 L13.2 99 Z" fill={shade} />
            <path d="M4.45 89 L2.4 96.5 L2.4 99 L4.45 99 Z" fill="#FDE3C2" opacity="0.5" />

            {/* F-1 engine bells — four visible, centre one tucked behind */}
            <path d="M7.9 96.5 L10.1 96.5 L10.7 100 L7.3 100 Z" fill="#4B5563" />
            <path d="M4.9 96.2 L6.6 96.2 L7.2 100 L4.8 100 Z" fill={steel} />
            <path d="M7.0 96.2 L8.7 96.2 L9.1 100 L6.9 100 Z" fill={steel} />
            <path d="M9.3 96.2 L11 96.2 L11.1 100 L8.9 100 Z" fill={steel} />
            <path d="M11.4 96.2 L13.1 96.2 L13.2 100 L10.8 100 Z" fill={steel} />
            {/* thrust structure skirt */}
            <rect x="4.45" y="95.4" width="9.1" height="1.2" fill="#8F4B14" opacity="0.7" />
          </g>
        )}

        {rich && (
          <g>
            {/* stage joints and tank seams */}
            <g stroke="#8F4B14" strokeWidth="0.25" opacity="0.45">
              <line x1="6" y1="30" x2="12" y2="30" />
              <line x1="4.45" y1="50" x2="13.55" y2="50" />
              <line x1="4.45" y1="70" x2="13.55" y2="70" />
              <line x1="4.45" y1="86" x2="13.55" y2="86" />
            </g>
            {/* left-edge highlight catching the upper-left light */}
            <rect x="4.9" y="43" width="0.6" height="46" fill="#FFFFFF" opacity="0.4" />
            <rect x="6.4" y="26.5" width="0.5" height="13" fill="#FFFFFF" opacity="0.4" />
            {/* small flag on the S-IC */}
            <rect x="7.2" y="71.2" width="1.7" height="1.1" fill="#F4F6FA" />
            <rect x="7.2" y="71.2" width="0.7" height="0.6" fill="#3B5BDB" />
            <rect x="7.2" y="71.9" width="1.7" height="0.2" fill="#D64545" />
            {/* command module window */}
            <rect x="8.8" y="10.2" width="0.5" height="0.7" fill="#1E293B" opacity="0.8" />
            {/* ullage / retro motor pods on the interstage */}
            <rect x="4.8" y="41" width="0.6" height="1.6" rx="0.2" fill="#6B7484" />
            <rect x="12.6" y="41" width="0.6" height="1.6" rx="0.2" fill="#6B7484" />
          </g>
        )}
      </svg>
    );
  },
};
