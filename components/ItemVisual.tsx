import React from 'react';
import { ScaleItem } from '../types';

interface ItemVisualProps {
  item: ScaleItem;
  viewSize: number; // The size of the viewing box in pixels
  pixelScale: number; // meters per pixel
}

export const ItemVisual: React.FC<ItemVisualProps> = ({ item, viewSize, pixelScale }) => {
  // Calculate size in pixels
  const renderedSize = item.size / pixelScale;

  const cx = viewSize / 2;
  const cy = viewSize / 2;

  // Render Logic
  
  // CASE 1: Too Small
  if (renderedSize < 1) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={2} fill="none" stroke={item.color} strokeWidth="1" opacity="0.5" strokeDasharray="2 2" />
        <line x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4} stroke={item.color} strokeWidth="1" opacity="0.5" />
        <line x1={cx - 4} y1={cy + 4} x2={cx + 4} y2={cy - 4} stroke={item.color} strokeWidth="1" opacity="0.5" />
        <text x={cx} y={cy + 20} textAnchor="middle" fill={item.color} className="text-[10px] font-mono">
          &lt; 1px
        </text>
      </g>
    );
  }

  // CASE 2: Too Big (Fills screen completely)
  // If the object is significantly larger than the view (e.g. > 3x), we just render a background fill or a massive curve.
  if (renderedSize > viewSize * 4) {
     return (
        <g>
             <rect x={0} y={0} width={viewSize} height={viewSize} fill={item.color} opacity="0.1" />
             <text x={cx} y={cy} textAnchor="middle" fill={item.color} className="text-xs font-mono uppercase tracking-widest opacity-50">
                 Zoom out to see
             </text>
        </g>
     )
  }

  // CASE 3: Visible Range
  const r = renderedSize / 2;

  // Use simple procedural shapes based on category to keep it looking cool without assets
  const renderShape = () => {
    switch (item.category) {
        case 'quantum':
        case 'molecular':
            // Glowy orb
            return (
                <g>
                    <defs>
                        <radialGradient id={`grad-${item.id}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor={item.color} stopOpacity="0.8" />
                            <stop offset="100%" stopColor={item.color} stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx={cx} cy={cy} r={r} fill={`url(#grad-${item.id})`} />
                    <circle cx={cx} cy={cy} r={r * 0.4} fill={item.color} opacity="0.6" />
                    {item.category === 'molecular' && (
                         <circle cx={cx} cy={cy} r={r} stroke={item.color} strokeWidth={Math.max(1, r * 0.05)} fill="none" opacity="0.3" strokeDasharray="4 2"/>
                    )}
                </g>
            );
        case 'biological':
        case 'human':
             // Outline with some internal structure
             return (
                 <g>
                    <circle cx={cx} cy={cy} r={r} fill={item.color} opacity="0.2" />
                    <circle cx={cx} cy={cy} r={r} stroke={item.color} strokeWidth={Math.max(1, r * 0.02)} fill="none" />
                    {/* Abstract internal details */}
                    <path d={`M ${cx - r/2} ${cy} Q ${cx} ${cy - r/2} ${cx + r/2} ${cy}`} stroke={item.color} strokeWidth={Math.max(1, r*0.02)} fill="none" opacity="0.5" />
                 </g>
             )
        case 'planetary':
        case 'stellar':
             // Solid sphere with shadow
             return (
                 <g>
                     <circle cx={cx} cy={cy} r={r} fill={item.color} />
                     <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy} A ${r} ${r*0.8} 0 0 1 ${cx - r} ${cy}`} fill="black" opacity="0.2" />
                 </g>
             );
        case 'galactic':
        case 'cosmic':
             // Spiral or cloud
             return (
                 <g>
                    <circle cx={cx} cy={cy} r={r} fill={item.color} opacity="0.1" filter="blur(4px)" />
                    <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.4} stroke={item.color} strokeWidth={Math.max(1, r * 0.02)} fill="none" transform={`rotate(45, ${cx}, ${cy})`} />
                    <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.4} stroke={item.color} strokeWidth={Math.max(1, r * 0.02)} fill="none" transform={`rotate(-45, ${cx}, ${cy})`} />
                    <circle cx={cx} cy={cy} r={r * 0.1} fill="white" />
                 </g>
             )
        default:
            return <circle cx={cx} cy={cy} r={r} fill={item.color} opacity="0.8" />;
    }
  }

  return (
    <g className="transition-all duration-500 ease-out">
        {item.speculative && (
             <circle cx={cx} cy={cy} r={r * 1.1} stroke={item.color} strokeDasharray="4 4" strokeWidth="1" fill="none" opacity="0.5" />
        )}
        {renderShape()}
    </g>
  );
};