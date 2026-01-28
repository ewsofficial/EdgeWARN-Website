'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, ArrowLeft, CloudRain, AlertCircle } from 'lucide-react';
import ViewportCull from '@/components/UI/ViewportCull';

// Lazy load effect components
const LightningEffect = lazy(() => import('@/components/LightningEffect'));
const GroundEffect = lazy(() => import('@/components/GroundEffect'));

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#050816] text-white selection:bg-purple-500/30">
      {/* Advanced Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(139,92,246,0.15),rgba(0,0,0,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.12),rgba(0,0,0,0))]" />
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/15 blur-[150px] rounded-full mix-blend-screen animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/15 blur-[150px] rounded-full mix-blend-screen animate-float-reverse" />

      {/* Lazy loaded effects with viewport culling */}
      <Suspense fallback={null}>
        <ViewportCull rootMargin="50px" threshold={0.1}>
          <LightningEffect />
        </ViewportCull>
        <ViewportCull rootMargin="50px" threshold={0.1}>
          <GroundEffect />
        </ViewportCull>
      </Suspense>

      <div className="relative z-10 w-full max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-16 shadow-2xl ring-1 ring-white/10 relative overflow-hidden group will-change-transform">

          {/* Animated sheen effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTYwIDYwaC02MHYtNjBoNjB2NjB6IiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBkPSJNMzAgMzBoLTMydi0zMmgzMHYzMnoiIGZpbG9vbmVUdXJidWxlbmNlPSJ1dXNlclNwYWNlIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">

            {/* 404 Number with Icon */}
            <div className={`flex flex-col items-center space-y-4 ${mounted ? 'fade-in' : 'opacity-0'}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-3xl rounded-full opacity-50" />
                <div className="relative flex items-center justify-center">
                  <AlertCircle className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500 mb-2" />
                  <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-sm">
                    404
                  </h1>
                </div>
              </div>

              {/* Error Message */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  Page Not Found
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-md mx-auto leading-relaxed">
                  The weather radar couldn't locate this page. It may have been moved, deleted, or never existed.
                </p>
              </div>
            </div>

            {/* Weather-themed Illustration */}
            <div className={`flex items-center justify-center gap-4 py-4 ${mounted ? 'fade-in fade-in-delay-1' : 'opacity-0'}`}>
              <CloudRain className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 animate-pulse" />
              <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="text-xs sm:text-sm text-slate-500 font-mono">SYSTEM: PAGE_MISSING</span>
              <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <CloudRain className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 animate-pulse" />
            </div>

            {/* Action Buttons */}
            <div className={`flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mx-auto pt-4 ${mounted ? 'fade-in fade-in-delay-2' : 'opacity-0'}`}>
              <Link
                href="/"
                className="group relative inline-flex items-center justify-center px-8 py-3 sm:px-10 sm:py-4 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] overflow-hidden w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                  Go Home
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </Link>

              <Link
                href="/interactive-map"
                className="group inline-flex items-center justify-center px-8 py-3 sm:px-10 sm:py-4 text-base sm:text-lg font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 backdrop-blur-md w-full sm:w-auto"
              >
                <span className="flex items-center gap-2 sm:gap-3">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 opacity-70 group-hover:opacity-100" />
                  Back to Map
                </span>
              </Link>
            </div>

            {/* Helpful Links */}
            <div className={`pt-6 sm:pt-8 border-t border-white/5 w-full ${mounted ? 'fade-in fade-in-delay-3' : 'opacity-0'}`}>
              <p className="text-xs sm:text-sm text-slate-500 mb-3">You might be looking for:</p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <Link
                  href="/interactive-map"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-200"
                >
                  Interactive Map
                </Link>
                <Link
                  href="/alerts/official"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-200"
                >
                  Weather Alerts
                </Link>
                <Link
                  href="/coming-soon"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-200"
                >
                  Documentation
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[10px] sm:text-xs text-slate-600 font-medium tracking-wider uppercase">
          © {new Date().getFullYear()} Edgemont Weather Service
        </div>
      </div>
    </main>
  );
}
