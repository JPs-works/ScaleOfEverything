import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FresnelShell, Glow, PointCloud, Ring, disposeObject, rng, useDisposable, useSpin, useTime, useVisualEnv } from './common';

// ------------------------------------------------------------ Star surface

const starVert = /* glsl */ `
varying vec3 vP; varying vec3 vN;
void main() {
  vP = position;
  vN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const starFrag = /* glsl */ `
uniform float uTime; uniform vec3 uHot; uniform vec3 uCool; uniform float uScale;
varying vec3 vP; varying vec3 vN;
float h(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec3 p) {
  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h(i), h(i + vec3(1,0,0)), f.x), mix(h(i + vec3(0,1,0)), h(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h(i + vec3(0,0,1)), h(i + vec3(1,0,1)), f.x), mix(h(i + vec3(0,1,1)), h(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }
void main() {
  vec3 p = normalize(vP) * uScale;
  float n = fbm(p + vec3(0.0, uTime * 0.05, uTime * 0.03));
  float cells = fbm(p * 2.5 - uTime * 0.04);
  float limb = pow(max(0.0, dot(normalize(vN), vec3(0.0, 0.0, 1.0))), 0.45); // limb darkening
  vec3 col = mix(uCool, uHot, smoothstep(0.3, 0.75, n * 0.7 + cells * 0.5));
  gl_FragColor = vec4(col * (0.35 + 0.85 * limb), 1.0);
}
`;

/** Convecting stellar surface + glow. Used for Stephenson 2-18 and as the Sun fallback. */
export function StarSurface({ hot, cool, glow, scale = 3, glowSize = 1.9 }: { hot: string; cool: string; glow: string; scale?: number; glowSize?: number }) {
  const t = useTime();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uHot: { value: new THREE.Color(hot) }, uCool: { value: new THREE.Color(cool) }, uScale: { value: scale } }),
    [hot, cool, scale],
  );
  useFrame(() => {
    if (mat.current) mat.current.uniforms.uTime.value = t.current;
  });
  return (
    <group>
      <Glow color={glow} size={glowSize} power={2.2} opacity={0.9} z={-0.6} />
      <mesh>
        <sphereGeometry args={[0.5, 96, 48]} />
        <shaderMaterial ref={mat} vertexShader={starVert} fragmentShader={starFrag} uniforms={uniforms} />
      </mesh>
    </group>
  );
}

export const SunFallback = () => <StarSurface hot="#FFF3C4" cool="#F97316" glow="#FDBA74" />;
export const Stephenson = () => <StarSurface hot="#FCA5A5" cool="#7F1D1D" glow="#EF4444" scale={2} glowSize={2.2} />;

// ------------------------------------------------------- Planets (fallback)

export function PlanetFallback({ color, bands = false, atmosphere }: { color: string; bands?: boolean; atmosphere?: string }) {
  const spin = useSpin(0.15);
  const geom = useDisposable(() => {
    const g = new THREE.SphereGeometry(0.5, 96, 48);
    if (!bands) return g;
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const cols = new Float32Array(pos.count * 3);
    const a = new THREE.Color('#F5DEB3'), b = new THREE.Color('#B45309'), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) * 2;
      c.copy(a).lerp(b, 0.5 + 0.5 * Math.sin(y * 14 + Math.sin(y * 5) * 1.5)).toArray(cols, i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    return g;
  }, [bands]);
  return (
    <group>
      <group ref={spin}>
        <mesh geometry={geom}>
          <meshStandardMaterial color={bands ? '#ffffff' : color} vertexColors={bands} roughness={0.85} />
        </mesh>
      </group>
      {atmosphere && <FresnelShell color={atmosphere} radius={0.515} power={3} intensity={1.2} />}
    </group>
  );
}

// -------------------------------------------------------------- Neutron star

export function NeutronStar() {
  const t = useTime();
  const spinner = useRef<THREE.Group>(null);
  const fieldLines = useDisposable(() => {
    // Dipole field lines r = L sin²θ in the magnetic-axis frame.
    const loops: THREE.Vector3[][] = [];
    for (const L of [0.9, 1.4, 2.2]) {
      for (let k = 0; k < 6; k++) {
        const phi = (k / 6) * Math.PI * 2;
        const pts: THREE.Vector3[] = [];
        const th0 = Math.asin(Math.sqrt(0.5 / L));
        for (let i = 0; i <= 60; i++) {
          const th = th0 + (i / 60) * (Math.PI - 2 * th0);
          const r = L * Math.sin(th) ** 2;
          pts.push(new THREE.Vector3(r * Math.sin(th) * Math.cos(phi), r * Math.cos(th), r * Math.sin(th) * Math.sin(phi)));
        }
        loops.push(pts);
      }
    }
    return loops.map((pts) => {
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      return new THREE.Line(g, new THREE.LineBasicMaterial({ color: '#A5B4FC', transparent: true, opacity: 0.25, depthWrite: false }));
    });
  }, [], (lines) => lines.forEach(disposeObject));
  useFrame(() => {
    if (spinner.current) spinner.current.rotation.y = t.current * 1.6;
  });
  return (
    <group>
      <Glow color="#818CF8" size={2.2} power={3} opacity={0.45} z={-0.8} />
      <group ref={spinner}>
        <group rotation={[0, 0, 0.5]}>
          {fieldLines.map((l, i) => (
            <primitive key={i} object={l} />
          ))}
          {[1, -1].map((s) => (
            <mesh key={s} position={[0, s * 1.6, 0]} rotation={[s > 0 ? Math.PI : 0, 0, 0]}>
              <coneGeometry args={[0.32, 2.6, 32, 1, true]} />
              <meshBasicMaterial color="#C7D2FE" transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
        <mesh>
          <sphereGeometry args={[0.5, 64, 32]} />
          <meshStandardMaterial color="#A5B4FC" emissive="#4F46E5" emissiveIntensity={0.35} roughness={0.45} metalness={0.1} />
        </mesh>
      </group>
      <FresnelShell color="#A5B4FC" radius={0.52} power={2.5} intensity={0.7} />
    </group>
  );
}

// ------------------------------------------------------------- Solar System

const PLANETS: { a: number; color: string; size: number }[] = [
  { a: 0.387, color: '#A8A29E', size: 3 },
  { a: 0.723, color: '#FDE68A', size: 4 },
  { a: 1.0, color: '#60A5FA', size: 4 },
  { a: 1.524, color: '#F87171', size: 3.5 },
  { a: 5.203, color: '#FDBA74', size: 7 },
  { a: 9.537, color: '#FCD34D', size: 6 },
  { a: 19.19, color: '#67E8F9', size: 5 },
  { a: 30.07, color: '#818CF8', size: 5 },
];

/** A disc whose on-screen size stays `px` pixels however the scene is scaled. */
function Dot({ color, px, glow = false }: { color: string; px: number; glow?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const env = useVisualEnv();
  useFrame(() => {
    if (ref.current) ref.current.scale.setScalar(px / Math.max(1e-6, env.px.current));
  });
  return (
    <group ref={ref}>
      {glow && <Glow color={color} size={4} power={2} opacity={0.7} />}
      <mesh>
        <circleGeometry args={[0.5, 20]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

export function SolarSystem() {
  const t = useTime();
  const planets = useRef<(THREE.Group | null)[]>([]);
  const belt = useMemo(() => {
    const r = rng(17);
    const n = 1500;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = (2.2 + r() * 1.1) / 30.07 / 2, ang = r() * Math.PI * 2;
      pos.set([Math.cos(ang) * a, (r() - 0.5) * 0.002, Math.sin(ang) * a], i * 3);
      col.set([0.6, 0.55, 0.5], i * 3);
      size[i] = 1.2;
    }
    return { pos, col, size };
  }, []);
  const phases = useMemo(() => PLANETS.map((_, i) => i * 2.39), []);
  useFrame(() => {
    planets.current.forEach((g, i) => {
      if (!g) return;
      const p = PLANETS[i];
      const ang = phases[i] + (t.current * 0.6) / Math.pow(p.a, 1.5);
      const r = p.a / 30.07 / 2;
      g.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
    });
  });
  // Rotate the dots back to face the camera after tilting the plane.
  return (
    <group rotation={[1.1, 0, 0]}>
      {PLANETS.map((p) => (
        <Ring key={p.a} radius={p.a / 30.07 / 2} color={p.color} opacity={0.35} />
      ))}
      <PointCloud positions={belt.pos} colors={belt.col} sizes={belt.size} opacity={0.5} />
      <group rotation={[-1.1, 0, 0]}>
        <Dot color="#FDE68A" px={7} glow />
      </group>
      {PLANETS.map((p, i) => (
        <group key={p.a} ref={(g) => { planets.current[i] = g; }}>
          <group rotation={[-1.1, 0, 0]}>
            <Dot color={p.color} px={p.size} />
          </group>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------- Cat's Eye Nebula

export function CatsEye() {
  const spin = useSpin(0.05, 'z');
  const cloud = useMemo(() => {
    const r = rng(31);
    const pos: number[] = [], col: number[] = [], size: number[] = [];
    const c = new THREE.Color();
    const push = (v: THREE.Vector3, color: string, s: number, jitter = 0.4) => {
      pos.push(v.x, v.y, v.z);
      c.set(color).offsetHSL((r() - 0.5) * 0.05, 0, (r() - 0.5) * jitter * 0.3);
      col.push(c.r, c.g, c.b);
      size.push(s);
    };
    const randDir = () => new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize();
    // Faint concentric rings of the outer halo
    for (let k = 0; k < 9; k++) {
      const rad = 0.2 + k * 0.034;
      for (let i = 0; i < 900; i++) push(randDir().multiplyScalar(rad + (r() - 0.5) * 0.008), '#0891B2', 2);
    }
    // Two overlapping prolate shells at different angles
    const shell = (ax: number, ay: number, az: number, a: number, b: number, color: string, n: number) => {
      const e = new THREE.Euler(0, 0, az);
      for (let i = 0; i < n; i++) {
        const d = randDir();
        const v = new THREE.Vector3(d.x * a, d.y * b, d.z * a).multiplyScalar(0.94 + r() * 0.1).applyEuler(e);
        v.x += ax; v.y += ay;
        push(v, color, 2.2);
      }
    };
    shell(0, 0, 0.5, 0.1, 0.18, '#5EEAD4', 7000);
    shell(0, 0, -0.35, 0.125, 0.16, '#22D3EE', 6000);
    // Bipolar jets ending in knots
    for (const s of [1, -1]) {
      for (let i = 0; i < 1500; i++) {
        const tt = r();
        const v = new THREE.Vector3((r() - 0.5) * 0.04 * (1 + tt), s * (0.12 + tt * 0.2), (r() - 0.5) * 0.04).applyEuler(new THREE.Euler(0, 0, 0.35));
        push(v, tt > 0.85 ? '#F87171' : '#FB923C', 2.6);
      }
    }
    return { pos: new Float32Array(pos), col: new Float32Array(col), size: new Float32Array(size) };
  }, []);
  return (
    <group>
      <group ref={spin}>
        <PointCloud positions={cloud.pos} colors={cloud.col} sizes={cloud.size} opacity={0.75} />
      </group>
      <Glow color="#ECFEFF" size={0.08} power={2} />
      <Glow color="#22D3EE" size={0.8} power={3} opacity={0.5} />
    </group>
  );
}

// ------------------------------------------------------------ One light-year

export function LightYear() {
  const t = useTime();
  const env = useVisualEnv();
  const pulse = useRef<THREE.Group>(null);
  const bar = useRef<THREE.Group>(null);
  useFrame(() => {
    if (pulse.current) pulse.current.position.x = -0.5 + ((t.current / 6) % 1);
    // Keep the ruler legible at any zoom: line 2 px, ticks 6–12 px tall.
    if (bar.current) bar.current.scale.y = 1 / Math.max(1e-6, env.px.current);
  });
  return (
    <group>
      <group ref={bar}>
        <mesh>
          <planeGeometry args={[1, 2]} />
          <meshBasicMaterial color="#F472B6" transparent opacity={0.9} />
        </mesh>
        {Array.from({ length: 13 }, (_, i) => (
          <mesh key={i} position={[-0.5 + i / 12, 0, 0]}>
            <planeGeometry args={[0.0025, i % 3 === 0 ? 14 : 7]} />
            <meshBasicMaterial color="#FBCFE8" transparent opacity={0.8} />
          </mesh>
        ))}
      </group>
      <group position={[-0.5, 0, 0]}>
        <Dot color="#FDE68A" px={8} glow />
      </group>
      <group position={[0.5, 0, 0]}>
        <Dot color="#F9A8D4" px={5} />
      </group>
      <group ref={pulse}>
        <Dot color="#FFFFFF" px={6} glow />
      </group>
    </group>
  );
}

// ----------------------------------------------------------------- Galaxies

/**
 * Barred spiral as a point cloud, diameter 1 in the XZ plane. Arms follow
 * logarithmic spirals θ = θ₀ + ln(r / r₀) / tan(pitch); stars scatter less
 * near the arm crest, with pink star-forming knots along the arms.
 */
export function spiralGalaxy(seed: number, n: number, opts: { arms?: number; pitchDeg?: number; bar?: number; spread?: number } = {}) {
  const r = rng(seed);
  const arms = opts.arms ?? 2;
  const bar = opts.bar ?? 0.08;
  const spread = opts.spread ?? 0.028;
  const k = 1 / Math.tan(((opts.pitchDeg ?? 13) * Math.PI) / 180);
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n);
  const core = new THREE.Color('#FDE68A'), arm = new THREE.Color('#BFDBFE'), disk = new THREE.Color('#A5B4FC'), hii = new THREE.Color('#F9A8D4'), c = new THREE.Color();
  const gauss = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
  for (let i = 0; i < n; i++) {
    const kind = r();
    let x: number, y: number, z: number, s = 1 + r() * 1.4;
    if (kind < 0.14) {
      // bulge
      const d = new THREE.Vector3(gauss(), gauss() * 0.55, gauss()).multiplyScalar(0.035);
      ({ x, y, z } = d);
      c.copy(core);
      s += 0.6;
    } else if (kind < 0.2) {
      // bar
      x = (r() * 2 - 1) * bar * 1.3;
      z = gauss() * 0.014;
      y = gauss() * 0.006;
      c.copy(core).lerp(arm, 0.25);
    } else if (kind < 0.34) {
      // smooth disc between the arms
      const rad = Math.min(0.5, -Math.log(r() + 1e-9) * 0.13);
      const t = r() * Math.PI * 2;
      x = Math.cos(t) * rad;
      z = Math.sin(t) * rad;
      y = gauss() * 0.006;
      c.copy(disk).multiplyScalar(0.55);
      s *= 0.8;
    } else {
      const a = Math.floor(r() * arms);
      const rad = bar + (0.5 - bar) * Math.pow(r(), 0.85);
      const theta = (a * Math.PI * 2) / arms + k * Math.log(rad / bar);
      const off = gauss() * spread * (0.6 + rad);
      x = Math.cos(theta) * rad - Math.sin(theta) * off;
      z = Math.sin(theta) * rad + Math.cos(theta) * off;
      y = gauss() * 0.005;
      c.copy(core).lerp(arm, Math.min(1, (rad - bar) * 3));
      if (r() < 0.05 && Math.abs(off) < spread * 0.6) {
        c.copy(hii);
        s += 1.2;
      }
    }
    pos.set([x, y, z], i * 3);
    c.toArray(col, i * 3);
    size[i] = s;
  }
  return { pos, col, size };
}

export function MilkyWay() {
  const spin = useSpin(0.03);
  const g = useMemo(() => spiralGalaxy(41, 60000, { arms: 2, pitchDeg: 12.5 }), []);
  return (
    <group rotation={[0.55, 0, 0.15]}>
      <group ref={spin}>
        <PointCloud positions={g.pos} colors={g.col} sizes={g.size} opacity={0.75} />
      </group>
      <group rotation={[-0.55, 0, 0]}>
        <Glow color="#FDE68A" size={0.22} power={2.2} opacity={0.7} />
      </group>
    </group>
  );
}

const GALAXY_ENLARGE = 4; // see the Local Group description

export function LocalGroup() {
  const spin = useSpin(0.02);
  const { dwarfs, mw, m31, m33 } = useMemo(() => {
    const r = rng(52);
    const n = 90;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n);
    const centres = [new THREE.Vector3(-0.12, 0, 0), new THREE.Vector3(0.13, 0.02, 0.03)];
    for (let i = 0; i < n; i++) {
      const near = r() < 0.75;
      const ctr = centres[i % 2];
      const v = near
        ? new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(0.015 + r() * 0.06).add(ctr)
        : new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(0.1 + Math.cbrt(r()) * 0.38);
      v.toArray(pos, i * 3);
      new THREE.Color().setHSL(0.6 + r() * 0.1, 0.5, 0.75 + r() * 0.2).toArray(col, i * 3);
      size[i] = 3 + r() * 4;
    }
    return {
      dwarfs: { pos, col, size },
      mw: spiralGalaxy(61, 6000, { arms: 2, pitchDeg: 12.5 }),
      m31: spiralGalaxy(62, 9000, { arms: 2, pitchDeg: 9 }),
      m33: spiralGalaxy(63, 3000, { arms: 2, pitchDeg: 20, bar: 0.04 }),
    };
  }, []);
  // True diameters relative to the 10 Mly group: MW 0.01, M31 0.022, M33 0.006 (drawn ×4).
  const E = GALAXY_ENLARGE;
  return (
    <group rotation={[0.9, 0, 0]}>
      <group ref={spin}>
        <PointCloud positions={dwarfs.pos} colors={dwarfs.col} sizes={dwarfs.size} opacity={0.9} />
        <group position={[-0.12, 0, 0]} scale={0.01 * E} rotation={[-0.5, 0, 0.2]}>
          <PointCloud positions={mw.pos} colors={mw.col} sizes={mw.size} opacity={0.9} scaleMax={1} />
          <Glow color="#C4B5FD" size={1.4} power={2} opacity={0.5} />
        </group>
        <group position={[0.13, 0.02, 0.03]} scale={0.022 * E} rotation={[0.7, 0, 0.4]}>
          <PointCloud positions={m31.pos} colors={m31.col} sizes={m31.size} opacity={0.9} scaleMax={1} />
          <Glow color="#FDE68A" size={1.2} power={2} opacity={0.45} />
        </group>
        <group position={[0.2, -0.05, 0.08]} scale={0.006 * E} rotation={[-0.3, 0, 0.8]}>
          <PointCloud positions={m33.pos} colors={m33.col} sizes={m33.size} opacity={0.9} scaleMax={1} />
          <Glow color="#A5B4FC" size={1.4} power={2} opacity={0.5} />
        </group>
        {/* Magellanic Clouds beside the Milky Way */}
        <group position={[-0.095, -0.012, 0.01]}>
          <Glow color="#E0E7FF" size={0.012} power={2} opacity={0.8} />
        </group>
        <group position={[-0.1, -0.02, -0.005]}>
          <Glow color="#E0E7FF" size={0.008} power={2} opacity={0.7} />
        </group>
      </group>
      <group rotation={[-0.9, 0, 0]}>
        <Glow color="#6366F1" size={1.1} power={2.5} opacity={0.22} />
        <group rotation={[Math.PI / 2, 0, 0]}>
          <Ring radius={0.5} color="#818CF8" opacity={0.35} />
        </group>
      </group>
    </group>
  );
}

// ---------------------------------------------------- Observable universe

const cmbFrag = /* glsl */ `
uniform float uTime;
varying vec3 vP; varying vec3 vN;
float h(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec3 p) {
  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h(i), h(i + vec3(1,0,0)), f.x), mix(h(i + vec3(0,1,0)), h(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h(i + vec3(0,0,1)), h(i + vec3(1,0,1)), f.x), mix(h(i + vec3(0,1,1)), h(i + vec3(1,1,1)), f.x), f.y), f.z);
}
void main() {
  vec3 p = normalize(vP) * 6.0;
  float n = noise(p) * 0.5 + noise(p * 2.1) * 0.3 + noise(p * 4.3) * 0.2;
  vec3 cold = vec3(0.05, 0.15, 0.6), mid = vec3(0.3, 0.9, 0.6), hot = vec3(1.0, 0.35, 0.1);
  vec3 col = n < 0.5 ? mix(cold, mid, n * 2.0) : mix(mid, hot, (n - 0.5) * 2.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function UniverseFallback() {
  const spin = useSpin(0.05);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  return (
    <group>
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[0.5, 96, 48]} />
          <shaderMaterial vertexShader={starVert} fragmentShader={cmbFrag} uniforms={uniforms} />
        </mesh>
      </group>
      <FresnelShell color="#F8FAFC" radius={0.51} power={3} intensity={0.6} />
    </group>
  );
}
