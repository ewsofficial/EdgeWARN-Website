/**
 * Utility to resolve NWS geocodes (UGC/SAME) to geometry
 * Fetches data from api.weather.gov and caches it locally
 */

export interface ZoneGeometry {
    centroid: [number, number];
    geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
}

export class ZoneResolver {
    private static cache: Map<string, ZoneGeometry> = new Map();
    private static negativeCache: Set<string> = new Set(); // Codes that returned 404
    private static pendingRequests: Map<string, Promise<ZoneGeometry | null>> = new Map();

    /**
     * Resolve a UGC or SAME code to geometry (polygon + centroid)
     * @param code - UGC (e.g., "ALZ011") or SAME (e.g., "048001")
     * @returns Promise resolving to ZoneGeometry or null
     */
    static async resolveGeometry(code: string): Promise<ZoneGeometry | null> {
        // Normalize code
        let normalizedCode = code.toUpperCase().trim();
        
        // Convert SAME (6-digit FIPS) to UGC if needed
        // SAME format: SSSCCC where SSS=state FIPS (with leading 0), CCC=county FIPS
        // Example: 048001 = Texas (48) County 001 = TXC001
        if (/^\d{6}$/.test(normalizedCode)) {
            const stateFips = normalizedCode.substring(0, 3).replace(/^0/, ''); // Remove leading 0
            const countyFips = normalizedCode.substring(3);
            const stateCode = this.fipsToState(stateFips.padStart(2, '0'));
            if (stateCode) {
                normalizedCode = `${stateCode}C${countyFips}`;
            } else {
                // Unknown state FIPS, skip
                return null;
            }
        }

        // Check negative cache (known 404s)
        if (this.negativeCache.has(normalizedCode)) {
            return null;
        }

        // Check cache
        if (this.cache.has(normalizedCode)) {
            return this.cache.get(normalizedCode)!;
        }

        // Check if there's already a pending request for this code
        if (this.pendingRequests.has(normalizedCode)) {
            return this.pendingRequests.get(normalizedCode)!;
        }

        // Fetch from NWS API
        const promise = this.fetchZoneGeometry(normalizedCode);
        this.pendingRequests.set(normalizedCode, promise);
        
        const result = await promise;
        this.pendingRequests.delete(normalizedCode);

        if (result) {
            this.cache.set(normalizedCode, result);
        } else {
            // Add to negative cache to avoid re-fetching
            this.negativeCache.add(normalizedCode);
        }

        return result;
    }

    /**
     * Legacy method for centroid only
     */
    static async resolve(code: string): Promise<[number, number] | null> {
        const result = await this.resolveGeometry(code);
        return result?.centroid || null;
    }

    /**
     * Fetch zone geometry from weather.gov
     */
    private static async fetchZoneGeometry(ugc: string): Promise<ZoneGeometry | null> {
        try {
            // Determine zone type based on UGC format
            const type = this.getZoneType(ugc);
            
            const url = `https://api.weather.gov/zones/${type}/${ugc}`;
            const response = await fetch(url, {
                headers: { 'Accept': 'application/geo+json' },
            });

            if (!response.ok) {
                console.warn(`[NWS Zone] Failed ${ugc} -> ${url} (${response.status})`);
                return null;
            }

            const data = await response.json();

            if (data.geometry && (data.geometry.type === 'Polygon' || data.geometry.type === 'MultiPolygon')) {
                // Calculate centroid
                let centroid: [number, number];
                if (data.geometry.type === 'Polygon') {
                    const ring = data.geometry.coordinates[0];
                    let sumLat = 0, sumLon = 0;
                    ring.forEach((pt: number[]) => { sumLon += pt[0]; sumLat += pt[1]; });
                    centroid = [sumLat / ring.length, sumLon / ring.length];
                } else {
                    // MultiPolygon: use first polygon
                    const ring = data.geometry.coordinates[0][0];
                    let sumLat = 0, sumLon = 0;
                    ring.forEach((pt: number[]) => { sumLon += pt[0]; sumLat += pt[1]; });
                    centroid = [sumLat / ring.length, sumLon / ring.length];
                }

                return {
                    centroid,
                    geometry: data.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
                };
            }

            return null;
        } catch {
            // Silently fail - don't spam console for network issues
            return null;
        }
    }

    /**
     * Determine the NWS API zone type from a UGC code
     */
    private static getZoneType(ugc: string): string {
        const typeLetter = ugc.charAt(2);
        const prefix = ugc.substring(0, 2).toUpperCase();
        
        // Marine zone prefixes
        const marinePrefix = ['AN', 'AM', 'GM', 'PK', 'PZ', 'PM', 'PS', 'SL', 'LE', 'LM', 'LH', 'LS', 'LO', 'LC'];
        
        if (typeLetter === 'C') {
            return 'county';
        } else if (marinePrefix.includes(prefix)) {
            return 'forecast';
        } else if (typeLetter === 'Z' || typeLetter === 'F') {
            return 'forecast';
        }
        
        return 'forecast';
    }

    /**
     * FIPS State code to 2-letter state postal mapping
     */
    private static fipsToState(fips: string): string | null {
        const mapping: Record<string, string> = {
            '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO', '09': 'CT',
            '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL',
            '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD',
            '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE',
            '32': 'NV', '33': 'NH', '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
            '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD',
            '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV',
            '55': 'WI', '56': 'WY', '72': 'PR', '78': 'VI', '66': 'GU', '60': 'AS', '69': 'MP'
        };
        return mapping[fips] || null;
    }
}
