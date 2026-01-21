import React from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';

interface MapSettingsPanelProps {
    products: string[];
    activeLayers: Record<string, { opacity: number; visible: boolean }>;
    onLayerToggle: (product: string) => void;
    onOpacityChange: (product: string, opacity: number) => void;
    showSpcOutlook?: boolean;
    onToggleSpcOutlook?: () => void;
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

export default function MapSettingsPanel({
    products,
    activeLayers,
    onLayerToggle,
    onOpacityChange,
    showSpcOutlook = false,
    onToggleSpcOutlook
}: MapSettingsPanelProps) {
    return (
        <div className="h-full flex flex-col bg-gray-800 text-gray-200 p-4 w-full">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-700 pb-4">
                <Layers className="text-blue-400" size={20} />
                <h2 className="text-lg font-bold">Map Layers</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
                {/* Overlays Section */}
                <div className="mb-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Overlays</h3>
                    <div className={`p-3 rounded-lg border transition-all ${showSpcOutlook ? 'bg-gray-800 border-green-500/30' : 'bg-gray-900/50 border-gray-800'}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">SPC Day 1 Outlook</span>
                            <button
                                onClick={onToggleSpcOutlook}
                                className={`p-1.5 rounded-md transition-colors ${showSpcOutlook ? 'bg-green-500/20 text-green-400' : 'text-gray-600 hover:text-gray-400'}`}
                                disabled={!onToggleSpcOutlook}
                            >
                                {showSpcOutlook ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Radar Products Section */}
                <div>
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Radar Products</h3>
                     {products.length === 0 && (
                        <div className="text-sm text-gray-500 italic text-center">No products available</div>
                     )}

                     {products.map(product => {
                        const layerState = activeLayers[product] || { visible: false, opacity: 0.6 };
                        const isVisible = layerState.visible;
                        const displayName = getProductDisplayName(product);

                        return (
                            <div key={product} className={`p-3 rounded-lg border transition-all mb-2 ${isVisible ? 'bg-gray-800 border-blue-500/30' : 'bg-gray-900/50 border-gray-800'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium truncate pr-2" title={product}>{displayName}</span>
                                    <button
                                        onClick={() => onLayerToggle(product)}
                                        className={`p-1.5 rounded-md transition-colors ${isVisible ? 'bg-blue-500/20 text-blue-400' : 'text-gray-600 hover:text-gray-400'}`}
                                    >
                                        {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                </div>

                                {isVisible && (
                                    <div className="mt-2 space-y-1">
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>Opacity</span>
                                            <span>{Math.round(layerState.opacity * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={layerState.opacity * 100}
                                            onChange={(e) => onOpacityChange(product, parseInt(e.target.value) / 100)}
                                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
