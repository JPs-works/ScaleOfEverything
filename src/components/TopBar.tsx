import { HelpCircle, List } from 'lucide-react';
import type { Mode } from '../types';
import { memo } from 'react';

interface Props {
  mode: Mode;
  onMode: (m: Mode) => void;
  onIndex: () => void;
  onHelp: () => void;
}

export function Brand() {
  return (
    <div className="brand" aria-label="The Scale of Everything">
      <svg className="brand__mark" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="rgba(255,255,255,0.06)" />
        <circle cx="32" cy="32" r="18" fill="none" stroke="var(--accent)" strokeWidth="3" />
        <circle cx="32" cy="32" r="5" fill="#fff" />
      </svg>
      <span className="brand__name">The Scale of Everything<small>from the Planck length to the cosmos</small></span>
    </div>
  );
}

export const TopBar = memo(function TopBar({ mode, onMode, onIndex, onHelp }: Props) {
  return (
    <header className="topbar">
      <Brand />
      <div>
        <div className="seg" role="group" aria-label="Mode">
          <button className="seg__btn" aria-pressed={mode === 'journey'} onClick={() => onMode('journey')}>Journey</button>
          <button className="seg__btn" aria-pressed={mode === 'compare'} onClick={() => onMode('compare')}>Compare</button>
        </div>
      </div>
      <div className="topbar__right">
        <button className="iconbtn" onClick={onIndex} aria-label="All objects" title="All objects (I)"><List size={16} /><span>All objects</span></button>
        <button className="iconbtn iconbtn--round" onClick={onHelp} aria-label="Help" title="Help (?)"><HelpCircle size={17} /></button>
      </div>
    </header>
  );
});
