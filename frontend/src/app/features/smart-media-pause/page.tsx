"use client"
import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { CameraEngine } from '@/components/engine/CameraEngine';
import { useFocusStore } from '@/store/useFocusStore';
import { PlayCircle, PauseCircle, RotateCcw } from 'lucide-react';

export default function SmartMediaPausePage() {
  const { isFocused } = useFocusStore();
  const [showRewindMsg, setShowRewindMsg] = useState(false);
  const [wasPaused, setWasPaused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setWasPaused(true);
      setShowRewindMsg(false);
    } else if (isFocused && wasPaused) {
      setShowRewindMsg(true);
      setWasPaused(false);
      const timer = setTimeout(() => setShowRewindMsg(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isFocused, wasPaused]);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white font-sans selection:bg-[var(--neon-cyan)]/20 dot-grid relative overflow-hidden">
      {/* Ambient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="ambient-orb-purple animate-subtle-drift" style={{ top: '-10%', left: '-10%', opacity: 0.3 }} />
      </div>

      <Navbar />
      <CameraEngine showPreview={true} />

      <main className="relative z-10 w-full pt-20 pb-32 px-8 max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-8 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#A855F7]/30 bg-[#A855F7]/10 text-[#A855F7] text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-md">
            <PlayCircle className="w-3.5 h-3.5" />
            E-Learning & Productivity Module
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] drop-shadow-2xl">
            Introducing <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] via-[#00B4D8] to-[#00E5FF] drop-shadow-lg">
              AutoPause
            </span>
          </h1>

          <p className="text-white/60 text-lg md:text-xl max-w-2xl leading-relaxed font-medium">
            Never miss a crucial moment of your lecture. An extension feature built for true focus continuity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.1)] group">
            <div className="absolute inset-0 bg-[#0A0C10] flex flex-col items-center justify-center relative">
               {/* Mock Video UI */}
               <div className={`w-3/4 h-3/4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden transition-transform duration-700 ${!isFocused ? 'scale-95 border-[#FF3B5C]/50 shadow-[0_0_30px_rgba(255,59,92,0.2)]' : 'scale-100 border-[#00E5FF]/30'}`}>
                  <div className={`absolute inset-0 bg-gradient-to-tr transition-opacity duration-500 opacity-100 ${!isFocused ? 'from-[#FF3B5C]/20 to-transparent' : 'from-[#00E5FF]/10 to-transparent'}`} />
                  
                  {/* Dynamic Icons */}
                  <div className="flex items-center justify-center relative w-full h-full">
                    <div className={`absolute transition-all duration-300 transform ${!isFocused ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                      <PauseCircle className="w-20 h-20 text-[#FF3B5C] animate-pulse" />
                      <p className="text-[#FF3B5C] text-xs font-bold uppercase tracking-widest mt-4 text-center">Video Auto-Paused</p>
                    </div>
                    <div className={`absolute transition-all duration-300 transform ${showRewindMsg ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                      <RotateCcw className="w-20 h-20 text-[#00E5FF] animate-spin-once" />
                      <p className="text-[#00E5FF] text-xs font-bold uppercase tracking-widest mt-4 text-center">Rewinding 5s...</p>
                    </div>
                    {isFocused && !showRewindMsg && (
                      <div className="absolute transition-all duration-300 scale-100 opacity-20">
                        <PlayCircle className="w-20 h-20 text-white" />
                        <p className="text-white text-xs font-bold uppercase tracking-widest mt-4 text-center">Playing</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
            
            <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 ${!isFocused ? 'bg-[#FF3B5C]/20 border-[#FF3B5C]/50 text-[#FF3B5C]' : 'bg-[#00E5FF]/20 border-[#00E5FF]/50 text-[#00E5FF]'}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${!isFocused ? 'bg-[#FF3B5C]' : 'bg-[#00E5FF]'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{!isFocused ? 'User Distracted' : 'User Focused'}</span>
            </div>
            
            <div className={`absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-xl border border-[#00E5FF]/30 shadow-[0_0_20px_rgba(0,229,255,0.2)] rounded-xl p-4 transform transition-all duration-500 ${showRewindMsg ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
              <p className="text-[#00E5FF] font-mono text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5" />
                Focus Regained
              </p>
              <p className="text-white/90 text-sm font-medium">Rewinding 5 seconds and resuming playback automatically.</p>
            </div>
          </div>

          <div className="order-1 md:order-2 space-y-8">
            <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-2 h-full bg-[#FF3B5C] group-hover:bg-[#A855F7] transition-colors duration-500" />
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
                <PauseCircle className="text-[#A855F7]" />
                The Pain Point
              </h3>
              <p className="text-white/50 leading-relaxed">
                Students and developers often lose track of time or get distracted while watching long tutorials or reading documentation, missing crucial information when they inevitably look away.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-[#A855F7]/20 bg-[#A855F7]/5 backdrop-blur-xl relative overflow-hidden">
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-3 text-[#A855F7]">
                <RotateCcw className="text-[#A855F7]" />
                How It Works
              </h3>
              <p className="text-white/70 leading-relaxed">
                If you look away from the screen or pick up your phone, the extension automatically pauses the video. When you look back, it automatically resumes and rewinds by 5 seconds to catch what you missed seamlessly.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
