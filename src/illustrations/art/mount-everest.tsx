import type { Illustration } from '../types';

// Mount Everest — measured axis: height (vertical). The summit touches y = 0, the base y = 100.
// aspect = width / height of the bounding box: 150 / 100.
// Palette from #E5E7EB (snow): highlight #F9FAFB, shade #B8BFCA; rock in cool slate greys.
export const art: Illustration = {
  id: 'mount-everest',
  aspect: 1.5,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 150 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* lit (left) rock face */}
        <linearGradient id={`${uid}-rockL`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8C95A6" />
          <stop offset="100%" stopColor="#5E6778" />
        </linearGradient>
        {/* shaded (right) rock face */}
        <linearGradient id={`${uid}-rockR`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#5A6475" />
          <stop offset="100%" stopColor="#363E4C" />
        </linearGradient>
        {/* lit snow */}
        <linearGradient id={`${uid}-snowL`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E5E7EB" />
        </linearGradient>
        {/* shaded snow */}
        <linearGradient id={`${uid}-snowR`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#D9DDE4" />
          <stop offset="100%" stopColor="#AEB6C2" />
        </linearGradient>
        <clipPath id={`${uid}-mtn`}>
          <path d="M0 100 L22 70 L34 58 L46 46 L58 24 L68 0 L80 22 L92 40 L104 50 L116 62 L132 78 L150 100 Z" />
        </clipPath>
      </defs>

      {/* whole-mountain silhouette (keeps a clean shape at tiny sizes) */}
      <path
        d="M0 100 L22 70 L34 58 L46 46 L58 24 L68 0 L80 22 L92 40 L104 50 L116 62 L132 78 L150 100 Z"
        fill={px > 24 ? `url(#${uid}-rockL)` : '#C9CFD8'}
      />

      {px > 24 && (
        <g clipPath={`url(#${uid}-mtn)`}>
          {/* shaded right face, split by the summit ridge running down to the base */}
          <path d="M68 0 L150 100 L82 100 Z" fill={`url(#${uid}-rockR)`} />

          {/* snow cap — lit side */}
          <path d="M30 62 L46 46 L58 24 L68 0 L73 20 L72 36 L66 44 L60 40 L54 52 L48 50 L42 60 L36 58 Z" fill={`url(#${uid}-snowL)`} />
          {/* snow cap — shaded side */}
          <path d="M68 0 L80 22 L92 40 L104 50 L108 56 L102 60 L96 50 L90 56 L84 44 L78 48 L73 36 L72 20 Z" fill={`url(#${uid}-snowR)`} />

          {/* snow fields lower on the flanks */}
          <path d="M8 90 L22 70 L34 58 L40 66 L30 74 L22 86 L14 100 L0 100 Z" fill={`url(#${uid}-snowL)`} opacity="0.75" />
          <path d="M116 62 L132 78 L150 100 L138 100 L126 86 L120 74 L112 68 Z" fill={`url(#${uid}-snowR)`} opacity="0.7" />
        </g>
      )}

      {px > 120 && (
        <g clipPath={`url(#${uid}-mtn)`}>
          {/* gullies and couloirs streaking down the faces */}
          <path d="M56 46 L50 64 L44 82 L40 100" stroke="#F3F4F6" strokeWidth="1.2" fill="none" opacity="0.6" strokeLinecap="round" />
          <path d="M64 40 L62 58 L58 76 L56 100" stroke="#F3F4F6" strokeWidth="0.9" fill="none" opacity="0.45" strokeLinecap="round" />
          <path d="M86 46 L92 62 L98 80 L104 100" stroke="#C4CAD4" strokeWidth="1.1" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d="M96 56 L104 70 L112 86 L118 100" stroke="#C4CAD4" strokeWidth="0.8" fill="none" opacity="0.3" strokeLinecap="round" />
          {/* summit ridge crease */}
          <path d="M68 0 L82 100" stroke="#2E3542" strokeWidth="0.8" fill="none" opacity="0.5" />
          {/* ridge-line highlights on the lit flank */}
          <path d="M22 70 L34 58 L46 46 L58 24" stroke="#FFFFFF" strokeWidth="0.9" fill="none" opacity="0.7" strokeLinecap="round" />
          {/* rock bands (the Yellow Band is a famous stripe just below the summit pyramid) */}
          <path d="M44 56 L60 50 L74 52 L90 58 L104 66" stroke="#B7A27A" strokeWidth="1.3" fill="none" opacity="0.45" />
        </g>
      )}

      {/* summit snow plume trailing east (right), inside the bounding box */}
      {px > 24 && (
        <path d="M68 1 C78 0 86 1 96 4 C104 7 110 10 118 11 C110 12 102 11 94 9 C86 7 78 5 70 3 Z" fill="#F9FAFB" opacity="0.5" />
      )}
    </svg>
  ),
};
