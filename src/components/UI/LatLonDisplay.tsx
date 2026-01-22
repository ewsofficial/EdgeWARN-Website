'use client';

import React, { useEffect, useState } from 'react';
import L from 'leaflet';

interface LatLonDisplayProps {
    map: L.Map | null;
}

export function LatLonDisplay({ map }: LatLonDisplayProps) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        if (!map) return;

        const handleMouseMove = (e: L.LeafletMouseEvent) => {
            // Leaflet handles wrapping automatically if worldCopyJump is set, but usually latlng is raw.
            // We can normalize longitude to -180 to 180 just in case.
            let { lat, lng } = e.latlng;

            // Normalize lng
            lng = ((lng + 180) % 360 + 360) % 360 - 180;

            setPosition({ lat, lng });
        };

        const handleMouseOut = () => {
            setPosition(null);
        };

        map.on('mousemove', handleMouseMove);
        map.on('mouseout', handleMouseOut);

        return () => {
            map.off('mousemove', handleMouseMove);
            map.off('mouseout', handleMouseOut);
        };
    }, [map]);

    if (!position) return null;

    // Format: 34.56° N, 12.34° W
    const latDir = position.lat >= 0 ? 'N' : 'S';
    const lngDir = position.lng >= 0 ? 'E' : 'W';

    // Using 3 decimal places for reasonable precision
    const latStr = Math.abs(position.lat).toFixed(3);
    const lngStr = Math.abs(position.lng).toFixed(3);

    return (
        // Return plain text/div for embedding
        <div className="text-xs font-mono font-medium text-gray-400 tracking-wider pointer-events-none uppercase">
            {latStr}° {latDir}, {lngStr}° {lngDir}
        </div>
    );
}
