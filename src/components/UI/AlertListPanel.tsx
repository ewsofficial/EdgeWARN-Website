'use client';

import React, { useState, memo, useMemo } from 'react';
import { AlertTriangle, ChevronRight, Filter } from 'lucide-react';
import { NWSAlertFeature } from '@/types';
import { getSeverityClasses } from '@/utils/styling';
import { Virtuoso } from 'react-virtuoso';

interface AlertListPanelProps {
    alerts: NWSAlertFeature[];
    onAlertClick: (alert: NWSAlertFeature) => void;
    onAlertHover: (alertId: string | null) => void;
}

function AlertListPanel({ alerts, onAlertClick, onAlertHover }: AlertListPanelProps) {
    const [selectedSeverity, setSelectedSeverity] = useState('All');
    
    // Sort logic from Page? Assuming input alerts are already sorted or we sort here.
    // Usually Page logic handled it. Let's just filter.
    const severities = ['All', 'Extreme', 'Severe', 'Moderate', 'Minor'];

    const filteredAlerts = useMemo(() => alerts.filter(a => 
        selectedSeverity === 'All' || (a.properties.severity || 'Unknown') === selectedSeverity
    ), [alerts, selectedSeverity]);

    return (
        <div className="h-full flex flex-col bg-gray-900 border-l border-white/10 w-full relative">
            
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-white/10 bg-gray-900 z-10">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="text-yellow-500" size={20} />
                    <h2 className="text-lg font-bold text-white">Active Alerts</h2>
                    <span className="ml-auto text-xs bg-white/10 px-2 py-1 rounded-full text-gray-400">
                        {filteredAlerts.length}
                    </span>
                </div>

                {/* Severity Filter */}
                <div className="flex overflow-x-auto gap-2 pb-1 custom-scrollbar">
                    {severities.map(sev => {
                        const active = selectedSeverity === sev;
                        // Use logic from Page/Styling or simple consistent style
                        const colors = sev === 'All' ? { text: 'text-white', bg: 'bg-slate-700' } : getSeverityClasses(sev);
                        
                        return (
                            <button
                                key={sev}
                                onClick={() => setSelectedSeverity(sev)}
                                className={`
                                    px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all
                                    ${active 
                                        ? 'bg-white text-black shadow-sm' 
                                        : `bg-white/5 text-gray-400 hover:text-white hover:bg-white/10`}
                                `}
                            >
                                {sev}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 min-h-0 bg-gray-900/50">
                {filteredAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-2">
                        <Filter size={24} className="opacity-50" />
                        <span className="text-sm">No alerts match filter</span>
                    </div>
                ) : (
                    <Virtuoso
                        data={filteredAlerts}
                        style={{ height: '100%' }}
                        itemContent={(index, alert) => {
                            const props = alert.properties;
                            const colors = getSeverityClasses(props.severity);
                            
                            return (
                                <div className="p-2">
                                    <div
                                        onClick={() => onAlertClick(alert)}
                                        onMouseEnter={() => onAlertHover(alert.id as string)}
                                        onMouseLeave={() => onAlertHover(null)}
                                        className={`
                                            group relative overflow-hidden rounded-lg border ${colors.border} ${colors.bg} 
                                            hover:brightness-110 cursor-pointer transition-all duration-200
                                            active:scale-[0.99]
                                        `}
                                    >
                                        <div className="p-3">
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <h3 className="font-bold text-white text-sm leading-tight group-hover:underline decoration-white/30 underline-offset-2">
                                                    {props.event}
                                                </h3>
                                                <ChevronRight size={14} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${colors.badge} ${colors.text}`}>
                                                    {props.severity}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-mono">
                                                    {props.urgency}
                                                </span>
                                            </div>

                                            <p className="text-gray-400 text-xs line-clamp-2">
                                                {props.headline?.length > 10 ? props.headline : props.areaDesc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default memo(AlertListPanel);
