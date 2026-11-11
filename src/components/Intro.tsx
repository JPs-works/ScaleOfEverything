import type { ScaleItem } from '../types';

interface Props {
  items: ScaleItem[];
  onStart: (id?: string) => void;
}

const QUICK = ['proton', 'coronavirus', 'human', 'earth', 'sun', 'milky-way'];

export function Intro({ items, onStart }: Props) {
  const quick = QUICK.map((id) => items.find((i) => i.id === id)).filter((x): x is ScaleItem => !!x);
  return (
    <div className="overlay overlay--intro" role="dialog" aria-modal="true" aria-labelledby="intro-title">
      <div className="dialog">
        <div className="intro__eyebrow">An interactive journey</div>
        <h1 id="intro-title" className="intro__title">The Scale of Everything</h1>
        <p className="intro__lede">
          From the Planck length to the edge of the observable universe: more than sixty orders of magnitude,
          every object drawn at true relative size, one honest comparison at a time.
        </p>
        <div className="intro__actions">
          <button className="btn-primary" onClick={() => onStart()} autoFocus>Start at human scale</button>
          <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>or jump straight to</span>
        </div>
        <div className="intro__jumps">
          {quick.map((q) => (
            <button key={q.id} onClick={() => onStart(q.id)}>
              <i className="chip__dot" style={{ ['--chip-color' as string]: q.color }} />{q.name}
            </button>
          ))}
        </div>
        <div className="intro__hints">
          <span><kbd>←</kbd><kbd>→</kbd> step between objects</span>
          <span>scroll or drag to zoom</span>
          <span>drag the rail to scrub</span>
          <span><kbd>?</kbd> help</span>
        </div>
      </div>
    </div>
  );
}
