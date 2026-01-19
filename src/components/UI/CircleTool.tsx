'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Circle } from 'lucide-react';
import { ToolButton } from './MapToolbar';

interface CircleToolProps {
    map: L.Map | null;
}

// Generate points for a visually correct circle in EPSG:4326
// Uses simple lat/lng offset scaled by cos(lat) to correct for projection distortion
function generateCirclePoints(center: L.LatLng, radiusMeters: number, numPoints: number = 64): L.LatLngExpression[] {
    const points: L.LatLngExpression[] = [];

    // Convert radius from meters to degrees (approximate)
    // 1 degree latitude ≈ 111,320 meters
    const radiusDegLat = radiusMeters / 111320;
    // Longitude degrees need to be scaled by cos(latitude)
    const radiusDegLng = radiusMeters / (111320 * Math.cos(center.lat * Math.PI / 180));

    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        const lat = center.lat + radiusDegLat * Math.sin(angle);
        const lng = center.lng + radiusDegLng * Math.cos(angle);
        points.push([lat, lng]);
    }

    return points;
}

export function CircleTool({ map }: CircleToolProps) {
    const [active, setActive] = useState(false);
    // const [radiusKm, setRadiusKm] = useState(0); // Unused
    const circleRef = useRef<L.Polygon | null>(null);
    const radiusLineRef = useRef<L.Polyline | null>(null);
    const radiusLabelRef = useRef<L.Marker | null>(null);
    const centerRef = useRef<L.LatLng | null>(null);
    const currentPointRef = useRef<L.LatLng | null>(null);
    const isDrawingRef = useRef(false);

    const clearCircle = useCallback(() => {
        if (circleRef.current && map) {
            map.removeLayer(circleRef.current);
            circleRef.current = null;
        }
        if (radiusLineRef.current && map) {
            map.removeLayer(radiusLineRef.current);
            radiusLineRef.current = null;
        }
        if (radiusLabelRef.current && map) {
            map.removeLayer(radiusLabelRef.current);
            radiusLabelRef.current = null;
        }
        centerRef.current = null;
        currentPointRef.current = null;
        isDrawingRef.current = false;
        // setRadiusKm(0);
    }, [map]);

    const updateRadiusDisplay = useCallback((center: L.LatLng, point: L.LatLng, radius: number) => {
        if (!map) return;

        // Update/create radius line (solid)
        if (radiusLineRef.current) {
            radiusLineRef.current.setLatLngs([center, point]);
        } else {
            radiusLineRef.current = L.polyline([center, point], {
                color: '#000000',
                weight: 2,
                dashArray: undefined // solid line
            }).addTo(map);
        }

        // Update/create radius label at midpoint
        const midLat = (center.lat + point.lat) / 2;
        const midLng = (center.lng + point.lng) / 2;
        const radiusKmValue = radius / 1000;

        if (radiusLabelRef.current) {
            radiusLabelRef.current.setLatLng([midLat, midLng]);
            radiusLabelRef.current.setIcon(L.divIcon({
                className: 'radius-label',
                html: `<div style="color: #000000; font-size: 14px; font-weight: 600; white-space: nowrap;">${radiusKmValue.toFixed(2)} km</div>`,
                iconSize: [0, 0],
                iconAnchor: [0, 0]
            }));
        } else {
            radiusLabelRef.current = L.marker([midLat, midLng], {
                icon: L.divIcon({
                    className: 'radius-label',
                    html: `<div style="color: #000000; font-size: 14px; font-weight: 600; white-space: nowrap;">${radiusKmValue.toFixed(2)} km</div>`,
                    iconSize: [0, 0],
                    iconAnchor: [0, 0]
                }),
                interactive: false
            }).addTo(map);
        }

        // setRadiusKm(radiusKmValue);
    }, [map]);

    const handleMouseDown = useCallback((e: L.LeafletMouseEvent) => {
        if (!map || !active) return;
        clearCircle();
        centerRef.current = e.latlng;
        currentPointRef.current = e.latlng;
        isDrawingRef.current = true;

        // Create polygon-based circle for visual correctness in EPSG:4326
        const circlePoints = generateCirclePoints(e.latlng, 0, 64);
        circleRef.current = L.polygon(circlePoints, {
            color: '#000000',
            fillColor: '#000000',
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '8, 8'
        }).addTo(map);
    }, [map, active, clearCircle]);

    const handleMouseMove = useCallback((e: L.LeafletMouseEvent) => {
        if (!map || !isDrawingRef.current || !centerRef.current || !circleRef.current) return;

        const radius = centerRef.current.distanceTo(e.latlng);
        // Update circle polygon with new radius
        const newPoints = generateCirclePoints(centerRef.current, radius, 64);
        circleRef.current.setLatLngs(newPoints);

        currentPointRef.current = e.latlng;
        updateRadiusDisplay(centerRef.current, e.latlng, radius);
    }, [map, updateRadiusDisplay]);

    const handleMouseUp = useCallback(() => {
        isDrawingRef.current = false;
    }, []);

    useEffect(() => {
        if (!map) return;

        if (active) {
            map.dragging.disable();
            map.on('mousedown', handleMouseDown);
            map.on('mousemove', handleMouseMove);
            map.on('mouseup', handleMouseUp);
            map.getContainer().style.cursor = 'crosshair';
        } else {
            map.dragging.enable();
            map.off('mousedown', handleMouseDown);
            map.off('mousemove', handleMouseMove);
            map.off('mouseup', handleMouseUp);
            map.getContainer().style.cursor = '';
        }

        return () => {
            map.dragging.enable();
            map.off('mousedown', handleMouseDown);
            map.off('mousemove', handleMouseMove);
            map.off('mouseup', handleMouseUp);
            map.getContainer().style.cursor = '';
        };
    }, [map, active, handleMouseDown, handleMouseMove, handleMouseUp]);

    const toggleTool = () => {
        if (active) {
            clearCircle();
        }
        setActive(!active);
    };

    return (
        <ToolButton
            icon={<Circle size={20} />}
            label="Draw Circle"
            active={active}
            onClick={toggleTool}
        />
    );
}

export default CircleTool;
