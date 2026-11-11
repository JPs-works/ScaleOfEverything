import { X } from 'lucide-react';

export function Help({ onClose }: { onClose: () => void }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <button className="iconbtn iconbtn--round dialog__close" onClick={onClose} aria-label="Close help" autoFocus><X size={16} /></button>
        <h2 id="help-title">How to travel</h2>
        <p>Everything here is drawn in one world at true relative size. Zoom out and the last object shrinks beside the next; zoom in and it grows to fill the view.</p>
        <h3>Keyboard</h3>
        <ul>
          <li><span><kbd>→</kbd> <kbd>↓</kbd> <kbd>Space</kbd></span><span>next (larger) object</span></li>
          <li><span><kbd>←</kbd> <kbd>↑</kbd></span><span>previous (smaller) object</span></li>
          <li><span><kbd>Home</kbd> <kbd>End</kbd></span><span>smallest / largest</span></li>
          <li><span><kbd>I</kbd></span><span>index of all objects</span></li>
          <li><span><kbd>C</kbd></span><span>switch between Journey and Compare</span></li>
          <li><span><kbd>?</kbd></span><span>this help</span></li>
        </ul>
        <h3>Mouse &amp; touch</h3>
        <ul>
          <li><span>Scroll / pinch</span><span>zoom continuously; it settles on the nearest object</span></li>
          <li><span>Drag the view</span><span>pan along the ladder</span></li>
          <li><span>The rail</span><span>drag to scrub through the whole universe, or click a dot to leap to it</span></li>
        </ul>
        <h3>About the numbers</h3>
        <p>Each object is measured along the dimension people picture: height for a person or a tower, diameter for a planet or a cell, width for a hair. Sizes are typical values rounded for reading; sources are listed under each object's facts. Objects marked <em>theoretical</em> are limits or calculated lengths, not measured sizes.</p>
        <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>Illustrations are stylised, but their measured dimension is always to scale.</p>
      </div>
    </div>
  );
}
