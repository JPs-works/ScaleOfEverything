import React, { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { ScaleItem, Side } from '../types';
import { viewStore } from '../state/view';
import { layoutStore } from '../state/layout';
import { reportStatus, PanelStatus } from '../state/readiness';
import { HORIZON_AT, MAX_DRAW_FACTOR, displayPx, topExtent } from '../utils/scale';
import { markCaughtError } from '../utils/caughtErrors';
import { VisualContext } from './visuals/common';
import { AssetVisual, ProceduralVisual, clearAssetCache } from './visuals';

/** A request that has neither loaded nor failed after this long switches to the fallback. */
const LOAD_TIMEOUT_MS = 15000;

// ------------------------------------------------------------ error boundary

interface BoundaryProps {
  fallback: React.ReactNode;
  label: string;
  onFail: () => void;
  children: React.ReactNode;
}

/** Catches a failed asset (404, bad file, decode error) and shows `fallback` instead. */
export class AssetBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(error: unknown) {
    // Tell the global reportError filter this one is handled (see index.tsx).
    markCaughtError(error);
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn(`[scale] ${this.props.label}: asset failed, using procedural fallback.`, error);
    // Drop the cached failure so revisiting the item retries the download.
    this.props.onFail();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Reports to the readiness store once its subtree has actually been drawn. */
function Report({ side, id, status }: { side: Side; id: string; status: PanelStatus }) {
  const frames = useRef(0);
  useEffect(() => {
    frames.current = 0;
  }, [id, status]);
  useFrame(() => {
    if (frames.current < 2 && ++frames.current === 2) reportStatus(side, id, status);
  });
  return null;
}

function LoadTimeout({ onTimeout }: { onTimeout: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onTimeout, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [onTimeout]);
  return null;
}

// ------------------------------------------------- top-edge measurement

const _inv = new THREE.Matrix4(), _m = new THREE.Matrix4(), _v = new THREE.Vector3();

/**
 * Highest point of the visual in its own unit space (group scale removed),
 * from real (skinned/morphed) vertices of solid meshes (glows, rims and
 * point clouds ignored).
 * Precision matters: when an item is 1000s of panels tall, any error in its
 * top edge is multiplied by that factor.
 */
function measureTop(group: THREE.Group): { x: number; y: number } | null {
  group.updateWorldMatrix(true, true);
  _inv.copy(group.matrixWorld).invert();
  let top = -Infinity;
  let topX = 0;
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || (mesh as THREE.InstancedMesh).isInstancedMesh || !mesh.visible) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    if (mats.every((m) => m.blending === THREE.AdditiveBlending || (m.transparent && m.opacity < 0.2))) return;
    const pos = mesh.geometry.getAttribute('position');
    if (!pos) return;
    _m.multiplyMatrices(_inv, mesh.matrixWorld);
    const stride = Math.max(1, Math.floor(pos.count / 60000));
    for (let i = 0; i < pos.count; i += stride) {
      mesh.getVertexPosition(i, _v).applyMatrix4(_m); // includes skinning / morphs
      if (_v.y > top) {
        top = _v.y;
        topX = _v.x;
      }
    }
  });
  return Number.isFinite(top) ? { x: topX, y: top } : null;
}

// --------------------------------------------------------- shared lighting

let envCache: { gl: THREE.WebGLRenderer; tex: THREE.Texture } | null = null;

/** Image-based lighting from three's built-in RoomEnvironment (no network fetch), generated once per renderer. */
function SceneEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    if (!envCache || envCache.gl !== gl) {
      envCache?.tex.dispose();
      const pmrem = new THREE.PMREMGenerator(gl);
      const room = new RoomEnvironment();
      envCache = { gl, tex: pmrem.fromScene(room, 0.04).texture };
      room.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          (m.material as THREE.Material).dispose();
        }
      });
      pmrem.dispose();
    }
    scene.environment = envCache.tex;
    scene.environmentIntensity = 0.45;
    return () => {
      scene.environment = null;
    };
  }, [gl, scene]);
  return null;
}

// ------------------------------------------------------------ panel scene

/**
 * The View's orthographic camera. Owned here (not drei's <OrthographicCamera>)
 * so re-renders never reset the depth that ScaledItem adjusts every frame;
 * drei's View sets the frustum to the panel's pixel size.
 */
function PanelCamera() {
  const set = useThree((s) => s.set);
  const cam = useMemo(() => {
    const c = new THREE.OrthographicCamera(-1, 1, 1, -1, -1e5, 1e5);
    return c;
  }, []);
  useLayoutEffect(() => {
    set({ camera: cam });
  }, [cam, set]);
  return <primitive object={cam} />;
}

/**
 * Everything drawn inside one panel's <View>. One world unit is one CSS pixel
 * (drei sizes the orthographic frustum to the tracked element), so the item
 * group is scaled to its true on-screen size each frame from the view store.
 * No metre values ever reach the GPU, which keeps 10^-35…10^27 precise.
 */
export function PanelScene({ side, item, reduced }: { side: Side; item: ScaleItem; reduced: boolean }) {
  return (
    <>
      <PanelCamera />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#E0E7FF', '#1E1B4B', 0.7]} />
      <directionalLight position={[-1, 1.1, 1.4]} intensity={2.4} />
      <SceneEnvironment />
      <ScaledItem key={item.id} side={side} item={item} reduced={reduced} />
    </>
  );
}

function ScaledItem({ side, item, reduced }: { side: Side; item: ScaleItem; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const px = useRef(300);
  const appear = useRef(reduced ? 1 : 0);
  const frozen = useRef(false);
  const env = useMemo(() => ({ px, reduced, frozen }), [reduced]);
  const [timedOut, setTimedOut] = useState(false);
  const top = topExtent(item.id);
  const measuredTop = useRef<{ x: number; y: number } | null>(null);
  const frameNo = useRef(0);
  const onTimeout = useMemo(
    () => () => {
      console.warn(`[scale] ${item.id}: asset took longer than ${LOAD_TIMEOUT_MS / 1000}s, using procedural fallback.`);
      setTimedOut(true);
    },
    [item.id],
  );

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const camera = state.camera; // this View's own camera (portal state)
    const { w, h } = layoutStore.get()[side];
    const d = displayPx(item.size, viewStore.get()[side], Math.min(w, h));
    px.current = d;
    appear.current = Math.min(1, appear.current + dt * 3.5);
    const e = 1 - (1 - appear.current) ** 3;
    // Below a quarter pixel the overlay ring takes over; beyond float
    // precision the overlay minimap does.
    g.visible = d > 0.25 && d < Math.max(w, h) * MAX_DRAW_FACTOR;
    g.scale.setScalar(Math.max(d, 1e-6) * (0.9 + 0.1 * e));
    // Once the item is much bigger than the panel, pin its top edge 20% of
    // the panel height above centre, so you see its edge / horizon rather
    // than an empty interior.
    // Re-measure now and then (some visuals tilt or animate); table value until then.
    if (top !== null && d > h * 0.5) {
      const n = frameNo.current++;
      if (n < 6 || n % 30 === 0) measuredTop.current = measureTop(g) ?? measuredTop.current;
    }
    const t = measuredTop.current?.y ?? top;
    const dy = t === null ? 0 : Math.min(0, HORIZON_AT * h - t * d);
    g.position.y = dy;
    // Hold still while showing an edge: at 10⁶ px a slow spin sweeps the edge away.
    frozen.current = dy < 0;
    // …and slide the top point to the centre line (it isn't always on it,
    // e.g. Everest's summit), easing in over one panel height of offset.
    g.position.x = -(measuredTop.current?.x ?? 0) * d * Math.min(1, -dy / Math.max(1, h));
    // Depth range follows the object. The camera sits at z = 0 with a
    // symmetric (negative-near) orthographic depth range, so view-space depth
    // stays small: far-away cameras made float32 depth/derivatives collapse
    // (black flat-shaded faces) once an item was ~10⁶ px across.
    const cam = camera as THREE.OrthographicCamera;
    const depth = Math.max(1e5, d * 3);
    if (cam.far !== depth || cam.position.z !== 0) {
      cam.position.z = 0;
      cam.near = -depth;
      cam.far = depth;
      cam.updateProjectionMatrix();
    }
  });

  const fallback = (status: PanelStatus) => (
    <>
      <ProceduralVisual item={item} />
      <Report side={side} id={item.id} status={status} />
    </>
  );

  return (
    <group ref={group}>
      <VisualContext.Provider value={env}>
        {timedOut ? (
          fallback('fallback')
        ) : (
          <AssetBoundary label={item.id} fallback={fallback('fallback')} onFail={() => clearAssetCache(item)}>
            <Suspense
              fallback={
                <>
                  {fallback('loading')}
                  {item.asset && <LoadTimeout onTimeout={onTimeout} />}
                </>
              }
            >
              <AssetVisual item={item} />
              <Report side={side} id={item.id} status="ready" />
            </Suspense>
          </AssetBoundary>
        )}
      </VisualContext.Provider>
    </group>
  );
}
