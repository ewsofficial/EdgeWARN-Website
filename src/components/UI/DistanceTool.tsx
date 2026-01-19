'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Ruler } from 'lucide-react';
import { ToolButton } from './MapToolbar';

interface DistanceToolProps {
    map: L.Map | null;
}

export function DistanceTool({ map }: DistanceToolProps) {
    const [active, setActive] = useState(false);
    // const [totalDistance, setTotalDistance] = useState<number>(0); // Unused
    const pointsRef = useRef<L.LatLng[]>([]);
    const polylineRef = useRef<L.Polyline | null>(null);
    const markersRef = useRef<L.CircleMarker[]>([]);
    const labelsRef = useRef<L.Marker[]>([]);

    const clearMeasurement = useCallback(() => {
        if (polylineRef.current && map) {
            map.removeLayer(polylineRef.current);
            polylineRef.current = null;
        }
        markersRef.current.forEach(m => map?.removeLayer(m));
        markersRef.current = [];
        labelsRef.current.forEach(l => map?.removeLayer(l));
        labelsRef.current = [];
        pointsRef.current = [];
        // setTotalDistance(0);
    }, [map]);

    const handleClick = useCallback((e: L.LeafletMouseEvent) => {
        if (!map) return;

        const point = e.latlng;
        const prevPoint = pointsRef.current.length > 0 ? pointsRef.current[pointsRef.current.length - 1] : null;
        pointsRef.current.push(point);

        // Add marker
        const marker = L.circleMarker(point, {
            radius: 5,
            color: '#000000',
            fillColor: '#000000',
            fillOpacity: 1
        }).addTo(map);
        markersRef.current.push(marker);

        // Update polyline
        if (polylineRef.current) {
            polylineRef.current.setLatLngs(pointsRef.current);
        } else {
            polylineRef.current = L.polyline(pointsRef.current, {
                color: '#000000',
                weight: 3,
                dashArray: '5, 10'
            }).addTo(map);
        }

        // Add segment label if there's a previous point
        if (prevPoint) {
            const segmentDistance = prevPoint.distanceTo(point) / 1000; // km
            const midLat = (prevPoint.lat + point.lat) / 2;
            const midLng = (prevPoint.lng + point.lng) / 2;

            const label = L.marker([midLat, midLng], {
                icon: L.divIcon({
                    className: 'distance-label',
                    html: `<div style="color: #000000; font-size: 14px; font-weight: 600; white-space: nowrap;">${segmentDistance.toFixed(2)} km</div>`,
                    iconSize: [0, 0],
                    iconAnchor: [0, 0]
                }),
                interactive: false
            }).addTo(map);
            labelsRef.current.push(label);
        }

        // Calculate total distance
        // let total = 0;
        // for (let i = 1; i < pointsRef.current.length; i++) {
        //     total += pointsRef.current[i - 1].distanceTo(pointsRef.current[i]);
        // }
        // setTotalDistance(total / 1000); // Convert to km
    }, [map]);

    useEffect(() => {
        if (!map) return;

        if (active) {
            map.on('click', handleClick);
            map.getContainer().style.cursor = 'crosshair';
        } else {
            map.off('click', handleClick);
            map.getContainer().style.cursor = '';
        }

        return () => {
            map.off('click', handleClick);
            map.getContainer().style.cursor = '';
        };
    }, [map, active, handleClick]);

    const toggleTool = () => {
        if (active) {
            clearMeasurement();
        }
        setActive(!active);
    };

    return (
        <ToolButton
            icon={<Ruler size={20} />}
            label="Measure Distance"
            active={active}
            onClick={toggleTool}
        />
    );
}

export default DistanceTool;
