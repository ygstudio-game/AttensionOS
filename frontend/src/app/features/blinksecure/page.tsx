"use client"
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { CameraEngine } from '@/components/engine/CameraEngine';
import { useFocusStore } from '@/store/useFocusStore';
import { Shield, EyeOff, Lock } from 'lucide-react';

export default function BlinkSecurePage() {
  const { isFocused, faceDetected } = useFocusStore();
  const isSecure = isFocused && faceDetected;

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white font-sans selection:bg-[var(--neon-cyan)]/20 dot-grid relative overflow-hidden">
      {/* Ambient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="ambient-orb-cyan animate-subtle-drift" style={{ top: '-10%', right: '-10%', opacity: 0.3 }} />
      </div>

      <Navbar />
      <CameraEngine showPreview={true} />

      <main className="relative z-10 w-full pt-20 pb-32 px-8 max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-8 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF] text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-md">
            <Lock className="w-3.5 h-3.5" />
            Privacy & Security Module
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] drop-shadow-2xl">
            Introducing <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#00B4D8] to-white drop-shadow-lg">
              BlinkSecure
            </span>
          </h1>

          <p className="text-white/60 text-lg md:text-xl max-w-2xl leading-relaxed font-medium">
            Privacy shouldn't be reactive. BlinkSecure provides presence-based security that masks your data the millisecond you look away.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#FF3B5C] group-hover:bg-[#00E5FF] transition-colors duration-500" />
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
                <EyeOff className="text-[#FF3B5C] group-hover:text-[#00E5FF] transition-colors" />
                The Pain Point
              </h3>
              <p className="text-white/50 leading-relaxed">
                "Shoulder Surfing" and unauthorized data exposure in public spaces like cafes or open-plan offices puts your sensitive code and financial records at risk constantly.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-[#00E5FF]/20 bg-[#00E5FF]/5 backdrop-blur-xl relative overflow-hidden">
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-3 text-[#00E5FF]">
                <Shield className="text-[#00E5FF]" />
                How It Works
              </h3>
              <p className="text-white/70 leading-relaxed">
                By leveraging local 3D Head Alignment and Face Detection flags from our MediaPipe WASM engine, BlinkSecure automatically blurs or masks your sensitive tabs (banking, IDEs) the instant your face is no longer detected.
              </p>
            </div>
          </div>

          <div className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,229,255,0.1)]">
            {/* The "Sensitive" Background */}
            <div className={`absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80')] bg-cover bg-center transition-all duration-700 ${!isSecure ? 'blur-2xl' : 'blur-0'}`} />
            
            {/* The Blur Overlay */}
            <div className={`absolute inset-0 transition-all duration-700 flex items-center justify-center ${!isSecure ? 'bg-[#0A0C10]/80 backdrop-blur-2xl' : 'bg-transparent backdrop-blur-none pointer-events-none'}`}>
              <div className={`text-center p-8 transition-all duration-500 transform ${!isSecure ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <Shield className="w-20 h-20 text-[#00E5FF] mx-auto mb-6 animate-pulse-glow" />
                <h4 className="text-3xl font-black text-white mb-3">Screen Protected</h4>
                <p className="text-[#00E5FF] font-mono text-sm uppercase tracking-widest">{!faceDetected ? 'Presence Lost' : 'Distraction Detected'}</p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 ${!isSecure ? 'bg-[#FF3B5C]/20 border-[#FF3B5C]/50 text-[#FF3B5C]' : 'bg-[#00E5FF]/20 border-[#00E5FF]/50 text-[#00E5FF]'}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${!isSecure ? 'bg-[#FF3B5C]' : 'bg-[#00E5FF]'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{isSecure ? 'Secure' : 'Protected'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
