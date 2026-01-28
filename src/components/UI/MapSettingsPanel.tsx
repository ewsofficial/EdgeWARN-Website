import React, { useState } from 'react';
import { Layers, Eye, EyeOff, ChevronDown, ChevronRight, Wind, CloudHail, Tornado, Waves, CloudRain, ArrowUpFromLine, Droplets, Activity, Thermometer, AlertTriangle, Snowflake } from 'lucide-react';

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
    metarDisplayMode?: 'temperature' | 'dewpoint' | 'wind';
    onChangeMetarDisplayMode?: (mode: 'temperature' | 'dewpoint' | 'wind') => void;
    showNWSAlerts?: boolean;
    onToggleNWSAlerts?: () => void;
    showWpc?: boolean;
    onToggleWpc?: () => void;
    // WPC ERO
    showWpcEroDay1?: boolean;
    onToggleWpcEroDay1?: () => void;
    showWpcEroDay2?: boolean;
    onToggleWpcEroDay2?: () => void;
    showWpcEroDay3?: boolean;
    onToggleWpcEroDay3?: () => void;
    // WSSI
    showWssiDay1?: boolean;
    onToggleWssiDay1?: () => void;
    showWssiDay2?: boolean;
    onToggleWssiDay2?: () => void;
    showWssiDay3?: boolean;
    onToggleWssiDay3?: () => void;
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

// Layer Descriptions for Tooltips
const LAYER_DESCRIPTIONS: Record<string, string> = {
    // SPC
    'Categorical Outlook': 'SPC Day 1 Convective Outlook: Risks of severe thunderstorms (1-5 scale).',
    'Tornado Prob.': 'Probability of a tornado within 25 miles of a point.',
    'Hail Prob.': 'Probability of hail ≥ 1" within 25 miles of a point.',
    'Wind Prob.': 'Probability of damaging wind gusts ≥ 58 mph within 25 miles.',
    
    // WPC
    'ERO Day 1': 'Excessive Rainfall Outlook Day 1: Risk of rainfall exceeding flash flood guidance.',
    'ERO Day 2': 'Excessive Rainfall Outlook Day 2: Risk of rainfall exceeding flash flood guidance.',
    'ERO Day 3': 'Excessive Rainfall Outlook Day 3: Risk of rainfall exceeding flash flood guidance.',
    
    // Surface
    'METAR Stations': 'Real-time surface weather observations (Temp, Dewpoint, Wind) from airports/stations.',
    'NWS Alerts': 'Official Watches, Warnings, and Advisories issued by the NWS.',
    'WPC Surface Analysis': 'NWS WPC Surface Analysis: Fronts, Troughs, High/Low Pressure Centers.',
    
    // Winter
    'WSSI Day 1': 'Winter Storm Severity Index Day 1: Potential societal impacts from winter weather.',
    'WSSI Day 2': 'Winter Storm Severity Index Day 2: Potential societal impacts from winter weather.',
    'WSSI Day 3': 'Winter Storm Severity Index Day 3: Potential societal impacts from winter weather.',
};

function getProductDescription(product: string): string {
    const p = product.toLowerCase();
    if (p.includes('compref')) return "Composite Reflectivity: Maximum radar echo from all angles.";
    if (p.includes('rala')) return "Reflectivity at Lowest Altitude: Precipitation intensity near ground.";
    if (p.includes('preciprate')) return "Estimated instantaneous precipitation rate.";
    if (p.includes('vil')) return "Vertically Integrated Liquid: Total water content in column (hail indicator).";
    if (p.includes('echotop')) return "Height of the highest radar echo (storm height).";
    if (p.includes('vii')) return "Vertically Integrated Ice: Estimated ice content.";
    if (p.includes('qpe')) return "Quantitative Precipitation Estimation: Estimated rainfall amount.";
    return "Weather Radar Product";
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
    showWpc = false,
    onToggleWpc,
    showWpcEroDay1 = false,
    onToggleWpcEroDay1,
    showWpcEroDay2 = false,
    onToggleWpcEroDay2,
    showWpcEroDay3 = false,
    onToggleWpcEroDay3,
    showWssiDay1 = false,
    onToggleWssiDay1,
    showWssiDay2 = false,
    onToggleWssiDay2,
    showWssiDay3 = false,
    onToggleWssiDay3,
    metarDisplayMode = 'dewpoint',
    onChangeMetarDisplayMode
}: MapSettingsPanelProps) {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        'outlooks': true,
        'radar': true,
        'surface': true,
        'winter': true
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
        icon: Icon,
        description
    }: {
        label: string;
        active: boolean;
        onToggle?: () => void;
        colorClass: string;
        icon?: React.ElementType;
        description?: string;
    }) => (
        <div 
            title={description || label}
            className={`p-3 rounded-lg border transition-all duration-200 ${active ? `bg-${colorClass}-900/20 border-${colorClass}-500/30 shadow-inner` : 'hover:bg-gray-800/50 border-transparent text-gray-400'}`}
        >
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

                {/* Outlooks Section (SPC + WPC ERO) */}
                <div className="bg-gray-800/40 rounded-xl overflow-hidden border border-gray-800/50">
                    <button
                        onClick={() => toggleSection('outlooks')}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/60 hover:bg-gray-800 transition-colors group"
                    >
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-200">Outlooks</span>
                        {openSections['outlooks'] ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                    </button>

                    {openSections['outlooks'] && (
                        <div className="p-2 space-y-1">
                            <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">SPC Storms</div>
                            <OverlayItem
                                label="Categorical Outlook"
                                active={showSpcOutlook}
                                onToggle={onToggleSpcOutlook}
                                colorClass="green"
                                description={LAYER_DESCRIPTIONS['Categorical Outlook']}
                            />
                            <OverlayItem
                                label="Tornado Prob."
                                active={showSpcTornado}
                                onToggle={onToggleSpcTornado}
                                colorClass="red"
                                icon={Tornado}
                                description={LAYER_DESCRIPTIONS['Tornado Prob.']}
                            />
                            <OverlayItem
                                label="Hail Prob."
                                active={showSpcHail}
                                onToggle={onToggleSpcHail}
                                colorClass="blue"
                                icon={CloudHail}
                                description={LAYER_DESCRIPTIONS['Hail Prob.']}
                            />
                            <OverlayItem
                                label="Wind Prob."
                                active={showSpcWind}
                                onToggle={onToggleSpcWind}
                                colorClass="yellow"
                                icon={Wind}
                                description={LAYER_DESCRIPTIONS['Wind Prob.']}
                            />

                            <div className="mt-3 px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-t border-gray-800 pt-3">WPC Rainfall</div>
                            <OverlayItem
                                label="ERO Day 1"
                                active={showWpcEroDay1}
                                onToggle={onToggleWpcEroDay1}
                                colorClass="emerald"
                                icon={CloudRain}
                                description={LAYER_DESCRIPTIONS['ERO Day 1']}
                            />
                            <OverlayItem
                                label="ERO Day 2"
                                active={showWpcEroDay2}
                                onToggle={onToggleWpcEroDay2}
                                colorClass="teal"
                                icon={CloudRain}
                                description={LAYER_DESCRIPTIONS['ERO Day 2']}
                            />
                            <OverlayItem
                                label="ERO Day 3"
                                active={showWpcEroDay3}
                                onToggle={onToggleWpcEroDay3}
                                colorClass="cyan"
                                icon={CloudRain}
                                description={LAYER_DESCRIPTIONS['ERO Day 3']}
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
                                description={LAYER_DESCRIPTIONS['METAR Stations']}
                            />
                            {showMetar && onChangeMetarDisplayMode && (
                                <div className="ml-8 mb-2 p-2 bg-gray-900/40 rounded border border-gray-700/50 flex flex-col items-center">
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">Display Mode</div>
                                    <div className="flex gap-1 w-full max-w-[200px]">
                                        {['dewpoint', 'temperature', 'wind'].map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => onChangeMetarDisplayMode(mode as any)}
                                                className={`flex-1 px-2 py-1 text-[10px] rounded uppercase font-medium transition-colors ${
                                                    metarDisplayMode === mode
                                                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                                        : 'bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-gray-300'
                                                }`}
                                            >
                                                {mode === 'dewpoint' ? 'Dewpt' : mode === 'temperature' ? 'Temp' : 'Wind'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <OverlayItem
                                label="NWS Alerts"
                                active={!!showNWSAlerts}
                                onToggle={onToggleNWSAlerts}
                                colorClass="amber"
                                icon={AlertTriangle}
                                description={LAYER_DESCRIPTIONS['NWS Alerts']}
                            />
                            <OverlayItem
                                label="WPC Surface Analysis"
                                active={!!showWpc}
                                onToggle={onToggleWpc}
                                colorClass="indigo"
                                icon={Activity}
                                description={LAYER_DESCRIPTIONS['WPC Surface Analysis']}
                            />
                        </div>
                    )}
                </div>

                {/* Winter Weather Section */}
                <div className="bg-gray-800/40 rounded-xl overflow-hidden border border-gray-800/50">
                    <button
                        onClick={() => toggleSection('winter')}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/60 hover:bg-gray-800 transition-colors group"
                    >
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-200">Winter Weather</span>
                        {openSections['winter'] ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                    </button>

                    {openSections['winter'] && (
                        <div className="p-2 space-y-1">
                            <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Winter Storm Severity</div>
                            <OverlayItem
                                label="WSSI Day 1"
                                active={!!showWssiDay1}
                                onToggle={onToggleWssiDay1}
                                colorClass="blue"
                                icon={CloudHail}
                                description={LAYER_DESCRIPTIONS['WSSI Day 1']}
                            />
                            <OverlayItem
                                label="WSSI Day 2"
                                active={!!showWssiDay2}
                                onToggle={onToggleWssiDay2}
                                colorClass="indigo"
                                icon={CloudHail}
                                description={LAYER_DESCRIPTIONS['WSSI Day 2']}
                            />
                            <OverlayItem
                                label="WSSI Day 3"
                                active={!!showWssiDay3}
                                onToggle={onToggleWssiDay3}
                                colorClass="purple"
                                icon={CloudHail}
                                description={LAYER_DESCRIPTIONS['WSSI Day 3']}
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
                                const description = getProductDescription(product);

                                return (
                                    <div 
                                        key={product} 
                                        title={description}
                                        className={`p-3 rounded-lg border transition-all duration-200 ${isVisible ? 'bg-blue-900/20 border-blue-500/30 shadow-inner' : 'hover:bg-gray-800/50 border-transparent text-gray-400'}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <ProductIcon size={16} className={`flex-shrink-0 ${isVisible ? 'text-blue-400' : 'text-gray-600'}`} />
                                                <span className={`text-sm font-medium truncate pr-2 ${isVisible ? 'text-blue-100' : 'text-gray-400'}`} >{displayName}</span>
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
        </div>
    );
}
