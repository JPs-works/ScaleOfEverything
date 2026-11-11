import type { Illustration } from '../types';

// Human — measured axis: height (vertical). An average adult standing relaxed, facing the viewer.
// Top of the hair touches y = 0, the soles rest on y = 100. The head is ~13.5 units (1/7.5 of height),
// shoulders ~18 wide, arms hanging at the sides; hands and turned-out shoes set the width.
// aspect = width / height of the bounding box: 32 / 100.
const SKIN = '#F1C9A5';
const SKIN_SHADE = '#D9A982';
const HAIR = '#4A3728';
const HAIR_LIGHT = '#6B5140';
const TOP = '#3B82F6';
const TOP_LIGHT = '#7AB0FF';
const TOP_SHADE = '#2563EB';
const TOP_DARK = '#1D4ED8';
const TROUSER = '#475569';
const TROUSER_LIGHT = '#6B7A92';
const TROUSER_DARK = '#2E3A4F';
const SHOE = '#7A5230';
const SOLE = '#A97A52';
const INK = '#2B2A30';

export const art: Illustration = {
  id: 'human',
  aspect: 0.32,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 32 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* light falls from the upper-left */}
        <radialGradient id={`${uid}-face`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#FAD9BA" />
          <stop offset="60%" stopColor={SKIN} />
          <stop offset="100%" stopColor={SKIN_SHADE} />
        </radialGradient>
        <linearGradient id={`${uid}-top`} x1="0" x2="1" y1="0" y2="0.3">
          <stop offset="0%" stopColor={TOP_LIGHT} />
          <stop offset="45%" stopColor={TOP} />
          <stop offset="100%" stopColor={TOP_SHADE} />
        </linearGradient>
        <linearGradient id={`${uid}-trouser`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={TROUSER_LIGHT} />
          <stop offset="50%" stopColor={TROUSER} />
          <stop offset="100%" stopColor={TROUSER_DARK} />
        </linearGradient>
        <linearGradient id={`${uid}-hair`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={HAIR_LIGHT} />
          <stop offset="100%" stopColor={HAIR} />
        </linearGradient>
      </defs>

      {/* ---- arms (long sleeves), behind the torso ---- */}
      <path d="M5 20 C3 26 2.2 34 2.2 42 C1.8 47 1.6 52 1.8 56.5 L5.8 56.5 C6 52 6.2 47 6.6 42.5 C7 36 7.6 28 9 21.5 Z" fill={TOP} />
      <path d="M27 20 C29 26 29.8 34 29.8 42 C30.2 47 30.4 52 30.2 56.5 L26.2 56.5 C26 52 25.8 47 25.4 42.5 C25 36 24.4 28 23 21.5 Z" fill={TOP_SHADE} />
      {/* hands */}
      <ellipse cx="3.8" cy="59.2" rx="2.1" ry="3.2" fill={SKIN} />
      <ellipse cx="28.2" cy="59.2" rx="2.1" ry="3.2" fill={SKIN_SHADE} />
      {px > 120 && (
        <g fill={TOP_DARK} opacity="0.8">
          {/* cuffs */}
          <rect x="1.7" y="55.3" width="4.2" height="1.6" rx="0.5" />
          <rect x="26.1" y="55.3" width="4.2" height="1.6" rx="0.5" />
        </g>
      )}

      {/* ---- trousers: one shape, both legs, a slight gap below the knee ---- */}
      <path
        d="M6.6 49 L25.4 49 C25.8 60 25 68 24.6 76 C24.2 84 23.8 90 23.6 95 L17.6 95 C17.6 88 17.4 80 17.2 72 C17 64 16.6 58 16 54.5 C15.4 58 15 64 14.8 72 C14.6 80 14.4 88 14.4 95 L8.4 95 C8.2 90 7.8 84 7.4 76 C7 68 6.2 60 6.6 49 Z"
        fill={`url(#${uid}-trouser)`}
      />
      {px > 120 && (
        <g fill="none" stroke={TROUSER_DARK} strokeWidth="0.7" strokeLinecap="round" opacity="0.5">
          {/* knee creases */}
          <path d="M9.4 75.5 Q11.4 77 13.6 75.5" />
          <path d="M18.4 75.5 Q20.6 77 22.6 75.5" />
        </g>
      )}

      {/* ---- shoes: toes turned slightly outward, soles on y = 100 ---- */}
      <path d="M8 95 L14.6 95 L14.8 98 C15 99.5 14 100 12.5 100 L5.6 100 C4.6 100 4.4 98.8 5.4 98 C6.4 97.2 7.4 96.4 8 95 Z" fill={SHOE} />
      <path d="M24 95 L17.4 95 L17.2 98 C17 99.5 18 100 19.5 100 L26.4 100 C27.4 100 27.6 98.8 26.6 98 C25.6 97.2 24.6 96.4 24 95 Z" fill={SHOE} />
      {px > 60 && (
        <g fill={SOLE} opacity="0.85">
          {/* sole edges */}
          <rect x="5" y="99" width="9.8" height="0.6" rx="0.3" />
          <rect x="17.2" y="99" width="9.8" height="0.6" rx="0.3" />
        </g>
      )}

      {/* ---- torso (blue top) ---- */}
      <path
        d="M6.8 20.8 C9 18.4 12.5 17.6 16 17.6 C19.5 17.6 23 18.4 25.2 20.8 L25.6 32 C24.8 38 24.9 44 25.4 49.5 L6.6 49.5 C7.1 44 7.2 38 6.4 32 Z"
        fill={`url(#${uid}-top)`}
      />
      {px > 60 && (
        <>
          {/* belt */}
          <rect x="6.5" y="49.1" width="19" height="1.7" rx="0.4" fill={TROUSER_DARK} />
          <rect x="15.2" y="48.9" width="1.6" height="2.1" rx="0.3" fill="#9CA3AF" />
        </>
      )}
      {px > 120 && (
        <g fill="none" stroke={TOP_DARK} strokeWidth="0.7" strokeLinecap="round" opacity="0.45">
          {/* sleeve seams and a soft fold at the waist */}
          <path d="M7.2 21.6 Q7.6 28 7 36" />
          <path d="M24.8 21.6 Q24.4 28 25 36" />
          <path d="M9 45.5 Q13 47.6 17 45.8" />
        </g>
      )}

      {/* ---- neck and head ---- */}
      {/* back of the hair: touches y = 0 */}
      <ellipse cx="16" cy="6.5" rx="5.9" ry="6.5" fill={`url(#${uid}-hair)`} />
      <rect x="14.3" y="11" width="3.4" height="8.6" rx="1.5" fill={SKIN_SHADE} />
      {px > 24 && (
        <path d="M12.8 18.4 Q16 21.8 19.2 18.4" fill="none" stroke={TOP_DARK} strokeWidth="1.2" strokeLinecap="round" />
      )}
      {/* ears */}
      {px > 24 && (
        <>
          <ellipse cx="10.9" cy="8.2" rx="1" ry="1.5" fill={SKIN_SHADE} />
          <ellipse cx="21.1" cy="8.2" rx="1" ry="1.5" fill={SKIN_SHADE} />
        </>
      )}
      {/* face */}
      <ellipse cx="16" cy="7.4" rx="5.3" ry="6.2" fill={`url(#${uid}-face)`} />
      {/* fringe */}
      <path d="M10.6 9 C10.4 3 13 1 16 1 C19 1 21.6 3 21.4 9 C20.6 6 19 5 16.6 5.2 C14.2 5.4 12.4 6.2 10.6 9 Z" fill={`url(#${uid}-hair)`} />
      {px > 120 && <path d="M12.2 3.6 Q14.4 1.8 17 1.9" fill="none" stroke="#8A6B55" strokeWidth="0.7" strokeLinecap="round" opacity="0.6" />}

      {px > 24 && (
        <g>
          {/* eyes */}
          <ellipse cx="14" cy="7.8" rx="0.6" ry="0.75" fill={INK} />
          <ellipse cx="18" cy="7.8" rx="0.6" ry="0.75" fill={INK} />
          {/* smile */}
          <path d="M14.8 10.7 Q16 11.8 17.2 10.7" fill="none" stroke="#B9806A" strokeWidth="0.6" strokeLinecap="round" />
        </g>
      )}
      {px > 120 && (
        <g>
          {/* brows, nose, cheeks */}
          <g fill="none" stroke={HAIR} strokeWidth="0.55" strokeLinecap="round" opacity="0.8">
            <path d="M13.1 6.3 Q14 5.8 14.9 6.2" />
            <path d="M17.1 6.2 Q18 5.8 18.9 6.3" />
          </g>
          <path d="M16.2 8 L16.6 9.5 L15.7 9.7" fill="none" stroke={SKIN_SHADE} strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="13.2" cy="9.6" r="0.9" fill="#F0A0A0" opacity="0.35" />
          <circle cx="18.8" cy="9.6" r="0.9" fill="#F0A0A0" opacity="0.35" />
        </g>
      )}
    </svg>
  ),
};
