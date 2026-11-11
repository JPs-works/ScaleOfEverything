import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';
import type { ScaleItem, Side } from '../types';
import { PanelScene } from './ItemVisual3D';

/**
 * The 3D half of the app, lazy-loaded so the DOM shell paints first.
 * One persistent canvas behind both panels; each panel's <PanelView>
 * renders into it through drei's View (scissor) tunnel.
 */
export function Stage3D({ onContextLost }: { onContextLost: (lost: boolean) => void }) {
  const timer = useRef(0);
  const cleanup = useRef<() => void>(() => {});
  useEffect(() => () => cleanup.current(), []);
  return (
    <Canvas
      className="!absolute inset-0"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden
      onCreated={({ gl }) => {
        const canvas = gl.domElement;
        // If the GPU context is lost and not restored within 3 s, say so instead of showing empty panels.
        const lost = (e: Event) => {
          e.preventDefault();
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => onContextLost(true), 3000);
        };
        const restored = () => {
          window.clearTimeout(timer.current);
          onContextLost(false);
        };
        canvas.addEventListener('webglcontextlost', lost);
        canvas.addEventListener('webglcontextrestored', restored);
        cleanup.current = () => {
          window.clearTimeout(timer.current);
          canvas.removeEventListener('webglcontextlost', lost);
          canvas.removeEventListener('webglcontextrestored', restored);
        };
      }}
    >
      <View.Port />
    </Canvas>
  );
}

export function PanelView({ side, item, reduced }: { side: Side; item: ScaleItem; reduced: boolean }) {
  return (
    <View className="absolute inset-0">
      <PanelScene side={side} item={item} reduced={reduced} />
    </View>
  );
}
