import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { SCALE_ITEMS } from './constants';
import { Side } from './types';
import { InfoPanel } from './components/InfoPanel';
import { ItemVisual3D } from './components/ItemVisual3D';
import { Controls } from './components/Controls';
import { ScaleGrid } from './components/ScaleGrid';
import { Drawer } from './components/Drawer';
import { BookOpen, HelpCircle, Lock, List } from 'lucide-react';

const TARGET_FRAME_PERCENTAGE = 0.6; // The framed item should take up 60% of the viewport min dimension

export default function App() {
  // --- State ---
  // Safely find initial index, default to 0 if not found
  const foundInitialIndex = SCALE_ITEMS.findIndex(i => i.id === 'hydrogen-atom');
  const initialLeftIndex = foundInitialIndex >= 0 ? foundInitialIndex : 0;
  
  const [leftIndex, setLeftIndex] = useState(initialLeftIndex);
  // Ensure right index is within bounds
  const [rightIndex, setRightIndex] = useState(Math.min(initialLeftIndex + 1, SCALE_ITEMS.length - 1));
  const [pinnedSide, setPinnedSide] = useState<Side | null>(null);
  const [framedSide, setFramedSide] = useState<Side>('right');
  
  // Animation Direction State
  const [animDirection, setAnimDirection] = useState<'left' | 'right' | null>(null);

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Info Panel Collapse States
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(true);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(true);
  
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // --- Refs & Resizing ---
  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Panel size
  const panelWidth = dimensions.width >= 768 ? dimensions.width / 2 : dimensions.width;
  const panelHeight = dimensions.width >= 768 ? dimensions.height : dimensions.height / 2;
  const minDim = Math.max(1, Math.min(panelWidth, panelHeight)); // Ensure non-zero
  
  // --- Navigation Handlers ---
  const handleNavigation = useCallback((direction: 'next' | 'prev') => {
    setAnimDirection(direction === 'next' ? 'right' : 'left');

    if (direction === 'next') {
        if (pinnedSide === 'left') {
            if (rightIndex < SCALE_ITEMS.length - 1) setRightIndex(r => r + 1);
        } else if (pinnedSide === 'right') {
            if (leftIndex < SCALE_ITEMS.length - 1) setLeftIndex(l => l + 1);
        } else {
            if (rightIndex < SCALE_ITEMS.length - 1) {
                setLeftIndex(l => l + 1);
                setRightIndex(r => r + 1);
            }
        }
    } else {
        if (pinnedSide === 'left') {
            if (rightIndex > 0) setRightIndex(r => r - 1);
        } else if (pinnedSide === 'right') {
            if (leftIndex > 0) setLeftIndex(l => l - 1);
        } else {
            if (leftIndex > 0) {
                setLeftIndex(l => l - 1);
                setRightIndex(r => r - 1);
            }
        }
    }
  }, [leftIndex, rightIndex, pinnedSide]);

  const togglePin = (side: Side) => {
    if (pinnedSide === side) {
      setPinnedSide(null);
    } else {
      setPinnedSide(side);
    }
  };

  const handleSwap = () => {
    setFramedSide(prev => prev === 'left' ? 'right' : 'left');
  };
  
  const handleDrawerSelect = (index: number) => {
      setAnimDirection('right'); // Default animation for jump
      if (pinnedSide === 'left') {
          setRightIndex(index);
      } else if (pinnedSide === 'right') {
          setLeftIndex(index);
      } else {
          // If Unpinned, navigate to this item and its neighbor
          if (index === SCALE_ITEMS.length - 1) {
              setLeftIndex(index - 1);
              setRightIndex(index);
          } else {
              setLeftIndex(index);
              setRightIndex(index + 1);
          }
      }
  };

  // --- Keyboard Support ---
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNavigation('next');
      if (e.key === 'ArrowLeft') handleNavigation('prev');
      if (e.key.toLowerCase() === 's') handleSwap();
      if (e.key.toLowerCase() === 'l') togglePin('left');
      if (e.key.toLowerCase() === 'r') togglePin('right');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleNavigation, handleSwap, pinnedSide]); 

  // --- Scale Calculation Logic ---
  
  // Safety checks for undefined items
  const leftItem = SCALE_ITEMS[leftIndex] || SCALE_ITEMS[0];
  const rightItem = SCALE_ITEMS[rightIndex] || SCALE_ITEMS[0];

  if (!leftItem || !rightItem) {
      return <div className="text-white p-10">Loading or Error: Data missing.</div>;
  }
  
  const targetPixels = minDim * TARGET_FRAME_PERCENTAGE;
  
  // Helper to get MPP for a specific side
  const getScaleForSide = (side: 'left' | 'right') => {
      // SPLIT SCALE MODE
      if (pinnedSide) {
          if (side === 'left') return leftItem.size / targetPixels;
          if (side === 'right') return rightItem.size / targetPixels;
      }

      // UNIFIED SCALE MODE
      const refItem = framedSide === 'left' ? leftItem : rightItem;
      return refItem.size / targetPixels;
  };

  const leftMPP = getScaleForSide('left');
  const rightMPP = getScaleForSide('right');

  // Ratios
  const ratioLR = rightItem.size !== 0 ? leftItem.size / rightItem.size : 0;
  const ratioRL = leftItem.size !== 0 ? rightItem.size / leftItem.size : 0;

  const canGoBack = pinnedSide === 'left' ? rightIndex > 0 : leftIndex > 0;
  const canGoForward = pinnedSide === 'right' ? leftIndex < SCALE_ITEMS.length - 1 : rightIndex < SCALE_ITEMS.length - 1;

  // Animation Classes
  const getAnimClass = (side: Side) => {
      if (pinnedSide === side) return ''; // Static if pinned
      if (!animDirection) return '';
      return animDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left';
  };

  // Common Scene Props
  const sceneProps = {
      camera: { position: [0, 0, 5] as [number, number, number], fov: 45 },
      dpr: typeof window !== 'undefined' ? window.devicePixelRatio : 1
  };

  return (
    <div className="relative w-screen h-screen bg-cosmos text-stardust flex flex-col md:flex-row overflow-hidden">
      
      {/* Drawer */}
      <Drawer 
         isOpen={isDrawerOpen} 
         onClose={() => setIsDrawerOpen(false)} 
         onSelect={handleDrawerSelect}
         currentIndex={pinnedSide === 'left' ? rightIndex : (pinnedSide === 'right' ? leftIndex : leftIndex)} 
      />

      {/* Global Background Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" 
           style={{backgroundImage: 'radial-gradient(circle at center, #6366F1 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
      </div>

      {/* Header */}
      <div className="absolute top-6 left-6 z-40 pointer-events-none">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen size={24} className="text-accent" />
            Scale of Everything
          </h1>
          <p className="text-xs text-white/40 mt-1 max-w-[200px]">
             Use <kbd className="bg-white/10 px-1 rounded">Arrows</kbd> to nav, <kbd className="bg-white/10 px-1 rounded">S</kbd> to swap view.
          </p>
      </div>

      {/* Split Scale Indicator */}
      {pinnedSide && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-1 h-full bg-accent/20 blur-xl hidden md:block" />
      )}

      {/* Left Panel */}
      <div className={`relative flex-1 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-white/5 transition-colors duration-500 overflow-hidden
          ${framedSide === 'left' && !pinnedSide ? 'bg-white/[0.02]' : ''}
          ${pinnedSide === 'left' ? 'bg-accent/[0.03] border-r-accent/20' : ''}
      `}>
          {/* Background Scale Grid (SVG) - Behind 3D Scene */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="xMidYMid slice">
              <ScaleGrid pixelScale={leftMPP} width={panelWidth} height={panelHeight} />
          </svg>
          
          {/* 3D Scene */}
          <div key={leftItem.id} className={`absolute inset-0 w-full h-full z-10 ${getAnimClass('left')}`}>
              <Canvas {...sceneProps}>
                 <ambientLight intensity={0.6} />
                 <directionalLight position={[10, 10, 5]} intensity={1} />
                 <ItemVisual3D item={leftItem} pixelScale={leftMPP} />
              </Canvas>
          </div>
          
          <InfoPanel 
            item={leftItem} 
            side="left" 
            isPinned={pinnedSide === 'left'}
            isFramed={framedSide === 'left' || pinnedSide !== null} 
            onTogglePin={() => togglePin('left')}
            scaleRatio={ratioLR}
            isCollapsed={isLeftPanelCollapsed}
            onToggleCollapse={() => setIsLeftPanelCollapsed(prev => !prev)}
          />
          
          {pinnedSide === 'left' && (
             <div className="absolute top-6 right-6 text-accent/50 flex items-center gap-2 text-xs font-mono uppercase tracking-widest border border-accent/20 px-2 py-1 rounded">
                <Lock size={12} /> Static Scale
             </div>
          )}
      </div>

      {/* Right Panel */}
      <div className={`relative flex-1 h-1/2 md:h-full transition-colors duration-500 overflow-hidden
          ${framedSide === 'right' && !pinnedSide ? 'bg-white/[0.02]' : ''}
           ${pinnedSide === 'right' ? 'bg-accent/[0.03] border-l-accent/20' : ''}
      `}>
          {/* Background Scale Grid (SVG) - Behind 3D Scene */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="xMidYMid slice">
              <ScaleGrid pixelScale={rightMPP} width={panelWidth} height={panelHeight} />
          </svg>
          
          {/* 3D Scene */}
          <div key={rightItem.id} className={`absolute inset-0 w-full h-full z-10 ${getAnimClass('right')}`}>
             <Canvas {...sceneProps}>
                 <ambientLight intensity={0.6} />
                 <directionalLight position={[-10, 10, 5]} intensity={1} />
                 <ItemVisual3D item={rightItem} pixelScale={rightMPP} />
             </Canvas>
          </div>

          <InfoPanel 
            item={rightItem} 
            side="right" 
            isPinned={pinnedSide === 'right'}
            isFramed={framedSide === 'right' || pinnedSide !== null}
            onTogglePin={() => togglePin('right')}
            scaleRatio={ratioRL}
            isCollapsed={isRightPanelCollapsed}
            onToggleCollapse={() => setIsRightPanelCollapsed(prev => !prev)}
          />

          {pinnedSide === 'right' && (
             <div className="absolute top-6 left-6 text-accent/50 flex items-center gap-2 text-xs font-mono uppercase tracking-widest border border-accent/20 px-2 py-1 rounded">
                <Lock size={12} /> Static Scale
             </div>
          )}
      </div>

      {/* Center Controls */}
      <Controls 
        onPrev={() => handleNavigation('prev')} 
        onNext={() => handleNavigation('next')} 
        onSwap={handleSwap}
        canGoBack={canGoBack} 
        canGoForward={canGoForward} 
        framedSide={framedSide}
      />
      
      {/* All Items Drawer Button - Top Right */}
      <button 
        onClick={() => setIsDrawerOpen(true)}
        className="absolute top-6 right-6 z-40 pointer-events-auto flex items-center gap-2 bg-black/50 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white text-xs font-semibold uppercase tracking-wider"
      >
        <List size={14} />
        All Items
      </button>
      
      {/* Mobile Orientation Warning */}
      <div className="md:hidden absolute top-2 right-2 z-50">
         <HelpCircle className="text-white/20" size={20} />
      </div>

    </div>
  );
}