import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ScaleItem } from '../types';
import { BANDS, bandForSize } from '../lib/bands';
import { formatLength } from '../lib/format';

interface Props {
  items: ScaleItem[];
  currentId?: string;
  title: string;
  subtitle?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function IndexDrawer({ items, currentId, title, subtitle, onSelect, onClose }: Props) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const el = listRef.current?.querySelector('[aria-current="true"]');
    el?.scrollIntoView({ block: 'center' });
  }, []);

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = items.filter((i) => !needle || i.name.toLowerCase().includes(needle) || i.kind.includes(needle) || bandForSize(i.size).label.toLowerCase().includes(needle));
    return BANDS.map((b) => ({ band: b, items: filtered.filter((i) => bandForSize(i.size).id === b.id) })).filter((g) => g.items.length);
  }, [items, q]);

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer__head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="iconbtn iconbtn--round" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="drawer__search">
          <Search size={15} />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } }} placeholder={`Search ${items.length} objects`} aria-label="Search objects" />
        </div>
        <div className="drawer__list" ref={listRef}>
          {groups.map((g) => (
            <div key={g.band.id}>
              <div className="drawer__band">{g.band.label}</div>
              {g.items.map((i) => (
                <button key={i.id} className="drawer__item" aria-current={i.id === currentId} onClick={() => onSelect(i.id)}>
                  <i className="chip__dot" style={{ ['--chip-color' as string]: i.color }} />
                  <span><strong>{i.name}</strong><small>{i.sizeLabel}{i.speculative ? ' · theoretical' : ''}</small></span>
                  <span className="mono">{formatLength(i.size).text}</span>
                </button>
              ))}
            </div>
          ))}
          {!groups.length && <div className="drawer__empty">Nothing matches “{q}”.</div>}
        </div>
      </div>
    </>
  );
}
