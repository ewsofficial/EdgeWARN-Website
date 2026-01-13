'use client';

import React, { useState } from 'react';

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

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConnect(apiUrl, ewmrsUrl);
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 relative overflow-hidden ring-1 ring-white/5 mx-4">
                
                {/* Subtle glow effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-sm"></div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-2 font-display">
                        EdgeWARN
                    </h2>
                    <p className="text-gray-400 text-sm font-medium tracking-wide uppercase opacity-80">
                        System Connection
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                            Core API Endpoint
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                                placeholder="http://localhost:5000"
                                className="w-full bg-black/40 border border-white/10 text-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-700 hover:border-white/20"
                            />
                            {/* Input highlight on focus/hover */}
                            <div className="absolute inset-0 rounded-lg bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                            EWMRS Endpoint
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={ewmrsUrl}
                                onChange={(e) => setEwmrsUrl(e.target.value)}
                                placeholder="http://localhost:3003"
                                className="w-full bg-black/40 border border-white/10 text-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-700 hover:border-white/20"
                            />
                             <div className="absolute inset-0 rounded-lg bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 backdrop-blur-sm animate-in zoom-in-95 duration-200">
                            <p className="text-red-400 text-xs flex items-center gap-2 font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {error}
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`
                            w-full mt-4 py-3.5 px-4 rounded-xl font-bold text-sm text-white tracking-wide uppercase
                            bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600
                            hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.01]
                            focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500
                            disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100
                            transform transition-all duration-200 background-animate bg-[length:200%_auto]
                            flex items-center justify-center gap-2 group
                        `}
                        style={{
                            backgroundSize: '200% auto',
                        }}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white/80" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-white/80">Connecting...</span>
                            </>
                        ) : (
                            <>
                                Initialize System
                                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </>
                        )}
                    </button>
                </form>
                
                {/* Footer decorations */}
                <div className="mt-6 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-30">
                        <div className="h-1 w-1 rounded-full bg-white"></div>
                        <div className="h-1 w-1 rounded-full bg-white"></div>
                        <div className="h-1 w-1 rounded-full bg-white"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add simple CSS animation for the button gradient if not present globally
// In a real app, this would be in global CSS or Tailwind config
