import type { Illustration } from '../types';

// Earth → Moon distance — measured axis: distance (horizontal), centre to centre.
// Drawn as a measured span: a small Earth touching x = 0 and a tiny Moon touching x = 100, joined by a
// thin dimension line that stops short of each body so both read as planets, not ruler caps.
// True scale (Earth 1/30 of the span, Moon 1/110) is only used once the artwork is wide enough to show
// it; below that both bodies are enlarged to a minimum legible size. The box height (8) is set by the
// enlarged Earth. aspect = width / height of the bounding box: 100 / 8.
// Palette built from #CBD5E1: highlight #eef2f7, base #CBD5E1, shade #7f8ca3.
const MID_Y = 4;
const TRUE_EARTH_R = 1.65;
const TRUE_MOON_R = 0.45;

export const art: Illustration = {
  id: 'earth-moon-distance',
  aspect: 12.5,
  View: ({ uid, px }) => {
    // minimum on-screen sizes so the two anchors of the span are recognisable at every width
    const earthR = px > 600 ? TRUE_EARTH_R : px > 300 ? 2.2 : 3.0;
    const moonR = px > 900 ? TRUE_MOON_R : px > 300 ? 1.0 : 1.4;
    const ex = earthR; // Earth's left limb touches x = 0
    const mx = 100 - moonR; // Moon's right limb touches x = 100
    const gap = 0.8; // breathing room between the line and each body
    const lineX1 = ex + earthR + gap;
    const lineX2 = mx - moonR - gap;

    return (
      <svg viewBox="0 0 100 8" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${uid}-ocean`} cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#6fbcff" />
            <stop offset="55%" stopColor="#2270d0" />
            <stop offset="100%" stopColor="#0c2f68" />
          </radialGradient>
          <radialGradient id={`${uid}-rock`} cx="36%" cy="30%" r="78%">
            <stop offset="0%" stopColor="#eef2f7" />
            <stop offset="55%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#7f8ca3" />
          </radialGradient>
          <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#7cc4ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7cc4ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="80%">
            <stop offset="55%" stopColor="#061a3d" stopOpacity="0" />
            <stop offset="100%" stopColor="#061a3d" stopOpacity="0.6" />
          </radialGradient>
          {/* unit-space clip for the land masses (Earth is drawn in 0..100 space and scaled) */}
          <clipPath id={`${uid}-eclip`}>
            <circle cx="50" cy="50" r="50" />
          </clipPath>
          {/* keeps the atmospheric glow inside the bounding box */}
          <clipPath id={`${uid}-box`}>
            <rect x="0" y="0" width="100" height="8" />
          </clipPath>
        </defs>

        {px <= 24 ? (
          /* tiny: one solid pale bar with a blue Earth bead at the left and a pale Moon bead at the right */
          <g>
            <rect x="2" y="2.4" width="96" height="3.2" rx="1.6" fill="#CBD5E1" opacity="0.85" />
            <circle cx="3.2" cy={MID_Y} r="3.2" fill="#2f7fe0" />
            <circle cx="97.8" cy={MID_Y} r="2.2" fill="#eef2f7" />
          </g>
        ) : (
          <g>
            {/* dimension line, stopping short of both bodies */}
            <line x1={lineX1} y1={MID_Y} x2={lineX2} y2={MID_Y} stroke="#CBD5E1" strokeWidth="0.5" opacity="0.7" />
            {/* light end caps on the line itself */}
            {px > 120 && (
              <g stroke="#CBD5E1" strokeWidth="0.5" strokeLinecap="round" opacity="0.5">
                <line x1={lineX1} y1={MID_Y - 1.2} x2={lineX1} y2={MID_Y + 1.2} />
                <line x1={lineX2} y1={MID_Y - 1.2} x2={lineX2} y2={MID_Y + 1.2} />
              </g>
            )}
            {/* faint distance ticks: each marks ~1/10 of the way to the Moon (large sizes only) */}
            {px > 300 && (
              <g stroke="#CBD5E1" strokeWidth="0.3" opacity="0.3">
                {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => (
                  <line key={x} x1={x} y1={MID_Y - 0.6} x2={x} y2={MID_Y + 0.6} />
                ))}
              </g>
            )}

            {/* soft atmospheric glow around Earth, clipped to the box */}
            <g clipPath={`url(#${uid}-box)`}>
              <circle cx={ex} cy={MID_Y} r={earthR * 1.35} fill={`url(#${uid}-glow)`} opacity="0.7" />
            </g>

            {/* Earth, drawn in 0..100 space and scaled to earthR */}
            <g transform={`translate(${ex} ${MID_Y}) scale(${earthR / 50}) translate(-50 -50)`}>
              <circle cx="50" cy="50" r="50" fill={`url(#${uid}-ocean)`} />
              {px > 80 && (
                <g clipPath={`url(#${uid}-eclip)`} fill="#3fae5a">
                  {/* Americas */}
                  <path d="M22 18c6-4 14-3 17 2 2 4-2 7-1 12 1 4 6 5 7 10 1 6-4 9-6 15-2 5-1 11-5 13-4 1-6-4-7-9-1-6 1-12-2-17-3-4-8-5-9-11-1-6 3-12 6-15z" />
                  {/* Europe & Africa */}
                  <path d="M55 20c5-3 12-2 16 2 3 3 1 7 3 10 2 2 6 1 8 4 1 4-3 7-3 12 0 6 1 12-3 17-3 4-9 4-12 0-3-5-1-11-3-16-2-4-7-5-8-10-1-6 1-14 2-19z" />
                  <path d="M78 40c4-1 9 0 11 3 2 4 0 8-3 10-3 1-7-1-8-5-1-3-1-6 0-8z" />
                </g>
              )}
              {px > 80 && (
                <g clipPath={`url(#${uid}-eclip)`} fill="#f4f9ff" opacity="0.9">
                  {/* polar caps */}
                  <ellipse cx="50" cy="3" rx="22" ry="7" />
                  <ellipse cx="46" cy="98" rx="20" ry="6" />
                </g>
              )}
              {px > 200 && (
                <g clipPath={`url(#${uid}-eclip)`} fill="#ffffff" opacity="0.55">
                  {/* a few cloud swirls */}
                  <path d="M14 48c6-3 14-2 20 1 4 2 3 5-1 6-7 1-14 0-19-3-2-1-2-3 0-4z" />
                  <path d="M52 60c5-2 12-1 16 2 3 2 1 4-2 5-6 1-12 0-15-3-1-1-1-3 1-4z" />
                </g>
              )}
              {/* darker limb at lower right */}
              <circle cx="50" cy="50" r="50" fill={`url(#${uid}-shade)`} />
              {/* highlight at ~35%,30% */}
              <circle cx="35" cy="30" r="9" fill="#dff0ff" opacity="0.6" />
            </g>

            {/* Moon, drawn in 0..100 space and scaled to moonR */}
            <g transform={`translate(${mx} ${MID_Y}) scale(${moonR / 50}) translate(-50 -50)`}>
              <circle cx="50" cy="50" r="50" fill={`url(#${uid}-rock)`} />
              {px > 120 && (
                <g fill="#7f8ca3" opacity="0.8">
                  {/* maria / craters */}
                  <circle cx="62" cy="60" r="11" />
                  <circle cx="38" cy="42" r="7" />
                  <circle cx="58" cy="28" r="5" />
                </g>
              )}
              <circle cx="50" cy="50" r="50" fill={`url(#${uid}-shade)`} opacity="0.7" />
              <circle cx="35" cy="30" r="8" fill="#f8fafc" opacity="0.7" />
            </g>
            {/* darker rim so the pale Moon separates from the pale line and the dark sky */}
            <circle cx={mx} cy={MID_Y} r={moonR} fill="none" stroke="#7f8ca3" strokeWidth="0.25" opacity="0.9" />
          </g>
        )}
      </svg>
    );
  },
};
