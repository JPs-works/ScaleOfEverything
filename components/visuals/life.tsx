import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PointCloud, rng, useDisposable, useSpin } from './common';

// ------------------------------------------------- Virus fallbacks (procedural)

/** Icosahedral capsid; also the fallback if the rhinovirus model fails. */
export function Capsid({ color = '#F87171' }: { color?: string }) {
  const spin = useSpin(0.2);
  const geom = useDisposable(() => {
    const g = new THREE.IcosahedronGeometry(0.5, 2); // already non-indexed
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const cols = new Float32Array(pos.count * 3);
    const r = rng(21);
    const palette = ['#F87171', '#FB923C', '#FCA5A5', '#F472B6'].map((c) => new THREE.Color(c));
    for (let f = 0; f < pos.count / 3; f++) {
      const c = palette[Math.floor(r() * palette.length)];
      for (let k = 0; k < 3; k++) c.toArray(cols, (f * 3 + k) * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group ref={spin}>
      <mesh geometry={geom}>
        <meshStandardMaterial vertexColors flatShading roughness={0.6} color={color} />
      </mesh>
    </group>
  );
}

/** Enveloped virus with club-shaped spikes; fallback for the SARS-CoV-2 model. */
export function SpikyVirus() {
  const spin = useSpin(0.2);
  const spikes = useMemo(() => {
    const n = 90;
    const list: { p: THREE.Vector3; q: THREE.Quaternion }[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const rr = Math.sqrt(1 - y * y);
      const d = new THREE.Vector3(Math.cos(golden * i) * rr, y, Math.sin(golden * i) * rr);
      list.push({ p: d, q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d) });
    }
    return list;
  }, []);
  return (
    <group ref={spin}>
      <mesh>
        <icosahedronGeometry args={[0.5, 5]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.7} />
      </mesh>
      {spikes.map(({ p, q }, i) => (
        <group key={i} position={p.clone().multiplyScalar(0.5)} quaternion={q}>
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.016, 0.024, 0.14, 6]} />
            <meshStandardMaterial color="#EF4444" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.036, 10, 8]} />
            <meshStandardMaterial color="#F87171" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ------------------------------------------------------------ Mitochondrion

function capsuleProfile(length: number, radius: number, steps = 40) {
  const pts: THREE.Vector2[] = [];
  const flat = length / 2 - radius;
  for (let i = 0; i <= steps; i++) {
    const y = -length / 2 + (i / steps) * length;
    const d = Math.max(0, Math.abs(y) - flat);
    pts.push(new THREE.Vector2(Math.sqrt(Math.max(0, radius * radius - d * d)) + 1e-4, y));
  }
  return pts;
}

export function Mitochondrion() {
  const spin = useSpin(0.15, 'x');
  const outer = useDisposable(() => new THREE.LatheGeometry(capsuleProfile(1, 0.22), 64), []);
  const inner = useDisposable(() => new THREE.LatheGeometry(capsuleProfile(0.95, 0.195), 64), []);
  const cristae = useMemo(() => {
    const r = rng(4);
    return Array.from({ length: 11 }, (_, i) => ({
      y: -0.36 + (i / 10) * 0.72 + (r() - 0.5) * 0.03,
      side: i % 2 === 0 ? 1 : -1,
      depth: 0.11 + r() * 0.05,
      tilt: (r() - 0.5) * 0.3,
    }));
  }, []);
  const granules = useMemo(() => {
    const r = rng(8);
    const n = 260;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, rad = Math.sqrt(r()) * 0.17;
      pos.set([Math.cos(a) * rad, (r() - 0.5) * 0.8, Math.sin(a) * rad], i * 3);
      col.set([1, 0.85, 0.5], i * 3);
      size[i] = 2 + r() * 2;
    }
    return { pos, col, size };
  }, []);
  // Long axis is Y in the lathe; lay it along X.
  return (
    <group rotation={[0.7, -0.5, 0]}>
      <group ref={spin}>
        <group rotation={[0, 0, Math.PI / 2]}>
          <mesh geometry={outer}>
            <meshPhysicalMaterial color="#FDBA74" transparent opacity={0.3} roughness={0.4} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh geometry={inner}>
            <meshStandardMaterial color="#FB923C" transparent opacity={0.3} roughness={0.6} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          {cristae.map((c, i) => (
            <mesh key={i} position={[c.side * (0.19 - c.depth / 2), c.y, 0]} rotation={[0, 0, c.tilt]} scale={[c.depth / 2, 0.018, 0.15]}>
              <sphereGeometry args={[1, 24, 12]} />
              <meshStandardMaterial color="#EA580C" roughness={0.5} emissive="#7C2D12" emissiveIntensity={0.3} />
            </mesh>
          ))}
          <PointCloud positions={granules.pos} colors={granules.col} sizes={granules.size} opacity={0.5} />
        </group>
      </group>
    </group>
  );
}

// ------------------------------------------------------------ Red blood cell

export function RedBloodCell() {
  const spin = useSpin(0.25);
  const geom = useDisposable(() => {
    // Evans & Fung (1972) biconcave profile, µm: R = 3.91, C0 = 0.81, C2 = 7.83, C4 = −4.39
    const R = 3.91, C0 = 0.81, C2 = 7.83, C4 = -4.39;
    const D = 2 * R;
    const top: THREE.Vector2[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const rho = Math.sin((i / steps) * (Math.PI / 2)); // denser sampling at the rim
      const z = 0.5 * Math.sqrt(Math.max(0, 1 - rho * rho)) * (C0 + C2 * rho * rho + C4 * rho ** 4);
      top.push(new THREE.Vector2((rho * R) / D + 1e-4, z / D));
    }
    const pts = [...top, ...top.slice(0, -1).reverse().map((p) => new THREE.Vector2(p.x, -p.y))];
    // LatheGeometry wants the profile from bottom to top
    pts.reverse();
    const g = new THREE.LatheGeometry(pts, 96);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group rotation={[1.0, 0, 0.25]}>
      <group ref={spin}>
        <mesh geometry={geom}>
          <meshPhysicalMaterial color="#B91C1C" roughness={0.45} clearcoat={0.4} sheen={1} sheenColor="#FCA5A5" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

// ------------------------------------------------------------- Human hair

export function HumanHair() {
  // A cut strand: cuticle scales along the shaft, cross-section (cuticle,
  // cortex, medulla) visible at the cut end. The far end runs off the panel.
  const scales = useMemo(() => {
    const r = rng(12);
    return Array.from({ length: 10 }, (_, i) => ({ y: -2.1 + i * 0.3, rot: r() * Math.PI * 2, lean: (r() - 0.5) * 0.06 }));
  }, []);
  return (
    <group position={[0, -0.12, 0]} rotation={[0.3, 0.45, -Math.PI / 2 + 0.1]}>
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.47, 0.47, 3, 48, 1, true]} />
        <meshStandardMaterial color="#78350F" roughness={0.6} />
      </mesh>
      {scales.map((s, i) => (
        <mesh key={i} position={[0, s.y + 0.15, 0]} rotation={[s.lean, s.rot, s.lean]}>
          <cylinderGeometry args={[0.5, 0.475, 0.34, 48, 1, true]} />
          <meshStandardMaterial color="#B45309" roughness={0.45} metalness={0.05} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* cut end */}
      <group position={[0, 0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <circleGeometry args={[0.5, 48]} />
          <meshStandardMaterial color="#92400E" roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.002]}>
          <circleGeometry args={[0.4, 48]} />
          <meshStandardMaterial color="#C2410C" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.004]}>
          <circleGeometry args={[0.1, 24]} />
          <meshStandardMaterial color="#451A03" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

// ------------------------------------------------------- Grain of sand (fallback)

export function SandGrain() {
  const spin = useSpin(0.2);
  const geom = useDisposable(() => {
    const g = new THREE.IcosahedronGeometry(0.5, 4);
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = Math.sin(v.x * 9.1 + v.y * 3.3) * Math.cos(v.z * 7.7 - v.x * 2.1) * 0.08 + Math.sin(v.y * 21 + v.z * 17) * 0.015;
      v.multiplyScalar(1 + n).multiply(new THREE.Vector3(1, 0.72, 0.85));
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group ref={spin}>
      <mesh geometry={geom}>
        <meshStandardMaterial color="#E7C77A" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

// ----------------------------------------------------------- Ant (fallback)

export function AntFallback() {
  const spin = useSpin(0.2);
  const legs = useMemo(() => [-1, 0, 1].flatMap((k) => [1, -1].map((s) => ({ x: -0.06 + k * 0.07, s }))), []);
  return (
    <group ref={spin}>
      <group position={[0, 0.05, 0]}>
        <mesh position={[0.36, 0.03, 0]} scale={[0.1, 0.085, 0.085]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color="#451A03" roughness={0.4} />
        </mesh>
        <mesh position={[0.05, 0.02, 0]} scale={[0.17, 0.065, 0.06]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color="#78350F" roughness={0.4} />
        </mesh>
        <mesh position={[-0.3, 0.04, 0]} scale={[0.2, 0.13, 0.12]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color="#451A03" roughness={0.35} />
        </mesh>
        {legs.map((l, i) => (
          <mesh key={i} position={[l.x, -0.06, l.s * 0.12]} rotation={[l.s * 0.9, 0, (l.x - 0.0) * 2]}>
            <cylinderGeometry args={[0.008, 0.006, 0.3, 6]} />
            <meshStandardMaterial color="#451A03" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// --------------------------------------------------------------- Chicken egg

export function ChickenEgg() {
  const spin = useSpin(0.25);
  const geom = useDisposable(() => {
    // Hügelschäffer egg curve: length L = 1 (57 mm), breadth B = 44/57, asymmetry w.
    const L = 1, B = 44 / 57, w = 0.07;
    const pts: THREE.Vector2[] = [];
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const x = -L / 2 + (L * (1 - Math.cos((i / steps) * Math.PI))) / 2;
      const r = (B / 2) * Math.sqrt(Math.max(0, (L * L - 4 * x * x) / (L * L + 8 * w * x + 4 * w * w)));
      pts.push(new THREE.Vector2(r + 1e-4, x));
    }
    const g = new THREE.LatheGeometry(pts, 96);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group rotation={[0, 0, -0.2]}>
      <group ref={spin}>
        <mesh geometry={geom}>
          <meshPhysicalMaterial color="#F3E1C7" roughness={0.55} sheen={0.6} sheenColor="#FFF7ED" />
        </mesh>
      </group>
    </group>
  );
}

// --------------------------------------------------------- Human (fallback)

export function HumanFallback() {
  const spin = useSpin(0.25);
  const m = <meshStandardMaterial color="#60A5FA" roughness={0.5} />;
  return (
    <group ref={spin}>
      <mesh position={[0, 0.43, 0]}>
        <sphereGeometry args={[0.065, 24, 16]} />
        {m}
      </mesh>
      <mesh position={[0, 0.17, 0]}>
        <capsuleGeometry args={[0.09, 0.26, 6, 16]} />
        {m}
      </mesh>
      {[-1, 1].map((s) => (
        <React.Fragment key={s}>
          <mesh position={[s * 0.055, -0.25, 0]}>
            <capsuleGeometry args={[0.045, 0.42, 6, 12]} />
            {m}
          </mesh>
          <mesh position={[s * 0.14, 0.13, 0]} rotation={[0, 0, s * 0.12]}>
            <capsuleGeometry args={[0.03, 0.34, 6, 12]} />
            {m}
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
}

// ---------------------------------------------------------- Whale (fallback)

export function WhaleFallback() {
  const spin = useSpin(0.2);
  const body = useDisposable(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40; // 0 = tail, 1 = snout
      const r = 0.085 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.7)), 0.8) + 0.004;
      pts.push(new THREE.Vector2(r, -0.46 + t * 0.92));
    }
    return new THREE.LatheGeometry(pts, 48);
  }, []);
  return (
    <group ref={spin}>
      <group rotation={[0, 0, -Math.PI / 2]}>
        <mesh geometry={body} scale={[1, 1, 0.85]}>
          <meshStandardMaterial color="#334155" roughness={0.55} />
        </mesh>
      </group>
      <mesh position={[-0.47, 0, 0]} scale={[0.04, 0.01, 0.16]}>
        <sphereGeometry args={[1, 16, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.15, -0.05, s * 0.08]} rotation={[s * 0.6, 0, 0.3]} scale={[0.06, 0.008, 0.025]}>
          <sphereGeometry args={[1, 16, 8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      ))}
    </group>
  );
}
