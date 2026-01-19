'use client';

/**
 * Utility for caching API endpoints in localStorage
 */

export interface SavedEndpoint {
    id: string;
    name: string;
    apiUrl: string;
    ewmrsUrl: string;
    lastUsed: number; // timestamp
}

const STORAGE_KEY = 'edgewarn-saved-endpoints';
const LAST_USED_KEY = 'edgewarn-last-endpoint';
const MAX_SAVED_ENDPOINTS = 10;

/**
 * Get all saved endpoints from localStorage
 */
export function getSavedEndpoints(): SavedEndpoint[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Save an endpoint to localStorage
 */
export function saveEndpoint(endpoint: Omit<SavedEndpoint, 'id' | 'lastUsed'>): SavedEndpoint {
    const endpoints = getSavedEndpoints();
    
    // Check if this exact endpoint already exists
    const existing = endpoints.find(
        e => e.apiUrl === endpoint.apiUrl && e.ewmrsUrl === endpoint.ewmrsUrl
    );
    
    if (existing) {
        // Update the existing entry
        existing.name = endpoint.name;
        existing.lastUsed = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(endpoints));
        return existing;
    }
    
    // Generate a unique ID (fallback for environments without crypto.randomUUID)
    const generateId = (): string => {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        // Fallback: use timestamp + random string
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
    };
    
    // Create new endpoint
    const newEndpoint: SavedEndpoint = {
        ...endpoint,
        id: generateId(),
        lastUsed: Date.now(),
    };
    
    // Add to beginning and limit total
    const updated = [newEndpoint, ...endpoints].slice(0, MAX_SAVED_ENDPOINTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    return newEndpoint;
}

/**
 * Remove an endpoint from localStorage
 */
export function removeEndpoint(id: string): void {
    const endpoints = getSavedEndpoints();
    const updated = endpoints.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Update the last used timestamp for an endpoint
 */
export function touchEndpoint(apiUrl: string, ewmrsUrl: string): void {
    const endpoints = getSavedEndpoints();
    const endpoint = endpoints.find(
        e => e.apiUrl === apiUrl && e.ewmrsUrl === ewmrsUrl
    );
    
    if (endpoint) {
        endpoint.lastUsed = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(endpoints));
    }
    
    // Also save as last used endpoint for autofill
    localStorage.setItem(LAST_USED_KEY, JSON.stringify({ apiUrl, ewmrsUrl }));
}

/**
 * Get the last successfully used endpoint for autofill
 */
export function getLastUsedEndpoint(): { apiUrl: string; ewmrsUrl: string } | null {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem(LAST_USED_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

/**
 * Generate a default name for an endpoint based on its URL
 */
export function generateEndpointName(apiUrl: string): string {
    try {
        const url = new URL(apiUrl);
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
            return `Local (${url.port || '80'})`;
        }
        return url.hostname.split('.')[0] || 'Custom Endpoint';
    } catch {
        return 'Custom Endpoint';
    }
}
