import type { Illustration } from '../types';

// Solar System — measured axis: diameter across Neptune's orbit (horizontal).
// Face-on view: Neptune's orbit is the outer circle spanning x = 0..100; inner orbits are
// fainter concentric circles (compressed a little for legibility), a small bright Sun at the
// centre and tiny planet dots sitting on their orbits.
const C = 50;

// [orbit radius, planet dot radius, angle in degrees, colour]
const PLANETS: [number, number, number, string][] = [
  [3, 0.55, 200, '#C4B5FD'], // Mercury
  [4.4, 0.7, 320, '#E9D5FF'], // Venus
  [6, 0.75, 40, '#7CC4FF'], // Earth
  [7.8, 0.6, 130, '#F2A277'], // Mars
  [11.5, 1.5, 250, '#E8C9A0'], // Jupiter
  [19, 1.25, 20, '#F1DFA8'], // Saturn
  [32, 0.95, 160, '#A5F3FC'], // Uranus
  [49.4, 0.95, 300, '#7CC4FF'], // Neptune
];

const dot = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { cx: C + r * Math.cos(a), cy: C - r * Math.sin(a) };
};

export const art: Illustration = {
  id: 'solar-system',
  aspect: 1,
  View: ({ uid, px }) => {
    const tiny = px < 24;
    const rich = px > 120;
    const outerStroke = px < 60 ? 1.5 : 1;
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${uid}-disc`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C4B5FD" stopOpacity={tiny ? 0.8 : 0.28} />
            <stop offset="45%" stopColor="#8B5CF6" stopOpacity={tiny ? 0.6 : 0.14} />
            <stop offset="100%" stopColor="#5B21B6" stopOpacity={tiny ? 0.4 : 0.04} />
          </radialGradient>
          <radialGradient id={`${uid}-sunglow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF4C2" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#FFD27A" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFB347" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-sun`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFFBE6" />
            <stop offset="60%" stopColor="#FFD75E" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
        </defs>

        {/* faint disc of the system — gives a solid silhouette when tiny */}
        <circle cx={C} cy={C} r={50 - outerStroke / 2} fill={`url(#${uid}-disc)`} />

        {/* Neptune's orbit — the measured span, touching x = 0 and x = 100 */}
        <circle
          cx={C}
          cy={C}
          r={50 - outerStroke / 2}
          fill="none"
          stroke="#A78BFA"
          strokeWidth={outerStroke}
          opacity={tiny ? 1 : 0.95}
        />

        {/* inner orbits — fainter the further in they sit */}
        {!tiny && (
          <g fill="none" stroke="#8B5CF6">
            <circle cx={C} cy={C} r={32} strokeWidth={0.7} opacity={0.75} />
            <circle cx={C} cy={C} r={19} strokeWidth={0.6} opacity={0.65} />
            <circle cx={C} cy={C} r={11.5} strokeWidth={0.55} opacity={0.6} />
            {rich && (
              <g strokeWidth={0.4} opacity={0.5}>
                <circle cx={C} cy={C} r={7.8} />
                <circle cx={C} cy={C} r={6} />
                <circle cx={C} cy={C} r={4.4} />
                <circle cx={C} cy={C} r={3} />
              </g>
            )}
          </g>
        )}

        {/* the Sun */}
        <circle cx={C} cy={C} r={tiny ? 7 : 5.5} fill={`url(#${uid}-sunglow)`} />
        <circle cx={C} cy={C} r={tiny ? 2.6 : 1.9} fill={`url(#${uid}-sun)`} />

        {/* planets on their orbits */}
        {!tiny &&
          PLANETS.map(([r, pr, deg, col], i) => {
            const outer = i >= 4;
            if (!rich && !outer) return null;
            const { cx, cy } = dot(r, deg);
            return <circle key={i} cx={cx} cy={cy} r={pr} fill={col} />;
          })}

        {/* Saturn's ring hint */}
        {rich && (() => {
          const { cx, cy } = dot(19, 20);
          return (
            <ellipse
              cx={cx}
              cy={cy}
              rx={2.4}
              ry={0.8}
              fill="none"
              stroke="#F1DFA8"
              strokeWidth={0.35}
              opacity={0.85}
              transform={`rotate(-20 ${cx} ${cy})`}
            />
          );
        })()}
      </svg>
    );
  },
};
