/**
 * EWMRS API Client
 * Provides methods to interact with the Edge-compute Weather Map Rendering System API
 */

import { ColormapResponse } from '@/types';

export class EWMRSAPI {
    private baseUrl: string;

    /**
     * Create an API client instance
     * @param baseUrl - Base URL of the API server (e.g., 'http://localhost:3003')
     */
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    }

    /**
     * Fetch all available weather products
     * @returns Array of product names
     */
    async getAvailableProducts(): Promise<string[]> {
        const response = await fetch(`${this.baseUrl}/renders/get-items`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`EWMRS: Server returned ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }

    /**
     * Fetch available timestamps for a product
     * @param product - Product name
     * @returns Array of timestamps in YYYYMMDD-HHMMSS format
     */
    async getProductTimestamps(product: string): Promise<string[]> {
        const response = await fetch(`${this.baseUrl}/renders/fetch?product=${encodeURIComponent(product)}`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`EWMRS: Server returned ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }

    /**
     * Get the URL for a specific render
     * @param product - Product name
     * @param timestamp - Timestamp in YYYYMMDD-HHMMSS format
     * @returns URL to the render image
     */
    getRenderUrl(product: string, timestamp: string): string {
        return `${this.baseUrl}/renders/download?product=${encodeURIComponent(product)}&timestamp=${encodeURIComponent(timestamp)}`;
    }

    /**
     * Fetch colormap definitions
     * @returns Array of colormap response objects
     */
    async fetchColormaps(): Promise<ColormapResponse[]> {
        const response = await fetch(`${this.baseUrl}/colormaps`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`EWMRS: Server returned ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }
}
