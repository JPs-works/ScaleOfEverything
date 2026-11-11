import React, { useId, useState } from 'react';
import { ChevronDown, Info, Loader2, Lock, LockOpen, TriangleAlert } from 'lucide-react';
import type { ScaleItem, Side } from '../types';
import { formatAlt, formatFraction, formatMeters, formatTimes } from '../utils/formatting';
import { HORIZON_AT, MAX_DRAW_FACTOR, comparative, displayPx, fitOf, topExtent } from '../utils/scale';
import { viewStore } from '../state/view';
import { layoutStore } from '../state/layout';
import { readinessStore } from '../state/readiness';
import { ScaleBar } from './ScaleGrid';
import { Rich } from './Rich';

interface PanelOverlayProps {
  side: Side;
  item: ScaleItem;
  kept: boolean;
  onToggleKeep: () => void;
  onChange: () => void;
  compact: boolean;
  /** Separate-scales mode: this panel is not to scale with the other. */
  notToScale: boolean;
}

const RING_PX = 44;
const MINI = 64; // minimap silhouette diameter, px

/**
 * Inset map for an item far bigger than its panel: the whole item as a
 * silhouette, with a rectangle (or crosshair, if too small) where the
 * panel's view sits on it.
 */
function MiniMap({ item, px, w, h, compact }: { item: ScaleItem; px: number; w: number; h: number; compact: boolean }) {
  const top = topExtent(item.id);
  const drawn = px < Math.max(w, h) * MAX_DRAW_FACTOR;
  // View centre relative to the item centre, in item units (see ScaledItem's horizon offset).
  const cy = top === null || !drawn ? 0 : top - (HORIZON_AT * h) / px;
  const fw = (w / px) * MINI, fh = (h / px) * MINI;
  const visible = fw >= 2 && fh >= 2;
  const box = MINI + 16;
  return (
    <div
      className={`absolute ${compact ? 'bottom-9 right-2' : 'bottom-12 right-3'} rounded-lg border border-white/10 bg-black/60 p-2 backdrop-blur`}
      aria-hidden
      style={{ width: box }}
    >
      <div className="relative" style={{ width: MINI, height: MINI }}>
        <div className="absolute inset-0 rounded-full opacity-70" style={{ background: `radial-gradient(circle at 35% 35%, ${item.color}, ${item.color}55)` }} />
        {visible ? (
          <div
            className="absolute border border-white"
            style={{ width: fw, height: fh, left: MINI / 2 - fw / 2, top: MINI / 2 - cy * MINI - fh / 2 }}
          />
        ) : (
          <div className="absolute" style={{ left: MINI / 2 - 5, top: MINI / 2 - cy * MINI - 5 }}>
            <div className="h-2.5 w-2.5 rounded-full border-2 border-white" />
          </div>
        )}
      </div>
      <div className="mt-1 text-center text-[10px] leading-tight text-white/75">this view</div>
    </div>
  );
}

/** DOM layer over one panel: label, keep/info buttons, scale bar, and the too-small / too-big indicators. */
export function PanelOverlay({ side, item, kept, onToggleKeep, onChange, compact, notToScale }: PanelOverlayProps) {
  const [showInfo, setShowInfo] = useState(false);
  const infoId = useId();
  const span = viewStore.use((s) => s[side]);
  const w = layoutStore.use((s) => s[side].w);
  const h = layoutStore.use((s) => s[side].h);
  const status = readinessStore.use((s) => (s[side].id === item.id ? s[side].status : 'loading'));
  const minDim = Math.min(w, h);
  const px = displayPx(item.size, span, minDim);
  const fit = fitOf(px, w, h);
  const alt = formatAlt(item.size);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 select-none">
      {/* Backdrop so visuals never fight the header text */}
      <div className={`absolute inset-x-0 top-0 ${compact ? 'h-20' : 'h-28'} bg-gradient-to-b from-cosmos via-cosmos/75 to-transparent`} aria-hidden />

      {/* Header */}
      <div className={`absolute ${compact ? 'top-2 left-3 right-2' : 'top-3 left-4 right-3'} flex items-start justify-between gap-2`}>
        <div className="min-w-0">
          <button
            type="button"
            onClick={onChange}
            className="pointer-events-auto group -mx-1 rounded-md px-1 text-left focus-visible:outline-2 focus-visible:outline-accent"
            aria-label={`${item.name}: choose a different ${side} item`}
          >
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              {item.category}
              {item.badge && <span className="normal-case tracking-normal text-amber-200">{item.badge}</span>}
              {notToScale && <span className="rounded bg-amber-400/20 px-1.5 py-px normal-case tracking-normal text-amber-100">not to scale</span>}
            </span>
            <span className={`flex items-center gap-1 font-semibold text-white ${compact ? 'text-sm' : 'text-lg'} leading-tight`}>
              <span className="truncate">{item.name}</span>
              <ChevronDown size={14} className="shrink-0 opacity-60 transition-opacity group-hover:opacity-100" aria-hidden />
            </span>
          </button>
          <div className={`font-mono ${compact ? 'text-xs' : 'text-sm'} text-white`}>
            <Rich text={formatMeters(item.size)} /> <span className="text-xs text-white/70">{item.dimension}</span>
          </div>
          {!compact && alt && <Rich className="block text-xs tabular-nums text-white/65" text={alt} />}
        </div>
        <div className="pointer-events-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onToggleKeep}
            aria-pressed={kept}
            aria-label={`Keep ${item.name}`}
            title={kept ? 'Kept: the arrows change only the other side. Click to release.' : 'Keep this item while the arrows step through the other side'}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
              kept ? 'border-accent/60 bg-accent/30 text-white' : 'border-white/15 bg-black/50 text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            {kept ? <Lock size={12} aria-hidden /> : <LockOpen size={12} aria-hidden />}
            <span aria-hidden>{kept ? 'Kept' : 'Keep'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowInfo((v) => !v)}
            aria-expanded={showInfo}
            aria-controls={infoId}
            aria-label={`About ${item.name}`}
            className={`rounded-full border p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
              showInfo ? 'border-white/30 bg-white/15 text-white' : 'border-white/15 bg-black/50 text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Info size={13} aria-hidden />
          </button>
        </div>
      </div>

      {showInfo && (
        <p
          id={infoId}
          className={`pointer-events-auto absolute ${compact ? 'top-16' : 'top-[5.75rem]'} left-3 right-3 max-w-sm rounded-xl border border-white/10 bg-black/80 p-3 text-[13px] leading-relaxed text-white/85 backdrop-blur-md animate-fade-in`}
        >
          {item.description}
        </p>
      )}

      {/* Too small to see: a ring marks where it is */}
      {fit === 'tiny' && (
        <>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
            <div className="relative" style={{ width: RING_PX, height: RING_PX }}>
              <div className="absolute inset-0 rounded-full border border-dashed opacity-90 animate-pulse-slow" style={{ borderColor: item.color }} />
              <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ backgroundColor: item.color }} />
            </div>
          </div>
          <div className="absolute left-1/2 top-1/2 w-60 -translate-x-1/2 translate-y-8 text-center text-xs leading-snug text-white/80">
            <span className="font-semibold text-white">{item.name}</span> (<Rich text={formatMeters(item.size)} />) is a speck here:
            <br />
            <Rich text={formatFraction(RING_PX / Math.max(px, 1e-300))} /> of this ring
          </div>
        </>
      )}

      {/* Larger than the panel */}
      {fit === 'beyond' && (
        <>
          <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 60px -10px ${item.color}88`, border: `1px solid ${item.color}55` }} aria-hidden />
          <div
            className={`absolute left-1/2 ${compact ? 'bottom-2' : 'bottom-4'} max-w-[70%] -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-center text-xs text-white/85 backdrop-blur`}
          >
            Extends beyond view: <Rich text={formatTimes(px / Math.max(1, item.dimension === 'height' ? h : w))} />{' '}
            {comparative(item.dimension, item.dimension)} than this panel
          </div>
          {px >= Math.max(w, h) * MAX_DRAW_FACTOR && topExtent(item.id) !== null && (
            // Too big to draw precisely: show its edge as a horizon band at the same height the 3D edge would sit.
            <div
              className="absolute inset-x-0 bottom-0"
              style={{
                top: `${(0.5 - HORIZON_AT) * 100}%`,
                background: `linear-gradient(to bottom, ${item.color}cc 0, ${item.color}55 2px, ${item.color}33 30%, ${item.color}11 100%)`,
                borderTop: `1px solid ${item.color}`,
              }}
              aria-hidden
            />
          )}
          <MiniMap item={item} px={px} w={w} h={h} compact={compact} />
        </>
      )}

      {/* Bottom-left: scale bar; bottom-right: load status */}
      <ScaleBar span={span} minDim={minDim} compact={compact} />
      {status !== 'ready' && item.asset && (
        <div className={`absolute ${compact ? 'bottom-2 right-2' : 'bottom-3 right-3'} flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[11px] text-white/80`} role="status">
          {status === 'loading' ? (
            <>
              <Loader2 size={11} className="animate-spin" aria-hidden /> Loading model…
            </>
          ) : (
            <>
              <TriangleAlert size={11} className="text-amber-300" aria-hidden /> Model unavailable, showing illustration
            </>
          )}
        </div>
      )}
    </div>
  );
}
