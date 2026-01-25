/**
 * WPC WSSI API Client
 * Fetches Winter Storm Severity Index (WSSI) from NOAA/NWS Weather Prediction Center
 */

export interface WSSIFeature {
    type: "Feature";
    geometry: GeoJSON.Geometry;
    properties: {
        OBJECTID: number;
        Makrb: string; // "Limited", "Minor", "Moderate", "Major", "Extreme"
        WSSI: number; // Numeric level or code? Often ranges 1-5
        // Other properties like ISSUE_TIME etc. might be present
        [key: string]: any;
    };
}

// NOAA WPC ArcGIS REST API Endpoint for WSSI
const WSSI_MAPSERVER = 'https://www.wpc.ncep.noaa.gov/wwd/wssi/gis/shp/services/outlooks/wpc_wssi/MapServer';

// Layer IDs for WSSI Overall Impacts
// Based on typical WPC service structure (Needs verification but using standard assumption)
// 0: Day 1 Overall
// 1: Day 2 Overall
// 2: Day 3 Overall
const WSSI_LAYERS = {
    1: 0,
    2: 1,
    3: 2
};

/**
 * Fetch WPC WSSI GeoJSON
 * @param day The forecast day (1, 2, or 3)
 * @returns GeoJSON FeatureCollection
 */
export async function fetchWSSI(day: 1 | 2 | 3): Promise<GeoJSON.FeatureCollection> {
    const layerId = WSSI_LAYERS[day];
    const url = `${WSSI_MAPSERVER}/${layerId}/query?where=WSSI>0&outFields=*&f=geojson`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            },
            next: { revalidate: 300 } // Cache for 5 minutes
        });

        if (!response.ok) {
            throw new Error(`WSSI API error: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        if (!text || text.trim().length === 0) {
            return {
                type: "FeatureCollection",
                features: []
            };
        }

        // Sometimes ArcGIS returns error in JSON with 200 OK
        const data = JSON.parse(text);
        if (data.error) {
            throw new Error(`WSSI ArcGIS Error: ${data.error.message}`);
        }
        
        return data;
    } catch (error) {
        console.error(`Failed to fetch WSSI Day ${day}:`, error);
        throw error;
    }
}
