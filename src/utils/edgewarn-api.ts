/**
 * EdgeWARN API Client
 * Provides methods to interact with the EdgeWARN Features API
 */

import { Cell, StormCellList, MetarData, NWSData } from '@/types';

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
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
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
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
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
    async downloadStormcellList(timestamp: string): Promise<StormCellList | Cell[]> {
        // Validation: Expects YYYYMMDD-HHMMSS format
        // Basic regex to prevent injection and ensure format
        if (!/^\d{8}-\d{6}$/.test(timestamp)) {
            throw new Error(`Invalid timestamp format: ${timestamp}. Expected YYYYMMDD-HHMMSS.`);
        }

        const response = await fetch(`${this.baseUrl}/features/download/resources?type=list&timestamp=${encodeURIComponent(timestamp)}`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
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
    async downloadCellHistory(cellId: number): Promise<Cell[]> {
        if (!Number.isInteger(cellId) || cellId <= 0) {
            throw new Error(`Invalid cell ID: ${cellId}. Expected a positive integer.`);
        }

        const response = await fetch(`${this.baseUrl}/features/download/resources?type=cell&id=${cellId}`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
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
    async checkHealth(): Promise<Record<string, unknown>> {
        const response = await fetch(`${this.baseUrl}/health`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Fetch available METAR timestamps
     * @returns Array of timestamps
     */
    async fetchMetarTimestamps(): Promise<string[]> {
        const response = await fetch(`${this.baseUrl}/data/fetch?type=metar`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        // Handle "timestamps" dict or list
        if (data.timestamps) {
            if (Array.isArray(data.timestamps)) {
                return data.timestamps;
            } else if (typeof data.timestamps === 'object') {
                return Object.keys(data.timestamps);
            }
        }
        return [];
    }

    /**
     * Download METAR data for a specific timestamp
     * @param timestamp - Timestamp in YYYYMMDD-HHMMSS format
     * @returns METAR data
     */
    async downloadMetar(timestamp: string): Promise<MetarData> {
        const response = await fetch(`${this.baseUrl}/data/download?type=metar&timestamp=${encodeURIComponent(timestamp)}`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Fetch available NWS alert timestamps
     * @returns Array of timestamps
     */
    async fetchNWSTimestamps(): Promise<string[]> {
        const response = await fetch(`${this.baseUrl}/data/fetch?type=nws`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        // API returns { timestamps: [...] } (plural)
        if (data.timestamps) {
            if (Array.isArray(data.timestamps)) {
                return data.timestamps;
            } else if (typeof data.timestamps === 'string') {
                return [data.timestamps];
            }
        }
        return [];
    }

    /**
     * Download NWS alert data for a specific timestamp
     * @param timestamp - Timestamp in YYYYMMDD-HHMMSS format
     * @returns NWS data
     */
    async downloadNWS(timestamp: string): Promise<NWSData> {
        const response = await fetch(`${this.baseUrl}/data/download?type=nws&timestamp=${encodeURIComponent(timestamp)}`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
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
    async getAPIInfo(): Promise<Record<string, unknown>> {
        const response = await fetch(`${this.baseUrl}/features/`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }
}
