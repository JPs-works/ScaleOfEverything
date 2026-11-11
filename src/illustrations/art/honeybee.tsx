import type { Illustration } from '../types';

// Honeybee — measured axis: length (horizontal). Faces right: stinger at x = 0, antennae tips at x = 100.
// Wings rise to the top edge, legs reach the bottom edge. aspect = 100 / 50.
export const art: Illustration = {
  id: 'honeybee',
  aspect: 2,
  View: ({ uid, px }) => {
    const detailed = px > 24;
    const rich = px > 120;
    return (
      <svg viewBox="0 0 100 50" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${uid}-abd`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="55%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#B45309" />
          </radialGradient>
          <radialGradient id={`${uid}-thx`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="60%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#7C3A0B" />
          </radialGradient>
          <radialGradient id={`${uid}-head`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#7A5530" />
            <stop offset="60%" stopColor="#4B3419" />
            <stop offset="100%" stopColor="#2A1D0E" />
          </radialGradient>
          <linearGradient id={`${uid}-wing`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#F0F8FF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#A9CFF5" stopOpacity="0.55" />
          </linearGradient>
          <clipPath id={`${uid}-abdclip`}>
            <ellipse cx="25" cy="31" rx="25" ry="12.5" />
          </clipPath>
        </defs>

        {/* hind legs (behind body) */}
        {detailed && (
          <g fill="none" stroke="#3B2A14" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 38 L41 45 L36 50" />
            <path d="M56 40 L54 46 L50 50" />
            <path d="M63 39 L66 45 L70 50" />
          </g>
        )}

        {/* hind wing (swept back, behind forewing) */}
        <path
          d="M56 22 C 48 12, 28 8, 20 13 C 17 15.5, 26 21, 56 24 Z"
          fill={`url(#${uid}-wing)`}
          opacity={detailed ? 0.7 : 0.95}
        />

        {/* abdomen with stripes */}
        <ellipse cx="25" cy="31" rx="25" ry="12.5" fill={`url(#${uid}-abd)`} />
        {detailed && (
          <g clipPath={`url(#${uid}-abdclip)`} fill="#3B2A14">
            <path d="M10 18 Q11 31 10 44 L16 44 Q17 31 16 18 Z" />
            <path d="M22 18 Q23 31 22 44 L28 44 Q29 31 28 18 Z" />
            <path d="M34 18 Q35 31 34 44 L40 44 Q41 31 40 18 Z" />
            {/* darker tail segment toward the stinger */}
            <path d="M0 18 L5 18 Q6 31 5 44 L0 44 Z" opacity="0.85" />
          </g>
        )}
        {rich && <ellipse cx="18" cy="24" rx="9" ry="3" fill="#FEF3C7" opacity="0.35" />}

        {/* thorax */}
        <circle cx="60" cy="29" r="12" fill={`url(#${uid}-thx)`} />
        {rich && (
          <g fill="#FDE68A" opacity="0.45">
            {/* fuzz highlights */}
            <ellipse cx="56" cy="22" rx="5" ry="2.2" />
            <circle cx="63" cy="19.5" r="1" />
            <circle cx="52" cy="25" r="0.9" />
          </g>
        )}

        {/* head */}
        <circle cx="80" cy="30" r="9" fill={`url(#${uid}-head)`} />
        {/* eye */}
        <ellipse cx="84" cy="27.5" rx="3" ry="4.2" fill="#2A1F12" />
        {detailed && <circle cx="83.2" cy="25.6" r="1" fill="#FEF3C7" opacity="0.85" />}
        {/* mandible hint */}
        {rich && <path d="M86 35 Q88 37 87 39" fill="none" stroke="#2A1D0E" strokeWidth="1" strokeLinecap="round" />}

        {/* antennae — tips touch x = 100 */}
        <g fill="none" stroke={detailed ? '#3B2A14' : '#7A5530'} strokeWidth={detailed ? 1.3 : 2} strokeLinecap="round">
          <path d="M84 22 Q93 16 100 9" />
          <path d="M86 24 Q94 23 100 18" />
        </g>

        {/* forewing (swept back and up, reaches y = 0) */}
        <path
          d="M58 20 C 50 6, 28 -1, 14 2 C 9 3.5, 12 10, 24 14 C 36 18, 50 21, 58 22 Z"
          fill={`url(#${uid}-wing)`}
          opacity={detailed ? 0.8 : 1}
        />
        {detailed && (
          <g fill="none" stroke="#7FB1E8" strokeWidth="0.6" strokeLinecap="round" opacity="0.8">
            <path d="M58 21 C 48 14, 34 8, 18 4" />
            <path d="M56 21 C 46 17, 34 13, 22 12" />
            {rich && <path d="M44 15 C 42 11, 40 8, 36 5" />}
            {rich && <path d="M34 13 C 32 10, 30 7, 26 4" />}
          </g>
        )}

        {/* front legs (in front of body) */}
        {detailed && (
          <g fill="none" stroke="#3B2A14" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M54 39 L48 46 L44 50" />
            <path d="M60 41 L59 46 L55 50" />
            <path d="M67 38 L71 45 L76 50" />
          </g>
        )}
      </svg>
    );
  },
};
