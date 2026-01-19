import React, { useState, useEffect } from 'react';
import { Wifi, Server, RefreshCw, CheckCircle, XCircle, Clock, ChevronDown, Trash2 } from 'lucide-react';
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

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="h-full flex flex-col bg-gray-800 text-gray-200 p-4 w-full">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-700 pb-4">
                <Wifi className="text-blue-400" size={20} />
                <h2 className="text-lg font-bold">Connection</h2>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto">
                {/* Status Card */}
                <div className={`p-4 rounded-xl border ${isConnected ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/10 border-red-500/20'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        {isConnected ? (
                            <CheckCircle className="text-green-400" size={24} />
                        ) : (
                            <XCircle className="text-red-400" size={24} />
                        )}
                        <div>
                            <div className={`font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                                {isConnected ? 'System Online' : 'Disconnected'}
                            </div>
                            <div className="text-xs text-gray-400">
                                {isConnected ? 'Communicating with EdgeWARN servers' : 'Waiting for connection...'}
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
                            className="w-full flex items-center justify-between gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg px-3 py-2 text-sm hover:bg-blue-600/30 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Clock size={14} />
                                <span>Saved ({savedEndpoints.length})</span>
                            </div>
                            <ChevronDown size={14} className={`transform transition-transform ${showSavedDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showSavedDropdown && (
                            <div className="absolute z-10 w-full mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                                {savedEndpoints.map((endpoint) => (
                                    <div
                                        key={endpoint.id}
                                        onClick={() => handleSelectSaved(endpoint)}
                                        className="flex items-center justify-between px-3 py-2 hover:bg-gray-700 cursor-pointer border-b border-gray-700/50 last:border-0 group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-200 truncate">{endpoint.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{endpoint.apiUrl}</div>
                                            <div className="text-xs text-gray-600">{formatTimestamp(endpoint.lastUsed)}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => handleRemoveSaved(e, endpoint.id)}
                                            className="ml-2 p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                                            title="Remove saved endpoint"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Server size={14} /> EdgeWARN API URL
                        </label>
                        <input
                            type="text"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            placeholder="http://localhost:5000"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Server size={14} /> EWMRS URL
                        </label>
                        <input
                            type="text"
                            value={ewmrsUrl}
                            onChange={(e) => setEwmrsUrl(e.target.value)}
                            placeholder="http://localhost:3003"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                        />
                    </div>

                    <button
                        onClick={handleConnectClick}
                        disabled={loading}
                        className={`w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg
                            ${loading
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/20'
                            }`}
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="animate-spin" size={16} /> Connecting...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={16} /> {isConnected ? 'Reconnect' : 'Connect'}
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="text-xs text-red-500 bg-red-900/10 border border-red-900/30 p-3 rounded-lg text-center break-words">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

