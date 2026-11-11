import { createStore } from './store';
import type { Side } from '../types';

export type PanelStatus = 'loading' | 'ready' | 'fallback';

/** Which item each panel has actually drawn, and how (model, loading placeholder, or error fallback). */
export const readinessStore = createStore<Record<Side, { id: string; status: PanelStatus }>>({
  left: { id: '', status: 'loading' },
  right: { id: '', status: 'loading' },
});

export const reportStatus = (side: Side, id: string, status: PanelStatus) => {
  const cur = readinessStore.get()[side];
  if (cur.id === id && cur.status === status) return;
  readinessStore.set((s) => ({ ...s, [side]: { id, status } }));
};
