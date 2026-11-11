import { memo, useCallback, useMemo, useRef, useState, type PointerEvent as RPointerEvent, type KeyboardEvent } from 'react';
import type { Placed } from '../lib/layout';
import { tForLogSize } from '../lib/layout';
import { BANDS } from '../lib/bands';
import { formatLength } from '../lib/format';

interface Props {
  world: Placed[];
  t: number;
  focus: number;
  vw: number;
  /** Phone layout: smaller ticks, tooltip while scrubbing. */
  compact?: boolean;
  onScrub: (t: number) => void;
  onSettle: () => void;
  onSelect: (index: number) => void;
  onStep: (delta: number) => void;
}

const PAD = 28;
const H = 72, Y_MID = 44;

export const Rail = memo(function Rail({ world, t, focus, vw, compact, onScrub, onSettle, onSelect, onStep }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const drag = useRef<{ startX: number; moved: boolean } | null>(null);

  const n = world.length;
  const width = Math.max(1, vw);
  // One equal slot per object: navigation space, not log space (the Planck gap would swallow the rail).
  const span = Math.max(1, n - 1);
  const slotPx = (width - 2 * PAD) / span;
  const xForT = useCallback((tt: number) => PAD + Math.max(0, Math.min(span, tt)) * slotPx, [span, slotPx]);
  const tForX = useCallback((x: number) => Math.max(0, Math.min(span, (x - PAD) / slotPx)), [span, slotPx]);

  const logs = useMemo(() => world.map((p) => Math.log10(p.item.size)), [world]);
  const tickX = useMemo(() => logs.map((l) => xForT(tForLogSize(world, l))), [logs, world, xForT]);
  const cursorX = xForT(t);

  const nearestTick = useCallback((x: number): number | null => {
    let best: number | null = null, bd = compact ? 10 : 14;
    tickX.forEach((tx, i) => { const d = Math.abs(tx - x); if (d < bd) { bd = d; best = i; } });
    return best;
  }, [tickX, compact]);

  const localX = (e: { clientX: number }) => e.clientX - (ref.current?.getBoundingClientRect().left ?? 0);

  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, moved: false };
  };
  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    const x = localX(e);
    const tick = nearestTick(x);
    if (!drag.current) { setHover(tick); return; }
    if (!drag.current.moved && Math.abs(e.clientX - drag.current.startX) > 3) { drag.current.moved = true; setScrubbing(true); }
    if (drag.current.moved) {
      const tt = tForX(x);
      onScrub(tt);
      setHover(Math.round(tt));
    }
  };
  const onPointerUp = (e: RPointerEvent<HTMLDivElement>) => {
    const x = localX(e);
    const wasDrag = drag.current?.moved;
    drag.current = null;
    setScrubbing(false);
    if (!wasDrag) {
      const tick = nearestTick(x);
      onSelect(tick !== null ? tick : Math.round(tForX(x)));
    } else {
      onSettle();
    }
    if (compact) setHover(null);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const handled = ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'Home', 'End'];
    if (!handled.includes(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onStep(1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onStep(-1);
    if (e.key === 'Home') onSelect(0);
    if (e.key === 'End') onSelect(n - 1);
  };

  const current = world[focus]?.item;
  const hovered = hover !== null ? world[hover]?.item : null;
  const showTip = hovered && (scrubbing || hover !== focus);

  // Band shading. Edges extend half a slot beyond the first/last object so the ends are shaded too.
  const lo = (logs[0] ?? 0) - 0.5, hi = (logs[n - 1] ?? 1) + 0.5;
  const xForLog = (log: number) => xForT(tForLogSize(world, log));
  let prevLabelRight = -Infinity;
  const bandRects = BANDS.map((b, i) => {
    const from = Math.max(lo, isFinite(b.from) ? b.from : lo);
    const to = Math.min(hi, BANDS[i + 1] ? BANDS[i + 1].from : hi);
    if (to <= from) return null;
    const x0 = Math.max(4, from <= logs[0] ? PAD - 0.5 * slotPx : xForLog(from));
    const x1 = Math.min(width - 4, to >= logs[n - 1] ? width - PAD + 0.5 * slotPx : xForLog(to));
    if (x1 - x0 <= 2) return null;
    let label: string | null = null;
    const fits = (s: string) => s.length * 7.2 + 12 <= x1 - x0 && x0 + 6 >= prevLabelRight + 14;
    if (!compact && fits(b.label)) label = b.label;
    else if (!compact && fits(b.short)) label = b.short;
    if (label) prevLabelRight = x0 + 6 + label.length * 7.2;
    return { b, x0, x1, label };
  }).filter((x): x is { b: typeof BANDS[number]; x0: number; x1: number; label: string | null } => !!x);

  const tickR = compact ? 1.6 : 3.2;

  return (
    <div
      ref={ref}
      className={`rail ${compact ? 'rail--compact' : ''}`}
      role="slider"
      tabIndex={0}
      aria-label="Position on the size ladder"
      aria-valuemin={0}
      aria-valuemax={Math.max(0, n - 1)}
      aria-valuenow={focus}
      aria-valuetext={current ? `${current.name}, ${formatLength(current.size).text}` : ''}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { drag.current = null; setScrubbing(false); onSettle(); }}
      onPointerLeave={() => { if (!drag.current) setHover(null); }}
      onKeyDown={onKey}
    >
      <svg className="rail__svg" viewBox={`0 0 ${width} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        {bandRects.map(({ b, x0, x1, label }) => (
          <g key={b.id}>
            <rect className="rail__band" x={x0} y={Y_MID - 7} width={x1 - x0} height={14} rx={7} fill={b.accent} />
            {label && <text className="rail__band-label" x={x0 + 6} y={Y_MID - 14}>{label}</text>}
          </g>
        ))}
        <line x1={PAD} x2={width - PAD} y1={Y_MID} y2={Y_MID} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
        {world.map((p, i) => (
          <circle
            key={p.item.id}
            className={`rail__tick ${i === focus ? 'rail__tick--current' : ''}`}
            cx={tickX[i]}
            cy={Y_MID}
            r={i === focus ? 5.5 : hover === i ? 5 : tickR}
            fill={p.item.color}
            opacity={i === focus || hover === i ? 1 : 0.8}
          />
        ))}
        <circle className="rail__cursor" cx={cursorX} cy={Y_MID} r={4} />
        {compact && current && (
          <text className="rail__band-label" x={cursorX} y={Y_MID - 14} textAnchor="middle">
            {BANDS.find((b, i) => Math.log10(current.size) >= b.from && (!BANDS[i + 1] || Math.log10(current.size) < BANDS[i + 1].from))?.label}
          </text>
        )}
      </svg>
      {showTip && hovered && (
        <div className="rail__tip" style={{ left: Math.min(width - 90, Math.max(90, tickX[hover!])) }}>
          {hovered.name}<span className="mono">{formatLength(hovered.size).text}</span>
        </div>
      )}
    </div>
  );
});
