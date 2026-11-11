import type { Illustration } from '../types';

// One light-year — measured axis: distance (horizontal). Nothing sits at the ends: this is a pure
// span. A thin dimension line with end caps runs x = 0..100, and a stylised photon (a bright bead
// with a tapering trailing streak) travels along it towards the right. Faint ticks split the span
// into twelve months of light travel. The end caps define the box height.
// aspect = width / height of the bounding box: 100 / 8.
// Palette built from #F472B6: highlight #fbcfe8, base #F472B6, shade #9d174d.
const MID_Y = 4;
const PHOTON_X = 64;
const PHOTON_R = 1.35;
const TAIL_LEN = 26;
// Below ~120 px the span line and bead are scaled up so they survive the shrink.
const lineW = (px: number) => (px > 120 ? 0.6 : 1.3);
const beadR = (px: number) => (px > 120 ? PHOTON_R : 2.3);

export const art: Illustration = {
  id: 'one-light-year',
  aspect: 12.5,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 8" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* dimension line: brighter towards the ends so the caps read. userSpaceOnUse because a
            horizontal line has a zero-height bounding box, which would collapse the gradient */}
        <linearGradient id={`${uid}-line`} gradientUnits="userSpaceOnUse" x1="0" x2="100" y1="0" y2="0">
          <stop offset="0%" stopColor="#fbcfe8" />
          <stop offset="50%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#fbcfe8" />
        </linearGradient>
        {/* trailing streak: transparent at the tail, hot near the bead */}
        <linearGradient id={`${uid}-tail`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#F472B6" stopOpacity="0" />
          <stop offset="55%" stopColor="#F472B6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fbcfe8" stopOpacity="1" />
        </linearGradient>
        {/* the photon bead: white-hot core, pink rim, darker limb lower right */}
        <radialGradient id={`${uid}-bead`} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#fbcfe8" />
          <stop offset="80%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#9d174d" />
        </radialGradient>
        {/* soft halo around the bead */}
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbcfe8" stopOpacity="0.5" />
          <stop offset="45%" stopColor="#F472B6" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#F472B6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {px <= 24 ? (
        /* tiny: one solid pink bar with a bright bead so the span still reads as a travelling ray */
        <g>
          <rect x="0" y="2.7" width="100" height="2.6" rx="1.3" fill="#F472B6" />
          <circle cx={PHOTON_X} cy={MID_Y} r="2.6" fill="#fbcfe8" />
        </g>
      ) : (
        <g>
          {/* end caps spanning the full box height, and the thin span between them */}
          <g stroke="#F472B6" strokeLinecap="butt" opacity="0.95">
            <line x1="0.4" y1="0" x2="0.4" y2="8" strokeWidth={px > 120 ? 0.8 : 1.4} />
            <line x1="99.6" y1="0" x2="99.6" y2="8" strokeWidth={px > 120 ? 0.8 : 1.4} />
          </g>
          <line x1="0.4" y1={MID_Y} x2="99.6" y2={MID_Y} stroke={`url(#${uid}-line)`} strokeWidth={lineW(px)} />

          {/* faint ticks: each marks one month of light travel */}
          {px > 120 && (
            <g stroke="#fbcfe8" strokeWidth="0.3" opacity="0.35">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((m) => {
                const x = (100 / 12) * m;
                return <line key={m} x1={x} y1={MID_Y - 0.7} x2={x} y2={MID_Y + 0.7} />;
              })}
            </g>
          )}

          {/* a few faint sparks the ray has left behind on its way */}
          {px > 120 && (
            <g fill="#fbcfe8">
              <circle cx={PHOTON_X - 31} cy={MID_Y - 1.6} r="0.28" opacity="0.5" />
              <circle cx={PHOTON_X - 23} cy={MID_Y + 1.9} r="0.22" opacity="0.4" />
              <circle cx={PHOTON_X - 12} cy={MID_Y - 2.1} r="0.2" opacity="0.45" />
              <circle cx={PHOTON_X - 6} cy={MID_Y + 1.4} r="0.18" opacity="0.4" />
            </g>
          )}

          {/* trailing streak: a tapered sliver from the tail up to the bead */}
          <path
            d={`M${PHOTON_X - TAIL_LEN} ${MID_Y} L${PHOTON_X - 1} ${MID_Y - beadR(px) * 0.72} L${PHOTON_X} ${MID_Y} L${PHOTON_X - 1} ${MID_Y + beadR(px) * 0.72} Z`}
            fill={`url(#${uid}-tail)`}
          />
          {px > 60 && (
            <path
              d={`M${PHOTON_X - TAIL_LEN * 0.55} ${MID_Y} L${PHOTON_X - 1} ${MID_Y - PHOTON_R * 0.3} L${PHOTON_X} ${MID_Y} L${PHOTON_X - 1} ${MID_Y + PHOTON_R * 0.3} Z`}
              fill="#fde7f3"
              opacity="0.8"
            />
          )}

          {/* halo, then the bead itself */}
          <circle cx={PHOTON_X} cy={MID_Y} r={beadR(px) * 2.9} fill={`url(#${uid}-halo)`} />
          <circle cx={PHOTON_X} cy={MID_Y} r={beadR(px)} fill={`url(#${uid}-bead)`} />
          {/* highlight at ~35%,30% */}
          {px > 60 && <circle cx={PHOTON_X - 0.42} cy={MID_Y - 0.5} r="0.32" fill="#ffffff" opacity="0.85" />}

          {/* two short forward wavefront arcs ahead of the bead */}
          {px > 120 && (
            <g stroke="#fbcfe8" strokeWidth="0.3" fill="none" strokeLinecap="round">
              <path d={`M${PHOTON_X + 2.6} ${MID_Y - 1.5} Q${PHOTON_X + 3.6} ${MID_Y} ${PHOTON_X + 2.6} ${MID_Y + 1.5}`} opacity="0.55" />
              <path d={`M${PHOTON_X + 4.4} ${MID_Y - 2.1} Q${PHOTON_X + 5.8} ${MID_Y} ${PHOTON_X + 4.4} ${MID_Y + 2.1}`} opacity="0.3" />
            </g>
          )}
        </g>
      )}
    </svg>
  ),
};
