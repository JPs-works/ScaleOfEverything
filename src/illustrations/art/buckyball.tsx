import type { Illustration } from '../types';

// Buckyball (C60) — measured axis: diameter (horizontal). The sphere spans x = 0..100.
// Geometry: a truncated icosahedron viewed almost along a 5-fold axis, projected orthographically.

type V3 = [number, number, number];
const PHI = (1 + Math.sqrt(5)) / 2;
const R3 = Math.sqrt(1 + 9 * PHI * PHI); // circumradius for edge length 2

const signCombos = (v: V3): V3[] => {
  const out: V3[] = [];
  const opts = v.map((c) => (c === 0 ? [0] : [c, -c]));
  for (const a of opts[0]) for (const b of opts[1]) for (const c of opts[2]) out.push([a, b, c]);
  return out;
};
const evenPerms = (v: V3): V3[] => [[v[0], v[1], v[2]], [v[1], v[2], v[0]], [v[2], v[0], v[1]]];

const rotX = ([x, y, z]: V3, a: number): V3 => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
const rotY = ([x, y, z]: V3, a: number): V3 => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
// Bring the 5-fold axis (0, 1, φ) to +z, then tilt a little for depth.
const orient = (v: V3): V3 => rotY(rotX(rotX(v, -Math.atan2(1, PHI)), 0.2), -0.16);

const raw: V3[] = [];
for (const base of [[0, 1, 3 * PHI], [1, 2 + PHI, 2 * PHI], [PHI, 2, 2 * PHI + 1]] as V3[]) {
  for (const s of signCombos(base)) for (const p of evenPerms(s)) raw.push(p);
}
const verts = raw.map(orient);
const proj = (v: V3) => [+(50 + (50 * v[0]) / R3).toFixed(2), +(50 - (50 * v[1]) / R3).toFixed(2)] as const;
const pts = verts.map(proj);

const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const frontBonds: string[] = [];
const backBonds: string[] = [];
for (let i = 0; i < verts.length; i++) {
  for (let j = i + 1; j < verts.length; j++) {
    if (Math.abs(dist(verts[i], verts[j]) - 2) < 0.01) {
      const seg = `M${pts[i][0]} ${pts[i][1]}L${pts[j][0]} ${pts[j][1]}`;
      (verts[i][2] + verts[j][2] > 0 ? frontBonds : backBonds).push(seg);
    }
  }
}

// Pentagons sit under the 12 icosahedron vertex directions.
const icoDirs: V3[] = [];
for (const s of signCombos([0, 1, PHI])) for (const p of evenPerms(s)) icoDirs.push(orient(p));
const frontPentagons: string[] = [];
for (const d of icoDirs) {
  const n = Math.hypot(...d);
  const u: V3 = [d[0] / n, d[1] / n, d[2] / n];
  if (u[2] <= 0) continue;
  const ring = verts
    .map((v, i) => ({ i, dot: v[0] * u[0] + v[1] * u[1] + v[2] * u[2] }))
    .sort((a, b) => b.dot - a.dot)
    .slice(0, 5)
    .map(({ i }) => i);
  const c = pts.filter((_, i) => ring.includes(i)).reduce((a, p) => [a[0] + p[0] / 5, a[1] + p[1] / 5], [0, 0]);
  ring.sort((a, b) => Math.atan2(pts[a][1] - c[1], pts[a][0] - c[0]) - Math.atan2(pts[b][1] - c[1], pts[b][0] - c[0]));
  frontPentagons.push(ring.map((i, k) => `${k ? 'L' : 'M'}${pts[i][0]} ${pts[i][1]}`).join('') + 'Z');
}

const frontAtoms = verts
  .map((v, i) => ({ x: pts[i][0], y: pts[i][1], z: v[2] / R3 }))
  .filter((a) => a.z > -0.05)
  .sort((a, b) => a.z - b.z);

export const art: Illustration = {
  id: 'buckyball',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-body`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#F4F4F5" />
          <stop offset="45%" stopColor="#A1A1AA" />
          <stop offset="100%" stopColor="#3F3F46" />
        </radialGradient>
        <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="80%">
          <stop offset="60%" stopColor="#18181B" stopOpacity="0" />
          <stop offset="100%" stopColor="#18181B" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="86%" stopColor="#E4E4E7" stopOpacity="0" />
          <stop offset="100%" stopColor="#E4E4E7" stopOpacity="0.3" />
        </radialGradient>
      </defs>
      {/* translucent sphere body — solid silhouette at any size */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-body)`} opacity={px < 24 ? 1 : 0.55} />
      {px >= 24 && (
        <>
          {/* back half of the cage, seen through the hollow */}
          <path d={backBonds.join('')} stroke="#D4D4D8" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.22" />
          {/* pentagon faces, soccer-ball style */}
          <g fill="#52525B" opacity="0.55">
            {frontPentagons.map((d, i) => <path key={i} d={d} />)}
          </g>
          {/* front bonds */}
          <path d={frontBonds.join('')} stroke="#F4F4F5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      )}
      {px > 120 && (
        <g>
          {/* carbon atoms, brighter and larger toward the viewer */}
          {frontAtoms.map((a, i) => (
            <circle key={i} cx={a.x} cy={a.y} r={+(1.5 + 0.9 * Math.max(a.z, 0)).toFixed(2)} fill={a.z > 0.55 ? '#FFFFFF' : '#E4E4E7'} />
          ))}
        </g>
      )}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-shade)`} />
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-halo)`} />
    </svg>
  ),
};
