export interface Cell {
    id: number | string;
    bbox: number[][]; // [[lat, lon], ...] or [[minX, minY], [maxX, maxY]] - based on usage it seems to be points
    properties: Record<string, unknown>;
    modules?: Record<string, unknown>;
}

export interface StormCellList {
    type: string;
    features: Cell[];
    content?: { features: Cell[] }; // Handle nested structure seen in code
}

// Colormap types for EWMRS API
export interface ColormapThreshold {
    value: number;
    rgb: [number, number, number];
}

export interface Colormap {
    name: string;
    description: string;
    type: string;
    units: string;
    interpolate: boolean;
    range: [number, number];
    thresholds: ColormapThreshold[];
}

export interface ColormapResponse {
    source: string;
    product: string;
    version: string;
    colormaps: Colormap[];
}

// Map layer state
export interface LayerState {
    visible: boolean;
    opacity: number;
}
