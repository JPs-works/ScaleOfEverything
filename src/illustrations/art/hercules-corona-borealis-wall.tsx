import type { Illustration } from '../types';

// Hercules–Corona Borealis Great Wall — measured axis: length (horizontal). The filament spans x = 0..100.
// aspect = width / height of the bounding box: 100 / 24. A proposed (speculative) structure, so it is
// drawn as a soft, translucent band of galaxies rather than a solid object.
// Tangents are horizontal at x = 0 and x = 100 so the wide strokes end square on the box edge.
const SPINE = 'M0 12.5 C7 12.5 18 8.3 28 10.8 C38 13.3 46 16 56 14.5 C66 13 72 9 82 9.4 C89 9.7 93 12 100 12';

export const art: Illustration = {
  id: 'hercules-corona-borealis-wall',
  aspect: 100 / 24,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 24" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* band colour runs from violet shade at the ends to the pink base in the middle */}
        <linearGradient id={`${uid}-band`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="30%" stopColor="#F0ABFC" />
          <stop offset="70%" stopColor="#F0ABFC" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        {/* brighter core of the filament */}
        <linearGradient id={`${uid}-core`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#F0ABFC" />
          <stop offset="50%" stopColor="#FAE8FF" />
          <stop offset="100%" stopColor="#F0ABFC" />
        </linearGradient>
        {/* galaxy knot glow */}
        <radialGradient id={`${uid}-knot`} cx="45%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FDF4FF" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#F5D0FE" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#F0ABFC" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* faint halo (allowed spill, low opacity) */}
      <path d={SPINE} fill="none" stroke="#C084FC" strokeWidth="20" strokeOpacity="0.11" strokeLinecap="butt" />

      {/* layered translucent band — soft edges come from the stacked strokes */}
      <path d={SPINE} fill="none" stroke={`url(#${uid}-band)`} strokeWidth="15" strokeOpacity={px < 24 ? 0.55 : 0.36} strokeLinecap="butt" />
      <path d={SPINE} fill="none" stroke={`url(#${uid}-band)`} strokeWidth="9.5" strokeOpacity={px < 24 ? 0.7 : 0.42} strokeLinecap="butt" />
      <path d={SPINE} fill="none" stroke={`url(#${uid}-core)`} strokeWidth="4.5" strokeOpacity={px < 24 ? 0.95 : 0.6} strokeLinecap="butt" />

      {px > 24 && (
        <g>
          {/* brighter knots: galaxy clusters strung along the wall */}
          <ellipse cx="14" cy="9.6" rx="5.5" ry="3.6" fill={`url(#${uid}-knot)`} />
          <ellipse cx="33" cy="11.9" rx="6.5" ry="4" fill={`url(#${uid}-knot)`} />
          <ellipse cx="52" cy="15" rx="7" ry="4.4" fill={`url(#${uid}-knot)`} />
          <ellipse cx="72" cy="10.2" rx="5.5" ry="3.6" fill={`url(#${uid}-knot)`} />
          <ellipse cx="90" cy="11.4" rx="5" ry="3.3" fill={`url(#${uid}-knot)`} />
        </g>
      )}

      {px > 120 && (
        <g>
          {/* fine strands weaving through the band */}
          <path d="M2 10.5 C14 6.5 22 7 30 9.5 C40 12.5 48 13 58 11.5 C68 10 74 7 84 8 C91 8.6 96 10.5 99 11" fill="none" stroke="#FAE8FF" strokeWidth="0.35" strokeOpacity="0.45" />
          <path d="M1 15 C10 12 18 11.5 27 13.5 C37 16 45 18.5 55 17 C66 15.5 73 12 82 12 C90 12 95 14 100 13.5" fill="none" stroke="#F5D0FE" strokeWidth="0.35" strokeOpacity="0.4" />
          <path d="M6 13.5 C16 10.5 24 10.5 34 12.5 C44 14.5 50 16.5 60 15 C70 13.5 76 9.5 86 10 C92 10.3 96 11.5 100 12" fill="none" stroke="#E879F9" strokeWidth="0.3" strokeOpacity="0.35" />
          {/* individual galaxies: fine dots, brightest near the knots */}
          <g fill="#FDF4FF">
            <circle cx="12.5" cy="9.2" r="0.45" fillOpacity="0.95" />
            <circle cx="16" cy="10.6" r="0.3" fillOpacity="0.8" />
            <circle cx="31.5" cy="11.2" r="0.5" fillOpacity="0.95" />
            <circle cx="35.5" cy="12.8" r="0.3" fillOpacity="0.8" />
            <circle cx="50.5" cy="14.4" r="0.55" fillOpacity="0.95" />
            <circle cx="54.5" cy="15.8" r="0.35" fillOpacity="0.85" />
            <circle cx="71" cy="9.6" r="0.45" fillOpacity="0.95" />
            <circle cx="74" cy="11" r="0.3" fillOpacity="0.8" />
            <circle cx="89" cy="11" r="0.4" fillOpacity="0.9" />
            <circle cx="92" cy="12.2" r="0.28" fillOpacity="0.75" />
          </g>
          <g fill="#F5D0FE">
            <circle cx="4" cy="12.2" r="0.3" fillOpacity="0.7" />
            <circle cx="8" cy="10.4" r="0.25" fillOpacity="0.6" />
            <circle cx="22" cy="9.4" r="0.3" fillOpacity="0.65" />
            <circle cx="25" cy="12.6" r="0.25" fillOpacity="0.6" />
            <circle cx="41" cy="14.6" r="0.3" fillOpacity="0.65" />
            <circle cx="44" cy="12.4" r="0.25" fillOpacity="0.6" />
            <circle cx="61" cy="13.4" r="0.3" fillOpacity="0.65" />
            <circle cx="65" cy="11.2" r="0.25" fillOpacity="0.6" />
            <circle cx="79" cy="8.8" r="0.3" fillOpacity="0.65" />
            <circle cx="84" cy="10.8" r="0.25" fillOpacity="0.6" />
            <circle cx="97" cy="11.6" r="0.3" fillOpacity="0.65" />
          </g>
          {/* a few stray galaxies at the band's soft edges */}
          <g fill="#E9D5FF">
            <circle cx="19" cy="4.6" r="0.22" fillOpacity="0.5" />
            <circle cx="47" cy="21.2" r="0.22" fillOpacity="0.5" />
            <circle cx="68" cy="4.2" r="0.22" fillOpacity="0.5" />
            <circle cx="86" cy="17.4" r="0.22" fillOpacity="0.5" />
          </g>
        </g>
      )}
    </svg>
  ),
};
