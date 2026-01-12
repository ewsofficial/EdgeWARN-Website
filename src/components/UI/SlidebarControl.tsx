'use client';

import React from 'react';
import { 
  SkipBack, 
  ChevronLeft, 
  Play, 
  Pause, 
  ChevronRight, 
  SkipForward 
} from 'lucide-react';

interface SlidebarControlProps {
  currentIndex: number;
  totalFrames: number;
  onIndexChange: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  className?: string;
  timestamp?: string;
}

export default function SlidebarControl({
  currentIndex,
  totalFrames,
  onIndexChange,
  isPlaying,
  onTogglePlay,
  className = '',
  timestamp
}: SlidebarControlProps) {
  
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onIndexChange(parseInt(e.target.value));
  };

  return (
    <div className={`bg-gray-900/50 p-2 rounded-xl flex flex-col gap-3 ${className}`}>
      {/* Slider */}
      <div className="relative w-full h-4 flex items-center px-1">
        <input 
            type="range" 
            min={0} 
            max={Math.max(0, totalFrames - 1)} 
            value={currentIndex} 
            onChange={handleRangeChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400" 
        />
      </div>

      {/* Controls Row - Grid for alignment */}
      <div className="grid grid-cols-5 gap-1">
          <ControlButton 
            onClick={() => onIndexChange(0)} 
            icon={<SkipBack size={18} />} 
            label="Earliest" 
          />
          <ControlButton 
            onClick={() => onIndexChange(Math.max(0, currentIndex - 1))} 
            icon={<ChevronLeft size={18} />} 
            label="-1 Frame" 
          />
          <ControlButton 
            onClick={onTogglePlay} 
            icon={isPlaying ? <Pause size={18} /> : <Play size={18} />} 
            label={isPlaying ? "Pause" : "Play"}
            active={isPlaying}
          />
          <ControlButton 
            onClick={() => onIndexChange(Math.min(totalFrames - 1, currentIndex + 1))} 
            icon={<ChevronRight size={18} />} 
            label="+1 Frame" 
          />
          <ControlButton 
            onClick={() => onIndexChange(totalFrames - 1)} 
            icon={<SkipForward size={18} />} 
            label="Latest" 
          />
      </div>
    </div>
  );
}

interface ControlButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
}

function ControlButton({ onClick, icon, label, active }: ControlButtonProps) {
    return (
        <button 
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 group ${active ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'hover:bg-gray-800 text-gray-400 hover:text-gray-200 border border-transparent'}`}
        >
            <div className={`p-1.5 rounded-md ${active ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-800 group-hover:bg-gray-700 text-gray-300'}`}>
                {icon}
            </div>
        </button>
    );
}
