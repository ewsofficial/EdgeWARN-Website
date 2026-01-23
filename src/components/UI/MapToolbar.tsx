'use client';

import React from 'react';

interface ToolButtonProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
    disabled?: boolean;
}

export function ToolButton({ icon, label, active, onClick, disabled }: ToolButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={label}
            className={`
                flex items-center justify-center
                w-10 h-10 rounded-lg
                transition-all duration-200
                border shadow-lg
                ${active
                    ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/30'
                    : 'bg-gray-800/90 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                backdrop-blur-sm
            `}
        >
            {icon}
        </button>
    );
}

interface MapToolbarProps {
    children: React.ReactNode;
}

export function MapToolbar({ children }: MapToolbarProps) {
    const toolbarRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (toolbarRef.current) {
            // Prevent clicks and scrolls from propagating to the map
            // This is crucial to avoid Leaflet trying to handle events on toolbar elements
            import('leaflet').then(L => {
                if (toolbarRef.current) {
                    L.DomEvent.disableClickPropagation(toolbarRef.current);
                    L.DomEvent.disableScrollPropagation(toolbarRef.current);
                }
            });
        }
    }, []);

    return (
        <div ref={toolbarRef} className="absolute bottom-4 right-4 z-[500] flex flex-col gap-2">
            {children}
        </div>
    );
}

export default MapToolbar;
