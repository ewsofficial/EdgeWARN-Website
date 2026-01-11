'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure CSS is imported
import { EdgeWARNAPI } from '@/utils/edgewarn-api';
import { EWMRSAPI } from '@/utils/ewmrs-api';
import SlidebarControl from '../UI/SlidebarControl';

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
    const imageOverlayRef = useRef<L.ImageOverlay | null>(null);
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
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [productTimestamps, setProductTimestamps] = useState<string[]>([]);

    
    // Toggles
    const [showRadar, setShowRadar] = useState(true);
    const [showBounds, setShowBounds] = useState(false);
    const [showContour, setShowContour] = useState(false);
    const [crisp, setCrisp] = useState(true);

    // Flashing state for new data
    const [isFlashing, setIsFlashing] = useState(false);

    const [selectedCellInfo, setSelectedCellInfo] = useState<string | null>(null);

    // Initialization
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        // Init Map with EPSG:4326
        const map = L.map(mapContainerRef.current, {
            crs: L.CRS.EPSG4326,
            center: [37.8, -96],
            zoom: 4,
            minZoom: 3
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

        // Cleanup
        return () => {
             map.remove();
             mapInstanceRef.current = null;
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

    const findClosestTimestamp = (targetTs: string, candidates: string[]) => {
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
    };

    // Load Data Logic
    const loadData = useCallback(async (index: number) => {
        if (!timestamps[index] || !apiRef.current) return;
        const ts = timestamps[index];
        const map = mapInstanceRef.current;
        if (!map) return;

        setLoading(true);
        setError(null);

        // 1. Load Storm Cells
        try {
             // Removing old layer
             if (currentLayerRef.current) {
                 map.removeLayer(currentLayerRef.current);
                 currentLayerRef.current = null;
             }

             const data = await apiRef.current.downloadStormcellList(ts);
             const layerGroup = L.featureGroup();
             
             let features: any[] = [];
             if (data.content && data.content.features) features = data.content.features;
             else if (data.features) features = data.features;
             else if (Array.isArray(data)) features = data;

             const polyStyle = {
                color: "#f87171", // red-400
                weight: 2,
                opacity: 1,
                fillOpacity: 0.3
            };

            features.forEach((cell: any) => {
                 if (cell.bbox && Array.isArray(cell.bbox) && cell.bbox.length > 0) {
                      const coords: L.LatLngExpression[] = cell.bbox.map((p: number[]) => {
                           let val1 = p[0];
                           let val2 = p[1];
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
                      if (cell.properties) {
                           polygon.on('click', () => {
                                const props = { ...cell.properties, id: cell.id };
                                setSelectedCellInfo(JSON.stringify(props, null, 2));
                           });
                      }
                      polygon.addTo(layerGroup);
                 }
            });

            layerGroup.addTo(map);
            currentLayerRef.current = layerGroup;

        } catch (err: any) {
             console.warn(`Error loading cell data for ${ts}:`, err);
             if (err.message?.includes('404')) {
                 setError(`Data not available for ${ts}`);
             }
        }

        // 2. Render Overlay (Radar)
        // Cleanup existing
        if (imageOverlayRef.current) {
            if ((imageOverlayRef.current as any)._blobUrl) {
                URL.revokeObjectURL((imageOverlayRef.current as any)._blobUrl);
            }
            map.removeLayer(imageOverlayRef.current);
            imageOverlayRef.current = null;
        }
        if (contourLayerRef.current) {
            map.removeLayer(contourLayerRef.current);
            contourLayerRef.current = null;
        }

        if (showRadar && selectedProduct && ewmrsRef.current && productTimestamps.length > 0) {
             let bestTimestamp = ts;
             const match = findClosestTimestamp(ts, productTimestamps);
             if (match) {
                 bestTimestamp = match;
             } else {
                 // console.warn("No matching radar render found");
                 setLoading(false);
                 return; // Skip rendering overlay
             }

             const baseSouth = 20;
             const baseNorth = 55;
             const baseWest = -130;
             const baseEast = -60;
             const bounds: L.LatLngBoundsExpression = [[baseSouth, baseWest], [baseNorth, baseEast]];

             const directUrl = ewmrsRef.current.getRenderUrl(selectedProduct, bestTimestamp);
             
             try {
                const res = await fetch(directUrl);
                if (res.ok) {
                    const blob = await res.blob();
                    const objectUrl = URL.createObjectURL(blob);
                    
                    const overlay = L.imageOverlay(objectUrl, bounds, { opacity: 0.6 }).addTo(map);
                    overlay.bringToBack();
                    imageOverlayRef.current = overlay;
                    
                    // Store URL for cleanup
                    (overlay as any)._blobUrl = objectUrl;

                    if (crisp) {
                        const el = overlay.getElement();
                        if (el) el.classList.add('pixelated-overlay');
                    }
                }
             } catch (err) {
                console.warn("Failed to load radar image via fetch", err);
             }

             if (showContour) {
                 contourLayerRef.current = L.rectangle(bounds, {
                     color: "#f59e0b",
                     weight: 2,
                     fill: false
                 }).addTo(map);
             }
        }
        
        setLoading(false);

    }, [timestamps, showRadar, selectedProduct, productTimestamps, crisp, showContour]); // Deps

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

            // 2. Check EWMRS timestamps (if product selected)
            if (selectedProduct && ewmrsRef.current) {
                try {
                     const latestProdTs = await ewmrsRef.current.getProductTimestamps(selectedProduct);
                     if (latestProdTs && latestProdTs.length > 0) {
                        const sortedLatest = [...latestProdTs].sort();
                        const sortedPrev = [...productTimestamps].sort();
                        
                        const isNew = sortedLatest.length !== sortedPrev.length || 
                                      sortedLatest[sortedLatest.length - 1] !== sortedPrev[sortedPrev.length - 1];
                        
                        if (isNew) {
                            setProductTimestamps(sortedLatest);
                            hasGlobalUpdate = true;
                        }
                     }
                } catch(err) {
                    console.warn("Auto-refresh EWMRS failed", err);
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
    }, [isConnected, timestamps, productTimestamps, selectedProduct]);

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
    const handleConnect = async () => {
        setLoading(true);
        setError(null);
        try {
             apiRef.current = new EdgeWARNAPI(apiUrl);
             ewmrsRef.current = new EWMRSAPI(ewmrsUrl);

             const ts = await apiRef.current.fetchTimestamps();
             setTimestamps(ts.sort());

             try {
                 const prods = await ewmrsRef.current.getAvailableProducts();
                 setProducts(prods);
                 if (prods.length > 0) {
                      const initial = prods.includes('CompRefQC') ? 'CompRefQC' : prods[0];
                      setSelectedProduct(initial);
                      const prodTs = await ewmrsRef.current.getProductTimestamps(initial);
                      setProductTimestamps(prodTs.sort());
                 }
             } catch (e) {
                 console.warn("EWMRS connection failed", e);
             }
             
             setIsConnected(true);
             if (ts.length > 0) {
                 setCurrentIndex(ts.length - 1); // Start at latest
             }

        } catch (err: any) {
             setError(err.message);
        } finally {
             setLoading(false);
        }
    };
    
    // Changing product
    useEffect(() => {
        const updateProdTs = async () => {
            if (ewmrsRef.current && selectedProduct) {
                 try {
                     const prodTs = await ewmrsRef.current.getProductTimestamps(selectedProduct);
                     setProductTimestamps(prodTs.sort());
                 } catch (e) { console.warn("Failed fetch prod ts"); }
            }
        };
        updateProdTs();
    }, [selectedProduct]);
    
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

    // Current Time Labels
    const currentTs = timestamps[currentIndex] || '';
    const { date, time } = formatTimeLabel(currentTs);

    return (
        <div className="flex bg-gray-900 text-gray-100 h-screen font-sans overflow-hidden">
             {/* Styles for pixelated */}
             <style jsx global>{`
                .pixelated-overlay {
                    image-rendering: pixelated;
                    image-rendering: -moz-crisp-edges;
                    image-rendering: crisp-edges;
                }
             `}</style>

             {/* Sidebar */}
             <div className="w-80 flex-shrink-0 flex flex-col border-r border-gray-700 bg-gray-800">
                  <div className="p-4 border-b border-gray-700">
                       <h1 className="text-xl font-bold mb-4 text-blue-400">Interactive Map</h1>
                       
                       <div className="space-y-3">
                            {!isConnected ? (
                                <>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">API URL</label>
                                        <input type="text" value={apiUrl} onChange={e => setApiUrl(e.target.value)} 
                                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">EWMRS URL</label>
                                        <input type="text" value={ewmrsUrl} onChange={e => setEwmrsUrl(e.target.value)} 
                                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm" />
                                    </div>
                                    <button onClick={handleConnect} disabled={loading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm disabled:opacity-50">
                                        {loading ? 'Connecting...' : 'Connect'}
                                    </button>
                                    {error && <div className="text-red-400 text-xs mt-2">{error}</div>}
                                </>
                            ) : (
                                <>
                                    <div className="text-sm text-green-400 mb-2">Connected</div>
                                    <select value={selectedProduct || ''} onChange={e => setSelectedProduct(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm mb-2">
                                        {products.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>

                                    <div className="space-y-2">
                                        <label className="flex items-center text-xs text-gray-400 cursor-pointer">
                                            <input type="checkbox" checked={showRadar} onChange={e => setShowRadar(e.target.checked)} className="mr-2"/>
                                            Show Radar Layer
                                        </label>
                                        


                                        <label className="flex items-center text-xs text-gray-400 cursor-pointer">
                                            <input type="checkbox" checked={showBounds} onChange={e => setShowBounds(e.target.checked)} className="mr-2"/>
                                            Show Reference Bounds
                                        </label>
                                        <label className="flex items-center text-xs text-gray-400 cursor-pointer">
                                            <input type="checkbox" checked={crisp} onChange={e => setCrisp(e.target.checked)} className="mr-2"/>
                                            Crisp Rendering
                                        </label>
                                        <label className="flex items-center text-xs text-gray-400 cursor-pointer">
                                            <input type="checkbox" checked={showContour} onChange={e => setShowContour(e.target.checked)} className="mr-2"/>
                                            Show Image Contour
                                        </label>
                                    </div>
                                </>
                            )}
                       </div>
                  </div>

                  {isConnected && (



                      <div className="flex-1 flex flex-col justify-end p-4 space-y-4">
                           <div className="text-center">
                                <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Current Time</div>
                                <div className="text-xl font-mono text-blue-300 font-bold">{time || '--:--'}</div>
                                <div className="text-xs text-gray-500">{date || 'YYYY-MM-DD'}</div>
                           </div>
                           
                           <SlidebarControl 
                               currentIndex={currentIndex}
                               totalFrames={timestamps.length}
                               onIndexChange={setCurrentIndex}
                               isPlaying={isPlaying}
                               onTogglePlay={() => setIsPlaying(!isPlaying)}
                           />
                           
                           {error && <div className="text-xs text-red-500 italic text-center">{error}</div>}
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
             </div>
        </div>
    );
}
