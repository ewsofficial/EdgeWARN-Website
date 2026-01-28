'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Clock, Wrench, Zap, ArrowRight } from 'lucide-react';
import ViewportCull from '@/components/UI/ViewportCull';

// Lazy load effect components
const LightningEffect = lazy(() => import('@/components/LightningEffect'));
const GroundEffect = lazy(() => import('@/components/GroundEffect'));

export default function ComingSoon() {
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

            {/* Logo and Title Section */}
            <div className={`flex flex-col items-center space-y-4 sm:space-y-6 ${mounted ? 'fade-in' : 'opacity-0'}`}>
              {/* Logo Section */}
              <div className="relative group/logo flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-blue-600/30 blur-3xl rounded-full opacity-50 group-hover/logo:opacity-75 transition-opacity duration-700" />
                <div className="relative w-24 h-24 sm:w-32 md:w-44 h-24 sm:h-32 md:h-44 overflow-hidden rounded-2xl transform group-hover/logo:scale-105 transition-all duration-500 ease-out">
                  <Image
                    src="/assets/EdgeWARN.png"
                    alt="EdgeWARN Logo"
                    width={176}
                    height={176}
                    className="w-full h-full object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>

              {/* Title */}
              <div className="flex flex-col items-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight bg-gradient-to-br from-cyan-300 via-blue-500 to-blue-900 bg-clip-text text-transparent drop-shadow-sm pb-1 sm:pb-2">
                  Coming Soon
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 tracking-wide">
                  Documentation & Resources
                </p>
              </div>
            </div>

            {/* Description */}
            <div className={`max-w-2xl mx-auto space-y-3 sm:space-y-4 ${mounted ? 'fade-in fade-in-delay-1' : 'opacity-0'}`}>
              <p className="text-sm sm:text-base md:text-lg text-slate-400 leading-relaxed">
                EdgeWARN is currently in active development. We're working hard to bring you comprehensive documentation and resources.
              </p>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                We are currently finalizing the design of the backend server to ensure a robust and reliable nowcasting experience.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-2xl ${mounted ? 'fade-in fade-in-delay-2' : 'opacity-0'}`}>
              <div className="flex flex-col items-center text-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 mb-2" />
                <p className="text-xs sm:text-sm font-medium text-slate-300">In Development</p>
              </div>
              <div className="flex flex-col items-center text-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mb-2" />
                <p className="text-xs sm:text-sm font-medium text-slate-300">Real-time Updates</p>
              </div>
              <div className="flex flex-col items-center text-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 mb-2" />
                <p className="text-xs sm:text-sm font-medium text-slate-300">Coming Soon</p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className={`flex items-center gap-3 py-4 ${mounted ? 'fade-in fade-in-delay-3' : 'opacity-0'}`}>
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </div>
              <span className="text-xs sm:text-sm text-amber-400 font-medium">Documentation Under Construction</span>
            </div>

            {/* Action Button */}
            <div className={`w-full max-w-md mx-auto pt-4 ${mounted ? 'fade-in fade-in-delay-4' : 'opacity-0'}`}>
              <Link
                href="/"
                className="group relative inline-flex items-center justify-center w-full px-8 py-3 sm:px-10 sm:py-4 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                  Back to Home
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </Link>
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
