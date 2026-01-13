export interface Cell {
    id: number | string;
    bbox: number[][]; // [[lat, lon], ...] or [[minX, minY], [maxX, maxY]] - based on usage it seems to be points
    properties: Record<string, unknown>;
    modules?: Record<string, unknown>;
}

export interface StormCellList {
    type: string;
    features: Cell[];
    content?: { features: Cell[] }; // Handle nested structure seen in code
}
