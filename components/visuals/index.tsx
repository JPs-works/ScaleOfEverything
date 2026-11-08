import React from 'react';
import type { ScaleItem } from '../../types';
import { assetHref } from '../../utils/assets';
import * as THREE from 'three';
import { GlbModel, TexturedSphere, SphereStyle, clearGlb, clearTexture } from './assets';
import { DnaHelix, HydrogenAtom, Neutrino, PlanckFoam, Proton, UraniumNucleus, WaterMolecule } from './quantum';
import { AntFallback, Capsid, ChickenEgg, HumanFallback, HumanHair, Mitochondrion, RedBloodCell, SandGrain, SpikyVirus, WhaleFallback } from './life';
import { BurjKhalifa, EiffelFallback, MountEverest } from './structures';
import { CatsEye, LightYear, LocalGroup, MilkyWay, NeutronStar, PlanetFallback, SolarSystem, Stephenson, SunFallback, UniverseFallback } from './space';

/**
 * The procedural scene for each item. For items with an asset this is also
 * what shows if the asset fails to load, so no panel is ever blank.
 */
export const PROCEDURAL: Record<string, React.FC> = {
  planck: PlanckFoam,
  neutrino: Neutrino,
  proton: Proton,
  'uranium-nucleus': UraniumNucleus,
  'hydrogen-atom': HydrogenAtom,
  'water-molecule': WaterMolecule,
  'dna-width': DnaHelix,
  rhinovirus: () => <Capsid />,
  coronavirus: SpikyVirus,
  mitochondrion: Mitochondrion,
  'red-blood-cell': RedBloodCell,
  'human-hair': HumanHair,
  'grain-sand': SandGrain,
  ant: AntFallback,
  'chicken-egg': ChickenEgg,
  human: HumanFallback,
  'blue-whale': WhaleFallback,
  'eiffel-tower': EiffelFallback,
  'burj-khalifa': BurjKhalifa,
  'mount-everest': MountEverest,
  'neutron-star': NeutronStar,
  moon: () => <PlanetFallback color="#9CA3AF" />,
  earth: () => <PlanetFallback color="#2563EB" atmosphere="#60A5FA" />,
  jupiter: () => <PlanetFallback color="#D97706" bands />,
  sun: SunFallback,
  'stephenson-2-18': Stephenson,
  'solar-system': SolarSystem,
  'cat-eye-nebula': CatsEye,
  'one-light-year': LightYear,
  'milky-way': MilkyWay,
  'local-group': LocalGroup,
  'observable-universe': UniverseFallback,
};

const SPHERE_STYLE: Record<string, SphereStyle> = {
  earth: 'earth',
  jupiter: 'jupiter',
  sun: 'sun',
  'observable-universe': 'cmb',
};

export function ProceduralVisual({ item }: { item: ScaleItem }) {
  const C = Object.hasOwn(PROCEDURAL, item.id) ? PROCEDURAL[item.id] : () => <PlanetFallback color={item.color} />;
  return <C />;
}

const eachMaterial = (root: THREE.Object3D, fn: (m: THREE.MeshStandardMaterial) => void) =>
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => fn(m as THREE.MeshStandardMaterial));
  });

/** Per-model material tweaks (documented in credits where they change the look). */
const TUNE: Record<string, (root: THREE.Object3D) => void> = {
  // Dark-brown low-poly ant on a dark background: lift it with a warm self-glow.
  ant: (root) =>
    eachMaterial(root, (m) => {
      m.emissive = new THREE.Color('#7C4A24');
      m.emissiveIntensity = 0.45;
      m.roughness = 0.5;
    }),
  // The scan is a dark red stone; keep its shape and surface normals but
  // colour it as frosted quartz so it reads as a sand grain.
  'grain-sand': (root) =>
    eachMaterial(root, (m) => {
      m.map = null;
      m.vertexColors = false;
      m.color = new THREE.Color('#E8DCC2');
      m.roughness = 0.42;
      m.metalness = 0;
      m.emissive = new THREE.Color('#3A3022');
      m.emissiveIntensity = 0.25;
      m.needsUpdate = true;
    }),
};

/** Forget a cached (failed) download so the next visit retries it. */
export function clearAssetCache(item: ScaleItem) {
  if (!item.asset) return;
  const url = assetHref(item.asset);
  if (item.asset.kind === 'glb') clearGlb(url);
  else clearTexture(url);
}

/** The item's real asset. Suspends while loading and throws if it fails. */
export function AssetVisual({ item }: { item: ScaleItem }) {
  if (!item.asset) return <ProceduralVisual item={item} />;
  const url = assetHref(item.asset);
  if (item.asset.kind === 'glb') return <GlbModel url={url} tune={Object.hasOwn(TUNE, item.id) ? TUNE[item.id] : undefined} />;
  return <TexturedSphere url={url} style={Object.hasOwn(SPHERE_STYLE, item.id) ? SPHERE_STYLE[item.id] : 'planet'} />;
}
