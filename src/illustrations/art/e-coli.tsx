import type { Illustration } from '../types';

// E. coli — measured axis: length (horizontal). The rod-shaped cell spans x = 0 (left cap) to x = 100 (right cap).
// Flagella curl back along the body so they stay inside the box; the cell "swims" to the right.
// aspect = width / height of the bounding box: 100 / 40.
const BASE = '#A3E635';
const LIGHT = '#D9F99D';
const DARK = '#65A30D';
const DEEP = '#3F6212';

export const art: Illustration = {
  id: 'e-coli',
  aspect: 2.5,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 40" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* volume: lit from the upper-left, darker along the lower edge */}
        <linearGradient id={`${uid}-body`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={LIGHT} />
          <stop offset="38%" stopColor={BASE} />
          <stop offset="100%" stopColor={DARK} />
        </linearGradient>
        {/* darker limb at the right cap and bottom */}
        <radialGradient id={`${uid}-limb`} cx="30%" cy="30%" r="90%">
          <stop offset="60%" stopColor={DEEP} stopOpacity="0" />
          <stop offset="100%" stopColor={DEEP} stopOpacity="0.5" />
        </radialGradient>
        {/* faint halo so the lime reads against navy */}
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="78%" stopColor={BASE} stopOpacity="0" />
          <stop offset="100%" stopColor={BASE} stopOpacity="0.25" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}>
          <rect x="0" y="8" width="100" height="24" rx="12" />
        </clipPath>
      </defs>

      {/* halo */}
      {px > 24 && <ellipse cx="50" cy="20" rx="54" ry="15" fill={`url(#${uid}-halo)`} />}

      {/* flagella — thin whips trailing from the rear (left) cap, waving back along the body */}
      {px > 24 && (
        <g fill="none" stroke={BASE} strokeWidth={px > 120 ? 1.1 : 1.4} strokeLinecap="round" opacity="0.9">
          <path d="M4 12 C 8 4, 14 1.5, 22 3 S 34 8, 44 4.5 S 58 0.8, 68 3" />
          <path d="M3 27 C 7 35, 14 38.5, 22 37 S 34 32, 44 35.5 S 56 39.4, 64 36.5" />
          {px > 120 && <path d="M8 10 C 14 7, 20 6.5, 28 7.5 S 40 10, 50 7.5" opacity="0.6" />}
        </g>
      )}

      {/* rod body */}
      <rect x="0" y="8" width="100" height="24" rx="12" fill={`url(#${uid}-body)`} />

      {/* interior details, clipped to the cell */}
      {px > 24 && (
        <g clipPath={`url(#${uid}-clip)`}>
          {/* top highlight streak */}
          <path d="M9 12.5 Q 50 9.5 91 12.5 Q 50 14 9 12.5 Z" fill={LIGHT} opacity="0.75" />
          {/* nucleoid: a loose tangle of DNA in the middle of the cell */}
          <path
            d="M30 20 C 36 14, 44 26, 52 19 S 64 15, 70 21"
            fill="none"
            stroke={DEEP}
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.55"
          />
          {px > 120 && (
            <path
              d="M34 24 C 42 18, 50 25, 58 20 S 66 25, 72 19"
              fill="none"
              stroke={DEEP}
              strokeWidth="1.1"
              strokeLinecap="round"
              opacity="0.4"
            />
          )}
          {/* ribosome specks */}
          <g fill={DEEP} opacity="0.45">
            <circle cx="14" cy="24" r="1.3" />
            <circle cx="22" cy="17" r="1" />
            <circle cx="80" cy="25" r="1.3" />
            <circle cx="88" cy="17" r="1" />
            {px > 120 && (
              <>
                <circle cx="46" cy="27" r="0.9" />
                <circle cx="62" cy="13.5" r="0.9" />
                <circle cx="8" cy="18" r="0.9" />
                <circle cx="92" cy="22" r="0.9" />
              </>
            )}
          </g>
        </g>
      )}

      {/* shading limb on the lower right */}
      <rect x="0" y="8" width="100" height="24" rx="12" fill={`url(#${uid}-limb)`} />

      {/* pili: short hairs on the membrane */}
      {px > 120 && (
        <g fill="none" stroke={LIGHT} strokeWidth="0.8" strokeLinecap="round" opacity="0.7">
          <path d="M20 8.2 L 18.5 5.5" />
          <path d="M38 8 L 37 5" />
          <path d="M60 8 L 61.5 5.2" />
          <path d="M80 8.6 L 82 6" />
          <path d="M28 31.8 L 27 34.6" />
          <path d="M50 32 L 50.5 35" />
          <path d="M72 31.6 L 73.5 34.4" />
          <path d="M93 29 L 95.5 31" />
        </g>
      )}

      {/* crisp membrane edge */}
      {px > 48 && (
        <rect x="0.4" y="8.4" width="99.2" height="23.2" rx="11.6" fill="none" stroke={LIGHT} strokeWidth="0.8" opacity="0.5" />
      )}
    </svg>
  ),
};
