'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, Code, User, Search, X } from 'lucide-react';
import membersConfig from '../../../members_config.json';

interface Developer {
    id: string;
    name: string;
    role: string;
}

interface MembersConfig {
    developers: Developer[];
}

export default function HomeDevelopersPanel() {
    const [developers, setDevelopers] = useState<Developer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Load from config file on mount
    useEffect(() => {
        const config = membersConfig as MembersConfig;
        if (config.developers && Array.isArray(config.developers) && config.developers.length > 0) {
            setDevelopers(config.developers);
        }
    }, []);

    // Filter developers based on search query
    const filteredDevelopers = developers.filter(dev =>
        dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-on-scroll fade-in fade-in-delay-4 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Meet the Team
                </h3>

                {/* Search bar */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search developers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredDevelopers.map((dev, index) => (
                    <div
                        key={`${dev.id}-${index}`}
                        className="group relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:-translate-y-1 flex flex-col items-center text-center"
                    >
                        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600/30 via-blue-500/30 to-cyan-500/30 border border-white/20 flex items-center justify-center flex-shrink-0 text-purple-300 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 mb-3">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <User size={36} strokeWidth={1.5} />
                        </div>
                        <div className="w-full">
                            <div className="text-sm font-bold text-gray-100 truncate">{dev.name}</div>
                            <div className="text-xs text-purple-300 font-medium flex items-center justify-center gap-1.5 uppercase tracking-wide mt-1">
                                <Code size={10} />
                                {dev.role}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search results count */}
            {searchQuery && (
                <div className="text-center mt-4 text-sm text-slate-400">
                    Found {filteredDevelopers.length} developer{filteredDevelopers.length !== 1 ? 's' : ''}
                </div>
            )}

            {/* No results */}
            {filteredDevelopers.length === 0 && searchQuery && (
                <div className="text-center py-12 text-slate-500 italic border border-dashed border-white/10 rounded-xl bg-black/20">
                    No developers found matching "{searchQuery}"
                </div>
            )}

            {/* No developers at all */}
            {developers.length === 0 && (
                    <div className="text-center py-12 text-slate-500 italic border border-dashed border-white/10 rounded-xl bg-black/20">
                    No team members listed yet.
                </div>
            )}
        </div>
    );
}
