/**
 * Timestamp utilities for parsing and formatting EdgeWARN timestamps
 * Timestamp format: YYYYMMDD-HHMMSS
 */

export interface TimestampStr {
    date: string;
    time: string;
}

/**
 * Parse a timestamp string into a Date object
 * @param ts - Timestamp in YYYYMMDD-HHMMSS format
 * @returns Date object or null if invalid
 */
export function parseTimestamp(ts: string): Date | null {
    const match = ts.trim().match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/);
    if (!match) return null;
    return new Date(
        parseInt(match[1]),
        parseInt(match[2]) - 1,
        parseInt(match[3]),
        parseInt(match[4]),
        parseInt(match[5]),
        parseInt(match[6])
    );
}

/**
 * Format a timestamp string into human-readable date and time
 * @param ts - Timestamp in YYYYMMDD-HHMMSS format
 * @returns Object with formatted date (YYYY-MM-DD) and time (HH:MM)
 */
export function formatTimeLabel(ts: string): TimestampStr {
    const match = ts.match(/(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/);
    if (!match) return { date: ts, time: '' };
    return {
        date: `${match[1]}-${match[2]}-${match[3]}`,
        time: `${match[4]}:${match[5]}`
    };
}

/**
 * Find the closest timestamp in a list to a target timestamp
 * @param targetTs - Target timestamp in YYYYMMDD-HHMMSS format
 * @param candidates - Array of candidate timestamps
 * @param toleranceMs - Maximum difference in milliseconds (default: 10 minutes)
 * @returns Closest timestamp or null if none within tolerance
 */
export function findClosestTimestamp(
    targetTs: string,
    candidates: string[],
    toleranceMs: number = 600000
): string | null {
    if (!candidates || candidates.length === 0) return null;

    const targetDate = parseTimestamp(targetTs);
    if (!targetDate) return null;
    targetDate.setSeconds(0, 0);

    let closest: string | null = null;
    let minDiff = Infinity;

    for (const cand of candidates) {
        const candDate = parseTimestamp(cand);
        if (!candDate) continue;
        candDate.setSeconds(0, 0);

        const diff = Math.abs(candDate.getTime() - targetDate.getTime());
        if (diff < minDiff) {
            minDiff = diff;
            closest = cand;
        }
    }

    if (minDiff > toleranceMs) return null;
    return closest;
}
