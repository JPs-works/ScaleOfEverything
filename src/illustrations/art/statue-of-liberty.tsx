import type { Illustration } from '../types';

// Statue of Liberty — measured axis: height (vertical), ground to torch tip.
// Torch flame touches y = 0, the fort terrace touches y = 100; aspect = 36 / 100.
// Statue occupies the upper half (y 0–50), the pedestal and terrace the lower half.

const HEAD_X = 15;
const HEAD_Y = 23;

// Seven crown rays fanning from the head centre, built as one path.
const crownRays = (() => {
  const angles = [-165, -140, -115, -90, -65, -40, -15];
  const inner = 4;
  const outer = 8.6;
  const half = 1.1; // half-width of each ray at its base
  return angles
    .map((deg) => {
      const a = (deg * Math.PI) / 180;
      const tx = HEAD_X + outer * Math.cos(a);
      const ty = HEAD_Y + outer * Math.sin(a);
      const bx = HEAD_X + inner * Math.cos(a);
      const by = HEAD_Y + inner * Math.sin(a);
      const px = -Math.sin(a) * half;
      const py = Math.cos(a) * half;
      return `M${(bx + px).toFixed(2)} ${(by + py).toFixed(2)} L${tx.toFixed(2)} ${ty.toFixed(2)} L${(bx - px).toFixed(2)} ${(by - py).toFixed(2)} Z`;
    })
    .join(' ');
})();

export const art: Illustration = {
  id: 'statue-of-liberty',
  aspect: 0.36,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 36 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${uid}-robe`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="55%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#0E9F6E" />
        </linearGradient>
        <linearGradient id={`${uid}-stone`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#B4BCCB" />
          <stop offset="60%" stopColor="#8B94A6" />
          <stop offset="100%" stopColor="#616A7D" />
        </linearGradient>
        <radialGradient id={`${uid}-flame`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFF4C2" />
          <stop offset="50%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---- terrace & pedestal (granite) ---- */}
      {/* star-fort terrace: touches x = 0, x = 36 and y = 100 */}
      <path d="M0 100 L36 100 L36 94 L33 94 L31 87.5 L5 87.5 L3 94 L0 94 Z" fill={`url(#${uid}-stone)`} />
      <rect x="0" y="94" width="36" height="1" fill="#C9D0DC" opacity="0.6" />
      {/* lower flared pedestal */}
      <path d="M4 80 L30 80 L33 87.5 L1 87.5 Z" fill="#7B8496" />
      <rect x="3" y="80" width="28" height="1" fill="#C9D0DC" opacity="0.55" />
      {/* tapered shaft */}
      <path d="M5.5 53.5 L28.5 53.5 L30 80 L4 80 Z" fill={`url(#${uid}-stone)`} />
      {px > 60 && (
        <g>
          {/* cornice */}
          <rect x="5" y="57" width="24" height="1.2" fill="#5A6375" opacity="0.7" />
          <rect x="4.6" y="76.5" width="24.8" height="1.2" fill="#5A6375" opacity="0.7" />
          {/* pilaster shadows */}
          {[8.6, 13.8, 19, 24.2].map((x, i) => (
            <rect key={i} x={x + i * 0.12} y="59.5" width="1.3" height="16" rx="0.3" fill="#4F5868" opacity="0.65" />
          ))}
        </g>
      )}
      {/* plinth under the statue */}
      <path d="M2.5 50 L31.5 50 L30.5 53.5 L3.5 53.5 Z" fill="#9AA3B4" />
      <rect x="2.5" y="50" width="29" height="0.9" fill="#D3D9E3" opacity="0.7" />

      {/* ---- statue (copper patina) ---- */}
      {/* tablet in the left hand */}
      <g transform="rotate(-8 5.5 41.5)">
        <rect x="2.2" y="35.5" width="6.8" height="11.5" rx="0.5" fill="#047857" />
        <rect x="2.2" y="35.5" width="1" height="11.5" fill="#34D399" opacity="0.7" />
      </g>
      {/* left arm holding tablet */}
      <path d="M8.2 31 L11 32.2 L9.2 42 L5.6 41.2 Z" fill="#10B981" />
      {/* robe */}
      <path d="M8.5 31 C11 28.4 19 28.4 21.5 31 L24.2 39 L27 50 L4 50 L6.8 39 Z" fill={`url(#${uid}-robe)`} />
      {px > 120 && (
        <g fill="none" stroke="#047857" strokeWidth="0.8" strokeLinecap="round" opacity="0.55">
          <path d="M11.5 36 Q10.6 43 10 49.5" />
          <path d="M15 33.5 Q15.2 42 15.6 49.5" />
          <path d="M19 35 Q20.2 43 21.5 49.5" />
          <path d="M9.4 31.5 Q13 35 20.8 32" />
        </g>
      )}
      {/* neck & head */}
      <rect x="13.6" y="26" width="2.8" height="4" fill="#10B981" />
      {/* crown rays */}
      <path d={crownRays} fill="#6EE7B7" />
      <circle cx={HEAD_X} cy={HEAD_Y} r="4.3" fill="#34D399" />
      {px > 60 && (
        <g>
          {/* crown band */}
          <path d="M10.8 21.5 Q15 18.6 19.2 21.5 L19.2 23.2 Q15 20.4 10.8 23.2 Z" fill="#A7F3D0" />
          {/* face shade on the lower-right */}
          <path d="M15 27.3 A4.3 4.3 0 0 0 19.3 23 Q17.6 25.6 15 27.3 Z" fill="#0E9F6E" opacity="0.5" />
        </g>
      )}
      {/* raised right arm */}
      <path d="M19.4 30.4 L22.6 31.8 L29.1 17.6 L26 16.2 Z" fill="#34D399" />
      <path d="M19.4 30.4 L22.6 31.8 L29.1 17.6 L27.5 16.9 Z" fill="#0E9F6E" opacity="0.45" />
      <circle cx="27.5" cy="16.3" r="1.9" fill="#6EE7B7" />
      {/* torch handle & cup */}
      <rect x="26.7" y="9.6" width="1.6" height="6.5" fill="#10B981" />
      <path d="M24.4 6.8 L30.6 6.8 L29.3 10 L25.7 10 Z" fill="#34D399" />
      <rect x="24.4" y="6.8" width="6.2" height="0.8" fill="#A7F3D0" />
      {/* flame: touches y = 0 */}
      <circle cx="27.5" cy="3.4" r="4.6" fill={`url(#${uid}-glow)`} />
      <path d="M27.5 0 C30.3 2.6 31 4.7 29.9 6.8 L25.1 6.8 C24 4.7 24.7 2.6 27.5 0 Z" fill={`url(#${uid}-flame)`} />
      {px > 60 && <path d="M27.5 2.4 C28.6 3.6 28.8 4.8 28.2 6 L26.8 6 C26.2 4.8 26.4 3.6 27.5 2.4 Z" fill="#FFF7D6" opacity="0.8" />}
    </svg>
  ),
};
