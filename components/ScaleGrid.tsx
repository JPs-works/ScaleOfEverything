import React from 'react';
import { niceScaleBar } from '../utils/formatting';
import { Rich } from './Rich';

/** Scale bar for a panel whose shorter side spans 10^span metres: unit first, then 1/2/5 in that unit. */
export function ScaleBar({ span, minDim, compact }: { span: number; minDim: number; compact: boolean }) {
  const metresPerPx = 10 ** span / Math.max(1, minDim);
  const maxPx = compact ? 80 : 120;
  const { meters, label } = niceScaleBar(maxPx * metresPerPx);
  const widthPx = meters / metresPerPx;
  return (
    <div className={`absolute ${compact ? 'bottom-2 left-3' : 'bottom-3 left-4'} text-[11px] tabular-nums text-white/75`}>
      <div className="mb-1">
        <span className="sr-only">Scale bar: </span>
        <Rich text={label} />
      </div>
      <div className="h-1.5 border-x border-b border-white/60" style={{ width: widthPx }} aria-hidden />
    </div>
  );
}
