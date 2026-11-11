import type { Illustration } from '../types';

// Orion Nebula — measured axis: diameter (horizontal). The gas spans x = 0..100; bounding box 100 x 70.
// (Coordinates below are authored in a 100 x 80 space and shifted up 10 by the outer group.)
// Silhouette: an asymmetric broad wedge opening from the bright core (upper-right of centre) toward the
// lower-left, plus one slender wing reaching right to x = 100. There is NO outline path: the body is built
// only from feathered radial-gradient ellipses (every gradient reaches zero at the rim) stacked along the
// sweep, with offset copies at opacity 0.2-0.3 so the edge is uneven and frayed rather than one clean rim.
// Tendrils are tapered paths rooted INSIDE the body, filled with a linear gradient that fades to nothing at
// the tip. The Fish's Mouth dust bay is a soft dark gradient drawn after the core; a wispy blue reflection
// haze overlaps the upper-left. Gradients only, no filters. Only halo-level opacity (<= 0.3) leaves the box.
const BASE = '#F472B6';
const LIGHT = '#FBCFE8';
const DEEP = '#DB2777';
const DARK = '#8A1F5C';
const DUST = '#2E1238';
const BLUE = '#8FCBFF';
const BLUE_DEEP = '#3B82F6';
const CORE = '#FFF4F9';

// feathered gas lobes: [cx, cy, rx, ry, rotate, opacity]
const BODY_LOBES: [number, number, number, number, number, number][] = [
  // main wedge spine, core to lower-left
  [44, 40, 30, 15, -47, 1],
  // mid-wedge fill
  [32, 46, 22, 13, -34, 0.9],
  // broad lower-left end
  [24, 60, 22, 13, -28, 1],
  // left tip toward x = 0
  [13.5, 57, 14.5, 8, -18, 0.95],
  // lower arc
  [36, 69, 18, 8.5, -12, 0.9],
  // apex gas on the upper edge, left of the core (the dust bay notches into it)
  [48, 22, 15, 8, -25, 0.9],
  // lower edge of the fan, below the core, so the wedge opens wide
  [50, 54, 16, 9, -62, 0.85],
  // wing root joining the core to the slender wing
  [70, 26, 12, 7, 15, 0.9],
  // slender right wing, thin to x = 100
  [81, 28, 21.5, 5.5, 8, 0.95],
];

// tendrils: [rootX, rootY, tipX, tipY, halfWidth]. Each is an ellipse from root to tip whose gradient is
// centred on the ROOT end (inside the gas), so it grows out of the body and fades to nothing at the tip.
const TENDRILS: [number, number, number, number, number][] = [
  [15, 55, 0.5, 55.5, 2.4],
  [18, 67, 5, 78.5, 2.4],
  [36, 70, 27, 79.5, 2],
  [42, 66, 58, 62, 2.2],
  [26, 42, 12, 36, 2.2],
  [90, 28.5, 100, 30.5, 1.6],
  [86, 24, 95, 21.5, 1.5],
];

// offset copies that break the rim: same gradient, shifted and re-rotated, opacity 0.2-0.3
const EDGE_BREAKS: [number, number, number, number, number, number][] = [
  [20, 62, 22, 12, -40, 0.28],
  [30, 70, 16, 8, -5, 0.25],
  [46, 38, 30, 12, -58, 0.25],
  [9, 52, 10, 6, -30, 0.3],
  [50, 9, 12, 6, -30, 0.25],
  [80, 31, 19, 4, 15, 0.28],
  [14, 68, 12, 6, -50, 0.26],
  [48, 70, 12, 5, 8, 0.24],
];

const TRAPEZIUM: [number, number, number][] = [
  [58, 25, 1.3],
  [61.5, 23.5, 0.95],
  [60.5, 28, 1.0],
  [63.5, 26, 0.85],
];

const FIELD_STARS: [number, number, number][] = [
  [8, 18, 0.5], [22, 14, 0.5], [32, 12, 0.55], [84, 15, 0.5], [95, 20, 0.55],
  [95, 48, 0.5], [86, 60, 0.55], [68, 74, 0.5], [6, 36, 0.45], [44, 56, 0.5],
  [76, 42, 0.5], [28, 74, 0.5], [50, 50, 0.4],
];

export const art: Illustration = {
  id: 'orion-nebula',
  aspect: 100 / 70,
  View: ({ uid, px }) => {
    const tiny = px <= 24;
    return (
      <svg viewBox="0 0 100 70" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          {/* radial gradients are centred (r = 50%) so every ellipse feathers to nothing at its rim */}
          <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="30%" stopColor={DEEP} stopOpacity="0.26" />
            <stop offset="100%" stopColor={DEEP} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-body`} cx="46%" cy="44%" r="50%">
            <stop offset="0%" stopColor={BASE} stopOpacity={tiny ? 1 : 0.95} />
            <stop offset="55%" stopColor={BASE} stopOpacity={tiny ? 0.95 : 0.82} />
            <stop offset="85%" stopColor={DEEP} stopOpacity={tiny ? 0.5 : 0.35} />
            <stop offset="100%" stopColor={DEEP} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-deep`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={DARK} stopOpacity="0.62" />
            <stop offset="100%" stopColor={DARK} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-light`} cx="42%" cy="40%" r="50%">
            <stop offset="0%" stopColor={LIGHT} stopOpacity="0.6" />
            <stop offset="100%" stopColor={LIGHT} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-core`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={CORE} stopOpacity="1" />
            <stop offset="22%" stopColor={LIGHT} stopOpacity="0.9" />
            <stop offset="60%" stopColor={BASE} stopOpacity="0.3" />
            <stop offset="100%" stopColor={BASE} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-blue`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.4" />
            <stop offset="100%" stopColor={BLUE_DEEP} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-dust`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={DUST} stopOpacity="0.85" />
            <stop offset="45%" stopColor={DUST} stopOpacity="0.55" />
            <stop offset="100%" stopColor={DUST} stopOpacity="0" />
          </radialGradient>
          {/* tendril fade: centred near the root end of the (unrotated) ellipse, zero at the tip */}
          <radialGradient id={`${uid}-tendril`} cx="12%" cy="50%" r="88%">
            <stop offset="0%" stopColor={BASE} stopOpacity="0.75" />
            <stop offset="45%" stopColor={BASE} stopOpacity="0.4" />
            <stop offset="100%" stopColor={DEEP} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g transform="translate(0 -10)">
        {/* faint outer haze: opacity <= 0.26, the only thing allowed to drift past the box */}
        <ellipse cx="48" cy="42" rx="54" ry="40" fill={`url(#${uid}-halo)`} />

        {/* ---- blue reflection haze: wispy, low opacity, over the upper-left side ---- */}
        <ellipse cx="28" cy="20" rx="26" ry="10" transform="rotate(-28 28 20)" fill={`url(#${uid}-blue)`} opacity="0.9" />
        {!tiny && (
          <>
            <ellipse cx="14" cy="36" rx="14" ry="6" transform="rotate(-45 14 36)" fill={`url(#${uid}-blue)`} opacity="0.7" />
            <ellipse cx="34" cy="13" rx="14" ry="5" transform="rotate(-15 34 13)" fill={`url(#${uid}-blue)`} opacity="0.6" />
          </>
        )}

        {/* ---- gas body: feathered lobes along the sweep, no outline anywhere ---- */}
        {BODY_LOBES.map(([cx, cy, rx, ry, rot, o], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot} ${cx} ${cy})`} fill={`url(#${uid}-body)`} opacity={o} />
        ))}
        {/* offset copies that break the rim */}
        {EDGE_BREAKS.map(([cx, cy, rx, ry, rot, o], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot} ${cx} ${cy})`} fill={`url(#${uid}-body)`} opacity={o} />
        ))}

        {/* deeper, dimmer gas away from the upper-left light: belly under the core, wing underside, far corner */}
        <ellipse cx="54" cy="52" rx="16" ry="9" transform="rotate(-60 54 52)" fill={`url(#${uid}-deep)`} />
        <ellipse cx="84" cy="33" rx="13" ry="4" transform="rotate(8 84 33)" fill={`url(#${uid}-deep)`} opacity="0.7" />
        <ellipse cx="12" cy="66" rx="11" ry="7" fill={`url(#${uid}-deep)`} opacity="0.7" />

        {!tiny && (
          <>
            {/* tendrils growing out of the body edge, feathered on every side */}
            {TENDRILS.map(([x0, y0, x1, y1, hw], i) => {
              const cx = (x0 + x1) / 2;
              const cy = (y0 + y1) / 2;
              const rx = Math.hypot(x1 - x0, y1 - y0) / 2;
              const rot = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
              return (
                <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={hw} transform={`rotate(${rot} ${cx} ${cy})`} fill={`url(#${uid}-tendril)`} />
              );
            })}

            {/* lighter gas near the core, pulled along the sweep toward the upper-left light */}
            <ellipse cx="48" cy="34" rx="18" ry="9" transform="rotate(-48 48 34)" fill={`url(#${uid}-light)`} />
            <ellipse cx="30" cy="54" rx="12" ry="6" transform="rotate(-40 30 54)" fill={`url(#${uid}-light)`} opacity="0.55" />
            {/* soft-ended gas streams out of the core: long feathered ellipses, no ribbon edges */}
            <ellipse cx="42" cy="42" rx="22" ry="5" transform="rotate(-50 42 42)" fill={`url(#${uid}-light)`} opacity="0.7" />
            <ellipse cx="78" cy="26.5" rx="13" ry="2.6" transform="rotate(8 78 26.5)" fill={`url(#${uid}-light)`} opacity="0.6" />
            {/* the Bright Bar: a soft ionisation front below-right of the core */}
            <ellipse cx="64" cy="43" rx="10" ry="2.4" transform="rotate(68 64 43)" fill={`url(#${uid}-light)`} opacity="0.6" />
          </>
        )}

        {/* bright core around the Trapezium */}
        <ellipse cx="60" cy="26" rx={tiny ? 20 : 16} ry={tiny ? 14 : 11} transform="rotate(-30 60 26)" fill={`url(#${uid}-core)`} />
        <ellipse cx="59" cy="25.5" rx="7" ry="5.5" fill={`url(#${uid}-core)`} />

        {/* ---- the Fish's Mouth: a soft dark dust bay cutting into the bright core, drawn after it ---- */}
        {!tiny && (
          <>
            <ellipse cx="40" cy="10" rx="13" ry="7" transform="rotate(24 40 10)" fill={`url(#${uid}-dust)`} opacity="0.6" />
            <ellipse cx="46" cy="16" rx="12" ry="6" transform="rotate(28 46 16)" fill={`url(#${uid}-dust)`} />
            <ellipse cx="52" cy="20" rx="6" ry="3.4" transform="rotate(30 52 20)" fill={`url(#${uid}-dust)`} opacity="0.75" />
          </>
        )}

        {/* the Trapezium: four young stars */}
        {!tiny && (
          <g fill="#FFFFFF">
            {TRAPEZIUM.map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} />
            ))}
          </g>
        )}

        {px > 120 && (
          <g>
            {/* a young star lighting the blue haze */}
            <circle cx="24" cy="16" r="0.9" fill="#FFFFFF" opacity="0.95" />
            {/* scattered field stars */}
            <g fill="#FFFFFF" opacity="0.85">
              {FIELD_STARS.map(([x, y, r], i) => (
                <circle key={i} cx={x} cy={y} r={r} />
              ))}
            </g>
          </g>
        )}
        </g>
      </svg>
    );
  },
};
