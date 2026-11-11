import React from 'react';
import { ScaleItem, Side } from '../types';
import { formatMeters, formatScientific } from '../utils/formatting';
import { Info, Pin, MapPinOff, ChevronDown, ChevronUp } from 'lucide-react';

interface InfoPanelProps {
  item: ScaleItem;
  side: Side;
  isPinned: boolean;
  isFramed: boolean;
  onTogglePin: () => void;
  scaleRatio?: number; // How many times bigger/smaller than the other item
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ 
  item, 
  side, 
  isPinned, 
  isFramed,
  onTogglePin, 
  scaleRatio,
  isCollapsed = true,
  onToggleCollapse
}) => {
  const handleClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on pin button
    if ((e.target as HTMLElement).closest('button[title*="Pin"]')) {
      return;
    }
    onToggleCollapse?.();
  };

  return (
    <div 
      className={`absolute bottom-4 ${side === 'left' ? 'left-4' : 'right-4'} z-20 w-80 max-w-[calc(50vw-2rem)] cursor-pointer`}
      onClick={handleClick}
    >
      <div className={`
        backdrop-blur-md bg-black/60 border border-white/10 rounded-xl shadow-2xl 
        transition-all duration-300 
        ${isFramed ? 'ring-1 ring-accent/50' : 'opacity-80 hover:opacity-100'}
        ${isPinned ? 'ring-2 ring-accent' : ''}
        ${isCollapsed ? 'p-3' : 'p-5'}
      `}>
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
           <div className="flex-1">
               <div className="flex items-center gap-2 mb-1 flex-wrap">
                 <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/70`}>
                    {item.category}
                 </span>
                 {item.speculative && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-200">
                        Speculative
                    </span>
                 )}
               </div>
               <h2 className={`font-bold text-white leading-tight text-base`}>{item.name}</h2>
           </div>
           
           <div className="flex items-center gap-1 ml-2">
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 onTogglePin();
               }}
               className={`p-2 rounded-lg transition-colors ${isPinned ? 'bg-accent text-white' : 'hover:bg-white/10 text-white/40'}`}
               title={isPinned ? "Unpin" : "Pin this item"}
             >
               {isPinned ? <MapPinOff size={16} /> : <Pin size={16} />}
             </button>
           </div>
        </div>

        {/* Simplified Size (shown when collapsed) */}
        {isCollapsed && (
          <div className="font-mono text-xs text-stardust">
            <span className="text-white font-semibold">{formatMeters(item.size)}</span>
          </div>
        )}

        {/* Expanded Content */}
        {!isCollapsed && (
          <>
            {/* Size */}
            <div className="mb-3 font-mono text-sm text-stardust flex flex-col">
                <span className="flex items-center gap-2">
                    <span className="opacity-50">Diameter:</span>
                    <span className="text-white font-semibold">{formatMeters(item.size)}</span>
                </span>
                <span className="text-xs opacity-40">{formatScientific(item.size)} m</span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-300 leading-relaxed mb-4 border-t border-white/10 pt-3">
                {item.description}
            </p>

            {/* Comparison Ratio Label */}
            {scaleRatio && (
                 <div className="bg-white/5 rounded-lg p-2 text-xs text-center border border-white/5">
                    {scaleRatio > 1 
                      ? <span><strong className="text-accent">{scaleRatio.toFixed(1)}×</strong> larger than other item</span>
                      : <span><strong className="text-accent">{(1/scaleRatio).toFixed(1)}×</strong> smaller than other item</span>
                    }
                 </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};