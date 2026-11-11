import type { Illustration } from '../types';

// House cat — measured axis: length, nose to base of tail (horizontal). The cat stands facing right:
// the raised tail at x = 0, the nose at x = 100. Tail-tip reaches y = 0, paws rest on y = 80.
// aspect = width / height of the bounding box: 100 / 80.
const BASE = '#A8A29E';
const LIGHT = '#D3CEC9';
const SHADE = '#7C7671';
const DARK = '#5A5551';
const PINK = '#E8A3A3';
const EYE = '#C9D96A';
const PUPIL = '#2B2A30';

export const art: Illustration = {
  id: 'house-cat',
  aspect: 1.25,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 80" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={LIGHT} />
          <stop offset="45%" stopColor={BASE} />
          <stop offset="100%" stopColor={SHADE} />
        </linearGradient>
        <radialGradient id={`${uid}-head`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={LIGHT} />
          <stop offset="55%" stopColor={BASE} />
          <stop offset="100%" stopColor={SHADE} />
        </radialGradient>
      </defs>

      {/* tail — raised, hooking forward at the tip */}
      <path
        d="M9 46 C3.5 39 2.5 24 3.4 12 C4.1 4.4 9.5 2.5 14.5 5"
        fill="none"
        stroke={px > 24 ? SHADE : BASE}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* far legs (behind) */}
      <rect x="5" y="55" width="8.5" height="25" rx="3.5" fill={DARK} />
      <rect x="57" y="55" width="8" height="25" rx="3.5" fill={DARK} />

      {/* neck / chest — joins the body to the head */}
      <path d="M62 40 C68 30 80 28 88 36 C89 44 85 50 78 53 L62 52 Z" fill={BASE} />
      {/* body */}
      <path
        d="M70 38 C56 29 28 30 12 40 C3 46 3.5 59 13 63 L68 64 C78 63 80 50 70 38 Z"
        fill={`url(#${uid}-body)`}
      />
      {/* haunch */}
      <ellipse cx="17" cy="53" rx="11" ry="9" fill={LIGHT} opacity="0.22" />

      {/* near legs */}
      <rect x="13" y="57" width="9" height="23" rx="3.5" fill={BASE} />
      <rect x="65" y="57" width="9" height="23" rx="3.5" fill={BASE} />
      {/* paws */}
      {px > 24 && (
        <g fill={LIGHT} opacity="0.7">
          <ellipse cx="18.5" cy="78.5" rx="4.5" ry="1.8" />
          <ellipse cx="70.5" cy="78.5" rx="4.5" ry="1.8" />
        </g>
      )}

      {/* ears */}
      <path d="M74 25 L75.5 10.5 L84.5 19.5 Z" fill={SHADE} />
      <path d="M88 19.5 L95 10.5 L97.5 26 Z" fill={BASE} />
      {px > 24 && (
        <g fill={PINK} opacity="0.85">
          <path d="M76.5 22 L77 14 L82 19 Z" />
          <path d="M89.5 20 L94 15 L95.5 24 Z" />
        </g>
      )}

      {/* head */}
      <circle cx="85" cy="32" r="13" fill={`url(#${uid}-head)`} />
      {/* muzzle — the nose reaches x = 100 */}
      <ellipse cx="94.5" cy="37" rx="5.5" ry="4.4" fill={LIGHT} opacity="0.9" />
      <path d="M97.5 35.2 L100 36.4 L98.2 38.4 Z" fill={PINK} />

      {px > 24 && (
        <>
          {/* eye */}
          <ellipse cx="90" cy="29.5" rx="2.6" ry="2.1" fill={EYE} />
          <ellipse cx="90.4" cy="29.5" rx="0.8" ry="1.8" fill={PUPIL} />
          {/* mouth */}
          <path d="M96 40.5 Q94.5 42.5 92.5 41" fill="none" stroke={SHADE} strokeWidth="0.8" strokeLinecap="round" />
        </>
      )}

      {px > 120 && (
        <g>
          {/* tabby stripes along the back */}
          <g fill="none" stroke={DARK} strokeWidth="1.4" strokeLinecap="round" opacity="0.6">
            <path d="M26 35.5 Q25 41 27.5 46" />
            <path d="M36 33.5 Q35.5 39.5 38 45" />
            <path d="M46 33 Q46 39 48.5 44.5" />
            <path d="M56 34 Q56.5 39.5 59 44" />
            {/* tail rings */}
            <path d="M1.2 20 Q4 21 6.8 19.5" />
            <path d="M1.4 28 Q4.3 29 7.3 27.5" />
          </g>
          {/* forehead marks */}
          <g fill="none" stroke={DARK} strokeWidth="1" strokeLinecap="round" opacity="0.55">
            <path d="M83 22.5 L82.5 27" />
            <path d="M86.5 21.5 L86.5 26.5" />
          </g>
          {/* whiskers */}
          <g fill="none" stroke={LIGHT} strokeWidth="0.6" strokeLinecap="round" opacity="0.75">
            <path d="M91.5 37.5 L83 36" />
            <path d="M91.5 38.8 L83 39.5" />
            <path d="M91.5 40 L84 43" />
          </g>
        </g>
      )}
    </svg>
  ),
};
