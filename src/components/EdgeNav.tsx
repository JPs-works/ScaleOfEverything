import { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ScaleItem } from '../types';
import { sizePhrase } from '../lib/analogy';

interface Props {
  prev?: ScaleItem;
  next?: ScaleItem;
  onPrev: () => void;
  onNext: () => void;
}

/** Previous / next controls that also preview what is coming: the smaller object left, the larger right. */
export const EdgeNav = memo(function EdgeNav({ prev, next, onPrev, onNext }: Props) {
  return (
    <nav className="stepnav" aria-label="Step along the ladder">
      <button className="stepnav__btn stepnav__btn--prev" onClick={onPrev} disabled={!prev} aria-label={prev ? `Smaller: ${prev.name}` : 'At the smallest object'}>
        <ChevronLeft size={18} />
        <span className="stepnav__text">
          <small>Smaller</small>
          <strong>{prev ? prev.name : 'Start'}</strong>
          {prev && <em>{sizePhrase(prev)}</em>}
        </span>
      </button>
      <span className="stepnav__divider" />
      <button className="stepnav__btn stepnav__btn--next" onClick={onNext} disabled={!next} aria-label={next ? `Larger: ${next.name}` : 'At the largest object'}>
        <span className="stepnav__text">
          <small>Larger</small>
          <strong>{next ? next.name : 'End'}</strong>
          {next && <em>{sizePhrase(next)}</em>}
        </span>
        <ChevronRight size={18} />
      </button>
    </nav>
  );
});
