import { memo, useEffect, useMemo, useRef } from 'react';
import { backdropForLog } from '../lib/bands';

interface Props {
  /** log10 of the length that spans half the viewport height — continuous as the camera zooms. */
  log10Scale: number;
  /** Journey position: drives a gentle star drift. */
  t: number;
  reduced: boolean;
}

// Deterministic star field so the backdrop is stable across renders.
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Horizontal period of the star pattern in px; the drift wraps invisibly at this distance. */
const PERIOD = 600;

export const Backdrop = memo(function Backdrop({ log10Scale, t, reduced }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const bd = backdropForLog(log10Scale);
  const stars = useMemo(() => {
    const rnd = mulberry32(42);
    return Array.from({ length: 160 }, () => ({ x: rnd() * PERIOD, y: rnd(), r: 0.4 + rnd() * 1.3, a: 0.25 + rnd() * 0.75 }));
  }, []);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    let raf = 0;
    let lastW = 0, lastH = 0;
    const draw = () => {
      raf = 0;
      const w = Math.round(c.clientWidth), h = Math.round(c.clientHeight);
      if (!w || !h) return;
      if (w !== lastW || h !== lastH) { c.width = w; c.height = h; lastW = w; lastH = h; }
      const ctx = c.getContext('2d'); if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      // Tile the pattern across the width so a translate of up to one PERIOD is seamless.
      for (let ox = 0; ox < w + PERIOD; ox += PERIOD) {
        for (const s of stars) {
          const x = ox + s.x;
          if (x > w + 2) continue;
          ctx.globalAlpha = s.a;
          ctx.beginPath(); ctx.arc(x, s.y * h, s.r, 0, Math.PI * 2); ctx.fill();
        }
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(draw); };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(c);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, [stars]);

  // Positive modulo so the wrap never jumps.
  const drift = reduced ? 0 : -(((t * 23) % PERIOD) + PERIOD) % PERIOD;
  return (
    <div className="backdrop" aria-hidden="true" style={{ background: `linear-gradient(180deg, ${bd.top} 0%, ${bd.bottom} 100%)` }}>
      <canvas ref={ref} className="backdrop__stars" style={{ opacity: bd.stars, transform: `translate3d(${drift}px, 0, 0)` }} />
      <div className="backdrop__vignette" />
    </div>
  );
});
