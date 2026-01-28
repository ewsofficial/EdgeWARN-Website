'use client';

import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Github, Instagram, Zap, Shield, Map, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { useMapContext } from '@/components/Map/context/MapContext';
import { NWSAlertFeature } from '@/types';
import { getSeverityClasses } from '@/utils/styling';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import HomeDevelopersPanel from '@/components/UI/HomeDevelopersPanel';
import ViewportCull from '@/components/UI/ViewportCull';

// Lazy load effect components
const LightningEffect = lazy(() => import('@/components/LightningEffect'));
const GroundEffect = lazy(() => import('@/components/GroundEffect'));

export default function Home() {
  const { apiRef, isConnected } = useMapContext();
  const [activeAlerts, setActiveAlerts] = useState<NWSAlertFeature[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const hasFetchedRef = useRef(false);

  // Intersection observers for animated sections
  const [headerRef, headerVisible] = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '-100px 0px',
    threshold: 0.1
  });
  const [featuresRef, featuresVisible] = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '-100px 0px',
    threshold: 0.1
  });
  const [buttonsRef, buttonsVisible] = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '-100px 0px',
    threshold: 0.1
  });
  const [alertsRef, alertsVisible] = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '-100px 0px',
    threshold: 0.1
  });
  const [socialRef, socialVisible] = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '-100px 0px',
    threshold: 0.1
  });
  const [devsRef, devsVisible] = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '-100px 0px',
    threshold: 0.1
  });

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!isConnected || !apiRef.current || hasFetchedRef.current) return;

      try {
        setLoadingAlerts(true);
        const timestamps = await apiRef.current.fetchNWSTimestamps();
        if (timestamps.length > 0) {
          const latest = timestamps.sort().pop()!;
          const data = await apiRef.current.downloadNWS(latest);

          // Simple priority sort: Extreme > Severe > Moderate > Minor
          const severityOrder = { "Extreme": 0, "Severe": 1, "Moderate": 2, "Minor": 3, "Unknown": 4 };

          const sorted = data.data.features.sort((a: NWSAlertFeature, b: NWSAlertFeature) => {
            const sevA = a.properties.severity as keyof typeof severityOrder;
            const sevB = b.properties.severity as keyof typeof severityOrder;
            return (severityOrder[sevA] ?? 4) - (severityOrder[sevB] ?? 4);
          });

          setActiveAlerts(sorted.slice(0, 4));
        }
      } catch (e) {
        console.error("Failed to fetch homepage alerts", e);
      } finally {
        setLoadingAlerts(false);
        hasFetchedRef.current = true;
      }
    };

    if (isConnected) fetchAlerts();
  }, [isConnected, apiRef]);

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

      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-16 shadow-2xl ring-1 ring-white/10 relative overflow-hidden group will-change-transform">

          {/* Animated sheen effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTYwIDYwaC02MHYtNjBoNjB2NjB6IiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBkPSJNMzAgMzBoLTMydi0zMmgzMHYzMnoiIGZpbG9vbmVUdXJidWxlbmNlPSJ1dXNlclNwYWNlIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

          <div className="flex flex-col items-center space-y-8 sm:space-y-10">

            {/* Header Section: Logo + Text */}
            <div
              ref={headerRef}
              className={`flex flex-col items-center text-center space-y-4 sm:space-y-6 animate-on-scroll ${headerVisible ? 'fade-in' : ''}`}
            >

              {/* Logo and Titles - Stack on mobile, side-by-side on larger screens */}
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 md:gap-12">
                {/* Logo Section with Enhanced Effects */}
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

                {/* Text Content with Improved Typography */}
                <div className="flex flex-col justify-center">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tight bg-gradient-to-br from-cyan-300 via-blue-500 to-blue-900 bg-clip-text text-transparent drop-shadow-sm pb-1 sm:pb-2">
                    EdgeWARN
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 tracking-wide">
                    Severe Weather Nowcasting
                  </p>
                </div>
              </div>

              {/* Gray text beneath */}
              <p className="text-sm sm:text-base md:text-lg text-slate-400 leading-relaxed max-w-lg mx-auto px-4">
                High-resolution, real-time weather intelligence for communities and first responders.
              </p>
            </div>

            {/* Feature Highlights */}
            <div
              ref={featuresRef}
              className={`grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-2xl animate-on-scroll ${featuresVisible ? 'fade-in fade-in-delay-1' : ''}`}
            >
              <div className="flex flex-col items-center text-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mb-2" />
                <p className="text-xs sm:text-sm font-medium text-slate-300">Real-time Alerts</p>
              </div>
              <div className="flex flex-col items-center text-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 mb-2" />
                <p className="text-xs sm:text-sm font-medium text-slate-300">Community Safety</p>
              </div>
              <div className="flex flex-col items-center text-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                <Map className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 mb-2" />
                <p className="text-xs sm:text-sm font-medium text-slate-300">Nationwide Coverage</p>
              </div>
            </div>

            {/* Action Buttons with Enhanced Design */}
            <div
              ref={buttonsRef}
              className={`grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl mx-auto pt-4 animate-on-scroll ${buttonsVisible ? 'fade-in fade-in-delay-2' : ''}`}
            >
              <Link
                href="/interactive-map"
                className="group relative inline-flex items-center justify-center px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                  Launch App
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </Link>

              <Link
                href="/alerts"
                className="group relative inline-flex items-center justify-center px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold text-amber-400 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/30 hover:border-amber-500/50 rounded-xl transition-all duration-300 backdrop-blur-md"
              >
                <span className="flex items-center gap-2 sm:gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  View Alerts
                </span>
              </Link>

              <Link
                href="/coming-soon"
                className="group inline-flex items-center justify-center px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 backdrop-blur-md"
              >
                <span className="flex items-center gap-2 sm:gap-3">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 opacity-70 group-hover:opacity-100" />
                  Documentation
                </span>
              </Link>
            </div>

            {/* Active Alerts Preview Section */}
            <div
              ref={alertsRef}
              className={`w-full max-w-4xl pt-6 sm:pt-8 border-t border-white/5 animate-on-scroll ${alertsVisible ? 'fade-in fade-in-delay-3' : ''}`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 px-2 gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                  Active Alerts Preview
                </h3>
                <Link href="/alerts" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {loadingAlerts ? (
                  [1, 2].map(i => (
                    <div key={i} className="h-16 sm:h-20 rounded-xl bg-white/5 animate-pulse border border-white/5" />
                  ))
                ) : activeAlerts.length > 0 ? (
                  activeAlerts.map(alert => {
                    const colors = getSeverityClasses(alert.properties.severity);
                    return (
                      <Link
                        key={alert.id}
                        href={`/alerts?id=${alert.id}`}
                        className={`block relative overflow-hidden rounded-xl border ${colors.border} bg-black/20 hover:bg-white/5 transition-all duration-300 group/alert`}
                      >
                        <div className="flex items-center p-3 sm:p-4 gap-3 sm:gap-4">
                          <div className={`${colors.badge} w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2">
                              <h4 className={`font-bold truncate text-sm sm:text-base ${colors.text}`}>{alert.properties.event}</h4>
                              <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
                                {new Date(alert.properties.sent).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-400 truncate pr-2 sm:pr-4">
                              {alert.properties.headline || alert.properties.areaDesc}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 group-hover/alert:text-white group-hover/alert:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="text-center py-6 sm:py-8 border border-white/5 rounded-xl bg-white/5 backdrop-blur-sm">
                    <p className="text-slate-400 text-xs sm:text-sm">No significant weather alerts at this time.</p>
                  </div>
                )}
              </div>
            </div>

        </div>

            {/* Social Links with Enhanced Hover Effects */}
            <div
              ref={socialRef}
              className={`flex items-center gap-6 sm:gap-8 pt-8 sm:pt-12 border-t border-white/5 w-full justify-center animate-on-scroll ${socialVisible ? 'fade-in fade-in-delay-4' : ''}`}
            >
              <a
                href="https://www.github.com/ewsofficial/EdgeWARN-Core"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-all transform hover:scale-125 duration-300"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6 sm:w-7 sm:h-7" />
              </a>
              <a
                href="https://www.instagram.com/edgemontweatherservice"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-pink-400 transition-all transform hover:scale-125 duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6 sm:w-7 sm:h-7" />
              </a>
            </div>

          </div>
        </div>

        <div 
          ref={devsRef} 
          className={`mt-8 w-full max-w-6xl animate-on-scroll ${devsVisible ? 'fade-in' : ''}`}
        >
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl ring-1 ring-white/10 relative overflow-hidden group will-change-transform">
             {/* Animated sheen effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            <HomeDevelopersPanel />
          </div>
        </div>

        <div className="mt-8 sm:mt-12 text-center text-[10px] sm:text-xs text-slate-600 font-medium tracking-wider uppercase">
          © {new Date().getFullYear()} Edgemont Weather Service
        </div>
    </main>
  );
}
