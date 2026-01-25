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

// StormCast forecast cone style - The "Storm Size" or specific forecast circle
export const FORECAST_CONE_STYLE = {
    color: "#ea580c", // orange-600 (darker for contrast)
    weight: 2,
    fillOpacity: 0, // No fill, just outline for the specific radius
    dashArray: '4, 4', // Dashed to distinguish from uncertainty
    interactive: false,
    className: 'stormcast-forecast-circle',
};

// StormCast uncertainty cone style - The "Cone" area
// NHC Style: Solid semi-transparent fill
export const UNCERTAINTY_CONE_STYLE = {
    color: "#ffedd5", // orange-100 (very light) outline
    weight: 1,
    fillColor: "#fff7ed", // orange-50 (even lighter/white-ish)
    fillOpacity: 0.35, // Semi-transparent "glassy" look
    interactive: false,
    className: 'stormcast-prob-cone',
};

// StormCast Track Line Style
export const TRACK_LINE_STYLE = {
    color: "#ea580c", // orange-600 (matches cone outline)
    weight: 3,
    dashArray: '',
    interactive: false,
    className: 'stormcast-track-line',
};

// SPC Day 1 Outlook Colors (Categorical)
export const SPC_OUTLOOK_COLORS: Record<string, string> = {
    'TSTM': '#c0e8c0', // General Thunderstorms (Light Green)
    'MRGL': '#006400', // Marginal (Dark Green)
    'SLGT': '#f6f600', // Slight (Yellow)
    'ENH': '#ffbf00',  // Enhanced (Orange)
    'MDT': '#ff0000',  // Moderate (Red)
    'HIGH': '#ff00ff', // High (Magenta)
};

// SPC Probabilistic Colors
export const SPC_PROB_COLORS: Record<string, string> = {
    '2': '#008000',   // Green
    '5': '#8b4513',   // Brown
    '10': '#ffc000',  // Yellow
    '15': '#ff0000',  // Red
    '30': '#ff00ff',  // Magenta
    '45': '#800080',  // Purple
    '60': '#104e8b',  // Blue
    'SIGN': '#000000', // Significant (Black hatched usually, using black for now)
};

// SPC Layer base style
export const SPC_LAYER_STYLE = {
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.4,
};

// WPC Surface Analysis Styles
export const WPC_STYLE = {
    HIGH: { color: '#0000FF', weight: 2, radius: 8 },
    LOW: { color: '#FF0000', weight: 2, radius: 8 },
    ISOBAR: { color: '#000000', weight: 1, opacity: 0.5 },
    COLD_FRONT: { color: '#0000FF', weight: 3 },
    WARM_FRONT: { color: '#FF0000', weight: 3 },
    OCCLUDED_FRONT: { color: '#800080', weight: 3 },
    STATIONARY_FRONT: { color: '#FF0000', weight: 3, dashArray: '10, 10' }, // Simplified
    TROUGH: { color: '#FFA500', weight: 2, dashArray: '5, 5' },
};

// NWS Severity Colors
export const SEVERITY_COLORS: Record<string, { bg: string; border: string; dot: string }> = {
    'Extreme': { bg: '#7c2d12', border: '#ea580c', dot: '#f97316' },
    'Severe': { bg: '#7f1d1d', border: '#dc2626', dot: '#ef4444' },
    'Moderate': { bg: '#78350f', border: '#d97706', dot: '#f59e0b' },
    'Minor': { bg: '#1e3a5f', border: '#3b82f6', dot: '#60a5fa' },
    'Unknown': { bg: '#374151', border: '#6b7280', dot: '#9ca3af' },
};

/**
 * Get color scheme for NWS alerts based on event type and severity
 */
export const getEventColors = (event: string, severity: string) => {
    const e = event.toLowerCase();
    if (e.includes('tornado')) return { bg: '#450a0a', border: '#ef4444', dot: '#ff0000' }; // Bright Red
    if (e.includes('thunderstorm')) return { bg: '#451a03', border: '#f97316', dot: '#ffa500' }; // Orange
    if (e.includes('winter') || e.includes('snow') || e.includes('blizzard')) return { bg: '#172554', border: '#3b82f6', dot: '#0000ff' }; // Blue
    if (e.includes('flash flood')) return { bg: '#450a0a', border: '#dc2626', dot: '#8b0000' }; // Maroon
    if (e.includes('flood')) return { bg: '#064e3b', border: '#10b981', dot: '#00ff00' }; // Lime
    if (e.includes('marine')) return { bg: '#3f2b10', border: '#eab308', dot: '#ffd700' }; // Gold

    // Fallback to severity
    return SEVERITY_COLORS[severity] || SEVERITY_COLORS['Unknown'];
};
