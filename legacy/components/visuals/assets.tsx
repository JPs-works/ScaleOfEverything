import React, { useEffect, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { MeshoptDecoder } from 'meshoptimizer/decoder';
import { FresnelShell, Glow, useSpin, useVisualEnv } from './common';

// Use the decoder that matches the encoder in scripts/process-assets.ts.
const withMeshopt = (loader: GLTFLoader) => {
  loader.setMeshoptDecoder(MeshoptDecoder);
};

/**
 * A processed GLB (already centred and unit-sized). The cached scene is
 * cloned per panel, so the same model can be shown on both sides at once.
 * Must be rendered inside Suspense + an error boundary: useLoader throws on 404.
 */
const tuned = new WeakSet<object>();

export const clearGlb = (url: string) => useLoader.clear(GLTFLoader, url);
export const clearTexture = (url: string) => useLoader.clear(THREE.TextureLoader, url);

export function GlbModel({ url, spin = 0.2, tune }: { url: string; spin?: number; tune?: (root: THREE.Object3D) => void }) {
  const gltf = useLoader(GLTFLoader, url, withMeshopt);
  const { reduced } = useVisualEnv();
  const group = useSpin(spin);
  const { scene, mixer } = useMemo(() => {
    // Per-item material tweaks, applied once to the cached original.
    if (tune && !tuned.has(gltf.scene)) {
      tune(gltf.scene);
      tuned.add(gltf.scene);
    }
    const scene = cloneSkinned(gltf.scene);
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.frustumCulled = false; // skinned bounds are unreliable once scaled to pixels
      if (!mesh.geometry.getAttribute('normal')) mesh.geometry.computeVertexNormals();
    });
    let mixer: THREE.AnimationMixer | null = null;
    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(scene);
      mixer.clipAction(gltf.animations[0]).play();
    }
    return { scene, mixer };
  }, [gltf]);
  useEffect(
    () => () => {
      // Geometry/materials/textures belong to the loader cache and are shared;
      // only the per-clone skeletons (bone textures) and mixer are ours to free.
      mixer?.stopAllAction();
      mixer?.uncacheRoot(scene);
      scene.traverse((o) => (o as THREE.SkinnedMesh).isSkinnedMesh && (o as THREE.SkinnedMesh).skeleton.dispose());
    },
    [mixer, scene],
  );
  useFrame((_, dt) => {
    if (mixer && !reduced) mixer.update(dt);
  });
  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

export type SphereStyle = 'planet' | 'earth' | 'jupiter' | 'sun' | 'cmb';

/** Equirectangular map on a unit-diameter sphere, with per-body touches. */
export function TexturedSphere({ url, style }: { url: string; style: SphereStyle }) {
  const tex = useLoader(THREE.TextureLoader, url);
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  }, [tex]);
  const spin = useSpin(style === 'cmb' ? 0.04 : 0.12);
  const emissive = style === 'sun' || style === 'cmb';
  return (
    <group rotation={[0, 0, style === 'earth' ? -0.41 : 0]}>
      {style === 'sun' && <Glow color="#FDBA74" size={1.9} power={2.2} opacity={0.9} z={-0.6} />}
      <group ref={spin} scale={style === 'jupiter' ? [1, 0.935, 1] : 1}>
        <mesh>
          <sphereGeometry args={[0.5, 128, 64]} />
          {emissive ? (
            <meshBasicMaterial map={tex} toneMapped={false} color={style === 'sun' ? '#FFE8B0' : '#FFFFFF'} />
          ) : (
            <meshStandardMaterial map={tex} roughness={0.9} metalness={0} />
          )}
        </mesh>
      </group>
      {style === 'earth' && <FresnelShell color="#60A5FA" radius={0.512} power={3.5} intensity={1.4} />}
      {style === 'cmb' && <FresnelShell color="#F8FAFC" radius={0.505} power={3} intensity={0.5} />}
      {style === 'sun' && <FresnelShell color="#FDE68A" radius={0.505} power={2} intensity={0.8} />}
    </group>
  );
}
