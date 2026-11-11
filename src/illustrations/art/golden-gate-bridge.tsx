import type { Illustration } from '../types';

// Golden Gate Bridge — measured axis: length (horizontal). The deck spans x = 0 (south approach)
// to x = 100 (north approach); the towers reach y = 0 and the piers sit on the water at y = 12.
// aspect = width / height of the bounding box: 100 / 12.

const BASE = '#F05A28';
const LIGHT = '#FF8F60';
const SHADE = '#B33F17';
const DEEP = '#8C2F10';
const CONCRETE = '#7d7a85';
const CONCRETE_DARK = '#5c5964';

const DECK_Y = 8;
const TOWER_X = [30, 77] as const;
const TOWER_TOP = 0.6;
const MAIN_CTRL_Y = 14.4; // quadratic control: low point of the main cable sits at (0.6 + 14.4) / 2 = 7.5
const SIDE_CTRL_Y = 5.0;
const ANCHOR_X = [17.5, 89.5] as const;

// Quadratic Bézier y for a cable whose control x is the midpoint (so x is linear in t).
const quadY = (y0: number, yc: number, y1: number, t: number) =>
  (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * yc + t * t * y1;

// Vertical suspender cables, one path for the whole bridge.
const hangers = (() => {
  const segs: string[] = [];
  // main span
  for (let x = 32; x <= 75; x += 2) {
    const t = (x - TOWER_X[0]) / (TOWER_X[1] - TOWER_X[0]);
    const y = quadY(TOWER_TOP, MAIN_CTRL_Y, TOWER_TOP, t);
    segs.push(`M${x} ${y.toFixed(2)}V${DECK_Y}`);
  }
  // side spans
  for (let x = 20; x <= 28; x += 2) {
    const t = (TOWER_X[0] - x) / (TOWER_X[0] - ANCHOR_X[0]);
    const y = quadY(TOWER_TOP, SIDE_CTRL_Y, 7.8, t);
    segs.push(`M${x} ${y.toFixed(2)}V${DECK_Y}`);
  }
  for (let x = 79; x <= 87; x += 2) {
    const t = (x - TOWER_X[1]) / (ANCHOR_X[1] - TOWER_X[1]);
    const y = quadY(TOWER_TOP, SIDE_CTRL_Y, 7.8, t);
    segs.push(`M${x} ${y.toFixed(2)}V${DECK_Y}`);
  }
  return segs.join('');
})();

const Tower = ({ x, uid, px }: { x: number; uid: string; px: number }) => (
  <g>
    {/* concrete pier in the water */}
    <rect x={x - 2.6} y="10.4" width="5.2" height="1.6" fill={CONCRETE_DARK} />
    {/* two legs */}
    <rect x={x - 1.5} y="0" width="1" height="10.6" fill={`url(#${uid}-tower)`} />
    <rect x={x + 0.5} y="0" width="1" height="10.6" fill={`url(#${uid}-tower)`} />
    {/* portal struts (the stepped bracing that makes the towers recognisable) */}
    <rect x={x - 1.5} y="0" width="3" height="1.1" fill={LIGHT} />
    <rect x={x - 1.5} y="2.3" width="3" height="0.7" fill={BASE} />
    <rect x={x - 1.5} y="4.5" width="3" height="0.7" fill={BASE} />
    <rect x={x - 1.5} y="6.6" width="3" height="0.7" fill={BASE} />
    <rect x={x - 1.5} y="9.5" width="3" height="0.8" fill={SHADE} />
    {px > 120 && (
      <>
        {/* lit left edges */}
        <rect x={x - 1.5} y="1.1" width="0.25" height="9.4" fill={LIGHT} opacity="0.7" />
        <rect x={x + 0.5} y="1.1" width="0.25" height="9.4" fill={LIGHT} opacity="0.5" />
      </>
    )}
  </g>
);

export const art: Illustration = {
  id: 'golden-gate-bridge',
  aspect: 100 / 12,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 12" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${uid}-tower`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={LIGHT} />
          <stop offset="45%" stopColor={BASE} />
          <stop offset="100%" stopColor={SHADE} />
        </linearGradient>
        <linearGradient id={`${uid}-deck`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={LIGHT} />
          <stop offset="100%" stopColor={BASE} />
        </linearGradient>
        <linearGradient id={`${uid}-water`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3a6a94" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#1b3652" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {px < 24 ? (
        /* tiny: a solid orange silhouette — deck bar, two towers, main cable */
        <g fill={BASE}>
          <rect x="0" y="7" width="100" height="3.2" />
          <rect x="28" y="0" width="4" height="12" />
          <rect x="75" y="0" width="4" height="12" />
          <path
            d={`M30 ${TOWER_TOP} Q53.5 ${MAIN_CTRL_Y} 77 ${TOWER_TOP}`}
            fill="none"
            stroke={BASE}
            strokeWidth="1.4"
          />
        </g>
      ) : (
        <>
          {/* bay water */}
          <rect x="0" y="10.6" width="100" height="1.4" fill={`url(#${uid}-water)`} />

          {/* approach viaduct piers */}
          {px > 48 && (
            <path
              d="M3 9.9h0.9v1.2h-0.9zM7.5 9.9h0.9v1.2h-0.9zM12 9.9h0.9v1.2h-0.9zM94 9.9h0.9v1.2h-0.9zM97.5 9.9h0.9v1.2h-0.9z"
              fill={DEEP}
            />
          )}

          {/* cable anchorages (concrete blocks at deck level) */}
          <rect x="15.4" y="7.4" width="4.2" height="3.4" fill={CONCRETE} />
          <rect x="87.4" y="7.4" width="4.2" height="3.4" fill={CONCRETE} />
          <rect x="15.4" y="7.4" width="4.2" height="0.5" fill="#9b98a3" />
          <rect x="87.4" y="7.4" width="4.2" height="0.5" fill="#9b98a3" />

          {/* suspender cables */}
          {px > 120 && <path d={hangers} fill="none" stroke={BASE} strokeWidth="0.14" opacity="0.9" />}

          {/* main and side cables */}
          <path
            d={`M${ANCHOR_X[0]} 7.8 Q23.75 ${SIDE_CTRL_Y} ${TOWER_X[0]} ${TOWER_TOP} Q53.5 ${MAIN_CTRL_Y} ${TOWER_X[1]} ${TOWER_TOP} Q83.25 ${SIDE_CTRL_Y} ${ANCHOR_X[1]} 7.8`}
            fill="none"
            stroke={BASE}
            strokeWidth={px > 120 ? 0.45 : 0.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {px > 120 && (
            <path
              d={`M${ANCHOR_X[0]} 7.8 Q23.75 ${SIDE_CTRL_Y} ${TOWER_X[0]} ${TOWER_TOP} Q53.5 ${MAIN_CTRL_Y} ${TOWER_X[1]} ${TOWER_TOP} Q83.25 ${SIDE_CTRL_Y} ${ANCHOR_X[1]} 7.8`}
              fill="none"
              stroke={LIGHT}
              strokeWidth="0.15"
              strokeLinecap="round"
              opacity="0.8"
              transform="translate(0 -0.12)"
            />
          )}

          {/* deck: roadway on top, stiffening truss below */}
          <rect x="0" y={DECK_Y} width="100" height="1.3" fill={`url(#${uid}-deck)`} />
          <rect x="0" y={DECK_Y + 1.3} width="100" height="0.6" fill={SHADE} />
          {px > 120 && (
            <>
              {/* railing highlight and lane line */}
              <rect x="0" y={DECK_Y - 0.18} width="100" height="0.18" fill={LIGHT} opacity="0.85" />
              <path d={`M0 ${DECK_Y + 0.65}H100`} stroke="#ffe3cf" strokeWidth="0.12" strokeDasharray="1.2 1" opacity="0.6" />
              {/* truss diagonals hint */}
              <path d={`M0 ${DECK_Y + 1.3}H100`} stroke={DEEP} strokeWidth="0.12" strokeDasharray="0.9 0.9" opacity="0.8" />
            </>
          )}

          <Tower x={TOWER_X[0]} uid={uid} px={px} />
          <Tower x={TOWER_X[1]} uid={uid} px={px} />
        </>
      )}
    </svg>
  ),
};
