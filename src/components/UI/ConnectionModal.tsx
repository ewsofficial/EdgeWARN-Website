'use client';

import React, { useState, useEffect } from 'react';
import { getSavedEndpoints, removeEndpoint, SavedEndpoint } from '@/utils/endpoint-cache';
import { ChevronDown, Trash2, Clock, Server, Activity, ShieldCheck, Zap, Globe, Cpu } from 'lucide-react';

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
    const [activeField, setActiveField] = useState<string | null>(null);

    // Load saved endpoints on mount
    useEffect(() => {
        setSavedEndpoints(getSavedEndpoints());
    }, []);

    // Update local state when initialApiUrl/initialEwmrsUrl change (from cache)
    useEffect(() => {
        setApiUrl(initialApiUrl);
    }, [initialApiUrl]);

    const [isVisible, setIsVisible] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setEwmrsUrl(initialEwmrsUrl);
    }, [initialEwmrsUrl]);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setShowSuccess(false);
        } else {
            // connection established (isOpen -> false)
            if (isVisible) {
                setShowSuccess(true);
                const timer = setTimeout(() => {
                    setIsVisible(false);
                    setShowSuccess(false);
                }, 2000); // Show success for 2 seconds
                return () => clearTimeout(timer);
            }
        }
    }, [isOpen, isVisible]);

    if (!isVisible && !isOpen) return null;

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



    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center overflow-hidden">
            {/* Ultra-modern Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl transition-all duration-700 animate-in fade-in duration-500">
                {/* Animated Background Gradients */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
                
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            </div>

            {/* Main Modal Container */}
            <div className="relative w-full max-w-[500px] m-4 perspective-1000 group/modal animate-in slide-in-from-bottom-12 fade-in duration-700 delay-100 fill-mode-forwards">
                <div className={`relative bg-[#09090b]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_0_100px_-20px_rgba(59,130,246,0.3)] overflow-hidden transition-all duration-500 hover:shadow-[0_0_120px_-20px_rgba(59,130,246,0.4)] hover:border-white/20 ${showSuccess ? 'ring-2 ring-emerald-500/50' : ''}`}>
                    
                    {/* Top Lighting Effect */}
                    <div className="absolute inset-x-0 h-px top-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50"></div>
                    <div className="absolute inset-x-0 h-[100px] top-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent opacity-50 blur-xl pointer-events-none"></div>

                    {showSuccess ? (
                         <div className="p-12 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
                             <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center ring-1 ring-emerald-500/30 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
                                 <ShieldCheck className="w-10 h-10 text-emerald-400" />
                             </div>
                             <div>
                                 <h2 className="text-2xl font-bold text-white mb-2">System Online</h2>
                                 <p className="text-emerald-200/50 font-mono text-sm">SECURE CONNECTION ESTABLISHED</p>
                             </div>
                             <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-emerald-500 w-full animate-[shrink_2s_linear]"></div>
                             </div>
                         </div>
                    ) : ( 
                    <div className="relative p-8 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Header Section */}
                        <div className="text-center space-y-4">
                            <div className="relative inline-flex items-center justify-center">
                                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse-slow"></div>
                                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a1f2e] to-[#0d1016] border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/5">
                                    <Globe className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                                </div>
                            </div>
                            
                            <div>
                                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 tracking-tight">
                                    System Uplink
                                </h2>
                                <p className="text-blue-200/40 text-sm mt-1 font-mono tracking-wide">
                                    ESTABLISH SECURE CONNECTION
                                </p>
                            </div>
                        </div>

                        {/* Form Section */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Saved Configs (Dropdown) */}
                            {savedEndpoints.length > 0 && (
                                <div className="relative z-20">
                                    <button
                                        type="button"
                                        onClick={() => setShowSavedDropdown(!showSavedDropdown)}
                                        className={`
                                            w-full flex items-center justify-between gap-3 bg-white/[0.03] 
                                            border border-white/10 text-gray-300 rounded-xl px-4 py-3.5 
                                            text-sm transition-all duration-300 group hover:bg-white/[0.06] hover:border-blue-500/30 hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]
                                            ${showSavedDropdown ? 'bg-white/[0.08] border-blue-500/40' : ''}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                                                <Clock size={14} />
                                            </div>
                                            <span className="font-medium tracking-wide">Load Configuration</span>
                                            <span className="bg-white/10 text-[10px] font-mono px-2 py-0.5 rounded-md text-gray-400">{savedEndpoints.length}</span>
                                        </div>
                                        <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${showSavedDropdown ? 'rotate-180 text-blue-400' : ''}`} />
                                    </button>

                                    {showSavedDropdown && (
                                        <div className="absolute z-50 w-full mt-2 bg-[#0c0e12] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 ring-1 ring-white/5">
                                            <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                                                {savedEndpoints.map((endpoint) => (
                                                    <div
                                                        key={endpoint.id}
                                                        onClick={() => handleSelectSaved(endpoint)}
                                                        className="flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 group transition-colors"
                                                    >
                                                        <div className="flex-1 min-w-0 mr-3">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className="text-sm font-medium text-gray-200 group-hover:text-blue-400 transition-colors">{endpoint.name}</span>
                                                            </div>
                                                            <div className="text-[11px] font-mono text-gray-500 truncate mb-0.5">{endpoint.apiUrl}</div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleRemoveSaved(e, endpoint.id)}
                                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* API Input */}
                                <div className="space-y-2 group">
                                    <label className="flex items-center gap-2 text-[11px] font-bold text-blue-300/60 uppercase tracking-widest pl-1">
                                        <Activity size={10} className="text-blue-400" />
                                        Core Endpoint
                                    </label>
                                    <div className={`relative transition-all duration-300 rounded-xl overflow-hidden ${activeField === 'api' ? 'ring-2 ring-blue-500/50 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]' : ''}`}>
                                        <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center bg-white/[0.02] border-r border-white/5">
                                            <Server size={16} className={`transition-colors duration-300 ${activeField === 'api' ? 'text-blue-400' : 'text-gray-500'}`} />
                                        </div>
                                        <input
                                            type="text"
                                            value={apiUrl}
                                            onChange={(e) => setApiUrl(e.target.value)}
                                            onFocus={() => setActiveField('api')}
                                            onBlur={() => setActiveField(null)}
                                            placeholder="http://localhost:5000"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-14 pr-4 py-4 text-sm font-mono text-blue-100 placeholder:text-gray-700 focus:outline-none focus:border-blue-500/30 focus:bg-blue-500/[0.05] transition-all"
                                        />
                                    </div>
                                </div>

                                {/* EWMRS Input */}
                                <div className="space-y-2 group">
                                    <label className="flex items-center gap-2 text-[11px] font-bold text-purple-300/60 uppercase tracking-widest pl-1">
                                        <Cpu size={10} className="text-purple-400" />
                                        Processing Unit
                                    </label>
                                    <div className={`relative transition-all duration-300 rounded-xl overflow-hidden ${activeField === 'ewmrs' ? 'ring-2 ring-purple-500/50 shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]' : ''}`}>
                                        <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center bg-white/[0.02] border-r border-white/5">
                                            <ShieldCheck size={16} className={`transition-colors duration-300 ${activeField === 'ewmrs' ? 'text-purple-400' : 'text-gray-500'}`} />
                                        </div>
                                        <input
                                            type="text"
                                            value={ewmrsUrl}
                                            onChange={(e) => setEwmrsUrl(e.target.value)}
                                            onFocus={() => setActiveField('ewmrs')}
                                            onBlur={() => setActiveField(null)}
                                            placeholder="http://localhost:3003"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-14 pr-4 py-4 text-sm font-mono text-purple-100 placeholder:text-gray-700 focus:outline-none focus:border-purple-500/30 focus:bg-purple-500/[0.05] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="relative group overflow-hidden bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-in zoom-in-95 duration-300">
                                    <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                                    <div className="relative flex items-start gap-3">
                                        <div className="p-1.5 bg-red-500/20 rounded-lg shrink-0">
                                            <Activity className="w-4 h-4 text-red-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-red-400 text-xs font-bold uppercase tracking-wide mb-1">Connection Failed</h4>
                                            <p className="text-red-300/80 text-xs leading-relaxed font-mono">
                                                {error}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    relative w-full py-4 px-6 rounded-xl overflow-hidden group
                                    transition-all duration-300 transform
                                    ${loading ? 'cursor-wait opacity-80' : 'hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]'}
                                `}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 transition-all duration-300 ${loading ? 'animate-shimmer bg-[length:200%_auto]' : 'group-hover:bg-[length:200%_auto]'}`} style={{ backgroundSize: '200% auto' }}></div>
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[url('/noise.png')] mix-blend-overlay transition-opacity duration-300"></div>
                                
                                <div className="relative flex items-center justify-center gap-2.5">
                                    {loading ? (
                                        <>
                                            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                            <span className="text-white font-bold text-sm tracking-widest uppercase">Initializing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-white font-bold text-sm tracking-widest uppercase">Initialize System</span>
                                            <Zap size={16} className="text-blue-200 group-hover:text-yellow-300 transition-colors" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>

                        {/* Footer Status */}
                        <div className="flex items-center justify-center gap-6 pt-2 opacity-40">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                                <span className="text-[10px] font-mono font-bold text-emerald-500 tracking-wider">SECURE_LINK</span>
                            </div>
                            <div className="w-px h-3 bg-white/20"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                <span className="text-[10px] font-mono font-bold text-blue-500 tracking-wider">T_ENCRYPTED</span>
                            </div>
                        </div>

                    </div>
                    )}
                </div>
            </div>
        </div>
    );
}
