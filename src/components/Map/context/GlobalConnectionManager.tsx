'use client';

import React from 'react';
import ConnectionModal from '@/components/UI/ConnectionModal';
import { useMapContext } from './MapContext';
import { usePathname } from 'next/navigation';

export default function GlobalConnectionManager() {
    const {
        apiUrl,
        ewmrsUrl,
        isConnected,
        isAutoConnecting,
        loading,
        error,
        handleConnect
    } = useMapContext();
    const pathname = usePathname();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Don't show connection modal on landing page or before mount
    if (!mounted || pathname === '/') return null;

    // Only show modal if NOT connected and NOT currently auto-connecting on mount.
    // ConnectionModal handles loading state visualization for manual connections.
    return (
        <ConnectionModal
            key={`global-modal-${apiUrl}-${ewmrsUrl}`}
            isOpen={!isConnected && !isAutoConnecting}
            loading={loading}
            error={error}
            initialApiUrl={apiUrl}
            initialEwmrsUrl={ewmrsUrl}
            onConnect={handleConnect}
        />
    );
}
