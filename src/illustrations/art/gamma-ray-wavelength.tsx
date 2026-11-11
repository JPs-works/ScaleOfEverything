import type { Illustration } from '../types';

// Wavelength of a gamma ray — measured axis: length (horizontal).
// Same geometry as green-light-wavelength: one sine period, crest to crest, spans x = 0 (left tick)
// to x = 100 (right tick), with a thin dimension line and end caps above the crests.
// Drawn violet, slightly thicker and brighter for a tight high-energy look, with a few sparkle dots.
// aspect = width / height of the bounding box: 100 / 40.
const WAVE = 'M1.5 9 C20 9, 31 36.5, 50 36.5 S80 9, 98.5 9';
const BASE = '#b388ff';
const LIGHT = '#dcc8ff';
const DARK = '#7c3aed';
const SPARK = '#f3eaff';

export const art: Illustration = {
  id: 'gamma-ray-wavelength',
  aspect: 2.5,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 40" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${uid}-wave`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={LIGHT} />
          <stop offset="55%" stopColor={BASE} />
          <stop offset="100%" stopColor={DARK} />
        </linearGradient>
        <linearGradient id={`${uid}-glow`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={BASE} stopOpacity="0.12" />
          <stop offset="50%" stopColor={BASE} stopOpacity="0.35" />
          <stop offset="100%" stopColor={BASE} stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* soft halo around the wave — a touch wider than green light, it is a hotter ray */}
      {px > 24 && (
        <path d={WAVE} fill="none" stroke={`url(#${uid}-glow)`} strokeWidth="10" strokeLinecap="round" />
      )}

      {/* faint equilibrium axis */}
      {px > 120 && (
        <line x1="1.5" y1="22.75" x2="98.5" y2="22.75" stroke="#cbd5e1" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.35" />
      )}

      {/* the wave itself: one full period, slightly thicker than visible light */}
      <path
        d={WAVE}
        fill="none"
        stroke={px > 24 ? `url(#${uid}-wave)` : BASE}
        strokeWidth={px > 24 ? 3.5 : 4.5}
        strokeLinecap="round"
      />

      {/* bright core along the upper-left edge of the stroke */}
      {px > 120 && (
        <path
          d="M1.5 8.2 C20 8.2, 31 35.7, 50 35.7 S80 8.2, 98.5 8.2"
          fill="none"
          stroke={SPARK}
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.8"
        />
      )}

      {/* a few tiny sparkle dots — the high-energy shimmer */}
      {px > 60 && (
        <g fill={SPARK}>
          <circle cx="12" cy="18" r="0.7" opacity="0.9" />
          <circle cx="27" cy="33" r="0.5" opacity="0.7" />
          <circle cx="40" cy="27" r="0.9" opacity="0.95" />
          <circle cx="62" cy="21" r="0.6" opacity="0.8" />
          <circle cx="76" cy="13" r="0.8" opacity="0.9" />
          <circle cx="88" cy="24" r="0.5" opacity="0.7" />
        </g>
      )}
      {px > 120 && (
        <g stroke={SPARK} strokeWidth="0.4" strokeLinecap="round" opacity="0.75">
          {/* two four-point glints */}
          <line x1="40" y1="24.6" x2="40" y2="29.4" />
          <line x1="37.6" y1="27" x2="42.4" y2="27" />
          <line x1="76" y1="11" x2="76" y2="15" />
          <line x1="74" y1="13" x2="78" y2="13" />
        </g>
      )}

      {/* dimension line crest → crest with end caps */}
      {px > 24 && (
        <g stroke="#ede9fe" strokeWidth="1" strokeLinecap="butt" opacity="0.85">
          <line x1="0.5" y1="0" x2="0.5" y2="6" />
          <line x1="99.5" y1="0" x2="99.5" y2="6" />
          <line x1="0.5" y1="3" x2="99.5" y2="3" strokeWidth="0.6" />
        </g>
      )}

      {/* crest markers tie the ticks to the wave */}
      {px > 120 && (
        <g fill={SPARK}>
          <circle cx="1.5" cy="9" r="1.3" />
          <circle cx="98.5" cy="9" r="1.3" />
        </g>
      )}
    </svg>
  ),
};
