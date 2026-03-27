"use client"
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { CameraEngine } from '@/components/engine/CameraEngine';
import { LineChart, BarChart3, Database } from 'lucide-react';
import { CompactAnalyticsWidget } from '@/components/focuslens/AnalyticsDashboard';

export default function FlowStateDashboardPage() {
  return (
    <div className="min-h-screen bg-[#0A0C10] text-white font-sans selection:bg-[var(--neon-cyan)]/20 dot-grid relative overflow-hidden">
      {/* Ambient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="ambient-orb-cyan animate-subtle-drift" style={{ top: '30%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.15 }} />
      </div>

      <Navbar />
      <CameraEngine showPreview={true} />

      <main className="relative z-10 w-full pt-20 pb-32 px-8 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-8 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#22D3A7]/30 bg-[#22D3A7]/10 text-[#22D3A7] text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-md">
            <LineChart className="w-3.5 h-3.5" />
            Analytics Module
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] drop-shadow-2xl">
            Introducing the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22D3A7] via-[#00B4D8] to-[#00E5FF] drop-shadow-lg">
              Flow State Dashboard
            </span>
          </h1>

          <p className="text-white/60 text-lg md:text-xl max-w-2xl leading-relaxed font-medium">
            Instead of just alerting you, we quantify your true biological focus over time. All kept locally on your machine.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-8">
            <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
                <BarChart3 className="text-[#22D3A7]" />
                Quantify Deep Work
              </h3>
              <p className="text-white/50 leading-relaxed">
                Screen time isn't focus time. The Flow State Dashboard logs your actual "focus intervals" biologically verified by our edge-AI. You might stare at a screen for 8 hours, but only achieve 2 hours of true deep work. We help you find those 2 hours.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-[#22D3A7]/20 bg-[#22D3A7]/5 backdrop-blur-xl relative overflow-hidden">
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-3 text-[#22D3A7]">
                <Database className="text-[#22D3A7]" />
                Zero-Server Privacy
              </h3>
              <p className="text-white/70 leading-relaxed">
                Your biometric metrics are incredibly personal. That's why every data point on this dashboard is stored locally in your browser leveraging Next.js local state paradigms. Nothing is ever sent to a cloud server.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 flex justify-center">
             <div className="w-full max-w-sm transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
               {/* Embed actual Analytics Widget components for realistic feel */}
               <div className="glass-panel-strong p-6 rounded-3xl border border-[#22D3A7]/30 shadow-[0_0_50px_rgba(34,211,167,0.15)] bg-[#0A0C10]/80 backdrop-blur-2xl">
                 <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-widest text-center border-b border-white/5 pb-4">
                   Live Flow Example
                 </h4>
                 <CompactAnalyticsWidget />
                 
                 <div className="mt-8 p-4 bg-[#22D3A7]/10 border border-[#22D3A7]/20 rounded-xl text-center">
                   <p className="text-[#22D3A7] font-bold text-lg">"You maintained a solid flow state for 45 minutes today!"</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
