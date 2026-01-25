export interface GeoPoint {
    lat: number;
    lon: number;
    radius: number; // meters
}

/**
 * Converts degrees to radians
 */
export function toRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

/**
 * Converts radians to degrees
 */
export function toDeg(rad: number): number {
    return (rad * 180) / Math.PI;
}

/**
 * Calculates a new coordinate given a starting point, distance, and bearing
 * @param lat Starting latitude
 * @param lon Starting longitude
 * @param distance Distance in meters
 * @param bearing Bearing in degrees (0 = North, 90 = East)
 */
export function calculateDestination(lat: number, lon: number, distance: number, bearing: number): [number, number] {
    const R = 6371e3; // Earth radius in meters
    const radLat = toRad(lat);
    const radLon = toRad(lon);
    const radBearing = toRad(bearing);
    const angularDist = distance / R;

    const newLat = Math.asin(
        Math.sin(radLat) * Math.cos(angularDist) +
        Math.cos(radLat) * Math.sin(angularDist) * Math.cos(radBearing)
    );

    const newLon = radLon + Math.atan2(
        Math.sin(radBearing) * Math.sin(angularDist) * Math.cos(radLat),
        Math.cos(angularDist) - Math.sin(radLat) * Math.sin(newLat)
    );

    return [toDeg(newLat), toDeg(newLon)];
}

/**
 * Calculates the initial bearing between two points
 */
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const deltaLambda = toRad(lon2 - lon1);

    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) -
        Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

    const theta = Math.atan2(y, x);
    return (toDeg(theta) + 360) % 360;
}

/**
 * Generates a polygon outline for a sequence of circles (cones)
 * Connects the external tangents of consecutive circles
 */
export function generateConePolygon(points: GeoPoint[]): [number, number][] {
    if (points.length < 2) return [];

    const leftSide: [number, number][] = [];
    const rightSide: [number, number][] = [];

    // Helper to add points to sides
    // For the very first circle, we want the tangent points relative to the second circle
    // For intermediate circles, we want tangent points relative to next
    // For the last circle, we might just close it around the back or use the tangent from previous?
    // A robust way: Iterate pairs (current, next)
    // For each pair, calculate the outer tangent lines.
    // However, simply connecting tangents of pairs might result in disjoint segments if the path turns sharply.
    // A "Convex Hull" approach per segment is better:
    // For each segment i -> i+1:
    // Calculate bearing and distance
    // Calculate the angle offset for the tangent points due to radius difference?
    // If radii are equal, offset is 90 degrees.
    // If radii differ, angle = acos((r2-r1)/d) ? No, that's for internal tangents or something.
    // Angle offset from center-to-center line: alpha = acos((r1 - r2) / d) if r1 > r2 ??
    // Actually, simple tangent points:
    // sin(alpha) = (r2 - r1) / d
    // alpha = asin((r2 - r1) / d)
    // The tangent points are at bearing + 90 + alpha and bearing - 90 - alpha ?

    for (let i = 0; i < points.length; i++) {
        // We need a direction. For point i, we can use the average bearing of i-1 -> i and i -> i+1
        // But the width varies.
        // Let's implement the simpler approach: just find tangents for each pair and add points.
        // Or even simpler: Calculate perpendicular points at each step based on the path direction.
        
        const curr = points[i];
        let bearing = 0;
        
        if (i < points.length - 1) {
            const next = points[i+1];
            bearing = calculateBearing(curr.lat, curr.lon, next.lat, next.lon);
        } else if (i > 0) {
            const prev = points[i-1];
            bearing = calculateBearing(prev.lat, prev.lon, curr.lat, curr.lon);
        }

        // Refinement: average bearing for internal points to smooth transitions
        if (i > 0 && i < points.length - 1) {
            const prev = points[i-1];
            const next = points[i+1];
            const b1 = calculateBearing(prev.lat, prev.lon, curr.lat, curr.lon);
            const b2 = calculateBearing(curr.lat, curr.lon, next.lat, next.lon);
            
            // Average bearing (careful with wrap around 360)
            // Simple vector average approximation or just average degrees
            let diff = b2 - b1;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
            bearing = b1 + diff / 2;
        }

        // Calculate left and right points at 90 degrees offset from bearing
        // This is an approximation but works well for "tubes"
        // For expanding cones, we might want to account for the expansion angle, but
        // strictly perpendicular to the path is usually sufficient visually for these scales.
        
        const left = calculateDestination(curr.lat, curr.lon, curr.radius, bearing - 90);
        const right = calculateDestination(curr.lat, curr.lon, curr.radius, bearing + 90);

        leftSide.push(left);
        rightSide.push(right);
    }

    // Combine: Left side forward + Right side backward to close the loop
    // But verify order.
    // Left side: P0_L, P1_L, ... Pn_L
    // Right side: P0_R, P1_R, ... Pn_R
    // Polygon: P0_L -> ... -> Pn_L -> (half circle cap?) -> Pn_R -> ... -> P0_R -> (half circle cap?)
    
    // To make it look nice, we might want to add more points for the start/end caps (semicircles)
    // But simple connection is a good start.
    
    // Construct cap for the end (Last point)
    const last = points[points.length - 1];
    const bearingCap = (points.length > 1) 
        ? calculateBearing(points[points.length-2].lat, points[points.length-2].lon, last.lat, last.lon)
        : 0;
    
    // Generate semi-circle points for the end cap (from -90 to +90 relative to bearing)
    const endCap: [number, number][] = [];
    for (let a = -80; a <= 80; a += 20) {
         endCap.push(calculateDestination(last.lat, last.lon, last.radius, bearingCap + 90 + a)); // sweeping from Right to Left? Wait.
         // Right is +90. Left is -90.
         // We came down Left side -> Pn_L (at bearing - 90).
         // We need to go to Pn_R (at bearing + 90).
         // The cap should cover the "front".
         // So sweep from -90 to +90? No, that goes backwards?
         // Bearing is forward. Left is -90. Right is +90.
         // We are at Left (-90). We want to go around the front (0) to Right (+90).
         // So -90 -> 0 -> +90.
    }
    // Actually loop needs to match coordinate order.
    // leftSide is 0..n.
    // Then we act "at" n. cap around the front.
    // Then rightSide n..0.
    
    const capPoints: [number, number][] = [];
    for (let step = 1; step < 9; step++) { // 9 steps of 20 degrees = 180
        const angle = -90 + (step * 20); 
        if (angle >= 90) break;
        capPoints.push(calculateDestination(last.lat, last.lon, last.radius, bearingCap + angle));
    }

    // Construct cap for the start (First point) - wrapping around the back
    // From Right (+90) to Left (-90) via the back (+180)
    const start = points[0];
    const bearingStart = (points.length > 1) 
        ? calculateBearing(start.lat, start.lon, points[1].lat, points[1].lon)
        : 0;
    
    const startCap: [number, number][] = [];
    // We want to go from +90 (exclusive) to +270/-90 (exclusive)
    // Angles: +110, +130, ... +250
    for (let step = 1; step < 9; step++) {
        const angle = 90 + (step * 20);
        startCap.push(calculateDestination(start.lat, start.lon, start.radius, bearingStart + angle));
    }

    return [
        ...leftSide,
        ...capPoints,
        ...rightSide.reverse(),
        ...startCap
    ];
}
