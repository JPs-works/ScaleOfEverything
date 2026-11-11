import type { Illustration } from '../types';

// Wavelength of green light — measured axis: length (horizontal).
// One sine period, crest to crest, spans x = 0 (left tick) to x = 100 (right tick).
// A thin dimension line with end caps sits above the crests; the wave fills the rest of the box.
// aspect = width / height of the bounding box: 100 / 40.
const WAVE = 'M1.5 9 C20 9, 31 36.5, 50 36.5 S80 9, 98.5 9';

export const art: Illustration = {
  id: 'green-light-wavelength',
  aspect: 2.5,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 40" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${uid}-wave`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="55%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id={`${uid}-glow`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#4ade80" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* soft halo around the wave */}
      {px > 24 && (
        <path d={WAVE} fill="none" stroke={`url(#${uid}-glow)`} strokeWidth="9" strokeLinecap="round" />
      )}

      {/* faint equilibrium axis */}
      {px > 120 && (
        <line x1="1.5" y1="22.75" x2="98.5" y2="22.75" stroke="#cbd5e1" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.35" />
      )}

      {/* the wave itself: one full period */}
      <path
        d={WAVE}
        fill="none"
        stroke={px > 24 ? `url(#${uid}-wave)` : '#4ade80'}
        strokeWidth={px > 24 ? 3 : 4}
        strokeLinecap="round"
      />

      {/* upper-left highlight along the wave */}
      {px > 120 && (
        <path
          d="M1.5 8.3 C20 8.3, 31 35.8, 50 35.8 S80 8.3, 98.5 8.3"
          fill="none"
          stroke="#dcfce7"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.7"
        />
      )}

      {/* dimension line crest → crest with end caps */}
      {px > 24 && (
        <g stroke="#e2e8f0" strokeWidth="1" strokeLinecap="butt" opacity="0.85">
          <line x1="0.5" y1="0" x2="0.5" y2="6" />
          <line x1="99.5" y1="0" x2="99.5" y2="6" />
          <line x1="0.5" y1="3" x2="99.5" y2="3" strokeWidth="0.6" />
        </g>
      )}

      {/* crest markers tie the ticks to the wave */}
      {px > 120 && (
        <g fill="#f0fdf4">
          <circle cx="1.5" cy="9" r="1.2" />
          <circle cx="98.5" cy="9" r="1.2" />
        </g>
      )}
    </svg>
  ),
};
