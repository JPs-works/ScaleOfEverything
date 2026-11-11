import type { Illustration } from '../types';

// Basketball — measured axis: diameter (horizontal). The ball spans x = 0..100 and y = 0..100.
// Base #F97316, highlight toward the upper-left, darker limb at the lower-right, dark-brown seams.
const PEBBLES: ReadonlyArray<[number, number]> = [
  [30, 22], [40, 16], [58, 14], [70, 24], [26, 36], [38, 40], [62, 36], [76, 42],
  [20, 56], [34, 62], [44, 70], [60, 60], [74, 66], [84, 54], [30, 78], [48, 84],
  [66, 80], [80, 76], [56, 26], [42, 54],
];

export const art: Illustration = {
  id: 'basketball',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-skin`} cx="35%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#FFB76B" />
          <stop offset="40%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#B4400E" />
        </radialGradient>
        <radialGradient id={`${uid}-limb`} cx="35%" cy="30%" r="80%">
          <stop offset="60%" stopColor="#4A1A05" stopOpacity="0" />
          <stop offset="100%" stopColor="#4A1A05" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id={`${uid}-gloss`} cx="35%" cy="30%" r="35%">
          <stop offset="0%" stopColor="#FFF1DC" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFF1DC" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>

      {/* ball body */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-skin)`} />

      {/* pebbled grain, only when large */}
      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`} fill="#7C2D12" opacity="0.16">
          {PEBBLES.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.1" />
          ))}
        </g>
      )}

      {/* seams: one vertical, one horizontal, two side channels bowing toward the centre */}
      {px >= 24 && (
        <g
          clipPath={`url(#${uid}-clip)`}
          fill="none"
          stroke="#3A1A0A"
          strokeWidth={px > 120 ? 1.5 : 2}
          strokeLinecap="round"
        >
          <line x1="50" y1="0" x2="50" y2="100" />
          <line x1="0" y1="50" x2="100" y2="50" />
          <path d="M14 14 Q44 50 14 86" />
          <path d="M86 14 Q56 50 86 86" />
        </g>
      )}

      {/* volume: limb shade then soft upper-left gloss */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-limb)`} />
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-gloss)`} />
    </svg>
  ),
};
