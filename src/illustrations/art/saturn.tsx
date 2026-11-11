import type { Illustration } from '../types';

// Saturn — measured axis: diameter of the planet BODY (horizontal). The body disc spans x = 0..100.
// The rings are the one sanctioned exception to the spill rule: they are drawn at ~0.75 opacity and
// extend to x = -60 .. 160 (overflow visible), tilted so the front half crosses the lower body.
const TILT = -16;
const K = 0.3; // ring ellipse squash (ry / rx)

// Even-odd ring band between two concentric ellipses centred on (50, 50).
const band = (ro: number, ri: number) => {
  const el = (r: number) =>
    `M${50 - r} 50a${r} ${r * K} 0 1 0 ${2 * r} 0a${r} ${r * K} 0 1 0 ${-2 * r} 0Z`;
  return `${el(ro)}${el(ri)}`;
};

export const art: Illustration = {
  id: 'saturn',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-body`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#F8E8C4" />
          <stop offset="45%" stopColor="#E8C98A" />
          <stop offset="100%" stopColor="#A87C42" />
        </radialGradient>
        <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="80%">
          <stop offset="55%" stopColor="#3a2410" stopOpacity="0" />
          <stop offset="100%" stopColor="#3a2410" stopOpacity="0.55" />
        </radialGradient>
        <linearGradient id={`${uid}-ring`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#F4E3BE" />
          <stop offset="50%" stopColor="#E3C796" />
          <stop offset="100%" stopColor="#B88E55" />
        </linearGradient>
        <clipPath id={`${uid}-disc`}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
        {/* front (lower) half of the ring plane, in tilted coordinates */}
        <clipPath id={`${uid}-front`}>
          <rect x="-80" y="50" width="260" height="60" />
        </clipPath>
      </defs>

      {/* back half of the rings */}
      <g transform={`rotate(${TILT} 50 50)`} opacity="0.75">
        <path d={band(108, 92)} fill={`url(#${uid}-ring)`} fillRule="evenodd" />
        <path d={band(88, 68)} fill={`url(#${uid}-ring)`} fillRule="evenodd" />
        {px > 24 && <path d={band(66, 58)} fill={`url(#${uid}-ring)`} fillRule="evenodd" opacity="0.45" />}
        {px > 120 && (
          <path d={band(110.5, 109.5)} fill="#F4E3BE" fillRule="evenodd" opacity="0.5" />
        )}
        {/* planet's shadow falling on the rings behind it (lower-right) */}
        {px > 24 && (
          <path d="M92 50 C 100 44 118 50 112 58 L 60 62 Z" fill="#1a1308" opacity="0.5" />
        )}
      </g>

      {/* planet body */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-body)`} />
      {px > 24 && (
        <g clipPath={`url(#${uid}-disc)`} transform={`rotate(${TILT} 50 50)`}>
          {/* cloud bands */}
          <rect x="-10" y="18" width="120" height="5" fill="#C9A365" opacity="0.35" />
          <rect x="-10" y="29" width="120" height="7" fill="#F6E6C2" opacity="0.4" />
          <rect x="-10" y="40" width="120" height="4" fill="#C9A365" opacity="0.4" />
          <rect x="-10" y="56" width="120" height="6" fill="#C9A365" opacity="0.3" />
          <rect x="-10" y="68" width="120" height="4" fill="#F6E6C2" opacity="0.25" />
          <rect x="-10" y="79" width="120" height="5" fill="#B58A4C" opacity="0.35" />
          {px > 120 && <rect x="-10" y="8" width="120" height="3" fill="#B58A4C" opacity="0.3" />}
          {px > 120 && <rect x="-10" y="90" width="120" height="4" fill="#B58A4C" opacity="0.3" />}
          {/* polar hexagon hint: slightly darker cap */}
          {px > 120 && <ellipse cx="50" cy="2" rx="22" ry="7" fill="#A87C42" opacity="0.35" />}
          {/* shadow the rings cast across the body, just above the ring plane */}
          <path d="M-10 45 Q50 41 110 45 L110 50 Q50 46 -10 50 Z" fill="#3a2410" opacity="0.35" />
        </g>
      )}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-shade)`} />

      {/* front half of the rings crossing the body */}
      <g transform={`rotate(${TILT} 50 50)`} clipPath={`url(#${uid}-front)`} opacity="0.78">
        <path d={band(108, 92)} fill={`url(#${uid}-ring)`} fillRule="evenodd" />
        <path d={band(88, 68)} fill={`url(#${uid}-ring)`} fillRule="evenodd" />
        {px > 24 && <path d={band(66, 58)} fill={`url(#${uid}-ring)`} fillRule="evenodd" opacity="0.45" />}
        {px > 120 && (
          <path d={band(110.5, 109.5)} fill="#F4E3BE" fillRule="evenodd" opacity="0.5" />
        )}
        {/* subtle ring-plane shading: darker toward the right limb */}
        {px > 120 && <path d={band(108, 68)} fill="#3a2410" fillRule="evenodd" opacity="0.12" />}
      </g>
    </svg>
  ),
};
