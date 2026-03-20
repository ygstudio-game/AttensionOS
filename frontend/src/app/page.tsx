import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-sky-500/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <nav className="relative z-50 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg shadow-lg shadow-sky-500/20 flex items-center justify-center">
            <span className="font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Attention<span className="text-sky-400">OS</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
        </div>
        <Link 
          href="/focuslens" 
          className="bg-white text-slate-950 px-5 py-2 rounded-full font-bold text-sm hover:bg-sky-400 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
        >
          Launch App
        </Link>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        {/* Hero Section */}
        <section className="text-center space-y-8 mb-32">
          <div className="inline-block px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold tracking-widest uppercase mb-4 animate-bounce">
            Privacy-First Computer Vision
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-6">
            QUANTIFY YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-purple-600">
              FOCUS INSTANTLY.
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            The browser-powered attention engine that tracks your gaze and posture to optimize deep work—completely offline and 100% private.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link 
              href="/focuslens" 
              className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              Get Started with FocusLens
            </Link>
            <button className="bg-slate-900 border border-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all">
              Watch Demo
            </button>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
          {[
            {
              title: "3D Motion Tracking",
              desc: "Engineered with 3D vectoring for Pitch, Yaw, and Roll detection. Zero calibration required.",
              icon: "🎯",
              color: "from-sky-500/20"
            },
            {
              title: "Adaptive Interface",
              desc: "Experience FocusLens, where your distraction levels dynamically blur content to protect your flow.",
              icon: "🔍",
              color: "from-blue-500/20"
            },
            {
              title: "Live Analytics",
              desc: "Deep Work Minutes (DWM) and focus history charts provide actionable insights into your attention spent.",
              icon: "📊",
              color: "from-purple-500/20"
            }
          ].map((f, i) => (
            <div key={i} className={`p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-md hover:border-slate-700 transition-all group overflow-hidden relative`}>
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${f.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-2xl`} />
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-sky-400 transition-colors">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Privacy Section */}
        <section id="privacy" className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-[40px] border border-white/5 p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
          <h2 className="text-4xl font-black mb-6">Zero Video Data Transmission</h2>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed mb-10">
            AttentionOS processes all video telemetry <span className="text-white font-bold">locally in your browser</span>. We never send your video feed to any server, guaranteeing complete user privacy while you focus on what matters.
          </p>
          <div className="flex justify-center gap-12 grayscale opacity-50">
             <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-widest font-bold">Client Side</span>
                <span className="text-[10px] text-slate-500">No WebSockets</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-widest font-bold">WASM Powered</span>
                <span className="text-[10px] text-slate-500">Brave Performance</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-widest font-bold">Zero Trust</span>
                <span className="text-[10px] text-slate-500">Security Built-in</span>
             </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
              <span className="text-slate-950 text-[10px] font-bold">A</span>
            </div>
            <span className="text-xs font-bold tracking-tight">AttentionOS © 2026</span>
          </div>
          <p className="text-slate-600 text-[10px] uppercase tracking-tighter">
            Built for the future of deep work. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}