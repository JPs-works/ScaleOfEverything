import { memo, useMemo, type CSSProperties, type ReactNode } from 'react';
import type { Camera, Frame, Placed, ScreenRect } from '../lib/layout';
import { project } from '../lib/layout';
import { illustrationFor } from '../illustrations';
import { formatLength, formatRatio } from '../lib/format';
import { sizePhrase } from '../lib/analogy';
import { withArticle } from '../lib/text';

interface Props {
  world: Placed[];
  cam: Camera;
  vw: number;
  vh: number;
  frame: Frame;
  /** Index of the object nearest the camera. */
  focus: number;
  /** Continuous position; used to hide helpers mid-flight. */
  t: number;
  /** Vertical band (px from top / bottom) that labels must stay inside. */
  safeTop: number;
  safeBottom: number;
  /** Left edge of the composition area (the story panel sits to the left of it on desktop). */
  safeLeft: number;
  /** Compare mode: tile copies of the small object across the big one. */
  tiles?: { small: number; big: number } | null;
  children?: ReactNode;
}

const MAX_WIDTH_FACTOR = 18;  // cull objects wider than this many viewports
const FADE_START_FACTOR = 7;  // start fading giants here

function Sprite({ p, r, uid, opacity, extraClass }: { p: Placed; r: ScreenRect; uid: string; opacity: number; extraClass?: string }) {
  const art = illustrationFor(p.item);
  const style: CSSProperties = {
    width: r.width,
    height: r.height,
    transform: `translate3d(${r.left}px, ${r.top}px, 0)`,
    opacity,
  };
  // Re-render the SVG only when its size class changes, not on every frame of a zoom.
  const pxClass = r.width < 24 ? 12 : r.width < 120 ? 64 : r.width < 600 ? 300 : 1200;
  const inner = useMemo(() => <art.View uid={uid} px={pxClass} />, [art, uid, pxClass]);
  return (
    <div className={`sprite ${extraClass ?? ''}`} style={style}>
      {inner}
    </div>
  );
}

export const Stage = memo(function Stage({ world, cam, vw, vh, frame, focus, t, safeTop, safeBottom, safeLeft, tiles, children }: Props) {
  const nodes: ReactNode[] = [];
  const labels: ReactNode[] = [];
  const rects = new Map<number, ScreenRect>();
  const nearFocus = Math.abs(t - focus) < 0.35;

  for (const p of world) {
    const r = project(p, cam, vw, vh, frame);
    rects.set(p.index, r);
    const margin = 80;
    if (r.left + r.width < -margin || r.left > vw + margin) continue;
    const giant = Math.max(r.width / vw, r.height / vh);
    if (giant > MAX_WIDTH_FACTOR) continue;
    if (r.width < 0.6 && r.height < 0.6) continue;

    const opacity = giant > FADE_START_FACTOR
      ? Math.max(0, 1 - (giant - FADE_START_FACTOR) / (MAX_WIDTH_FACTOR - FADE_START_FACTOR))
      : 1;

    const tiny = Math.max(r.width, r.height) < 3;
    if (tiny) {
      const d = 3;
      nodes.push(
        <div key={p.item.id} className="sprite sprite--dot" style={{
          width: d, height: d, transform: `translate3d(${r.cx - d / 2}px, ${r.cy - d / 2}px, 0)`,
          background: p.item.color, boxShadow: `0 0 6px ${p.item.color}`,
        }} />,
      );
    } else {
      nodes.push(<Sprite key={p.item.id} p={p} r={r} uid={`${p.item.id}-s`} opacity={opacity} />);
    }

    // Museum label under the focused object and its neighbours, when big enough to read.
    const neighbour = Math.abs(p.index - focus) <= 1;
    // Only label objects whose centre is comfortably on screen, so labels never pile up at the edges or over the scale bar.
    const onScreen = r.cx > safeLeft + 70 && r.cx < vw - 130;
    const readable = neighbour && onScreen && Math.max(r.width, r.height) >= 14 && r.height < vh * 1.1 && opacity > 0.5;
    if (readable) {
      const isFocus = p.index === focus;
      const x = r.cx;
      let y = r.top + r.height + 12;
      y = Math.min(safeBottom - 40, Math.max(safeTop, y));
      labels.push(
        <div key={`l-${p.item.id}`} className={`sprite-label ${isFocus ? 'sprite-label--focus' : ''}`} style={{ transform: `translate3d(${x}px, ${y}px, 0) translateX(-50%)`, opacity }}>
          <div className="sprite-label__name">{p.item.name}</div>
          <div className="sprite-label__size">{sizePhrase(p.item)}</div>
        </div>,
      );
    }
  }

  // The previous object, when too small to see: mark where it is.
  let pin: ReactNode = null;
  if (nearFocus && focus > 0 && focus < world.length) {
    const prev = world[focus - 1];
    const r = rects.get(prev.index);
    const fr = rects.get(focus);
    if (r && fr && Math.max(r.width, r.height) < 14 && r.cx > 24 && r.cx < vw - 24) {
      const ratio = formatRatio(world[focus].item.size / prev.item.size);
      const invisible = Math.max(r.width, r.height) < 0.6;
      const text = invisible
        ? <><strong>{withArticle(prev.item, { capital: true })}</strong> is here, {ratio.short} smaller: far below one pixel</>
        : <><strong>{withArticle(prev.item, { capital: true })}</strong>, {ratio.short} smaller</>;
      // Text goes away from the focused object; if there is no room, it goes underneath.
      const roomLeft = r.cx - safeLeft - 24;
      const variant = r.cx < fr.cx ? (roomLeft > 230 ? 'left' : 'below') : 'right';
      const style: CSSProperties = variant === 'left'
        ? { transform: `translate3d(${r.cx - 10}px, ${r.cy}px, 0) translate(-100%, -50%)` }
        : variant === 'right'
          ? { transform: `translate3d(${r.cx + 10}px, ${r.cy}px, 0) translate(0, -50%)` }
          : { transform: `translate3d(${r.cx}px, ${r.cy + 12}px, 0) translate(-50%, 0)` };
      pin = (
        <div className={`pin pin--${variant}`} style={{ ...style, ['--pin-color' as string]: prev.item.color }}>
          <div className="pin__ring" />
          <div className="pin__text">{text}</div>
        </div>
      );
    }
  }

  // Compare tiles: copies of the small object across the big one's measured axis, the last one clipped to the fraction.
  const tileNodes: ReactNode[] = [];
  if (tiles) {
    const small = world[tiles.small], big = world[tiles.big];
    const rs = rects.get(small.index), rb = rects.get(big.index);
    if (rs && rb && Math.abs(t - tiles.big) < 0.08) {
      const ratio = big.item.size / small.item.size;
      const horizontal = big.item.sizeLabel !== 'Height' && big.item.sizeLabel !== 'Depth';
      const stepPx = (horizontal ? big.w : big.h) / ratio / cam.mpp;
      const whole = Math.floor(ratio);
      const frac = ratio - whole;
      if (whole >= 2 && whole <= 40 && stepPx >= 6) {
        const count = whole + (frac > 0.04 ? 1 : 0);
        for (let k = 0; k < count; k++) {
          const partial = k === whole;
          const left = horizontal ? rb.left + k * stepPx + (stepPx - rs.width) / 2 : rb.cx - rs.width / 2;
          const top = horizontal ? rb.cy - rs.height / 2 : rb.top + rb.height - (k + 1) * stepPx + (stepPx - rs.height) / 2;
          const sprite = <Sprite key={`tile-${k}`} p={small} r={{ ...rs, left: partial ? 0 : left, top: partial ? 0 : top }} uid={`${small.item.id}-t${k}`} opacity={1} extraClass="sprite--tile" />;
          if (!partial) { tileNodes.push(sprite); continue; }
          // Clip the final copy to the leftover fraction so "3.7 Moons" shows 3.7, not 3 or 4.
          const clipW = horizontal ? Math.max(0, frac * stepPx - (stepPx - rs.width) / 2) : rs.width;
          const clipH = horizontal ? rs.height : Math.max(0, frac * stepPx - (stepPx - rs.height) / 2);
          const clipLeft = horizontal ? left : left;
          const clipTop = horizontal ? top : top + rs.height - clipH;
          tileNodes.push(
            <div key={`tile-${k}`} className="sprite sprite--tileclip" style={{ width: clipW, height: clipH, transform: `translate3d(${clipLeft}px, ${clipTop}px, 0)` }}>
              <div style={{ width: rs.width, height: rs.height, position: 'absolute', left: 0, top: horizontal ? 0 : clipH - rs.height }}>
                <Sprite p={small} r={{ ...rs, left: 0, top: 0 }} uid={`${small.item.id}-t${k}`} opacity={1} extraClass="sprite--tile" />
              </div>
            </div>,
          );
        }
      }
    }
  }

  return (
    <div className="stage" aria-hidden="true">
      {nodes}
      {tileNodes}
      {labels}
      {pin}
      {children}
    </div>
  );
});

export const describeScale = (cam: Camera, vh: number): string => formatLength(cam.mpp * vh).text;
