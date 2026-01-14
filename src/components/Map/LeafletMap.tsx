'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure CSS is imported
import Link from 'next/link';
import { EdgeWARNAPI } from '@/utils/edgewarn-api';
import { Map as MapIcon, Wifi, List, Settings } from 'lucide-react';
import { EWMRSAPI } from '@/utils/ewmrs-api';
import { Cell, Colormap } from '@/types';
import SlidebarControl from '../UI/SlidebarControl';
import { MapToolbar } from '../UI/MapToolbar';
import { DistanceTool } from '../UI/DistanceTool';
import { CircleTool } from '../UI/CircleTool';
import ConnectionModal from '../UI/ConnectionModal';
import MapSettingsPanel from '../UI/MapSettingsPanel';
import ConnectionSettingsPanel from '../UI/ConnectionSettingsPanel';
import CellListPanel from '../UI/CellListPanel';
import ColormapLegend from '../UI/ColormapLegend';

interface LayerState {
    visible: boolean;
    opacity: number;
}

interface TimestampStr {
    date: string;
    time: string;
}

export default function LeafletMap() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const apiRef = useRef<EdgeWARNAPI | null>(null);
    const ewmrsRef = useRef<EWMRSAPI | null>(null);
    const currentLayerRef = useRef<L.FeatureGroup | null>(null);
    // Changed to Map for multiple overlays
    const overlayLayersRef = useRef<Map<string, L.ImageOverlay>>(new Map()); 
    const contourLayerRef = useRef<L.Rectangle | null>(null);
    const boundsLayerRef = useRef<L.Rectangle | null>(null);

    // State
    const [apiUrl, setApiUrl] = useState('http://localhost:5000');
    const [ewmrsUrl, setEwmrsUrl] = useState('http://localhost:3003');
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [timestamps, setTimestamps] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // EWMRS State
    const [products, setProducts] = useState<string[]>([]);
    const [activeLayers, setActiveLayers] = useState<Record<string, LayerState>>({});
    const [productTimestamps, setProductTimestamps] = useState<Record<string, string[]>>({}); // Cache timestamps per product
    const [currentCells, setCurrentCells] = useState<Cell[]>([]);
    const [colormaps, setColormaps] = useState<Colormap[]>([]);

    const [activePanel, setActivePanel] = useState<'map' | 'connection' | 'list' | 'settings' | null>(null);

    
    // Toggles
    // const [showRadar, setShowRadar] = useState(true); // Removed in favor of activeLayers
    // Hardcoded defaults per request: Bounds=Off, Contour=Off, Crisp=On
    // Hardcoded defaults per request: Bounds=Off, Contour=Off, Crisp=On
    const showBounds = false;
    const showContour = false;
    const crisp = true;

    // Flashing state for new data
    const [isFlashing, setIsFlashing] = useState(false);

    const [selectedCellInfo, setSelectedCellInfo] = useState<string | null>(null);

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
                zoomControl: false // Move zoom control if needed, or keep default
            });

            // OSM WMS via Terrestris
            L.tileLayer.wms('https://ows.terrestris.de/osm/service', {
                layers: 'OSM-WMS',
                format: 'image/png',
                transparent: false,
                version: '1.3.0',
                attribution: '&copy; terrestris &copy; OpenStreetMap',
            }).addTo(map);

            mapInstanceRef.current = map;

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

    // Helper functions
    const parseTimestamp = (ts: string): Date | null => {
         const match = ts.match(/(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/);
         if (!match) return null;
         return new Date(
             parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]),
             parseInt(match[4]), parseInt(match[5]), parseInt(match[6])
         );
    };

    const formatTimeLabel = (ts: string): TimestampStr => {
        const match = ts.match(/(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/);
        if (!match) return { date: ts, time: '' };
        return {
            date: `${match[1]}-${match[2]}-${match[3]}`,
            time: `${match[4]}:${match[5]}`
        };
    };

    const findClosestTimestamp = useCallback((targetTs: string, candidates: string[]) => {
        if (!candidates || candidates.length === 0) return null;
        
        const targetDate = parseTimestamp(targetTs);
        if (!targetDate) return null;
        targetDate.setSeconds(0, 0);

        let closest = null;
        let minDiff = Infinity;
        
        for (const cand of candidates) {
            const candDate = parseTimestamp(cand);
            if (!candDate) continue;
            candDate.setSeconds(0, 0);

            const diff = Math.abs(candDate.getTime() - targetDate.getTime());
            if (diff < minDiff) {
                minDiff = diff;
                closest = cand;
            }
        }
        
        // 10 minutes tolerance
        if (minDiff > 600000) return null;
        return closest;
    }, []);

    // Load Data Logic
    const loadData = useCallback(async (index: number) => {
        if (!timestamps[index] || !apiRef.current) return;
        const ts = timestamps[index];
        const map = mapInstanceRef.current;
        if (!map) return;

        setLoading(true);
        setError(null);

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

                            // Render StormCast Forecast Cones
                            if (modules) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const stormCastData = ((modules as any)["StormCast"] || (modules as any)["stormcast"]) as any;
                                if (stormCastData && stormCastData.forecast_cones && Array.isArray(stormCastData.forecast_cones)) {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    stormCastData.forecast_cones.forEach((cone: any) => {
                                        // Check if valid
                                        const validCenter = cone.center && Array.isArray(cone.center) && cone.center.length === 2;
                                        const validRadius = typeof cone.radius === 'number';
                                        
                                        if (validCenter && validRadius) {
                                            // Normalize longitude if needed (0-360 -> -180-180)
                                            const cLat = cone.center[0];
                                            let cLon = cone.center[1];
                                            if (cLon > 180) cLon -= 360;
                                            
                                            const circle = L.circle([cLat, cLon], {
                                                color: "#f97316", // orange-500
                                                weight: 2,
                                                fillOpacity: 0.1,
                                                dashArray: '4, 4',
                                                interactive: false
                                            });
                                            circle.addTo(layerGroup);
                                        } else {
                                            // console.warn("Invalid cone data:", cone);
                                        }
                                    });
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
             if ((err as Error).message?.includes('404')) {
                 setError(`Data not available for ${ts}`);
             }
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
        
        setLoading(false);

    }, [timestamps, activeLayers, productTimestamps, crisp, showContour, findClosestTimestamp]); // Update deps

    // Auto-refresh logic (every 30 seconds)
    useEffect(() => {
        if (!isConnected || !apiRef.current) return;

        const interval = setInterval(async () => {
            let hasGlobalUpdate = false;
            let currentMainTimestamps = timestamps;

            // 1. Check EdgeWARN timestamps
            try {
                const latestTimestamps = await apiRef.current?.fetchTimestamps();
                if (latestTimestamps && latestTimestamps.length > 0) {
                    const sortedLatest = [...latestTimestamps].sort();
                    const sortedPrev = [...timestamps].sort();
                    
                    const isNew = sortedLatest.length !== sortedPrev.length || 
                                  sortedLatest[sortedLatest.length - 1] !== sortedPrev[sortedPrev.length - 1];
                    
                    if (isNew) {
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
            const visibleProds = Object.keys(activeLayers).filter(k => activeLayers[k].visible);
            
            for (const prod of visibleProds) {
                if (ewmrsRef.current) {
                    try {
                        const latestProdTs = await ewmrsRef.current.getProductTimestamps(prod);
                        if (latestProdTs && latestProdTs.length > 0) {
                            const sortedLatest = [...latestProdTs].sort();
                            const currentCache = productTimestamps[prod] || [];
                            const sortedPrev = [...currentCache].sort();
                            
                            const isNew = sortedLatest.length !== sortedPrev.length || 
                                          sortedLatest[sortedLatest.length - 1] !== sortedPrev[sortedPrev.length - 1];
                            
                            if (isNew) {
                                setProductTimestamps(prev => ({
                                    ...prev,
                                    [prod]: sortedLatest
                                }));
                                hasGlobalUpdate = true;
                            }
                        }
                    } catch(err) {
                        console.warn(`Auto-refresh EWMRS failed for ${prod}`, err);
                    }
                }
            }

            if (hasGlobalUpdate) {
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
    }, [isConnected, timestamps, productTimestamps, activeLayers]);

    // Debounce/Listen to slide change
    useEffect(() => {
         const timer = setTimeout(() => {
              if (isConnected && timestamps.length > 0) {
                   loadData(currentIndex);
              }
         }, 200);
         return () => clearTimeout(timer);
    }, [currentIndex, isConnected, loadData, timestamps.length]); 

    // Connect Handler
    const handleConnect = async (overrideApiUrl?: string, overrideEwmrsUrl?: string) => {
        const finalApiUrl = overrideApiUrl || apiUrl;
        const finalEwmrsUrl = overrideEwmrsUrl || ewmrsUrl;
        
        if (overrideApiUrl) setApiUrl(overrideApiUrl);
        if (overrideEwmrsUrl) setEwmrsUrl(overrideEwmrsUrl);

        setLoading(true);
        setError(null);
        try {
            apiRef.current = new EdgeWARNAPI(finalApiUrl);
            ewmrsRef.current = new EWMRSAPI(finalEwmrsUrl);

            const ts = await apiRef.current.fetchTimestamps();
            setTimestamps(ts.sort());

            try {
                const prods = await ewmrsRef.current.getAvailableProducts();
                setProducts(prods);
                
                // Initialize activeLayers
                // Default to Reflectivity (CompRefQC) visible if available, or preserve existing settings
                const initialLayers: Record<string, LayerState> = {};
                prods.forEach(p => {
                    if (activeLayers[p]) {
                        initialLayers[p] = activeLayers[p];
                    } else {
                        initialLayers[p] = {
                            visible: p === 'CompRefQC' || p === prods[0],
                            opacity: 0.6
                        };
                    }
                });
                setActiveLayers(initialLayers);

                // Fetch timestamps for all visible products
                const visibleProds = Object.keys(initialLayers).filter(k => initialLayers[k].visible);

                const tsPromises = visibleProds.map(async p => {
                    try {
                        const productTs = await ewmrsRef.current!.getProductTimestamps(p);
                        return { p, ts: productTs };
                    } catch (e) {
                        console.warn(`Failed to update timestamps for ${p}`, e);
                        return null;
                    }
                });

                const results = await Promise.all(tsPromises);

                setProductTimestamps(prev => {
                    const next = { ...prev };
                    results.forEach(r => {
                        if (r) next[r.p] = r.ts.sort();
                    });
                    return next;
                });

                // Fetch colormaps
                try {
                    const cmapResponse = await ewmrsRef.current.fetchColormaps();
                    if (cmapResponse && cmapResponse.length > 0) {
                        // Flatten all colormaps from all responses
                        const allColormaps = cmapResponse.flatMap(r => r.colormaps);
                        setColormaps(allColormaps);
                    }
                } catch (cmapErr) {
                    console.warn("Failed to fetch colormaps", cmapErr);
                }
            } catch (e) {
                console.warn("EWMRS connection failed", e);
            }
            
            setIsConnected(true);
            if (ts.length > 0) {
                setCurrentIndex(ts.length - 1); // Start at latest
            }

        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };
    
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

    const handleCellClick = (cell: Cell) => {
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
    };

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
                           <div className="bg-gray-900/40 border border-gray-700/30 rounded-2xl p-3 shadow-inner backdrop-blur-sm">
                               <SlidebarControl 
                                   currentIndex={currentIndex}
                                   totalFrames={timestamps.length}
                                   onIndexChange={setCurrentIndex}
                                   isPlaying={isPlaying}
                                   onTogglePlay={() => setIsPlaying(!isPlaying)}
                               />
                           </div>
                           
                           {error && <div className="text-xs text-red-500 italic text-center mt-2">{error}</div>}
                      </div>
                 )}
             </div>

             {/* Map Area */}
             <div className="flex-1 relative">
                  <div ref={mapContainerRef} className="h-full w-full z-0" />

                  {/* Top Bar for Time */}
                  {isConnected && (
                       <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-[400] backdrop-blur-md border rounded-full px-6 py-2 shadow-xl flex items-center gap-4 pointer-events-none select-none transition-all duration-500 ${isFlashing ? 'bg-green-900/90 border-green-500/80 scale-105' : 'bg-gray-900/90 border-gray-700/50'}`}>
                           <div className={`text-2xl font-mono font-bold drop-shadow-sm tracking-wider transition-colors duration-300 ${isFlashing ? 'text-green-300' : 'text-blue-400'}`}>{time || '--:--'}</div>
                           <div className={`h-8 w-px transition-colors duration-300 ${isFlashing ? 'bg-green-600' : 'bg-gray-700'}`}></div>
                           <div className={`text-sm font-medium tracking-wide uppercase transition-colors duration-300 ${isFlashing ? 'text-green-200' : 'text-gray-400'}`}>{date || 'YYYY-MM-DD'}</div>
                       </div>
                  )}
                  
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
                      <DistanceTool map={mapInstanceRef.current} />
                      <CircleTool map={mapInstanceRef.current} />
                  </MapToolbar>

                  {/* Colormap Legend */}
                  {isConnected && <ColormapLegend colormap={activeColormap} />}
             </div>
        </div>
    );
}
