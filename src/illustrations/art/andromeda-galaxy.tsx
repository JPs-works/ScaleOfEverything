import type { Illustration } from '../types';

// Andromeda Galaxy — measured axis: diameter (horizontal). The tilted disc spans x = 0..100.
// aspect = width / height of the bounding box: 100 / 36.
// The disc is designed face-on inside a 100x100 circle and squashed to 36% vertically, so the
// spiral arms foreshorten into honest ellipses. Two companions (M110 upper-left, M32 on the
// lower edge of the disc) sit inside the bounding box.

const TILT = 0.36;
const CY = 18;
const TURNS = 0.9;

/** Logarithmic spiral arm in face-on coordinates, returned as an SVG polyline path. */
function arm(phase: number, r0: number, r1: number): string {
  const thetaMax = TURNS * Math.PI * 2;
  const b = Math.log(r1 / r0) / thetaMax;
  const pts: string[] = [];
  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const t = (thetaMax * i) / steps;
    const r = r0 * Math.exp(b * t);
    const x = 50 + r * Math.cos(t + phase);
    const y = 50 + r * Math.sin(t + phase);
    pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
}

/** A few bright knots along each arm, already projected into the tilted viewBox. */
function knots(phase: number, r0: number, r1: number): { x: number; y: number; r: number }[] {
  const thetaMax = TURNS * Math.PI * 2;
  const b = Math.log(r1 / r0) / thetaMax;
  const out: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const t = thetaMax * (0.18 + 0.14 * i);
    const r = r0 * Math.exp(b * t) * (i % 2 === 0 ? 0.97 : 1.03);
    const x = 50 + r * Math.cos(t + phase);
    const y = CY + r * Math.sin(t + phase) * TILT;
    out.push({ x: +x.toFixed(1), y: +y.toFixed(1), r: i % 3 === 0 ? 0.9 : 0.6 });
  }
  return out;
}

const ARM_A = arm(0, 13, 46);
const ARM_B = arm(Math.PI, 13, 46);
const DUST_A = arm(0.32, 11.5, 44.5);
const DUST_B = arm(Math.PI + 0.32, 11.5, 44.5);
const KNOTS = [...knots(0, 13, 46), ...knots(Math.PI, 13, 46)];

export const art: Illustration = {
  id: 'andromeda-galaxy',
  aspect: 100 / 36,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 36" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* faint halo spilling just beyond the disc */}
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="72%" stopColor="#93C5FD" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
        </radialGradient>
        {/* disc: pale blue inside, deep blue rim */}
        <radialGradient id={`${uid}-disc`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#93C5FD" stopOpacity="0.92" />
          <stop offset="78%" stopColor="#3B82F6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.6" />
        </radialGradient>
        {/* light from the upper-left */}
        <radialGradient id={`${uid}-hi`} cx="35%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        {/* darker limb at the lower-right */}
        <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="80%">
          <stop offset="55%" stopColor="#0B1E4A" stopOpacity="0" />
          <stop offset="100%" stopColor="#0B1E4A" stopOpacity="0.5" />
        </radialGradient>
        {/* warm central bulge */}
        <radialGradient id={`${uid}-bulge`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF7E0" stopOpacity="1" />
          <stop offset="35%" stopColor="#FDE68A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        {/* companion smudge */}
        <radialGradient id={`${uid}-comp`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#DBEAFE" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* halo (allowed spill, opacity <= 0.35) */}
      <ellipse cx="50" cy={CY} rx="56" ry="20.5" fill={`url(#${uid}-halo)`} />

      {/* disc — touches x = 0 and x = 100 */}
      <ellipse cx="50" cy={CY} rx="50" ry="18" fill={`url(#${uid}-disc)`} />

      {px > 24 && (
        <g transform={`translate(0 ${CY}) scale(1 ${TILT}) translate(0 -50)`} fill="none" strokeLinecap="round">
          {/* dark dust lanes hugging the arms */}
          <path d={DUST_A} stroke="#1E3A8A" strokeWidth="2.6" strokeOpacity="0.55" />
          <path d={DUST_B} stroke="#1E3A8A" strokeWidth="2.6" strokeOpacity="0.55" />
          {/* bright blue-white arms: a soft wide band and a crisp bright core */}
          <path d={ARM_A} stroke="#BFDBFE" strokeWidth="4.5" strokeOpacity="0.45" />
          <path d={ARM_B} stroke="#BFDBFE" strokeWidth="4.5" strokeOpacity="0.45" />
          <path d={ARM_A} stroke="#EFF6FF" strokeWidth="1.6" strokeOpacity="0.8" />
          <path d={ARM_B} stroke="#EFF6FF" strokeWidth="1.6" strokeOpacity="0.8" />
        </g>
      )}

      {/* volume: upper-left highlight, lower-right limb */}
      <ellipse cx="50" cy={CY} rx="50" ry="18" fill={`url(#${uid}-hi)`} />
      <ellipse cx="50" cy={CY} rx="50" ry="18" fill={`url(#${uid}-shade)`} />

      {px > 120 && (
        <g fill="#ffffff">
          {/* star-forming knots along the arms */}
          {KNOTS.map((k, i) => (
            <circle key={i} cx={k.x} cy={k.y} r={k.r} fillOpacity={0.85} />
          ))}
          {/* a few foreground stars */}
          <circle cx="6" cy="31" r="0.6" fillOpacity="0.8" />
          <circle cx="93" cy="4" r="0.6" fillOpacity="0.8" />
          <circle cx="80" cy="33" r="0.45" fillOpacity="0.7" />
          <circle cx="24" cy="2" r="0.45" fillOpacity="0.7" />
        </g>
      )}

      {/* warm bulge and bright nucleus */}
      <ellipse cx="50" cy={CY} rx={px > 24 ? 15 : 20} ry={px > 24 ? 9 : 11} fill={`url(#${uid}-bulge)`} />
      <ellipse cx="50" cy={CY} rx="2.6" ry="1.9" fill="#FFFDF5" />

      {px > 24 && (
        <g>
          {/* M110 — elongated elliptical companion in the upper-left corner */}
          <ellipse cx="13" cy="4" rx="5" ry="3" transform="rotate(-25 13 4)" fill={`url(#${uid}-comp)`} />
          <ellipse cx="13" cy="4" rx="1.6" ry="0.9" transform="rotate(-25 13 4)" fill="#FEF3C7" fillOpacity="0.9" />
          {/* M32 — compact companion sitting on the lower edge of the disc */}
          <circle cx="60" cy="31" r="3" fill={`url(#${uid}-comp)`} />
          <circle cx="60" cy="31" r="0.9" fill="#FEF3C7" fillOpacity="0.95" />
        </g>
      )}
    </svg>
  ),
};
