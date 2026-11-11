import React from 'react';
import { formatScientific } from '../utils/formatting';

interface ScaleGridProps {
  pixelScale: number; // meters per pixel
  width: number;
  height: number;
}

export const ScaleGrid: React.FC<ScaleGridProps> = ({ pixelScale, width, height }) => {
  // We want to draw grid lines representing powers of 10 meters roughly.
  // 1 pixel = pixelScale meters.
  // We want lines every 10^k meters such that they are spaced reasonably (e.g. > 50px apart).

  const minPixelSpacing = 100;
  const minMetersSpacing = minPixelSpacing * pixelScale;

  // Find nearest power of 10
  const exponent = Math.floor(Math.log10(minMetersSpacing));
  const stepMeters = Math.pow(10, exponent);
  
  // If the step is too sparse (huge gap), use a half-step like 2*10^k or 5*10^k logic? 
  // For log scales simpler is often better. Let's stick to powers of 10 but ensure at least one is visible.
  
  const stepPixels = stepMeters / pixelScale;
  const centerX = width / 2;
  const centerY = height / 2;

  // Generate lines radiating from center or a grid?
  // A grid is better for "measuring".
  
  const linesX = [];
  const linesY = [];

  // Determine start/end relative to center to keep grid centered
  // We draw lines from center outwards
  
  const count = Math.ceil(width / stepPixels / 2) + 1;
  
  for (let i = -count; i <= count; i++) {
     linesX.push(centerX + i * stepPixels);
  }
  
  const countY = Math.ceil(height / stepPixels / 2) + 1;
  for (let i = -countY; i <= countY; i++) {
     linesY.push(centerY + i * stepPixels);
  }

  return (
    <g className="opacity-20 pointer-events-none">
       {linesX.map((x, i) => (
         <React.Fragment key={`x-${i}`}>
            <line x1={x} y1={0} x2={x} y2={height} stroke="white" strokeWidth="1" strokeDasharray="4 4" />
         </React.Fragment>
       ))}
       {linesY.map((y, i) => (
          <React.Fragment key={`y-${i}`}>
            <line x1={0} y1={y} x2={width} y2={y} stroke="white" strokeWidth="1" strokeDasharray="4 4" />
          </React.Fragment>
       ))}
       
       {/* Scale Legend */}
       <text x={centerX + stepPixels + 5} y={centerY - 5} fill="white" fontSize="10" fontFamily="monospace">
         {formatScientific(stepMeters)} m
       </text>
    </g>
  );
};