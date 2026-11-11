import { SCALE_ITEMS } from '../constants';
import type { Dimension, ScaleItem } from '../types';

/** A framed item fills this fraction of its panel's shorter side. */
export const FIT = 0.6;

/** log10(metres across the panel's shorter side) that frames `item`. */
export const spanFor = (item: ScaleItem) => Math.log10(item.size / FIT);

export const LOG_MIN = spanFor(SCALE_ITEMS[0]) - 0.6;
export const LOG_MAX = spanFor(SCALE_ITEMS[SCALE_ITEMS.length - 1]) + 0.6;

export const clampSpan = (s: number) => Math.min(LOG_MAX, Math.max(LOG_MIN, s));

/** On-screen size (px) of `size` metres when the panel's shorter side spans 10^span metres. */
export const displayPx = (size: number, span: number, minDimPx: number) =>
  10 ** (Math.log10(size) - span + Math.log10(Math.max(1, minDimPx)));

/** The largest item that still fits comfortably (≤ ~85% of the view) at this span. */
export function itemIndexForSpan(span: number): number {
  const limit = span + Math.log10(FIT) + 0.15;
  let idx = 0;
  for (let i = 0; i < SCALE_ITEMS.length; i++) if (Math.log10(SCALE_ITEMS[i].size) <= limit) idx = i;
  return idx;
}

/** "wider" / "taller" / "longer" when both sizes measure the same kind of dimension. */
export function comparative(a: Dimension, b: Dimension): string {
  if (a !== b) return 'bigger';
  return a === 'height' ? 'taller' : a === 'length' ? 'longer' : 'wider';
}

/**
 * How far the top edge of each visual sits above its centre, in units of
 * `size` (0.5 for anything centred and measured vertically). Used to show the
 * top edge / horizon of an item that is far bigger than its panel. `null`
 * means "no meaningful edge": keep it centred.
 */
const TOP_EXTENT: Record<string, number | null> = {
  ant: 0.19,
  'blue-whale': 0.14,
  mitochondrion: 0.24,
  'one-light-year': 0,
  'human-hair': null,
  'dna-width': 1.0,
  jupiter: 0.47,
  'solar-system': 0.24,
  'milky-way': 0.26,
  'local-group': 0.3,
  'cat-eye-nebula': 0.35,
  coronavirus: 0.72,
  'red-blood-cell': 0.3,
  'grain-sand': 0.25,
};
export const topExtent = (id: string): number | null => (Object.hasOwn(TOP_EXTENT, id) ? TOP_EXTENT[id] : 0.5);

/** When an item is far bigger than its panel, its top edge is pinned this fraction of the panel height above centre. */
export const HORIZON_AT = 0.2;

/** Beyond this on-screen size the model is not drawn (float precision); the overlay minimap takes over. */
export const MAX_DRAW_FACTOR = 2e4;

export type Fit = 'tiny' | 'normal' | 'beyond';
export const fitOf = (px: number, w: number, h: number): Fit => (px < 4 ? 'tiny' : px > Math.max(w, h) * 1.02 ? 'beyond' : 'normal');
