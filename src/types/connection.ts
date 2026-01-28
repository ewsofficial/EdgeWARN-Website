// Colormap types for EWMRS API
export interface ColormapThreshold {
    value: number;
    rgb: [number, number, number];
}

export interface Colormap {
    name: string;
    description: string;
    type: string;
    units: string;
    interpolate: boolean;
    range: [number, number];
    thresholds: ColormapThreshold[];
}

export interface ColormapResponse {
    source: string;
    product: string;
    version: string;
    colormaps: Colormap[];
}

// Map layer state
export interface LayerState {
    visible: boolean;
    opacity: number;
    // Add other layer specific props if needed
}

export interface UseMapConnectionReturn {
    // URLs
    apiUrl: string;
    setApiUrl: (url: string) => void;
    ewmrsUrl: string;
    setEwmrsUrl: (url: string) => void;

    // Connection state
    isConnected: boolean;
    isAutoConnecting: boolean;
    loading: boolean;
    error: string | null;

    // API refs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiRef: React.MutableRefObject<any>; // Using any to avoid circular dependency with API classes if imported here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ewmrsRef: React.MutableRefObject<any>;

    // Data
    timestamps: string[];
    setTimestamps: React.Dispatch<React.SetStateAction<string[]>>;
    products: string[];
    activeLayers: Record<string, LayerState>;
    setActiveLayers: React.Dispatch<React.SetStateAction<Record<string, LayerState>>>;
    productTimestamps: Record<string, string[]>;
    setProductTimestamps: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    colormaps: Colormap[];

    // Current state
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;

    // Flash state for new data indicator
    isFlashing: boolean;
    setIsFlashing: (flashing: boolean) => void;

    // Actions
    handleConnect: (overrideApiUrl?: string, overrideEwmrsUrl?: string) => Promise<void>;
}
