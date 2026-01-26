'use client';

import { useEffect, useRef, useState, memo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers } from 'lucide-react';
import { NWSAlertFeature } from '@/types';
import { EWMRSAPI } from '@/utils/ewmrs-api';
import { getEventColors } from './constants';
import { findClosestTimestamp } from '@/utils/timestamp';

interface AlertMapProps {
    feature: NWSAlertFeature;
    currentTimestamp: string | null;
    ewmrsUrl: string;
}

export function AlertMap({ feature, currentTimestamp, ewmrsUrl }: AlertMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const geometryLayerRef = useRef<L.Layer | null>(null);
    const radarLayerRef = useRef<L.Layer | null>(null);
    const isMountedRef = useRef(true);
    const [isVisible, setIsVisible] = useState(false);
    const [showRadar, setShowRadar] = useState(true);

    // Track mount status
    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    // Lazy load: Only render when in viewport
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && isMountedRef.current) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { rootMargin: '200px' }); // Preload 200px before view

        if (mapContainerRef.current) {
            observer.observe(mapContainerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Initialize Map
    useEffect(() => {
        if (!isVisible) return;
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
            crs: L.CRS.EPSG4326, // Use EPSG:4326 to match radar data projection
            center: [39.8, -98.6], // CONUS Center
            zoom: 4,
            zoomControl: true,   // Enable zoom buttons
            dragging: true,      // Allow panning
            scrollWheelZoom: true, // Allow scroll zoom
            touchZoom: true,
            doubleClickZoom: true,
            boxZoom: true,       // Shift-drag zoom
            attributionControl: false
        });

        // OSM WMS via Terrestris (EPSG:4326 compatible)
        // Using this instead of CartoDB (3857) to prevent radar distortion
        L.tileLayer.wms('https://ows.terrestris.de/osm/service', {
            layers: 'OSM-WMS',
            format: 'image/png',
            transparent: false,
            version: '1.3.0',
            attribution: '',
            className: 'invert-0 brightness-75 contrast-125 saturate-0' // Attempt to darken via Tailwind filters (Leaflet applies to container)
        }).addTo(map);

        mapInstanceRef.current = map;
        
        return () => {
             map.remove();
             mapInstanceRef.current = null;
        }
    }, [isVisible]);

    // Render Geometry & Fit Bounds
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Cleanup old geometry
        if (geometryLayerRef.current) {
            map.removeLayer(geometryLayerRef.current);
            geometryLayerRef.current = null;
        }

        let geometry: GeoJSON.Geometry | null = null;

        // 1. Try Standard Geometry
        if (feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
            geometry = feature.geometry;
        }
        
        // 2. Try Computed Polygon
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const customPolygon = (feature as any).Polygon;
        if (!geometry && customPolygon && Array.isArray(customPolygon) && customPolygon.length > 0) {
            try {
                const ismultiRing = Array.isArray(customPolygon[0]) && Array.isArray((customPolygon as any)[0][0]);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rings: any[] = ismultiRing ? customPolygon : [customPolygon];

                // Normalize coordinates
                const validRings = rings.map(ring => {
                    if (!Array.isArray(ring)) return [];
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const coords = ring.map((pt: any) => {
                        if (!Array.isArray(pt) || pt.length < 2) return [0, 0];
                        const val1 = Number(pt[0]);
                        const val2 = Number(pt[1]);
                        if (isNaN(val1) || isNaN(val2)) return [0, 0];
                        // Swap if [Lat, Lon] -> [Lon, Lat]
                        return (val1 > 0 && val2 < 0) ? [val2, val1] : [val1, val2];
                    });
                    
                    // Close ring
                    if (coords.length > 0) {
                        const first = coords[0];
                        const last = coords[coords.length - 1];
                        if (first[0] !== last[0] || first[1] !== last[1]) coords.push(first);
                    }
                    return coords;
                }).filter(r => r.length >= 4);

                if (validRings.length > 0) {
                    geometry = {
                        type: 'Polygon',
                        coordinates: validRings
                    } as GeoJSON.Polygon;
                }
            } catch (e) {
                console.warn("Error parsing alert polygon", e);
            }
        }

        if (geometry) {
            const severity = feature.properties.severity || 'Unknown';
            const colors = getEventColors(feature.properties.event, severity);

            const geoJsonFeature: GeoJSON.Feature = {
                type: 'Feature',
                geometry: geometry,
                properties: feature.properties
            };

            const layer = L.geoJSON(geoJsonFeature, {
                style: {
                    color: colors.border,
                    fillColor: colors.dot, // Use the 'dot' color for fill which is usually brighter/matching
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.2
                }
            }).addTo(map);

            geometryLayerRef.current = layer;

            try {
                map.fitBounds(layer.getBounds(), { padding: [20, 20] });
            } catch { /* ignore invalid bounds */ }
        }

    }, [feature, isVisible]);

    // Render Radar Overlay
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;
        
        // Cleanup old radar if hidden or updating
        if ((!showRadar || !currentTimestamp || !ewmrsUrl) && radarLayerRef.current) {
             map.removeLayer(radarLayerRef.current);
             radarLayerRef.current = null;
        }

        if (!showRadar || !currentTimestamp || !ewmrsUrl) return;

        const loadRadar = async () => {
             // Cleanup (double check)
            if (radarLayerRef.current) {
                map.removeLayer(radarLayerRef.current);
                radarLayerRef.current = null;
            }

            try {
                const api = new EWMRSAPI(ewmrsUrl);
                // Assume 'Reflectivity' is always available or fallback to CompRef
                const timestamps = await api.getProductTimestamps('Reflectivity');
                const bestTs = findClosestTimestamp(currentTimestamp, timestamps);

                if (!isMountedRef.current || !map.getContainer()) return;

                if (bestTs) {
                    const url = api.getRenderUrl('Reflectivity', bestTs);
                    const bounds: L.LatLngBoundsExpression = [[20, -130], [55, -60]]; // CONUS fixed bounds for now (matches main map)
                    
                    const overlay = L.imageOverlay(url, bounds, { opacity: 0.6 }).addTo(map);
                    overlay.bringToBack();
                    radarLayerRef.current = overlay;
                }
            } catch (e) {
                console.warn("Failed to load alert radar", e);
            }
        };

        loadRadar();

    }, [currentTimestamp, ewmrsUrl, isVisible, showRadar]);

    return (
        <div className="w-full h-full bg-black/40 relative group">
             <div ref={mapContainerRef} className="w-full h-full" />
             
             {/* Interaction Overlay - Pointer events auto via Leaflet, just border */}
             <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-lg z-[400]" />
             
             {/* Controls */}
             <div className="absolute top-2 right-2 z-[500] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent map click if any
                        setShowRadar(!showRadar);
                    }}
                    className={`p-1.5 rounded shadow-lg backdrop-blur-sm transition-colors border border-white/10 ${showRadar ? 'bg-blue-600 text-white' : 'bg-black/60 text-slate-300 hover:bg-black/80'}`}
                    title="Toggle Radar Layer"
                >
                    <Layers size={14} />
                </button>
             </div>
        </div>
    );
}

export default memo(AlertMap);
