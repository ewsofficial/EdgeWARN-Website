# EdgeWARN Website

## Project Overview

**EdgeWARN** is a specialized severe weather nowcasting visualization platform. This repository contains the frontend web application, built with Next.js, that interfaces with the EdgeWARN Core backend and the Edge-compute Weather Map Rendering System (EWMRS). It provides interactive, time-indexed visualization of weather radar data, storm tracks, NWS alerts, and other meteorological products.

## Tech Stack

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS 4
*   **Maps:** Leaflet (`react-leaflet` is *not* used; raw Leaflet is managed via effects for performance and custom control), `leaflet-polylinedecorator`.
*   **Icons:** Lucide React
*   **State Management:** React Context API (`MapContext`)

## Architecture & Key Concepts

### 1. Map System (`src/components/Map`)
The core of the application is the interactive map.
*   **`LeafletMap.tsx`:** The main map component. It initializes the Leaflet instance and manages layer rendering.
*   **`MapContext.tsx`:** A global context that holds the application state, including:
    *   **Connection Status:** Connectivity to the backend APIs.
    *   **Time Control:** Current selected timestamp and playback state.
    *   **Layers:** Active weather products and their visibility/opacity.
*   **Hooks:** Custom hooks (e.g., `useMapConnection`, `useNWSLayer`, `useMETARLayer`) encapsulate logic for specific data types.

### 2. Backend Integration (`src/utils`)
The frontend connects to two distinct backend services:
*   **EdgeWARN API (Port 5000):** Managed by `EdgeWARNAPI` class. Handles "metadata" and vector data like timestamps, storm cell tracks, and NWS alerts.
*   **EWMRS API (Port 3003):** Managed by `EWMRSAPI` class. The "Edge-compute Weather Map Rendering System" provides raster map tiles (renders), product lists, and colormaps.

### 3. Data Models (`src/types`)
*   **Timestamps:** The application is time-driven. Data is indexed by `YYYYMMDD-HHMMSS` formatted strings.
*   **Products:** Renderable weather layers (e.g., "Reflectivity", "Velocity").
*   **Cells:** Storm cells with bounding boxes and properties, visualized as polygons.
*   **NWS Alerts:** GeoJSON features representing weather alerts (Warnings, Watches).

## Directory Structure

*   `src/app`: Next.js App Router pages.
    *   `page.tsx`: Landing page.
    *   `interactive-map/`: The main application view.
    *   `alerts/`: Dedicated page for listing and viewing NWS alerts.
*   `src/components`: React components.
    *   `Map/`: Map-specific components (layers, toolbars, context).
    *   `UI/`: Generic UI elements (modals, panels, sliders).
*   `src/utils`: API clients and helper functions (geo, timestamp parsing).
*   `src/types`: TypeScript interface definitions.

## Getting Started

### Prerequisites
*   Node.js (LTS recommended)
*   Backends (Optional for UI dev, required for data):
    *   EdgeWARN Core running on `http://localhost:5000`
    *   EWMRS running on `http://localhost:3003`

### Development
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run the development server:
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000).

### Building
To create a production build:
```bash
npm run build
npm run start
```
