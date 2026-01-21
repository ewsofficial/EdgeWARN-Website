/**
 * Map configuration constants
 */

// Default map bounds for CONUS overlay
export const DEFAULT_BOUNDS = {
    south: 20,
    north: 55,
    west: -130,
    east: -60,
};

// Default map center and zoom
export const DEFAULT_MAP_CONFIG = {
    center: [37.8, -96] as [number, number],
    zoom: 4,
    minZoom: 3,
};

// Default layer opacity
export const DEFAULT_LAYER_OPACITY = 0.6;

// Default product to show on connection
export const DEFAULT_PRODUCT = 'CompRefQC';

// Auto-refresh interval in milliseconds
export const AUTO_REFRESH_INTERVAL = 30000;

// Maps product names to colormap types for legend display
export const PRODUCT_TO_COLORMAP_TYPE: Record<string, string> = {
    'CompRefQC': 'reflectivity',
    'CompRef': 'reflectivity',
    'Reflectivity': 'reflectivity',
    'EchoTops': 'EchoTops',
    'EnhancedEchoTop': 'EchoTops',
    'EchoTop18': 'EchoTops',
    'EchoTop30': 'EchoTops',
    'PrecipRate': 'PrecipitationRate',
    'QPE_01H': 'QPE',
    'QPE_03H': 'QPE',
    'VIL': 'VILDensity',
    'VILDensity': 'VILDensity',
    'VII': 'VILDensity',
};

// Polygon style for storm cells
export const CELL_POLYGON_STYLE = {
    color: "#f87171", // red-400
    weight: 2,
    opacity: 1,
    fillOpacity: 0.3,
};

// StormCast forecast cone style
export const FORECAST_CONE_STYLE = {
    color: "#f97316", // orange-500
    weight: 2,
    fillOpacity: 0.1,
    dashArray: '4, 4',
    interactive: false,
};

// SPC Day 1 Outlook Colors (Categorical)
export const SPC_OUTLOOK_COLORS: Record<string, string> = {
    'TSTM': '#c0e8c0', // General Thunderstorms (Light Green)
    'MRGL': '#006400', // Marginal (Dark Green - official is usually dark green)
    'SLGT': '#f6f600', // Slight (Yellow)
    'ENH': '#ffbf00',  // Enhanced (Orange)
    'MDT': '#ff0000',  // Moderate (Red)
    'HIGH': '#ff00ff', // High (Magenta)
};

// SPC Layer base style
export const SPC_LAYER_STYLE = {
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.4,
};
