import type { Illustration } from '../types';

// Great Pyramid — measured axis: height (vertical). Apex touches y = 0, the near base corner y = 100.
// Three-quarter corner view: the lit north face on the left, the shaded face on the right.
// Real proportions: 230 m base, 138.5 m tall, so the base diagonal makes the box ~2x wider than tall.
const APEX = { x: 100, y: 0 };
const LEFT = { x: 0, y: 90 };
const NEAR = { x: 120, y: 100 };
const RIGHT = { x: 200, y: 91 };

const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

// Stone courses: horizontal seams at fixed heights, denser near the base.
const COURSES = [0.14, 0.24, 0.33, 0.41, 0.49, 0.56, 0.63, 0.69, 0.75, 0.81, 0.86, 0.91, 0.96];

export const art: Illustration = {
  id: 'great-pyramid',
  aspect: 2,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 200 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${uid}-lit`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#F3D7A8" />
          <stop offset="55%" stopColor="#E0B57F" />
          <stop offset="100%" stopColor="#D4A373" />
        </linearGradient>
        <linearGradient id={`${uid}-shade`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B3844E" />
          <stop offset="60%" stopColor="#9A6E3F" />
          <stop offset="100%" stopColor="#7E5733" />
        </linearGradient>
        <radialGradient id={`${uid}-ground`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4A373" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#D4A373" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* faint sand glow at the foot */}
      <ellipse cx="100" cy="98" rx="104" ry="6" fill={`url(#${uid}-ground)`} />

      {/* shaded (east) face */}
      <path d={`M${APEX.x} ${APEX.y} L${NEAR.x} ${NEAR.y} L${RIGHT.x} ${RIGHT.y} Z`} fill={`url(#${uid}-shade)`} />
      {/* lit (north) face */}
      <path d={`M${APEX.x} ${APEX.y} L${LEFT.x} ${LEFT.y} L${NEAR.x} ${NEAR.y} Z`} fill={`url(#${uid}-lit)`} />

      {px > 24 && (
        <g>
          {/* corner ridge catching the light */}
          <path d={`M${APEX.x} ${APEX.y} L${NEAR.x} ${NEAR.y}`} stroke="#F7E2BC" strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />
          {/* original entrance, low on the north face */}
          <path
            d={`M${lerp(APEX, LEFT, 0.83).x + 3} ${lerp(APEX, LEFT, 0.83).y + 0.5} l4 -0.4 l0 5.6 l-4 0.4 Z`}
            fill="#6E4A2A"
          />
        </g>
      )}

      {px > 120 && (
        <g stroke="#7E5733" strokeWidth="0.45" strokeLinecap="round">
          {/* stone courses on the lit face */}
          {COURSES.map((t) => {
            const a = lerp(APEX, LEFT, t);
            const b = lerp(APEX, NEAR, t);
            return <path key={`l${t}`} d={`M${a.x} ${a.y} L${b.x} ${b.y}`} opacity="0.35" />;
          })}
          {/* stone courses on the shaded face */}
          {COURSES.map((t) => {
            const a = lerp(APEX, NEAR, t);
            const b = lerp(APEX, RIGHT, t);
            return <path key={`r${t}`} d={`M${a.x} ${a.y} L${b.x} ${b.y}`} opacity="0.5" />;
          })}
          {/* a few surviving casing stones at the base */}
          <path d={`M${LEFT.x + 2} ${LEFT.y - 1.6} l9 0.8 l0 1.8 l-9 -0.8 Z`} fill="#F3D7A8" stroke="none" opacity="0.9" />
          <path d={`M${LEFT.x + 14} ${LEFT.y - 0.4} l7 0.6 l0 1.9 l-7 -0.6 Z`} fill="#F3D7A8" stroke="none" opacity="0.9" />
        </g>
      )}
    </svg>
  ),
};
