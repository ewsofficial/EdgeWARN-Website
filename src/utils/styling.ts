/**
 * Utility functions for shared styling across components
 */

/**
 * Get Tailwind CSS classes for severity levels
 * @param severity - NWS Severity (Extreme, Severe, Moderate, Minor, etc.)
 */
export const getSeverityClasses = (severity: string) => {
    switch (severity) {
        case 'Extreme': 
            return { bg: 'bg-orange-950/90', border: 'border-orange-500', text: 'text-orange-500', badge: 'bg-orange-500/20' };
        case 'Severe': 
            return { bg: 'bg-red-950/90', border: 'border-red-500', text: 'text-red-500', badge: 'bg-red-500/20' };
        case 'Moderate': 
            return { bg: 'bg-amber-950/90', border: 'border-amber-500', text: 'text-amber-500', badge: 'bg-amber-500/20' };
        case 'Minor': 
            return { bg: 'bg-blue-950/90', border: 'border-blue-400', text: 'text-blue-400', badge: 'bg-blue-500/20' };
        default: 
            return { bg: 'bg-slate-900', border: 'border-slate-700', text: 'text-slate-400', badge: 'bg-slate-500/20' };
    }
};
