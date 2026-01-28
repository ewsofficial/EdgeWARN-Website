import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { fetchWPCEro } from '@/utils/wpc-api';

// WPC ERO Colors
const WPC_ERO_COLORS: Record<string, string> = {
    'Marginal': '#00ff00',      // Green
    'Slight': '#ffff00',        // Yellow
    'Moderate': '#ff0000',      // Red
    'High': '#ff00ff'           // Pink
};

const WPC_LAYER_STYLE = {
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.3
};

interface UseWPCEroLayerProps {
    map: L.Map | null;
    showDay1: boolean;
    showDay2: boolean;
    showDay3: boolean;
}

export function useWPCEroLayer({
    map,
    showDay1,
    showDay2,
    showDay3
}: UseWPCEroLayerProps) {
    const day1LayerRef = useRef<L.GeoJSON | null>(null);
    const day2LayerRef = useRef<L.GeoJSON | null>(null);
    const day3LayerRef = useRef<L.GeoJSON | null>(null);

    const loadLayer = useCallback(async (
        day: 1 | 2 | 3,
        show: boolean,
        layerRef: React.MutableRefObject<L.GeoJSON | null>
    ) => {
        if (!map) return;

        if (show) {
            if (layerRef.current) return; // Already loaded

            try {
                const data = await fetchWPCEro(day);

                layerRef.current = L.geoJSON(data as any, {
                    style: (feature) => {
                        const outlookRaw = feature?.properties?.outlook || "";
                        // Parse outlook: "Marginal (At Least 5%)" -> "Marginal"
                        const outlook = outlookRaw.split(' ')[0];
                        const color = WPC_ERO_COLORS[outlook] || '#808080';
                        return {
                            ...WPC_LAYER_STYLE,
                            color: color,
                            fillColor: color
                        };
                    },
                    onEachFeature: (feature, layer) => {
                        if (feature.properties) {
                            const outlookRaw = feature.properties.outlook || "";
                            const outlook = outlookRaw.split(' ')[0];
                            const start = feature.properties.start_time;
                            const end = feature.properties.end_time;
                            const issue = feature.properties.issue_time;

                            const color = WPC_ERO_COLORS[outlook] || '#808080';

                            const popupContent = `
                                <div class="spc-popup-content">
                                    <div class="spc-popup-header">
                                        <span class="spc-title">WPC Day ${day} ERO</span>
                                        <span class="spc-threat-badge" style="background:${color}; color: #000; text-shadow: none;">${outlook}</span>
                                    </div>
                                    <div class="spc-popup-body">
                                        <div class="spc-times">
                                            <div><strong>Valid:</strong> ${start} - ${end}</div>
                                            <div><strong>Issued:</strong> ${issue}</div>
                                        </div>
                                    </div>
                                </div>`;

                            layer.bindPopup(popupContent, {
                                className: 'spc-popup', // Reuse SPC popup styles
                                closeButton: false,
                                maxWidth: 300
                            });

                            layer.bindTooltip(`ERO: ${outlook}`, {
                                sticky: true,
                                className: 'px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs shadow-md'
                            });
                        }
                    }
                }).addTo(map);
                layerRef.current.bringToBack();
            } catch (err) {
                console.error(`Failed to load WPC ERO Day ${day}`, err);
            }
        } else {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
                layerRef.current = null;
            }
        }
    }, [map]);

    useEffect(() => { loadLayer(1, showDay1, day1LayerRef); }, [showDay1, loadLayer]);
    useEffect(() => { loadLayer(2, showDay2, day2LayerRef); }, [showDay2, loadLayer]);
    useEffect(() => { loadLayer(3, showDay3, day3LayerRef); }, [showDay3, loadLayer]);
}
