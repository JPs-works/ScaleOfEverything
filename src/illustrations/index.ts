// Illustration registry. Every `./art/<id>.tsx` that exports an `Illustration` named `art`
// is picked up automatically, so artwork can be added file by file.

import type { Illustration } from './types';
import { makeFallback } from './fallback';
import type { ScaleItem } from '../types';

const modules = import.meta.glob<{ art: Illustration }>('./art/*.tsx', { eager: true });

const registry = new Map<string, Illustration>();
for (const [path, mod] of Object.entries(modules)) {
  const art = mod.art;
  if (!art || !art.View) continue;
  const fileId = path.replace(/^.*\/(.*)\.tsx$/, '$1');
  registry.set(art.id || fileId, art);
}

const fallbacks = new Map<string, Illustration>();

export function illustrationFor(item: ScaleItem): Illustration {
  const found = registry.get(item.id);
  if (found) return found;
  let fb = fallbacks.get(item.id);
  if (!fb) {
    fb = makeFallback(item.id, item.color, item.sizeLabel === 'Height' ? 0.5 : 1);
    fallbacks.set(item.id, fb);
  }
  return fb;
}

export const hasIllustration = (id: string): boolean => registry.has(id);
export const illustrationIds = (): string[] => [...registry.keys()];
