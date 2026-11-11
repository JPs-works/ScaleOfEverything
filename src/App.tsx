import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ITEMS } from './data/items';
import { FAMILIAR } from './data/familiar';
import type { Mode, ScaleItem } from './types';
import { buildWorld, cameraAt, DEFAULT_FRAME, type Frame } from './lib/layout';
import { compare, sizePhrase } from './lib/analogy';
import { backdropForLog } from './lib/bands';
import { readHash, writeHash } from './lib/hash';
import { illustrationFor } from './illustrations';
import { useViewport, usePrefersReducedMotion } from './hooks/useViewport';
import { useJourney } from './hooks/useJourney';
import { Backdrop } from './components/Backdrop';
import { Stage } from './components/Stage';
import { Rail } from './components/Rail';
import { ScaleBar } from './components/ScaleBar';
import { StoryPanel } from './components/StoryPanel';
import { EdgeNav } from './components/EdgeNav';
import { TopBar } from './components/TopBar';
import { Intro } from './components/Intro';
import { Help } from './components/Help';
import { IndexDrawer } from './components/IndexDrawer';

const SORTED: ScaleItem[] = [...ITEMS].sort((a, b) => a.size - b.size);
const INDEX_BY_ID = new Map(SORTED.map((i, idx) => [i.id, idx]));
const itemById = (id?: string) => (id ? SORTED[INDEX_BY_ID.get(id) ?? -1] : undefined);
const DEFAULT_ID = INDEX_BY_ID.has('human') ? 'human' : SORTED[Math.floor(SORTED.length / 2)].id;
const INTRO_KEY = 'soe.intro.v1';

const aspectOf = (item: ScaleItem) => illustrationFor(item).aspect;

/** Two distinct ids, ordered smallest first. A duplicate is replaced by its neighbour on the ladder. */
function normalisePair(a?: string, b?: string): [string, string] {
  let ia = INDEX_BY_ID.get(a ?? '') ?? INDEX_BY_ID.get(DEFAULT_ID)!;
  let ib = INDEX_BY_ID.get(b ?? '') ?? INDEX_BY_ID.get('earth') ?? Math.min(SORTED.length - 1, ia + 1);
  if (ia === ib) ib = ia < SORTED.length - 1 ? ia + 1 : ia - 1;
  if (ia > ib) [ia, ib] = [ib, ia];
  return [SORTED[ia].id, SORTED[ib].id];
}

type DrawerPurpose = 'nav' | 'pickSmall' | 'pickLarge';

export default function App() {
  const { vw, vh, isMobile } = useViewport();
  const reduced = usePrefersReducedMotion();
  const initial = useMemo(() => readHash(), []);

  // ----- mode & selections -----
  const [mode, setMode] = useState<Mode>(initial?.mode ?? 'journey');
  const [pairIds, setPairIds] = useState<[string, string]>(() =>
    initial?.mode === 'compare' ? normalisePair(initial.a, initial.b) : normalisePair('human', 'earth'));
  const [intro, setIntro] = useState<boolean>(() => {
    try { return !initial && !localStorage.getItem(INTRO_KEY); } catch { return !initial; }
  });
  const [help, setHelp] = useState(false);
  const [drawer, setDrawer] = useState<DrawerPurpose | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // ----- worlds -----
  const journeyWorld = useMemo(() => buildWorld(SORTED, (id) => aspectOf(itemById(id)!)), []);
  const pairItems = useMemo<[ScaleItem, ScaleItem]>(() => [itemById(pairIds[0])!, itemById(pairIds[1])!], [pairIds]);
  const pairWorld = useMemo(() => buildWorld(pairItems, (id) => aspectOf(itemById(id)!)), [pairItems]);

  const startIndex = INDEX_BY_ID.get(itemById(initial?.mode === 'journey' ? initial.a : undefined)?.id ?? DEFAULT_ID) ?? 0;
  const journey = useJourney(journeyWorld.length, startIndex, reduced);
  const pairNav = useJourney(2, 1, reduced);

  const isCompare = mode === 'compare';
  const world = isCompare ? pairWorld : journeyWorld;
  const nav = isCompare ? pairNav : journey;

  // ----- layout: the story panel owns a left column on desktop, a bottom sheet on mobile -----
  const stageLeft = isMobile ? 0 : 500;
  const storyRef = useRef<HTMLElement>(null);
  const [storyH, setStoryH] = useState(0);
  useLayoutEffect(() => {
    const el = storyRef.current; if (!el) return;
    const ro = new ResizeObserver(() => setStoryH(el.getBoundingClientRect().height));
    ro.observe(el);
    setStoryH(el.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, [isMobile, isCompare]);

  const frame: Frame = useMemo(() => (
    isMobile
      ? { w: 0.72, h: 0.26, dx: 0, floor: 0.42 }
      : { ...DEFAULT_FRAME, w: 0.4 * (vw - stageLeft) / vw, h: 0.5, dx: stageLeft / 2 / vw, floor: 0.7 }
  ), [isMobile, vw, stageLeft]);

  const cam = useMemo(() => cameraAt(world, nav.t, vw, vh, frame), [world, nav.t, vw, vh, frame]);
  const focusItem = world[nav.focus]?.item ?? SORTED[0];
  const prevItem = world[nav.focus - 1]?.item;
  const nextItem = world[nav.focus + 1]?.item;

  const comparison = useMemo(() => {
    if (isCompare) return compare(pairItems[0], pairItems[1], FAMILIAR);
    return prevItem ? compare(prevItem, focusItem, FAMILIAR) : null;
  }, [isCompare, pairItems, prevItem, focusItem]);

  const log10Scale = Math.log10(cam.mpp * vh * 0.5);
  const accent = backdropForLog(log10Scale).accent;

  // ----- side effects: hash (only once motion settles), title, accent, live region -----
  useEffect(() => {
    if (intro || nav.moving) return;
    if (isCompare) writeHash({ mode: 'compare', a: pairItems[0].id, b: pairItems[1].id });
    else writeHash({ mode: 'journey', a: focusItem.id });
  }, [isCompare, pairItems, focusItem, intro, nav.moving]);

  useEffect(() => { document.title = `${focusItem.name} · The Scale of Everything`; }, [focusItem]);
  useEffect(() => { document.documentElement.style.setProperty('--accent', accent); }, [accent]);

  const [announce, setAnnounce] = useState('');
  useEffect(() => {
    const id = window.setTimeout(() => {
      setAnnounce(`${focusItem.name}, ${sizePhrase(focusItem)}. ${comparison?.headline ?? ''}`);
    }, 350);
    return () => window.clearTimeout(id);
  }, [focusItem, comparison]);

  // Stable refs so global listeners never go stale and never re-subscribe per frame.
  const navRef = useRef(nav); navRef.current = nav;
  const journeyRef = useRef(journey); journeyRef.current = journey;
  const pairNavRef = useRef(pairNav); pairNavRef.current = pairNav;
  const modeRef = useRef(mode); modeRef.current = mode;

  useEffect(() => {
    const onHash = () => {
      const h = readHash(); if (!h) return;
      if (h.mode === 'compare') {
        setMode('compare');
        setPairIds(normalisePair(h.a, h.b));
        pairNavRef.current.go(1, 'instant');
      } else {
        setMode('journey');
        const idx = INDEX_BY_ID.get(h.a ?? '');
        if (idx !== undefined && idx !== journeyRef.current.focus) journeyRef.current.go(idx, 'instant');
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // ----- overlays: inert background, focus restore -----
  const overlayOpen = intro || help || drawer !== null;
  const mainRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = mainRef.current; if (!el) return;
    if (overlayOpen) {
      returnFocus.current = (document.activeElement as HTMLElement | null) ?? null;
      el.setAttribute('inert', '');
    } else {
      el.removeAttribute('inert');
      const back = returnFocus.current;
      if (back && document.contains(back) && back !== document.body) back.focus({ preventScroll: true });
      returnFocus.current = null;
    }
  }, [overlayOpen]);

  // ----- actions -----
  const closeIntro = useCallback((id?: string) => {
    setIntro(false);
    try { localStorage.setItem(INTRO_KEY, '1'); } catch { /* private mode */ }
    if (id && INDEX_BY_ID.has(id)) journeyRef.current.go(INDEX_BY_ID.get(id)!, 'instant');
  }, []);

  const toastTimer = useRef(0);
  const showToast = useCallback((text: string) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1800);
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const switchMode = useCallback((m: Mode) => {
    if (m === modeRef.current) return;
    if (m === 'compare') {
      // Seed Compare with the current object and its smaller neighbour so the view stays familiar.
      const j = journeyRef.current;
      const cur = SORTED[j.focus] ?? SORTED[0];
      const other = SORTED[j.focus - 1] ?? SORTED[j.focus + 1];
      setPairIds(normalisePair(cur.id, other.id));
      pairNavRef.current.go(1, 'instant');
    } else {
      const idx = INDEX_BY_ID.get(itemById(pairIdsRef.current[1])!.id) ?? 0;
      journeyRef.current.go(idx, 'instant');
    }
    setMode(m);
    showToast(m === 'compare' ? 'Compare any two objects at true scale' : 'Back on the journey');
  }, [showToast]);
  const pairIdsRef = useRef(pairIds); pairIdsRef.current = pairIds;

  const selectFromDrawer = (id: string) => {
    if (drawer === 'pickSmall') setPairIds(normalisePair(id, pairIds[1] === id ? pairIds[0] : pairIds[1]));
    else if (drawer === 'pickLarge') setPairIds(normalisePair(pairIds[0] === id ? pairIds[1] : pairIds[0], id));
    else {
      if (isCompare) setMode('journey');
      const idx = INDEX_BY_ID.get(id);
      if (idx !== undefined) journey.go(idx, Math.abs(idx - journey.focus) > 12 ? 'instant' : 'tween');
    }
    setDrawer(null);
  };

  // ----- input: wheel, keys, drag, pinch -----
  const settleTimer = useRef(0);
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (overlayOpen) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('.story, .drawer, .overlay, .rail')) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh : 1;
      const dy = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * unit;
      const gain = e.ctrlKey ? 0.006 : 0.0023; // pinch-zoom gestures arrive with ctrlKey
      navRef.current.nudge(dy * gain);
      window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => navRef.current.settle(), 170);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => { window.removeEventListener('wheel', onWheel); window.clearTimeout(settleTimer.current); };
  }, [overlayOpen, vh]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.key === 'Escape') { setHelp(false); setDrawer(null); if (intro) closeIntro(); return; }
      const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (typing) return;
      if (e.key === '?') { e.preventDefault(); setHelp((h) => !h); return; }
      if (overlayOpen) return;
      // Buttons keep Space/Enter for activation; the rail handles its own arrow keys and stops propagation.
      if ((e.key === ' ' || e.key === 'Enter') && el && el !== document.body && el.closest('button, a, summary')) return;
      const n = navRef.current;
      switch (e.key) {
        case 'ArrowRight': case 'ArrowDown': case 'PageDown': e.preventDefault(); n.step(1); break;
        case ' ': e.preventDefault(); n.step(e.shiftKey ? -1 : 1); break;
        case 'ArrowLeft': case 'ArrowUp': case 'PageUp': e.preventDefault(); n.step(-1); break;
        case 'Home': e.preventDefault(); n.go(0); break;
        case 'End': e.preventDefault(); n.go(n.count - 1); break;
        case 'i': case 'I': e.preventDefault(); setDrawer('nav'); break;
        case 'c': case 'C': e.preventDefault(); switchMode(modeRef.current === 'journey' ? 'compare' : 'journey'); break;
        default: return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlayOpen, intro, closeIntro, switchMode]);

  // Pointer handling: one finger / mouse drags along the ladder; two fingers pinch to zoom.
  const drag = useRef<{ x: number; t0: number; lastX: number; lastT: number; vx: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; t0: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (overlayOpen) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const el = e.target as HTMLElement;
    if (el.closest('button, a, input, textarea, .story, .rail, .topbar, .stepnav, .scalebar, .overlay, .drawer, .drawer-backdrop')) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), t0: navRef.current.t };
      drag.current = null;
      return;
    }
    drag.current = { x: e.clientX, t0: navRef.current.t, lastX: e.clientX, lastT: performance.now(), vx: 0 };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (overlayOpen) { drag.current = null; pinch.current = null; pointers.current.clear(); return; }
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
      // Spreading fingers zooms in (toward smaller objects); each doubling moves about 1.3 objects.
      navRef.current.setInstant(pinch.current.t0 - Math.log2(dist / pinch.current.dist) * 1.3);
      return;
    }
    const d = drag.current; if (!d) return;
    const now = performance.now();
    const dt = Math.max(1, now - d.lastT);
    d.vx = 0.7 * d.vx + 0.3 * ((e.clientX - d.lastX) / dt);
    d.lastX = e.clientX; d.lastT = now;
    navRef.current.setInstant(d.t0 - (e.clientX - d.x) / (vw * 0.62));
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pinch.current) {
      if (pointers.current.size < 2) { pinch.current = null; navRef.current.settle(); }
      return;
    }
    const d = drag.current; if (!d) return;
    drag.current = null;
    const n = navRef.current;
    if (Math.abs(d.vx) > 0.9) n.step(d.vx < 0 ? 1 : -1);
    else n.settle();
  };

  // ----- composition -----
  const safeTop = 64 + (isMobile ? 8 : 16);
  const safeBottom = isMobile ? vh - 58 - storyH - 30 : vh - 72 - 18 - 62 - 12;
  const storyItem = isCompare ? pairItems[pairNav.focus === 0 ? 0 : 1] : focusItem;

  const compareBar = isCompare ? (
    <div className="comparebar" role="group" aria-label="Objects to compare">
      <button className="comparebar__pick" onClick={() => setDrawer('pickSmall')} aria-label={`Smaller object: ${pairItems[0].name}. Change`}>
        <i className="chip__dot" style={{ ['--chip-color' as string]: pairItems[0].color }} /><span>{pairItems[0].name}</span>
      </button>
      <span className="comparebar__vs" aria-hidden="true">vs</span>
      <button className="comparebar__pick" onClick={() => setDrawer('pickLarge')} aria-label={`Larger object: ${pairItems[1].name}. Change`}>
        <i className="chip__dot" style={{ ['--chip-color' as string]: pairItems[1].color }} /><span>{pairItems[1].name}</span>
      </button>
    </div>
  ) : undefined;

  return (
    <div
      className={`app ${isCompare ? 'app--compare' : ''}`}
      style={{ ['--stage-left' as string]: `${stageLeft}px`, ['--story-h' as string]: `${storyH}px`, ['--floor' as string]: `${Math.round(frame.floor * vh)}px` }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
    >
      <div ref={mainRef} className="app__main">
        <Backdrop log10Scale={log10Scale} t={nav.t} reduced={reduced} />
        <Stage
          world={world} cam={cam} vw={vw} vh={vh} frame={frame}
          focus={nav.focus} t={nav.t} safeTop={safeTop} safeBottom={safeBottom} safeLeft={stageLeft}
          tiles={isCompare ? { small: 0, big: 1 } : null}
        >
          <div className="floorline" />
        </Stage>

        <TopBar mode={mode} onMode={switchMode} onIndex={() => setDrawer('nav')} onHelp={() => setHelp(true)} />
        {compareBar}

        <EdgeNav prev={prevItem} next={nextItem} onPrev={() => nav.step(-1)} onNext={() => nav.step(1)} />

        <StoryPanel ref={storyRef} item={storyItem} comparison={comparison} pair={isCompare ? pairItems : undefined} factsOpen={!isMobile} />
        <ScaleBar mpp={cam.mpp} compact={isMobile} />

        <Rail
          world={world} t={nav.t} focus={nav.focus} vw={vw} compact={isMobile}
          onScrub={(t) => nav.setInstant(t)}
          onSettle={() => nav.settle()}
          onSelect={(i) => nav.go(i, Math.abs(i - nav.focus) > 12 ? 'instant' : 'tween')}
          onStep={(d) => nav.step(d)}
        />

        {toast && <div className="toast" role="status">{toast}</div>}
        <div className="visually-hidden" aria-live="polite" aria-atomic="true">{announce}</div>
      </div>

      {intro && <Intro items={SORTED} onStart={closeIntro} />}
      {help && <Help onClose={() => setHelp(false)} />}
      {drawer && (
        <IndexDrawer
          items={SORTED}
          currentId={drawer === 'pickSmall' ? pairItems[0].id : drawer === 'pickLarge' ? pairItems[1].id : focusItem.id}
          title={drawer === 'nav' ? 'All objects' : drawer === 'pickSmall' ? `Replace ${pairItems[0].name}` : `Replace ${pairItems[1].name}`}
          subtitle={drawer === 'nav' ? `${SORTED.length} objects, smallest to largest` : 'The pair is always shown smaller first, at true relative scale'}
          onSelect={selectFromDrawer}
          onClose={() => setDrawer(null)}
        />
      )}
    </div>
  );
}
