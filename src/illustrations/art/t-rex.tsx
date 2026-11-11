import type { Illustration } from '../types';

// Tyrannosaurus rex — measured axis: length (horizontal). Tail tip at x = 0, snout tip at x = 100.
// Facing right, body held horizontal, feet on the ground at y = 40. aspect = 100 / 40.
const BODY =
  'M0 11 C14 8 28 5 40 6 C48 3 58 4 66 9 C72 9 76 4 82 2 C87 0 95 0.5 100 6 ' +
  'C100 9 100 12 99 13.5 C97.5 16 92 17.5 85 17 C80 17.5 77 20 74 24 ' +
  'C70 29.5 60 31 50 28.5 C44 27 40 23 36 19 C26 15 12 12 0 11 Z';

export const art: Illustration = {
  id: 't-rex',
  aspect: 2.5,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 40" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${uid}-hide`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#B4EC4A" />
          <stop offset="50%" stopColor="#84CC16" />
          <stop offset="100%" stopColor="#5A9A0E" />
        </linearGradient>
        <linearGradient id={`${uid}-leg`} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="12" y2="40">
          <stop offset="0%" stopColor="#98DC26" />
          <stop offset="100%" stopColor="#629F0F" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <path d={BODY} />
        </clipPath>
      </defs>

      {/* far leg (behind body) */}
      <path
        d="M38 14 C46 14 52 19 51 26 L47 33 L48 36 L54 38 L56 40 L39 40 L41 36 L43 32 L43 24 C40 22 38 18 38 14 Z"
        fill="#4F8A0B"
      />

      {/* body silhouette: tail, torso, neck, head */}
      <path d={BODY} fill={`url(#${uid}-hide)`} />

      {/* belly and lower jaw, lighter */}
      {px > 24 && (
        <g clipPath={`url(#${uid}-clip)`} fill="#D9F99D" opacity="0.75">
          <ellipse cx="62" cy="31.5" rx="26" ry="6" />
          <ellipse cx="92" cy="17.5" rx="8" ry="2.4" />
        </g>
      )}

      {/* back stripes */}
      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`} fill="none" stroke="#4F8A0B" strokeWidth="1.3" strokeLinecap="round" opacity="0.55">
          <path d="M18 7 Q20.5 10 18.5 13.5" />
          <path d="M28 5.5 Q30.5 10 28 15" />
          <path d="M47 3.5 Q49.5 9 46 15" />
          <path d="M57 4.5 Q59.5 10 56 16" />
          <path d="M75 7 Q78 10 76 14" />
        </g>
      )}

      {/* near leg */}
      <path
        d="M45 14 C53 14 59 19 58 26 L54 33 L55 36 L61 38 L63 40 L46 40 L48 36 L50 32 L50 24 C47 22 45 18 45 14 Z"
        fill={`url(#${uid}-leg)`}
      />
      {/* claws on the near foot */}
      {px > 60 && (
        <g fill="#2A3B63">
          <path d="M63 40 L61 38.4 L60 40 Z" />
          <path d="M59.5 40 L58 38.6 L56.8 40 Z" />
          <path d="M55 40 L54 39.2 L53 40 Z" />
        </g>
      )}

      {/* tiny arm */}
      {px > 24 && (
        <g>
          <path d="M70 20.5 C72.5 21 74.5 23 75 25.5 L73.5 26.5 L72.6 24.6 L70.5 23.5 Z" fill="#4F8A0B" />
          {px > 60 && <path d="M75 25.5 L77 26.8 L74 26.8 Z" fill="#2A3B63" />}
        </g>
      )}

      {/* mouth line and teeth */}
      {px > 24 && (
        <path d="M86 15 C90 16 95 15.4 98.8 13.4" fill="none" stroke="#4F8A0B" strokeWidth="0.9" strokeLinecap="round" />
      )}
      {px > 60 && (
        <g fill="#F4F9FF">
          <path d="M88.6 15.2 L89.5 17.3 L90.4 15.5 Z" />
          <path d="M91.6 15.6 L92.5 17.6 L93.4 15.7 Z" />
          <path d="M94.6 15.4 L95.4 17.2 L96.2 15.1 Z" />
          <path d="M97.2 14.6 L97.8 16.2 L98.4 14.1 Z" />
        </g>
      )}

      {/* eye, brow, nostril */}
      {px > 24 && (
        <g>
          {px > 120 && <path d="M86.5 4.6 Q89 3.2 91.6 4.8" fill="none" stroke="#4F8A0B" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />}
          <circle cx="89" cy="6.6" r="1.7" fill="#1B2540" />
          <circle cx="88.4" cy="6" r="0.55" fill="#FFFFFF" />
          {px > 60 && <circle cx="96.6" cy="7.6" r="0.6" fill="#4F8A0B" />}
        </g>
      )}
    </svg>
  ),
};
