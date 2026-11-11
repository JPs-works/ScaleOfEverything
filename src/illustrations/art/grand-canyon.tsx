import type { Illustration } from '../types';

// Grand Canyon — measured axis: length (horizontal). Seen from above as a map: the gorge snakes
// from x = 0 to x = 100 and runs off both edges of the plateau, so the canyon itself spans the
// measured axis. The plateau is an opaque map tile filling the box top to bottom.
// The canyon is one meandering centerline — a long straight-ish western reach, a tight S-bend,
// a broad meander, then the straight narrow Marble Canyon on the east — and the rim, terrace,
// bench and inner gorge are closed polygons offset from it. The half-width follows a profile
// along x (broadest in the middle, narrowest on the right) plus a slow wobble, and is capped by
// the local radius of curvature so the bands never fold over on the inside of a bend.
// Side canyons are filled tapered wedges rooted inside the rim band, drawn beneath it.
// The centerline is horizontal at both ends, so the band ends are vertical cuts on x = 0 / 100.
// aspect = 100 / 28.
// Palette from #c8693f: highlight #e9b07a, shade #8d4328, deep #5f2a1a; plateau a dusky #7a4e3e.
const H = 28;

const BASE = '#c8693f';
const BASE_DARK = '#b25a35';
const TERRACE = '#d98b55';
const BENCH = '#e9b07a';
const SHADE = '#8d4328';
const DEEP = '#5f2a1a';
const PLATEAU = '#7a4e3e';
const PLATEAU_LIGHT = '#8e5f4c';
const PLATEAU_DARK = '#5c392e';
const RIVER = '#3f9be0';
const RIVER_LIGHT = '#a4d8ff';

type Pt = [number, number];

// Centerline of the gorge as cubic Bezier segments, horizontal at both ends.
const START: Pt = [0, 16.5];
const SEGMENTS: [Pt, Pt, Pt][] = [
  [[9, 16.5], [16, 15.6], [24, 14.2]], // long, nearly straight western reach
  [[31, 13], [32, 21], [39, 21]], // tight bend south
  [[46, 21], [45, 8.8], [53, 8.6]], // tight bend back north: the S-bend
  [[62, 8.4], [64, 17.4], [72, 17.6]], // broad meander
  [[80, 17.8], [81, 11.6], [88, 10.6]], // easing up toward Marble Canyon
  [[93, 10.1], [96, 10], [100, 10]], // straight, narrow Marble Canyon
];

const STEPS = 14;
const f = (n: number) => n.toFixed(2).replace(/\.?0+$/, '');
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smooth = (t: number) => {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
};

// Evaluate the centerline at parameter u (segment index + local t): position, unit tangent,
// unit normal pointing to the north rim, and signed curvature.
interface Sample { x: number; y: number; tx: number; ty: number; nx: number; ny: number; k: number; u: number }
const evalAt = (u: number): Sample => {
  const si = Math.min(SEGMENTS.length - 1, Math.max(0, Math.floor(u)));
  const t = clamp(u - si, 0, 1);
  const p0 = si === 0 ? START : SEGMENTS[si - 1][2];
  const [c1, c2, p3] = SEGMENTS[si];
  const mt = 1 - t;
  const x = mt * mt * mt * p0[0] + 3 * mt * mt * t * c1[0] + 3 * mt * t * t * c2[0] + t * t * t * p3[0];
  const y = mt * mt * mt * p0[1] + 3 * mt * mt * t * c1[1] + 3 * mt * t * t * c2[1] + t * t * t * p3[1];
  const dx = 3 * mt * mt * (c1[0] - p0[0]) + 6 * mt * t * (c2[0] - c1[0]) + 3 * t * t * (p3[0] - c2[0]);
  const dy = 3 * mt * mt * (c1[1] - p0[1]) + 6 * mt * t * (c2[1] - c1[1]) + 3 * t * t * (p3[1] - c2[1]);
  const ddx = 6 * mt * (c2[0] - 2 * c1[0] + p0[0]) + 6 * t * (p3[0] - 2 * c2[0] + c1[0]);
  const ddy = 6 * mt * (c2[1] - 2 * c1[1] + p0[1]) + 6 * t * (p3[1] - 2 * c2[1] + c1[1]);
  const len = Math.hypot(dx, dy) || 1;
  const k = (dx * ddy - dy * ddx) / (len * len * len);
  return { x, y, tx: dx / len, ty: dy / len, nx: dy / len, ny: -dx / len, k, u };
};

const SAMPLES: Sample[] = (() => {
  const out: Sample[] = [];
  SEGMENTS.forEach((_, si) => {
    for (let i = si === 0 ? 0 : 1; i <= STEPS; i++) out.push(evalAt(si + i / STEPS));
  });
  return out;
})();

// Rim half-width: a profile along x (broadest mid-canyon, narrowest at Marble Canyon on the
// right), a slow wobble per side, and a cap from the radius of curvature on the inner side.
const profile = (x: number) => 0.8 + 0.4 * Math.sin((Math.PI * x) / 100) - 0.4 * smooth((x - 66) / 34);
const curvCap = (s: Sample, side: 1 | -1) => {
  // k > 0 means the centre of curvature lies to the south, k < 0 to the north
  const inner = side > 0 ? s.k < 0 : s.k > 0;
  return inner ? 0.9 / Math.abs(s.k) : Infinity;
};
const northW = (s: Sample) =>
  Math.min(curvCap(s, 1), 5.3 * profile(s.x) * (1 + 0.2 * Math.sin(s.u * 2.9 + 0.4) + 0.1 * Math.sin(s.u * 7.3 + 2)));
const southW = (s: Sample) =>
  Math.min(curvCap(s, -1), 5.3 * profile(s.x) * (1 + 0.2 * Math.sin(s.u * 2.5 + 2.6) + 0.1 * Math.sin(s.u * 6.1 + 0.7)));

const edge = (k: number, side: 1 | -1) =>
  SAMPLES.map((s) => {
    const w = k * (side > 0 ? northW(s) : southW(s)) * side;
    return [clamp(s.x + s.nx * w, 0, 100), clamp(s.y + s.ny * w, 0.4, H - 0.4)];
  });
const poly = (pts: number[][]) => pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(' L');

// A closed band around the centerline, each side offset by `k` times that side's rim half-width.
// The first and last samples have vertical normals, so both ends are vertical cuts on x = 0 / 100.
const band = (k: number): string => `M${poly([...edge(k, 1), ...edge(k, -1).reverse()])} Z`;

const RIM = band(1);
const TERRACE_BAND = band(0.68);
const BENCH_BAND = band(0.42);
const GORGE_BAND = band(0.2);
const SOUTH_RIM = `M${poly(edge(1, -1))}`;
const RIVER_PATH = `M${poly(SAMPLES.map((s) => [s.x, s.y]))}`;

// Side canyons: tapered wedges whose base sits inside the rim band (hidden under it) and whose
// tip lies out on the plateau. [u, side, length, base half-width, sideways skew of the tip]
const TRIBUTARIES: [number, 1 | -1, number, number, number][] = [
  [0.5, -1, 6.5, 2.3, 2],
  [0.82, 1, 5, 1.9, -1.2],
  [2.2, 1, 5, 2, -2],
  [3.3, 1, 5.5, 2.3, -2.2],
  [3.85, -1, 4.5, 2, 1.8],
  [4.6, -1, 6.5, 2.1, 2.5],
  [5.45, 1, 4.5, 1.5, 1.2],
];
const wedge = ([u, side, L, bw, skew]: (typeof TRIBUTARIES)[number], scale: number): string => {
  const s = evalAt(u);
  const rw = side > 0 ? northW(s) : southW(s);
  const nx = s.nx * side;
  const ny = s.ny * side;
  const hw = bw * scale;
  const bx = s.x + nx * rw * 0.5;
  const by = s.y + ny * rw * 0.5;
  const b1 = [bx + s.tx * hw, by + s.ty * hw];
  const b2 = [bx - s.tx * hw, by - s.ty * hw];
  const reach = rw + L * (0.7 + 0.3 * scale);
  const tip = [clamp(s.x + nx * reach + s.tx * skew, 0.8, 99.2), clamp(s.y + ny * reach + s.ty * skew, 0.8, H - 0.8)];
  // quadratic controls bowed sideways so the wedge bends like a real side canyon
  const q = (b: number[]) => [(b[0] + tip[0]) / 2 + s.tx * skew * 0.35, (b[1] + tip[1]) / 2 + s.ty * skew * 0.35];
  const q1 = q(b1);
  const q2 = q(b2);
  return `M${f(b1[0])} ${f(b1[1])} Q${f(q1[0])} ${f(q1[1])} ${f(tip[0])} ${f(tip[1])} Q${f(q2[0])} ${f(q2[1])} ${f(b2[0])} ${f(b2[1])} Z`;
};
const TRIB_OUTER = TRIBUTARIES.map((t) => wedge(t, 1));
const TRIB_INNER = TRIBUTARIES.map((t) => wedge(t, 0.55));

export const art: Illustration = {
  id: 'grand-canyon',
  aspect: 100 / H,
  View: ({ uid, px }) => (
    <svg viewBox={`0 0 100 ${H}`} width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* plateau: an opaque map tile, lit from the upper-left */}
        <linearGradient id={`${uid}-plateau`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={PLATEAU_LIGHT} />
          <stop offset="55%" stopColor={PLATEAU} />
          <stop offset="100%" stopColor={PLATEAU_DARK} />
        </linearGradient>
        <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor={BASE} />
          <stop offset="55%" stopColor="#bf6239" />
          <stop offset="100%" stopColor={BASE_DARK} />
        </linearGradient>
        <clipPath id={`${uid}-box`}>
          <rect x="0" y="0" width="100" height={H} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${uid}-box)`} fill="none" strokeLinecap="butt" strokeLinejoin="round">
        {/* ---- plateau ---- */}
        <rect x="0" y="0" width="100" height={H} fill={`url(#${uid}-plateau)`} />
        {px > 120 && (
          <g fill={PLATEAU_DARK} opacity="0.35">
            {/* forested mesas and scrub on the rims */}
            <ellipse cx="8" cy="4.6" rx="4.2" ry="1.4" />
            <ellipse cx="27" cy="25" rx="5" ry="1.5" />
            <ellipse cx="50" cy="25.2" rx="4.6" ry="1.3" />
            <ellipse cx="74" cy="3.6" rx="4" ry="1.3" />
            <ellipse cx="90" cy="23.6" rx="4.4" ry="1.4" />
            <ellipse cx="38" cy="3.4" rx="3" ry="1.1" />
          </g>
        )}

        {/* ---- side canyons: tapered wedges beneath the main gorge ---- */}
        {px > 60 && (
          <g>
            {TRIB_OUTER.map((d, i) => (
              <path key={`t${i}`} d={d} fill={SHADE} />
            ))}
            {TRIB_INNER.map((d, i) => (
              <path key={`b${i}`} d={d} fill={BASE} />
            ))}
          </g>
        )}

        {/* ---- the gorge: nested bands around one centerline ---- */}
        <path d={RIM} fill={`url(#${uid}-rim)`} />
        {px >= 24 && (
          <>
            <path d={TERRACE_BAND} fill={TERRACE} />
            <path d={BENCH_BAND} fill={BENCH} />
            <path d={GORGE_BAND} fill={SHADE} />
            {/* the shadowed south rim, so the band reads as cut into the ground */}
            <path d={SOUTH_RIM} stroke={DEEP} strokeWidth="0.8" opacity="0.8" />
          </>
        )}
        {px > 120 && (
          <g stroke={SHADE} strokeWidth="0.3" opacity="0.5">
            {/* thin ledge lines along the layer edges */}
            <path d={TERRACE_BAND} />
            <path d={BENCH_BAND} />
          </g>
        )}

        {/* ---- the Colorado River along the floor ---- */}
        {px >= 24 && <path d={RIVER_PATH} stroke={RIVER} strokeWidth="0.85" strokeLinejoin="round" />}
        {px > 120 && <path d={RIVER_PATH} stroke={RIVER_LIGHT} strokeWidth="0.25" opacity="0.85" transform="translate(0 -0.2)" />}
      </g>
    </svg>
  ),
};
