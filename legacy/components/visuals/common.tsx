import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Every visual is authored in "unit space": the dimension that the item's
 * `size` measures spans exactly 1 unit, centred on the origin. The panel
 * scales the whole group to pixels. `px` (a ref, updated every frame) is the
 * on-screen size of that unit, for things like point sizes that do not scale
 * with the group.
 */
export interface VisualEnv {
  px: { current: number };
  reduced: boolean;
  /** True while the item is shown as a magnified edge: rotations pause. */
  frozen: { current: boolean };
}

export const VisualContext = createContext<VisualEnv>({ px: { current: 300 }, reduced: false, frozen: { current: false } });
export const useVisualEnv = () => useContext(VisualContext);

/**
 * useMemo for GPU resources: the value is disposed when the component
 * unmounts (R3F only auto-disposes objects it created from JSX, not ones
 * passed in as props or via <primitive>). Disposed geometry is re-uploaded
 * automatically if it is drawn again, so StrictMode's double effects are safe.
 */
export function useDisposable<T>(factory: () => T, deps: React.DependencyList, dispose: (v: T) => void = (v) => (v as { dispose(): void }).dispose()): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const v = useMemo(factory, deps);
  useEffect(() => () => dispose(v), [v]); // eslint-disable-line react-hooks/exhaustive-deps
  return v;
}

/** Dispose every geometry and material under an object (for <primitive> objects). */
export function disposeObject(o: THREE.Object3D) {
  o.traverse((c) => {
    const m = c as THREE.Mesh;
    m.geometry?.dispose();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
    (c as THREE.InstancedMesh).isInstancedMesh && (c as THREE.InstancedMesh).dispose();
  });
}

/** Deterministic PRNG so procedural scenes look the same on every load. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rotate a group about an axis each frame (skipped with reduced motion). */
export function useSpin(speed = 0.15, axis: 'x' | 'y' | 'z' = 'y') {
  const ref = useRef<THREE.Group>(null);
  const { reduced, frozen } = useVisualEnv();
  useFrame((_, dt) => {
    if (!reduced && !frozen.current && ref.current) ref.current.rotation[axis] += dt * speed;
  });
  return ref;
}

/** Elapsed time that stands still with reduced motion. */
export function useTime() {
  const t = useRef(0);
  const { reduced } = useVisualEnv();
  useFrame((_, dt) => {
    if (!reduced) t.current += dt;
  });
  return t;
}

const glowVert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const glowFrag = /* glsl */ `
uniform vec3 uColor; uniform float uPower; uniform float uOpacity;
varying vec2 vUv;
void main() {
  float r = length(vUv - 0.5) * 2.0;
  float a = pow(clamp(1.0 - r, 0.0, 1.0), uPower) * uOpacity;
  gl_FragColor = vec4(uColor * a, a);
}
`;

/** Soft additive radial glow on a camera-facing quad (the ortho camera looks down -Z). */
export function Glow({ color, size = 1, power = 2, opacity = 1, z = 0 }: { color: string; size?: number; power?: number; opacity?: number; z?: number }) {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(color) }, uPower: { value: power }, uOpacity: { value: opacity } }),
    [color, power, opacity],
  );
  return (
    <mesh position={[0, 0, z]} renderOrder={2}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        vertexShader={glowVert}
        fragmentShader={glowFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

const fresnelVert = /* glsl */ `
varying vec3 vN; varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;
const fresnelFrag = /* glsl */ `
uniform vec3 uColor; uniform float uPower; uniform float uIntensity;
varying vec3 vN; varying vec3 vV;
void main() {
  // Ortho camera: view direction is +Z in view space.
  float f = pow(1.0 - abs(dot(normalize(vN), vec3(0.0, 0.0, 1.0))), uPower) * uIntensity;
  gl_FragColor = vec4(uColor * f, f);
}
`;

/** Rim-light shell, e.g. an atmosphere or a membrane edge. */
export function FresnelShell({ color, radius = 0.5, power = 3, intensity = 1, segments = 64 }: { color: string; radius?: number; power?: number; intensity?: number; segments?: number }) {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(color) }, uPower: { value: power }, uIntensity: { value: intensity } }),
    [color, power, intensity],
  );
  return (
    <mesh renderOrder={1}>
      <sphereGeometry args={[radius, segments, segments / 2]} />
      <shaderMaterial
        vertexShader={fresnelVert}
        fragmentShader={fresnelFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

const pointsVert = /* glsl */ `
attribute float aSize; attribute vec3 aColor;
uniform float uScale;
varying vec3 vColor;
void main() {
  vColor = aColor;
  gl_PointSize = max(1.0, aSize * uScale);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const pointsFrag = /* glsl */ `
uniform float uOpacity;
varying vec3 vColor;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.0, r) * uOpacity;
  gl_FragColor = vec4(vColor * a, a);
}
`;

/**
 * Additive point cloud. `sizes` are point diameters in CSS px when the visual
 * is 500 px across; they grow/shrink gently with the visual (clamped) so a
 * distant galaxy never becomes a blob of giant points.
 */
export function PointCloud({ positions, colors, sizes, opacity = 1, scaleMax = 1.8 }: { positions: Float32Array; colors: Float32Array; sizes: Float32Array; opacity?: number; scaleMax?: number }) {
  const { px } = useVisualEnv();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uScale: { value: 1 }, uOpacity: { value: opacity } }), [opacity]);
  const dpr = typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1;
  useFrame(() => {
    if (mat.current) mat.current.uniforms.uScale.value = Math.min(scaleMax, Math.max(0.7, px.current / 500)) * dpr;
  });
  const geom = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    return g;
  }, [positions, colors, sizes]);
  return (
    <points geometry={geom} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={pointsVert}
        fragmentShader={pointsFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Tube along a list of points (used for gluon strings, DNA backbones, field lines…). */
export function Tube({ points, radius, color, emissive, closed = false, segments = 64, opacity = 1 }: { points: THREE.Vector3[]; radius: number; color: string; emissive?: number; closed?: boolean; segments?: number; opacity?: number }) {
  const geom = useDisposable(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, closed), segments, radius, 8, closed), [points, radius, closed, segments]);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissive ?? 0}
        roughness={0.4}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}

/** A thin ring (orbit) in the XZ plane, drawn as a line loop. */
export function Ring({ radius, color, opacity = 0.5, segments = 256 }: { radius: number; color: string; opacity?: number; segments?: number }) {
  const loop = useDisposable(() => {
    const pts: number[] = [];
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      pts.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
  }, [radius, segments, color, opacity], disposeObject);
  return <primitive object={loop} />;
}

export const tmpColor = new THREE.Color();
