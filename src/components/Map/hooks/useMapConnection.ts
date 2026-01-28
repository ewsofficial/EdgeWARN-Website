'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { EdgeWARNAPI } from '@/utils/edgewarn-api';
import { EWMRSAPI } from '@/utils/ewmrs-api';
import { Colormap, LayerState } from '@/types';
import { DEFAULT_LAYER_OPACITY, DEFAULT_PRODUCT } from '../constants';
import { getLastUsedEndpoint, touchEndpoint, saveEndpoint, generateEndpointName } from '@/utils/endpoint-cache';
import { UseMapConnectionReturn } from '@/types';



export function useMapConnection(): UseMapConnectionReturn {
    // URLs - initialize with defaults, will be updated from cache in useEffect
    const [apiUrl, setApiUrl] = useState('http://localhost:5000');
    const [ewmrsUrl, setEwmrsUrl] = useState('http://localhost:3003');

    // Connection state
    const [isConnected, setIsConnected] = useState(false);
    const [isAutoConnecting, setIsAutoConnecting] = useState(() => {
        return getLastUsedEndpoint() !== null;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // API refs
    const apiRef = useRef<EdgeWARNAPI | null>(null);
    const ewmrsRef = useRef<EWMRSAPI | null>(null);

    // Data
    const [timestamps, setTimestamps] = useState<string[]>([]);
    const [products, setProducts] = useState<string[]>([]);
    const [activeLayers, setActiveLayers] = useState<Record<string, LayerState>>({});
    const [productTimestamps, setProductTimestamps] = useState<Record<string, string[]>>({});
    const [colormaps, setColormaps] = useState<Colormap[]>([]);

    // Current state
    const [currentIndex, setCurrentIndex] = useState(0);

    // Flash state
    const [isFlashing, setIsFlashing] = useState(false);




    // Connect handler
    const handleConnect = useCallback(async (overrideApiUrl?: string, overrideEwmrsUrl?: string) => {
        const finalApiUrl = overrideApiUrl || apiUrl;
        const finalEwmrsUrl = overrideEwmrsUrl || ewmrsUrl;

        if (overrideApiUrl) setApiUrl(overrideApiUrl);
        if (overrideEwmrsUrl) setEwmrsUrl(overrideEwmrsUrl);

        setLoading(true);
        setError(null);

        try {
            // Protocol validation
            if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
                if (finalApiUrl.toLowerCase().startsWith('http:')) {
                    throw new Error('Mixed Content: Cannot connect to an insecure HTTP API from an HTTPS page. Please use an HTTPS API URL.');
                }
                if (finalEwmrsUrl.toLowerCase().startsWith('http:')) {
                    throw new Error('Mixed Content: Cannot connect to an insecure HTTP EWMRS from an HTTPS page. Please use an HTTPS EWMRS URL.');
                }
            }

            apiRef.current = new EdgeWARNAPI(finalApiUrl);
            ewmrsRef.current = new EWMRSAPI(finalEwmrsUrl);

            const ts = await apiRef.current.fetchTimestamps();
            setTimestamps(ts.sort());

            try {
                const prods = await ewmrsRef.current.getAvailableProducts();
                setProducts(prods);

                // Initialize activeLayers
                const initialLayers: Record<string, LayerState> = {};
                prods.forEach(p => {
                    initialLayers[p] = {
                        visible: p === DEFAULT_PRODUCT || p === prods[0],
                        opacity: DEFAULT_LAYER_OPACITY
                    };
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
                setCurrentIndex(ts.length - 1);
            }

            // Cache the successful endpoint
            touchEndpoint(finalApiUrl, finalEwmrsUrl);
            saveEndpoint({
                name: generateEndpointName(finalApiUrl),
                apiUrl: finalApiUrl,
                ewmrsUrl: finalEwmrsUrl,
            });

        } catch (err) {
            let message = (err as Error).message;
            if (message === 'Failed to fetch' || message.includes('Network request failed')) {
                if (window.location.protocol === 'https:' &&
                    (finalApiUrl.toLowerCase().startsWith('https:') || finalEwmrsUrl.toLowerCase().startsWith('https:'))) {
                    message = 'Network error. If using self-signed certificates, you may need to open the API URL in a new tab and accept the warning.';
                } else {
                    message = 'Network error. Please check if the API server is running and accessible.';
                }
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, ewmrsUrl]);

    // Load cached endpoint on mount and auto-connect
    useEffect(() => {
        const lastUsed = getLastUsedEndpoint();
        if (lastUsed) {
            setApiUrl(lastUsed.apiUrl);
            setEwmrsUrl(lastUsed.ewmrsUrl);
            setIsAutoConnecting(true);
            handleConnect(lastUsed.apiUrl, lastUsed.ewmrsUrl).finally(() => {
                setIsAutoConnecting(false);
            });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Keep-alive ping to prevent Nginx 5min timeout
    useEffect(() => {
        if (!isConnected || !apiRef.current) return;

        const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes
        const interval = setInterval(() => {
            apiRef.current?.checkHealth().catch(err => {
                console.warn("Keep-alive ping failed:", err);
            });
        }, PING_INTERVAL);

        return () => clearInterval(interval);
    }, [isConnected]);

    return {
        apiUrl,
        setApiUrl,
        ewmrsUrl,
        setEwmrsUrl,
        isConnected,
        isAutoConnecting,
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
    };
}
