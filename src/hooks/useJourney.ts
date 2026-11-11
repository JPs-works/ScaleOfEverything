// Continuous position along the ladder with three motion styles:
//  - tween: timed ease for steps and jumps
//  - spring: exponential approach for wheel / drag input, then a soft snap to the nearest object
//  - instant: direct set (rail scrubbing, reduced motion)

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type MoveMode = 'tween' | 'spring' | 'instant';

export interface Journey {
  /** Animated position, integer values frame an object exactly. */
  t: number;
  target: number;
  /** Nearest object index. */
  focus: number;
  moving: boolean;
  count: number;
  go: (to: number, mode?: MoveMode) => void;
  step: (delta: number) => void;
  /** Continuous input (wheel, drag): moves the target and eases toward it. */
  nudge: (delta: number) => void;
  /** Snap the target to the nearest object. */
  settle: () => void;
  /** Set both position and target immediately (scrubbing). */
  setInstant: (to: number) => void;
}

const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOutQuint = (x: number) => 1 - Math.pow(1 - x, 5);

export function useJourney(count: number, initial = 0, reducedMotion = false): Journey {
  const clamp = useCallback((v: number) => Math.max(0, Math.min(Math.max(0, count - 1), v)), [count]);
  const [t, setT] = useState(() => clamp(initial));
  const [moving, setMoving] = useState(false);
  const cur = useRef(clamp(initial));
  const target = useRef(clamp(initial));
  const mode = useRef<MoveMode>('instant');
  const tween = useRef<{ from: number; to: number; start: number; dur: number; ease: (x: number) => number } | null>(null);
  const raf = useRef(0);
  const last = useRef(0);
  const reduced = useRef(reducedMotion);
  reduced.current = reducedMotion;

  const stop = () => { cancelAnimationFrame(raf.current); raf.current = 0; setMoving(false); };

  const frame = useCallback((now: number) => {
    const dt = Math.min(64, now - (last.current || now)) / 1000;
    last.current = now;
    let done = false;
    if (mode.current === 'tween' && tween.current) {
      const tw = tween.current;
      const p = Math.min(1, (now - tw.start) / tw.dur);
      cur.current = tw.from + (tw.to - tw.from) * tw.ease(p);
      if (p >= 1) { cur.current = tw.to; target.current = tw.to; done = true; }
    } else {
      const diff = target.current - cur.current;
      if (Math.abs(diff) < 0.0008) { cur.current = target.current; done = true; }
      else cur.current += diff * (1 - Math.exp(-dt / 0.14));
    }
    setT(cur.current);
    if (done) { stop(); return; }
    raf.current = requestAnimationFrame(frame);
  }, []);

  const start = useCallback(() => {
    if (raf.current) return;
    last.current = 0;
    setMoving(true);
    raf.current = requestAnimationFrame(frame);
  }, [frame]);

  const setInstant = useCallback((to: number) => {
    const v = clamp(to);
    cancelAnimationFrame(raf.current); raf.current = 0;
    tween.current = null; mode.current = 'instant';
    cur.current = v; target.current = v;
    setT(v); setMoving(false);
  }, [clamp]);

  const go = useCallback((to: number, m: MoveMode = 'tween') => {
    const v = clamp(to);
    if (m === 'instant' || reduced.current) { setInstant(v); return; }
    target.current = v;
    if (m === 'tween') {
      const dist = Math.abs(v - cur.current);
      const dur = Math.min(1700, 520 + 170 * Math.min(dist, 7));
      tween.current = { from: cur.current, to: v, start: performance.now(), dur, ease: dist > 1.5 ? easeInOutCubic : easeOutQuint };
      mode.current = 'tween';
    } else {
      tween.current = null; mode.current = 'spring';
    }
    start();
  }, [clamp, setInstant, start]);

  const step = useCallback((delta: number) => {
    const base = mode.current === 'tween' && tween.current ? tween.current.to : Math.round(target.current);
    go(base + delta, 'tween');
  }, [go]);

  const nudge = useCallback((delta: number) => {
    if (reduced.current) { setInstant(target.current + delta); return; }
    tween.current = null; mode.current = 'spring';
    target.current = clamp(target.current + delta);
    start();
  }, [clamp, setInstant, start]);

  const settle = useCallback(() => {
    if (mode.current === 'tween') return;
    if (reduced.current) { setInstant(Math.round(target.current)); return; }
    target.current = clamp(Math.round(target.current));
    mode.current = 'spring';
    start();
  }, [clamp, start, setInstant]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  // Keep inside bounds if the ladder shrinks (mode switch).
  useEffect(() => { if (cur.current > count - 1) setInstant(count - 1); }, [count, setInstant]);

  return useMemo(() => ({
    t, target: target.current, focus: Math.round(t), moving, count, go, step, nudge, settle, setInstant,
  }), [t, moving, count, go, step, nudge, settle, setInstant]);
}
