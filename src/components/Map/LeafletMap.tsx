'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { Map as MapIcon, Wifi, List, Settings } from 'lucide-react';
import { Cell, NWSAlertFeature } from '@/types';
import { formatTimeLabel, findClosestTimestamp } from '@/utils/timestamp';
import SlidebarControl from '../UI/SlidebarControl';
import { MapToolbar } from '../UI/MapToolbar';
import { DistanceTool } from '../UI/DistanceTool';
import { CircleTool } from '../UI/CircleTool';
import { LocationTool } from '../UI/LocationTool';
import { TopBar } from './TopBar';
import ConnectionModal from '../UI/ConnectionModal';
import MapSettingsPanel from '../UI/MapSettingsPanel';
import ConnectionSettingsPanel from '../UI/ConnectionSettingsPanel';
import CellListPanel from '../UI/CellListPanel';
import ColormapLegend from '../UI/ColormapLegend';
import { useMapConnection } from './hooks';
import { useSPCLayer } from './hooks/useSPCLayer';
import { useMETARLayer } from './hooks/useMETARLayer';
import { useNWSLayer } from './hooks/useNWSLayer';
import { useWPCLayer } from './hooks/useWPCLayer';
import { useWPCEroLayer } from './hooks/useWPCEroLayer';
import { useWSSILayer } from './hooks/useWSSILayer';
import {
    DEFAULT_BOUNDS,
    DEFAULT_MAP_CONFIG,
    PRODUCT_TO_COLORMAP_TYPE,
    CELL_POLYGON_STYLE,
    FORECAST_CONE_STYLE,
    UNCERTAINTY_CONE_STYLE,
    TRACK_LINE_STYLE,
} from './constants';
import { generateConePolygon } from '@/utils/geo';

export default function LeafletMap() {
    // Use custom hook for connection state and handlers
    const {
        apiUrl,
        ewmrsUrl,
        isConnected,
        loading,
        error,
        apiRef,
        ewmrsRef,
        timestamps,
        setTimestamps,
        products,
        activeLayers,
        setActiveLayers,
        productTimestamps,
        setProductTimestamps,
        colormaps,
        currentIndex,
        setCurrentIndex,
        isFlashing,
        setIsFlashing,
        handleConnect,
    } = useMapConnection();

    // Map refs
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
    const currentLayerRef = useRef<L.FeatureGroup | null>(null);
    const overlayLayersRef = useRef<Map<string, L.ImageOverlay>>(new Map());
    const contourLayerRef = useRef<L.Rectangle | null>(null);
    const boundsLayerRef = useRef<L.Rectangle | null>(null);
    const [currentZoom, setCurrentZoom] = useState(4);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Local UI state
    const [isPlaying, setIsPlaying] = useState(false);
    const [showSpcOutlook, setShowSpcOutlook] = useState(false);
    const [showSpcTornado, setShowSpcTornado] = useState(false);
    const [showSpcHail, setShowSpcHail] = useState(false);
    const [showSpcWind, setShowSpcWind] = useState(false);
    const [showMetar, setShowMetar] = useState(false);
    const [showNWSAlerts, setShowNWSAlerts] = useState(false);
    const [showWpc, setShowWpc] = useState(false);
    const [currentCells, setCurrentCells] = useState<Cell[]>([]);
    const [activePanel, setActivePanel] = useState<'map' | 'connection' | 'list' | 'settings' | null>(null);
    const [selectedCellInfo, setSelectedCellInfo] = useState<string | null>(null);

    // WPC ERO State
    const [showWpcEroDay1, setShowWpcEroDay1] = useState(false);
    const [showWpcEroDay2, setShowWpcEroDay2] = useState(false);
    const [showWpcEroDay3, setShowWpcEroDay3] = useState(false);

    // WPC WSSI State
    const [showWssiDay1, setShowWssiDay1] = useState(false);
    const [showWssiDay2, setShowWssiDay2] = useState(false);
    const [showWssiDay3, setShowWssiDay3] = useState(false);

    // Mutual Exclusion Handlers for WPC ERO
    const handleToggleWpcEroDay1 = () => {
        if (!showWpcEroDay1) {
            setShowWpcEroDay1(true);
            setShowWpcEroDay2(false);
            setShowWpcEroDay3(false);
        } else {
            setShowWpcEroDay1(false);
        }
    };

    const handleToggleWpcEroDay2 = () => {
        if (!showWpcEroDay2) {
            setShowWpcEroDay2(true);
            setShowWpcEroDay1(false);
            setShowWpcEroDay3(false);
        } else {
            setShowWpcEroDay2(false);
        }
    };

    const handleToggleWpcEroDay3 = () => {
        if (!showWpcEroDay3) {
            setShowWpcEroDay3(true);
            setShowWpcEroDay1(false);
            setShowWpcEroDay2(false);
        } else {
            setShowWpcEroDay3(false);
        }
    };

    // Mutual Exclusion Handlers for WSSI
    const handleToggleWssiDay1 = () => {
        if (!showWssiDay1) {
            setShowWssiDay1(true);
            setShowWssiDay2(false);
            setShowWssiDay3(false);
        } else {
            setShowWssiDay1(false);
        }
    };

    const handleToggleWssiDay2 = () => {
        if (!showWssiDay2) {
            setShowWssiDay2(true);
            setShowWssiDay1(false);
            setShowWssiDay3(false);
        } else {
            setShowWssiDay2(false);
        }
    };

    const handleToggleWssiDay3 = () => {
        if (!showWssiDay3) {
            setShowWssiDay3(true);
            setShowWssiDay1(false);
            setShowWssiDay2(false);
        } else {
            setShowWssiDay3(false);
        }
    };

    // --- Hooks ---
    useSPCLayer({
        map: mapInstance,
        showOutlook: showSpcOutlook,
        showTornado: showSpcTornado,
        showHail: showSpcHail,
        showWind: showSpcWind
    });

    useMETARLayer({
        map: mapInstance,
        apiRef,
        showMetar,
        currentTimestamp: timestamps[currentIndex] || null,
        currentZoom,
        refreshTrigger
    });

    useNWSLayer({
        map: mapInstance,
        apiRef,
        showNWSAlerts,
        currentTimestamp: timestamps[currentIndex] || null
    });

    useWPCLayer({
        map: mapInstance,
        ewmrsApi: ewmrsRef.current,
        showWpc
    });

    useWPCEroLayer({
        map: mapInstance,
        showDay1: showWpcEroDay1,
        showDay2: showWpcEroDay2,
        showDay3: showWpcEroDay3
    });

    useWSSILayer({
        map: mapInstance,
        showDay1: showWssiDay1,
        showDay2: showWssiDay2,
        showDay3: showWssiDay3
    });

    // Toggles (hardcoded)
    const showBounds = false;
    const showContour = false;
    const crisp = true;

    // Initialization
    useEffect(() => {
        // Prevent double init
        if (mapInstanceRef.current) return;

        // Delay init slightly to ensure container is ready and layout has settled
        const timer = setTimeout(() => {
            if (!mapContainerRef.current) return;
            if (mapInstanceRef.current) return;

            // Init Map with EPSG:4326
            const map = L.map(mapContainerRef.current, {
                crs: L.CRS.EPSG4326,
                center: [37.8, -96],
                zoom: 4,
                minZoom: 3,
                zoomControl: false, // Move zoom control if needed, or keep default
                dragging: true // Explicitly enable dragging
            });

            // Ensure dragging is enabled
            map.dragging.enable();

            // OSM WMS via Terrestris
            L.tileLayer.wms('https://ows.terrestris.de/osm/service', {
                layers: 'OSM-WMS',
                format: 'image/png',
                transparent: false,
                version: '1.3.0',
                attribution: '&copy; terrestris &copy; OpenStreetMap',
            }).addTo(map);

            map.on('zoomend', () => {
                setCurrentZoom(map.getZoom());
            });
            map.on('moveend', () => {
                setRefreshTrigger(prev => prev + 1);
            });

            mapInstanceRef.current = map;
            setMapInstance(map);

            // Resize Observer to handle container size changes
            const resizeObserver = new ResizeObserver(() => {
                map.invalidateSize();
            });
            resizeObserver.observe(mapContainerRef.current);

            // Setup Reference Bounds Layer
            const referenceBounds: L.LatLngBoundsExpression = [[20, -130], [55, -60]];
            boundsLayerRef.current = L.rectangle(referenceBounds, {
                color: "#3b82f6", // blue
                weight: 1,
                fill: false,
                dashArray: '4, 4'
            });
        }, 100);

        // Cleanup
        return () => {
            clearTimeout(timer);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                setMapInstance(null);
            }
        };
    }, []);

    // Toggle Bounds Layer
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !boundsLayerRef.current) return;

        if (showBounds) {
            boundsLayerRef.current.addTo(map);
        } else {
            boundsLayerRef.current.remove();
        }
    }, [showBounds]);

    // Handle SPC Outlook Layer

    // Effect for METAR

    // Effect for NWS Alerts Rendering

    // Load Data Logic
    const loadData = useCallback(async (index: number) => {
        if (!timestamps[index] || !apiRef.current) return;
        const ts = timestamps[index];
        const map = mapInstanceRef.current;
        if (!map) return;


        // 1. Load Storm Cells (same as before)
        try {
            // Removing old layer
            if (currentLayerRef.current) {
                map.removeLayer(currentLayerRef.current);
                currentLayerRef.current = null;
            }

            const data = await apiRef.current.downloadStormcellList(ts);
            const layerGroup = L.featureGroup();

            let features: Cell[] = [];
            if ('content' in data && data.content && data.content.features) features = data.content.features;
            else if ('features' in data && data.features) features = data.features;
            else if (Array.isArray(data)) features = data;

            // Only include cells that have valid geometry (bbox) to match what is drawn on map
            const visibleFeatures = features.filter((cell: Cell) =>
                cell.bbox && Array.isArray(cell.bbox) && cell.bbox.length > 0
            );
            setCurrentCells(visibleFeatures);

            const polyStyle = {
                color: "#f87171", // red-400
                weight: 2,
                opacity: 1,
                fillOpacity: 0.3
            };

            features.forEach((cell: Cell) => {
                if (cell.bbox && Array.isArray(cell.bbox) && cell.bbox.length > 0) {
                    const coords: L.LatLngExpression[] = cell.bbox.map((p: number[]) => {
                        const val1 = p[0];
                        const val2 = p[1];
                        let lat, lon;
                        if (Math.abs(val1) > 90) {
                            lon = val1; lat = val2;
                        } else {
                            lat = val1; lon = val2;
                        }
                        if (lon > 180) lon -= 360;
                        return [lat, lon] as [number, number];
                    });

                    const polygon = L.polygon(coords, polyStyle);

                    // Helper to get modules from either root or properties
                    // Use bracket notation for Record types or explicit cast if needed.
                    // Since properties is Record<string, unknown>, we cast appropriately or use bracket notation.
                    const modules = cell.modules || (cell.properties?.['modules'] as Record<string, unknown> | undefined);

                    // Debugging StormCast Data
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (modules && ((modules as any)["StormCast"] || (modules as any)["stormcast"])) {
                        // console.log(`Cell ${cell.id} has StormCast module`, modules["StormCast"] || modules["stormcast"]);
                    }

                    if (cell.properties) {
                        polygon.on('click', () => {
                            const props = { ...cell.properties, id: cell.id, modules };
                            setSelectedCellInfo(JSON.stringify(props, null, 2));
                        });

                        // Render StormCast Forecast Cones with Uncertainty
                        if (modules) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const stormCastData = ((modules as any)["StormCast"] || (modules as any)["stormcast"]) as any;
                            if (stormCastData && stormCastData.forecast_cones && Array.isArray(stormCastData.forecast_cones)) {
                                    // Preparing data for polygon generation
                                    const forecastPoints: { lat: number, lon: number, radius: number }[] = [];
                                    const uncertaintyPoints: { lat: number, lon: number, radius: number }[] = [];

                                    stormCastData.forecast_cones.forEach((cone: any) => {
                                        const validCenter = cone.center && Array.isArray(cone.center) && cone.center.length === 2 
                                            && Number.isFinite(cone.center[0]) && Number.isFinite(cone.center[1]);
                                        const validRadius = typeof cone.radius === 'number' && Number.isFinite(cone.radius);

                                        if (validCenter && validRadius) {
                                            const cLat = cone.center[0];
                                            let cLon = cone.center[1];
                                            if (cLon > 180) cLon -= 360;

                                            forecastPoints.push({ lat: cLat, lon: cLon, radius: cone.radius });

                                            const uncertainty = cone.uncertainty_radius || cone.uncertainty || cone.radius_max;
                                            if (typeof uncertainty === 'number' && Number.isFinite(uncertainty) && uncertainty > cone.radius) {
                                                uncertaintyPoints.push({ lat: cLat, lon: cLon, radius: uncertainty });
                                            } else {
                                                // Fallback if no specific uncertainty, use radius
                                                uncertaintyPoints.push({ lat: cLat, lon: cLon, radius: cone.radius });
                                            }
                                        }
                                    });

                                    // Generate and render polygons
                                    if (uncertaintyPoints.length > 1) {
                                        try {
                                            const polyPoints = generateConePolygon(uncertaintyPoints);
                                            // Validate points - ensure no NaN
                                            const validPolyPoints = polyPoints.filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1]));
                                            
                                            if (validPolyPoints.length > 2) {
                                                const uncertaintyLayer = L.polygon(validPolyPoints, {
                                                    ...UNCERTAINTY_CONE_STYLE,
                                                    lineJoin: 'round'
                                                });
                                                uncertaintyLayer.addTo(layerGroup);
                                            }
                                        } catch (err) {
                                            console.warn("Failed to generate uncertainty cone polygon", err);
                                        }
                                    }

                                    if (forecastPoints.length > 1) {
                                        try {
                                            const polyPoints = generateConePolygon(forecastPoints);
                                            const validPolyPoints = polyPoints.filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1]));

                                            if (validPolyPoints.length > 2) {
                                                const forecastLayer = L.polygon(validPolyPoints, {
                                                    ...FORECAST_CONE_STYLE,
                                                    lineJoin: 'round'
                                                });
                                                forecastLayer.addTo(layerGroup);
                                            }
                                        } catch (err) {
                                            console.warn("Failed to generate forecast cone polygon", err);
                                        }
                                    }

                                // Draw Track Line (connecting centers)
                                // Start with current storm center
                                const trackPoints: L.LatLngExpression[] = [];

                                try {
                                    const cellBounds = L.latLngBounds(coords);
                                    const cellCenter = cellBounds.getCenter();
                                    trackPoints.push([cellCenter.lat, cellCenter.lng]);
                                } catch (e) {
                                    // Fallback if bounds calculation fails
                                }

                                // Add forecast centers
                                stormCastData.forecast_cones.forEach((cone: any) => {
                                    if (cone.center && Array.isArray(cone.center) && cone.center.length === 2) {
                                        const cLat = cone.center[0];
                                        let cLon = cone.center[1];
                                        if (cLon > 180) cLon -= 360;
                                        trackPoints.push([cLat, cLon]);
                                    }
                                });

                                if (trackPoints.length > 1) {
                                    const trackLine = L.polyline(trackPoints, TRACK_LINE_STYLE);
                                    trackLine.addTo(layerGroup);
                                    trackLine.bringToFront(); // Ensure track is on top of cones
                                }
                            }
                        }
                    }
                    polygon.addTo(layerGroup);
                }
            });

            layerGroup.addTo(map);
            currentLayerRef.current = layerGroup;

        } catch (err) {
            console.warn(`Error loading cell data for ${ts}:`, err);
        }

        // 2. Render Overlays (Multiple)

        // Identify which layers are needed
        const neededProducts = Object.keys(activeLayers).filter(k => activeLayers[k].visible);
        const mapOverlays = overlayLayersRef.current;

        // Cleanup: Remove layers that are no longer needed
        for (const [prod, overlay] of mapOverlays.entries()) {
            if (!neededProducts.includes(prod)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((overlay as any)._blobUrl) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    URL.revokeObjectURL((overlay as any)._blobUrl);
                }
                map.removeLayer(overlay);
                mapOverlays.delete(prod);
            }
        }

        // Render needed layers
        if (ewmrsRef.current) {
            const baseSouth = 20;
            const baseNorth = 55;
            const baseWest = -130;
            const baseEast = -60;
            const bounds: L.LatLngBoundsExpression = [[baseSouth, baseWest], [baseNorth, baseEast]];

            for (const prod of neededProducts) {
                const prodTsList = productTimestamps[prod] || [];
                const bestTimestamp = findClosestTimestamp(ts, prodTsList);
                if (!bestTimestamp) continue;

                const directUrl = ewmrsRef.current.getRenderUrl(prod, bestTimestamp);

                // If we already have this layer, update opacity/url?
                // Leaflet ImageOverlay is tricky to update URL dynamically seamlessly,
                // but we can check if it's the same URL.
                // For simplicity/cleanness, if timestamp changed, re-create.
                // Optim: check if current overlay has same 'timestamp' metadata?

                // Let's just fetch and replace for now to ensure sync.
                try {
                    const res = await fetch(directUrl);
                    if (res.ok) {
                        const blob = await res.blob();
                        const objectUrl = URL.createObjectURL(blob);

                        // Check if existing
                        if (mapOverlays.has(prod)) {
                            const old = mapOverlays.get(prod)!;
                            map.removeLayer(old);
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            if ((old as any)._blobUrl) URL.revokeObjectURL((old as any)._blobUrl);
                        }

                        const opacity = activeLayers[prod].opacity;
                        const overlay = L.imageOverlay(objectUrl, bounds, { opacity }).addTo(map);
                        overlay.bringToBack();
                        mapOverlays.set(prod, overlay);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (overlay as any)._blobUrl = objectUrl;

                        if (crisp) {
                            const el = overlay.getElement();
                            if (el) el.classList.add('pixelated-overlay');
                        }
                    }
                } catch (err) {
                    console.warn(`Failed to load overlay for ${prod}`, err);
                }
            }
        }

        if (showContour) {
            // ... contour logic ...
            if (contourLayerRef.current) {
                map.removeLayer(contourLayerRef.current);
                contourLayerRef.current = null;
            }
            const baseSouth = 20; // Re-declare or move out
            const baseNorth = 55;
            const baseWest = -130;
            const baseEast = -60;
            const bounds: L.LatLngBoundsExpression = [[baseSouth, baseWest], [baseNorth, baseEast]];

            contourLayerRef.current = L.rectangle(bounds, {
                color: "#f59e0b",
                weight: 2,
                fill: false
            }).addTo(map);
        }

    }, [timestamps, activeLayers, productTimestamps, crisp, showContour, apiRef, ewmrsRef]); // Update deps

    // Auto-refresh logic (every 30 seconds)
    // Use refs to avoid stale closure issues in the interval
    const timestampsRef = useRef(timestamps);
    const productTimestampsRef = useRef(productTimestamps);
    const activeLayersRef = useRef(activeLayers);

    useEffect(() => { timestampsRef.current = timestamps; }, [timestamps]);
    useEffect(() => { productTimestampsRef.current = productTimestamps; }, [productTimestamps]);
    useEffect(() => { activeLayersRef.current = activeLayers; }, [activeLayers]);

    useEffect(() => {
        if (!isConnected || !apiRef.current) return;

        const interval = setInterval(async () => {
            let hasGlobalUpdate = false;
            let currentMainTimestamps = timestampsRef.current;

            // 1. Check EdgeWARN timestamps
            try {
                const latestTimestamps = await apiRef.current?.fetchTimestamps();
                if (latestTimestamps && latestTimestamps.length > 0) {
                    const sortedLatest = [...latestTimestamps].sort();
                    const sortedPrev = [...timestampsRef.current].sort();

                    const isNew = sortedLatest.length !== sortedPrev.length ||
                        sortedLatest[sortedLatest.length - 1] !== sortedPrev[sortedPrev.length - 1];

                    if (isNew) {
                        console.log('New EdgeWARN timestamps detected:', sortedLatest[sortedLatest.length - 1]);
                        setTimestamps(sortedLatest);
                        currentMainTimestamps = sortedLatest;
                        hasGlobalUpdate = true;
                    }
                }
            } catch (err) {
                console.warn("Auto-refresh EdgeWARN failed", err);
            }

            // 2. Check EWMRS timestamps (for all visible products)
            // We iterate over all products that are visible or have been visible to keep cache fresh?
            // For now, let's just refresh visible ones
            const visibleProds = Object.keys(activeLayersRef.current).filter(k => activeLayersRef.current[k].visible);

            for (const prod of visibleProds) {
                if (ewmrsRef.current) {
                    try {
                        const latestProdTs = await ewmrsRef.current.getProductTimestamps(prod);
                        if (latestProdTs && latestProdTs.length > 0) {
                            const sortedLatest = [...latestProdTs].sort();
                            const currentCache = productTimestampsRef.current[prod] || [];
                            const sortedPrev = [...currentCache].sort();

                            const isNew = sortedLatest.length !== sortedPrev.length ||
                                sortedLatest[sortedLatest.length - 1] !== sortedPrev[sortedPrev.length - 1];

                            if (isNew) {
                                console.log(`New EWMRS timestamps detected for ${prod}:`, sortedLatest[sortedLatest.length - 1]);
                                setProductTimestamps(prev => ({
                                    ...prev,
                                    [prod]: sortedLatest
                                }));
                                hasGlobalUpdate = true;
                            }
                        }
                    } catch (err) {
                        console.warn(`Auto-refresh EWMRS failed for ${prod}`, err);
                    }
                }
            }

            if (hasGlobalUpdate) {
                console.log('Global update detected, flashing and scrolling to latest');
                // Flash for 1 second
                setIsFlashing(true);
                setTimeout(() => setIsFlashing(false), 1000);
                // Auto-scroll to latest
                if (currentMainTimestamps.length > 0) {
                    setCurrentIndex(currentMainTimestamps.length - 1);
                }
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [isConnected]); // Only depend on isConnected - refs handle the rest

    // Debounce/Listen to slide change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isConnected && timestamps.length > 0) {
                loadData(currentIndex);
            }
        }, 200);
        return () => clearTimeout(timer);
    }, [currentIndex, isConnected, loadData, timestamps.length]);


    // Watch for newly visible layers and fetch their timestamps if missing
    useEffect(() => {
        const fetchMissingTs = async () => {
            if (!ewmrsRef.current) return;

            const visibleProds = Object.keys(activeLayers).filter(k => activeLayers[k].visible);
            for (const prod of visibleProds) {
                if (!productTimestamps[prod]) {
                    try {
                        const prodTs = await ewmrsRef.current.getProductTimestamps(prod);
                        setProductTimestamps(prev => ({ ...prev, [prod]: prodTs.sort() }));
                    } catch { console.warn("Failed fetch prod ts for", prod); }
                }
            }
        };
        fetchMissingTs();
    }, [activeLayers, productTimestamps]);

    // Playback Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && timestamps.length > 0 && isConnected) {
            interval = setInterval(() => {
                setCurrentIndex(prev => {
                    if (prev >= timestamps.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, timestamps.length, isConnected]);

    // Handlers for MapSettingsPanel
    const toggleLayer = (product: string) => {
        setActiveLayers(prev => ({
            ...prev,
            [product]: {
                ...prev[product],
                visible: !prev[product].visible
            }
        }));
    };

    const changeOpacity = (product: string, opacity: number) => {
        setActiveLayers(prev => ({
            ...prev,
            [product]: {
                ...prev[product],
                opacity
            }
        }));
    };

    const handleCellClick = useCallback((cell: Cell) => {
        if (!mapInstanceRef.current || !cell.bbox) return;

        // Convert bbox to latlng compatible bounds
        // bbox is usually [minX, minY, maxX, maxY] but here it seems to be array of points?
        // Wait, in loadData: "coords: L.LatLngExpression[] = cell.bbox.map..."
        // So cell.bbox is an array of [val1, val2] points.

        try {
            const coords: L.LatLngExpression[] = cell.bbox.map((p: number[]) => {
                const val1 = p[0];
                const val2 = p[1];
                let lat, lon;
                if (Math.abs(val1) > 90) {
                    lon = val1; lat = val2;
                } else {
                    lat = val1; lon = val2;
                }
                if (lon > 180) lon -= 360;
                return [lat, lon] as [number, number];
            });

            const bounds = L.latLngBounds(coords);
            mapInstanceRef.current.flyToBounds(bounds, {
                padding: [50, 50],
                maxZoom: 12,
                duration: 1.5
            });
        } catch (e) {
            console.warn("Failed to zoom to cell", e);
        }
    }, []);

    const currentTs = timestamps[currentIndex] || '';
    const { date, time } = formatTimeLabel(currentTs);

    // Determine the active colormap based on the primary visible layer
    // Maps product names to colormap types
    const productToColormapType: Record<string, string> = {
        'CompRefQC': 'reflectivity',
        'CompRef': 'reflectivity',
        'Reflectivity': 'reflectivity',
        'EchoTops': 'EchoTops',
        'EnhancedEchoTop': 'EchoTops',
        'EchoTop18': 'EchoTops',
        'EchoTop30': 'EchoTops',
        'PrecipRate': 'PrecipitationRate',
        'QPE_01H': 'QPE',
        'QPE_03H': 'QPE',
        'VIL': 'VILDensity',
        'VILDensity': 'VILDensity',
        'VII': 'VILDensity',
    };

    const activeColormap = useMemo(() => {
        // Find the first visible layer
        const visibleProducts = Object.keys(activeLayers).filter(k => activeLayers[k].visible);
        if (visibleProducts.length === 0 || colormaps.length === 0) return null;

        const primaryProduct = visibleProducts[0];
        const colormapType = productToColormapType[primaryProduct];

        // Try to find by type first
        if (colormapType) {
            const byType = colormaps.find(c => c.type === colormapType);
            if (byType) return byType;
        }

        // Fallback: try to match by name containing the product name
        const byName = colormaps.find(c =>
            c.name.toLowerCase().includes(primaryProduct.toLowerCase()) ||
            primaryProduct.toLowerCase().includes(c.name.toLowerCase())
        );
        if (byName) return byName;

        // Default to first colormap if no match
        return colormaps[0] || null;
    }, [activeLayers, colormaps]);

    console.log('LeafletMap render: isConnected=', isConnected, 'loading=', loading);

    return (
        <div className="flex bg-gray-900 text-gray-100 h-screen font-sans overflow-hidden">
            {/* Connection Modal - must be at root level */}
            <ConnectionModal
                key={`modal-${apiUrl}-${ewmrsUrl}`}
                isOpen={!isConnected}
                loading={loading}
                error={error}
                initialApiUrl={apiUrl}
                initialEwmrsUrl={ewmrsUrl}
                onConnect={handleConnect}
            />

            {/* Styles for pixelated */}
            <style jsx global>{`
                .pixelated-overlay {
                    image-rendering: pixelated;
                    image-rendering: -moz-crisp-edges;
                    image-rendering: crisp-edges;
                }
             `}</style>

            {/* Combined Left Panel Group - Fixed width to align Rail (3.5rem) + Sidebar (20rem) with Footer */}
            <div className="flex flex-col flex-shrink-0 z-30 shadow-xl h-full w-[23.5rem] bg-gray-800">

                {/* Upper Section: Rail + Sidebar Content */}
                <div className="flex flex-1 min-h-0 overflow-hidden">

                    {/* Settings Rail */}
                    <div className="w-14 flex-shrink-0 flex flex-col bg-gray-950 border-r border-gray-800 z-20">
                        {/* Logo Container - Aligned Height with Sidebar Header */}
                        <div className="flex-shrink-0 h-14 flex items-center justify-center border-b border-gray-800">
                            <Link href="/" className="w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
                                <img src="/assets/EdgeWARN.png" alt="EdgeWARN" className="w-full h-full object-contain drop-shadow-md rounded-xl" />
                            </Link>
                        </div>

                        {/* Rail Content */}
                        <div className="flex-1 flex flex-col items-center py-4 gap-4">
                            <button
                                onClick={() => setActivePanel(activePanel === 'map' ? null : 'map')}
                                className={`p-3 rounded-xl transition-all ${activePanel === 'map' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-blue-400 hover:bg-gray-800'}`}
                                title="Map Settings"
                            >
                                <MapIcon size={22} />
                            </button>
                            <button
                                onClick={() => setActivePanel(activePanel === 'connection' ? null : 'connection')}
                                className={`p-3 rounded-xl transition-all ${activePanel === 'connection' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-blue-400 hover:bg-gray-800'}`}
                                title="Connection Settings"
                            >
                                <Wifi size={22} />
                            </button>
                            <button
                                onClick={() => setActivePanel(activePanel === 'list' ? null : 'list')}
                                className={`p-3 rounded-xl transition-all ${activePanel === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-blue-400 hover:bg-gray-800'}`}
                                title="Cell List"
                            >
                                <List size={22} />
                            </button>

                            <div className="flex-1" />

                            <button
                                onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')}
                                className={`p-3 rounded-xl transition-all ${activePanel === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-blue-400 hover:bg-gray-800'}`}
                                title="Settings"
                            >
                                <Settings size={22} />
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Content Area */}
                    <div className="w-80 flex-shrink-0 flex flex-col border-r border-gray-700 bg-gray-800 overflow-y-auto">

                        {/* 1. MAP SETTINGS PANEL */}
                        {activePanel === 'map' && (
                            <MapSettingsPanel
                                products={products}
                                activeLayers={activeLayers}
                                onLayerToggle={toggleLayer}
                                onOpacityChange={changeOpacity}
                                showSpcOutlook={showSpcOutlook}
                                onToggleSpcOutlook={() => setShowSpcOutlook(!showSpcOutlook)}
                                showSpcTornado={showSpcTornado}
                                onToggleSpcTornado={() => setShowSpcTornado(!showSpcTornado)}
                                showSpcHail={showSpcHail}
                                onToggleSpcHail={() => setShowSpcHail(!showSpcHail)}
                                showSpcWind={showSpcWind}
                                onToggleSpcWind={() => setShowSpcWind(!showSpcWind)}
                                showMetar={showMetar}
                                onToggleMetar={() => setShowMetar(!showMetar)}
                                showNWSAlerts={showNWSAlerts}
                                onToggleNWSAlerts={() => setShowNWSAlerts(!showNWSAlerts)}
                                showWpc={showWpc}
                                onToggleWpc={() => setShowWpc(!showWpc)}
                                showWpcEroDay1={showWpcEroDay1}
                                onToggleWpcEroDay1={handleToggleWpcEroDay1}
                                showWpcEroDay2={showWpcEroDay2}
                                onToggleWpcEroDay2={handleToggleWpcEroDay2}
                                showWpcEroDay3={showWpcEroDay3}
                                onToggleWpcEroDay3={handleToggleWpcEroDay3}
                                showWssiDay1={showWssiDay1}
                                onToggleWssiDay1={handleToggleWssiDay1}
                                showWssiDay2={showWssiDay2}
                                onToggleWssiDay2={handleToggleWssiDay2}
                                showWssiDay3={showWssiDay3}
                                onToggleWssiDay3={handleToggleWssiDay3}
                            />
                        )}

                        {/* 2. CONNECTION PANEL */}
                        {(activePanel === 'connection') && (
                            <ConnectionSettingsPanel
                                key={`panel-${apiUrl}-${ewmrsUrl}`}
                                currentApiUrl={apiUrl}
                                currentEwmrsUrl={ewmrsUrl}
                                isConnected={isConnected}
                                onConnect={handleConnect}
                                loading={loading}
                                error={error}
                            />
                        )}

                        {/* 3. CELL LIST PANEL */}
                        {(activePanel === 'list') && (
                            <CellListPanel
                                cells={currentCells}
                                onCellClick={handleCellClick}
                            />
                        )}

                        {/* 4. SETTINGS Placeholder */}
                        {(activePanel === 'settings') && (
                            <div className="p-4 text-gray-400 italic text-center text-sm">
                                Not implemented yet
                            </div>
                        )}

                        {/* Default/Empty State if nothing selected? Or maybe 'connection' should be default?
                              If activePanel is null, sidebar is empty?
                              Let's leave it empty if null for cleaner look, or maybe show Logo?
                              Actually, let's make 'connection' or 'map' default?
                              User said "appears when you click it". So default is likely closed/empty?
                              But we have a fixed width sidebar space. If it's empty it looks weird.
                              Let's show "Select a tool from the rail" message if null.
                           */}
                        {activePanel === null && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm italic p-6 text-center">
                                <div className="text-gray-600 mb-2">EdgeWARN</div>
                                Select a tool from the left rail
                            </div>
                        )}
                    </div>
                </div>

                {/* Playback Control Footer - Spans Full Width (Rail + Sidebar) */}
                {isConnected && (
                    <div className="flex-shrink-0 bg-gray-900 border-t border-gray-700 border-r p-4 z-40">
                        <SlidebarControl
                            currentIndex={currentIndex}
                            totalFrames={timestamps.length}
                            onIndexChange={setCurrentIndex}
                            isPlaying={isPlaying}
                            onTogglePlay={() => setIsPlaying(!isPlaying)}
                        />

                        {error && <div className="text-xs text-red-500 italic text-center mt-2">{error}</div>}
                    </div>
                )}
            </div>

            {/* Map Area */}
            <div className="flex-1 relative">
                <div ref={mapContainerRef} className="h-full w-full" />

                {/* Top Bar for Time */}
                {/* Top Bar for Time & Lat/Lon */}
                {/* Top Bar for Time & Lat/Lon */}
                <TopBar
                    isConnected={isConnected}
                    time={time}
                    date={date}
                    isFlashing={isFlashing}
                    map={mapInstance}
                />

                {selectedCellInfo && (
                    <div className="absolute top-4 right-4 z-[1000] bg-gray-800/90 backdrop-blur border border-gray-600 rounded p-4 max-w-xs shadow-lg text-white">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-lg text-blue-300">Selected Cell</h3>
                            <button onClick={() => setSelectedCellInfo(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <pre className="text-xs overflow-auto max-h-60 text-gray-300 whitespace-pre-wrap">{selectedCellInfo}</pre>
                    </div>
                )}

                {/* Modular Toolbar */}
                <MapToolbar>
                    <LocationTool map={mapInstance} />
                    <DistanceTool map={mapInstance} />
                    <CircleTool map={mapInstance} />
                </MapToolbar>

                {/* Colormap Legend */}
                {isConnected && <ColormapLegend colormap={activeColormap} />}
            </div>
        </div>
    );
}
