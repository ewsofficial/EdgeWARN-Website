'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useMapConnection } from '../hooks/useMapConnection';
import { UseMapConnectionReturn } from '@/types';

const MapContext = createContext<UseMapConnectionReturn | null>(null);

export function MapContextProvider({ children }: { children: ReactNode }) {
    const connection = useMapConnection();

    React.useEffect(() => {
        console.log('[MapContext] Provider MOUNTED');
        return () => console.log('[MapContext] Provider UNMOUNTED');
    }, []);

    return (
        <MapContext.Provider value={connection}>
            {children}
        </MapContext.Provider>
    );
}

export function useMapContext() {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMapContext must be used within a MapContextProvider');
    }
    return context;
}
