import type { Illustration } from '../types';

// Rhinovirus — measured axis: diameter (horizontal). An icosahedral capsid seen down its
// five-fold axis: a decagon of flat facets (a central pentagon of five ringed by five more)
// with a round protein pentamer sitting on every rim vertex, so the outline itself is bumpy.
// The rim knobs at 0° and 180° touch x = 0 and x = 100; those at 72°/108°/252°/288° set H.
const KR = 5.5; // rim knob radius
const R = 50 - KR; // decagon circumradius
const CX = 50;
const H = 2 * (R * Math.sin((72 * Math.PI) / 180) + KR);
const CY = H / 2;

const pt = (deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [CX + R * Math.cos(a), CY + R * Math.sin(a)];
};
const P = (...pts: [number, number][]) => pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');

// Rim vertices every 36°; the pentagon uses the even ones, the outer facet apices the odd ones.
const v = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map(pt);
const C: [number, number] = [CX, CY];
const rim = P(...v);

// Flat facet colours, light from the upper-left (screen angle ~252° brightest, ~36° darkest).
const base = '#FB923C';
const lit = '#FDBA74';
const glow = '#FFD9B0';
const shade = '#E8731F';
const deep = '#C2410C';
const dusk = '#9A3412';

// Central pentagon facets: [v_i, v_{i+2}, colour] indexed into the rim array.
const inner: [number, number, string][] = [
  [0, 2, shade], // toward 36°
  [2, 4, base], // toward 108°
  [4, 6, lit], // toward 180°
  [6, 8, glow], // toward 252°
  [8, 0, lit], // toward 324°
];
// Outer facets: [v_i, apex v_{i+1}, v_{i+2}, colour].
const outer: [number, number, number, string][] = [
  [0, 1, 2, dusk],
  [2, 3, 4, deep],
  [4, 5, 6, base],
  [6, 7, 8, lit],
  [8, 9, 0, shade],
];

// Knobs: one per rim vertex plus the apex at the centre. Two-tone: body colour picked by
// which side of the light the knob sits on, with a small flat highlight disc upper-left.
const knobBody = (deg: number) => (deg >= 180 ? lit : deg > 0 && deg <= 72 ? shade : base);
const knobs: [number, number, number, string][] = [
  [CX, CY, KR + 0.8, lit],
  ...[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg, i) => [v[i][0], v[i][1], KR, knobBody(deg)] as [number, number, number, string]),
];

export const art: Illustration = {
  id: 'rhinovirus',
  aspect: 100 / H,
  View: ({ px }) => (
    <svg viewBox={`0 0 100 ${H.toFixed(3)}`} width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* silhouette body */}
      <polygon points={rim} fill={base} />

      {/* flat facets with edge strokes on top */}
      {px >= 24 && (
        <g>
          {inner.map(([a, b, fill], i) => (
            <polygon key={`i${i}`} points={P(C, v[a], v[b])} fill={fill} />
          ))}
          {outer.map(([a, apex, b, fill], i) => (
            <polygon key={`o${i}`} points={P(v[a], v[apex], v[b])} fill={fill} />
          ))}
          <path
            d={`M${P(v[0])} L${P(v[2])} L${P(v[4])} L${P(v[6])} L${P(v[8])} Z ${[0, 2, 4, 6, 8]
              .map((i) => `M${P(C)} L${P(v[i])}`)
              .join(' ')}`}
            fill="none"
            stroke={dusk}
            strokeOpacity="0.6"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          <polygon points={rim} fill="none" stroke={dusk} strokeOpacity="0.6" strokeWidth="0.8" strokeLinejoin="round" />
        </g>
      )}

      {/* protein pentamers on every capsid vertex; always drawn so the rim knobs span x = 0..100 */}
      <g>
        {knobs.map(([x, y, r, fill], i) => (
          <g key={`k${i}`}>
            <circle cx={x} cy={y} r={r} fill={px >= 24 ? fill : base} stroke={px >= 24 ? dusk : 'none'} strokeOpacity="0.7" strokeWidth="0.7" />
            {px > 48 && <circle cx={x - r * 0.28} cy={y - r * 0.28} r={r * 0.42} fill={fill === lit ? glow : fill === shade ? base : lit} />}
          </g>
        ))}
      </g>
    </svg>
  ),
};
