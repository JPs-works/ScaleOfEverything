import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { SCALE_ITEMS } from '../constants';
import type { Side } from '../types';
import { formatMeters } from '../utils/formatting';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { RadioGroup } from './RadioGroup';
import { Rich } from './Rich';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  target: Side;
  onTargetChange: (s: Side) => void;
  onSelect: (index: number) => void;
  leftIndex: number;
  rightIndex: number;
}

/** Item picker. Choose which side to fill, then an item. Esc or the backdrop closes it. */
export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, target, onTargetChange, onSelect, leftIndex, rightIndex }) => {
  const [search, setSearch] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  useFocusTrap(dialog, isOpen);

  useEffect(() => {
    if (isOpen) {
      restoreFocus.current = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => input.current?.focus());
    } else {
      setSearch('');
      restoreFocus.current?.focus?.();
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SCALE_ITEMS.map((item, index) => ({ item, index })).filter(
      ({ item }) => !q || item.name.toLowerCase().includes(q) || item.category.includes(q),
    );
  }, [search]);

  if (!isOpen) return null;
  const current = target === 'left' ? leftIndex : rightIndex;

  return (
    <div ref={dialog} className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Choose an item">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-sm flex-col border-r border-white/10 bg-cosmos shadow-2xl animate-slide-in-left">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="text-base font-semibold text-white">
            Choose an item <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-normal text-white/70">{SCALE_ITEMS.length}</span>
          </h2>
          <button type="button" onClick={onClose} aria-label="Close item list" className="rounded-lg p-2 text-white/75 hover:bg-white/10 hover:text-white">
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="space-y-3 border-b border-white/5 p-4">
          <RadioGroup<Side>
            label="Put the item on"
            value={target}
            onChange={onTargetChange}
            options={[
              { id: 'left', label: 'Left side' },
              { id: 'right', label: 'Right side' },
            ]}
            className="grid grid-cols-2 gap-1 rounded-lg bg-white/5 p-1 text-xs"
            optionClass={(on) => `rounded-md px-2 py-1.5 font-medium transition-colors ${on ? 'bg-accent text-white' : 'text-white/75 hover:text-white'}`}
          />
          <label className="relative block">
            <span className="sr-only">Search items</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={15} aria-hidden />
            <input
              ref={input}
              type="search"
              placeholder="Search items or categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
                if (e.key === 'Enter' && filtered[0]) onSelect(filtered[0].index);
              }}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </label>
        </div>

        <ul className="flex-1 overflow-y-auto p-2">
          {filtered.map(({ item, index }) => {
            const onOther = (target === 'left' ? rightIndex : leftIndex) === index;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  aria-current={current === index}
                  className={`mb-1 flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors ${
                    current === index ? 'border-accent/40 bg-accent/15' : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-medium ${current === index ? 'text-white' : 'text-white/85'}`}>{item.name}</span>
                    <span className="block font-mono text-[11px] text-white/65">
                      <Rich text={formatMeters(item.size)} /> {item.dimension} · <span className="uppercase">{item.category}</span>
                    </span>
                  </span>
                  {onOther && <span className="text-[11px] text-white/65">other side</span>}
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && <li className="p-8 text-center text-sm text-white/65">No items match "{search}"</li>}
        </ul>
      </div>
    </div>
  );
};
