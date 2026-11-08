import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FresnelShell, Glow, PointCloud, Ring, Tube, disposeObject, rng, useDisposable, useSpin, useTime } from './common';

// ---------------------------------------------------------------- Planck foam

const foamFrag = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}
void main() {
  // Foam cells about half a Planck length across on a 1.8-unit quad.
  vec2 p = (vUv - 0.5) * 3.6;
  vec2 g = floor(p), f = fract(p);
  float d1 = 8.0, d2 = 8.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 o = vec2(float(i), float(j));
    vec2 h = hash2(g + o);
    vec2 pt = o + 0.5 + 0.42 * sin(uTime * (0.6 + h * 0.9) + 6.2831 * h);
    float d = length(pt - f);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
  }
  float edge = 1.0 - smoothstep(0.0, 0.08, d2 - d1);
  float bubble = smoothstep(0.7, 0.0, d1) * 0.25;
  float r = length(vUv - 0.5) * 2.0;
  float fade = smoothstep(1.0, 0.45, r);
  vec3 col = mix(vec3(0.06, 0.35, 0.22), vec3(0.45, 1.0, 0.7), edge) * (edge + bubble);
  float a = (edge * 0.9 + bubble) * fade;
  gl_FragColor = vec4(col * a, a);
}
`;
const quadVert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

export function PlanckFoam() {
  const t = useTime();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame(() => {
    if (mat.current) mat.current.uniforms.uTime.value = t.current;
  });
  return (
    <group>
      <mesh>
        <planeGeometry args={[1.8, 1.8]} />
        <shaderMaterial ref={mat} vertexShader={quadVert} fragmentShader={foamFrag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <Ring radius={0.5} color="#4ADE80" opacity={0.6} />
      </group>
    </group>
  );
}

// ------------------------------------------------------------------ Neutrino

const FLAVOURS = ['#60A5FA', '#34D399', '#F472B6']; // electron, muon, tau

export function Neutrino() {
  const t = useTime();
  const shells = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    shells.current.forEach((m, i) => {
      if (!m) return;
      // Flavour oscillation: the three shells take turns dominating.
      const w = 0.5 + 0.5 * Math.cos(t.current * 1.3 - (i * Math.PI * 2) / 3);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.08 + 0.4 * w * w;
      m.scale.setScalar(0.75 + 0.25 * w);
    });
  });
  return (
    <group>
      <Glow color="#E0FFF4" size={1.8} power={3} />
      {FLAVOURS.map((c, i) => (
        <mesh key={c} ref={(m) => { shells.current[i] = m; }}>
          <sphereGeometry args={[0.5, 48, 24]} />
          <meshBasicMaterial color={c} transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      {/* Trail: it travels at almost the speed of light. */}
      <mesh position={[-2.2, 0, -0.1]}>
        <planeGeometry args={[4, 0.06]} />
        <meshBasicMaterial color="#A7F3D0" transparent opacity={0.25} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------------- Proton

const QUARKS: { color: string; label: string }[] = [
  { color: '#EF4444', label: 'u' },
  { color: '#22C55E', label: 'u' },
  { color: '#3B82F6', label: 'd' },
];

/** Wavy flux tube between two points (a gluon "string"). */
function gluon(a: THREE.Vector3, b: THREE.Vector3, waves = 5, amp = 0.025) {
  const pts: THREE.Vector3[] = [];
  const dir = b.clone().sub(a);
  const n1 = new THREE.Vector3(0, 0, 1).cross(dir).normalize();
  const n2 = dir.clone().cross(n1).normalize();
  for (let i = 0; i <= 48; i++) {
    const s = i / 48;
    const ph = s * waves * Math.PI * 2;
    const env = Math.sin(s * Math.PI);
    pts.push(a.clone().lerp(b, s).addScaledVector(n1, Math.cos(ph) * amp * env).addScaledVector(n2, Math.sin(ph) * amp * env));
  }
  return pts;
}

export function Proton() {
  const spin = useSpin(0.25);
  const inner = useRef<THREE.Group>(null);
  const t = useTime();
  const positions = useMemo(
    () => [0, 1, 2].map((i) => new THREE.Vector3(Math.cos((i / 3) * Math.PI * 2 + Math.PI / 2) * 0.22, Math.sin((i / 3) * Math.PI * 2 + Math.PI / 2) * 0.22, 0)),
    [],
  );
  const tubes = useMemo(() => [[0, 1], [1, 2], [2, 0]].map(([i, j]) => gluon(positions[i], positions[j])), [positions]);
  const sea = useMemo(() => {
    const r = rng(7);
    const n = 500;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n);
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(Math.cbrt(r()) * 0.46);
      v.toArray(pos, i * 3);
      c.set(['#FCA5A5', '#86EFAC', '#93C5FD', '#FDE68A'][i % 4]).toArray(col, i * 3);
      size[i] = 2 + r() * 2.5;
    }
    return { pos, col, size };
  }, []);
  useFrame(() => {
    if (inner.current) {
      inner.current.rotation.z = Math.sin(t.current * 0.7) * 0.25;
      inner.current.scale.setScalar(1 + Math.sin(t.current * 2.1) * 0.03);
    }
  });
  return (
    <group ref={spin}>
      <FresnelShell color="#F472B6" radius={0.5} power={2.2} intensity={0.9} />
      <mesh>
        <sphereGeometry args={[0.5, 48, 24]} />
        <meshBasicMaterial color="#F472B6" transparent opacity={0.06} depthWrite={false} />
      </mesh>
      <PointCloud positions={sea.pos} colors={sea.col} sizes={sea.size} opacity={0.45} />
      <group ref={inner}>
        {tubes.map((pts, i) => (
          <Tube key={i} points={pts} radius={0.018} color="#FDE68A" emissive={1.4} />
        ))}
        {positions.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.085, 32, 16]} />
            <meshStandardMaterial color={QUARKS[i].color} emissive={QUARKS[i].color} emissiveIntensity={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ------------------------------------------------------------- Uranium-238

export function UraniumNucleus() {
  const spin = useSpin(0.12);
  const { mesh, r } = useDisposable(() => {
    const N = 238, Z = 92;
    // Face-centred cubic lattice, keep the 238 sites nearest the centre.
    const pts: THREE.Vector3[] = [];
    const R = 6;
    for (let x = -R; x <= R; x++) for (let y = -R; y <= R; y++) for (let z = -R; z <= R; z++) {
      if ((x + y + z) % 2 === 0) pts.push(new THREE.Vector3(x, y, z));
    }
    const jitter = rng(3);
    pts.forEach((p) => p.add(new THREE.Vector3(jitter() - 0.5, jitter() - 0.5, jitter() - 0.5).multiplyScalar(0.12)));
    pts.sort((a, b) => a.lengthSq() - b.lengthSq());
    const chosen = pts.slice(0, N);
    const nn = Math.SQRT2; // nearest-neighbour distance in this lattice
    const maxR = Math.max(...chosen.map((p) => p.length())) + nn / 2;
    const s = 0.5 / maxR;
    const radius = (nn / 2) * s * 0.98;
    const geom = new THREE.SphereGeometry(1, 20, 12);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.05 });
    const m = new THREE.InstancedMesh(geom, mat, N);
    const order = rng(11);
    const isProton = Array.from({ length: N }, (_, i) => i < Z).sort(() => order() - 0.5);
    const mtx = new THREE.Matrix4();
    const col = new THREE.Color();
    chosen.forEach((p, i) => {
      mtx.compose(p.clone().multiplyScalar(s), new THREE.Quaternion(), new THREE.Vector3(radius, radius, radius));
      m.setMatrixAt(i, mtx);
      m.setColorAt(i, col.set(isProton[i] ? '#FB7185' : '#94A3B8'));
    });
    m.instanceMatrix.needsUpdate = true;
    return { mesh: m, r: radius };
  }, [], (v) => disposeObject(v.mesh));
  return (
    <group ref={spin} rotation={[0.3, 0, 0.2]}>
      <primitive object={mesh} />
      <FresnelShell color="#FB7185" radius={0.5 + r * 0.2} power={3} intensity={0.35} />
    </group>
  );
}

// ------------------------------------------------------------ Hydrogen atom

export function HydrogenAtom() {
  const spin = useSpin(0.08);
  const cloud = useMemo(() => {
    // 1s orbital: radial density ∝ r² e^(−2r/a0) → Gamma(3, a0/2). Diameter 2·a0 = 1 unit.
    const a0 = 0.5;
    const r = rng(5);
    const n = 14000;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n);
    const inner = new THREE.Color('#BFDBFE'), outer = new THREE.Color('#1D4ED8'), c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const rad = -(a0 / 2) * Math.log((r() + 1e-9) * (r() + 1e-9) * (r() + 1e-9));
      const v = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1);
      if (v.lengthSq() > 1 || v.lengthSq() < 1e-6) { i--; continue; }
      v.normalize().multiplyScalar(rad).toArray(pos, i * 3);
      c.copy(inner).lerp(outer, Math.min(1, rad / (2.2 * a0))).toArray(col, i * 3);
      size[i] = 2.2 + r() * 2.2;
    }
    return { pos, col, size };
  }, []);
  return (
    <group>
      <group ref={spin}>
        <PointCloud positions={cloud.pos} colors={cloud.col} sizes={cloud.size} opacity={0.85} />
      </group>
      {/* Bohr radius guide and the (enormously magnified) proton */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <Ring radius={0.5} color="#93C5FD" opacity={0.55} />
      </group>
      <Glow color="#FBCFE8" size={0.12} power={2.5} />
      <mesh>
        <sphereGeometry args={[0.012, 16, 8]} />
        <meshBasicMaterial color="#F9A8D4" />
      </mesh>
    </group>
  );
}

// ----------------------------------------------------------- Water molecule

export function WaterMolecule() {
  const spin = useSpin(0.3);
  // Geometry in picometres, then scaled so the 275 pm effective diameter = 1.
  const S = 1 / 275;
  const bond = 95.84 * S;
  const half = ((104.45 / 2) * Math.PI) / 180;
  const h1 = new THREE.Vector3(Math.sin(half) * bond, -Math.cos(half) * bond, 0);
  const h2 = new THREE.Vector3(-Math.sin(half) * bond, -Math.cos(half) * bond, 0);
  const centroid = h1.clone().add(h2).multiplyScalar(1 / 18); // mass-weighted: O = 16, H = 1 each
  const o = new THREE.Vector3().sub(centroid);
  const a = h1.clone().sub(centroid), b = h2.clone().sub(centroid);
  const stick = (p: THREE.Vector3) => {
    const mid = o.clone().add(p).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.clone().sub(o).normalize());
    return { mid, q, len: p.distanceTo(o) };
  };
  return (
    <group ref={spin}>
      <mesh position={o}>
        <sphereGeometry args={[60 * S, 48, 24]} />
        <meshStandardMaterial color="#EF4444" roughness={0.3} />
      </mesh>
      {[a, b].map((p, i) => {
        const s = stick(p);
        return (
          <group key={i}>
            <mesh position={p}>
              <sphereGeometry args={[36 * S, 32, 16]} />
              <meshStandardMaterial color="#F1F5F9" roughness={0.3} />
            </mesh>
            <mesh position={s.mid} quaternion={s.q}>
              <cylinderGeometry args={[12 * S, 12 * S, s.len, 16]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
            </mesh>
          </group>
        );
      })}
      {/* Effective molecular size (the 275 pm that `size` refers to) */}
      <FresnelShell color="#38BDF8" radius={0.5} power={2.5} intensity={0.6} />
    </group>
  );
}

// -------------------------------------------------------------------- DNA

const BASES: [string, string][] = [
  ['#60A5FA', '#FACC15'], // A–T
  ['#FACC15', '#60A5FA'], // T–A
  ['#34D399', '#F87171'], // G–C
  ['#F87171', '#34D399'], // C–G
];

export function DnaHelix() {
  const spin = useSpin(0.35);
  const { s1, s2, pairs } = useMemo(() => {
    const radius = 0.42; // backbone centre; with the tube the helix is 1 unit (2 nm) wide
    const pitch = 1.785; // 10.5 bp × 0.34 nm = 3.57 nm per turn (1 unit = 2 nm)
    const turns = 1.15;
    const h = pitch * turns;
    const groove = (150 / 180) * Math.PI; // strand offset gives major/minor grooves
    const pt = (y: number, off: number) => {
      const a = (y / pitch) * Math.PI * 2 + off;
      return new THREE.Vector3(Math.cos(a) * radius, y - h / 2, Math.sin(a) * radius);
    };
    const s1: THREE.Vector3[] = [], s2: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const y = (i / 120) * h;
      s1.push(pt(y, 0));
      s2.push(pt(y, groove));
    }
    const r = rng(9);
    const pairs: { a: THREE.Vector3; b: THREE.Vector3; colors: [string, string] }[] = [];
    const nbp = Math.floor(10.5 * turns);
    for (let i = 0; i < nbp; i++) {
      const y = ((i + 0.5) / nbp) * h;
      pairs.push({ a: pt(y, 0), b: pt(y, groove), colors: BASES[Math.floor(r() * 4)] });
    }
    return { s1, s2, pairs };
  }, []);
  return (
    <group rotation={[0, 0, -0.35]}>
      <group ref={spin}>
        <Tube points={s1} radius={0.08} color="#C084FC" segments={240} emissive={0.15} />
        <Tube points={s2} radius={0.08} color="#E879F9" segments={240} emissive={0.15} />
        {pairs.map((p, i) => {
          const mid = p.a.clone().add(p.b).multiplyScalar(0.5);
          const halfA = p.a.clone().add(mid).multiplyScalar(0.5), halfB = p.b.clone().add(mid).multiplyScalar(0.5);
          const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.b.clone().sub(p.a).normalize());
          const len = p.a.distanceTo(p.b) / 2;
          return (
            <group key={i}>
              <mesh position={halfA} quaternion={q}>
                <cylinderGeometry args={[0.035, 0.035, len, 10]} />
                <meshStandardMaterial color={p.colors[0]} roughness={0.5} />
              </mesh>
              <mesh position={halfB} quaternion={q}>
                <cylinderGeometry args={[0.035, 0.035, len, 10]} />
                <meshStandardMaterial color={p.colors[1]} roughness={0.5} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}
