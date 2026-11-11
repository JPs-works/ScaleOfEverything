import type { Illustration } from '../types';

// Water molecule — measured axis: diameter (horizontal). Space-filling model: one large
// oxygen sphere with two smaller hydrogen spheres bonded at ~104.5°, Mickey-Mouse style.
// The two hydrogens touch x = 0 and x = 100; the hydrogens touch y = 0 and the oxygen y = 73.
// aspect = width / height of the bounding box: 100 / 73.
const O = { cx: 50, cy: 43, r: 30 };
const H = [
  { cx: 17.5, cy: 17.5, r: 17.5 },
  { cx: 82.5, cy: 17.5, r: 17.5 },
];

export const art: Illustration = {
  id: 'water-molecule',
  aspect: 100 / 73,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 73" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* oxygen: base colour, lit from upper-left */}
        <radialGradient id={`${uid}-o`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#a6e2ff" />
          <stop offset="45%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0b5d9c" />
        </radialGradient>
        {/* hydrogen: paler tint of the same hue */}
        <radialGradient id={`${uid}-h`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f4fcff" />
          <stop offset="50%" stopColor="#a8e0fb" />
          <stop offset="100%" stopColor="#3f9fd6" />
        </radialGradient>
        {/* darker limb at the lower-right of each sphere */}
        <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="80%">
          <stop offset="60%" stopColor="#062a4a" stopOpacity="0" />
          <stop offset="100%" stopColor="#062a4a" stopOpacity="0.5" />
        </radialGradient>
        {/* faint glow behind the molecule */}
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="#38BDF8" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </radialGradient>
        {/* shadow cast by the oxygen onto the hydrogens where they overlap */}
        <clipPath id={`${uid}-hclip`}>
          <circle cx={H[0].cx} cy={H[0].cy} r={H[0].r} />
          <circle cx={H[1].cx} cy={H[1].cy} r={H[1].r} />
        </clipPath>
      </defs>

      {px > 24 && <ellipse cx="50" cy="38" rx="56" ry="42" fill={`url(#${uid}-glow)`} />}

      {/* hydrogens sit behind the oxygen */}
      {H.map((h, i) => (
        <circle key={i} cx={h.cx} cy={h.cy} r={h.r} fill={`url(#${uid}-h)`} />
      ))}
      {px > 24 &&
        H.map((h, i) => (
          <circle key={`s${i}`} cx={h.cx} cy={h.cy} r={h.r} fill={`url(#${uid}-shade)`} />
        ))}
      {px > 24 && (
        <g clipPath={`url(#${uid}-hclip)`}>
          <circle cx={O.cx} cy={O.cy} r={O.r + 3} fill="#062a4a" opacity="0.35" />
        </g>
      )}

      {/* oxygen in front */}
      <circle cx={O.cx} cy={O.cy} r={O.r} fill={`url(#${uid}-o)`} />
      {px > 24 && <circle cx={O.cx} cy={O.cy} r={O.r} fill={`url(#${uid}-shade)`} />}

      {px > 120 && (
        <g fill="#ffffff">
          {/* specular highlights, upper-left of each sphere */}
          <ellipse cx="39" cy="31" rx="7" ry="4.5" transform="rotate(-35 39 31)" opacity="0.55" />
          <ellipse cx="11.5" cy="11" rx="4" ry="2.6" transform="rotate(-35 11.5 11)" opacity="0.7" />
          <ellipse cx="76.5" cy="11" rx="4" ry="2.6" transform="rotate(-35 76.5 11)" opacity="0.7" />
          {/* lone-pair hint: a soft rim light along the bottom of the oxygen */}
          <path d="M28 60 Q50 76 72 60" fill="none" stroke="#bfe9ff" strokeWidth="1.2" opacity="0.35" strokeLinecap="round" />
        </g>
      )}
    </svg>
  ),
};
