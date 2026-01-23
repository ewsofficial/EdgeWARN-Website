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
            console.warn("Location error:", e);
            setIsLocating(false);
            
            let msg = "Could not access your location.";
            
            // Leaflet ErrorEvent message often contains the browser's error text
            if (e.message.toLowerCase().includes("denied")) {
                msg = "Location access denied. Please allow location access in your browser settings.";
            } else if (e.message.toLowerCase().includes("timeout")) {
                msg = "Location request timed out. Please try again.";
            } else if (e.message.toLowerCase().includes("unavailable")) {
                msg = "Location unavailable. Please check your network or GPS.";
            } else {
                msg = `Location error: ${e.message}`;
            }

            alert(msg);
            // We don't necessarily setHasLocation(false) here, in case they had a previous valid location 
            // and just failed to update. But if they never had one, it remains false.
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
        
        setIsLocating(true);
        // timeout: 10000ms (10s) to avoid hanging
        // enableHighAccuracy: false (default) is faster and often sufficient
        map.locate({ setView: true, maxZoom: 12, timeout: 10000 });
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
