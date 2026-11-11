import { ChevronDown } from 'lucide-react';
import { forwardRef, memo } from 'react';
import type { ScaleItem } from '../types';
import type { Comparison } from '../lib/analogy';
import { dimensionNoun, sizePhrase } from '../lib/analogy';
import { formatMetersSci, formatLength, formatRatio } from '../lib/format';
import { bandForSize } from '../lib/bands';
import { dimensionWords, withArticle } from '../lib/text';

interface Props {
  item: ScaleItem;
  comparison: Comparison | null;
  /** Compare mode shows both objects' blurbs. */
  pair?: [ScaleItem, ScaleItem];
  factsOpen: boolean;
}

const KIND_LABEL: Record<ScaleItem['kind'], string> = {
  particle: 'Particle', atom: 'Atom', molecule: 'Molecule', virus: 'Virus', cell: 'Cell', organism: 'Living thing',
  object: 'Object', structure: 'Structure', landform: 'Landform', world: 'World', star: 'Star', nebula: 'Nebula',
  cluster: 'Cluster', galaxy: 'Galaxy', cosmic: 'Cosmic', distance: 'Distance',
};

/** Scientific notation adds nothing for everyday sizes; show it only beyond ±4 orders. */
const showSci = (m: number) => { const e = Math.floor(Math.log10(m)); return e < -2 || e > 3; };

export const StoryPanel = memo(forwardRef<HTMLElement, Props>(function StoryPanel({ item, comparison, pair, factsOpen }, ref) {
  const band = bandForSize(item.size);
  const c = comparison;
  const other = c ? (c.small.id === item.id ? c.big : c.small) : null;
  const isBigger = c ? c.big.id === item.id : true;
  const words = dimensionWords(item.sizeLabel);
  const inverse = c && !isBigger ? `1/${formatRatio(c.ratio).short.replace('×', '')}` : null;

  return (
    <aside className="story" ref={ref} aria-live="off">
      <div className="story__body" key={item.id}>
        <div className="story__eyebrow">
          <span className="chip" style={{ ['--chip-color' as string]: item.color }}><i className="chip__dot" />{KIND_LABEL[item.kind]}</span>
          <span>{band.label}</span>
          {item.speculative && <span className="chip chip--warn">Theoretical</span>}
        </div>
        <h2 className="story__title">{item.name}</h2>
        <div className="story__size">
          <span className="story__size-main">{sizePhrase(item)}</span>
          <span> · {item.sizeLabel.toLowerCase()}</span>
          {showSci(item.size) && <span className="story__size-sci"> · {formatMetersSci(item.size)}</span>}
        </div>
        {!pair && <p className="story__desc">{item.description}</p>}

        {c && other && (
          <div className="story__ratio">
            <div className="story__ratio-big">{inverse ?? c.ratioShort}</div>
            <div className="story__ratio-text">
              {isBigger
                ? <>{c.ratio < 1.25 ? 'slightly' : ''} {words.comparative} than <em>{withArticle(other)}</em></>
                : <>the {dimensionNoun(other.sizeLabel)} of <em>{withArticle(other)}</em></>}
            </div>
            <ul className="story__lines">
              <li>{c.fit}</li>
              {c.analogy && <li>{c.analogy}</li>}
              {!pair && isBigger && item.gapNote && <li className="story__gap">{item.gapNote}</li>}
            </ul>
          </div>
        )}

        {pair && (
          <div className="story__pair">
            {pair.map((p) => (
              <div key={p.id}>
                <h4>{p.name}</h4>
                <div className="mono">{formatLength(p.size).text} · {p.sizeLabel.toLowerCase()}</div>
                <p>{p.description}</p>
              </div>
            ))}
          </div>
        )}

        {!pair && item.facts.length > 0 && (
          <details className="story__facts" open={factsOpen}>
            <summary><ChevronDown size={14} /> Did you know</summary>
            <ul>{item.facts.map((f, i) => <li key={i}>{f}</li>)}</ul>
            {item.source && item.source !== 'legacy' && <div className="story__source">Size: {item.source}</div>}
          </details>
        )}
      </div>
    </aside>
  );
}));
