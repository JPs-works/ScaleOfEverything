import type { Illustration } from '../types';

// Boeing 747-8 — measured axis: length (horizontal). Side profile facing right: tail cone at x = 0,
// nose at x = 100. The vertical fin tops y = 0 and the outboard engine hangs to y = 26.
// aspect = width / height of the bounding box: 100 / 26.
export const art: Illustration = {
  id: 'boeing-747',
  aspect: 100 / 26,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 26" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${uid}-hull`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="45%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#9FADC2" />
        </linearGradient>
        <linearGradient id={`${uid}-fin`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#EEF2F7" />
          <stop offset="100%" stopColor="#B4C0D1" />
        </linearGradient>
        <linearGradient id={`${uid}-wing`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#D5DEE9" />
          <stop offset="100%" stopColor="#8E9CB3" />
        </linearGradient>
        <linearGradient id={`${uid}-nacelle`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#F1F5F9" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#7C8BA3" />
        </linearGradient>
      </defs>

      {/* vertical fin (behind fuselage) */}
      <path d="M24 9.8 L9.5 0 L1.8 0 L0.4 10.9 Z" fill={`url(#${uid}-fin)`} />
      {/* tail band accent */}
      {px > 40 && <path d="M8.4 0 L1.8 0 L1.3 4 L6 4 Z" fill="#5B8DEF" opacity="0.9" />}

      {/* fuselage */}
      <path
        d="M0 10.8 C6 10.2 14 9.6 24 9.5 L58 9.5 C62 9.5 65 7.6 70 7.4 L86 7.4 C90 7.4 94 8.2 97 10.5 C99 12 100 13.2 100 14.2 C100 15.5 98.5 17.2 95 17.8 C92 18.3 90 18.4 86 18.4 L42 18.4 C32 18.4 22 15.5 12 13 C7 11.8 3 11.2 0 10.8 Z"
        fill={`url(#${uid}-hull)`}
      />

      {/* wing-body fairing (belly) */}
      <ellipse cx="60" cy="18.3" rx="17" ry="1.5" fill="#8E9CB3" />

      {/* horizontal stabilizer (near side) */}
      <path d="M19 10.6 L4.5 11.6 L1 13.9 L4.4 13.7 Z" fill={`url(#${uid}-wing)`} />

      {/* main wing (near side, sweeping back and toward the viewer) */}
      <path d="M71 15.8 C56 18.6 40 21.2 24 23.3 L20.5 24.4 L23.6 23.9 C32 21.3 38 19.4 43 18 Z" fill={`url(#${uid}-wing)`} />

      {/* engine pylons */}
      {px > 40 && (
        <g fill="#B4C0D1">
          <path d="M54 18.6 L57.5 18.6 L57 20 L53.5 20 Z" />
          <path d="M38 21.2 L41.5 21.2 L41 22.5 L37.5 22.5 Z" />
        </g>
      )}

      {/* inboard engine */}
      <rect x="49" y="19.2" width="10.6" height="4.4" rx="2.2" fill={`url(#${uid}-nacelle)`} />
      <ellipse cx="59.4" cy="21.4" rx="1.1" ry="2.2" fill="#475569" />
      {/* outboard engine */}
      <rect x="33" y="21.6" width="10.6" height="4.4" rx="2.2" fill={`url(#${uid}-nacelle)`} />
      <ellipse cx="43.4" cy="23.8" rx="1.1" ry="2.2" fill="#475569" />

      {px > 40 && (
        <g>
          {/* engine fan hubs and exhausts */}
          <circle cx="59.5" cy="21.4" r="0.55" fill="#CBD5E1" />
          <circle cx="43.5" cy="23.8" r="0.55" fill="#CBD5E1" />
          <rect x="48.6" y="20" width="1.2" height="2.8" rx="0.4" fill="#64748B" />
          <rect x="32.6" y="22.4" width="1.2" height="2.8" rx="0.4" fill="#64748B" />
          {/* cockpit windows */}
          <path d="M90.5 8.3 L94.8 8.3 L96.2 9.7 L90.3 9.7 Z" fill="#334155" />
          {/* cheatline along the fuselage */}
          <path d="M8 12.4 C20 13.6 30 14 42 14 L95 14" stroke="#5B8DEF" strokeWidth="0.7" fill="none" opacity="0.85" />
        </g>
      )}

      {px > 120 && (
        <g>
          {/* upper-deck window row */}
          <path d="M68 9.1 L86 9.1" stroke="#475569" strokeWidth="0.7" strokeDasharray="0.6 0.7" fill="none" />
          {/* main-deck window row */}
          <path d="M14 11.6 L89 11.6" stroke="#475569" strokeWidth="0.7" strokeDasharray="0.6 0.7" fill="none" />
          {/* doors */}
          <g fill="none" stroke="#64748B" strokeWidth="0.35">
            <rect x="24" y="10.6" width="1.8" height="3.6" rx="0.4" />
            <rect x="46" y="10.6" width="1.8" height="3.6" rx="0.4" />
            <rect x="78" y="10.6" width="1.8" height="3.6" rx="0.4" />
          </g>
          {/* nose radome seam and hump highlight */}
          <path d="M96.2 10.2 C97.6 11.4 98.4 12.6 98.6 14.3 C98.4 15.6 97.6 16.6 96.6 17.3" stroke="#B4C0D1" strokeWidth="0.35" fill="none" />
          <path d="M66 8 C68 7.7 70 7.6 72 7.6 L84 7.6" stroke="#FFFFFF" strokeWidth="0.4" fill="none" opacity="0.7" />
          {/* fin rudder hinge */}
          <path d="M4.2 1.2 L1.6 9.8" stroke="#9FADC2" strokeWidth="0.3" fill="none" />
          {/* wing leading-edge highlight */}
          <path d="M70.5 16 C56 18.7 40 21.3 24.5 23.3" stroke="#F1F5F9" strokeWidth="0.35" fill="none" opacity="0.8" />
        </g>
      )}
    </svg>
  ),
};
