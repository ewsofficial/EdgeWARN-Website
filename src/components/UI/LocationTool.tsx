'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Locate, LocateFixed, Loader2 } from 'lucide-react';
import { ToolButton } from './MapToolbar';

interface LocationToolProps {
    map: L.Map | null;
}

export function LocationTool({ map }: LocationToolProps) {
    const [isLocating, setIsLocating] = useState(false);
    const [hasLocation, setHasLocation] = useState(false);
    const locationGroupRef = useRef<L.LayerGroup | null>(null);

    useEffect(() => {
        if (!map) return;

        // Create a layer group for location markers if it doesn't exist
        if (!locationGroupRef.current) {
            locationGroupRef.current = L.layerGroup().addTo(map);
        }

        const onLocationFound = (e: L.LocationEvent) => {
            if (!locationGroupRef.current) return;
            
            locationGroupRef.current.clearLayers();
            
            const radius = e.accuracy;

            // Add circle for accuracy
            L.circle(e.latlng, {
                radius: radius,
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.15,
                weight: 1
            }).addTo(locationGroupRef.current);

            // Add pulsating marker or standard marker
            // Using a simple circle marker for the user position
            L.circleMarker(e.latlng, {
                radius: 6,
                color: '#ffffff',
                fillColor: '#2563eb',
                fillOpacity: 1,
                weight: 2
            }).bindPopup(`You are here (Accuracy: ${Math.round(radius)}m)`).addTo(locationGroupRef.current);

            setIsLocating(false);
            setHasLocation(true);
        };

        const onLocationError = (e: L.ErrorEvent) => {
            console.warn("Location access denied or error:", e.message);
            setIsLocating(false);
            setHasLocation(false);
            // Optionally alert the user
            alert("Could not access your location. Please ensure location services are enabled.");
        };

        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);

        return () => {
            map.off('locationfound', onLocationFound);
            map.off('locationerror', onLocationError);
            if (locationGroupRef.current) {
                locationGroupRef.current.remove();
                locationGroupRef.current = null;
            }
        };
    }, [map]);

    const handleLocate = () => {
        if (!map) return;
        
        if (hasLocation) {
            // If we already have location, just re-center
             // We can trigger locate again to refine or just setView if we stored coords
             // Triggering locate again is safer to ensure up-to-date position
             setIsLocating(true);
             map.locate({ setView: true, maxZoom: 10 });
        } else {
            setIsLocating(true);
            map.locate({ setView: true, maxZoom: 10 });
        }
    };

    return (
        <ToolButton
            icon={isLocating ? <Loader2 size={20} className="animate-spin" /> : (hasLocation ? <LocateFixed size={20} /> : <Locate size={20} />)}
            label={hasLocation ? "Update Location" : "Find My Location"}
            active={hasLocation}
            onClick={handleLocate}
            disabled={isLocating}
        />
    );
}
