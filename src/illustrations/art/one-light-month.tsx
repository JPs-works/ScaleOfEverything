import type { Illustration } from '../types';

// One light-month — measured axis: distance (horizontal). Nothing sits at the ends: this is a pure
// span, drawn to the same proportions as one-light-year. A thin pale-gold dimension line with end
// caps runs x = 0..100, and a stylised photon (a bright bead with a tapering trailing streak)
// travels along it towards the right. Faint ticks split the span into ~30 days of light travel,
// with the four week marks a little taller. The end caps define the box height.
// aspect = width / height of the bounding box: 100 / 8.
// Palette built from #e6d8a8: highlight #f7efd2, base #e6d8a8, shade #9a8a4e.
const HI = '#f7efd2';
const BASE = '#e6d8a8';
const SHADE = '#9a8a4e';
const MID_Y = 4;
const PHOTON_X = 58;
const PHOTON_R = 1.35;
const TAIL_LEN = 24;
// Below ~120 px the span line and bead are scaled up so they survive the shrink.
const lineW = (px: number) => (px > 120 ? 0.6 : 1.3);
const beadR = (px: number) => (px > 120 ? PHOTON_R : 2.3);
const DAYS = Array.from({ length: 29 }, (_, i) => i + 1);

export const art: Illustration = {
  id: 'one-light-month',
  aspect: 12.5,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 8" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* dimension line: brighter towards the ends so the caps read. userSpaceOnUse because a
            horizontal line has a zero-height bounding box, which would collapse the gradient */}
        <linearGradient id={`${uid}-line`} gradientUnits="userSpaceOnUse" x1="0" x2="100" y1="0" y2="0">
          <stop offset="0%" stopColor={HI} />
          <stop offset="50%" stopColor={BASE} />
          <stop offset="100%" stopColor={HI} />
        </linearGradient>
        {/* trailing streak: transparent at the tail, hot near the bead */}
        <linearGradient id={`${uid}-tail`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={BASE} stopOpacity="0" />
          <stop offset="55%" stopColor={BASE} stopOpacity="0.55" />
          <stop offset="100%" stopColor={HI} stopOpacity="1" />
        </linearGradient>
        {/* the photon bead: white-hot core, pale-gold rim, darker limb lower right */}
        <radialGradient id={`${uid}-bead`} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor={HI} />
          <stop offset="80%" stopColor={BASE} />
          <stop offset="100%" stopColor={SHADE} />
        </radialGradient>
        {/* soft halo around the bead */}
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={HI} stopOpacity="0.5" />
          <stop offset="45%" stopColor={BASE} stopOpacity="0.22" />
          <stop offset="100%" stopColor={BASE} stopOpacity="0" />
        </radialGradient>
      </defs>

      {px <= 24 ? (
        /* tiny: one solid gold bar with a bright bead so the span still reads as a travelling ray */
        <g>
          <rect x="0" y="2.7" width="100" height="2.6" rx="1.3" fill={BASE} />
          <circle cx={PHOTON_X} cy={MID_Y} r="2.6" fill="#ffffff" />
        </g>
      ) : (
        <g>
          {/* end caps spanning the full box height, and the thin span between them */}
          <g stroke={BASE} strokeLinecap="butt" opacity="0.95">
            <line x1="0.4" y1="0" x2="0.4" y2="8" strokeWidth={px > 120 ? 0.8 : 1.4} />
            <line x1="99.6" y1="0" x2="99.6" y2="8" strokeWidth={px > 120 ? 0.8 : 1.4} />
          </g>
          <line x1="0.4" y1={MID_Y} x2="99.6" y2={MID_Y} stroke={`url(#${uid}-line)`} strokeWidth={lineW(px)} />

          {/* faint ticks: each marks one day of light travel; the week marks stand a little taller */}
          {px > 120 && (
            <g stroke={HI} strokeWidth="0.3" opacity="0.35">
              {DAYS.map((d) => {
                const x = (100 / 30) * d;
                const h = d % 7 === 0 ? 1.1 : 0.55;
                return <line key={d} x1={x} y1={MID_Y - h} x2={x} y2={MID_Y + h} />;
              })}
            </g>
          )}

          {/* a few faint sparks the ray has left behind on its way */}
          {px > 120 && (
            <g fill={HI}>
              <circle cx={PHOTON_X - 29} cy={MID_Y - 1.6} r="0.28" opacity="0.5" />
              <circle cx={PHOTON_X - 21} cy={MID_Y + 1.9} r="0.22" opacity="0.4" />
              <circle cx={PHOTON_X - 11} cy={MID_Y - 2.1} r="0.2" opacity="0.45" />
              <circle cx={PHOTON_X - 5} cy={MID_Y + 1.4} r="0.18" opacity="0.4" />
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
              fill="#fdf8e6"
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
            <g stroke={HI} strokeWidth="0.3" fill="none" strokeLinecap="round">
              <path d={`M${PHOTON_X + 2.6} ${MID_Y - 1.5} Q${PHOTON_X + 3.6} ${MID_Y} ${PHOTON_X + 2.6} ${MID_Y + 1.5}`} opacity="0.55" />
              <path d={`M${PHOTON_X + 4.4} ${MID_Y - 2.1} Q${PHOTON_X + 5.8} ${MID_Y} ${PHOTON_X + 4.4} ${MID_Y + 2.1}`} opacity="0.3" />
            </g>
          )}
        </g>
      )}
    </svg>
  ),
};
