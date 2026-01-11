/**
 * EWMRS API Client
 * Provides methods to interact with the Edge-compute Weather Map Rendering System API
 */

class EWMRSAPI {
    /**
     * Create an API client instance
     * @param {string} baseUrl - Base URL of the API server (e.g., 'http://localhost:3003')
     */
    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    }

    /**
     * Fetch all available weather products
     * @returns {Promise<string[]>} Array of product names
     * @throws {Error} If the request fails
     */
    async getAvailableProducts() {
        const response = await fetch(`${this.baseUrl}/renders/get-items`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`EWMRS: Server returned ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }

    /**
     * Fetch available timestamps for a product
     * @param {string} product - Product name
     * @returns {Promise<string[]>} Array of timestamps in YYYYMMDD-HHMMSS format
     * @throws {Error} If the request fails
     */
    async getProductTimestamps(product) {
        const response = await fetch(`${this.baseUrl}/renders/fetch?product=${encodeURIComponent(product)}`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`EWMRS: Server returned ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }

    /**
     * Get the URL for a specific render
     * @param {string} product - Product name
     * @param {string} timestamp - Timestamp in YYYYMMDD-HHMMSS format
     * @returns {string} URL to the render image
     */
    getRenderUrl(product, timestamp) {
        return `${this.baseUrl}/renders/download?product=${encodeURIComponent(product)}&timestamp=${encodeURIComponent(timestamp)}`;
    }
}

// Export for use in browser (attach to window) or module systems
if (typeof window !== 'undefined') {
    window.EWMRSAPI = EWMRSAPI;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EWMRSAPI;
}
