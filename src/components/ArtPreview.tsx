// Dev-only gallery for illustration work: #/art shows every object; #/art/<id> shows one at three sizes
// on its band backdrop with the bounding box outlined, so the measured axis can be checked.

import { ITEMS } from '../data/items';
import { hasIllustration, illustrationFor } from '../illustrations';
import { backdropForLog } from '../lib/bands';
import { dimsFor } from '../lib/layout';

export function ArtPreview({ id }: { id?: string }) {
  const items = [...ITEMS].sort((a, b) => a.size - b.size);
  if (id) {
    const item = items.find((i) => i.id === id);
    if (!item) return <div style={{ padding: 40 }}>Unknown id “{id}”</div>;
    const art = illustrationFor(item);
    const bd = backdropForLog(Math.log10(item.size) + 0.3);
    const { w, h } = dimsFor(item, art.aspect);
    const sizes = [520, 160, 48, 14];
    return (
      <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${bd.top}, ${bd.bottom})`, padding: 32, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>{item.name} <span style={{ opacity: 0.5, fontWeight: 400 }}>· {item.sizeLabel} · aspect {art.aspect} · {hasIllustration(item.id) ? 'illustrated' : 'FALLBACK'}</span></h1>
        <p style={{ opacity: 0.6, marginTop: 4 }}>Box: {w.toExponential(2)} × {h.toExponential(2)} m. The dashed outline is the bounding box; the artwork must touch it on the measured axis ({item.sizeLabel === 'Height' || item.sizeLabel === 'Depth' ? 'top and bottom' : 'left and right'}).</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 48, marginTop: 24, flexWrap: 'wrap' }}>
          {sizes.map((px) => {
            const vertical = item.sizeLabel === 'Height' || item.sizeLabel === 'Depth';
            const width = vertical ? px * art.aspect : px;
            const height = vertical ? px : px / art.aspect;
            return (
              <div key={px} style={{ textAlign: 'center' }}>
                <div style={{ width, height, outline: '1px dashed rgba(255,255,255,0.35)', outlineOffset: 0 }}>
                  <art.View uid={`prev-${px}`} px={width} />
                </div>
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>{px}px</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div style={{ minHeight: '100vh', background: '#0b0b16', padding: 24, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: 20 }}>Illustrations · {items.filter((i) => hasIllustration(i.id)).length}/{items.length} done</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
        {items.map((item) => {
          const art = illustrationFor(item);
          const box = 120;
          const vertical = item.sizeLabel === 'Height' || item.sizeLabel === 'Depth';
          const width = vertical ? Math.min(box, box * art.aspect) : box;
          const height = vertical ? box : Math.min(box, box / art.aspect);
          const bd = backdropForLog(Math.log10(item.size) + 0.3);
          return (
            <a key={item.id} href={`#/art/${item.id}`} style={{ color: 'inherit', textDecoration: 'none', background: `linear-gradient(180deg, ${bd.top}, ${bd.bottom})`, borderRadius: 12, padding: 12, border: hasIllustration(item.id) ? '1px solid rgba(255,255,255,0.1)' : '1px dashed rgba(255,120,120,0.6)' }}>
              <div style={{ height: box, display: 'grid', placeItems: 'center' }}>
                <div style={{ width, height }}><art.View uid={`g-${item.id}`} px={width} /></div>
              </div>
              <div style={{ fontSize: 12, marginTop: 8, fontWeight: 600 }}>{item.name}</div>
              <div style={{ fontSize: 11, opacity: 0.55 }}>{item.id} · {item.sizeLabel}</div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
