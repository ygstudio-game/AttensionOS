"use client"
import { useFocusStore } from "@/store/useFocusStore"
import { cn } from "@/lib/utils"

export function FocusMeter() {
  const { focusScore, isFocused, faceDetected } = useFocusStore()

  return (
    <div className="w-64 p-4 glass-panel rounded-2xl">
      <div className="flex justify-between items-center mb-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">
            Attention Engine
          </span>
          <span className={cn(
            "text-xs font-black tracking-wide transition-all duration-500",
            isFocused ? "text-[#00E5FF] text-glow-cyan" : "text-[#FF3B5C] text-glow-red"
          )}>
            {faceDetected ? (isFocused ? "DEEP FOCUS" : "DISTRACTED") : "SEARCHING..."}
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-mono font-bold text-white/90">
            {focusScore}<span className="text-xs text-white/25 ml-0.5">%</span>
          </span>
        </div>
      </div>

      {/* Neon Progress Bar */}
      <div className="neon-progress-track h-1">
        <div
          className={isFocused ? "neon-progress-fill-cyan" : "neon-progress-fill-red"}
          style={{ width: `${focusScore}%`, height: '100%' }}
        />
      </div>

      <div className="mt-3 flex gap-2 items-center">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full animate-pulse",
          faceDetected ? "bg-[#00E5FF]" : "bg-[#FF3B5C]"
        )}
          style={faceDetected ? { boxShadow: '0 0 6px rgba(0,229,255,0.6)' } : { boxShadow: '0 0 6px rgba(255,59,92,0.6)' }}
        />
        <span className="text-[10px] text-white/25 font-medium">
          {faceDetected ? "Biometric Stream Active" : "No Face Detected"}
        </span>
      </div>
    </div>
  )
}