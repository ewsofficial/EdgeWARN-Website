
import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { fetchSPCDay1Outlook } from '@/utils/spc-api';
import {
    SPC_OUTLOOK_COLORS,
    SPC_PROB_COLORS,
    SPC_LAYER_STYLE,
} from '../constants';

interface UseSPCLayerProps {
    map: L.Map | null;
    showOutlook: boolean;
    showTornado: boolean;
    showHail: boolean;
    showWind: boolean;
}

export function useSPCLayer({
    map,
    showOutlook,
    showTornado,
    showHail,
    showWind,
}: UseSPCLayerProps) {
    const spcLayerRef = useRef<L.GeoJSON | null>(null);
    const spcTornadoLayerRef = useRef<L.GeoJSON | null>(null);
    const spcHailLayerRef = useRef<L.GeoJSON | null>(null);
    const spcWindLayerRef = useRef<L.GeoJSON | null>(null);

    // Handle SPC Outlook Layer (Categorical)
    useEffect(() => {
        if (!map) return;

        const loadSpcLayer = async () => {
            if (showOutlook) {
                if (spcLayerRef.current) return; // Already loaded

                try {
                    const data = await fetchSPCDay1Outlook('categorical');

                    spcLayerRef.current = L.geoJSON(data as any, {
                        style: (feature) => {
                            const label = feature?.properties?.LABEL;
                            const color = SPC_OUTLOOK_COLORS[label] || '#808080';
                            return {
                                ...SPC_LAYER_STYLE,
                                color: color,
                                fillColor: color
                            };
                        },
                        onEachFeature: (feature, layer) => {
                            if (feature.properties) {
                                const label = feature.properties.LABEL2 || feature.properties.LABEL;
                                const issue = feature.properties.ISSUE;
                                const expire = feature.properties.EXPIRE;

                                const threatColor = SPC_OUTLOOK_COLORS[feature.properties.LABEL] || '#808080';

                                const popupContent = `
                                    <div class="spc-popup-content">
                                        <div class="spc-popup-header">
                                            <span class="spc-title">SPC Day 1 Outlook</span>
                                            <span class="spc-threat-badge" style="background:${threatColor}">${label}</span>
                                        </div>
                                        <div class="spc-popup-body">
                                            <div class="spc-times">
                                                <div><strong>Issued:</strong> ${issue}</div>
                                                <div><strong>Expires:</strong> ${expire}</div>
                                            </div>
                                        </div>
                                    </div>`;

                                layer.bindPopup(popupContent, {
                                    className: 'spc-popup',
                                    closeButton: false,
                                    maxWidth: 300
                                });
                            }
                        }
                    }).addTo(map);
                    spcLayerRef.current.bringToBack();
                } catch (err) {
                    console.error("Failed to load SPC layer", err);
                }
            } else {
                if (spcLayerRef.current) {
                    map.removeLayer(spcLayerRef.current);
                    spcLayerRef.current = null;
                }
            }
        };

        loadSpcLayer();
    }, [map, showOutlook]);

    // Helper for probabilistic layers
    const loadProbLayer = useCallback(async (
        type: 'tornado' | 'hail' | 'wind',
        show: boolean,
        layerRef: React.MutableRefObject<L.GeoJSON | null>,
        labelPrefix: string
    ) => {
        if (!map) return;

        if (show) {
            if (layerRef.current) return;

            try {
                const data = await fetchSPCDay1Outlook(type);
                layerRef.current = L.geoJSON(data as any, {
                    style: (feature) => {
                        const label = feature?.properties?.LABEL;
                        const dn = feature?.properties?.DN;

                        let color = '#808080';
                        if (label && SPC_PROB_COLORS[label]) {
                            color = SPC_PROB_COLORS[label];
                        } else if (dn && SPC_PROB_COLORS[String(dn)]) {
                            color = SPC_PROB_COLORS[String(dn)];
                        }

                        return {
                            ...SPC_LAYER_STYLE,
                            color: color,
                            fillColor: color
                        };
                    },
                    onEachFeature: (feature, layer) => {
                        if (feature.properties) {
                            const threat = feature.properties.LABEL2 || feature.properties.LABEL;
                            const issue = feature.properties.ISSUE;
                            const expire = feature.properties.EXPIRE;

                            let badgeColor = '#808080';
                            const label = feature?.properties?.LABEL;
                            const dn = feature?.properties?.DN;
                            if (label && SPC_PROB_COLORS[label]) {
                                badgeColor = SPC_PROB_COLORS[label];
                            } else if (dn && SPC_PROB_COLORS[String(dn)]) {
                                badgeColor = SPC_PROB_COLORS[String(dn)];
                            }

                            const popupContent = `
                                <div class="spc-popup-content">
                                    <div class="spc-popup-header">
                                        <span class="spc-title">SPC Day 1 ${labelPrefix}</span>
                                        <span class="spc-threat-badge" style="background:${badgeColor}">${threat}%</span>
                                    </div>
                                    <div class="spc-popup-body">
                                        <div class="spc-times">
                                            <div><strong>Issued:</strong> ${issue}</div>
                                            <div><strong>Expires:</strong> ${expire}</div>
                                        </div>
                                    </div>
                                </div>`;

                            layer.bindPopup(popupContent, {
                                className: 'spc-popup',
                                closeButton: false,
                                maxWidth: 300
                            });
                        }
                    }
                }).addTo(map);
                layerRef.current.bringToBack();
            } catch (err) {
                console.error(`Failed to load SPC ${type} layer`, err);
            }
        } else {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
                layerRef.current = null;
            }
        }
    }, [map]);

    // Effects for Probabilistic Layers
    useEffect(() => { loadProbLayer('tornado', showTornado, spcTornadoLayerRef, 'Tornado'); }, [showTornado, loadProbLayer]);
    useEffect(() => { loadProbLayer('hail', showHail, spcHailLayerRef, 'Hail'); }, [showHail, loadProbLayer]);
    useEffect(() => { loadProbLayer('wind', showWind, spcWindLayerRef, 'Wind'); }, [showWind, loadProbLayer]);
}
