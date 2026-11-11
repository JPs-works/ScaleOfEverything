import React from 'react';
import { ArrowLeft, ArrowRight, ArrowRightLeft } from 'lucide-react';

interface ControlsProps {
  onPrev: () => void;
  onNext: () => void;
  onSwap: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  framedSide: 'left' | 'right';
}

export const Controls: React.FC<ControlsProps> = ({ 
  onPrev, 
  onNext, 
  onSwap,
  canGoBack, 
  canGoForward,
  framedSide
}) => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center pointer-events-none">
       {/* Pointer events auto on buttons so they are clickable */}
       
       <div className="pointer-events-auto flex items-center gap-2 bg-black/50 backdrop-blur-xl p-2 rounded-full border border-white/10 shadow-2xl">
          <button 
            onClick={onPrev}
            disabled={!canGoBack}
            className="p-3 rounded-full hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 group"
          >
             <ArrowLeft size={24} className="text-white group-hover:-translate-x-1 transition-transform" />
          </button>

          <div className="h-8 w-px bg-white/10 mx-1"></div>

          <button
            onClick={onSwap}
            className="p-3 rounded-full hover:bg-accent/20 text-white/80 hover:text-white transition-all active:scale-95 group relative"
            title="Swap Scale Reference"
          >
             <ArrowRightLeft size={20} className={`transition-transform duration-500 ${framedSide === 'right' ? 'rotate-180' : ''}`} />
          </button>

          <div className="h-8 w-px bg-white/10 mx-1"></div>

          <button 
            onClick={onNext}
            disabled={!canGoForward}
            className="p-3 rounded-full hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 group"
          >
             <ArrowRight size={24} className="text-white group-hover:translate-x-1 transition-transform" />
          </button>
       </div>
    </div>
  );
};