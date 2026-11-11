import { createStore } from './store';
import type { Side } from '../types';

/** Pixel size of each panel, measured from the DOM and shared with the render loop. */
export const layoutStore = createStore<Record<Side, { w: number; h: number }>>({
  left: { w: 1, h: 1 },
  right: { w: 1, h: 1 },
});
