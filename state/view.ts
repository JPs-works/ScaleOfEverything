import { createStore } from './store';
import type { Side } from '../types';

/**
 * The camera of each panel, as log10(metres spanned by the panel's shorter
 * side). `left`/`right` are animated towards `targetLeft`/`targetRight`.
 * Kept outside React so the render loop can read it every frame and only
 * the overlays that care re-render.
 */
interface ViewSpan {
  left: number;
  right: number;
  targetLeft: number;
  targetRight: number;
}

export const viewStore = createStore<ViewSpan>({ left: -9.5, right: -9.5, targetLeft: -9.5, targetRight: -9.5 });

let raf = 0;
let last = 0;
let reduced = false;

export const setReducedMotion = (v: boolean) => {
  reduced = v;
};

const tick = (t: number) => {
  const dt = Math.min(0.25, last ? (t - last) / 1000 : 0.016);
  last = t;
  const s = viewStore.get();
  const k = 1 - Math.exp(-dt * 7);
  const step = (cur: number, target: number) => (Math.abs(target - cur) < 1e-4 ? target : cur + (target - cur) * k);
  const left = step(s.left, s.targetLeft);
  const right = step(s.right, s.targetRight);
  viewStore.set({ left, right });
  if (left !== s.targetLeft || right !== s.targetRight) raf = requestAnimationFrame(tick);
  else {
    raf = 0;
    last = 0;
  }
};

/** Animate (or jump, with reduced motion / `immediate`) the panels to new spans. */
export function setSpans(targetLeft: number, targetRight: number, immediate = false) {
  if (immediate || reduced) {
    viewStore.set({ left: targetLeft, right: targetRight, targetLeft, targetRight });
    return;
  }
  viewStore.set({ targetLeft, targetRight });
  if (!raf) raf = requestAnimationFrame(tick);
}

export const spanOf = (side: Side) => viewStore.get()[side];
