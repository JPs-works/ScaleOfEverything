import { memo } from 'react';
import { niceScaleBar } from '../lib/format';

export const ScaleBar = memo(function ScaleBar({ mpp, compact }: { mpp: number; compact?: boolean }) {
  const bar = compact ? niceScaleBar(mpp, 56, 120) : niceScaleBar(mpp);
  return (
    <div className="scalebar" aria-hidden="true">
      <div className="scalebar__bar" style={{ width: bar.px }} />
      <div className="scalebar__label">{bar.label}</div>
    </div>
  );
});
