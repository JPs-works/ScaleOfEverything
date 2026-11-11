import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Tube, useDisposable, useSpin } from './common';

// --------------------------------------------------- Eiffel Tower (fallback)

export function EiffelFallback() {
  const spin = useSpin(0.2);
  const { legs, decks } = useMemo(() => {
    // Half-width of the tower at height y (0..1): the famous exponential flare.
    const hw = (y: number) => 0.012 + 0.205 * Math.pow(1 - y, 2.8);
    const legs = [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sz]) =>
      Array.from({ length: 30 }, (_, i) => {
        const y = (i / 29) * 0.9;
        return new THREE.Vector3(sx * hw(y), y - 0.5, sz * hw(y));
      }),
    );
    const decks = [0.175, 0.35, 0.84].map((y) => ({ y: y - 0.5, w: hw(y) * 2 + 0.02 }));
    return { legs, decks };
  }, []);
  const mat = <meshStandardMaterial color="#8B7355" roughness={0.6} metalness={0.3} />;
  return (
    <group ref={spin}>
      {legs.map((p, i) => (
        <Tube key={i} points={p} radius={0.009} color="#8B7355" segments={40} />
      ))}
      {decks.map((d, i) => (
        <mesh key={i} position={[0, d.y, 0]}>
          <boxGeometry args={[d.w, 0.012, d.w]} />
          {mat}
        </mesh>
      ))}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.003, 0.008, 0.1, 6]} />
        {mat}
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------- Burj Khalifa

export function BurjKhalifa() {
  const spin = useSpin(0.2);
  const segments = useMemo(() => {
    // Three wings in a Y plan; each steps back in turn so the setbacks spiral
    // upwards. Occupied floors reach ~0.71 of the 828 m height, the spire the rest.
    const out: { pos: [number, number, number]; size: [number, number, number]; rotY: number }[] = [];
    const tiers = 9;
    const top = 0.71;
    for (let w = 0; w < 3; w++) {
      const angle = (w * Math.PI * 2) / 3;
      for (let t = 0; t < tiers; t++) {
        const y0 = 0;
        const y1 = top * ((t + 1 + w / 3) / (tiers + 1));
        const len = 0.105 * (1 - t / (tiers + 0.5));
        out.push({
          pos: [Math.cos(angle) * (len / 2 + 0.012), (y0 + y1) / 2 - 0.5, -Math.sin(angle) * (len / 2 + 0.012)],
          size: [len, y1 - y0, 0.034 * (1 - t / 22)],
          rotY: angle,
        });
      }
    }
    return out;
  }, []);
  return (
    <group ref={spin}>
      {segments.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={[0, s.rotY, 0]}>
          <boxGeometry args={s.size} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.22} />
        </mesh>
      ))}
      {/* central core and spire */}
      <mesh position={[0, 0.39 - 0.5, 0]}>
        <cylinderGeometry args={[0.022, 0.034, 0.78, 6]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.89 - 0.5, 0]}>
        <cylinderGeometry args={[0.002, 0.016, 0.22, 8]} />
        <meshStandardMaterial color="#F1F5F9" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ------------------------------------------------------------- Mount Everest

function fbm(x: number, z: number) {
  // Cheap deterministic ridged noise from layered sines (no dependency).
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < 6; i++) {
    const n = Math.sin(x * f * 3.1 + i * 1.7) * Math.cos(z * f * 2.7 - i * 2.3) + Math.sin((x + z) * f * 1.9 + i);
    v += a * (1 - Math.abs(n * 0.5));
    a *= 0.5;
    f *= 2.03;
  }
  return v;
}

export function MountEverest() {
  const spin = useSpin(0.1);
  const geom = useDisposable(() => {
    const size = 2.6, seg = 180;
    const g = new THREE.PlaneGeometry(size, size, seg, seg);
    g.rotateX(-Math.PI / 2);
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const cols = new Float32Array(pos.count * 4);
    const rock = new THREE.Color('#57534E'), dark = new THREE.Color('#292524'), snow = new THREE.Color('#F8FAFC'), bg = new THREE.Color('#0B0C15'), c = new THREE.Color();
    let maxH = 0;
    const hs: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const r = Math.hypot(x, z);
      const massif = Math.exp(-(r * r) / 0.28) + 0.45 * Math.exp(-((x - 0.45) ** 2 + (z + 0.25) ** 2) / 0.08) + 0.35 * Math.exp(-((x + 0.5) ** 2 + (z - 0.35) ** 2) / 0.1);
      const edge = Math.max(0, 1 - (r / (size / 2)) ** 2);
      const h = (massif * 0.85 + fbm(x, z) * 0.22 * (0.3 + massif)) * edge;
      hs.push(h);
      maxH = Math.max(maxH, h);
    }
    for (let i = 0; i < pos.count; i++) {
      const h = hs[i] / maxH; // peak = 1 unit = 8,849 m
      pos.setY(i, h - 0.5);
      c.copy(dark).lerp(rock, Math.min(1, h * 2.2));
      if (h > 0.55) c.lerp(snow, Math.min(1, (h - 0.55) * 4));
      // Fade the ground out (alpha) towards a round footprint: no slab edge.
      const rr = Math.hypot(pos.getX(i), pos.getZ(i)) / (size / 2);
      const fade = Math.min(1, Math.max(0, (rr - 0.32) / 0.4));
      c.lerp(bg, fade * 0.6);
      cols.set([c.r, c.g, c.b, 1 - fade], i * 4);
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 4));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group rotation={[0.45, 0, 0]}>
      <group ref={spin}>
        <mesh geometry={geom}>
          <meshStandardMaterial vertexColors transparent roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
