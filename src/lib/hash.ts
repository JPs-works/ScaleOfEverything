// Shareable URL state: #/journey/<id> or #/compare/<idA>/<idB>

import type { Mode } from '../types';

export interface HashState { mode: Mode; a?: string; b?: string; }

export function readHash(): HashState | null {
  const h = (typeof location !== 'undefined' ? location.hash : '').replace(/^#\/?/, '');
  if (!h) return null;
  const [mode, a, b] = h.split('/').map((s) => decodeURIComponent(s));
  if (mode === 'compare') return { mode: 'compare', a, b };
  if (mode === 'journey' || mode === 'item') return { mode: 'journey', a };
  return null;
}

export function writeHash(s: HashState): void {
  const next = s.mode === 'compare' ? `#/compare/${s.a ?? ''}/${s.b ?? ''}` : `#/journey/${s.a ?? ''}`;
  if (location.hash === next) return;
  try { history.replaceState(null, '', next); } catch { /* some browsers rate-limit history writes; the URL is a convenience, not state */ }
}
