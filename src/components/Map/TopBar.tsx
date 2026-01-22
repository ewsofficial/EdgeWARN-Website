
import React from 'react';
import L from 'leaflet';
import { LatLonDisplay } from '../UI/LatLonDisplay';

interface TopBarProps {
    isConnected: boolean;
    time: string;
    date: string;
    isFlashing: boolean;
    map: L.Map | null;
}

export function TopBar({
    isConnected,
    time,
    date,
    isFlashing,
    map
}: TopBarProps) {
    if (!isConnected) return null;

    return (
        <div className={`absolute top-3 left-1/2 transform -translate-x-1/2 z-[400] flex flex-col items-center pointer-events-none select-none backdrop-blur-md border rounded-xl shadow-lg px-5 py-2 transition-all duration-500 gap-0.5 ${isFlashing ? 'bg-green-900/90 border-green-500/80 scale-105' : 'bg-gray-900/90 border-gray-700/50'}`}>
            <div className="flex items-center gap-3">
                <div className={`text-xl font-mono font-bold drop-shadow-sm tracking-wider transition-colors duration-300 ${isFlashing ? 'text-green-300' : 'text-blue-400'}`}>{time || '--:--'}</div>
                <div className={`h-5 w-px transition-colors duration-300 ${isFlashing ? 'bg-green-600' : 'bg-gray-700'}`}></div>
                <div className={`text-sm font-medium tracking-wide uppercase transition-colors duration-300 ${isFlashing ? 'text-green-200' : 'text-gray-400'}`}>{date || 'YYYY-MM-DD'}</div>
            </div>
            <div className="w-full h-px bg-gray-700/50 my-0.5"></div>
            <LatLonDisplay map={map} />
        </div>
    );
}
