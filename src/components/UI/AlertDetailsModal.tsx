'use client';

import { NWSAlertFeature } from '@/types';
import { getSeverityClasses } from '@/utils/styling';
import { X, Calendar, Map as MapIcon, Info, Users } from 'lucide-react';
import { useEffect } from 'react';

interface AlertDetailsModalProps {
    isOpen: boolean;
    feature: NWSAlertFeature | null;
    onClose: () => void;
}

export default function AlertDetailsModal({ isOpen, feature, onClose }: AlertDetailsModalProps) {
    // ESC key close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen || !feature) return null;

    const props = feature.properties;
    const colors = getSeverityClasses(props.severity);

    const formatTime = (iso: string) => {
        try {
            return new Date(iso).toLocaleString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', 
                hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
            });
        } catch { return iso; }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
             {/* Backdrop */}
             <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
                onClick={onClose}
             />
             
             {/* Modal */}
             <div className={`relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-[#0c1218] border ${colors.border} rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-200 overflow-hidden ring-1 ring-white/10`}>
                
                {/* Header */}
                <div className={`flex-shrink-0 px-6 py-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent flex items-start justify-between gap-4 select-text`}>
                    <div>
                         <div className="flex items-center gap-3 mb-1">
                             <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border border-current ${colors.text} ${colors.badge}`}>
                                 {props.severity}
                             </span>
                             <span className="text-slate-400 text-xs font-mono uppercase">
                                {props.status} • {props.urgency}
                             </span>
                         </div>
                         <h2 className="text-2xl font-bold text-white leading-tight">{props.event}</h2>
                         <p className="text-slate-400 text-sm mt-1">{props.headline}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6 select-text">
                    
                    {/* Meta Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col gap-1">
                             <div className="flex items-center gap-2 text-slate-400 mb-1">
                                 <Calendar size={14} />
                                 <span className="uppercase text-xs font-bold">Effective</span>
                             </div>
                             <div className="text-white font-mono">{formatTime(props.effective)}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col gap-1">
                             <div className="flex items-center gap-2 text-slate-400 mb-1">
                                 <Calendar size={14} className="text-red-400" />
                                 <span className="uppercase text-xs font-bold">Expires</span>
                             </div>
                             <div className="text-white font-mono">{formatTime(props.expires)}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col gap-1 md:col-span-2">
                             <div className="flex items-center gap-2 text-slate-400 mb-1">
                                 <Users size={14} />
                                 <span className="uppercase text-xs font-bold">Sender</span>
                             </div>
                             <div className="text-white">{props.senderName}</div>
                        </div>
                    </div>

                    {/* Areas */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                            <MapIcon size={14} />
                            Affected Areas
                        </h3>
                        <div className="p-3 bg-black/30 rounded-lg border border-white/5 text-slate-300 text-sm leading-relaxed">
                            {props.areaDesc}
                        </div>
                    </div>

                    {/* Description */}
                    {props.description && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                                <Info size={14} />
                                Details
                            </h3>
                            <pre className="p-4 bg-black/40 rounded-lg border border-white/10 text-slate-300 text-sm font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                                {props.description}
                            </pre>
                        </div>
                    )}

                    {/* Instructions */}
                    {props.instruction && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-yellow-500/80 uppercase tracking-wide flex items-center gap-2">
                                <AlertTriangle size={14} />
                                Instructions
                            </h3>
                            <pre className="p-4 bg-yellow-950/10 rounded-lg border border-yellow-500/20 text-yellow-100/90 text-sm font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                                {props.instruction}
                            </pre>
                        </div>
                    )}

                </div>
             </div>
        </div>
    );
}

// Helper icon
function AlertTriangle({ size, className }: { size?: number, className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size || 24} 
            height={size || 24} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    )
}
