"use client"
import { useFocusStore } from "@/store/useFocusStore"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export function FocusMeter() {
  const { focusScore, isFocused, faceDetected } = useFocusStore()

  return (
    <div className="w-72 p-5 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-xl shadow-2xl">
      <div className="flex justify-between items-center mb-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Attention Engine
          </span>
          <span className={cn(
            "text-sm font-black transition-colors duration-300",
            isFocused ? "text-sky-400" : "text-orange-500"
          )}>
            {faceDetected ? (isFocused ? "DEEP FOCUS" : "DISTRACTED") : "SEARCHING..."}
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-mono font-bold text-slate-100">
            {focusScore}<span className="text-xs text-slate-500">%</span>
          </span>
        </div>
      </div>

      <Progress 
        value={focusScore} 
        className="h-1.5 bg-slate-800" 
        // Note: shadcn progress doesn't support custom indicator colors easily via props, 
        // so ensure your global.css handles the transition or use inline styles.
      />

      <div className="mt-4 flex gap-2 items-center">
        <div className={cn(
          "w-2 h-2 rounded-full animate-pulse",
          faceDetected ? "bg-green-500" : "bg-red-500"
        )} />
        <span className="text-[10px] text-slate-400 font-medium">
          {faceDetected ? "Biometric Stream Active" : "No Face Detected"}
        </span>
      </div>
    </div>
  )
}