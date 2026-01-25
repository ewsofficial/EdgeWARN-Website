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
const WSSI_COLORS: Record<string, string> = {
    'Limited': '#4ba6ff',   // Blue
    'Minor': '#f5e236',     // Yellow
    'Moderate': '#ff9b21',  // Orange
    'Major': '#d90000',     // Red
    'Extreme': '#b300b3',   // Purple
    'None': 'transparent'
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
                                const impact = feature?.properties?.Makrb || feature?.properties?.WSSI_Level || 'None';
                                const color = WSSI_COLORS[impact] || '#999';
                                
                                return {
                                    color: color,
                                    weight: 1,
                                    opacity: 0.8,
                                    fillColor: color,
                                    fillOpacity: 0.5
                                };
                            },
                            onEachFeature: (feature, layer) => {
                                const props = feature.properties || {};
                                const impact = props.Makrb || props.WSSI_Level || 'Unknown';
                                const description = props.Rel_Impact || 'Potential winter storm impacts.';
                                
                                const content = `
                                    <div class="p-2 font-sans max-w-xs">
                                        <div class="font-bold border-b mb-1 text-sm uppercase" style="color:${WSSI_COLORS[impact] || '#fff'}">
                                            WSSI: ${impact} Impact
                                        </div>
                                        <div class="text-xs text-gray-200 mt-1">
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
