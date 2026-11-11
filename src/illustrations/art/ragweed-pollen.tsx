import type { Illustration } from '../types';

// Ragweed pollen — measured axis: diameter (horizontal). The spiky grain spans the full viewBox:
// spike tips reach x = 0 / x = 100 (and y = 0 / y = 100), so the bounding box is a square.
const SPIKE_COUNT = 20;
const SPIKES = Array.from({ length: SPIKE_COUNT }, (_, i) => (360 / SPIKE_COUNT) * i);

// Light comes from the upper-left: spikes facing it are lighter, those at the lower-right darker.
const spikeFill = (deg: number) => {
  const light = Math.cos(((deg - 315) * Math.PI) / 180);
  if (light > 0.45) return '#FDE68A';
  if (light < -0.45) return '#B8860B';
  return '#FACC15';
};

const PORES: Array<[number, number, number]> = [
  // cx, cy, rotation — ragweed pollen is tri-porate, so three dimpled apertures
  [37, 43, -20],
  [62, 36, 25],
  [53, 65, -10],
];

export const art: Illustration = {
  id: 'ragweed-pollen',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-body`} cx="36%" cy="31%" r="72%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="28%" stopColor="#FDE047" />
          <stop offset="70%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
        <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="80%">
          <stop offset="60%" stopColor="#3b2a05" stopOpacity="0" />
          <stop offset="100%" stopColor="#3b2a05" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#FACC15" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* faint halo behind the spikes so the silhouette holds together when tiny */}
      <circle cx="50" cy="50" r="54" fill={`url(#${uid}-glow)`} />

      {/* spikes — drawn pointing up at the origin, then rotated around the centre */}
      <g transform="translate(50 50)">
        {SPIKES.map((deg) => (
          <path
            key={deg}
            d="M-3.6 -38 Q0 -41 3.6 -38 L0.9 -49.2 Q0 -50 -0.9 -49.2 Z"
            fill={px < 24 ? '#FACC15' : spikeFill(deg)}
            transform={`rotate(${deg})`}
          />
        ))}
      </g>

      {/* the grain body */}
      <circle cx="50" cy="50" r="42.5" fill={`url(#${uid}-body)`} />

      {/* surface texture: fine granules between the spikes */}
      {px > 120 && (
        <g fill="#FEF3C7" opacity="0.35">
          <circle cx="30" cy="30" r="1.3" />
          <circle cx="44" cy="22" r="1.1" />
          <circle cx="26" cy="56" r="1.2" />
          <circle cx="48" cy="48" r="1.0" />
          <circle cx="74" cy="50" r="1.1" />
          <circle cx="40" cy="74" r="1.2" />
          <circle cx="68" cy="72" r="1.0" />
          <circle cx="78" cy="30" r="0.9" />
        </g>
      )}

      {/* germinal pores — three sunken apertures */}
      {px > 40 &&
        PORES.map(([cx, cy, rot]) => (
          <g key={`${cx}-${cy}`} transform={`rotate(${rot} ${cx} ${cy})`}>
            <ellipse cx={cx} cy={cy} rx="5.2" ry="3.6" fill="#A16207" />
            <ellipse cx={cx} cy={cy + 0.6} rx="3.4" ry="2.1" fill="#7C4A03" opacity="0.8" />
            <ellipse cx={cx - 1.4} cy={cy - 1.4} rx="1.6" ry="0.8" fill="#FDE68A" opacity="0.6" />
          </g>
        ))}

      {/* darker limb at the lower-right */}
      <circle cx="50" cy="50" r="42.5" fill={`url(#${uid}-shade)`} />
    </svg>
  ),
};
