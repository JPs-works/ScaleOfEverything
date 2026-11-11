import type { Illustration } from '../types';

// Sedna's Orbit — measured axis: diameter of the long axis (horizontal).
// Face-on view like solar-system.tsx: one long, thin dusty-rose ellipse spanning x = 0..100 and
// 36 units tall. The Sun sits near the LEFT focus (x = 7.5, Sedna's eccentricity is ~0.85), a tiny
// reddish Sedna dot rests at aphelion on the far right, and a very faint small circle around the
// Sun marks Neptune's orbit (radius 3 — the whole of the planetary system fits inside it).
// aspect = width / height of the bounding box: 100 / 36.
const H = 36;
const CY = H / 2;
const SUN_X = 7.5;
const NEPTUNE_R = 3;

const ROSE = '#c97a6b';
const ROSE_LIGHT = '#e8a898';
const ROSE_DARK = '#8a4a40';
const SEDNA = '#d9634a';
const SEDNA_LIGHT = '#f0a08a';

export const art: Illustration = {
  id: 'sedna-orbit',
  aspect: 100 / H,
  View: ({ uid, px }) => {
    const tiny = px < 24;
    const rich = px > 120;
    const orbitStroke = px < 60 ? 1.5 : rich ? 0.6 : 0.9;
    const rx = 50 - orbitStroke / 2;
    const ry = CY - orbitStroke / 2;
    const sednaR = tiny ? 2.2 : rich ? 1.1 : 1.5;
    const sunR = tiny ? 2.4 : rich ? 1.3 : 1.7;
    return (
      <svg viewBox={`0 0 100 ${H}`} width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          {/* faint dusty fill of the orbital plane — gives a solid silhouette when tiny */}
          <radialGradient id={`${uid}-plane`} cx="20%" cy="50%" r="85%">
            <stop offset="0%" stopColor={ROSE_LIGHT} stopOpacity={tiny ? 0.75 : 0.22} />
            <stop offset="55%" stopColor={ROSE} stopOpacity={tiny ? 0.55 : 0.1} />
            <stop offset="100%" stopColor={ROSE_DARK} stopOpacity={tiny ? 0.4 : 0.03} />
          </radialGradient>
          <radialGradient id={`${uid}-sunglow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF4C2" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#FFD27A" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFB347" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-sun`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFFBE6" />
            <stop offset="60%" stopColor="#FFD75E" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
          <radialGradient id={`${uid}-sednaglow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={SEDNA_LIGHT} stopOpacity="0.7" />
            <stop offset="50%" stopColor={SEDNA} stopOpacity="0.25" />
            <stop offset="100%" stopColor={SEDNA} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-sedna`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={SEDNA_LIGHT} />
            <stop offset="60%" stopColor={SEDNA} />
            <stop offset="100%" stopColor={ROSE_DARK} />
          </radialGradient>
        </defs>

        {/* the orbital plane */}
        <ellipse cx={50} cy={CY} rx={rx} ry={ry} fill={`url(#${uid}-plane)`} />

        {/* Sedna's orbit — the measured span, touching x = 0 and x = 100 */}
        <ellipse
          cx={50}
          cy={CY}
          rx={rx}
          ry={ry}
          fill="none"
          stroke={tiny ? ROSE_LIGHT : ROSE}
          strokeWidth={orbitStroke}
          opacity={tiny ? 1 : 0.85}
        />
        {/* a lighter catch of light along the upper-left arc */}
        {!tiny && (
          <path
            d={`M${50 - rx * 0.95} ${CY - ry * 0.31} A${rx} ${ry} 0 0 1 ${50 - rx * 0.1} ${CY - ry * 0.995}`}
            fill="none"
            stroke={ROSE_LIGHT}
            strokeWidth={orbitStroke}
            strokeLinecap="round"
            opacity={0.55}
          />
        )}

        {/* Neptune's orbit — the whole planetary system, a faint ring around the Sun */}
        {!tiny && (
          <circle
            cx={SUN_X}
            cy={CY}
            r={NEPTUNE_R}
            fill="none"
            stroke="#A78BFA"
            strokeWidth={rich ? 0.35 : 0.5}
            opacity={rich ? 0.5 : 0.6}
          />
        )}
        {rich && <circle cx={SUN_X + NEPTUNE_R * Math.cos(2.1)} cy={CY - NEPTUNE_R * Math.sin(2.1)} r={0.35} fill="#7CC4FF" opacity={0.9} />}

        {/* the Sun, near the left focus */}
        <circle cx={SUN_X} cy={CY} r={sunR * 3} fill={`url(#${uid}-sunglow)`} />
        <circle cx={SUN_X} cy={CY} r={sunR} fill={`url(#${uid}-sun)`} />

        {/* Sedna at aphelion, far right, touching x = 100 */}
        {!tiny && <circle cx={100 - sednaR} cy={CY} r={sednaR * 3} fill={`url(#${uid}-sednaglow)`} />}
        <circle cx={100 - sednaR} cy={CY} r={sednaR} fill={`url(#${uid}-sedna)`} />

        {/* a sparse scatter of distant stars inside the plane, only when large */}
        {rich && (
          <g fill="#F4F0FF">
            <circle cx={30} cy={9} r={0.3} opacity={0.5} />
            <circle cx={62} cy={27} r={0.35} opacity={0.45} />
            <circle cx={74} cy={8} r={0.28} opacity={0.4} />
            <circle cx={44} cy={30} r={0.25} opacity={0.4} />
            <circle cx={86} cy={22} r={0.3} opacity={0.45} />
          </g>
        )}
      </svg>
    );
  },
};
