'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Virtuoso } from 'react-virtuoso';
import { ArrowLeft, Clock, AlertTriangle, Shield, Info, Map as MapIcon, Calendar } from 'lucide-react';
import { NWSData, NWSAlertFeature } from '@/types';
import AlertDetailsModal from '@/components/UI/AlertDetailsModal';
import { getSeverityClasses } from '@/utils/styling';
import { useMapContext } from '@/components/Map/context/MapContext';

const AlertMap = dynamic(() => import('@/components/Map/AlertMap'), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-900 animate-pulse" />
});

// Helper for severity colors (matching the map)
const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'Extreme': return { bg: 'bg-red-950/50', border: 'border-orange-600', text: 'text-orange-500', badge: 'bg-orange-600' };
        case 'Severe': return { bg: 'bg-red-950/30', border: 'border-red-600', text: 'text-red-500', badge: 'bg-red-600' };
        case 'Moderate': return { bg: 'bg-amber-950/30', border: 'border-amber-600', text: 'text-amber-500', badge: 'bg-amber-600' };
        case 'Minor': return { bg: 'bg-blue-950/30', border: 'border-blue-600', text: 'text-blue-500', badge: 'bg-blue-600' };
        default: return { bg: 'bg-slate-800/50', border: 'border-slate-600', text: 'text-slate-400', badge: 'bg-slate-600' };
    }
};

function AlertsContent() {
    const searchParams = useSearchParams();
    const timestampParam = searchParams.get('timestamp');
    
    const { apiRef, isConnected, ewmrsUrl } = useMapContext();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<NWSData | null>(null);
    const [currentTimestamp, setCurrentTimestamp] = useState<string | null>(null);
    const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
    const [selectedAlert, setSelectedAlert] = useState<NWSAlertFeature | null>(null);
    const [visibleCount, setVisibleCount] = useState(5);
    const lastFetchedTsRef = useRef<string | null>(null);

    useEffect(() => {
        setVisibleCount(5);
    }, [selectedSeverity, currentTimestamp, data]);

    useEffect(() => {
        // Connection handled by GlobalConnectionManager / MapContext


        const fetchData = async () => {
            if (!isConnected || !apiRef.current) return;

            if (!data) setLoading(true);
            setError(null);
            try {
                let targetTs = timestampParam;
                // Optimization: Only fetch if strictly necessary
                let shouldFetch = true;

                if (!targetTs || targetTs === 'latest') {
                    // Fetch latest
                    const timestamps = await apiRef.current!.fetchNWSTimestamps();
                    if (timestamps.length > 0) {
                        const latest = timestamps.sort().pop()!;
                        targetTs = latest;
                        if (targetTs === lastFetchedTsRef.current) {
                            shouldFetch = false;
                        }
                    } else {
                        // Don't throw here if we just started, allows silent fail until real data
                        console.warn("No NWS data available");
                        shouldFetch = false; 
                    }
                } else {
                    // Specific timestamp
                   if (targetTs === lastFetchedTsRef.current) {
                        shouldFetch = false;
                   }
                }

                if (shouldFetch && targetTs) {
                    setCurrentTimestamp(targetTs);
                    const result = await apiRef.current!.downloadNWS(targetTs);
                    setData(result);
                    lastFetchedTsRef.current = targetTs;
                }
            } catch (err) {
                console.error("Failed to load alerts", err);
                let msg = err instanceof Error ? err.message : "Failed to load alerts";
                
                // User-friendly error mapping
                if (msg.includes("500")) {
                    msg = "Server Error (500). The NWS data service may be experiencing issues.";
                } else if (msg.includes("404")) {
                    msg = "Alert data not found for this timestamp.";
                }

                // Only show error text if we don't have data, otherwise just log it (silent fail on refresh)
                if (!data) setError(msg);
            } finally {
                setLoading(false);
            }
        };

        if (isConnected) fetchData();

        if (!timestampParam || timestampParam === 'latest') {
            const interval = setInterval(fetchData, 30000);
            return () => clearInterval(interval);
        }
    }, [timestampParam, isConnected]);

    const formatTime = (iso: string) => {
        try {
            return new Date(iso).toLocaleString('en-US', {
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
            });
        } catch { return iso; }
    };

    const severities = ['All', 'Extreme', 'Severe', 'Moderate', 'Minor', 'Unknown'];
    
    const filteredFeatures = data?.data.features.filter(f => 
        selectedSeverity === 'All' || (f.properties.severity || 'Unknown') === selectedSeverity
    ) || [];

    return (
        <div className="min-h-screen bg-[#07112a] text-slate-200 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <AlertTriangle className="w-8 h-8 text-yellow-500" />
                                Active Alerts
                            </h1>
                            <p className="text-slate-400 flex items-center gap-2 text-sm mt-1">
                                <Clock className="w-4 h-4" />
                                Data Time: <span className="text-blue-400 font-mono">{currentTimestamp || 'Loading...'}</span>
                            </p>
                        </div>
                    </div>
                    
                    {/* Severity Filter */}
                    <div className="flex flex-wrap gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                        {severities.map(sev => {
                            const isSelected = selectedSeverity === sev;
                            const colors = sev === 'All' ? { text: 'text-white', bg: 'bg-slate-600' } : getSeverityColor(sev); // eslint-disable-line @typescript-eslint/no-unused-vars
                            // For buttons, we act slightly differently than the card colors
                            const activeClass = isSelected 
                                ? 'bg-white text-black shadow-sm font-semibold' 
                                : 'text-slate-400 hover:text-white hover:bg-white/10';
                            
                            return (
                                <button
                                    key={sev}
                                    onClick={() => setSelectedSeverity(sev)}
                                    className={`px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${activeClass}`}
                                >
                                    {sev}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 border border-red-800 rounded-xl p-8 text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-red-500 mb-2">Error Loading Alerts</h3>
                        <p className="text-red-300">{error}</p>
                    </div>
                ) : !filteredFeatures.length ? (
                    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8 text-center text-slate-400">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No active alerts found matching filter.</p>
                    </div>
                ) : (
                    <Virtuoso
                        useWindowScroll
                        data={filteredFeatures.slice(0, visibleCount)}
                        components={{
                            Footer: () => (
                                visibleCount < filteredFeatures.length ? (
                                    <div className="py-8 flex justify-center">
                                        <button 
                                            onClick={() => setVisibleCount(prev => prev + 10)}
                                            className="px-8 py-3 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-full text-slate-300 hover:text-white font-medium transition-all uppercase tracking-wide text-xs group"
                                        >
                                            Show More Alerts <span className="text-slate-500 group-hover:text-slate-400 ml-1">({filteredFeatures.length - visibleCount})</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center opacity-50">
                                        <span className="text-slate-600 text-xs uppercase tracking-widest font-bold">• End of List •</span>
                                    </div>
                                )
                            )
                        }}
                        itemContent={(index, feature) => {
                            const props = feature.properties;
                            const colors = getSeverityClasses(props.severity);
                            
                            return (
                                <div className="pb-4">
                                    <div 
                                        onClick={() => setSelectedAlert(feature)}
                                        className={`relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg} backdrop-blur-sm transition-transform hover:scale-[1.005] duration-200 cursor-pointer`}
                                    >
                                        <div className="p-5 flex flex-col md:flex-row gap-6">
                                            
                                            {/* Left: Severity & Icon */}
                                            <div className="flex-shrink-0 flex md:flex-col items-center gap-3 md:w-32 md:border-r border-white/10 pr-0 md:pr-6">
                                                <div className={`${colors.badge} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg`}>
                                                    <AlertTriangle className="w-8 h-8 text-white" />
                                                </div>
                                                <div className={`font-bold text-lg ${colors.text} text-center`}>
                                                    {props.severity}
                                                </div>
                                                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                                                    Severity
                                                </div>
                                            </div>

                                            {/* Right: Details */}
                                            <div className="flex-grow space-y-4">
                                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-white mb-1">{props.event}</h2>
                                                        <p className="text-slate-400 text-sm flex items-center gap-1">
                                                            <Info className="w-4 h-4" /> 
                                                            {props.headline}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                         <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                                                            {props.status}
                                                         </span>
                                                         <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                                                            {props.urgency}
                                                         </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 rounded-lg p-4 text-sm h-fit">
                                                            <div className="space-y-1">
                                                                <span className="text-slate-500 uppercase text-xs font-bold block">Effective</span>
                                                                <span className="text-white font-medium flex items-center gap-2">
                                                                    <Calendar className="w-4 h-4 text-green-400" />
                                                                    {formatTime(props.effective)}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="text-slate-500 uppercase text-xs font-bold block">Expires</span>
                                                                <span className="text-white font-medium flex items-center gap-2">
                                                                    <Calendar className="w-4 h-4 text-red-400" />
                                                                    {formatTime(props.expires)}
                                                                </span>
                                                            </div>
                                                            <div className="md:col-span-2 space-y-1 pt-2 border-t border-white/5">
                                                                <span className="text-slate-500 uppercase text-xs font-bold block">Affected Areas</span>
                                                                <div className="text-slate-300 leading-relaxed max-h-[100px] overflow-y-auto custom-scrollbar">
                                                                    <MapIcon className="w-4 h-4 inline mr-2 text-blue-400" />
                                                                    {props.areaDesc}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Map Section */}
                                                <div 
                                                    className="h-48 lg:h-auto min-h-[200px] rounded-lg overflow-hidden border border-white/10 relative z-0 shadow-inner bg-black/40"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <AlertMap 
                                                        feature={feature} 
                                                        currentTimestamp={currentTimestamp} 
                                                        ewmrsUrl={ewmrsUrl}
                                                    />
                                                </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }}
                    />
                )}
            </div>

            <AlertDetailsModal 
                isOpen={!!selectedAlert} 
                feature={selectedAlert} 
                onClose={() => setSelectedAlert(null)} 
            />
        </div>
    );
}

export default function AlertsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#07112a] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>}>
            <AlertsContent />
        </Suspense>
    );
}
