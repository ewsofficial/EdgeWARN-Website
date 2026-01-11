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
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Controls Row */}
      <div className="flex items-center justify-between gap-2">
        
        {/* Playback Buttons */}
        <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
          <button 
            onClick={() => onIndexChange(0)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
            title="Earliest"
          >
            <SkipBack size={18} />
          </button>
          
          <button 
            onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
            title="Back 1 Frame"
          >
            <ChevronLeft size={18} />
          </button>

          <button 
            onClick={onTogglePlay}
            className={`p-1.5 rounded transition-colors ${isPlaying ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-gray-700 text-gray-300 hover:text-white'}`}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button 
            onClick={() => onIndexChange(Math.min(totalFrames - 1, currentIndex + 1))}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
            title="Forward 1 Frame"
          >
            <ChevronRight size={18} />
          </button>

          <button 
            onClick={() => onIndexChange(totalFrames - 1)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
            title="Latest"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Timestamp Display (Optional here, but good for context) */}
        {timestamp && (
           <div className="text-xs font-mono text-blue-200 bg-gray-900 px-3 py-1.5 rounded border border-gray-700">
               {timestamp}
           </div>
        )}
      </div>

      {/* Slider */}
      <div className="relative w-full h-6 flex items-center">
        <input 
            type="range" 
            min={0} 
            max={Math.max(0, totalFrames - 1)} 
            value={currentIndex} 
            onChange={handleRangeChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400" 
        />
      </div>
       <div className="flex justify-between text-[10px] text-gray-500 px-1">
            <span>Start</span>
            <span>Latest</span>
       </div>
    </div>
  );
}
