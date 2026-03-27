import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="relative z-50 flex justify-between items-center px-8 py-5 max-w-7xl mx-auto w-full">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#00E5FF] to-[#0091EA] shadow-lg" style={{ boxShadow: '0 0 20px rgba(0,229,255,0.3)' }}>
          <span className="font-bold text-sm text-[#0A0C10]">A</span>
        </div>
        <span className="text-lg font-bold tracking-tight text-white">Attention<span className="text-[#00E5FF]">OS</span></span>
      </Link>
      <div className="hidden md:flex gap-8 text-sm font-medium text-white/40">
        {/* <Link href="/features/blinksecure" className="hover:text-[#00E5FF] transition-colors duration-300">BlinkSecure</Link> */}
        <Link href="/features/smart-media-pause" className="hover:text-[#00E5FF] transition-colors duration-300">Media Focus</Link>
        <Link href="/features/flow-state-dashboard" className="hover:text-[#00E5FF] transition-colors duration-300">Flow State</Link>
      </div>
      <Link
        href="/focuslens"
        className="group flex items-center gap-2 bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] text-[#0A0C10] px-5 py-2 rounded-full font-bold text-sm hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        Launch App
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </nav>
  );
}
