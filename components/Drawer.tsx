import React, { useState, useMemo } from 'react';
import { ScaleItem } from '../types';
import { SCALE_ITEMS } from '../constants';
import { Search, X, ChevronRight } from 'lucide-react';
import { formatScientific } from '../utils/formatting';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (index: number) => void;
  currentIndex: number;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, onSelect, currentIndex }) => {
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    return SCALE_ITEMS.map((item, index) => ({ item, index })).filter(({ item }) => 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="relative w-full max-w-md h-full bg-[#0B0C15] border-r border-white/10 flex flex-col shadow-2xl animate-slide-in-left">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                All Items
                <span className="text-xs font-normal text-white/40 bg-white/10 px-2 py-0.5 rounded-full">{SCALE_ITEMS.length}</span>
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/5">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <input 
                    type="text" 
                    placeholder="Search items..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-white/20"
                    autoFocus
                />
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
            {filteredItems.map(({ item, index }) => (
                <button
                    key={item.id}
                    onClick={() => {
                        onSelect(index);
                        onClose();
                    }}
                    className={`w-full text-left p-3 rounded-lg mb-1 flex items-center justify-between group transition-all duration-200 
                        ${currentIndex === index ? 'bg-accent/20 border border-accent/30' : 'hover:bg-white/5 border border-transparent'}
                    `}
                >
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
                            style={{ backgroundColor: item.color }} 
                        />
                        <div>
                            <div className={`font-semibold text-sm ${currentIndex === index ? 'text-accent' : 'text-gray-200'}`}>
                                {item.name}
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono">
                                {formatScientific(item.size)} m • <span className="uppercase">{item.category}</span>
                            </div>
                        </div>
                    </div>
                    {currentIndex === index && <ChevronRight size={16} className="text-accent" />}
                </button>
            ))}
            
            {filteredItems.length === 0 && (
                <div className="p-8 text-center text-white/30 text-sm">
                    No items found matching "{search}"
                </div>
            )}
        </div>
      </div>
    </div>
  );
};