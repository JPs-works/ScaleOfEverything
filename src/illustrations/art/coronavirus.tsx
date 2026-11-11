import type { Illustration } from '../types';

// SARS-CoV-2 — measured axis: diameter (horizontal), spike tip to spike tip.
// The membrane sphere sits at the centre; 16 club-tipped spikes radiate so the
// outermost tips touch x = 0 / 100 and y = 0 / 100. aspect = 1.
const CX = 50;
const CY = 50;
const BODY_R = 37;
const STALK_FROM = 33;
const STALK_TO = 44.5;
const TIP_R = 5.5; // tip centre at 44.5 → outer edge at 50

const SPIKE_COUNT = 16;
const SPIKES = Array.from({ length: SPIKE_COUNT }, (_, i) => {
  const a = (i * 2 * Math.PI) / SPIKE_COUNT; // 0 rad points right, so 0/90/180/270° are included
  const c = Math.cos(a);
  const s = Math.sin(a);
  return {
    x1: CX + c * STALK_FROM,
    y1: CY + s * STALK_FROM,
    x2: CX + c * STALK_TO,
    y2: CY + s * STALK_TO,
  };
});

// Fewer, bigger spikes for tiny renders keep a crisp "spiky ball" silhouette.
const SMALL_SPIKES = SPIKES.filter((_, i) => i % 2 === 0);

// Membrane proteins (M / E) scattered across the lit face of the envelope.
const MEMBRANE_DOTS: Array<[number, number, number]> = [
  [38, 30, 2.2],
  [52, 24, 1.8],
  [27, 46, 2],
  [62, 36, 2.4],
  [45, 58, 2],
  [34, 64, 1.7],
  [58, 68, 2.1],
  [70, 54, 1.8],
  [48, 42, 1.6],
];

export const art: Illustration = {
  id: 'coronavirus',
  aspect: 1,
  View: ({ uid, px }) => {
    const spikes = px < 24 ? SMALL_SPIKES : SPIKES;
    const tipR = px < 24 ? TIP_R + 1 : TIP_R;
    const tipCentre = 50 - tipR; // keep the outer edge exactly on the box
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${uid}-body`} cx="36%" cy="30%" r="78%">
            <stop offset="0%" stopColor="#fb8a8a" />
            <stop offset="45%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#8f1d1d" />
          </radialGradient>
          <radialGradient id={`${uid}-tip`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#fecaca" />
            <stop offset="55%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#b91c1c" />
          </radialGradient>
          <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="72%" stopColor="#ef4444" stopOpacity="0" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.12" />
          </radialGradient>
          <radialGradient id={`${uid}-sheen`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* faint halo */}
        {px > 40 && <circle cx={CX} cy={CY} r={55} fill={`url(#${uid}-glow)`} />}

        {/* spike stalks */}
        <g stroke="#c92a2a" strokeWidth={px < 24 ? 5 : 3.2} strokeLinecap="round">
          {spikes.map((sp, i) => (
            <line key={i} x1={sp.x1} y1={sp.y1} x2={sp.x2} y2={sp.y2} />
          ))}
        </g>

        {/* envelope */}
        <circle cx={CX} cy={CY} r={BODY_R} fill={`url(#${uid}-body)`} />

        {/* membrane proteins */}
        {px > 120 && (
          <g fill="#fda4a4" opacity="0.8">
            {MEMBRANE_DOTS.map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} />
            ))}
          </g>
        )}

        {/* soft specular highlight, upper-left */}
        {px > 24 && <ellipse cx={37} cy={31} rx={11} ry={8} fill={`url(#${uid}-sheen)`} />}

        {/* spike tips */}
        <g fill={`url(#${uid}-tip)`}>
          {spikes.map((_, i) => {
            const a = (i * 2 * Math.PI) / spikes.length;
            return (
              <circle
                key={i}
                cx={CX + Math.cos(a) * tipCentre}
                cy={CY + Math.sin(a) * tipCentre}
                r={tipR}
              />
            );
          })}
        </g>
      </svg>
    );
  },
};
