import type { Illustration } from '../types';

// Sun → Voyager 1 distance — measured axis: distance (horizontal), Sun to probe.
// Drawn as a measured span: the Sun itself is the left terminal (its limb touches x = 0), a faint
// half-ring for Neptune's orbit (30 AU of ~171 AU → radius 17.5 units, which sets the box height),
// and a Voyager glyph at the right end — solid bowl dish facing back toward the Sun, solid bus block,
// RTG boom trailing right so its last can touches x = 100 — joined by a thin line. No end caps: the
// two glyphs are the terminals. aspect = width / height of the bounding box: 100 / 36.
// Palette built from #A5B4FC: highlight #e0e7ff, base #A5B4FC, shade #6366f1, deep #3730a3.
const MID_Y = 18;
const SUN_R = 2.2;
const SUN_CX = SUN_R; // limb on x = 0
// Planet orbits as a fraction of the 171 AU span, in viewBox units.
const NEPTUNE_R = 17.5;
const URANUS_R = 11.2;
const SATURN_R = 5.6;

// Voyager layout (all x in viewBox units). Dish is ~2x the bus height so the masses read.
const DISH_X = 88.2; // deepest point of the bowl (leftmost)
const DISH_FACE = 91.6; // flat back of the dish / front of the bus
const BUS_W = 3.6;
const BUS_H = 4;
const DISH_H = 8;
const BOOM_END = 100;

// Right-hand half of an orbit ring centred on the Sun (the left half would spill past x = 0).
const halfRing = (r: number) => `M${SUN_CX} ${MID_Y - r} A${r} ${r} 0 0 1 ${SUN_CX} ${MID_Y + r}`;

export const art: Illustration = {
  id: 'voyager-1-distance',
  aspect: 100 / 36,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 36" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <radialGradient id={`${uid}-sun`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#fff8dc" />
          <stop offset="55%" stopColor="#ffd166" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <radialGradient id={`${uid}-sunglow`} cx="50%" cy="50%" r="50%">
          <stop offset="35%" stopColor="#ffd166" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffd166" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-line`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="50%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#e0e7ff" />
        </linearGradient>
        {/* dish: lit from the upper-left, darker toward the lower-right */}
        <linearGradient id={`${uid}-dish`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#eef2ff" />
          <stop offset="50%" stopColor="#c7d2fe" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id={`${uid}-bus`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>

      {px <= 24 ? (
        /* tiny: one heavy pale bar, a golden Sun bead at the left, a pale probe block at the right */
        <g>
          <rect x="0" y="12.5" width="100" height="11" rx="3" fill="#A5B4FC" />
          <circle cx="6" cy={MID_Y} r="6" fill="#ffd166" />
          <rect x="94" y="11" width="6" height="14" rx="1" fill="#eef2ff" />
        </g>
      ) : (
        <g>
          {/* planetary orbits around the Sun: Neptune's ring sets the box height; the inner ones are fainter */}
          <path d={halfRing(NEPTUNE_R)} fill="none" stroke="#A5B4FC" strokeWidth="0.4" opacity="0.35" />
          {px > 120 && (
            <g fill="none" stroke="#A5B4FC" strokeWidth="0.3" opacity="0.2">
              <path d={halfRing(URANUS_R)} />
              <path d={halfRing(SATURN_R)} />
            </g>
          )}
          {/* Neptune, a small blue bead on its ring */}
          {px > 60 && <circle cx={SUN_CX + NEPTUNE_R * 0.766} cy={MID_Y - NEPTUNE_R * 0.643} r="0.55" fill="#60a5fa" />}

          {/* span line, Sun to dish (the glyphs are the terminals, so no end caps) */}
          <line
            x1={SUN_CX}
            y1={MID_Y}
            x2={DISH_X + 0.6}
            y2={MID_Y}
            stroke={px > 60 ? `url(#${uid}-line)` : '#c7d2fe'}
            strokeWidth={px > 120 ? 0.45 : px > 60 ? 1 : 2}
            opacity="0.9"
          />

          {/* faint distance ticks: each marks ~1/10 of the way to Voyager */}
          {px > 120 && (
            <g stroke="#A5B4FC" strokeWidth="0.3" opacity="0.4">
              {[10, 20, 30, 40, 50, 60, 70, 80].map((x) => (
                <line key={x} x1={x} y1={MID_Y - 0.7} x2={x} y2={MID_Y + 0.7} />
              ))}
            </g>
          )}

          {/* the Sun: the left terminal, a warm bead with a soft glow */}
          <circle cx={SUN_CX} cy={MID_Y} r={SUN_R * 2.6} fill={`url(#${uid}-sunglow)`} />
          <circle cx={SUN_CX} cy={MID_Y} r={px > 60 ? SUN_R : SUN_R * 1.35} fill={`url(#${uid}-sun)`} />
          {px > 60 && <circle cx={SUN_CX - 0.6} cy={MID_Y - 0.7} r="0.5" fill="#fffbe6" opacity="0.8" />}

          {/* Voyager 1: dish pointed back toward the Sun, bus behind it, RTG boom trailing right to x = 100 */}
          <g>
            {/* magnetometer boom, a thin slash angled up and away (detail only) */}
            {px > 120 && <line x1={DISH_FACE + BUS_W - 0.6} y1={MID_Y - BUS_H / 2 + 0.4} x2="98.8" y2="12.2" stroke="#A5B4FC" strokeWidth="0.3" opacity="0.8" />}
            {/* RTG boom */}
            <line x1={DISH_FACE + BUS_W - 0.2} y1={MID_Y} x2={BOOM_END - 0.3} y2={MID_Y} stroke="#A5B4FC" strokeWidth={px > 120 ? 0.45 : 0.9} />
            {/* three generator cans; the last one touches x = 100 */}
            {px > 60 ? (
              <g fill="#6366f1">
                <rect x="96.1" y={MID_Y - 1} width="1.1" height="2" rx="0.25" />
                <rect x="97.5" y={MID_Y - 1} width="1.1" height="2" rx="0.25" />
                <rect x="98.9" y={MID_Y - 1} width="1.1" height="2" rx="0.25" />
              </g>
            ) : (
              <rect x="97.6" y={MID_Y - 1.4} width="2.4" height="2.8" rx="0.4" fill="#6366f1" />
            )}
            {/* bus: one solid block */}
            <rect x={DISH_FACE} y={MID_Y - BUS_H / 2} width={BUS_W} height={BUS_H} rx="0.5" fill={`url(#${uid}-bus)`} />
            {/* high-gain dish: a single solid shallow bowl, concave face toward the Sun */}
            <path
              d={`M${DISH_FACE} ${MID_Y - DISH_H / 2} Q${DISH_X - 1.4} ${MID_Y} ${DISH_FACE} ${MID_Y + DISH_H / 2} Z`}
              fill={`url(#${uid}-dish)`}
            />
            {/* darker shade on the lower-right of the bowl */}
            {px > 60 && (
              <path
                d={`M${DISH_FACE} ${MID_Y + DISH_H / 2} Q${DISH_FACE - 1.6} ${MID_Y + 2.2} ${DISH_FACE - 1.9} ${MID_Y} L${DISH_FACE} ${MID_Y} Z`}
                fill="#3730a3"
                opacity="0.45"
              />
            )}
          </g>
        </g>
      )}
    </svg>
  ),
};
