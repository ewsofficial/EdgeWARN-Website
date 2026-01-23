/**
 * WPC API Client
 * Fetches Excessive Rainfall Outlooks (ERO) from NOAA/NWS Weather Prediction Center
 */

export interface WPCEroFeature {
    type: "Feature";
    geometry: GeoJSON.Geometry;
    properties: {
        outlook: string;    // e.g., "Marginal (At Least 5%)"
        start_time: string;
        end_time: string;
        issue_time: string;
        [key: string]: any;
    };
}

// NOAA WPC ArcGIS REST API Endpoint for Precip Hazards
const WPC_HAZARDS_MAPSERVER = 'https://mapservices.weather.noaa.gov/vector/rest/services/hazards/wpc_precip_hazards/MapServer';

// Layer IDs for ERO
// 0: Excessive Rainfall Day 1
// 1: Excessive Rainfall Day 2
// 2: Excessive Rainfall Day 3
const WPC_ERO_LAYERS = {
    1: 0,
    2: 1,
    3: 2
};

/**
 * Fetch WPC Excessive Rainfall Outlook (ERO) in GeoJSON format
 * @param day The forecast day (1, 2, or 3)
 * @returns GeoJSON FeatureCollection
 */
export async function fetchWPCEro(day: 1 | 2 | 3): Promise<GeoJSON.FeatureCollection> {
    const layerId = WPC_ERO_LAYERS[day];
    const url = `${WPC_HAZARDS_MAPSERVER}/${layerId}/query?where=1%3D1&outFields=*&f=geojson`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            },
            next: { revalidate: 300 } // Cache for 5 minutes
        });

        if (!response.ok) {
            throw new Error(`WPC API error: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        if (!text || text.trim().length === 0) {
            return {
                type: "FeatureCollection",
                features: []
            };
        }

        const data = JSON.parse(text);
        return data;
    } catch (error) {
        console.error(`Failed to fetch WPC ERO Day ${day}:`, error);
        throw error;
    }
}
