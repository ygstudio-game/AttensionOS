"use client"
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useFocusStore } from '@/store/useFocusStore';

export function Navbar() {
  const isEyeCareEnabled = useFocusStore(s => s.isEyeCareEnabled);
  const toggleEyeCare = useFocusStore(s => s.toggleEyeCare);

  return (
    <nav className="relative z-50 flex justify-between items-center px-8 py-4 max-w-7xl mx-auto w-full">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#00E5FF] to-[#0091EA] shadow-lg" style={{ boxShadow: '0 0 20px rgba(0,229,255,0.3)' }}>
          <span className="font-bold text-sm text-[#0A0C10]">A</span>
        </div>
        <span className="text-lg font-bold tracking-tight text-white">Attention<span className="text-[#00E5FF]">OS</span></span>
      </Link>

      <div className="hidden md:flex gap-2 items-center">
        <Link href="/focuslens" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all duration-300">
          FocusLens
        </Link>
        <Link href="/features/smart-media-pause" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all duration-300">
          AutoPause
        </Link>
        <Link href="/features/flow-state-dashboard" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all duration-300">
          Flow State
        </Link>

        {/* EyeCare Toggle */}
        <button
          onClick={toggleEyeCare}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border ${isEyeCareEnabled
              ? 'border-[#22D3A7]/30 bg-[#22D3A7]/10 text-[#22D3A7]'
              : 'border-white/10 bg-white/5 text-white/40 hover:text-white/60 hover:border-white/20'
            }`}
          title={isEyeCareEnabled ? 'EyeCare: ON' : 'EyeCare: OFF'}
        >
          {isEyeCareEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span>EyeCare</span>
          <div className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${isEyeCareEnabled ? 'bg-[#22D3A7]' : 'bg-white/15'}`}>
            <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform duration-300 shadow-sm ${isEyeCareEnabled ? 'translate-x-[19px]' : 'translate-x-[3px]'}`} />
          </div>
        </button>
      </div>

      <Link
        href="/focuslens"
        className="group flex items-center gap-2.5 bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] text-[#0A0C10] px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        Launch App
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </nav>
  );
}
