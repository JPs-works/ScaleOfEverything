import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { SCALE_ITEMS } from '../constants';
import { assetUrl } from '../utils/assets';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface Credit {
  item: string;
  title: string;
  author: string;
  source: string;
  licence: string;
  licenceUrl?: string;
  notes?: string;
}

const SHORTCUTS: [string, string][] = [
  ['← →', 'Step to smaller / larger items'],
  ['Scroll · pinch · drag', 'Travel smoothly through scale'],
  ['↑  or  −', 'Zoom out a quarter decade'],
  ['↓  or  +', 'Zoom in a quarter decade'],
  ['S', 'Swap which side sets the shared scale'],
  ['F', 'Toggle separate scales'],
  ['L / R', 'Keep the left / right item while stepping'],
  ['/', 'Open the item list'],
  ['Esc', 'Close dialogs'],
];

/** "How to use" + asset credits (from public/assets3d/credits.json). */
export function AboutDialog({ onClose }: { onClose: () => void }) {
  const [credits, setCredits] = useState<Credit[] | null>(null);
  const [error, setError] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  useFocusTrap(dialog);

  useEffect(() => {
    const restore = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    fetch(assetUrl('credits.json'))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setCredits)
      .catch(() => setError(true));
    return () => restore?.focus?.();
  }, []);

  const nameOf = (id: string) => SCALE_ITEMS.find((i) => i.id === id)?.name ?? id;
  const procedural = SCALE_ITEMS.filter((i) => !i.asset).map((i) => i.name);

  return (
    <div ref={dialog} className="fixed inset-0 z-50 flex items-center justify-center p-3" role="dialog" aria-modal="true" aria-labelledby="about-title">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-cosmos shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h2 id="about-title" className="text-base font-semibold text-white">About & credits</h2>
          <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-white/75 hover:bg-white/10 hover:text-white">
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="space-y-6 overflow-y-auto px-5 py-4 text-sm text-white/75">
          <section>
            <p>
              Two panels compare any two of {SCALE_ITEMS.length} things, from the Planck length to the observable universe. With a <em>same scale</em> mode, one
              metre is the same number of pixels in both panels, so you can see the difference. Something too small to see is marked with a ring; something too big
              to fit glows at the panel edges.
            </p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
              {SHORTCUTS.map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt>
                    <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-white/80">{k}</kbd>
                  </dt>
                  <dd className="text-white/75">{v}</dd>
                </React.Fragment>
              ))}
            </dl>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">3D models & maps</h3>
            {error && <p className="text-amber-300/80">Could not load the credits file.</p>}
            {!credits && !error && <p className="text-white/65">Loading…</p>}
            {credits && (
              <ul className="space-y-2.5">
                {credits.map((c) => (
                  <li key={c.item} className="leading-snug">
                    <span className="font-medium text-white">{nameOf(c.item)}</span>
                    <span className="text-white/65"> · </span>
                    <a href={c.source} target="_blank" rel="noreferrer noopener" className="underline decoration-white/25 underline-offset-2 hover:decoration-white">
                      {c.title}
                    </a>{' '}
                    by {c.author}.{' '}
                    {c.licenceUrl ? (
                      <a href={c.licenceUrl} target="_blank" rel="noreferrer noopener" className="text-white/70 underline decoration-white/20 underline-offset-2">
                        {c.licence}
                      </a>
                    ) : (
                      <span className="text-white/70">{c.licence}</span>
                    )}
                    {c.notes && <span className="block text-[12px] text-white/65">{c.notes}</span>}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[12px] text-white/65">Models are recentred, rescaled, simplified and compressed for the web; colours and geometry are otherwise the authors'.</p>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Built in code</h3>
            <p className="text-[13px] text-white/75">Procedural scenes (no external assets): {procedural.join(', ')}.</p>
            <p className="mt-2 text-[12px] text-white/65">Rendered with three.js and React Three Fiber. Text uses your system's fonts.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
