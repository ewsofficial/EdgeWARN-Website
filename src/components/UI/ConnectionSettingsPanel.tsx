import React, { useState, useEffect } from 'react';
import { Wifi, Server, Clock, ChevronDown, Trash2, Activity, ShieldCheck, Zap, Globe, Cpu, AlertTriangle } from 'lucide-react';
import { getSavedEndpoints, removeEndpoint, SavedEndpoint } from '@/utils/endpoint-cache';

interface ConnectionSettingsPanelProps {
    currentApiUrl: string;
    currentEwmrsUrl: string;
    isConnected: boolean;
    onConnect: (apiUrl: string, ewmrsUrl: string) => void;
    loading: boolean;
    error: string | null;
}

export default function ConnectionSettingsPanel({
    currentApiUrl,
    currentEwmrsUrl,
    isConnected,
    onConnect,
    loading,
    error
}: ConnectionSettingsPanelProps) {
    const [apiUrl, setApiUrl] = useState(currentApiUrl);
    const [ewmrsUrl, setEwmrsUrl] = useState(currentEwmrsUrl);
    const [savedEndpoints, setSavedEndpoints] = useState<SavedEndpoint[]>([]);
    const [showSavedDropdown, setShowSavedDropdown] = useState(false);
    const [activeField, setActiveField] = useState<string | null>(null);

    // Load saved endpoints on mount
    useEffect(() => {
        setSavedEndpoints(getSavedEndpoints());
    }, []);

    // Update local state when currentApiUrl/currentEwmrsUrl change
    useEffect(() => {
        setApiUrl(currentApiUrl);
    }, [currentApiUrl]);

    useEffect(() => {
        setEwmrsUrl(currentEwmrsUrl);
    }, [currentEwmrsUrl]);

    const handleConnectClick = () => {
        onConnect(apiUrl, ewmrsUrl);
        // Refresh saved endpoints after connection attempt
        setTimeout(() => setSavedEndpoints(getSavedEndpoints()), 100);
    };

    const handleSelectSaved = (endpoint: SavedEndpoint) => {
        setApiUrl(endpoint.apiUrl);
        setEwmrsUrl(endpoint.ewmrsUrl);
        setShowSavedDropdown(false);
    };

    const handleRemoveSaved = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        removeEndpoint(id);
        setSavedEndpoints(getSavedEndpoints());
    };

    return (
        <div className="h-full flex flex-col bg-[#09090b] text-gray-200 w-full overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-40 bg-blue-500/5 blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 p-6 border-b border-white/5 relative z-10">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Wifi className="text-blue-400" size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Connection</h2>
                    <p className="text-xs text-blue-200/40 font-mono">SYSTEM UPLINK</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
                {/* Status Card */}
                <div className={`relative p-5 rounded-2xl border transition-all duration-300 ${isConnected ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <div className={`absolute inset-0 opacity-20 blur-xl ${isConnected ? 'bg-emerald-500/10' : 'bg-red-500/10'}`} />
                    <div className="relative flex items-center gap-4">
                        <div className={`p-3 rounded-full ${isConnected ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]' : 'bg-red-500/10 text-red-400 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]'}`}>
                            {isConnected ? <ShieldCheck size={24} /> : <Activity size={24} />}
                        </div>
                        <div>
                            <div className={`font-bold text-base ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isConnected ? 'System Online' : 'Disconnected'}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono mt-0.5 opacity-70">
                                {isConnected ? 'SECURE CONNECTION ESTABLISHED' : 'NO UPLINK DETECTED'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Saved Endpoints Dropdown */}
                {savedEndpoints.length > 0 && (
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowSavedDropdown(!showSavedDropdown)}
                            className={`w-full flex items-center justify-between gap-2 bg-white/[0.03] border border-white/10 text-blue-400 rounded-xl px-4 py-3 text-sm hover:bg-white/[0.05] hover:border-blue-500/30 transition-all group ${showSavedDropdown ? 'border-blue-500/40 bg-white/[0.08]' : ''}`}
                        >
                            <div className="flex items-center gap-2.5">
                                <Clock size={14} className="group-hover:text-blue-300 transition-colors" />
                                <span className="font-medium text-gray-300 group-hover:text-white transition-colors">Load Config</span>
                                <span className="bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.5 rounded ml-1">{savedEndpoints.length}</span>
                            </div>
                            <ChevronDown size={14} className={`transform transition-transform duration-300 ${showSavedDropdown ? 'rotate-180 text-blue-400' : 'text-gray-500'}`} />
                        </button>

                        {showSavedDropdown && (
                            <div className="absolute z-20 w-full mt-2 bg-[#0c0e12] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                {savedEndpoints.map((endpoint) => (
                                    <div
                                        key={endpoint.id}
                                        onClick={() => handleSelectSaved(endpoint)}
                                        className="flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 group"
                                    >
                                        <div className="flex-1 min-w-0 mr-2">
                                            <div className="text-sm font-medium text-gray-200 group-hover:text-blue-400 transition-colors">{endpoint.name}</div>
                                            <div className="text-[10px] text-gray-500 font-mono truncate">{endpoint.apiUrl}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => handleRemoveSaved(e, endpoint.id)}
                                            className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                            title="Remove saved endpoint"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Form */}
                <div className="space-y-5">
                    {/* Core Endpoint Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                            <Globe size={10} className="text-blue-400" /> Core Endpoint
                        </label>
                        <div className={`relative transition-all duration-300 rounded-xl overflow-hidden group ${activeField === 'api' ? 'ring-2 ring-blue-500/30' : 'hover:ring-1 hover:ring-white/10'}`}>
                            <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center bg-white/[0.02] border-r border-white/5">
                                <Server size={14} className={`transition-colors ${activeField === 'api' ? 'text-blue-400' : 'text-gray-600'}`} />
                            </div>
                            <input
                                type="text"
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                                onFocus={() => setActiveField('api')}
                                onBlur={() => setActiveField(null)}
                                placeholder="http://localhost:5000"
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-3 py-3 text-xs font-mono text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-blue-500/40 focus:bg-blue-500/[0.02] transition-all"
                            />
                        </div>
                    </div>

                    {/* EWMRS Endpoint Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                            <Cpu size={10} className="text-purple-400" /> Processing Unit
                        </label>
                        <div className={`relative transition-all duration-300 rounded-xl overflow-hidden group ${activeField === 'ewmrs' ? 'ring-2 ring-purple-500/30' : 'hover:ring-1 hover:ring-white/10'}`}>
                            <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center bg-white/[0.02] border-r border-white/5">
                                <ShieldCheck size={14} className={`transition-colors ${activeField === 'ewmrs' ? 'text-purple-400' : 'text-gray-600'}`} />
                            </div>
                            <input
                                type="text"
                                value={ewmrsUrl}
                                onChange={(e) => setEwmrsUrl(e.target.value)}
                                onFocus={() => setActiveField('ewmrs')}
                                onBlur={() => setActiveField(null)}
                                placeholder="http://localhost:3003"
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-3 py-3 text-xs font-mono text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-purple-500/40 focus:bg-purple-500/[0.02] transition-all"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleConnectClick}
                        disabled={loading}
                        className={`w-full group relative py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden
                            ${loading
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'text-white shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02]'
                            }`}
                    >
                        {!loading && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                        )}

                        <div className="relative flex items-center gap-2">
                            {loading ? (
                                <>
                                    <div className="h-3 w-3 rounded-full border-2 border-gray-600 border-t-gray-400 animate-spin" />
                                    <span>Establishing Link...</span>
                                </>
                            ) : (
                                <>
                                    {isConnected ? 'Re-Initialize Link' : 'Initialize Link'}
                                    <Zap size={14} className={`${isConnected ? 'text-emerald-300' : 'text-blue-300'} group-hover:text-white transition-colors`} />
                                </>
                            )}
                        </div>
                    </button>

                    {error && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3">
                                <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={14} />
                                <div className="min-w-0">
                                    <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-0.5">Connection Failed</h4>
                                    <div className="text-[11px] text-red-300/80 font-mono break-words leading-relaxed">
                                        {error}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
