import React from 'react';
import Link from 'next/link';
import { Eye, BarChart3, Shield, Zap, ArrowRight } from 'lucide-react';
import { LiquidEtherClient } from '@/components/ui/LiquidEtherClient';
import { Navbar } from '@/components/layout/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0C10] text-white font-sans selection:bg-[var(--neon-cyan)]/20 dot-grid relative overflow-hidden">
      {/* Ambient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="ambient-orb-cyan animate-subtle-drift" style={{ top: '-15%', left: '-10%' }} />
        <div className="ambient-orb-purple animate-subtle-drift" style={{ bottom: '-15%', right: '-10%', animationDelay: '-10s' }} />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 w-full pt-0 pb-32">
        {/* Hero Section */}
        <section className="relative text-center w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden mb-36 border-b border-white/5">
          {/* Liquid Ether Background */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
            <LiquidEtherClient 
              mouseForce={25}
              cursorSize={100}
              colors={['#06d8f4', '#00e1ff', '#00d5ff']}
              isViscous={false}
              autoDemo={true}
            />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-8 py-32 sm:py-40 flex flex-col items-center justify-center space-y-8 bg-gradient-to-b from-transparent via-[#0A0C10]/10 to-[#0A0C10]/60">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF] text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-md animate-pulse-glow">
              <Eye className="w-3.5 h-3.5" />
              Privacy-First Computer Vision
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] drop-shadow-2xl">
              QUANTIFY YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#00B4D8] to-[#A855F7] drop-shadow-lg">
                FOCUS INSTANTLY.
              </span>
            </h1>

            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              The browser-powered attention engine that tracks your gaze and posture to optimize deep work—completely offline and{' '}
              <span className="text-white font-bold">100% private</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link
                href="/focuslens"
                className="group flex items-center justify-center gap-2 bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] text-[#0A0C10] px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
                style={{ boxShadow: '0 0 40px rgba(0,229,255,0.4)' }}
              >
                Get Started with FocusLens
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="glass-panel px-8 py-4 rounded-2xl font-bold text-lg text-white/90 hover:text-white hover:border-white/30 backdrop-blur-xl transition-all duration-300 border border-white/10 bg-white/5 hover:bg-white/10 shadow-lg">
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-5 mb-36">
          {[
            {
              title: "3D Motion Tracking",
              desc: "Engineered with 3D vectoring for Pitch, Yaw, and Roll detection. Zero calibration required.",
              icon: <Zap className="w-6 h-6" />,
              accent: "#00E5FF"
            },
            {
              title: "Adaptive Interface",
              desc: "Experience FocusLens, where your distraction levels dynamically blur content to protect your flow.",
              icon: <Eye className="w-6 h-6" />,
              accent: "#A855F7"
            },
            {
              title: "Live Analytics",
              desc: "Deep Work Minutes (DWM) and focus history charts provide actionable insights into your attention.",
              icon: <BarChart3 className="w-6 h-6" />,
              accent: "#22D3A7"
            }
          ].map((f, i) => (
            <div
              key={i}
              className="group glass-panel p-8 rounded-2xl hover:border-white/15 transition-all duration-500 relative overflow-hidden"
            >
              {/* Hover glow accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${f.accent}, transparent)` }}
              />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${f.accent}15`, color: f.accent }}
              >
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-[#00E5FF] transition-colors duration-300">{f.title}</h3>
              <p className="text-white/35 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Privacy Section */}
        <div className="max-w-7xl mx-auto px-8">
          <section id="privacy" className="glass-panel-strong p-12 text-center relative overflow-hidden rounded-[2rem]">
          {/* Accent glow line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00E5FF]/60 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-[#00E5FF]/10 blur-[60px] rounded-full" />

          <div className="relative z-10">
            <Shield className="w-8 h-8 text-[#00E5FF]/60 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-black mb-6">Zero Video Data Transmission</h2>
            <p className="text-white/35 text-lg max-w-3xl mx-auto leading-relaxed mb-10">
              AttentionOS processes all video telemetry{' '}
              <span className="text-white/80 font-semibold">locally in your browser</span>.
              We never send your video feed to any server, guaranteeing complete user privacy.
            </p>

            <div className="flex justify-center gap-16">
              {[
                { label: "Client Side", sub: "No WebSockets" },
                { label: "WASM Powered", sub: "Native Perf" },
                { label: "Zero Trust", sub: "Security Built-in" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/30">{item.label}</span>
                  <span className="text-[10px] text-white/15">{item.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 opacity-40">
            <div className="w-5 h-5 bg-white/80 rounded flex items-center justify-center">
              <span className="text-[#0A0C10] text-[10px] font-bold">A</span>
            </div>
            <span className="text-xs font-bold tracking-tight">AttentionOS © 2026</span>
          </div>
          <p className="text-white/15 text-[10px] uppercase tracking-[0.15em]">
            Built for the future of deep work. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}