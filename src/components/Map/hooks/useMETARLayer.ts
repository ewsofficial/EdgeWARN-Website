
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
    const lastMetarDataRef = useRef<any>(null);
    const canvasRendererRef = useRef<L.Canvas | null>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
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

            const bestTs = findClosestTimestamp(currentTimestamp, metarTimestamps, 90 * 60 * 1000);
            if (!bestTs) return;

            let dataToRender = null;
            if (bestTs === lastMetarTsRef.current && lastMetarDataRef.current) {
                dataToRender = lastMetarDataRef.current;
            } else {
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

            // Initialize Canvas Renderer if not exists
            if (!canvasRendererRef.current) {
                canvasRendererRef.current = L.canvas({ padding: 0.5 });
            }

            // Clear existing or create new
            if (metarLayerRef.current) {
                metarLayerRef.current.clearLayers();
            } else {
                metarLayerRef.current = L.layerGroup().addTo(map);
            }

            const simpleHash = (str: string) => {
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                    const char = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                }
                return Math.abs(hash);
            };

            try {
                const entries = (dataToRender as any).data || [];
                const bounds = map.getBounds();
                let visibleCount = 0;

                // Icons (only used when zoomed in)
                const LUCIDE_PLANE = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M20 12v-2a2 2 0 0 0-2-2h-3.5L8 2H5l3 6H5l-1 2h1.5"/><path d="M16 16l-2 6h-2.5l1.5-6"/></svg>`;
                const STATION_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M8 10a4 4 0 0 1 8 0"/><path d="M4 14a8 8 0 0 1 16 0"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/></svg>`;

                const useCanvas = currentZoom < 9;

                entries.forEach((entry: any) => {
                    if (!entry.coordinates || entry.coordinates.length !== 2) return;
                    if (!bounds.contains(entry.coordinates)) return;

                    let show = true;
                    if (entries.length > 50) {
                        const hash = simpleHash(entry.station);
                        if (currentZoom < 6) {
                            if (hash % 12 !== 0) show = false;
                        } else if (currentZoom < 8) {
                            if (hash % 6 !== 0) show = false;
                        } else if (currentZoom < 9) {
                            if (hash % 3 !== 0) show = false;
                        }
                    }

                    if (!show) return;
                    visibleCount++;

                    const parseTempVal = (t: string | number | null | undefined): number | null => {
                        if (t === null || t === undefined) return null;
                        let s = String(t);
                        if (s.startsWith('M')) s = '-' + s.substring(1);
                        const val = parseFloat(s);
                        return isNaN(val) ? null : val;
                    };

                    const dewVal = parseTempVal(entry.dewpoint);
                    let colorHex = '#3b82f6';
                    let colorClass = 'dot-blue';
                    if (dewVal !== null) {
                        if (dewVal >= 21) { colorHex = '#ef4444'; colorClass = 'dot-red'; }
                        else if (dewVal >= 18) { colorHex = '#f97316'; colorClass = 'dot-orange'; }
                        else if (dewVal >= 15) { colorHex = '#eab308'; colorClass = 'dot-yellow'; }
                        else if (dewVal >= 12) { colorHex = '#22c55e'; colorClass = 'dot-green'; }
                    }

                    let marker: L.Layer;

                    if (useCanvas) {
                        // High-performance dots for zoom out
                        marker = L.circleMarker(entry.coordinates, {
                            renderer: canvasRendererRef.current!,
                            radius: currentZoom < 7 ? 4 : 5,
                            fillColor: colorHex,
                            color: '#ffffff',
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.9,
                        });
                    } else {
                        // Original detailed icons for zoom in
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

                        marker = L.marker(entry.coordinates, { icon: customIcon });
                    }

                    const formatTemp = (t: string | number | null | undefined) => {
                        if (t === null || t === undefined) return "N/A";
                        return String(t).replace('M', '-');
                    };

                    let windStr = "N/A";
                    if (entry.wind) {
                        const gustStr = entry.wind.gust ? ` G${entry.wind.gust}` : '';
                        windStr = `${entry.wind.direction}° @ ${entry.wind.speed}kt${gustStr}`;
                    }

                    const popup = `
                        <div class="popup-header">
                            <span class="popup-station">${entry.station}</span>
                            <span class="popup-time-badge">${entry.observation_time.substring(11, 16)}Z</span>
                        </div>
                        <div class="popup-body">
                            <div class="metrics-grid">
                                <div class="popup-metric">
                                    <span class="metric-label">Temp</span>
                                    <div><span class="metric-value">${formatTemp(entry.temperature)}</span><span class="metric-unit">°C</span></div>
                                </div>
                                <div class="popup-metric">
                                    <span class="metric-label">Dewpoint</span>
                                    <div><span class="metric-value">${formatTemp(entry.dewpoint)}</span><span class="metric-unit">°C</span></div>
                                </div>
                            </div>
                            <div class="wind-section" style="margin-top: 8px;">
                                <div class="wind-info">
                                    <span class="wind-label" style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Wind</span>
                                    <span class="wind-value" style="display: block; font-weight: bold; color: #f8fafc;">${windStr}</span>
                                </div>
                            </div>
                        </div>
                    `;

                    marker.bindPopup(popup, {
                        closeButton: false,
                        className: 'metar-popup',
                        maxWidth: 200
                    });

                    marker.addTo(metarLayerRef.current!);
                });
                console.log(`Rendered METAR (Hybrid): Zoom=${currentZoom}, Mode=${useCanvas ? 'Canvas' : 'DOM'}, Visible=${visibleCount}/${entries.length}`);
            } catch (e) {
                console.warn("Error rendering METAR", e);
            }
        };

        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            renderMetar();
        }, 200);

        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [map, showMetar, currentTimestamp, metarTimestamps, currentZoom, refreshTrigger, apiRef]);
}
