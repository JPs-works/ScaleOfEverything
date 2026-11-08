import React, { Component, Suspense, lazy, useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { Info, List, Maximize2, Minimize2, MousePointerClick, Orbit } from 'lucide-react';
import { DEFAULT_LEFT, DEFAULT_RIGHT, ITEM_INDEX, SCALE_ITEMS } from './constants';
import type { ScaleMode, Side } from './types';
import { PanelOverlay } from './components/InfoPanel';
import { Dock } from './components/Controls';
import { Drawer } from './components/Drawer';
import { AboutDialog } from './components/AboutDialog';
import { setReducedMotion, setSpans, viewStore } from './state/view';
import { layoutStore } from './state/layout';
import { readinessStore } from './state/readiness';
import { LOG_MAX, LOG_MIN, clampSpan, itemIndexForSpan, spanFor } from './utils/scale';
import { useReducedMotion } from './hooks/useMediaQuery';

// three.js / R3F live in a separate chunk so the DOM shell paints first.
const Stage3D = lazy(() => import('./components/Stage3D').then((m) => ({ default: m.Stage3D })));
const PanelView = lazy(() => import('./components/Stage3D').then((m) => ({ default: m.PanelView })));

const N = SCALE_ITEMS.length;
const EMBEDDED = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();
const HINT_KEY = 'scale-of-everything:hint-dismissed';

// ------------------------------------------------------------------ state

interface State {
  left: number;
  right: number;
  /** Item that stays put while the arrows step the other side. */
  keep: Side | null;
  mode: ScaleMode;
  /** Bumped by every action that should re-frame the camera (not by free scrubbing). */
  navId: number;
}

type Action =
  | { type: 'step'; dir: 1 | -1 }
  | { type: 'select'; side: Side; index: number }
  | { type: 'mode'; mode: ScaleMode }
  | { type: 'swapRef' }
  | { type: 'toggleKeep'; side: Side }
  | { type: 'scrub'; left: number; right: number; mode: ScaleMode }
  | { type: 'load'; state: Partial<State> };

const validIndex = (i: unknown): i is number => Number.isInteger(i) && (i as number) >= 0 && (i as number) < N;

function canStep(s: State, dir: 1 | -1) {
  if (s.keep === 'left') return dir > 0 ? s.right < N - 1 : s.right > 0;
  if (s.keep === 'right') return dir > 0 ? s.left < N - 1 : s.left > 0;
  return dir > 0 ? Math.max(s.left, s.right) < N - 1 : Math.min(s.left, s.right) > 0;
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'step': {
      if (!canStep(s, a.dir)) return s;
      const nav = s.navId + 1;
      if (s.keep === 'left') return { ...s, right: s.right + a.dir, navId: nav };
      if (s.keep === 'right') return { ...s, left: s.left + a.dir, navId: nav };
      return { ...s, left: s.left + a.dir, right: s.right + a.dir, navId: nav };
    }
    case 'select':
      if (!validIndex(a.index)) return s;
      return { ...s, [a.side]: a.index, navId: s.navId + 1 };
    case 'mode':
      return { ...s, mode: a.mode, navId: s.navId + 1 };
    case 'swapRef':
      return { ...s, mode: s.mode === 'left' ? 'right' : 'left', navId: s.navId + 1 };
    case 'toggleKeep':
      return { ...s, keep: s.keep === a.side ? null : a.side };
    case 'scrub':
      if (!validIndex(a.left) || !validIndex(a.right)) return s;
      return { ...s, left: a.left, right: a.right, mode: a.mode };
    case 'load': {
      const next = { ...s, navId: s.navId + 1 };
      if (validIndex(a.state.left)) next.left = a.state.left;
      if (validIndex(a.state.right)) next.right = a.state.right;
      if (a.state.mode === 'left' || a.state.mode === 'right' || a.state.mode === 'each') next.mode = a.state.mode;
      if (a.state.keep === 'left' || a.state.keep === 'right' || a.state.keep === null) next.keep = a.state.keep;
      return next;
    }
  }
}

// ------------------------------------------------------------- deep link

/** Parse the hash; unknown or hostile values (e.g. "__proto__") are ignored. */
function parseHash(): Partial<State> {
  let p: URLSearchParams;
  try {
    p = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  } catch {
    return {};
  }
  const out: Partial<State> = {};
  const l = ITEM_INDEX.get(p.get('left') ?? '');
  const r = ITEM_INDEX.get(p.get('right') ?? '');
  const scale = p.get('scale'), keep = p.get('keep');
  if (validIndex(l)) out.left = l;
  if (validIndex(r)) out.right = r;
  if (scale === 'left' || scale === 'right' || scale === 'each') out.mode = scale;
  if (keep === 'left' || keep === 'right') out.keep = keep;
  return out;
}

function toHash(s: State) {
  const p = new URLSearchParams({ left: SCALE_ITEMS[s.left].id, right: SCALE_ITEMS[s.right].id, scale: s.mode });
  if (s.keep) p.set('keep', s.keep);
  return `#${p.toString()}`;
}

const initialState = (): State => {
  const base: State = { left: ITEM_INDEX.get(DEFAULT_LEFT)!, right: ITEM_INDEX.get(DEFAULT_RIGHT)!, keep: null, mode: 'right', navId: 0 };
  return reducer(base, { type: 'load', state: parseHash() });
};

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  if (!el || !el.getAttribute) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || ['slider', 'radio'].includes(el.getAttribute('role') ?? '');
};

const readHintDismissed = () => {
  try {
    return localStorage.getItem(HINT_KEY) === '1';
  } catch {
    return false;
  }
};

// --------------------------------------------------------------- canvas guard

class CanvasBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: unknown) {
    console.warn('[scale] 3D view unavailable', e);
  }
  render() {
    return this.state.failed ? <GlUnavailable /> : this.props.children;
  }
}

const GlUnavailable = () => (
  <div className="absolute inset-0 z-[5] flex items-center justify-center p-6 text-center text-sm text-white/75" role="status">
    3D view unavailable on this device (WebGL could not start or was lost). Sizes and comparisons still work.
  </div>
);

// -------------------------------------------------------------------- app

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [drawer, setDrawer] = useState<Side | null>(null);
  const [about, setAbout] = useState(false);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [glLost, setGlLost] = useState(false);
  // Inside an iframe the stage only captures wheel/touch after a click, so the host page keeps scrolling.
  const [active, setActive] = useState(!EMBEDDED);
  const [hintDismissed, setHintDismissed] = useState(readHintDismissed);
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRefs = { left: useRef<HTMLDivElement>(null), right: useRef<HTMLDivElement>(null) };
  const stateRef = useRef(state);
  stateRef.current = state;
  const activeRef = useRef(active);
  activeRef.current = active;
  const firstFrame = useRef(true);

  const left = SCALE_ITEMS[state.left];
  const right = SCALE_ITEMS[state.right];
  const compact = size.w < 640 || size.h < 460;
  const stacked = size.w < 600 || (size.w < 820 && size.h > size.w * 1.1);

  useEffect(() => setReducedMotion(reduced), [reduced]);

  const dismissHint = useCallback(() => {
    setHintDismissed(true);
    try {
      localStorage.setItem(HINT_KEY, '1');
    } catch {
      /* private mode: fine, hint just shows again next time */
    }
  }, []);

  // Re-frame on navigation (not while scrubbing freely).
  useEffect(() => {
    const s = stateRef.current;
    const l = spanFor(SCALE_ITEMS[s.left]);
    const r = spanFor(SCALE_ITEMS[s.right]);
    if (s.mode === 'each') setSpans(l, r, firstFrame.current);
    else {
      const shared = s.mode === 'left' ? l : r;
      setSpans(shared, shared, firstFrame.current);
    }
    firstFrame.current = false;
  }, [state.navId]);

  // URL hash deep link (replaceState: no history spam, works inside the iframe).
  useEffect(() => {
    const h = toHash(state);
    if (window.location.hash !== h) history.replaceState(null, '', h);
  }, [state.left, state.right, state.mode, state.keep]);
  useEffect(() => {
    const onHash = () => {
      const parsed = parseHash();
      if (Object.keys(parsed).length) dispatch({ type: 'load', state: parsed });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Leaving the iframe (click on the host page) hands scrolling back to the page.
  useEffect(() => {
    if (!EMBEDDED) return;
    const onBlur = () => setActive(false);
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, []);

  // Root + panel sizes.
  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => {
      const r = rootRef.current?.getBoundingClientRect();
      if (r) setSize({ w: r.width, h: r.height });
      (['left', 'right'] as Side[]).forEach((side) => {
        const el = panelRefs[side].current;
        if (el) {
          const b = el.getBoundingClientRect();
          layoutStore.set((s) => ({ ...s, [side]: { w: b.width, h: b.height } }));
        }
      });
    });
    [rootRef, panelRefs.left, panelRefs.right].forEach((r) => r.current && ro.observe(r.current));
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stacked]);

  // Readiness attributes for tests/automation.
  const leftStatus = readinessStore.use((s) => (s.left.id === left.id ? s.left.status : 'loading'));
  const rightStatus = readinessStore.use((s) => (s.right.id === right.id ? s.right.status : 'loading'));
  const ready = leftStatus !== 'loading' && rightStatus !== 'loading';

  // ---- scrubbing (wheel / drag / pinch / scrubber) ----
  const scrubTo = useCallback((target: number, immediate: boolean) => {
    const span = clampSpan(target);
    const s = stateRef.current;
    const mode: ScaleMode = s.mode === 'each' ? 'right' : s.mode;
    const i = itemIndexForSpan(span);
    let l = s.left, r = s.right;
    if (s.keep === 'left') r = i;
    else if (s.keep === 'right') l = i;
    else if (mode === 'right') {
      r = Math.max(1, i);
      l = r - 1;
    } else {
      l = Math.min(N - 2, i);
      r = l + 1;
    }
    setSpans(span, span, immediate);
    if (l !== s.left || r !== s.right || mode !== s.mode) dispatch({ type: 'scrub', left: l, right: r, mode });
  }, []);

  const currentTarget = () => {
    const v = viewStore.get();
    return stateRef.current.mode === 'left' ? v.targetLeft : v.targetRight;
  };

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // Not activated (embedded): let the host page scroll, unless it's a pinch / ⌘-scroll.
      if (!activeRef.current && !e.ctrlKey && !e.metaKey) return;
      const unit = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1;
      const k = e.ctrlKey ? 0.012 : 0.0025;
      const cur = currentTarget();
      const next = cur + e.deltaY * unit * k;
      // At either end of the range, let the scroll through instead of trapping it.
      if ((next >= LOG_MAX && cur >= LOG_MAX - 1e-6) || (next <= LOG_MIN && cur <= LOG_MIN + 1e-6)) return;
      e.preventDefault();
      dismissHint();
      scrubTo(next, false);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [scrubTo, dismissHint]);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef(0);
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, [role="slider"]')) return;
    if (!activeRef.current) {
      // First click/tap only activates; it doesn't start a drag.
      setActive(true);
      dismissHint();
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchDist.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const next = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, next);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist.current > 0 && d > 0) scrubTo(currentTarget() - Math.log10(d / pinchDist.current) * 1.5, true);
      pinchDist.current = d;
    } else {
      // One finger / mouse: drag right or up to travel to larger scales.
      const delta = (next.x - prev.x - (next.y - prev.y)) / 150;
      if (delta) {
        dismissHint();
        scrubTo(currentTarget() + delta, true);
      }
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    pinchDist.current = 0;
  };

  // ---- actions ----
  const defaultDrawerSide = (): Side => (state.keep === 'right' ? 'left' : state.keep === 'left' ? 'right' : state.mode === 'left' ? 'left' : 'right');
  const openDrawer = (side?: Side) => setDrawer(side ?? defaultDrawerSide());

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else rootRef.current?.requestFullscreen?.().catch(() => {});
  };
  useEffect(() => {
    const on = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);

  // ---- keyboard (one stable listener reading the latest state through refs) ----
  const keyHandler = useRef<(e: KeyboardEvent) => void>(() => {});
  keyHandler.current = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (drawer) setDrawer(null);
      else if (about) setAbout(false);
      return;
    }
    if (drawer || about || isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const handled = (() => {
      switch (k) {
        case 'ArrowRight': dispatch({ type: 'step', dir: 1 }); return true;
        case 'ArrowLeft': dispatch({ type: 'step', dir: -1 }); return true;
        case 'ArrowUp': case '-': case '_': scrubTo(currentTarget() + 0.25, false); return true;
        case 'ArrowDown': case '+': case '=': scrubTo(currentTarget() - 0.25, false); return true;
        case 's': dispatch({ type: 'swapRef' }); return true;
        case 'f': dispatch({ type: 'mode', mode: stateRef.current.mode === 'each' ? 'right' : 'each' }); return true;
        case 'l': dispatch({ type: 'toggleKeep', side: 'left' }); return true;
        case 'r': dispatch({ type: 'toggleKeep', side: 'right' }); return true;
        case '/': case 'i': openDrawer(); return true;
        case '?': setAbout(true); return true;
        default: return false;
      }
    })();
    if (handled) {
      e.preventDefault();
      dismissHint();
    }
  };
  useEffect(() => {
    const on = (e: KeyboardEvent) => keyHandler.current(e);
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  const stepLabel = (dir: 1 | -1) => {
    const word = dir > 0 ? 'larger' : 'smaller';
    if (state.keep === 'left') return `Right side: next ${word} item`;
    if (state.keep === 'right') return `Left side: next ${word} item`;
    return `Both sides: step to ${word} items`;
  };

  const panel = (side: Side) => {
    const item = side === 'left' ? left : right;
    const framed = state.mode === side;
    return (
      <div
        ref={panelRefs[side]}
        className={`relative min-h-0 min-w-0 flex-1 overflow-hidden ${side === 'left' ? (stacked ? 'border-b' : 'border-r') : ''} border-white/5 transition-colors duration-500 ${
          framed ? 'bg-white/[0.015]' : ''
        }`}
        aria-label={`${side} panel: ${item.name}`}
        role="group"
      >
        <Suspense fallback={null}>
          <PanelView side={side} item={item} reduced={reduced} />
        </Suspense>
        <PanelOverlay
          side={side}
          item={item}
          kept={state.keep === side}
          onToggleKeep={() => dispatch({ type: 'toggleKeep', side })}
          onChange={() => openDrawer(side)}
          compact={compact}
          notToScale={state.mode === 'each'}
        />
      </div>
    );
  };

  const showHint = !active || !hintDismissed;

  return (
    <div
      ref={rootRef}
      className="relative flex h-full w-full flex-col overflow-hidden bg-cosmos text-stardust"
      data-ready={ready ? '1' : '0'}
      data-left={left.id}
      data-right={right.id}
      data-left-status={leftStatus}
      data-right-status={rightStatus}
      data-active={active ? '1' : '0'}
    >
      <div className="cosmos-backdrop pointer-events-none absolute inset-0" aria-hidden />

      {/* Top bar */}
      <header className={`relative z-30 flex shrink-0 items-center justify-between gap-3 ${compact ? 'px-3 py-2' : 'px-5 py-3'}`}>
        <h1 className={`flex items-center gap-2 font-semibold tracking-tight text-white ${compact ? 'text-sm' : 'text-base'}`}>
          <Orbit size={compact ? 16 : 18} className="text-accent" aria-hidden />
          Scale of Everything
        </h1>
        <nav className="flex items-center gap-1.5" aria-label="App">
          <button type="button" onClick={() => openDrawer()} className="toolbar-btn" aria-label="All items">
            <List size={14} aria-hidden />
            {!compact && <span>All items</span>}
          </button>
          <button type="button" onClick={() => setAbout(true)} className="toolbar-btn" aria-label="About and credits">
            <Info size={14} aria-hidden />
            {!compact && <span>Credits</span>}
          </button>
          {document.fullscreenEnabled && (
            <button type="button" onClick={toggleFullscreen} className="toolbar-btn" aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}>
              {isFullscreen ? <Minimize2 size={14} aria-hidden /> : <Maximize2 size={14} aria-hidden />}
            </button>
          )}
        </nav>
      </header>

      {/* Stage: one canvas, two scissored views */}
      <div
        ref={stageRef}
        className={`relative z-10 flex min-h-0 flex-1 ${active ? 'touch-none cursor-grab active:cursor-grabbing' : 'touch-pan-y cursor-pointer'} ${stacked ? 'flex-col' : 'flex-row'}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <CanvasBoundary>
          <Suspense fallback={null}>
            <Stage3D onContextLost={setGlLost} />
          </Suspense>
        </CanvasBoundary>
        {glLost && <GlUnavailable />}
        {panel('left')}
        {panel('right')}

        {showHint && (
          <div className="pointer-events-none absolute inset-x-0 bottom-14 z-20 flex justify-center px-4">
            <button
              type="button"
              onClick={() => {
                setActive(true);
                dismissHint();
              }}
              className="pointer-events-auto flex max-w-md items-center gap-2 rounded-full border border-white/15 bg-black/75 px-4 py-2 text-[13px] text-white shadow-2xl backdrop-blur-md animate-fade-in focus-visible:outline-2 focus-visible:outline-accent"
            >
              <MousePointerClick size={16} className="shrink-0 text-accent-soft" aria-hidden />
              <span>
                {!active && <strong className="font-semibold">Click to explore · </strong>}
                Scroll, drag or pinch to travel through scale · ← → to step
              </span>
            </button>
          </div>
        )}
      </div>

      <Dock
        left={left}
        right={right}
        leftIndex={state.left}
        rightIndex={state.right}
        mode={state.mode}
        onMode={(mode) => dispatch({ type: 'mode', mode })}
        onPrev={() => dispatch({ type: 'step', dir: -1 })}
        onNext={() => dispatch({ type: 'step', dir: 1 })}
        canPrev={canStep(state, -1)}
        canNext={canStep(state, 1)}
        prevLabel={stepLabel(-1)}
        nextLabel={stepLabel(1)}
        onScrub={(s) => {
          dismissHint();
          scrubTo(s, true);
        }}
        compact={compact}
        narrow={size.w < 640}
      />

      <Drawer
        isOpen={drawer !== null}
        onClose={() => setDrawer(null)}
        target={drawer ?? 'right'}
        onTargetChange={(s) => setDrawer(s)}
        onSelect={(index) => {
          dispatch({ type: 'select', side: drawer ?? 'right', index });
          setDrawer(null);
        }}
        leftIndex={state.left}
        rightIndex={state.right}
      />
      {about && <AboutDialog onClose={() => setAbout(false)} />}
    </div>
  );
}
