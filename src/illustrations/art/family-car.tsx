import type { Illustration } from '../types';

// Family Car (Toyota Corolla sedan) — measured axis: length (horizontal).
// Side profile facing right; rear bumper touches x = 0, front bumper touches x = 100.
// Roof touches y = 0 and tyres sit on y = 32. aspect = 100 / 32 (a Corolla is ~4.63 m long and ~1.44 m tall).
export const art: Illustration = {
  id: 'family-car',
  aspect: 3.125,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 32" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#67D3FA" />
          <stop offset="45%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#0B7FC2" />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#3B5F8A" />
          <stop offset="100%" stopColor="#13284A" />
        </linearGradient>
        <linearGradient id={`${uid}-sill`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0B7FC2" />
          <stop offset="100%" stopColor="#065B8F" />
        </linearGradient>
        <radialGradient id={`${uid}-rim`} cx="40%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#94A3B8" />
        </radialGradient>
      </defs>

      {/* tyres (behind the body so the arches read cleanly) */}
      <circle cx="21" cy="26.5" r="5.5" fill="#1F2937" />
      <circle cx="78" cy="26.5" r="5.5" fill="#1F2937" />

      {/* body silhouette: trunk, cabin, hood, bumpers, wheel arches */}
      <path
        d="M0 24 L0 17 Q0 14.2 3 13.6 L23 12.2 L32.5 2.6 Q34.5 0 38.5 0 L60 0 Q64 0 66.8 2 L78 11.2 L94 13 Q100 14 100 18 L100 24 Q100 27 96 27 L87.5 27 A9.5 9.5 0 0 0 68.5 27 L30.5 27 A9.5 9.5 0 0 0 11.5 27 L4 27 Q0 27 0 24 Z"
        fill={`url(#${uid}-body)`}
      />
      {/* darker sill / lower body band */}
      <path
        d="M4 27 L11.5 27 A9.5 9.5 0 0 1 12.63 22.5 L85.37 22.5 A9.5 9.5 0 0 1 87.5 27 L96 27 Q100 27 100 24 L100 22.5 L0 22.5 L0 24 Q0 27 4 27 Z"
        fill={`url(#${uid}-sill)`}
        opacity="0.75"
      />

      {/* glasshouse */}
      <path
        d="M25.5 11.6 L34 3.2 Q35.5 1.9 38.5 1.9 L60 1.9 Q63 1.9 65.2 3.6 L74.8 11.6 Z"
        fill={`url(#${uid}-glass)`}
      />
      {px > 24 && (
        <>
          {/* B-pillar splitting front and rear side windows */}
          <rect x="47.5" y="1.9" width="1.8" height="9.7" fill="#0A77B5" />
          {/* glass highlight (light from upper-left) */}
          <path d="M36.5 3.4 L46 3.4 L42.5 9 L34 9 Z" fill="#9CDFFF" opacity="0.3" />
          <path d="M51 3.4 L60.5 3.4 L63.5 7 L54 7 Z" fill="#9CDFFF" opacity="0.22" />
        </>
      )}

      {/* lamps */}
      <path d="M94.5 14.3 L99.2 15.4 Q100 16 100 17.2 L100 17.4 L94.5 16.6 Z" fill="#FDF6C8" />
      <path d="M0 15.4 Q0.3 14.6 1.5 14.4 L4.5 14.3 L4.5 16.8 L0 17.2 Z" fill="#F0556B" />

      {/* wheel rims and hubs */}
      <circle cx="21" cy="26.5" r="3.2" fill={`url(#${uid}-rim)`} />
      <circle cx="78" cy="26.5" r="3.2" fill={`url(#${uid}-rim)`} />
      {px > 24 && (
        <>
          <circle cx="21" cy="26.5" r="1" fill="#475569" />
          <circle cx="78" cy="26.5" r="1" fill="#475569" />
        </>
      )}

      {px > 120 && (
        <>
          {/* door seams */}
          <path d="M48.4 12.4 L47.8 26.2" stroke="#0A77B5" strokeWidth="0.5" fill="none" opacity="0.8" />
          <path d="M26.2 13 L25 22" stroke="#0A77B5" strokeWidth="0.5" fill="none" opacity="0.7" />
          <path d="M76.3 12.3 L75 22" stroke="#0A77B5" strokeWidth="0.5" fill="none" opacity="0.7" />
          {/* door handles */}
          <rect x="39.5" y="14.6" width="4" height="1.1" rx="0.55" fill="#075985" />
          <rect x="61.5" y="14.6" width="4" height="1.1" rx="0.55" fill="#075985" />
          {/* wing mirror */}
          <path d="M74.5 8.6 L78.2 8.6 Q79.4 8.6 79.4 9.8 L79.4 10.4 Q79.4 11.3 78.4 11.3 L74.5 11.3 Z" fill="#0EA5E9" />
          {/* roof and hood highlight */}
          <path d="M38.5 0.9 L60 0.9" stroke="#C7EEFF" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.55" />
          <path d="M80 12.6 L93 14" stroke="#C7EEFF" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.45" />
          {/* wheel spokes */}
          <path d="M21 23.6 L21 29.4 M18.1 26.5 L23.9 26.5 M19 24.5 L23 28.5 M23 24.5 L19 28.5" stroke="#64748B" strokeWidth="0.5" fill="none" />
          <path d="M78 23.6 L78 29.4 M75.1 26.5 L80.9 26.5 M76 24.5 L80 28.5 M80 24.5 L76 28.5" stroke="#64748B" strokeWidth="0.5" fill="none" />
          {/* bumper trim */}
          <path d="M96 20 L99.5 20" stroke="#065B8F" strokeWidth="0.6" strokeLinecap="round" fill="none" />
          <path d="M0.5 20 L4 20" stroke="#065B8F" strokeWidth="0.6" strokeLinecap="round" fill="none" />
        </>
      )}
    </svg>
  ),
};
