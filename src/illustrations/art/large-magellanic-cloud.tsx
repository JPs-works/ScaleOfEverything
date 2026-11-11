import type { Illustration } from '../types';

// Large Magellanic Cloud — measured axis: diameter (horizontal). The irregular lavender body
// spans x = 0..100; a tilted central bar and the pink Tarantula Nebula knot sit off to the upper right.
// aspect = width / height of the bounding box: 100 / 70.
export const art: Illustration = {
  id: 'large-magellanic-cloud',
  aspect: 100 / 70,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 70" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* faint halo spilling just past the body */}
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="#C4B5FD" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0" />
        </radialGradient>
        {/* main body: lit from the upper left, fading to a darker violet rim */}
        <radialGradient id={`${uid}-body`} cx="42%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#E9E3FF" />
          <stop offset="45%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#7C6AD6" />
        </radialGradient>
        {/* central bar glow */}
        <radialGradient id={`${uid}-bar`} cx="40%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#FBFAFF" />
          <stop offset="40%" stopColor="#EDE9FE" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0" />
        </radialGradient>
        {/* Tarantula Nebula: hot pink knot */}
        <radialGradient id={`${uid}-tarantula`} cx="45%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#FFE4F1" />
          <stop offset="35%" stopColor="#F9A8D4" />
          <stop offset="70%" stopColor="#EC4899" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#DB2777" stopOpacity="0" />
        </radialGradient>
        {/* darker dust lanes */}
        <radialGradient id={`${uid}-dust`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5B4BB5" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#5B4BB5" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* halo — faint, spills a little beyond the bounding box */}
      {px > 24 && <ellipse cx="50" cy="35" rx="56" ry="40" fill={`url(#${uid}-halo)`} />}

      {/* irregular main body — touches x = 0 and x = 100 */}
      <path
        d="M0 38 C1 22 12 8 30 4.5 C44 1.5 54 11 66 6 C80 1 97 9 100 30 C100 45 92 60 78 64.5 C64 69.5 50 70 36 68 C20 66 3 56 0 38 Z"
        fill={`url(#${uid}-body)`}
        opacity={px > 24 ? 0.92 : 1}
      />

      {/* second lobe layer breaks the symmetry */}
      {px > 24 && (
        <path
          d="M8 30 C14 14 30 8 44 12 C56 15 62 22 74 20 C86 18 94 28 90 42 C86 54 72 60 56 58 C40 56 22 54 12 46 C6 41 6 36 8 30 Z"
          fill="#D6CBFF"
          opacity="0.35"
        />
      )}

      {/* dust lanes */}
      {px > 120 && (
        <g>
          <ellipse cx="30" cy="52" rx="16" ry="5" fill={`url(#${uid}-dust)`} transform="rotate(-12 30 52)" />
          <ellipse cx="62" cy="48" rx="14" ry="4.5" fill={`url(#${uid}-dust)`} transform="rotate(14 62 48)" />
          <ellipse cx="22" cy="24" rx="9" ry="3.5" fill={`url(#${uid}-dust)`} transform="rotate(-30 22 24)" />
        </g>
      )}

      {/* tilted central bar */}
      <ellipse cx="47" cy="37" rx="30" ry="8.5" fill={`url(#${uid}-bar)`} transform="rotate(-18 47 37)" />
      <ellipse cx="47" cy="37" rx="17" ry="4.5" fill="#F5F3FF" opacity={px > 24 ? 0.6 : 0.9} transform="rotate(-18 47 37)" />

      {/* Tarantula Nebula knot — off to the upper right */}
      <ellipse cx="80" cy="21" rx="12" ry="10" fill={`url(#${uid}-tarantula)`} />
      <circle cx="79" cy="20" r={px > 24 ? 2.2 : 4} fill="#FFF1F7" />
      {px > 120 && (
        <g fill="#FBCFE8" opacity="0.8">
          <circle cx="84.5" cy="24.5" r="1" />
          <circle cx="75.5" cy="17" r="0.9" />
          <circle cx="82" cy="15.5" r="0.7" />
        </g>
      )}

      {/* bright star dots */}
      {px > 24 && (
        <g fill="#FFFFFF">
          <circle cx="22" cy="30" r="1.1" />
          <circle cx="36" cy="18" r="0.9" />
          <circle cx="55" cy="28" r="1.2" />
          <circle cx="64" cy="40" r="0.9" />
          <circle cx="42" cy="47" r="1" />
          <circle cx="28" cy="56" r="0.8" />
          <circle cx="70" cy="56" r="0.9" />
          <circle cx="88" cy="38" r="0.8" />
          <circle cx="14" cy="44" r="0.8" />
          <circle cx="50" cy="60" r="0.7" />
        </g>
      )}
      {px > 120 && (
        <g fill="#F5F3FF" opacity="0.85">
          <circle cx="10" cy="35" r="0.5" />
          <circle cx="18" cy="20" r="0.5" />
          <circle cx="31" cy="40" r="0.6" />
          <circle cx="46" cy="10" r="0.5" />
          <circle cx="60" cy="16" r="0.5" />
          <circle cx="72" cy="30" r="0.6" />
          <circle cx="93" cy="27" r="0.5" />
          <circle cx="84" cy="50" r="0.5" />
          <circle cx="60" cy="63" r="0.5" />
          <circle cx="38" cy="64" r="0.5" />
          <circle cx="24" cy="48" r="0.5" />
          <circle cx="52" cy="40" r="0.5" />
          <circle cx="76" cy="44" r="0.5" />
          <circle cx="6" cy="42" r="0.4" />
          <circle cx="95" cy="36" r="0.4" />
        </g>
      )}
    </svg>
  ),
};
