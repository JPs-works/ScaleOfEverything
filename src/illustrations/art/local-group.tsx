import type { Illustration } from '../types';

// Local Group — measured axis: diameter (horizontal). The faint translucent sphere spans x = 0 .. 100.
// Inside: Andromeda (largest spiral, upper right), the Milky Way (lower left), Triangulum (small, beside
// Andromeda) and a scatter of dwarf galaxies, several huddled round the two big spirals as satellites.

interface Dwarf {
  x: number;
  y: number;
  r: number;
  o: number;
}

// Hand-placed so the scatter is identical on every render and stays inside the sphere.
const DWARFS: Dwarf[] = [
  // satellites of the Milky Way (lower left)
  { x: 22, y: 50, r: 0.9, o: 0.9 },
  { x: 36, y: 72, r: 0.8, o: 0.85 },
  { x: 18, y: 64, r: 0.6, o: 0.7 },
  { x: 40, y: 50, r: 0.6, o: 0.75 },
  { x: 27, y: 75, r: 0.5, o: 0.6 },
  // satellites of Andromeda (upper right)
  { x: 60, y: 28, r: 0.8, o: 0.85 },
  { x: 84, y: 30, r: 0.7, o: 0.8 },
  { x: 86, y: 46, r: 0.6, o: 0.7 },
  { x: 64, y: 50, r: 0.6, o: 0.7 },
  { x: 76, y: 24, r: 0.5, o: 0.6 },
  // outlying dwarfs across the group
  { x: 50, y: 14, r: 0.7, o: 0.75 },
  { x: 30, y: 22, r: 0.6, o: 0.7 },
  { x: 14, y: 40, r: 0.7, o: 0.7 },
  { x: 12, y: 56, r: 0.5, o: 0.55 },
  { x: 48, y: 86, r: 0.7, o: 0.7 },
  { x: 62, y: 80, r: 0.6, o: 0.65 },
  { x: 76, y: 72, r: 0.7, o: 0.7 },
  { x: 88, y: 60, r: 0.5, o: 0.55 },
  { x: 54, y: 62, r: 0.5, o: 0.6 },
  { x: 42, y: 36, r: 0.5, o: 0.6 },
  { x: 68, y: 10, r: 0.5, o: 0.55 },
  { x: 24, y: 88, r: 0.5, o: 0.5 },
];

interface SpiralProps {
  uid: string;
  cx: number;
  cy: number;
  /** radius of the disc in viewBox units before tilt */
  r: number;
  /** rotation of the tilted disc, degrees */
  rot: number;
  /** squash of the disc (1 = face-on, 0.4 = steeply tilted) */
  tilt: number;
  detailed: boolean;
}

// A tiny spiral galaxy: tilted disc with a radial glow, a bright core and two filled crescent arms.
// Drawn in a unit space of radius 12 and scaled; fills only, so non-uniform scaling is safe.
const Spiral = ({ uid, cx, cy, r, rot, tilt, detailed }: SpiralProps) => {
  const k = r / 12;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${k} ${k * tilt})`}>
      <ellipse cx="0" cy="0" rx="12" ry="12" fill={`url(#${uid}-disc)`} />
      {detailed && (
        <g fill="#C7D2FE" opacity="0.8">
          <path d="M-1.5 -2.5 C 3 -12, 13 -8.5, 12.5 1.5 C 10.5 -4.5, 6 -7.5, 1 -4.5 Z" />
          <path d="M1.5 2.5 C -3 12, -13 8.5, -12.5 -1.5 C -10.5 4.5, -6 7.5, -1 4.5 Z" />
        </g>
      )}
      <ellipse cx="0" cy="0" rx="3.6" ry="3.6" fill={`url(#${uid}-core)`} />
    </g>
  );
};

export const art: Illustration = {
  id: 'local-group',
  aspect: 1,
  View: ({ uid, px }) => {
    const detailed = px > 120;
    const mid = px >= 24;
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          {/* the sphere's body: thin in the middle, denser toward the rim like a glass bubble */}
          <radialGradient id={`${uid}-sphere`} cx="42%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#6366F1" stopOpacity="0.16" />
            <stop offset="88%" stopColor="#6366F1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#A5B4FC" stopOpacity="0.5" />
          </radialGradient>
          {/* darker limb at the lower right */}
          <radialGradient id={`${uid}-limb`} cx="35%" cy="30%" r="80%">
            <stop offset="60%" stopColor="#312E81" stopOpacity="0" />
            <stop offset="100%" stopColor="#312E81" stopOpacity="0.4" />
          </radialGradient>
          {/* faint halo spilling a little beyond the measured sphere */}
          <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="78%" stopColor="#6366F1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>
          {/* galaxy disc glow and core, shared by all three spirals */}
          <radialGradient id={`${uid}-disc`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#818CF8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-core`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="55%" stopColor="#EEF2FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0" />
          </radialGradient>
          {/* soft sheen that fades out so it reads as a highlight, not a blob */}
          <radialGradient id={`${uid}-gloss`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E0E7FF" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#E0E7FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* halo */}
        <circle cx="50" cy="50" r="56" fill={`url(#${uid}-halo)`} opacity="0.35" />

        {/* the sphere of the group: spans the full diameter x = 0 .. 100 */}
        <circle cx="50" cy="50" r="50" fill={`url(#${uid}-sphere)`} />
        {/* at icon size give the silhouette a little more body so it still reads as a coloured disc */}
        {!mid && <circle cx="50" cy="50" r="50" fill="#6366F1" opacity="0.4" />}
        <circle cx="50" cy="50" r="50" fill={`url(#${uid}-limb)`} />
        {/* rim */}
        <circle cx="50" cy="50" r="49.4" fill="none" stroke="#A5B4FC" strokeWidth="1.2" opacity={mid ? 0.55 : 0.8} />
        {/* soft gloss, light from the upper left */}
        {mid && (
          <ellipse cx="32" cy="26" rx="17" ry="8" fill={`url(#${uid}-gloss)`} transform="rotate(-38 32 26)" />
        )}

        {/* the three spirals */}
        <Spiral uid={uid} cx={70} cy={38} r={13} rot={-28} tilt={0.42} detailed={detailed} />
        <Spiral uid={uid} cx={31} cy={61} r={10.5} rot={22} tilt={0.5} detailed={detailed} />
        {mid && <Spiral uid={uid} cx={79} cy={58} r={5.5} rot={-10} tilt={0.6} detailed={detailed} />}

        {/* dwarf galaxies */}
        {mid &&
          DWARFS.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#E0E7FF" opacity={detailed ? d.o : d.o * 0.85} />
          ))}
      </svg>
    );
  },
};
