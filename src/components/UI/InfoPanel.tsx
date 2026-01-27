import React, { memo } from 'react';
import { Info, Github, BookOpen } from 'lucide-react';
import Link from 'next/link';

function InfoPanel() {
    return (
        <div className="h-full flex flex-col bg-gray-900 border-l border-white/10 w-full overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-8">
                
                {/* Header */}
                <div className="flex items-center gap-3 pb-6 border-b border-white/10">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                        <Info className="text-blue-400 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Information</h2>
                        <p className="text-xs text-gray-400">About EdgeWARN</p>
                    </div>
                </div>

                {/* About Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">About</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        EdgeWARN is a specialized severe weather nowcasting visualization platform. 
                        It provides interactive, time-indexed visualization of weather radar data, 
                        storm tracks, NWS alerts, and other meteorological products.
                    </p>
                </div>

                {/* Features Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Key Features</h3>
                    <ul className="space-y-3">
                        {[
                            'Real-time Radar Visualization',
                            'Interactive Storm Tracking',
                            'NWS Warnings & Watches',
                            'Time-indexed Playback Control',
                            'Customizable Map Layers'
                        ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Links Section */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Resources</h3>
                    <div className="grid grid-cols-1 gap-3">
                        <a 
                            href="https://github.com/ewsofficial/EdgeWARN-Core" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                        >
                            <Github className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                            <div>
                                <div className="text-sm font-medium text-gray-200 group-hover:text-white">GitHub</div>
                                <div className="text-xs text-gray-500">View Source Code</div>
                            </div>
                        </a>
                        <Link 
                            href="/coming-soon" 
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                        >
                            <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                            <div>
                                <div className="text-sm font-medium text-gray-200 group-hover:text-white">Documentation</div>
                                <div className="text-xs text-gray-500">User Guides & API Docs</div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-8 mt-auto text-center">
                    <p className="text-xs text-gray-600">
                        &copy; {new Date().getFullYear()} Edgemont Weather Service
                    </p>
                    <p className="text-[10px] text-gray-700 mt-1">
                        v0.1.0-beta
                    </p>
                </div>
            </div>
        </div>
    );
}

export default memo(InfoPanel);
