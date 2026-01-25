'use client';

import Link from 'next/link';
import Image from 'next/image';
import LightningEffect from '@/components/LightningEffect';
import { ArrowRight, BookOpen, Github, Instagram } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#07112a] text-white selection:bg-blue-500/30">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.1),rgba(0,0,0,0))]" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen" />
      
      <LightningEffect />

      <div className="relative z-10 w-full max-w-4xl px-6">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl ring-1 ring-white/10 relative overflow-hidden group">
          
          {/* Subtle sheen effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="flex flex-col items-center text-center space-y-8">
            
            {/* Logo Section */}
            <div className="relative group/logo">
              <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full opacity-50 group-hover/logo:opacity-75 transition-opacity duration-500" />
              <div className="relative w-32 h-32 md:w-40 md:h-40 bg-black/20 backdrop-blur-sm rounded-3xl p-4 border border-white/10 shadow-xl transform group-hover/logo:scale-105 transition-transform duration-500 ease-out">
                <Image 
                  src="/assets/EdgeWARN.png" 
                  alt="EdgeWARN Logo" 
                  width={160} 
                  height={160}
                  className="w-full h-full object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent drop-shadow-sm">
                EdgeWARN
              </h1>
              <p className="text-xl md:text-2xl font-medium text-blue-200/90 tracking-wide">
                Severe Weather Nowcasting
              </p>
              <p className="text-lg text-slate-400 leading-relaxed max-w-lg mx-auto">
                High-resolution, real-time weather intelligence for communities and first responders.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-4">
              <Link 
                href="/interactive-map" 
                className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Launch App
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </Link>
              
              <Link 
                href="/coming-soon" 
                className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-lg font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                  Documentation
                </span>
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-6 pt-8 border-t border-white/5 w-full justify-center">
              <a 
                href="https://www.github.com/ewsofficial/EdgeWARN-Core" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors transform hover:scale-110 duration-200"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6" />
              </a>
              <a 
                href="https://www.instagram.com/edgemontweatherservice" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-pink-400 transition-colors transform hover:scale-110 duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>

          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-slate-600 font-medium tracking-wider uppercase">
          &copy; {new Date().getFullYear()} Edgemont Weather Service
        </div>
      </div>
    </main>
  );
}