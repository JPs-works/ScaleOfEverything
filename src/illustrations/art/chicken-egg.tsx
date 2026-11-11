import type { Illustration } from '../types';

// Chicken egg — measured axis: height (vertical). The shell spans y = 0 (pointed end) to y = 100 (rounded end).
// A hen's egg is about 72% as wide as it is long, so aspect = 72 / 100.
export const art: Illustration = {
  id: 'chicken-egg',
  aspect: 0.72,
  View: ({ uid, px }) => {
    const shell = 'M36 0 C52 0 72 28 72 62 C72 84 56 100 36 100 C16 100 0 84 0 62 C0 28 20 0 36 0 Z';
    return (
      <svg viewBox="0 0 72 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          {/* volume: light from the upper-left, darker limb to the lower-right */}
          <radialGradient id={`${uid}-shell`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#FFF7D6" />
            <stop offset="40%" stopColor="#FDE68A" />
            <stop offset="80%" stopColor="#E9BE55" />
            <stop offset="100%" stopColor="#B9842C" />
          </radialGradient>
          <radialGradient id={`${uid}-limb`} cx="35%" cy="30%" r="85%">
            <stop offset="60%" stopColor="#7A4E12" stopOpacity="0" />
            <stop offset="100%" stopColor="#7A4E12" stopOpacity="0.45" />
          </radialGradient>
          <radialGradient id={`${uid}-gloss`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-halo`} cx="50%" cy="55%" r="50%">
            <stop offset="82%" stopColor="#FDE68A" stopOpacity="0" />
            <stop offset="90%" stopColor="#FDE68A" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`${uid}-clip`}><path d={shell} /></clipPath>
        </defs>
        {/* faint warm halo so the pale shell lifts off the dark backdrop */}
        {px > 24 && <ellipse cx="36" cy="52" rx="40" ry="55" fill={`url(#${uid}-halo)`} />}
        {/* shell */}
        <path d={shell} fill={`url(#${uid}-shell)`} />
        {/* speckles, only when there is room to see them */}
        {px > 120 && (
          <g clipPath={`url(#${uid}-clip)`} fill="#B9842C" opacity="0.35">
            <ellipse cx="22" cy="34" rx="1.4" ry="1" />
            <ellipse cx="50" cy="26" rx="1" ry="0.8" />
            <ellipse cx="58" cy="48" rx="1.6" ry="1.1" />
            <ellipse cx="14" cy="58" rx="1.1" ry="0.9" />
            <ellipse cx="44" cy="70" rx="1.8" ry="1.2" />
            <ellipse cx="30" cy="84" rx="1.2" ry="0.9" />
            <ellipse cx="62" cy="76" rx="1" ry="0.8" />
            <ellipse cx="40" cy="44" rx="0.9" ry="0.7" />
            <ellipse cx="20" cy="74" rx="0.8" ry="0.7" />
          </g>
        )}
        {/* darker limb on the lower-right */}
        <path d={shell} fill={`url(#${uid}-limb)`} />
        {/* soft specular highlight at ~35%,30% */}
        {px > 24 && <ellipse cx="25" cy="28" rx="9" ry="13" fill={`url(#${uid}-gloss)`} />}
        {/* a sliver of reflected light along the lower-left rim */}
        {px > 60 && (
          <path d="M9 78 C14 90 24 97 36 98 C22 98 12 90 8 80 Z" fill="#FFF7D6" opacity="0.35" />
        )}
      </svg>
    );
  },
};
