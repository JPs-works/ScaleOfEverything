import type { Illustration } from '../types';

// Proton — measured axis: diameter (horizontal). The sphere spans the full viewBox.
// A pink sphere with three quark blobs (two up, one down) bound by gluon arcs and a plus badge.
export const art: Illustration = {
  id: 'proton',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-body`} cx="35%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#ffd3ea" />
          <stop offset="35%" stopColor="#F472B6" />
          <stop offset="75%" stopColor="#c4388a" />
          <stop offset="100%" stopColor="#7a1a55" />
        </radialGradient>
        <radialGradient id={`${uid}-limb`} cx="35%" cy="30%" r="80%">
          <stop offset="60%" stopColor="#3a0a28" stopOpacity="0" />
          <stop offset="100%" stopColor="#3a0a28" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="80%" stopColor="#F472B6" stopOpacity="0" />
          <stop offset="100%" stopColor="#F472B6" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id={`${uid}-up`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff1f8" />
          <stop offset="60%" stopColor="#ffb3dc" />
          <stop offset="100%" stopColor="#e77ab8" />
        </radialGradient>
        <radialGradient id={`${uid}-down`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f3d6ff" />
          <stop offset="60%" stopColor="#c58cf2" />
          <stop offset="100%" stopColor="#8a4fc4" />
        </radialGradient>
      </defs>
      {/* faint halo: 12% beyond the measured disc */}
      {px > 24 && <circle cx="50" cy="50" r="56" fill={`url(#${uid}-halo)`} />}
      {/* body */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-body)`} />
      {px > 40 && (
        <g>
          {/* gluon bonds between the quarks */}
          <g fill="none" stroke="#ffe3f2" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
            <path d="M39 38 Q46 34 56 40" />
            <path d="M58 46 Q58 54 51 61" />
            <path d="M44 61 Q37 54 35 44" />
          </g>
          {/* up quark */}
          <circle cx="34" cy="40" r="9" fill={`url(#${uid}-up)`} />
          {/* up quark */}
          <circle cx="62" cy="43" r="9" fill={`url(#${uid}-up)`} />
          {/* down quark */}
          <circle cx="48" cy="65" r="9" fill={`url(#${uid}-down)`} />
          {/* tiny glints on the quarks */}
          {px > 120 && (
            <g fill="#ffffff" opacity="0.85">
              <circle cx="31" cy="37" r="1.8" />
              <circle cx="59" cy="40" r="1.8" />
              <circle cx="45" cy="62" r="1.8" />
            </g>
          )}
        </g>
      )}
      {/* plus badge: positive charge */}
      {px > 24 && (
        <g fill="#fff6fb" opacity="0.95">
          <rect x="68" y="19.5" width="12" height="3" rx="1.5" />
          <rect x="72.5" y="15" width="3" height="12" rx="1.5" />
        </g>
      )}
      {/* soft upper-left highlight */}
      <ellipse cx="33" cy="26" rx="14" ry="9" fill="#ffffff" opacity={px > 24 ? 0.22 : 0.3} transform="rotate(-30 33 26)" />
      {/* darker limb, lower right */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-limb)`} />
    </svg>
  ),
};
