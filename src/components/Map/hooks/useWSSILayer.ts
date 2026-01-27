import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { fetchWSSI } from '@/utils/wssi-api';

interface UseWSSILayerProps {
    map: L.Map | null;
    showDay1: boolean;
    showDay2: boolean;
    showDay3: boolean;
}

// WSSI Colors (Winter Storm Impact Levels)
// WSSI Colors (Winter Storm Impact Levels)
// Colors derived from WPC official metadata
const WSSI_COLORS: Record<string, string> = {
    'WINTER WEATHER AREA': '#d2dfe7', // Light Blue/Gray
    'MINOR': '#faf5a3',     // Pale Yellow
    'MODERATE': '#f7962f',  // Orange
    'MAJOR': '#e61f26',     // Red
    'EXTREME': '#7853a1',   // Purple
    'None': 'transparent',
    'Unknown': '#999999'
};

// Map numeric WSSI codes to labels if needed. usually it's text "Limited" etc in the property "Makrb" or similar
// Or we map numeric to colors directly.
// Checking schema: properties usually have descriptive text.

export function useWSSILayer({
    map,
    showDay1,
    showDay2,
    showDay3
}: UseWSSILayerProps) {
    const layerGroupsRef = useRef<{ [key: number]: L.LayerGroup | null }>({
        1: null,
        2: null,
        3: null
    });

    useEffect(() => {
        if (!map) return;

        const updateLayer = async (day: 1 | 2 | 3, visible: boolean) => {
            // If visible and not loaded, fetch and add
            if (visible) {
                if (!layerGroupsRef.current[day]) {
                    try {
                        console.log(`[WSSI] Fetching Day ${day}...`);
                        const data = await fetchWSSI(day);
                        
                        const layer = L.geoJSON(data as any, {
                            style: (feature) => {
                                const impact = feature?.properties?.impact || 'None';
                                const color = WSSI_COLORS[impact] || WSSI_COLORS['Unknown'];
                                
                                return {
                                    color: '#666', // darker outline
                                    weight: 0.5,
                                    opacity: 0.8,
                                    fillColor: color,
                                    fillOpacity: 0.6
                                };
                            },
                            onEachFeature: (feature, layer) => {
                                const props = feature.properties || {};
                                const impact = props.impact || 'Unknown';
                                const validTime = props.valid_time || 'Unknown';
                                const description = props.component ? `${props.component} Impact` : 'Potential winter storm impacts.';
                                const color = WSSI_COLORS[impact] || '#999';
                                
                                const content = `
                                    <div class="p-2 font-sans max-w-xs">
                                        <div class="font-bold border-b mb-1 text-sm uppercase" style="color:${color}; border-color: #444;">
                                            WSSI: ${impact}
                                        </div>
                                        <div class="text-xs text-gray-200 mt-1">
                                            <b>Valid:</b> ${validTime}<br/>
                                            ${description}
                                        </div>
                                    </div>
                                `;
                                layer.bindPopup(content, { className: 'spc-popup' }); // Reuse SPC popup style for consistency
                            }
                        });

                        layerGroupsRef.current[day] = layer;
                        layer.addTo(map);
                        console.log(`[WSSI] Day ${day} added.`);
                    } catch (err) {
                        console.error(`[WSSI] Failed to load Day ${day}`, err);
                    }
                } else {
                    // Already loaded, just add to map if not present
                     if (!map.hasLayer(layerGroupsRef.current[day]!)) {
                        layerGroupsRef.current[day]!.addTo(map);
                     }
                }
            } else {
                // Not visible, remove from map
                if (layerGroupsRef.current[day] && map.hasLayer(layerGroupsRef.current[day]!)) {
                    map.removeLayer(layerGroupsRef.current[day]!);
                }
            }
        };

        updateLayer(1, showDay1);
        updateLayer(2, showDay2);
        updateLayer(3, showDay3);

    }, [map, showDay1, showDay2, showDay3]);
}
