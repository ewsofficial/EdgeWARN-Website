'use client';

import React, { useState, useEffect } from 'react';
import { getSavedEndpoints, removeEndpoint, SavedEndpoint } from '@/utils/endpoint-cache';
import { ChevronDown, Trash2, Clock, Server, Activity, ShieldCheck } from 'lucide-react';

interface ConnectionModalProps {
    isOpen: boolean;
    loading: boolean;
    error: string | null;
    initialApiUrl: string;
    initialEwmrsUrl: string;
    onConnect: (apiUrl: string, ewmrsUrl: string) => void;
}

export default function ConnectionModal({
    isOpen,
    loading,
    error,
    initialApiUrl,
    initialEwmrsUrl,
    onConnect
}: ConnectionModalProps) {
    const [apiUrl, setApiUrl] = useState(initialApiUrl);
    const [ewmrsUrl, setEwmrsUrl] = useState(initialEwmrsUrl);
    const [savedEndpoints, setSavedEndpoints] = useState<SavedEndpoint[]>([]);
    const [showSavedDropdown, setShowSavedDropdown] = useState(false);

    // Load saved endpoints on mount
    useEffect(() => {
        setSavedEndpoints(getSavedEndpoints());
    }, []);

    // Update local state when initialApiUrl/initialEwmrsUrl change (from cache)
    useEffect(() => {
        setApiUrl(initialApiUrl);
    }, [initialApiUrl]);

    useEffect(() => {
        setEwmrsUrl(initialEwmrsUrl);
    }, [initialEwmrsUrl]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConnect(apiUrl, ewmrsUrl);
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

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-[480px] bg-[#0c1218]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.7)] p-8 relative overflow-hidden ring-1 ring-white/5">

                {/* Decorative Top Gradient */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>

                <div className="relative text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 mb-4 shadow-lg shadow-blue-500/5">
                        <Server className="w-6 h-6 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                        System Connection
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Configure your EdgeWARN and EWMRS endpoints
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 relative">
                    {/* Saved Endpoints Dropdown */}
                    {savedEndpoints.length > 0 && (
                        <div className="relative z-20">
                            <button
                                type="button"
                                onClick={() => setShowSavedDropdown(!showSavedDropdown)}
                                className="w-full flex items-center justify-between gap-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl px-4 py-3 text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Clock size={16} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
                                    <span className="font-medium">Load Saved Configuration</span>
                                    <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-gray-400">{savedEndpoints.length}</span>
                                </div>
                                <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${showSavedDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showSavedDropdown && (
                                <div className="absolute z-50 w-full mt-2 bg-[#1a1f26] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                                        {savedEndpoints.map((endpoint) => (
                                            <div
                                                key={endpoint.id}
                                                onClick={() => handleSelectSaved(endpoint)}
                                                className="flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 group transition-colors"
                                            >
                                                <div className="flex-1 min-w-0 mr-3">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-sm font-medium text-gray-200 truncate">{endpoint.name}</span>
                                                    </div>
                                                    <div className="text-[11px] font-mono text-gray-500 truncate mb-0.5">{endpoint.apiUrl}</div>
                                                    <div className="text-[10px] text-gray-600">{formatTimestamp(endpoint.lastUsed)}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleRemoveSaved(e, endpoint.id)}
                                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    title="Remove saved endpoint"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">
                                <Activity size={12} className="text-blue-400" />
                                Core API Endpoint
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={apiUrl}
                                    onChange={(e) => setApiUrl(e.target.value)}
                                    placeholder="http://localhost:5000"
                                    className="w-full bg-black/20 border border-white/10 text-gray-200 rounded-xl px-4 py-3.5 text-sm font-mono focus:outline-none focus:border-blue-500/50 focus:bg-blue-900/10 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">
                                <ShieldCheck size={12} className="text-purple-400" />
                                EWMRS Endpoint
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={ewmrsUrl}
                                    onChange={(e) => setEwmrsUrl(e.target.value)}
                                    placeholder="http://localhost:3003"
                                    className="w-full bg-black/20 border border-white/10 text-gray-200 rounded-xl px-4 py-3.5 text-sm font-mono focus:outline-none focus:border-purple-500/50 focus:bg-purple-900/10 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-gray-700"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm animate-in zoom-in-95 duration-200">
                            <div className="flex items-start gap-3">
                                <div className="p-1 bg-red-500/20 rounded-full">
                                    <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-red-400 text-xs font-bold uppercase tracking-wide mb-0.5">Connection Error</h4>
                                    <p className="text-red-300/80 text-xs leading-relaxed">
                                        {error}
                                    </p>
                                    {error.includes('open the API URL') && (
                                        <div className="mt-3 flex gap-2 flex-wrap">
                                            <button 
                                                type="button"
                                                onClick={() => window.open(apiUrl, '_blank')}
                                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold rounded-lg transition-colors border border-red-500/20"
                                            >
                                                Open Core API
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => window.open(ewmrsUrl, '_blank')}
                                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold rounded-lg transition-colors border border-red-500/20"
                                            >
                                                Open EWMRS
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`
                            w-full mt-2 py-4 px-6 rounded-xl font-bold text-sm text-white tracking-wide uppercase
                            bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600
                            hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.01]
                            focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0c1218] focus:ring-blue-500
                            disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100 disabled:hover:shadow-none
                            transform transition-all duration-200 bg-[length:200%_auto]
                            flex items-center justify-center gap-2 group border border-white/10
                        `}
                        style={{
                            backgroundSize: '200% auto',
                        }}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-white">Establishing Link...</span>
                            </>
                        ) : (
                            <>
                                Initialize Connection
                                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer status indicators */}
                <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
                    <div className="flex items-center gap-1.5" title="Secure Connection">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-mono text-emerald-500">SECURE</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Low Latency">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] font-mono text-blue-500">READY</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

