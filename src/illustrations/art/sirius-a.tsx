import type { Illustration } from '../types';

// Sirius A — measured axis: diameter (horizontal). The blue-white disc spans exactly x = 0..100.
// Flat museum-poster star: an even bright disc with a soft off-centre brightening, a readable
// corona and four diffraction spikes (plus four shorter diagonals when large). The glow and spikes
// reach at most 12 units beyond the disc and fade to transparent at their tips.
const BASE = '#DBEAFE';
const LIGHT = '#F5F9FF';
const SHADE = '#BFDBFE';
const DEEP = '#93C5FD';

export const art: Illustration = {
  id: 'sirius-a',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* photosphere: nearly flat, a gentle brightening toward the upper-left */}
        <radialGradient id={`${uid}-disc`} cx="40%" cy="36%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor={LIGHT} />
          <stop offset="85%" stopColor={BASE} />
          <stop offset="100%" stopColor={SHADE} />
        </radialGradient>
        {/* a whisper of limb darkening — same hue, low opacity, so the disc stays flat */}
        <radialGradient id={`${uid}-limb`} cx="42%" cy="38%" r="78%">
          <stop offset="70%" stopColor={DEEP} stopOpacity="0" />
          <stop offset="100%" stopColor={DEEP} stopOpacity="0.28" />
        </radialGradient>
        {/* corona: strong at the disc edge, wide fade to r = 62 */}
        <radialGradient id={`${uid}-corona`} cx="50%" cy="50%" r="50%">
          <stop offset="78%" stopColor={BASE} stopOpacity="0.55" />
          <stop offset="87%" stopColor={BASE} stopOpacity="0.22" />
          <stop offset="100%" stopColor={BASE} stopOpacity="0" />
        </radialGradient>
        {/* spike: solid white where it leaves the disc, fading only near the tip
            (bbox gradient: y2=0 is the tip; the disc rim sits ~22% of the way down) */}
        <linearGradient id={`${uid}-spike`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor={LIGHT} stopOpacity="0" />
        </linearGradient>
        {/* the upward spike, reused by rotation; tip 14 units beyond the disc */}
        <path id={`${uid}-ray`} d="M50 -14 C52.2 -4 53.2 20 55.5 50 L44.5 50 C46.8 20 47.8 -4 50 -14 Z" />
        <path id={`${uid}-ray-s`} d="M50 -8 C51.4 0 52 22 53.5 50 L46.5 50 C48 22 48.6 0 50 -8 Z" />
      </defs>

      {/* corona glow */}
      {px > 24 && <circle cx="50" cy="50" r="62" fill={`url(#${uid}-corona)`} />}

      {/* diffraction spikes: four main, four shorter diagonals when large */}
      {px > 24 && (
        <g fill={`url(#${uid}-spike)`}>
          <use href={`#${uid}-ray`} />
          <use href={`#${uid}-ray`} transform="rotate(90 50 50)" />
          <use href={`#${uid}-ray`} transform="rotate(180 50 50)" />
          <use href={`#${uid}-ray`} transform="rotate(270 50 50)" />
          {px > 120 && (
            <g opacity="0.7">
              <use href={`#${uid}-ray-s`} transform="rotate(45 50 50)" />
              <use href={`#${uid}-ray-s`} transform="rotate(135 50 50)" />
              <use href={`#${uid}-ray-s`} transform="rotate(225 50 50)" />
              <use href={`#${uid}-ray-s`} transform="rotate(315 50 50)" />
            </g>
          )}
        </g>
      )}

      {/* the star disc — exactly x = 0..100 */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-disc)`} />
      {px > 40 && <circle cx="50" cy="50" r="50" fill={`url(#${uid}-limb)`} />}

      {/* crisp bright rim so the disc reads against its own glow */}
      {px > 24 && <circle cx="50" cy="50" r="49.4" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.7" />}
    </svg>
  ),
};
