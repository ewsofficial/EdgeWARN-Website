'use client';

import React from 'react';
import ConnectionModal from '@/components/UI/ConnectionModal';
import { useMapContext } from './MapContext';

export default function GlobalConnectionManager() {
    const {
        apiUrl,
        ewmrsUrl,
        isConnected,
        loading,
        error,
        handleConnect
    } = useMapContext();

    // Only show modal if NOT connected.
    // Note: useMapConnection handles checking for saved endpoints and auto-connecting.
    // If auto-connect is in progress, loading might be true?
    // ConnectionModal handles loading state visualization.

    // If we are connected, don't show the modal.
    if (isConnected) return null;

    return (
        <ConnectionModal
            key={`global-modal-${apiUrl}-${ewmrsUrl}`}
            isOpen={!isConnected}
            loading={loading}
            error={error}
            initialApiUrl={apiUrl}
            initialEwmrsUrl={ewmrsUrl}
            onConnect={handleConnect}
        />
    );
}
