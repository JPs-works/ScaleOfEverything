import type { Illustration } from '../types';

// Earth — measured axis: diameter (horizontal). The disc spans the full viewBox.
export const art: Illustration = {
  id: 'earth',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-ocean`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#5fb4ff" />
          <stop offset="55%" stopColor="#1f6fd1" />
          <stop offset="100%" stopColor="#0b2f6b" />
        </radialGradient>
        <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="80%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
        <radialGradient id={`${uid}-atmo`} cx="50%" cy="50%" r="50%">
          <stop offset="88%" stopColor="#7cc4ff" stopOpacity="0" />
          <stop offset="100%" stopColor="#7cc4ff" stopOpacity="0.45" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-ocean)`} />
      {px > 12 && (
        <g clipPath={`url(#${uid}-clip)`} fill="#3fae5a">
          {/* Americas */}
          <path d="M22 18c6-4 14-3 17 2 2 4-2 7-1 12 1 4 6 5 7 10 1 6-4 9-6 15-2 5-1 11-5 13-4 1-6-4-7-9-1-6 1-12-2-17-3-4-8-5-9-11-1-6 3-12 6-15z" />
          {/* Europe & Africa */}
          <path d="M55 20c5-3 12-2 16 2 3 3 1 7 3 10 2 2 6 1 8 4 1 4-3 7-3 12 0 6 1 12-3 17-3 4-9 4-12 0-3-5-1-11-3-16-2-4-7-5-8-10-1-6 1-14 2-19z" />
          {/* Asia / Australia hint */}
          <path d="M78 40c4-1 9 0 11 3 2 4 0 8-3 10-3 1-7-1-8-5-1-3-1-6 0-8z" />
          <path d="M70 70c3-2 8-1 9 2 1 3-1 6-4 6-3 1-6-1-6-4 0-2 0-3 1-4z" />
        </g>
      )}
      {px > 12 && (
        <g clipPath={`url(#${uid}-clip)`} fill="#f4f9ff" opacity="0.9">
          <ellipse cx="50" cy="3" rx="22" ry="7" />
          <ellipse cx="46" cy="98" rx="20" ry="6" />
        </g>
      )}
      {px > 40 && (
        <g clipPath={`url(#${uid}-clip)`} fill="#ffffff" opacity="0.55">
          <path d="M14 48c6-3 14-2 20 1 4 2 3 5-1 6-7 1-14 0-19-3-2-1-2-3 0-4z" />
          <path d="M52 60c5-2 12-1 16 2 3 2 1 4-2 5-6 1-12 0-15-3-1-1-1-3 1-4z" />
          <path d="M30 78c4-2 10-1 13 1 2 2 0 4-3 4-5 1-9 0-11-2-1-1 0-2 1-3z" />
        </g>
      )}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-shade)`} />
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-atmo)`} />
    </svg>
  ),
};
