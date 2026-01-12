'use client';

import React, { useState, useEffect } from 'react';

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

    // Sync state if props change (though usually these are just initials)
    useEffect(() => {
        setApiUrl(initialApiUrl);
        setEwmrsUrl(initialEwmrsUrl);
    }, [initialApiUrl, initialEwmrsUrl]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConnect(apiUrl, ewmrsUrl);
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6 relative overflow-hidden">
                {/* Decorative top bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                <h2 className="text-2xl font-bold text-white mb-2">Connect to Server</h2>
                <p className="text-gray-400 text-sm mb-6">Enter the API endpoints to initialize the connection.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            Core API URL
                        </label>
                        <input
                            type="text"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            placeholder="http://localhost:5000"
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            EWMRS API URL
                        </label>
                        <input
                            type="text"
                            value={ewmrsUrl}
                            onChange={(e) => setEwmrsUrl(e.target.value)}
                            placeholder="http://localhost:3003"
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3">
                            <p className="text-red-400 text-xs flex items-start gap-2">
                                <span className="font-bold">Error:</span> {error}
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`
                            w-full mt-2 py-3 px-4 rounded-lg font-semibold text-white
                            bg-gradient-to-r from-blue-600 to-blue-700
                            hover:from-blue-500 hover:to-blue-600
                            focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500
                            disabled:opacity-50 disabled:cursor-wait
                            transform transition-all active:scale-[0.98]
                            flex items-center justify-center gap-2
                        `}
                    >
                        {loading && (
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? 'Connecting...' : 'Connect System'}
                    </button>
                </form>
            </div>
        </div>
    );
}
