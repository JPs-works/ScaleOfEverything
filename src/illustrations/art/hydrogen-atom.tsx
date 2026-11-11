import type { Illustration } from '../types';

// Hydrogen atom — measured axis: diameter (horizontal). The electron orbit spans the full viewBox.
// A soft blue 1s electron cloud filling the disc, a thin Bohr orbit ring touching x = 0 and x = 100,
// a tiny pink proton at the centre (kin to the proton illustration) and one bright electron on the ring.
export const art: Illustration = {
  id: 'hydrogen-atom',
  aspect: 1,
  View: ({ uid, px }) => {
    const tiny = px < 24;
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          {/* electron cloud: dense near the nucleus, fading toward the orbit */}
          <radialGradient id={`${uid}-cloud`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#bfdbfe" stopOpacity={tiny ? 1 : 0.75} />
            <stop offset="35%" stopColor="#60A5FA" stopOpacity={tiny ? 0.95 : 0.45} />
            <stop offset="75%" stopColor="#3b82f6" stopOpacity={tiny ? 0.9 : 0.2} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={tiny ? 0.85 : 0.08} />
          </radialGradient>
          {/* upper-left light on the cloud */}
          <radialGradient id={`${uid}-sheen`} cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          {/* darker limb, lower right */}
          <radialGradient id={`${uid}-limb`} cx="35%" cy="30%" r="80%">
            <stop offset="60%" stopColor="#0b2a6b" stopOpacity="0" />
            <stop offset="100%" stopColor="#0b2a6b" stopOpacity={tiny ? 0.5 : 0.3} />
          </radialGradient>
          {/* proton: small pink sphere lit from the upper left */}
          <radialGradient id={`${uid}-proton`} cx="35%" cy="30%" r="78%">
            <stop offset="0%" stopColor="#ffd3ea" />
            <stop offset="40%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#8a1f5e" />
          </radialGradient>
          {/* electron: bright blue-white bead */}
          <radialGradient id={`${uid}-electron`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#60A5FA" />
          </radialGradient>
          <radialGradient id={`${uid}-eglow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* electron cloud disc — spans the whole measured axis */}
        <circle cx="50" cy="50" r="50" fill={`url(#${uid}-cloud)`} />
        <circle cx="50" cy="50" r="50" fill={`url(#${uid}-sheen)`} />

        {/* probability specks in the cloud */}
        {px > 120 && (
          <g fill="#dbeafe">
            <circle cx="38" cy="36" r="1.1" opacity="0.7" />
            <circle cx="60" cy="33" r="0.9" opacity="0.6" />
            <circle cx="66" cy="54" r="1.1" opacity="0.65" />
            <circle cx="42" cy="64" r="0.9" opacity="0.6" />
            <circle cx="55" cy="68" r="0.8" opacity="0.5" />
            <circle cx="31" cy="50" r="0.8" opacity="0.5" />
            <circle cx="47" cy="27" r="0.7" opacity="0.45" />
            <circle cx="72" cy="42" r="0.7" opacity="0.4" />
            <circle cx="28" cy="62" r="0.7" opacity="0.4" />
            <circle cx="62" cy="76" r="0.6" opacity="0.35" />
            <circle cx="24" cy="38" r="0.6" opacity="0.35" />
            <circle cx="76" cy="64" r="0.6" opacity="0.35" />
          </g>
        )}

        {/* Bohr orbit ring — outer edge touches x = 0 and x = 100 */}
        {!tiny && (
          <circle cx="50" cy="50" r="49.25" fill="none" stroke="#bfdbfe" strokeWidth="1.5" opacity={px > 60 ? 0.85 : 1} />
        )}

        {/* proton nucleus */}
        <circle cx="50" cy="50" r={tiny ? 9 : 7} fill={`url(#${uid}-proton)`} />
        {px > 60 && (
          <g fill="#fff6fb" opacity="0.95">
            {/* plus badge */}
            <rect x="47.4" y="49.3" width="5.2" height="1.4" rx="0.7" />
            <rect x="49.3" y="47.4" width="1.4" height="5.2" rx="0.7" />
          </g>
        )}

        {/* electron on the orbit, upper right */}
        {!tiny && (
          <g>
            <circle cx="87.7" cy="18.3" r="6" fill={`url(#${uid}-eglow)`} />
            <circle cx="87.7" cy="18.3" r="3" fill={`url(#${uid}-electron)`} />
            {px > 120 && (
              <rect x="86.4" y="17.5" width="2.6" height="0.9" rx="0.45" fill="#1e3a8a" opacity="0.8" />
            )}
          </g>
        )}

        {/* darker limb, lower right */}
        <circle cx="50" cy="50" r="50" fill={`url(#${uid}-limb)`} />
      </svg>
    );
  },
};
