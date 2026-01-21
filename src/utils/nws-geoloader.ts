/**
 * Utility to resolve NWS geocodes (UGC/SAME) to coordinates
 * Fetches data from api.weather.gov and caches it locally
 */

export class ZoneResolver {
    private static cache: Map<string, [number, number]> = new Map();
    private static pendingRequests: Map<string, Promise<[number, number] | null>> = new Map();

    /**
     * Resolve a UGC or SAME code to a Lat/Lon centroid
     * @param code - UGC (e.g., "ALZ011") or SAME (e.g., "001093")
     * @returns Promise resolving to [lat, lon] or null
     */
    static async resolve(code: string): Promise<[number, number] | null> {
        // Normalize code
        let normalizedCode = code.toUpperCase().trim();

        // Convert SAME to UGC if needed
        // SAME 001093 -> FIPS 01093 -> ALC093 (Marion County, AL)
        // This is a simplified heuristic: SAME [SS][CCC] maps to State[SS] County[CCC]
        if (normalizedCode.length === 6 && normalizedCode.startsWith('00')) {
            const fips = normalizedCode.substring(1); // 01093
            const stateCode = this.fipsToState(fips.substring(0, 2));
            if (stateCode) {
                normalizedCode = `${stateCode}C${fips.substring(2)}`;
            }
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
        const promise = this.fetchZone(normalizedCode);
        this.pendingRequests.set(normalizedCode, promise);

        const result = await promise;
        this.pendingRequests.delete(normalizedCode);

        if (result) {
            this.cache.set(normalizedCode, result);
        }

        return result;
    }

    /**
     * Fetch zone metadata from weather.gov
     */
    private static async fetchZone(ugc: string): Promise<[number, number] | null> {
        try {
            // Determine zone type (forecast or county)
            // Format: STZxxx (forecast) or STCxxx (county)
            const typeLetter = ugc.charAt(2);
            const type = typeLetter === 'C' ? 'county' : 'forecast';

            const url = `https://api.weather.gov/zones/${type}/${ugc}`;
            const response = await fetch(url, {
                headers: { 'Accept': 'application/geo+json' },
            });

            if (!response.ok) return null;

            const data = await response.json();

            // Try to get centroid from geometry or properties
            if (data.geometry && data.geometry.type === 'Polygon') {
                const ring = data.geometry.coordinates[0];
                let sumLat = 0, sumLon = 0;
                ring.forEach((pt: number[]) => { sumLon += pt[0]; sumLat += pt[1]; });
                return [sumLat / ring.length, sumLon / ring.length];
            } else if (data.geometry && data.geometry.type === 'MultiPolygon') {
                // Simplified: use first polygon's centroid
                const ring = data.geometry.coordinates[0][0];
                let sumLat = 0, sumLon = 0;
                ring.forEach((pt: number[]) => { sumLon += pt[0]; sumLat += pt[1]; });
                return [sumLat / ring.length, sumLon / ring.length];
            }

            return null;
        } catch (err) {
            console.warn(`Failed to resolve zone ${ugc}:`, err);
            return null;
        }
    }

    /**
     * FIPS State code to 2-letter state postal mapping (Partial list for common areas)
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
            '55': 'WI', '56': 'WY'
        };
        return mapping[fips] || null;
    }
}
