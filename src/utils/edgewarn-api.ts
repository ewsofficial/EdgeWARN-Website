/**
 * EdgeWARN API Client
 * Provides methods to interact with the EdgeWARN Features API
 */

export class EdgeWARNAPI {
    private baseUrl: string;

    /**
     * Create an API client instance
     * @param baseUrl - Base URL of the API server (e.g., 'http://localhost:3000')
     */
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    }

    /**
     * Fetch available stormcell timestamps
     * @returns Array of timestamps in YYYYMMDD-HHMMSS format
     */
    async fetchTimestamps(): Promise<string[]> {
        const response = await fetch(`${this.baseUrl}/features/fetch/resources?type=list`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Received non-JSON response:", text.substring(0, 500));
            throw new Error(`Server returned non-JSON content. Content-Type: ${contentType}. See console for details.`);
        }

        return await response.json();
    }

    /**
     * Fetch available cell IDs
     * @returns Array of cell IDs
     */
    async fetchCellIds(): Promise<number[]> {
        const response = await fetch(`${this.baseUrl}/features/fetch/resources?type=cell`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Download stormcell list data for a specific timestamp
     * @param timestamp - Timestamp in YYYYMMDD-HHMMSS format
     * @returns Stormcell list JSON data
     */
    async downloadStormcellList(timestamp: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}/features/download/resources?type=list&timestamp=${timestamp}`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Server returned non-JSON content. Content-Type: ${contentType}.`);
        }

        return await response.json();
    }

    /**
     * Download cell history for a specific cell ID
     * @param cellId - Cell ID as a positive integer
     * @returns Array of historical cell states
     */
    async downloadCellHistory(cellId: number): Promise<any[]> {
        const response = await fetch(`${this.baseUrl}/features/download/resources?type=cell&id=${cellId}`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Check server health
     * @returns Health status object
     */
    async checkHealth(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/health`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Get API information
     * @returns API endpoint information
     */
    async getAPIInfo(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/features/`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }
}
