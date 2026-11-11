import type { Illustration } from '../types';

// Cat's Eye Nebula — measured axis: diameter (horizontal). The outer shell spans x = 0..100.
// aspect = width / height of the bounding box: 100 / 70.
export const art: Illustration = {
  id: 'cat-eye-nebula',
  aspect: 100 / 70,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 70" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* faint halo spilling just beyond the shell */}
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#22D3EE" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
        {/* outer shell: darker interior, bright rim, lit from the upper-left */}
        <radialGradient id={`${uid}-shell`} cx="42%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#0c5a6e" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#0e7490" stopOpacity="0.9" />
          <stop offset="85%" stopColor="#22D3EE" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.85" />
        </radialGradient>
        {/* crossing lobes */}
        <radialGradient id={`${uid}-lobe`} cx="40%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#22D3EE" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.75" />
        </radialGradient>
        {/* core glow */}
        <radialGradient id={`${uid}-core`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#cffafe" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#a5f3fc" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* halo (allowed spill, opacity <= 0.35) */}
      <ellipse cx="50" cy="35" rx="56" ry="40" fill={`url(#${uid}-halo)`} />

      {/* outer shell — touches x = 0 and x = 100 */}
      <ellipse cx="50" cy="35" rx="50" ry="35" fill={`url(#${uid}-shell)`} />

      {px > 24 && (
        <g>
          {/* two crossing elliptical lobes form the "eye" */}
          <ellipse cx="50" cy="35" rx="43" ry="17" fill={`url(#${uid}-lobe)`} transform="rotate(-24 50 35)" />
          <ellipse cx="50" cy="35" rx="43" ry="17" fill={`url(#${uid}-lobe)`} transform="rotate(24 50 35)" />
          <ellipse cx="50" cy="35" rx="43" ry="17" fill="none" stroke="#a5f3fc" strokeWidth="0.9" strokeOpacity="0.8" transform="rotate(-24 50 35)" />
          <ellipse cx="50" cy="35" rx="43" ry="17" fill="none" stroke="#a5f3fc" strokeWidth="0.9" strokeOpacity="0.8" transform="rotate(24 50 35)" />
          {/* inner nested shells */}
          <ellipse cx="50" cy="35" rx="28" ry="12" fill="#22D3EE" fillOpacity="0.3" stroke="#cffafe" strokeWidth="0.7" strokeOpacity="0.7" transform="rotate(-10 50 35)" />
          <ellipse cx="50" cy="35" rx="28" ry="12" fill="#22D3EE" fillOpacity="0.3" stroke="#cffafe" strokeWidth="0.7" strokeOpacity="0.7" transform="rotate(10 50 35)" />
        </g>
      )}

      {px > 120 && (
        <g>
          {/* fine filaments and knots inside the lobes */}
          <path d="M18 24 Q35 18 50 23 Q65 28 82 22" fill="none" stroke="#cffafe" strokeWidth="0.6" strokeOpacity="0.45" />
          <path d="M18 46 Q35 52 50 47 Q65 42 82 48" fill="none" stroke="#cffafe" strokeWidth="0.6" strokeOpacity="0.45" />
          <ellipse cx="50" cy="35" rx="16" ry="7" fill="none" stroke="#e0fdff" strokeWidth="0.5" strokeOpacity="0.6" />
          <circle cx="30" cy="30" r="1.1" fill="#e0fdff" fillOpacity="0.7" />
          <circle cx="71" cy="41" r="1.1" fill="#e0fdff" fillOpacity="0.7" />
          <circle cx="42" cy="47" r="0.8" fill="#e0fdff" fillOpacity="0.6" />
          <circle cx="60" cy="24" r="0.8" fill="#e0fdff" fillOpacity="0.6" />
          {/* background stars */}
          <circle cx="9" cy="12" r="0.7" fill="#ffffff" fillOpacity="0.8" />
          <circle cx="90" cy="58" r="0.7" fill="#ffffff" fillOpacity="0.8" />
          <circle cx="86" cy="10" r="0.5" fill="#ffffff" fillOpacity="0.7" />
          <circle cx="14" cy="60" r="0.5" fill="#ffffff" fillOpacity="0.7" />
        </g>
      )}

      {/* core glow and central white dwarf */}
      <circle cx="50" cy="35" r={px > 24 ? 11 : 16} fill={`url(#${uid}-core)`} />
      <circle cx="50" cy="35" r={px > 24 ? 1.6 : 3} fill="#ffffff" />
      {px > 60 && (
        <g stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.8" strokeLinecap="round">
          <line x1="50" y1="30.5" x2="50" y2="39.5" />
          <line x1="45.5" y1="35" x2="54.5" y2="35" />
        </g>
      )}
    </svg>
  ),
};
