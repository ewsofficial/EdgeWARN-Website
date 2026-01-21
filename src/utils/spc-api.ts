/**
 * SPC API Client
 * Fetches Day 1 Outlooks from NOAA/NWS Storm Prediction Center
 */

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

export type SPCOutlookType = 'categorical' | 'tornado' | 'hail' | 'wind';

// Direct GeoJSON file URLs from SPC
const SPC_GEOJSON_URLS: Record<SPCOutlookType, string> = {
    'categorical': 'https://www.spc.noaa.gov/products/outlook/day1otlk_cat.lyr.geojson',
    'tornado': 'https://www.spc.noaa.gov/products/outlook/day1otlk_torn.lyr.geojson',
    'hail': 'https://www.spc.noaa.gov/products/outlook/day1otlk_hail.lyr.geojson',
    'wind': 'https://www.spc.noaa.gov/products/outlook/day1otlk_wind.lyr.geojson'
};

/**
 * Fetch SPC Day 1 Outlook in GeoJSON format
 * @param type The type of outlook to fetch (default: categorical)
 * @returns GeoJSON FeatureCollection
 */
export async function fetchSPCDay1Outlook(type: SPCOutlookType = 'categorical'): Promise<GeoJSON.FeatureCollection> {
    const url = SPC_GEOJSON_URLS[type];
    
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`SPC API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Failed to fetch SPC outlook (${type}):`, error);
        throw error;
    }
}
