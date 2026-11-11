import type { Illustration } from '../types';

// Ant — measured axis: body length (horizontal). Side view facing right: the gaster's rear
// touches x = 0 and the mandible tips touch x = 100. Legs reach y = 50, antennae reach y ≈ 0.
// aspect = width / height of the bounding box: 100 / 50.
const BASE = '#92400E';
const LIGHT = '#d3772b';
const DARK = '#5a2608';
const LEG_NEAR = '#7a3410';
const LEG_FAR = '#4c2008';

export const art: Illustration = {
  id: 'ant',
  aspect: 2,
  View: ({ uid, px }) => {
    const legW = px < 24 ? 3 : 1.5;
    const legs = (
      <>
        {/* hind leg — sweeps back over the gaster */}
        <path d="M46 30 L37 20 L29 36 L22 49.4" />
        {/* middle leg */}
        <path d="M54 32 L52 40 L55 49.4" />
        {/* front leg */}
        <path d="M61 30 L70 25 L74 38 L80 49.4" />
      </>
    );
    return (
      <svg viewBox="0 0 100 50" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${uid}-body`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor={LIGHT} />
            <stop offset="55%" stopColor={BASE} />
            <stop offset="100%" stopColor={DARK} />
          </radialGradient>
          <radialGradient id={`${uid}-head`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#c4681f" />
            <stop offset="55%" stopColor="#7e360c" />
            <stop offset="100%" stopColor="#4e2007" />
          </radialGradient>
        </defs>

        {/* far legs (behind the body) */}
        <g fill="none" stroke={LEG_FAR} strokeWidth={legW} strokeLinecap="round" strokeLinejoin="round" transform="translate(3 0)">
          {legs}
        </g>

        {/* antennae — elbowed, reaching the top of the box */}
        <g fill="none" stroke={LEG_NEAR} strokeWidth={px < 24 ? 2.2 : 1.3} strokeLinecap="round" strokeLinejoin="round">
          <path d="M78 16 L72 6 L80 0.8" />
          <path d="M81 15.5 L78 5 L87 1.2" />
        </g>

        {/* gaster (abdomen) */}
        <ellipse cx="19" cy="27" rx="19" ry="12" fill={`url(#${uid}-body)`} />
        {/* petiole */}
        <ellipse cx="40.5" cy="27" rx="3.5" ry="2.8" fill={DARK} />
        {/* mesosoma (thorax) */}
        <ellipse cx="54" cy="25.5" rx="12" ry="8" fill={`url(#${uid}-body)`} />
        {/* neck */}
        <rect x="64" y="22.5" width="7" height="5" rx="2.5" fill={DARK} />
        {/* head */}
        <ellipse cx="81" cy="24.5" rx="12" ry="9.5" fill={`url(#${uid}-head)`} />
        {/* mandibles — pincers meeting at x = 100 */}
        <path d="M88 19.5 C95 18.5 99.6 23 100 27.5 L98.4 27.5 C97.4 24.2 93.6 22 88 23.2 Z" fill={DARK} />
        <path d="M88 29.5 C93.5 30.8 97.5 30 98.4 27.5 L100 27.5 C99.4 31.2 94.5 33 88 32.2 Z" fill={DARK} />

        {/* near legs */}
        <g fill="none" stroke={LEG_NEAR} strokeWidth={legW} strokeLinecap="round" strokeLinejoin="round">
          {legs}
        </g>

        {/* eye */}
        {px > 24 && <circle cx="85.5" cy="21.5" r="1.9" fill="#2a1507" />}
        {px > 120 && <circle cx="84.9" cy="20.9" r="0.6" fill="#f3d9c0" opacity="0.85" />}

        {/* rich detail: gaster segment seams and a sheen */}
        {px > 120 && (
          <g fill="none" stroke="#3d1a05" strokeWidth="0.9" opacity="0.5" strokeLinecap="round">
            <path d="M14 15.9 Q10 27 14 38.1" />
            <path d="M24 15.7 Q21 27 24 38.3" />
            <path d="M32 18.3 Q30.5 27 32 35.7" />
          </g>
        )}
        {px > 120 && (
          <g fill="#f0b47a" opacity="0.35">
            <ellipse cx="12" cy="20" rx="5" ry="2.4" transform="rotate(-20 12 20)" />
            <ellipse cx="50" cy="20.5" rx="3.2" ry="1.5" transform="rotate(-15 50 20.5)" />
            <ellipse cx="77" cy="19" rx="3" ry="1.4" transform="rotate(-15 77 19)" />
          </g>
        )}
      </svg>
    );
  },
};
