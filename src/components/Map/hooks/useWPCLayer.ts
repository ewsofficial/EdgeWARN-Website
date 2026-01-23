
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-polylinedecorator';
import { EWMRSAPI } from '@/utils/ewmrs-api';

// Add type definition for polylineDecorator if missing
declare module 'leaflet' {
    function polylineDecorator(paths: L.Polyline | L.Polyline[], options?: any): any;
}

interface UseWPCLayerProps {
    map: L.Map | null;
    ewmrsApi: EWMRSAPI | null;
    showWpc: boolean;
}

export function useWPCLayer({
    map,
    ewmrsApi,
    showWpc,
}: UseWPCLayerProps) {
    const wpcLayerRef = useRef<L.LayerGroup | null>(null);

    useEffect(() => {
        if (!map || !ewmrsApi) return;

        const loadLayer = async () => {
            console.log('[WPC] loadLayer called. showWpc:', showWpc);

            if (showWpc) {
                if (wpcLayerRef.current) {
                    console.log('[WPC] Layer already exists, skipping load.');
                    return;
                }

                try {
                    console.log('[WPC] Fetching WPC Surface Analysis...');
                    const data = await ewmrsApi.fetchWpcSurfaceAnalysis();
                    console.log('[WPC] Data received. Features:', data?.features?.length);

                    const layerGroup = L.layerGroup();

                    // Pressure Icons (H/L)
                    const createPressureIcon = (type: 'HIGH' | 'LOW', pressure?: string | number) => {
                        const color = type === 'HIGH' ? '#1e40af' : '#dc2626';
                        const text = type === 'HIGH' ? 'H' : 'L';
                        const pressureText = pressure ? `<div style="
                            font-size: 14px; 
                            color: #000; 
                            font-weight: 800; 
                            margin-top: -5px;
                            text-shadow: 2px 2px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
                        ">${parseInt(String(pressure))}</div>` : '';

                        return L.divIcon({
                            className: '', // Remove default white background
                            html: `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 40px; height: 60px;">
                                <div style="
                                    color: ${color};
                                    font-weight: 900;
                                    font-size: 32px;
                                    font-family: Arial, sans-serif;
                                    text-shadow: 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff;
                                    line-height: 1;
                                ">${text}</div>
                                ${pressureText}
                            </div>`,
                            iconSize: [40, 60],
                            iconAnchor: [20, 30]
                        });
                    };

                    L.geoJSON(data as any, {
                        style: (feature) => {
                            const props = feature?.properties || {};
                            const type = (props.type || props.feature_type || props.FEATURE || props.feature || "").toUpperCase();

                            if (type === 'ISOBAR') return { color: '#000', weight: 1.5, opacity: 0.6 };
                            if (type === 'TROUGH' || type === 'TROF') return { color: '#f97316', weight: 2.5, dashArray: '6, 4', opacity: 0.8 };

                            if (type.includes('COLD')) return { color: '#1d4ed8', weight: 3, opacity: 1 };
                            if (type.includes('WARM')) return { color: '#dc2626', weight: 3, opacity: 1 };
                            if (type.includes('OCCL')) return { color: '#7e22ce', weight: 3, opacity: 1 };
                            if (type.includes('STNRY') || type.includes('STATIONARY')) {
                                return { color: '#dc2626', weight: 2, dashArray: '10, 10', opacity: 1 };
                            }

                            if (feature?.geometry?.type?.includes('LineString')) {
                                return { color: '#9ca3af', weight: 1, opacity: 0.3 };
                            }

                            return { opacity: 0, fillOpacity: 0 };
                        },
                        pointToLayer: (feature, latlng) => {
                            const props = feature?.properties || {};
                            const type = (props.type || props.feature_type || props.FEATURE || props.feature || "").toUpperCase();
                            const label = (props.LABEL || "").toUpperCase();
                            const pressure = props.pressure || props.PRESSURE || props.press || props.PRESS || props.max_pressure || props.min_pressure;

                            if (type.includes('HIGH') || label.startsWith('H')) {
                                return L.marker(latlng, { icon: createPressureIcon('HIGH', pressure) });
                            }
                            if (type.includes('LOW') || label.startsWith('L')) {
                                return L.marker(latlng, { icon: createPressureIcon('LOW', pressure) });
                            }
                            return L.circleMarker(latlng, { radius: 0, opacity: 0 });
                        },
                        onEachFeature: (feature, layer) => {
                            const props = feature?.properties || {};
                            const type = (props.type || props.feature_type || props.FEATURE || props.feature || "").toUpperCase();

                            if (layer instanceof L.Polyline) {
                                // To avoid shadowing 'Symbol', access via L.Symbol only if needed, 
                                // but the library adds it to L.
                                const LeafletSymbol: any = (L as any).Symbol;
                                const patterns: any[] = [];

                                if (type.includes('COLD')) {
                                    const iconHtml = (color: string) => {
                                        const w = 18;
                                        const h = 14;
                                        const d = `M 0 ${h} L ${w / 2} 0 L ${w} ${h} Z`;
                                        return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="transform: rotate(-90deg); transform-origin: 50% 100%; overflow:visible;">
                                            <path d="${d}" fill="${color}" stroke="${color}" stroke-width="1"/>
                                        </svg>`;
                                    };

                                    patterns.push({
                                        offset: 25, repeat: 60,
                                        symbol: LeafletSymbol.marker({
                                            rotate: true,
                                            markerOptions: {
                                                icon: L.divIcon({
                                                    className: '',
                                                    html: iconHtml('#1d4ed8'),
                                                    iconSize: [18, 14],
                                                    iconAnchor: [9, 14],
                                                })
                                            }
                                        })
                                    });
                                }
                                else if (type.includes('WARM')) {
                                    const iconHtml = (color: string) => {
                                        const w = 18;
                                        const h = 14;
                                        const d = `M 0 ${h} A ${w / 2} ${h} 0 0 1 ${w} ${h} Z`;
                                        return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="transform: rotate(-90deg); transform-origin: 50% 100%; overflow:visible;">
                                            <path d="${d}" fill="${color}" stroke="${color}" stroke-width="1"/>
                                        </svg>`;
                                    };
                                    patterns.push({
                                        offset: 25, repeat: 60,
                                        symbol: LeafletSymbol.marker({
                                            rotate: true,
                                            markerOptions: {
                                                icon: L.divIcon({
                                                    className: '',
                                                    html: iconHtml('#dc2626'),
                                                    iconSize: [18, 14],
                                                    iconAnchor: [9, 14],
                                                })
                                            }
                                        })
                                    });
                                }
                                else if (type.includes('OCCL')) {
                                    const iconHtml = (shape: 'tri' | 'semi') => {
                                        const w = 18;
                                        const h = 14;
                                        const color = '#7e22ce';
                                        let d = `M 0 ${h} L ${w / 2} 0 L ${w} ${h} Z`;
                                        if (shape === 'semi') d = `M 0 ${h} A ${w / 2} ${h} 0 0 1 ${w} ${h} Z`;
                                        return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="transform: rotate(-90deg); transform-origin: 50% 100%; overflow:visible;">
                                            <path d="${d}" fill="${color}" stroke="${color}" stroke-width="1"/>
                                        </svg>`;
                                    };
                                    patterns.push({ offset: 25, repeat: 80, symbol: LeafletSymbol.marker({ rotate: true, markerOptions: { icon: L.divIcon({ className: '', html: iconHtml('tri'), iconSize: [18, 14], iconAnchor: [9, 14] }) } }) });
                                    patterns.push({ offset: 65, repeat: 80, symbol: LeafletSymbol.marker({ rotate: true, markerOptions: { icon: L.divIcon({ className: '', html: iconHtml('semi'), iconSize: [18, 14], iconAnchor: [9, 14] }) } }) });
                                }
                                else if (type.includes('STNRY') || type.includes('STATIONARY')) {
                                    const semiHtml = () => {
                                        const w = 18;
                                        const h = 14;
                                        const color = '#dc2626';
                                        const d = `M 0 ${h} A ${w / 2} ${h} 0 0 1 ${w} ${h} Z`;
                                        return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="transform: rotate(-90deg); transform-origin: 50% 100%; overflow:visible;">
                                            <path d="${d}" fill="${color}" stroke="${color}" stroke-width="1"/>
                                        </svg>`;
                                    };
                                    const triHtml = () => {
                                        const w = 18;
                                        const h = 14;
                                        const color = '#1d4ed8';
                                        const d = `M 0 ${h} L ${w / 2} 0 L ${w} ${h} Z`;
                                        // Rotate +90 for other side
                                        return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="transform: rotate(90deg); transform-origin: 50% 100%; overflow:visible;">
                                            <path d="${d}" fill="${color}" stroke="${color}" stroke-width="1"/>
                                        </svg>`;
                                    };

                                    patterns.push({ offset: 25, repeat: 80, symbol: LeafletSymbol.marker({ rotate: true, markerOptions: { icon: L.divIcon({ className: '', html: semiHtml(), iconSize: [18, 14], iconAnchor: [9, 14] }) } }) });
                                    patterns.push({ offset: 65, repeat: 80, symbol: LeafletSymbol.marker({ rotate: true, markerOptions: { icon: L.divIcon({ className: '', html: triHtml(), iconSize: [18, 14], iconAnchor: [9, 14] }) } }) });
                                }

                                if (patterns.length > 0) {
                                    const decorator = L.polylineDecorator(layer, { patterns });
                                    decorator.addTo(layerGroup);
                                }
                            }

                            // Bind popup
                            let popupContent = '<div class="p-2 font-sans overflow-hidden max-w-64">';
                            popupContent += `<div class="font-bold border-b mb-1 uppercase text-xs text-blue-600">${type || 'SURFACE FEATURE'}</div>`;
                            Object.entries(props).forEach(([key, value]) => {
                                if (key === 'type' || key === 'feature_type' || key === 'FEATURE' || key === 'feature') return;
                                popupContent += `<div class="text-[10px] leading-tight mb-0.5"><span class="text-gray-400 font-medium">${key}:</span> ${value}</div>`;
                            });
                            popupContent += '</div>';
                            layer.bindPopup(popupContent, { maxWidth: 200 });

                            layer.addTo(layerGroup);
                        }
                    });

                    layerGroup.addTo(map);
                    wpcLayerRef.current = layerGroup;
                    console.log('[WPC] Layer added to map.');

                } catch (err) {
                    console.error("[WPC] Failed to load WPC Surface Analysis layer", err);
                }
            } else {
                if (wpcLayerRef.current) {
                    console.log('[WPC] Removing layer.');
                    map.removeLayer(wpcLayerRef.current);
                    wpcLayerRef.current = null;
                }
            }
        };

        loadLayer();
    }, [map, ewmrsApi, showWpc]);
}
