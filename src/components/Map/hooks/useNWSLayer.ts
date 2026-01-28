
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { findClosestTimestamp } from '@/utils/timestamp';
import { ZoneResolver } from '@/utils/nws-geoloader';
import { getEventColors } from '../constants';
import { NWSAlertFeature } from '@/types';

interface UseNWSLayerProps {
    map: L.Map | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiRef: React.MutableRefObject<any>;
    showNWSAlerts: boolean;
    currentTimestamp: string | null;
    onFeaturesLoaded?: (features: NWSAlertFeature[]) => void;
    highlightedAlertId?: string | null;
    focusAlertId?: string | null;
}

export function useNWSLayer({
    map,
    apiRef,
    showNWSAlerts,
    currentTimestamp,
    onFeaturesLoaded,
    highlightedAlertId,
    focusAlertId
}: UseNWSLayerProps) {
    const nwsLayerRef = useRef<L.LayerGroup | null>(null);
    const lastNwsTsRef = useRef<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastNwsDataRef = useRef<any>(null);
    const [nwsTimestamps, setNwsTimestamps] = useState<string[]>([]);
    const [lastRenderTime, setLastRenderTime] = useState(0);

    // Effect for NWS Alerts - Fetch timestamps
    useEffect(() => {
        if (showNWSAlerts && nwsTimestamps.length === 0 && apiRef.current) {
            apiRef.current.fetchNWSTimestamps()
                .then((ts: string[]) => {
                    setNwsTimestamps(ts.sort());
                })
                .catch((e: unknown) => console.error("NWS TS error", e));
        }
    }, [showNWSAlerts, nwsTimestamps.length, apiRef]);

    // Handle Highlighting
    useEffect(() => {
        if (!nwsLayerRef.current) return;

        nwsLayerRef.current.eachLayer((l: any) => {
            if (!l.setStyle || !l.alertData) return;
            const feature = l.alertData;
            const isSelected = highlightedAlertId && (feature.id === highlightedAlertId || feature.properties.id === highlightedAlertId);

            const props = feature.properties;
            const severity = props.severity || 'Unknown';
            const colors = getEventColors(props.event, severity);

            const targetWeight = isSelected ? 4 : 2;
            const targetColor = isSelected ? '#ffffff' : colors.border;
            const targetOpacity = isSelected ? 1 : 1;
            const targetFillOpacity = isSelected ? 0.6 : 0.4;

            // Optimization: Skip setStyle if already in desired state
            // @ts-ignore - accessing leaflet interna/options
            if (l.options && l.options.weight === targetWeight && l.options.color === targetColor) {
                return;
            }

            l.setStyle({
                weight: targetWeight,
                color: targetColor,
                opacity: targetOpacity,
                fillColor: colors.dot,
                fillOpacity: targetFillOpacity
            });

            if (isSelected) {
                l.bringToFront();
            }
        });
    }, [highlightedAlertId, lastRenderTime]);

    // Handle Zoom
    useEffect(() => {
        if (!map || !nwsLayerRef.current || !focusAlertId) return;

        let foundLayer: L.Layer | null = null;
        nwsLayerRef.current.eachLayer((l: any) => {
            if (foundLayer) return;
            const feature = l.alertData;
            if (feature && (feature.id === focusAlertId || feature.properties.id === focusAlertId)) {
                foundLayer = l;
            }
        });

        if (foundLayer) {
            // foundLayer is L.GeoJSON (FeatureGroup) because we created it via L.geoJSON
            if (typeof (foundLayer as L.FeatureGroup).getBounds === 'function') {
                const bounds = (foundLayer as L.FeatureGroup).getBounds();
                if (bounds.isValid()) {
                    map.flyToBounds(bounds, { padding: [100, 100], maxZoom: 10, duration: 1.5 });
                }
            }
        }
    }, [focusAlertId, map, lastRenderTime]);

    useEffect(() => {
        if (!map) {
            return;
        }

        if (!showNWSAlerts) {
            if (nwsLayerRef.current) {
                map.removeLayer(nwsLayerRef.current);
                nwsLayerRef.current = null;
                lastNwsTsRef.current = null;
                // Clear content
                if (onFeaturesLoaded) onFeaturesLoaded([]);
            }
            return;
        }

        const renderNWS = async () => {
            if (!apiRef.current || nwsTimestamps.length === 0) {
                return;
            }

            if (!currentTimestamp) return;

            // NWS alerts are updated less frequently, allow 2 hour tolerance
            const bestTs = findClosestTimestamp(currentTimestamp, nwsTimestamps, 120 * 60 * 1000);
            if (!bestTs) {
                if (onFeaturesLoaded) onFeaturesLoaded([]);
                return;
            }

            let dataToRender = null;
            if (bestTs === lastNwsTsRef.current && lastNwsDataRef.current) {
                dataToRender = lastNwsDataRef.current;
            } else {
                try {
                    const data = await apiRef.current.downloadNWS(bestTs);
                    lastNwsDataRef.current = data;
                    lastNwsTsRef.current = bestTs;
                    dataToRender = data;
                } catch (err) {
                    console.warn("Failed to load NWS", err);
                    return;
                }
            }

            if (!dataToRender) return;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const features: any[] = (dataToRender as any).data?.features || [];
            // Filter duplicates here if needed?
            // Or pass all.
            if (onFeaturesLoaded) {
                onFeaturesLoaded(features);
            }

            // Clear existing or create new
            if (nwsLayerRef.current) {
                nwsLayerRef.current.clearLayers();
            } else {
                nwsLayerRef.current = L.layerGroup().addTo(map);
            }

            try {
                // PHASE 1: Collect ALL unique geocodes from ALL features
                const allGeocodes = new Set<string>();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                for (const feature of features) {
                    const props = feature.properties;
                    if (!props) continue;

                    // Check for custom Polygon property first
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if ((props as any).Polygon && Array.isArray((props as any).Polygon)) {
                        continue; // We have the polygon, no need to resolve geocodes
                    }

                    if (!feature.geometry || (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon')) {
                        const geocodes = [...(props.geocode?.UGC || []), ...(props.geocode?.SAME || [])];
                        geocodes.forEach(code => allGeocodes.add(code));
                    }
                }

                // PHASE 2: Fetch ALL geocodes in ONE parallel batch
                const geocodeArray = Array.from(allGeocodes);
                await Promise.all(geocodeArray.map(code => ZoneResolver.resolveGeometry(code)));

                // PHASE 3: Render all features (geocodes are now cached)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                for (const feature of features) {
                    const props = feature.properties;
                    if (!props) continue;

                    const geometries: (GeoJSON.Polygon | GeoJSON.MultiPolygon)[] = [];
                    let geometryHandled = false;

                    // 1. Try Standard GeoJSON Geometry (Storm-based, precise)
                    if (feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
                        geometries.push(feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon);
                        geometryHandled = true;
                    }

                    // 2. Try Computed Zone Polygon (Zone-based union) - injected as top-level field
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const customPolygon = (feature as any).Polygon;

                    if (!geometryHandled && customPolygon && Array.isArray(customPolygon) && customPolygon.length > 0) {
                        try {
                            // Determine depth to handle Rings[] (Polygon) vs Points[] (Ring)
                            const ismultiRing = Array.isArray(customPolygon[0]) && Array.isArray((customPolygon as any)[0][0]);

                            // Normalize to number[][][] (Array of Rings)
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const rings: any[] = ismultiRing ? customPolygon : [customPolygon];

                            const processedCoordinates = rings.map(ring => {
                                if (!Array.isArray(ring)) return [];

                                return ring.map((pt: any) => {
                                    if (!Array.isArray(pt) || pt.length < 2) return [0, 0];
                                    const val1 = Number(pt[0]);
                                    const val2 = Number(pt[1]);

                                    if (isNaN(val1) || isNaN(val2)) return [0, 0];

                                    // Heuristic: US Lat > 0, US Lon < 0
                                    // GeoJSON requires [Lon, Lat]
                                    if (val1 > 0 && val2 < 0) {
                                        // Input was [Lat, Lon] -> Swap to [Lon, Lat]
                                        return [val2, val1];
                                    } else {
                                        // Input was [Lon, Lat] -> Keep
                                        return [val1, val2];
                                    }
                                });
                            });

                            // Ensure rings are closed
                            processedCoordinates.forEach(ring => {
                                if (ring.length > 0) {
                                    const first = ring[0];
                                    const last = ring[ring.length - 1];
                                    if (first[0] !== last[0] || first[1] !== last[1]) {
                                        ring.push(first);
                                    }
                                }
                            });

                            const validRings = processedCoordinates.filter(r => r.length >= 4); // Min 3 pts + closed

                            if (validRings.length > 0) {
                                geometries.push({
                                    type: 'Polygon',
                                    coordinates: validRings
                                });
                                geometryHandled = true;
                            }
                        } catch (e) {
                            console.warn("Failed to parse custom Polygon for", props.event, e);
                        }
                    }

                    // 3. Fallback to Zone Lookup (Slow, individual zones)
                    if (!geometryHandled) {
                        const geocodes = [...(props.geocode?.UGC || []), ...(props.geocode?.SAME || [])];
                        for (const code of geocodes) {
                            const resolved = await ZoneResolver.resolveGeometry(code); // Uses cache
                            if (resolved?.geometry) {
                                geometries.push(resolved.geometry);
                            }
                        }
                    }

                    if (geometries.length === 0) continue;

                    const severity = props.severity || 'Unknown';
                    const colors = getEventColors(props.event, severity);

                    const formatTime = (iso: string) => {
                        try {
                            return new Date(iso).toLocaleString('en-US', {
                                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
                            });
                        } catch { return iso; }
                    };

                    const popup = `
                        <div class="nws-popup-content" style="--alert-color: ${colors.border}; --alert-bg: ${colors.bg};">
                            <div class="nws-popup-header">
                                <span class="nws-event-type">${props.event}</span>
                                <span class="nws-severity-badge">${severity}</span>
                            </div>
                            <div class="nws-popup-body">
                                <div class="nws-headline">${props.headline}</div>
                                <div class="nws-times">
                                    <div><strong>Effective</strong> ${formatTime(props.effective)}</div>
                                    <div><strong>Expires</strong> ${formatTime(props.expires)}</div>
                                    <div style="margin-top:4px;"><strong>Sender</strong> ${props.senderName}</div>
                                </div>
                                <div class="nws-areas"><strong>Areas:</strong> ${props.areaDesc}</div>
                            </div>
                        </div>
                    `;

                    // Combine all polygons into a single MultiPolygon
                    const allPolygons: number[][][][] = [];

                    for (const geom of geometries) {
                        if (geom.type === 'Polygon') {
                            allPolygons.push(geom.coordinates);
                        } else if (geom.type === 'MultiPolygon') {
                            allPolygons.push(...geom.coordinates);
                        }
                    }

                    if (allPolygons.length === 0) continue;

                    const mergedGeometry: GeoJSON.MultiPolygon = {
                        type: 'MultiPolygon',
                        coordinates: allPolygons
                    };

                    const geoJSONFeature: GeoJSON.Feature = {
                        type: 'Feature',
                        geometry: mergedGeometry,
                        properties: props
                    };

                    const layer = L.geoJSON(geoJSONFeature, {
                        style: () => ({
                            color: colors.border,
                            fillColor: colors.dot,
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0.4
                        })
                    });

                    // Store feature for highlighting lookup
                    (layer as any).alertData = feature;

                    layer.bindPopup(popup, {
                        closeButton: true,
                        className: 'nws-popup',
                        maxWidth: 500,
                        minWidth: 400
                    });

                    layer.addTo(nwsLayerRef.current!);
                }
            } catch (e) {
                console.warn("Error rendering NWS", e);
            }
            setLastRenderTime(Date.now());
        };

        renderNWS();
    }, [map, showNWSAlerts, currentTimestamp, nwsTimestamps, apiRef, onFeaturesLoaded]);
}
