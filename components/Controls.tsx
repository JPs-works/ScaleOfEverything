import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ScaleItem, ScaleMode } from '../types';
import { ratioParts } from '../utils/formatting';
import { comparative } from '../utils/scale';
import { Scrubber } from './Scrubber';
import { RadioGroup } from './RadioGroup';
import { Rich } from './Rich';

interface DockProps {
  left: ScaleItem;
  right: ScaleItem;
  leftIndex: number;
  rightIndex: number;
  mode: ScaleMode;
  onMode: (m: ScaleMode) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  prevLabel: string;
  nextLabel: string;
  onScrub: (span: number) => void;
  compact: boolean;
  /** Narrow screens stack the scale switch above the scrubber. */
  narrow: boolean;
}

/** "Earth is 7.5 million times bigger than Human" with the scientific form underneath. */
export function Comparison({ left, right, compact }: { left: ScaleItem; right: ScaleItem; compact: boolean }) {
  if (left.id === right.id) {
    return <p className="text-center text-sm text-white/75">Same item on both sides</p>;
  }
  const [big, small] = left.size >= right.size ? [left, right] : [right, left];
  const { main, sci } = ratioParts(big.size / small.size);
  return (
    <p className={`text-center leading-snug ${compact ? 'text-[13px]' : 'text-sm'}`} aria-live="polite">
      <span className="font-semibold text-white">{big.name}</span>
      <span className="text-white/75"> is </span>
      <strong className="text-base font-semibold text-accent-soft">
        <Rich text={main} />
      </strong>
      <span className="text-white/75"> {comparative(big.dimension, small.dimension)} than </span>
      <span className="font-semibold text-white">{small.name}</span>
      {sci && (
        <span className="block text-xs text-white/65">
          ≈ <Rich text={sci} />
        </span>
      )}
    </p>
  );
}

const MODES: { id: ScaleMode; label: string; short: string; hint: string }[] = [
  { id: 'left', label: 'Same scale · fit left', short: 'Fit left', hint: 'Both panels share one scale, set so the left item fills its panel' },
  { id: 'right', label: 'Same scale · fit right', short: 'Fit right', hint: 'Both panels share one scale, set so the right item fills its panel' },
  { id: 'each', label: 'Separate scales', short: 'Each', hint: 'Each panel is scaled to fit its own item (not to scale with each other)' },
];

export function ModeSwitch({ mode, onMode, compact }: { mode: ScaleMode; onMode: (m: ScaleMode) => void; compact: boolean }) {
  return (
    <RadioGroup
      label="Scale"
      value={mode}
      onChange={onMode}
      options={MODES.map((m) => ({ id: m.id, label: compact ? m.short : m.label, title: m.hint }))}
      className="flex shrink-0 items-center gap-0.5 rounded-full border border-white/10 bg-black/40 p-0.5"
      optionClass={(on) =>
        `rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
          on ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white'
        }`
      }
    />
  );
}

function StepButton({ dir, onClick, disabled, label }: { dir: 'prev' | 'next'; onClick: () => void; disabled: boolean; label: string }) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-25 focus-visible:outline-2 focus-visible:outline-accent"
    >
      <Icon size={20} aria-hidden />
    </button>
  );
}

/** Bottom dock: step buttons around the comparison, scale mode, and the log scrubber. */
export function Dock(p: DockProps) {
  return (
    <div className={`relative z-20 border-t border-white/5 bg-cosmos/80 backdrop-blur-md ${p.compact ? 'px-3 pb-2 pt-2' : 'px-5 pb-2 pt-3'}`}>
      <div className="mx-auto flex max-w-4xl items-center gap-3">
        <StepButton dir="prev" onClick={p.onPrev} disabled={!p.canPrev} label={p.prevLabel} />
        <div className="min-w-0 flex-1">
          <Comparison left={p.left} right={p.right} compact={p.compact} />
        </div>
        <StepButton dir="next" onClick={p.onNext} disabled={!p.canNext} label={p.nextLabel} />
      </div>
      <div className={`mx-auto mt-2 flex max-w-5xl items-center ${p.narrow ? 'flex-col gap-1.5' : 'gap-4'}`}>
        <ModeSwitch mode={p.mode} onMode={p.onMode} compact={p.compact} />
        <div className="w-full min-w-0 flex-1">
          <Scrubber leftIndex={p.leftIndex} rightIndex={p.rightIndex} mode={p.mode} compact={p.compact} onScrub={p.onScrub} />
        </div>
      </div>
    </div>
  );
}
