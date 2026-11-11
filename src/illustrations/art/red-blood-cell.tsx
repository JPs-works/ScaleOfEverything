import type { Illustration } from '../types';

// Red blood cell — measured axis: diameter (horizontal). A biconcave disc seen obliquely from
// above; the disc face spans x = 0..100, its side wall adds thickness below. viewBox 100 x 66.
export const art: Illustration = {
  id: 'red-blood-cell',
  aspect: 100 / 66,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 66" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-face`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="45%" stopColor="#ef3b3b" />
          <stop offset="100%" stopColor="#b91c1c" />
        </radialGradient>
        <linearGradient id={`${uid}-wall`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#a31818" />
          <stop offset="50%" stopColor="#8f1414" />
          <stop offset="100%" stopColor="#6f1010" />
        </linearGradient>
        <radialGradient id={`${uid}-dimple`} cx="58%" cy="62%" r="70%">
          <stop offset="0%" stopColor="#c81e1e" />
          <stop offset="60%" stopColor="#a51a1a" />
          <stop offset="100%" stopColor="#8a1414" stopOpacity="0.9" />
        </radialGradient>
        <clipPath id={`${uid}-faceclip`}><ellipse cx="50" cy="31" rx="50" ry="31" /></clipPath>
      </defs>

      {/* side wall (thickness of the disc) */}
      <ellipse cx="50" cy="35" rx="50" ry="31" fill={`url(#${uid}-wall)`} />

      {/* upper face */}
      <ellipse cx="50" cy="31" rx="50" ry="31" fill={`url(#${uid}-face)`} />

      {px > 24 && (
        <g clipPath={`url(#${uid}-faceclip)`}>
          {/* central concavity */}
          <ellipse cx="50" cy="33" rx="27" ry="14.5" fill={`url(#${uid}-dimple)`} />
          {/* shadowed upper-left lip of the dimple */}
          <path d="M23.5 31.5 C27 22 40 17.5 51 18.5 C63 19.5 72 25 76.5 32 C70 27 60 24 50 24.5 C39 25 29 28.5 23.5 31.5 Z" fill="#7a1111" opacity="0.6" />
          {/* lit lower-right floor of the dimple */}
          <path d="M31 40 C38 46 50 48.5 62 46 C70 44.5 75 40 76.5 34 C73 42 64 45.5 54 45.5 C45 45.5 37 43.5 31 40 Z" fill="#f87171" opacity="0.45" />
          {/* rim highlight, upper-left */}
          <path d="M3 24 C8 10 25 1.5 46 1 C34 3.5 22 8 14 15 C9 19.5 6 24.5 4.5 30 Z" fill="#ffffff" opacity="0.38" />
          {/* lower-right limb darkening */}
          <path d="M100 31 C99 46 80 60 52 62 C72 59 88 50 95 40 C97.5 36.5 99 33.5 100 31 Z" fill="#6f1010" opacity="0.5" />
        </g>
      )}

      {px > 120 && (
        <g clipPath={`url(#${uid}-faceclip)`}>
          {/* soft specular spots */}
          <ellipse cx="22" cy="18" rx="7" ry="3" fill="#ffffff" opacity="0.22" transform="rotate(-25 22 18)" />
          <ellipse cx="60" cy="43" rx="4" ry="1.4" fill="#ffffff" opacity="0.18" transform="rotate(-12 60 43)" />
          {/* faint ring where the face rolls into the dimple */}
          <ellipse cx="50" cy="33" rx="30" ry="16.5" fill="none" stroke="#f87171" strokeWidth="0.8" opacity="0.3" />
          {/* membrane texture */}
          <circle cx="14" cy="36" r="1.1" fill="#fb7185" opacity="0.35" />
          <circle cx="86" cy="22" r="0.9" fill="#fb7185" opacity="0.3" />
          <circle cx="40" cy="55" r="1" fill="#fb7185" opacity="0.3" />
          <circle cx="78" cy="50" r="0.8" fill="#fb7185" opacity="0.28" />
        </g>
      )}
    </svg>
  ),
};
