import type { Illustration } from '../types';

// Blue whale — measured axis: length (horizontal). Side view facing right, seen very slightly from
// above: the near fluke tip touches x = 0 and the blunt snout touches x = 100. The small dorsal fin
// tip touches y = 0 and the trailing pectoral flipper tip touches y = 20, so the bounding box is
// 100 x 20. aspect = width / height of the bounding box: 100 / 20.
// Shape notes: long shallow spindle, nearly flat back, broad blunt head (dorsal line meets the jaw
// line in a soft 3-unit curve at the snout), tiny dorsal nub far back, HORIZONTAL flukes drawn as
// one dominant broad paddle (near lobe) with a thin lit sliver (far lobe) riding above it and a
// shallow notch between them, flat two-tone colouring (BASE back over a pale BELLY, no gradient).
const BASE = '#1D4ED8';
const FLANK = '#1946C6';
const LIGHT = '#5B8AF0';
const DARK = '#163FAF';
const DEEP = '#0C2466';
const BELLY = '#AEC1EA';
const BELLY_SHADE = '#7F98D2';
const FLIPPER = '#7A9BE0';
const FLIPPER_EDGE = '#B9CCF3';
const MOTTLE = '#9CC0FF';

// body outline, starting at the tail-stock top and running clockwise over the back to the snout
const BODY =
  'M16 9.2 C20 6.4 26 3.2 36 2.2 C52 0.9 70 0.8 84 2.1 C92 3.2 98 4.6 100 6.5 ' +
  'C100 7.6 100 8.7 99.6 9.5 C97 11.4 92.5 12.9 86 13.4 C78 14.5 68 15.2 58 15.2 ' +
  'C46 15.1 34 14.2 25 12.9 C21 12.5 18 12.2 16 12 Z';

// mouth line — from the blunt snout tip back and down to the jaw corner
const MOUTH = 'M99.6 9.5 C97 10.5 93 11.7 87 12.4';

export const art: Illustration = {
  id: 'blue-whale',
  aspect: 100 / 20,
  View: ({ uid, px }) => {
    const tiny = px < 24;
    return (
      <svg
        viewBox="0 0 100 20"
        width="100%"
        height="100%"
        aria-hidden="true"
        style={{ overflow: 'visible', display: 'block' }}
      >
        <defs>
          <clipPath id={`${uid}-clip`}>
            <path d={BODY} />
          </clipPath>
        </defs>

        {/* near fluke lobe — the dominant broad paddle, thick at the tail-stock root, sweeping back
            to its tip at x = 0 with an S-curved trailing edge rising to a shallow notch at (2.5, 10.6) */}
        <path
          d="M17 10.2 C11 10.2 6 10.3 2.5 10.7 C3 12 0.3 12.9 0 14.6 C0.6 15.6 2 16.3 3.5 16.3 C8 16.1 13 14 17 12.1 Z"
          fill={tiny ? BASE : DARK}
        />
        {/* far fluke lobe — a thin lit sliver riding above the near lobe, its tip just short of x = 0 */}
        <path
          d="M17 10.1 C11 9.8 6 10 2.5 10.7 C2.1 10.3 1.7 9.9 1.5 9.5 C5 8.6 10 8.5 17 9.2 Z"
          fill={tiny ? BASE : LIGHT}
        />

        {/* dorsal fin — a small nub hooked back, set far back on the body; its tip touches y = 0 */}
        <path d="M35 3.2 C33.4 2.5 32 1.4 31 0 C30.4 1.3 29 2.7 26.5 4.3 Z" fill={tiny ? BASE : DARK} />

        {/* body — flat BASE back */}
        <path d={BODY} fill={BASE} />

        {!tiny && (
          <>
            {/* slightly darker flank band just above the belly line */}
            <path
              d="M87 12.4 C78 12.7 66 12.8 56 12.7 C44 12.6 32 12.3 24 11.9 C20 11.7 17.5 11.6 16 11.6 L16 10.4 C20 10.3 26 10.4 34 10.7 C46 11.1 60 11.2 72 11.1 C78 11.1 84 11.4 87 12.4 Z"
              fill={FLANK}
            />
            {/* pale underside: lower jaw, throat and belly back to the tail stock */}
            <path
              d="M99.6 9.5 C97 10.5 93 11.7 87 12.4 C78 12.7 66 12.8 56 12.7 C44 12.6 32 12.3 24 11.9 C20 11.7 17.5 11.6 16 11.6 L16 12 C18 12.2 21 12.5 25 12.9 C34 14.2 46 15.1 58 15.2 C68 15.2 78 14.5 86 13.4 C92.5 12.9 97 11.4 99.6 9.5 Z"
              fill={BELLY}
            />
          </>
        )}

        {/* irregular light mottling — varied sizes, clustered over the back and shoulder */}
        {px > 60 && (
          <g clipPath={`url(#${uid}-clip)`} fill={MOTTLE} opacity="0.3">
            <ellipse cx="40" cy="4.6" rx="1" ry="0.4" />
            <ellipse cx="45.5" cy="6.9" rx="2.1" ry="0.7" transform="rotate(-6 45.5 6.9)" />
            <ellipse cx="50" cy="3.4" rx="1.4" ry="0.5" />
            <ellipse cx="53" cy="5.6" rx="0.7" ry="0.3" />
            <ellipse cx="56" cy="8.8" rx="1.1" ry="0.45" />
            <ellipse cx="59" cy="4.6" rx="2.6" ry="0.8" transform="rotate(4 59 4.6)" />
            <ellipse cx="63.5" cy="2.6" rx="0.8" ry="0.35" />
            <ellipse cx="66" cy="7.2" rx="1.6" ry="0.55" transform="rotate(-8 66 7.2)" />
            <ellipse cx="69.5" cy="5.2" rx="0.6" ry="0.3" />
            <ellipse cx="72" cy="3.6" rx="1.9" ry="0.65" />
            <ellipse cx="75.5" cy="9.3" rx="0.9" ry="0.35" />
            <ellipse cx="78.5" cy="6" rx="1.3" ry="0.45" transform="rotate(6 78.5 6)" />
            <ellipse cx="82" cy="4.1" rx="0.7" ry="0.3" />
            <ellipse cx="33" cy="7.6" rx="0.9" ry="0.35" />
            <ellipse cx="26" cy="9.8" rx="0.7" ry="0.3" />
          </g>
        )}

        {/* mouth line */}
        {!tiny && <path d={MOUTH} fill="none" stroke={DEEP} strokeWidth="0.7" strokeLinecap="round" />}

        {/* throat grooves — pleats along the ventral pouch */}
        {px > 120 && (
          <g clipPath={`url(#${uid}-clip)`} fill="none" stroke={BELLY_SHADE} strokeWidth="0.45" strokeLinecap="round" opacity="0.9">
            <path d="M68 14.9 C77 14.6 85 13.7 92 12.3" />
            <path d="M73 14.3 C80 14.1 87 13.2 94 11.7" />
            <path d="M79 13.6 C84 13.4 89 12.6 95.5 11.1" />
          </g>
        )}

        {/* eye — tiny, just above and behind the jaw corner */}
        {!tiny && <circle cx="86.6" cy="11.4" r="0.65" fill={BELLY} opacity="0.7" />}
        {!tiny && <circle cx="86.6" cy="11.4" r="0.42" fill={DEEP} />}

        {/* blowhole on top of the head */}
        {px > 120 && <ellipse cx="84" cy="2.5" rx="1" ry="0.35" fill={DEEP} opacity="0.7" />}

        {/* pectoral flipper — a slender paddle rooted at the jaw corner, trailing back and gently down
            beneath the belly; its tip touches y = 20 */}
        <path
          d="M87.5 12.8 C80 14.4 72 16.8 64 20 C69 19.3 75 18.3 80 17.2 C83.5 16.3 86.3 15.3 87.2 14.6 C88.1 14 88.1 13.2 87.5 12.8 Z"
          fill={tiny ? BELLY : FLIPPER}
          stroke={tiny ? 'none' : FLIPPER_EDGE}
          strokeWidth="0.3"
          strokeLinejoin="round"
        />
      </svg>
    );
  },
};
