import React, { useRef } from 'react';
import { SCALE_ITEMS } from '../constants';
import type { ScaleMode } from '../types';
import { viewStore } from '../state/view';
import { LOG_MAX, LOG_MIN, spanFor } from '../utils/scale';
import { formatMeters, superscript } from '../utils/formatting';
import { Rich } from './Rich';

interface ScrubberProps {
  leftIndex: number;
  rightIndex: number;
  mode: ScaleMode;
  compact: boolean;
  onScrub: (span: number) => void;
  onScrubEnd?: () => void;
}

const frac = (s: number) => (s - LOG_MIN) / (LOG_MAX - LOG_MIN);
const DECADES = Array.from({ length: Math.floor(LOG_MAX) - Math.ceil(LOG_MIN) + 1 }, (_, i) => Math.ceil(LOG_MIN) + i);

/**
 * Log-scale track from the Planck length to the observable universe. The
 * thumb is the current view; dots are the 32 items (at the scale that frames
 * them). Drag, click, or use arrow keys / Page keys / Home / End when focused.
 */
export function Scrubber({ leftIndex, rightIndex, mode, compact, onScrub, onScrubEnd }: ScrubberProps) {
  const track = useRef<HTMLDivElement>(null);
  const spanL = viewStore.use((s) => s.left);
  const spanR = viewStore.use((s) => s.right);
  const span = mode === 'left' ? spanL : spanR;
  const metres = 10 ** span;

  const spanAt = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return LOG_MIN + f * (LOG_MAX - LOG_MIN);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    onScrub(spanAt(e.clientX));
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) onScrub(spanAt(e.clientX));
  };
  const onPointerUp = () => onScrubEnd?.();

  const onKeyDown = (e: React.KeyboardEvent) => {
    const steps: Record<string, number> = { ArrowLeft: -0.25, ArrowDown: -0.25, ArrowRight: 0.25, ArrowUp: 0.25, PageDown: -3, PageUp: 3 };
    if (e.key in steps) onScrub(span + steps[e.key]);
    else if (e.key === 'Home') onScrub(LOG_MIN);
    else if (e.key === 'End') onScrub(LOG_MAX);
    else return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="w-full select-none">
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label="Scale: metres across the view"
        aria-valuemin={Math.round(LOG_MIN)}
        aria-valuemax={Math.round(LOG_MAX)}
        aria-valuenow={Math.round(span * 10) / 10}
        aria-valuetext={`${formatMeters(metres)} across the view`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={`relative ${compact ? 'h-7' : 'h-8'} cursor-pointer touch-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
      >
        {/* rail */}
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-emerald-400/40 via-sky-300/40 to-fuchsia-400/40" />
        {/* decade ticks */}
        {DECADES.map((d) => (
          <div
            key={d}
            className={`absolute top-1/2 w-px -translate-y-1/2 ${d % 10 === 0 ? 'h-3 bg-white/30' : 'h-1.5 bg-white/12'}`}
            style={{ left: `${frac(d) * 100}%` }}
          />
        ))}
        {/* items */}
        {SCALE_ITEMS.map((it, i) => {
          const active = i === leftIndex || i === rightIndex;
          return (
            <div
              key={it.id}
              title={`${it.name} · ${formatMeters(it.size)}`}
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all ${active ? 'h-2.5 w-2.5 ring-2 ring-white/70' : 'h-1.5 w-1.5 opacity-60'}`}
              style={{ left: `${frac(spanFor(it)) * 100}%`, backgroundColor: it.color }}
            />
          );
        })}
        {/* thumb(s) */}
        {(mode === 'each' ? [spanL, spanR] : [span]).map((s, k) => (
          <div
            key={k}
            className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent/40 shadow-[0_0_16px_rgba(99,102,241,0.8)]"
            style={{ left: `${frac(s) * 100}%` }}
          />
        ))}
      </div>
      <div className="relative h-3.5 text-[10px] tabular-nums text-white/65" aria-hidden>
        {DECADES.filter((d) => d % 10 === 0).map((d) => (
          <span key={d} className="absolute -translate-x-1/2" style={{ left: `${frac(d) * 100}%` }}>
            {d === 0 ? '1 m' : <Rich text={`10${superscript(d)}`} />}
          </span>
        ))}
      </div>
    </div>
  );
}
