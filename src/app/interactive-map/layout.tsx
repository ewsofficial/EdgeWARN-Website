'use client';

import { MapContextProvider } from '@/components/Map/context/MapContext';

export default function InteractiveMapLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
        </>
    );
}
