/**
 * EdgeWARN API Client
 * Provides methods to interact with the EdgeWARN Features API
 */

class EdgeWARNAPI {
    /**
     * Create an API client instance
     * @param {string} baseUrl - Base URL of the API server (e.g., 'http://localhost:3000')
     */
    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    }

    /**
     * Fetch available stormcell timestamps
     * @returns {Promise<string[]>} Array of timestamps in YYYYMMDD-HHMMSS format
     * @throws {Error} If the request fails or returns invalid data
     */
    async fetchTimestamps() {
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
     * @returns {Promise<number[]>} Array of cell IDs
     * @throws {Error} If the request fails or returns invalid data
     */
    async fetchCellIds() {
        const response = await fetch(`${this.baseUrl}/features/fetch/resources?type=cell`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Received non-JSON response:", text.substring(0, 500));
            throw new Error(`Server returned non-JSON content. Content-Type: ${contentType}.`);
        }

        return await response.json();
    }

    /**
     * Download stormcell list data for a specific timestamp
     * @param {string} timestamp - Timestamp in YYYYMMDD-HHMMSS format
     * @returns {Promise<Object>} Stormcell list JSON data
     * @throws {Error} If the request fails or returns invalid data
     */
    async downloadStormcellList(timestamp) {
        const response = await fetch(`${this.baseUrl}/features/download/resources?type=list&timestamp=${timestamp}`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Received non-JSON response for cell data:", text.substring(0, 500));
            throw new Error(`Server returned non-JSON content. Content-Type: ${contentType}.`);
        }

        return await response.json();
    }

    /**
     * Download cell history for a specific cell ID
     * @param {number} cellId - Cell ID as a positive integer
     * @returns {Promise<Array>} Array of historical cell states
     * @throws {Error} If the request fails or returns invalid data
     */
    async downloadCellHistory(cellId) {
        const response = await fetch(`${this.baseUrl}/features/download/resources?type=cell&id=${cellId}`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Received non-JSON response for cell history:", text.substring(0, 500));
            throw new Error(`Server returned non-JSON content. Content-Type: ${contentType}.`);
        }

        return await response.json();
    }

    /**
     * Check server health
     * @returns {Promise<Object>} Health status object
     * @throws {Error} If the request fails
     */
    async checkHealth() {
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
     * @returns {Promise<Object>} API endpoint information
     * @throws {Error} If the request fails
     */
    async getAPIInfo() {
        const response = await fetch(`${this.baseUrl}/features/`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }
}

// Export for use in browser (attach to window) or module systems
if (typeof window !== 'undefined') {
    window.EdgeWARNAPI = EdgeWARNAPI;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EdgeWARNAPI;
}
