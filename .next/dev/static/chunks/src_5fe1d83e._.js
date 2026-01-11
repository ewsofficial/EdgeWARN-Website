(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/utils/edgewarn-api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * EdgeWARN API Client
 * Provides methods to interact with the EdgeWARN Features API
 */ __turbopack_context__.s([
    "EdgeWARNAPI",
    ()=>EdgeWARNAPI
]);
class EdgeWARNAPI {
    baseUrl;
    /**
     * Create an API client instance
     * @param baseUrl - Base URL of the API server (e.g., 'http://localhost:3000')
     */ constructor(baseUrl){
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    }
    /**
     * Fetch available stormcell timestamps
     * @returns Array of timestamps in YYYYMMDD-HHMMSS format
     */ async fetchTimestamps() {
        const response = await fetch(`${this.baseUrl}/features/fetch/resources?type=list`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Received non-JSON response:", text.substring(0, 500));
            throw new Error(`Server returned non-JSON content. Content-Type: ${contentType}. See console for details.`);
        }
        return await response.json();
    }
    /**
     * Fetch available cell IDs
     * @returns Array of cell IDs
     */ async fetchCellIds() {
        const response = await fetch(`${this.baseUrl}/features/fetch/resources?type=cell`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Download stormcell list data for a specific timestamp
     * @param timestamp - Timestamp in YYYYMMDD-HHMMSS format
     * @returns Stormcell list JSON data
     */ async downloadStormcellList(timestamp) {
        const response = await fetch(`${this.baseUrl}/features/download/resources?type=list&timestamp=${timestamp}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Server returned non-JSON content. Content-Type: ${contentType}.`);
        }
        return await response.json();
    }
    /**
     * Download cell history for a specific cell ID
     * @param cellId - Cell ID as a positive integer
     * @returns Array of historical cell states
     */ async downloadCellHistory(cellId) {
        const response = await fetch(`${this.baseUrl}/features/download/resources?type=cell&id=${cellId}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Check server health
     * @returns Health status object
     */ async checkHealth() {
        const response = await fetch(`${this.baseUrl}/health`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Get API information
     * @returns API endpoint information
     */ async getAPIInfo() {
        const response = await fetch(`${this.baseUrl}/features/`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/utils/ewmrs-api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * EWMRS API Client
 * Provides methods to interact with the Edge-compute Weather Map Rendering System API
 */ __turbopack_context__.s([
    "EWMRSAPI",
    ()=>EWMRSAPI
]);
class EWMRSAPI {
    baseUrl;
    /**
     * Create an API client instance
     * @param baseUrl - Base URL of the API server (e.g., 'http://localhost:3003')
     */ constructor(baseUrl){
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    }
    /**
     * Fetch all available weather products
     * @returns Array of product names
     */ async getAvailableProducts() {
        const response = await fetch(`${this.baseUrl}/renders/get-items`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`EWMRS: Server returned ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Fetch available timestamps for a product
     * @param product - Product name
     * @returns Array of timestamps in YYYYMMDD-HHMMSS format
     */ async getProductTimestamps(product) {
        const response = await fetch(`${this.baseUrl}/renders/fetch?product=${encodeURIComponent(product)}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`EWMRS: Server returned ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Get the URL for a specific render
     * @param product - Product name
     * @param timestamp - Timestamp in YYYYMMDD-HHMMSS format
     * @returns URL to the render image
     */ getRenderUrl(product, timestamp) {
        return `${this.baseUrl}/renders/download?product=${encodeURIComponent(product)}&timestamp=${encodeURIComponent(timestamp)}`;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/Map/LeafletMap.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LeafletMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$edgewarn$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/edgewarn-api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$ewmrs$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/ewmrs-api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
function LeafletMap() {
    _s();
    const mapContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mapInstanceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const apiRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const ewmrsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const currentLayerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const imageOverlayRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const contourLayerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const boundsLayerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // State
    const [apiUrl, setApiUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('http://localhost:5000');
    const [ewmrsUrl, setEwmrsUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('http://localhost:3003');
    const [isConnected, setIsConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [timestamps, setTimestamps] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentIndex, setCurrentIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // EWMRS State
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedProduct, setSelectedProduct] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [productTimestamps, setProductTimestamps] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [latOffset, setLatOffset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // Toggles
    const [showRadar, setShowRadar] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showBounds, setShowBounds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showContour, setShowContour] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [crisp, setCrisp] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [selectedCellInfo, setSelectedCellInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Initialization
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LeafletMap.useEffect": ()=>{
            if (!mapContainerRef.current || mapInstanceRef.current) return;
            // Init Map with EPSG:4326
            const map = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].map(mapContainerRef.current, {
                crs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].CRS.EPSG4326,
                center: [
                    37.8,
                    -96
                ],
                zoom: 4,
                minZoom: 3
            });
            // OSM WMS via Terrestris
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].tileLayer.wms('https://ows.terrestris.de/osm/service', {
                layers: 'OSM-WMS',
                format: 'image/png',
                transparent: false,
                version: '1.3.0',
                attribution: '&copy; terrestris &copy; OpenStreetMap'
            }).addTo(map);
            mapInstanceRef.current = map;
            // Setup Reference Bounds Layer
            const referenceBounds = [
                [
                    20,
                    -130
                ],
                [
                    55,
                    -60
                ]
            ];
            boundsLayerRef.current = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].rectangle(referenceBounds, {
                color: "#3b82f6",
                weight: 1,
                fill: false,
                dashArray: '4, 4'
            });
            // Cleanup
            return ({
                "LeafletMap.useEffect": ()=>{
                    map.remove();
                    mapInstanceRef.current = null;
                }
            })["LeafletMap.useEffect"];
        }
    }["LeafletMap.useEffect"], []);
    // Toggle Bounds Layer
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LeafletMap.useEffect": ()=>{
            const map = mapInstanceRef.current;
            if (!map || !boundsLayerRef.current) return;
            if (showBounds) {
                boundsLayerRef.current.addTo(map);
            } else {
                boundsLayerRef.current.remove();
            }
        }
    }["LeafletMap.useEffect"], [
        showBounds
    ]);
    // Helper functions
    const parseTimestamp = (ts)=>{
        const match = ts.match(/(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/);
        if (!match) return null;
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]), parseInt(match[4]), parseInt(match[5]), parseInt(match[6]));
    };
    const formatTimeLabel = (ts)=>{
        const match = ts.match(/(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/);
        if (!match) return {
            date: ts,
            time: ''
        };
        return {
            date: `${match[1]}-${match[2]}-${match[3]}`,
            time: `${match[4]}:${match[5]}`
        };
    };
    const findClosestTimestamp = (targetTs, candidates)=>{
        if (!candidates || candidates.length === 0) return null;
        const targetDate = parseTimestamp(targetTs);
        if (!targetDate) return null;
        targetDate.setSeconds(0, 0);
        let closest = null;
        let minDiff = Infinity;
        for (const cand of candidates){
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
    const loadData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LeafletMap.useCallback[loadData]": async (index)=>{
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
                const layerGroup = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].featureGroup();
                let features = [];
                if (data.content && data.content.features) features = data.content.features;
                else if (data.features) features = data.features;
                else if (Array.isArray(data)) features = data;
                const polyStyle = {
                    color: "#f87171",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.3
                };
                features.forEach({
                    "LeafletMap.useCallback[loadData]": (cell)=>{
                        if (cell.bbox && Array.isArray(cell.bbox) && cell.bbox.length > 0) {
                            const coords = cell.bbox.map({
                                "LeafletMap.useCallback[loadData].coords": (p)=>{
                                    let val1 = p[0];
                                    let val2 = p[1];
                                    let lat, lon;
                                    if (Math.abs(val1) > 90) {
                                        lon = val1;
                                        lat = val2;
                                    } else {
                                        lat = val1;
                                        lon = val2;
                                    }
                                    if (lon > 180) lon -= 360;
                                    return [
                                        lat,
                                        lon
                                    ];
                                }
                            }["LeafletMap.useCallback[loadData].coords"]);
                            const polygon = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].polygon(coords, polyStyle);
                            if (cell.properties) {
                                polygon.on('click', {
                                    "LeafletMap.useCallback[loadData]": ()=>{
                                        const props = {
                                            ...cell.properties,
                                            id: cell.id
                                        };
                                        setSelectedCellInfo(JSON.stringify(props, null, 2));
                                    }
                                }["LeafletMap.useCallback[loadData]"]);
                            }
                            polygon.addTo(layerGroup);
                        }
                    }
                }["LeafletMap.useCallback[loadData]"]);
                layerGroup.addTo(map);
                currentLayerRef.current = layerGroup;
            } catch (err) {
                console.warn(`Error loading cell data for ${ts}:`, err);
                if (err.message?.includes('404')) {
                    setError(`Data not available for ${ts}`);
                }
            }
            // 2. Render Overlay (Radar)
            // Cleanup existing
            if (imageOverlayRef.current) {
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
                const directUrl = ewmrsRef.current.getRenderUrl(selectedProduct, bestTimestamp);
                const proxyUrl = `/api/proxy-render?url=${encodeURIComponent(directUrl)}`;
                const baseSouth = 20 + latOffset;
                const baseNorth = 55 + latOffset;
                const baseWest = -130;
                const baseEast = -60;
                const bounds = [
                    [
                        baseSouth,
                        baseWest
                    ],
                    [
                        baseNorth,
                        baseEast
                    ]
                ];
                // Check HEAD first? No, just load it. Or use fetch to check.
                // We'll trust leafelt error handling usually, but checking avoids 404 console spam visually?
                // Skipping HEAD check for speed.
                const overlay = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].imageOverlay(proxyUrl, bounds, {
                    opacity: 0.6
                }).addTo(map);
                overlay.bringToBack();
                imageOverlayRef.current = overlay;
                if (crisp) {
                    const el = overlay.getElement();
                    if (el) el.classList.add('pixelated-overlay');
                }
                if (showContour) {
                    contourLayerRef.current = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].rectangle(bounds, {
                        color: "#f59e0b",
                        weight: 2,
                        fill: false
                    }).addTo(map);
                }
            }
            setLoading(false);
        }
    }["LeafletMap.useCallback[loadData]"], [
        timestamps,
        showRadar,
        selectedProduct,
        productTimestamps,
        latOffset,
        crisp,
        showContour
    ]); // Deps
    // Debounce/Listen to slide change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LeafletMap.useEffect": ()=>{
            const timer = setTimeout({
                "LeafletMap.useEffect.timer": ()=>{
                    if (isConnected && timestamps.length > 0) {
                        loadData(currentIndex);
                    }
                }
            }["LeafletMap.useEffect.timer"], 200);
            return ({
                "LeafletMap.useEffect": ()=>clearTimeout(timer)
            })["LeafletMap.useEffect"];
        }
    }["LeafletMap.useEffect"], [
        currentIndex,
        isConnected,
        loadData,
        timestamps.length
    ]);
    // Connect Handler
    const handleConnect = async ()=>{
        setLoading(true);
        setError(null);
        try {
            apiRef.current = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$edgewarn$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EdgeWARNAPI"](apiUrl);
            ewmrsRef.current = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$ewmrs$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EWMRSAPI"](ewmrsUrl);
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
        } catch (err) {
            setError(err.message);
        } finally{
            setLoading(false);
        }
    };
    // Changing product
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LeafletMap.useEffect": ()=>{
            const updateProdTs = {
                "LeafletMap.useEffect.updateProdTs": async ()=>{
                    if (ewmrsRef.current && selectedProduct) {
                        try {
                            const prodTs = await ewmrsRef.current.getProductTimestamps(selectedProduct);
                            setProductTimestamps(prodTs.sort());
                        } catch (e) {
                            console.warn("Failed fetch prod ts");
                        }
                    }
                }
            }["LeafletMap.useEffect.updateProdTs"];
            updateProdTs();
        }
    }["LeafletMap.useEffect"], [
        selectedProduct
    ]);
    // Current Time Labels
    const currentTs = timestamps[currentIndex] || '';
    const { date, time } = formatTimeLabel(currentTs);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-ce79a2500b320964" + " " + "flex bg-gray-900 text-gray-100 h-screen font-sans overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "ce79a2500b320964",
                children: ".pixelated-overlay{image-rendering:pixelated;image-rendering:-moz-crisp-edges;image-rendering:crisp-edges}"
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-ce79a2500b320964" + " " + "w-80 flex-shrink-0 flex flex-col border-r border-gray-700 bg-gray-800",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-ce79a2500b320964" + " " + "p-4 border-b border-gray-700",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "jsx-ce79a2500b320964" + " " + "text-xl font-bold mb-4 text-blue-400",
                                children: "Interactive Map"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                lineNumber: 348,
                                columnNumber: 24
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-ce79a2500b320964" + " " + "space-y-3",
                                children: !isConnected ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-ce79a2500b320964",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "jsx-ce79a2500b320964" + " " + "block text-xs text-gray-400 mb-1",
                                                    children: "API URL"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                                    lineNumber: 354,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: apiUrl,
                                                    onChange: (e)=>setApiUrl(e.target.value),
                                                    className: "jsx-ce79a2500b320964" + " " + "w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                                    lineNumber: 355,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                            lineNumber: 353,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-ce79a2500b320964",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "jsx-ce79a2500b320964" + " " + "block text-xs text-gray-400 mb-1",
                                                    children: "EWMRS URL"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                                    lineNumber: 359,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: ewmrsUrl,
                                                    onChange: (e)=>setEwmrsUrl(e.target.value),
                                                    className: "jsx-ce79a2500b320964" + " " + "w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                                    lineNumber: 360,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                            lineNumber: 358,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleConnect,
                                            disabled: loading,
                                            className: "jsx-ce79a2500b320964" + " " + "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm disabled:opacity-50",
                                            children: loading ? 'Connecting...' : 'Connect'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                            lineNumber: 363,
                                            columnNumber: 37
                                        }, this),
                                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-ce79a2500b320964" + " " + "text-red-400 text-xs mt-2",
                                            children: error
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                            lineNumber: 367,
                                            columnNumber: 47
                                        }, this)
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-ce79a2500b320964" + " " + "text-sm text-green-400 mb-2",
                                            children: "Connected"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                            lineNumber: 371,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            value: selectedProduct || '',
                                            onChange: (e)=>setSelectedProduct(e.target.value),
                                            className: "jsx-ce79a2500b320964" + " " + "w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm mb-2",
                                            children: products.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: p,
                                                    className: "jsx-ce79a2500b320964",
                                                    children: p
                                                }, p, false, {
                                                    fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                                    lineNumber: 374,
                                                    columnNumber: 60
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                            lineNumber: 372,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-ce79a2500b320964" + " " + "space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "jsx-ce79a2500b320964" + " " + "flex items-center text-xs text-gray-400 cursor-pointer",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            checked: showRadar,
                                                            onChange: (e)=>setShowRadar(e.target.checked),
                                                            className: "jsx-ce79a2500b320964" + " " + "mr-2"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                                            lineNumber: 379,
                                                            columnNumber: 45
                                                        }, this),
                                                        "Show Radar Layer"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                                    lineNumber: 378,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-ce79a2500b320964" + " " + "pt-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "jsx-ce79a2500b320964" + " " + "block text-xs text-gray-400 mb-1",
                                                            children: [
                                                                "Latitude Offset: ",
                                                                latOffset
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                                            lineNumber: 384,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            step: "0.1",
                                                            value: latOffset,
                                                            onChange: (e)=>setLatOffset(parseFloat(e.target.value)),
                                                            className: "jsx-ce79a2500b320964" + " " + "w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                                            lineNumber: 385,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                                    lineNumber: 383,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "jsx-ce79a2500b320964" + " " + "flex items-center text-xs text-gray-400 cursor-pointer",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            checked: showBounds,
                                                            onChange: (e)=>setShowBounds(e.target.checked),
                                                            className: "jsx-ce79a2500b320964" + " " + "mr-2"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                                            lineNumber: 390,
                                                            columnNumber: 45
                                                        }, this),
                                                        "Show Reference Bounds"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                                    lineNumber: 389,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "jsx-ce79a2500b320964" + " " + "flex items-center text-xs text-gray-400 cursor-pointer",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            checked: crisp,
                                                            onChange: (e)=>setCrisp(e.target.checked),
                                                            className: "jsx-ce79a2500b320964" + " " + "mr-2"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                                            lineNumber: 394,
                                                            columnNumber: 45
                                                        }, this),
                                                        "Crisp Rendering"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                                    lineNumber: 393,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "jsx-ce79a2500b320964" + " " + "flex items-center text-xs text-gray-400 cursor-pointer",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            checked: showContour,
                                                            onChange: (e)=>setShowContour(e.target.checked),
                                                            className: "jsx-ce79a2500b320964" + " " + "mr-2"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                                            lineNumber: 398,
                                                            columnNumber: 45
                                                        }, this),
                                                        "Show Image Contour"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                                    lineNumber: 397,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                            lineNumber: 377,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                lineNumber: 350,
                                columnNumber: 24
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Map/LeafletMap.tsx",
                        lineNumber: 347,
                        columnNumber: 19
                    }, this),
                    isConnected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-ce79a2500b320964" + " " + "flex-1 flex flex-col justify-end p-4 space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-ce79a2500b320964" + " " + "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-ce79a2500b320964" + " " + "text-gray-400 text-xs uppercase tracking-wide mb-1",
                                        children: "Current Time"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                        lineNumber: 410,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-ce79a2500b320964" + " " + "text-xl font-mono text-blue-300 font-bold",
                                        children: time || '--:--'
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                        lineNumber: 411,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-ce79a2500b320964" + " " + "text-xs text-gray-500",
                                        children: date || 'YYYY-MM-DD'
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                        lineNumber: 412,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                lineNumber: 409,
                                columnNumber: 28
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-ce79a2500b320964" + " " + "relative w-full h-12 flex items-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "range",
                                    min: 0,
                                    max: timestamps.length - 1,
                                    value: currentIndex,
                                    onChange: (e)=>setCurrentIndex(parseInt(e.target.value)),
                                    className: "jsx-ce79a2500b320964" + " " + "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                    lineNumber: 416,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                lineNumber: 415,
                                columnNumber: 28
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-ce79a2500b320964" + " " + "flex justify-between text-xs text-gray-600",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-ce79a2500b320964",
                                        children: "Start"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                        lineNumber: 422,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-ce79a2500b320964",
                                        children: "End"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                        lineNumber: 423,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                lineNumber: 421,
                                columnNumber: 28
                            }, this),
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-ce79a2500b320964" + " " + "text-xs text-red-500 italic text-center",
                                children: error
                            }, void 0, false, {
                                fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                lineNumber: 426,
                                columnNumber: 38
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Map/LeafletMap.tsx",
                        lineNumber: 408,
                        columnNumber: 23
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Map/LeafletMap.tsx",
                lineNumber: 346,
                columnNumber: 14
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-ce79a2500b320964" + " " + "flex-1 relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: mapContainerRef,
                        className: "jsx-ce79a2500b320964" + " " + "h-full w-full z-0"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Map/LeafletMap.tsx",
                        lineNumber: 433,
                        columnNumber: 19
                    }, this),
                    selectedCellInfo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-ce79a2500b320964" + " " + "absolute top-4 right-4 z-[1000] bg-gray-800/90 backdrop-blur border border-gray-600 rounded p-4 max-w-xs shadow-lg text-white",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-ce79a2500b320964" + " " + "flex justify-between items-center mb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "jsx-ce79a2500b320964" + " " + "font-bold text-lg text-blue-300",
                                        children: "Selected Cell"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                        lineNumber: 438,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setSelectedCellInfo(null),
                                        className: "jsx-ce79a2500b320964" + " " + "text-gray-400 hover:text-white",
                                        children: "✕"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                        lineNumber: 439,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                lineNumber: 437,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                className: "jsx-ce79a2500b320964" + " " + "text-xs overflow-auto max-h-60 text-gray-300 whitespace-pre-wrap",
                                children: selectedCellInfo
                            }, void 0, false, {
                                fileName: "[project]/src/components/Map/LeafletMap.tsx",
                                lineNumber: 441,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Map/LeafletMap.tsx",
                        lineNumber: 436,
                        columnNumber: 24
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Map/LeafletMap.tsx",
                lineNumber: 432,
                columnNumber: 14
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Map/LeafletMap.tsx",
        lineNumber: 335,
        columnNumber: 9
    }, this);
}
_s(LeafletMap, "Y6Zi5bCq1y7ryENHpywrS7dBq6A=");
_c = LeafletMap;
var _c;
__turbopack_context__.k.register(_c, "LeafletMap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/Map/LeafletMap.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/Map/LeafletMap.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_5fe1d83e._.js.map