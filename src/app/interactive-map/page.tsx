'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR of Leaflet component which depends on window
const LeafletMap = dynamic(() => import('@/components/Map/LeafletMap'), {
  ssr: false,
  loading: () => <div className="h-screen w-full flex items-center justify-center bg-gray-900 text-white">Loading Map...</div>
});

export default function InteractiveMapPage() {
  return <LeafletMap />;
}
