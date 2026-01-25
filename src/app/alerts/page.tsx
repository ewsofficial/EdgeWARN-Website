'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, AlertTriangle, Shield, Info, Map as MapIcon, Calendar } from 'lucide-react';
import { EdgeWARNAPI } from '@/utils/edgewarn-api';
import { NWSData, NWSAlertFeature } from '@/types';
import { getLastUsedEndpoint } from '@/utils/endpoint-cache';

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

export default function AlertsPage() {
    const searchParams = useSearchParams();
    const timestampParam = searchParams.get('timestamp');
    
    // API Ref matching other components
    const apiRef = useRef<EdgeWARNAPI | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<NWSData | null>(null);
    const [currentTimestamp, setCurrentTimestamp] = useState<string | null>(null);
    const [selectedSeverity, setSelectedSeverity] = useState<string>('All');

    useEffect(() => {
        // Initialize API
        if (!apiRef.current) {
            const cached = getLastUsedEndpoint();
            const baseUrl = cached?.apiUrl || 'http://localhost:5000';
            apiRef.current = new EdgeWARNAPI(baseUrl);
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                let targetTs = timestampParam;

                if (!targetTs || targetTs === 'latest') {
                    // Fetch latest
                    const timestamps = await apiRef.current!.fetchNWSTimestamps();
                    if (timestamps.length > 0) {
                        targetTs = timestamps.sort().pop()!;
                    } else {
                        throw new Error("No NWS data available");
                    }
                }

                setCurrentTimestamp(targetTs);
                const result = await apiRef.current!.downloadNWS(targetTs!);
                setData(result);
            } catch (err) {
                console.error("Failed to load alerts", err);
                setError(err instanceof Error ? err.message : "Failed to load alerts");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timestampParam]);

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
                            const colors = sev === 'All' ? { text: 'text-white', bg: 'bg-slate-600' } : getSeverityColor(sev);
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
                    <div className="grid grid-cols-1 gap-4">
                        {filteredFeatures.map((feature: NWSAlertFeature, idx: number) => {
                            const props = feature.properties;
                            const colors = getSeverityColor(props.severity);
                            
                            return (
                                <div 
                                    key={feature.id || idx}
                                    className={`relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg} backdrop-blur-sm transition-transform hover:scale-[1.01] duration-200`}
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

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 rounded-lg p-4 text-sm">
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
                                                    <div className="text-slate-300 leading-relaxed">
                                                        <MapIcon className="w-4 h-4 inline mr-2 text-blue-400" />
                                                        {props.areaDesc}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Instructions/Description would go here if enabled, currently just summary */}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
