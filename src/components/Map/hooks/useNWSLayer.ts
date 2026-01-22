
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { findClosestTimestamp } from '@/utils/timestamp';
import { ZoneResolver } from '@/utils/nws-geoloader';

interface UseNWSLayerProps {
    map: L.Map | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiRef: React.MutableRefObject<any>;
    showNWSAlerts: boolean;
    currentTimestamp: string | null;
}

export function useNWSLayer({
    map,
    apiRef,
    showNWSAlerts,
    currentTimestamp
}: UseNWSLayerProps) {
    const nwsLayerRef = useRef<L.LayerGroup | null>(null);
    const lastNwsTsRef = useRef<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastNwsDataRef = useRef<any>(null);
    const [nwsTimestamps, setNwsTimestamps] = useState<string[]>([]);

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

    useEffect(() => {
        if (!map) {
            return;
        }

        if (!showNWSAlerts) {
            if (nwsLayerRef.current) {
                map.removeLayer(nwsLayerRef.current);
                nwsLayerRef.current = null;
                lastNwsTsRef.current = null;
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
            if (!bestTs) return;

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

            // Clear existing or create new
            if (nwsLayerRef.current) {
                nwsLayerRef.current.clearLayers();
            } else {
                nwsLayerRef.current = L.layerGroup().addTo(map);
            }

            // Severity color mapping
            const severityColors: Record<string, { bg: string; border: string; dot: string }> = {
                'Extreme': { bg: '#7c2d12', border: '#ea580c', dot: '#f97316' },
                'Severe': { bg: '#7f1d1d', border: '#dc2626', dot: '#ef4444' },
                'Moderate': { bg: '#78350f', border: '#d97706', dot: '#f59e0b' },
                'Minor': { bg: '#1e3a5f', border: '#3b82f6', dot: '#60a5fa' },
                'Unknown': { bg: '#374151', border: '#6b7280', dot: '#9ca3af' },
            };

            // Event-based color mapping (NWS Standardish)
            const getEventColors = (event: string, severity: string) => {
                const e = event.toLowerCase();
                if (e.includes('tornado')) return { bg: '#450a0a', border: '#ef4444', dot: '#ff0000' }; // Bright Red
                if (e.includes('thunderstorm')) return { bg: '#451a03', border: '#f97316', dot: '#ffa500' }; // Orange
                if (e.includes('winter') || e.includes('snow') || e.includes('blizzard')) return { bg: '#172554', border: '#3b82f6', dot: '#0000ff' }; // Blue
                if (e.includes('flash flood')) return { bg: '#450a0a', border: '#dc2626', dot: '#8b0000' }; // Maroon
                if (e.includes('flood')) return { bg: '#064e3b', border: '#10b981', dot: '#00ff00' }; // Lime
                if (e.includes('marine')) return { bg: '#3f2b10', border: '#eab308', dot: '#ffd700' }; // Gold

                // Fallback to severity
                return severityColors[severity] || severityColors['Unknown'];
            };

            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const features = (dataToRender as any).data?.features || [];

                // PHASE 1: Collect ALL unique geocodes from ALL features
                const allGeocodes = new Set<string>();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                for (const feature of features) {
                    const props = feature.properties;
                    if (!props) continue;
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

                    if (feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
                        geometries.push(feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon);
                    } else {
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
                        <div class="nws-popup-content">
                            <div class="nws-popup-header" style="background:linear-gradient(135deg, ${colors.bg}, transparent);border-left:3px solid ${colors.border};">
                                <span class="nws-event-type" style="color:${colors.border};">${props.event}</span>
                                <span class="nws-severity-badge" style="background:${colors.border};">${severity}</span>
                            </div>
                            <div class="nws-popup-body">
                                <div class="nws-sender">${props.senderName}</div>
                                <div class="nws-headline">${props.headline}</div>
                                <div class="nws-times">
                                    <div><strong>Effective:</strong> ${formatTime(props.effective)}</div>
                                    <div><strong>Expires:</strong> ${formatTime(props.expires)}</div>
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
                            weight: 0,  // No stroke - avoid interior lines
                            opacity: 0,
                            fillOpacity: 0.4
                        })
                    });

                    layer.bindPopup(popup, {
                        closeButton: true,
                        className: 'nws-popup',
                        maxWidth: 350,
                        minWidth: 280
                    });

                    layer.addTo(nwsLayerRef.current!);
                }
            } catch (e) {
                console.warn("Error rendering NWS", e);
            }
        };

        renderNWS();
    }, [map, showNWSAlerts, currentTimestamp, nwsTimestamps, apiRef]);
}
