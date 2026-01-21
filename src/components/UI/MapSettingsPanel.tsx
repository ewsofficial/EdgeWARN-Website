import React, { useState } from 'react';
import { Layers, Eye, EyeOff, ChevronDown, ChevronRight, Wind, CloudHail, Tornado, Waves, CloudRain, ArrowUpFromLine, Droplets, Activity, Thermometer, AlertTriangle } from 'lucide-react';

interface MapSettingsPanelProps {
    products: string[];
    activeLayers: Record<string, { opacity: number; visible: boolean }>;
    onLayerToggle: (product: string) => void;
    onOpacityChange: (product: string, opacity: number) => void;
    showSpcOutlook?: boolean;
    onToggleSpcOutlook?: () => void;
    showSpcTornado?: boolean;
    onToggleSpcTornado?: () => void;
    showSpcHail?: boolean;
    onToggleSpcHail?: () => void;
    showSpcWind?: boolean;
    onToggleSpcWind?: () => void;
    showMetar?: boolean;
    onToggleMetar?: () => void;
    showNWSAlerts?: boolean;
    onToggleNWSAlerts?: () => void;
}

// Maps product names to human-readable display names
function getProductDisplayName(product: string): string {
    const staticMappings: Record<string, string> = {
        'CompRefQC': 'Composite Reflectivity',
        'RALA': 'Reflectivity at Lowest Altitude',
        'PrecipRate': 'Precip. Rate',
        'VILDensity': 'VIL Density',
        'QPE_01H': '1-Hour Precipitation',
        'VII': 'Vertically Integrated Ice',
    };

    // Check static mappings first
    if (staticMappings[product]) {
        return staticMappings[product];
    }

    // Handle EchoTop[N] pattern
    const echoTopMatch = product.match(/^EchoTop(\d+)$/);
    if (echoTopMatch) {
        return `${echoTopMatch[1]}-dBZ Echo Tops`;
    }

    // Fallback to original product name
    return product;
}

// Maps product names to Lucide icons
function getProductIcon(product: string): React.ElementType {
    const p = product.toLowerCase();

    if (p.includes('ref')) return Waves;
    if (p.includes('precip') || p.includes('qpe')) return CloudRain;
    if (p.includes('echotop')) return ArrowUpFromLine;
    if (p.includes('vil') || p.includes('vii')) return CloudHail;

    return Activity; // Default fallback
}

export default function MapSettingsPanel({
    products,
    activeLayers,
    onLayerToggle,
    onOpacityChange,
    showSpcOutlook = false,
    onToggleSpcOutlook,
    showSpcTornado = false,
    onToggleSpcTornado,
    showSpcHail = false,
    onToggleSpcHail,
    showSpcWind = false,
    onToggleSpcWind,
    showMetar = false,
    onToggleMetar,
    showNWSAlerts = false,
    onToggleNWSAlerts,
}: MapSettingsPanelProps) {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        'spc': true,
        'radar': true,
        'surface': true
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const OverlayItem = ({
        label,
        active,
        onToggle,
        colorClass,
        icon: Icon
    }: {
        label: string;
        active: boolean;
        onToggle?: () => void;
        colorClass: string;
        icon?: React.ElementType;
    }) => (
        <div className={`p-3 rounded-lg border transition-all duration-200 ${active ? `bg-${colorClass}-900/20 border-${colorClass}-500/30 shadow-inner` : 'hover:bg-gray-800/50 border-transparent text-gray-400'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {Icon ? <Icon size={16} className={active ? `text-${colorClass}-400` : 'text-gray-600'} /> :
                        <div className={`w-1.5 h-1.5 rounded-full ${active ? `bg-${colorClass}-500 shadow-[0_0_8px_rgba(var(--${colorClass}-rgb),0.6)]` : 'bg-gray-600'}`} />}
                    <span className={`text-sm font-medium ${active ? `text-${colorClass}-100` : 'text-gray-400'}`}>{label}</span>
                </div>
                <button
                    onClick={onToggle}
                    className={`p-1.5 rounded-md transition-all ${active ? `bg-${colorClass}-500/20 text-${colorClass}-400 hover:bg-${colorClass}-500/30` : 'text-gray-600 hover:text-gray-300 hover:bg-gray-700/50'}`}
                    disabled={!onToggle}
                    title={active ? "Hide Layer" : "Show Layer"}
                >
                    {active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-gray-900/95 text-gray-100 w-full backdrop-blur-sm">
            {/* Header */}
            <div className="flex-shrink-0 px-5 py-6 border-b border-gray-800 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Layers size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold tracking-tight">Map Layers</h2>
                    <p className="text-xs text-gray-500 font-medium">Configure visuals</p>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar px-3 py-4 space-y-6">

                {/* SPC Outlooks Section */}
                <div className="bg-gray-800/40 rounded-xl overflow-hidden border border-gray-800/50">
                    <button
                        onClick={() => toggleSection('spc')}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/60 hover:bg-gray-800 transition-colors group"
                    >
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-200">SPC Outlooks (Day 1)</span>
                        {openSections['spc'] ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                    </button>

                    {openSections['spc'] && (
                        <div className="p-2 space-y-1">
                            <OverlayItem
                                label="Categorical"
                                active={showSpcOutlook}
                                onToggle={onToggleSpcOutlook}
                                colorClass="green"
                            />
                            <OverlayItem
                                label="Tornado Prob."
                                active={showSpcTornado}
                                onToggle={onToggleSpcTornado}
                                colorClass="red"
                                icon={Tornado}
                            />
                            <OverlayItem
                                label="Hail Prob."
                                active={showSpcHail}
                                onToggle={onToggleSpcHail}
                                colorClass="blue"
                                icon={CloudHail}
                            />
                            <OverlayItem
                                label="Wind Prob."
                                active={showSpcWind}
                                onToggle={onToggleSpcWind}
                                colorClass="yellow"
                                icon={Wind}
                            />
                        </div>
                    )}
                </div>

                {/* Surface Data Section */}
                <div className="bg-gray-800/40 rounded-xl overflow-hidden border border-gray-800/50">
                    <button
                        onClick={() => toggleSection('surface')}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/60 hover:bg-gray-800 transition-colors group"
                    >
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-200">Surface Data</span>
                        {openSections['surface'] ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                    </button>

                    {openSections['surface'] && (
                        <div className="p-2 space-y-1">
                            <OverlayItem
                                label="METAR Stations"
                                active={!!showMetar}
                                onToggle={onToggleMetar}
                                colorClass="cyan"
                                icon={Thermometer}
                            />
                            <OverlayItem
                                label="NWS Alerts"
                                active={!!showNWSAlerts}
                                onToggle={onToggleNWSAlerts}
                                colorClass="amber"
                                icon={AlertTriangle}
                            />
                        </div>
                    )}
                </div>

                {/* Radar Products Section */}
                <div className="bg-gray-800/40 rounded-xl overflow-hidden border border-gray-800/50">
                    <button
                        onClick={() => toggleSection('radar')}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/60 hover:bg-gray-800 transition-colors group"
                    >
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-200">Radar Products</span>
                        {openSections['radar'] ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                    </button>

                    {openSections['radar'] && (
                        <div className="p-2 space-y-1">
                            {products.length === 0 && (
                                <div className="text-sm text-gray-500 italic text-center py-4">No products available</div>
                            )}

                            {products.map(product => {
                                const layerState = activeLayers[product] || { visible: false, opacity: 0.6 };
                                const isVisible = layerState.visible;
                                const displayName = getProductDisplayName(product);
                                const ProductIcon = getProductIcon(product);

                                return (
                                    <div key={product} className={`p-3 rounded-lg border transition-all duration-200 ${isVisible ? 'bg-blue-900/20 border-blue-500/30 shadow-inner' : 'hover:bg-gray-800/50 border-transparent text-gray-400'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <ProductIcon size={16} className={`flex-shrink-0 ${isVisible ? 'text-blue-400' : 'text-gray-600'}`} />
                                                <span className={`text-sm font-medium truncate pr-2 ${isVisible ? 'text-blue-100' : 'text-gray-400'}`} title={product}>{displayName}</span>
                                            </div>
                                            <button
                                                onClick={() => onLayerToggle(product)}
                                                className={`p-1.5 rounded-md transition-all flex-shrink-0 ${isVisible ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'text-gray-600 hover:text-gray-300 hover:bg-gray-700/50'}`}
                                                title={isVisible ? "Hide Layer" : "Show Layer"}
                                            >
                                                {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                        </div>

                                        {isVisible && (
                                            <div className="mt-3 px-1 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <div className="flex justify-between text-[10px] text-blue-300/70 font-medium uppercase tracking-wider">
                                                    <span>Opacity</span>
                                                    <span>{Math.round(layerState.opacity * 100)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={layerState.opacity * 100}
                                                    onChange={(e) => onOpacityChange(product, parseInt(e.target.value) / 100)}
                                                    className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Scrollbar Style */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.3);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(100, 116, 139, 0.5);
                }
            `}</style>
        </div>
    );
}
