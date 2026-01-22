
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { findClosestTimestamp } from '@/utils/timestamp';

interface UseMETARLayerProps {
    map: L.Map | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiRef: React.MutableRefObject<any>;
    showMetar: boolean;
    currentTimestamp: string | null;
    currentZoom: number;
    refreshTrigger?: number;
}

export function useMETARLayer({
    map,
    apiRef,
    showMetar,
    currentTimestamp,
    currentZoom,
    refreshTrigger = 0
}: UseMETARLayerProps) {
    const metarLayerRef = useRef<L.LayerGroup | null>(null);
    const lastMetarTsRef = useRef<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastMetarDataRef = useRef<any>(null);
    const [metarTimestamps, setMetarTimestamps] = useState<string[]>([]);

    // Effect for METAR Timestamps
    useEffect(() => {
        if (showMetar && metarTimestamps.length === 0 && apiRef.current) {
            apiRef.current.fetchMetarTimestamps()
                .then((ts: string[]) => setMetarTimestamps(ts.sort()))
                .catch((e: unknown) => console.error("METAR TS error", e));
        }
    }, [showMetar, metarTimestamps.length, apiRef]);

    // Effect to render METAR
    useEffect(() => {
        if (!map) return;

        if (!showMetar) {
            if (metarLayerRef.current) {
                map.removeLayer(metarLayerRef.current);
                metarLayerRef.current = null;
                lastMetarTsRef.current = null;
            }
            return;
        }

        const renderMetar = async () => {
            if (!apiRef.current || metarTimestamps.length === 0) return;

            if (!currentTimestamp) return;

            // METARs are typically hourly, so allow a larger tolerance (e.g. 1.5 hours)
            const bestTs = findClosestTimestamp(currentTimestamp, metarTimestamps, 90 * 60 * 1000);

            if (!bestTs) return;

            let dataToRender = null;
            if (bestTs === lastMetarTsRef.current && lastMetarDataRef.current) {
                // Same TS, have data. Re-render for zoom/culling changes.
                dataToRender = lastMetarDataRef.current;
            } else {
                // New TS, fetch.
                try {
                    const data = await apiRef.current.downloadMetar(bestTs);
                    lastMetarDataRef.current = data;
                    lastMetarTsRef.current = bestTs;
                    dataToRender = data;
                } catch (err) {
                    console.warn("Failed to load METAR", err);
                    return;
                }
            }

            if (!dataToRender) return;

            // Clear existing or create new
            if (metarLayerRef.current) {
                metarLayerRef.current.clearLayers();
            } else {
                metarLayerRef.current = L.layerGroup().addTo(map);
            }

            lastMetarTsRef.current = bestTs;

            // Simple hash function for deterministic filtering
            const simpleHash = (str: string) => {
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                    const char = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash; // Convert to 32bit integer
                }
                return Math.abs(hash);
            };

            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const entries = (dataToRender as any).data || [];
                let visibleCount = 0;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                entries.forEach((entry: any) => {
                    if (!entry.coordinates || entry.coordinates.length !== 2) return;

                    // Viewport Culling: Only render if inside current map bounds
                    if (map.getBounds && !map.getBounds().contains(entry.coordinates)) return;

                    // Sparse rendering logic
                    let show = true;
                    if (entries.length > 50) {
                        const hash = simpleHash(entry.station);
                        if (currentZoom < 6) {
                            if (hash % 8 !== 0) show = false;
                        } else if (currentZoom < 8) {
                            if (hash % 4 !== 0) show = false;
                        } else if (currentZoom < 10) {
                            if (hash % 2 !== 0) show = false;
                        }
                    }

                    if (!show) return;
                    visibleCount++;

                    // Parse temperature for color coding (Celsius)
                    const parseTempVal = (t: string | number | null | undefined): number | null => {
                        if (t === null || t === undefined) return null;
                        let s = String(t);
                        if (s.startsWith('M')) s = '-' + s.substring(1);
                        const val = parseFloat(s);
                        return isNaN(val) ? null : val;
                    };

                    const dewVal = parseTempVal(entry.dewpoint);
                    let colorClass = 'dot-blue';
                    let colorHex = '#3b82f6';

                    if (dewVal !== null) {
                        if (dewVal >= 21) { colorClass = 'dot-red'; colorHex = '#ef4444'; }
                        else if (dewVal >= 18) { colorClass = 'dot-orange'; colorHex = '#f97316'; }
                        else if (dewVal >= 15) { colorClass = 'dot-yellow'; colorHex = '#eab308'; }
                        else if (dewVal >= 12) { colorClass = 'dot-green'; colorHex = '#22c55e'; }
                    }

                    // Define SVG strings for icons
                    const LUCIDE_PLANE = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M20 12v-2a2 2 0 0 0-2-2h-3.5L8 2H5l3 6H5l-1 2h1.5"/><path d="M16 16l-2 6h-2.5l1.5-6"/></svg>`;
                    const STATION_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M8 10a4 4 0 0 1 8 0"/><path d="M4 14a8 8 0 0 1 16 0"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/></svg>`;

                    const TEMP_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>`;
                    const DEW_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
                    const WIND_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`;

                    const isAirport = entry.station.length === 4;
                    const markerIconSvg = isAirport ? LUCIDE_PLANE : STATION_ICON;

                    const iconHtml = `
                        <div class="metar-glow" style="background-color: ${colorHex}"></div>
                        <div class="metar-dot ${colorClass}" style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;background:${colorHex};border:1px solid rgba(255,255,255,0.8);">
                            <div style="color:white; transform: scale(0.8);">${markerIconSvg}</div>
                        </div>
                    `;

                    const customIcon = L.divIcon({
                        className: 'metar-marker',
                        html: iconHtml,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });

                    const marker = L.marker(entry.coordinates, {
                        icon: customIcon,
                        title: `${entry.station}: ${entry.temperature}/${entry.dewpoint}`
                    });

                    let windStr = "N/A";
                    if (entry.wind) {
                        const gustStr = entry.wind.gust ? ` G${entry.wind.gust}` : '';
                        windStr = `${entry.wind.direction}° @ ${entry.wind.speed}kt${gustStr}`;
                    }

                    const formatTemp = (t: string | number | null | undefined) => {
                        if (t === null || t === undefined) return "N/A";
                        return String(t).replace('M', '-');
                    };
                    const tempStr = formatTemp(entry.temperature);
                    const dewStr = formatTemp(entry.dewpoint);

                    const popup = `
                        <div class="popup-header">
                            <span class="popup-station">${entry.station}</span>
                            <span class="popup-time-badge">${entry.observation_time.substring(11, 16)}Z</span>
                        </div>
                        <div class="popup-body">
                            <div class="metrics-grid">
                                <div class="popup-metric">
                                    <span class="metric-label">${TEMP_ICON} Temp</span>
                                    <div><span class="metric-value">${tempStr}</span><span class="metric-unit">°C</span></div>
                                </div>
                                <div class="popup-metric">
                                    <span class="metric-label">${DEW_ICON} Dewpoint</span>
                                    <div><span class="metric-value">${dewStr}</span><span class="metric-unit">°C</span></div>
                                </div>
                            </div>
                            <div class="wind-section">
                                <div class="wind-icon-box">${WIND_ICON}</div>
                                <div class="wind-info">
                                    <span class="wind-label">Wind Condition</span>
                                    <span class="wind-value">${windStr}</span>
                                </div>
                            </div>
                        </div>
                     `;

                    marker.bindPopup(popup, {
                        closeButton: false,
                        className: 'metar-popup',
                        maxWidth: 300
                    });
                    marker.addTo(metarLayerRef.current!);
                });
                console.log(`Rendered METAR: Zoom=${currentZoom}, Total=${entries.length}, Visible=${visibleCount}`);
            } catch (e) {
                console.warn("Error rendering METAR", e);
            }
        };

        renderMetar();
    }, [map, showMetar, currentTimestamp, metarTimestamps, currentZoom, refreshTrigger, apiRef]);
}
