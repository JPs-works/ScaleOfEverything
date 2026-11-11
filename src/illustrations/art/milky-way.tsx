import type { Illustration } from '../types';

// Milky Way — measured axis: diameter (horizontal). Seen face-on, so the disc is a circle
// spanning x = 0..100. Two main log-spiral arms sweep 200° from the ends of the central bar
// and land exactly on the left and right edges; two fainter minor arms sit between them.
// Arm paths were generated as tapered bands: r = r0·e^(bθ), width easing from thick to thin.

const ARM_A =
  'M35.4 55.3 L34.2 53.9 L33.2 52.2 L32.4 50.4 L31.8 48.4 L31.4 46.3 L31.2 44.1 L31.3 41.8 L31.6 39.4 L32.2 37.0 L33.2 34.6 L34.4 32.2 L35.9 29.9 L37.8 27.7 L39.9 25.7 L42.4 23.8 L45.1 22.2 L48.1 20.9 L51.3 19.8 L54.8 19.1 L58.4 18.7 L62.2 18.7 L66.0 19.2 L70.0 20.1 L73.9 21.5 L77.9 23.3 L81.7 25.6 L85.5 28.5 L89.0 31.8 L92.3 35.7 L95.2 40.0 L97.8 44.8 L100.0 50.0 L98.6 50.0 L95.7 45.0 L92.4 40.6 L88.8 36.8 L85.1 33.6 L81.2 31.1 L77.3 29.0 L73.4 27.6 L69.6 26.6 L65.9 26.1 L62.5 26.1 L59.2 26.4 L56.2 27.0 L53.4 27.9 L50.9 29.1 L48.7 30.4 L46.8 31.9 L45.2 33.5 L43.8 35.1 L42.8 36.8 L41.9 38.5 L41.3 40.1 L40.9 41.7 L40.7 43.2 L40.7 44.6 L40.8 45.9 L41.0 47.2 L41.3 48.3 L41.7 49.3 L42.2 50.2 L42.8 50.9 L43.4 51.6 L43.9 52.2Z';
const ARM_B =
  'M64.6 44.7 L65.8 46.1 L66.8 47.8 L67.6 49.6 L68.2 51.6 L68.6 53.7 L68.8 55.9 L68.7 58.2 L68.4 60.6 L67.8 63.0 L66.8 65.4 L65.6 67.8 L64.1 70.1 L62.2 72.3 L60.1 74.3 L57.6 76.2 L54.9 77.8 L51.9 79.1 L48.7 80.2 L45.2 80.9 L41.6 81.3 L37.8 81.3 L34.0 80.8 L30.0 79.9 L26.1 78.5 L22.1 76.7 L18.3 74.4 L14.5 71.5 L11.0 68.2 L7.7 64.3 L4.8 60.0 L2.2 55.2 L0.0 50.0 L1.4 50.0 L4.3 55.0 L7.6 59.4 L11.2 63.2 L14.9 66.4 L18.8 68.9 L22.7 71.0 L26.6 72.4 L30.4 73.4 L34.1 73.9 L37.5 73.9 L40.8 73.6 L43.8 73.0 L46.6 72.1 L49.1 70.9 L51.3 69.6 L53.2 68.1 L54.8 66.5 L56.2 64.9 L57.2 63.2 L58.1 61.5 L58.7 59.9 L59.1 58.3 L59.3 56.8 L59.3 55.4 L59.2 54.1 L59.0 52.8 L58.7 51.7 L58.3 50.7 L57.8 49.8 L57.2 49.1 L56.6 48.4 L56.1 47.8Z';
const MINOR_A =
  'M54.7 62.9 L53.8 64.5 L52.5 65.7 L51.0 66.6 L49.4 67.4 L47.7 67.9 L45.8 68.3 L43.9 68.5 L41.9 68.4 L39.8 68.2 L37.8 67.7 L35.7 67.0 L33.6 66.0 L31.6 64.8 L29.7 63.4 L27.8 61.8 L26.1 59.9 L24.5 57.8 L23.1 55.5 L21.9 53.0 L20.8 50.3 L20.0 47.5 L19.5 44.4 L19.2 41.3 L19.3 38.0 L19.6 34.7 L20.3 31.3 L21.3 27.9 L22.7 24.4 L24.5 21.0 L26.6 17.7 L29.1 14.5 L32.0 11.4 L32.5 12.5 L29.8 15.7 L27.6 19.1 L25.8 22.5 L24.3 26.0 L23.3 29.4 L22.6 32.8 L22.3 36.1 L22.3 39.2 L22.6 42.3 L23.2 45.1 L24.0 47.8 L25.1 50.3 L26.3 52.5 L27.6 54.6 L29.1 56.4 L30.7 58.0 L32.4 59.4 L34.1 60.5 L35.8 61.5 L37.5 62.2 L39.2 62.8 L40.9 63.2 L42.5 63.4 L44.1 63.5 L45.6 63.4 L47.0 63.3 L48.3 63.0 L49.6 62.7 L50.8 62.4 L51.9 62.0 L53.0 61.6 L54.2 61.5Z';
const MINOR_B =
  'M45.3 37.1 L46.2 35.5 L47.5 34.3 L49.0 33.4 L50.6 32.6 L52.3 32.1 L54.2 31.7 L56.1 31.5 L58.1 31.6 L60.2 31.8 L62.2 32.3 L64.3 33.0 L66.4 34.0 L68.4 35.2 L70.3 36.6 L72.2 38.2 L73.9 40.1 L75.5 42.2 L76.9 44.5 L78.1 47.0 L79.2 49.7 L80.0 52.5 L80.5 55.6 L80.8 58.7 L80.7 62.0 L80.4 65.3 L79.7 68.7 L78.7 72.1 L77.3 75.6 L75.5 79.0 L73.4 82.3 L70.9 85.5 L68.0 88.6 L67.5 87.5 L70.2 84.3 L72.4 80.9 L74.2 77.5 L75.7 74.0 L76.7 70.6 L77.4 67.2 L77.7 63.9 L77.7 60.8 L77.4 57.7 L76.8 54.9 L76.0 52.2 L74.9 49.7 L73.7 47.5 L72.4 45.4 L70.9 43.6 L69.3 42.0 L67.6 40.6 L65.9 39.5 L64.2 38.5 L62.5 37.8 L60.8 37.2 L59.1 36.8 L57.5 36.6 L55.9 36.5 L54.4 36.6 L53.0 36.7 L51.7 37.0 L50.4 37.3 L49.2 37.6 L48.1 38.0 L47.0 38.4 L45.8 38.5Z';

// Star dots scattered along the two main arms: [cx, cy, r]
const STARS: [number, number, number][] = [
  [35.6, 49.0, 0.9],
  [37.4, 45.4, 0.7],
  [36.1, 39.9, 1.1],
  [39.0, 35.9, 0.8],
  [41.5, 29.0, 1.2],
  [47.6, 27.0, 0.7],
  [54.8, 22.6, 0.9],
  [62.4, 24.5, 0.7],
  [72.8, 24.7, 1.1],
  [81.2, 30.5, 0.8],
  [92.2, 37.9, 1.2],
  [97.0, 50.0, 0.7],
  [62.0, 50.8, 0.9],
  [65.3, 55.6, 0.7],
  [62.9, 59.4, 1.1],
  [62.1, 65.4, 0.8],
  [57.3, 68.1, 1.2],
  [52.5, 73.9, 0.7],
  [45.6, 75.0, 0.9],
  [36.3, 78.1, 0.7],
  [28.1, 74.4, 1.1],
  [17.3, 70.4, 0.8],
  [10.8, 61.2, 1.2],
  [2.1, 50.0, 0.7],
];
// Fainter dots on the minor arms
const MINOR_STARS: [number, number, number][] = [
  [24.5, 24.0, 0.7], [20.9, 38.0, 0.6], [23.6, 53.5, 0.7], [36.5, 65.0, 0.6],
  [75.5, 76.0, 0.7], [79.1, 62.0, 0.6], [76.4, 46.5, 0.7], [63.5, 35.0, 0.6],
];

export const art: Illustration = {
  id: 'milky-way',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* faint stellar disc, denser toward the centre */}
        <radialGradient id={`${uid}-disc`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.75" />
          <stop offset="45%" stopColor="#8B5CF6" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.22" />
        </radialGradient>
        {/* arm colour: violet-blue near the hub, lighter lilac toward the rim (light from upper-left) */}
        <radialGradient id={`${uid}-arm`} cx="42%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#8B9CFF" />
          <stop offset="55%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#C4B5FD" />
        </radialGradient>
        {/* central bulge: creamy white core to warm gold */}
        <radialGradient id={`${uid}-bulge`} cx="42%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#FFF7D6" />
          <stop offset="50%" stopColor="#F6D77A" />
          <stop offset="100%" stopColor="#E0A93F" />
        </radialGradient>
        {/* bar glow, fading to transparent at its tips */}
        <radialGradient id={`${uid}-bar`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FBE7A3" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#F3C96B" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E8B04A" stopOpacity="0.15" />
        </radialGradient>
        {/* halo slightly beyond the disc */}
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="80%" stopColor="#A855F7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* outer halo (faint, spills 14% beyond the box) */}
      {px > 24 && <circle cx="50" cy="50" r="57" fill={`url(#${uid}-halo)`} />}
      {/* the disc itself, spanning x = 0..100 */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-disc)`} />

      {/* minor arms (soft, behind) */}
      {px > 24 && (
        <g fill={`url(#${uid}-arm)`} opacity="0.45">
          <path d={MINOR_A} />
          <path d={MINOR_B} />
        </g>
      )}

      {/* main arms: a wide soft layer under a brighter core */}
      <g fill={`url(#${uid}-arm)`}>
        <path d={ARM_A} opacity="0.55" stroke={`url(#${uid}-arm)`} strokeWidth="3" strokeLinejoin="round" strokeOpacity="0.4" />
        <path d={ARM_B} opacity="0.55" stroke={`url(#${uid}-arm)`} strokeWidth="3" strokeLinejoin="round" strokeOpacity="0.4" />
        <path d={ARM_A} opacity="0.92" />
        <path d={ARM_B} opacity="0.92" />
      </g>

      {/* dust lanes hugging the inner edge of each main arm */}
      {px > 120 && (
        <g fill="none" stroke="#2E1065" strokeWidth="1.2" strokeLinecap="round" opacity="0.4">
          <path d="M39.5 50.5 C37.5 44 38.5 36 44 30 C50 24.5 59 23 68 25.5 C78 28.5 87 35 93 45" />
          <path d="M60.5 49.5 C62.5 56 61.5 64 56 70 C50 75.5 41 77 32 74.5 C22 71.5 13 65 7 55" />
        </g>
      )}

      {/* central bar: tilted ellipse joining the two arm roots */}
      <ellipse cx="50" cy="50" rx="23" ry="7.5" transform="rotate(-20 50 50)" fill={`url(#${uid}-bar)`} />
      {/* bulge */}
      <circle cx="50" cy="50" r="9.5" fill={`url(#${uid}-bulge)`} />
      {px > 40 && <circle cx="47.5" cy="47.5" r="3.6" fill="#FFFBEA" opacity="0.85" />}

      {/* star dots along the arms */}
      {px > 60 && (
        <g fill="#F5F3FF">
          {STARS.map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} opacity={i % 3 === 0 ? 0.95 : 0.75} />
          ))}
        </g>
      )}
      {px > 120 && (
        <g fill="#E9D5FF" opacity="0.7">
          {MINOR_STARS.map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      )}
    </svg>
  ),
};
