// World layout and camera math for the Journey.
//
// Every object lives in ONE world at true relative size, laid out left-to-right from the
// smallest to the largest, vertically centred on y = 0. A camera is a centre x (metres)
// and a scale (metres per pixel). Framing object i puts its centre on screen and sizes it
// to a fixed fraction of the viewport. Between two keyframes we interpolate the scale
// geometrically and the pan so that on-screen motion feels constant.

import type { ScaleItem, SizeLabel } from '../types';

/** Gap between neighbours as a fraction of the larger neighbour's width. */
export const GAP = 0.42;

export interface Placed {
  item: ScaleItem;
  index: number;
  /** Width and height of the drawn bounding box in metres. */
  w: number;
  h: number;
  /** World x of the centre, metres. */
  x: number;
}

export interface Camera {
  cx: number;
  /** metres per CSS pixel */
  mpp: number;
}

export interface Frame {
  /** Max fraction of viewport width / height an object may occupy when framed. */
  w: number;
  h: number;
  /** Horizontal offset of the framed object's centre as a fraction of viewport width (0 = centre). */
  dx: number;
  /** The floor line every object stands on, as a fraction of viewport height from the top. */
  floor: number;
}

export const DEFAULT_FRAME: Frame = { w: 0.42, h: 0.5, dx: 0, floor: 0.7 };

/** Is the measured dimension horizontal on screen? */
export const isHorizontal = (label: SizeLabel): boolean => label !== 'Height' && label !== 'Depth';

export function dimsFor(item: ScaleItem, aspect: number): { w: number; h: number } {
  const a = aspect > 0 && isFinite(aspect) ? aspect : 1;
  return isHorizontal(item.sizeLabel)
    ? { w: item.size, h: item.size / a }
    : { w: item.size * a, h: item.size };
}

/** Lay items (already sorted ascending by size) along the x axis. */
export function buildWorld(items: ScaleItem[], aspectOf: (id: string) => number): Placed[] {
  const out: Placed[] = [];
  let cursor = 0; // right edge of the previous object + gap
  items.forEach((item, index) => {
    const { w, h } = dimsFor(item, aspectOf(item.id));
    if (index === 0) {
      out.push({ item, index, w, h, x: 0 });
      cursor = w / 2;
      return;
    }
    const prev = out[index - 1];
    const gap = GAP * Math.max(prev.w, w);
    const x = cursor + gap + w / 2;
    out.push({ item, index, w, h, x });
    cursor = x + w / 2;
  });
  return out;
}

export function keyframe(p: Placed, vw: number, vh: number, frame: Frame = DEFAULT_FRAME): Camera {
  const mpp = Math.max(p.w / (frame.w * vw), p.h / (frame.h * vh));
  // Put the object's centre at the frame anchor: cx is the WORLD point that maps to the viewport centre.
  const cx = p.x - frame.dx * vw * mpp;
  return { cx, mpp };
}

/**
 * Camera for a continuous position t ∈ [0, n-1]. Integer t frames object t exactly.
 * Scale is interpolated geometrically; the pan uses the matching exponential easing so
 * that apparent (pixel) velocity stays constant through the move.
 */
export function cameraAt(world: Placed[], t: number, vw: number, vh: number, frame: Frame = DEFAULT_FRAME): Camera {
  const n = world.length;
  if (n === 0) return { cx: 0, mpp: 1 };
  const tc = Math.max(0, Math.min(n - 1, t));
  const i = Math.min(n - 2, Math.floor(tc));
  if (n === 1 || tc <= 0) return keyframe(world[0], vw, vh, frame);
  if (tc >= n - 1) return keyframe(world[n - 1], vw, vh, frame);
  const f = tc - i;
  const a = keyframe(world[i], vw, vh, frame);
  const b = keyframe(world[i + 1], vw, vh, frame);
  const R = b.mpp / a.mpp;
  const mpp = a.mpp * Math.pow(R, f);
  const g = Math.abs(R - 1) < 1e-6 ? f : (Math.pow(R, f) - 1) / (R - 1);
  const cx = a.cx + (b.cx - a.cx) * g;
  return { cx, mpp };
}

export interface ScreenRect {
  left: number;
  top: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
}

export function project(p: Placed, cam: Camera, vw: number, vh: number, frame: Frame = DEFAULT_FRAME): ScreenRect {
  const width = p.w / cam.mpp;
  const height = p.h / cam.mpp;
  const cx = (p.x - cam.cx) / cam.mpp + vw / 2;
  // Everything stands on one floor so sizes compare bottom-to-top, like exhibits on a shelf.
  const top = frame.floor * vh - height;
  return { left: cx - width / 2, top, width, height, cx, cy: top + height / 2 };
}

/** Piecewise-linear map from log10(size) to journey position t, through every object. */
export function tForLogSize(world: Placed[], log10m: number): number {
  const n = world.length;
  if (n === 0) return 0;
  const logs = world.map((p) => Math.log10(p.item.size));
  if (log10m <= logs[0]) return 0;
  if (log10m >= logs[n - 1]) return n - 1;
  for (let i = 0; i < n - 1; i++) {
    if (log10m >= logs[i] && log10m <= logs[i + 1]) {
      const span = logs[i + 1] - logs[i];
      return span <= 0 ? i : i + (log10m - logs[i]) / span;
    }
  }
  return n - 1;
}

export function logSizeForT(world: Placed[], t: number): number {
  const n = world.length;
  if (n === 0) return 0;
  const tc = Math.max(0, Math.min(n - 1, t));
  const i = Math.min(n - 2, Math.floor(tc));
  if (n === 1) return Math.log10(world[0].item.size);
  const f = tc - i;
  const a = Math.log10(world[i].item.size);
  const b = Math.log10(world[i + 1].item.size);
  return a + (b - a) * f;
}
