import type { Illustration } from '../types';

// DNA double helix — measured axis: width (horizontal). The twisted strands span x = 0 (left
// extreme of one backbone) to x = 100 (right extreme of the other). Two full turns tall.
// aspect = width / height of the bounding box: 100 / 240.
const W = 100;
const H = 240;
const PITCH = 120; // one full turn
const AMP = 46; // backbone centre-line amplitude; stroke 8 pushes the edge to x = 0 / 100
const CX = 50;
const STROKE = 8;

const strandX = (y: number, sign: 1 | -1) => CX + sign * AMP * Math.sin((2 * Math.PI * y) / PITCH);

/** Polyline for one backbone between two y values. */
const segment = (y0: number, y1: number, sign: 1 | -1, reverse = false) => {
  const pts: string[] = [];
  for (let y = y0; y <= y1 + 0.001; y += 2) pts.push(`${strandX(y, sign).toFixed(2)} ${y.toFixed(2)}`);
  if (reverse) pts.reverse();
  return pts.join(' L');
};

/** Lens between the two backbones from one crossing to the next (solid silhouette). */
const lens = (y0: number, y1: number) => `M${segment(y0, y1, 1)} L${segment(y0, y1, -1, true)} Z`;

// Depth order: strand A (sign +1) is nearest the viewer around y = 0, 120, 240; strand B around y = 60, 180.
// Segments split at the extremes (y = 30, 90, 150, 210), where the strands swap front/back.
const splits = [0, 30, 90, 150, 210, 240];
const strandSegs = splits.slice(0, -1).map((y0, i) => {
  const y1 = splits[i + 1];
  const aFront = i % 2 === 0;
  return { y0, y1, aFront };
});

// Ten base pairs per turn; none fall on a crossing.
const rungs: number[] = [];
for (let y = 6; y < H; y += 12) rungs.push(y);

export const art: Illustration = {
  id: 'dna-width',
  aspect: W / H,
  View: ({ uid, px }) => {
    const tiny = px < 24;
    const rich = px > 120;
    const sw = tiny ? STROKE + 4 : STROKE;
    // Keep the round end caps inside the box: trim the outermost segments by half the stroke.
    const trim = (y: number) => Math.min(Math.max(y, sw / 2), H - sw / 2);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`${uid}-front`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#E2C4FF" />
            <stop offset="55%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#8B3FD9" />
          </linearGradient>
          <linearGradient id={`${uid}-back`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#8E4FD6" />
            <stop offset="100%" stopColor="#5B2A9E" />
          </linearGradient>
          <linearGradient id={`${uid}-lens`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#C084FC" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#7E3AC8" stopOpacity="0.16" />
          </linearGradient>
        </defs>

        {/* ribbon between the backbones: solid when tiny, a faint tint of volume otherwise */}
        <g fill={tiny ? '#B475F2' : `url(#${uid}-lens)`}>
          {[0, 60, 120, 180].map((y0) => (
            <path key={y0} d={lens(y0, y0 + 60)} />
          ))}
        </g>

        {/* far backbones */}
        <g fill="none" stroke={`url(#${uid}-back)`} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          {strandSegs.map(({ y0, y1, aFront }) => (
            <path key={`b${y0}`} d={`M${segment(trim(y0), trim(y1), aFront ? -1 : 1)}`} />
          ))}
        </g>

        {/* base pairs: two bases meeting at the axis */}
        {!tiny && (
          <g strokeWidth={rich ? 4.2 : 5} strokeLinecap="round">
            {rungs.map((y, i) => {
              const xa = strandX(y, 1);
              const xb = strandX(y, -1);
              const warm = i % 2 === 0;
              const left = xa < xb ? xa : xb;
              const right = xa < xb ? xb : xa;
              const inset = STROKE * 0.35;
              return (
                <g key={y}>
                  <line x1={left + inset} y1={y} x2={CX} y2={y} stroke={warm ? '#F3D9FF' : '#F9A8D4'} />
                  <line x1={CX} y1={y} x2={right - inset} y2={y} stroke={warm ? '#9D5CF0' : '#6D3BC4'} />
                </g>
              );
            })}
          </g>
        )}

        {/* near backbones */}
        <g fill="none" stroke={`url(#${uid}-front)`} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          {strandSegs.map(({ y0, y1, aFront }) => (
            <path key={`f${y0}`} d={`M${segment(trim(y0), trim(y1), aFront ? 1 : -1)}`} />
          ))}
        </g>

        {/* upper-left light: a slim highlight riding the near backbones */}
        {rich && (
          <g fill="none" stroke="#F6EBFF" strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round">
            {strandSegs.map(({ y0, y1, aFront }) => (
              <path key={`h${y0}`} d={`M${segment(y0 + 4, y1 - 4, aFront ? 1 : -1)}`} transform="translate(-1.8 -1)" />
            ))}
          </g>
        )}
      </svg>
    );
  },
};
