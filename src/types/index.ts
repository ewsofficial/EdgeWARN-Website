export * from './connection';
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



// SPC Outlook Types
export interface SPCOutlookFeature {
    type: "Feature";
    geometry: GeoJSON.Geometry;
    properties: {
        LABEL: string;      // e.g., "TSTM", "MRGL", "SLGT", "ENH", "MDT", "HIGH"
        LABEL2: string;     // Full label text
        stroke: string;     // Outline color
        fill: string;       // Fill color
        DN: number;         // Digital Number (threat level)
        VALID: string;      // Valid time
        EXPIRE: string;     // Expiration time
        ISSUE: string;      // Issue time
    };
}

export interface MetarEntry {
    observation_time: string;
    station: string;
    coordinates: [number, number];
    wind: {
        direction: string;
        speed: string;
        gust: string | null;
    };
    temperature: string;
    dewpoint: string;
}

export interface MetarData {
    type: "metar";
    timestamp: string;
    data: MetarEntry[];
}

// NWS Alert Types
export interface NWSAlertProperties {
    "@id": string;
    "@type": string;
    id: string;
    areaDesc: string;
    geocode: {
        SAME: string[];
        UGC: string[];
    };
    affectedZones: string[];
    sent: string;
    effective: string;
    onset: string;
    expires: string;
    ends: string;
    status: string;
    messageType: string;
    category: string;
    severity: "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";
    certainty: string;
    urgency: string;
    event: string;
    sender: string;
    senderName: string;
    headline: string;
    description: string;
    instruction: string;
    response: string;
}

export interface NWSAlertFeature {
    id: string;
    type: "Feature";
    geometry: GeoJSON.Geometry | null;
    properties: NWSAlertProperties;
    Polygon?: number[][] | number[][][];
}

export interface NWSData {
    type: "nws";
    timestamp: string;
    data: {
        type: "FeatureCollection";
        features: NWSAlertFeature[];
    };
}
