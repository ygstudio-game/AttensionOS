"use client"
import { useEffect, useRef, useState, useCallback } from "react";
import { AttentionEngine } from "@/lib/engine/AttentionEngine";
import { useFocusStore } from "@/store/useFocusStore";
import { FocusMeter } from "@/components/focuslens/FocusMeter";
import { AdaptiveReader } from "@/components/focuslens/AdaptiveReader";
import { AnalyticsDashboard } from "@/components/focuslens/AnalyticsDashboard";
import { CompactAnalyticsWidget } from "@/components/focuslens/AnalyticsDashboard";

export default function FocusLensPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const updateFromEngine = useFocusStore(s => s.updateFromEngine);
  const toggleAudioMute = useFocusStore(s => s.toggleAudioMute);
  const toggleSpeech = useFocusStore(s => s.toggleSpeech);
  const isSpeechEnabled = useFocusStore(s => s.isSpeechEnabled);

  useEffect(() => {
    let animationId: number;
    let engine: any;
    let lastUpdateTime = 0;

    const initEngine = async () => {
      // 1. Wait for the CDN script to attach 'FaceMesh' to the window
      const waitForFaceMesh = setInterval(async () => {
        if (typeof (window as any).FaceMesh !== "undefined") {
          clearInterval(waitForFaceMesh);
          
          engine = new AttentionEngine();
          setEngineReady(true);
          startTracking();
        }
      }, 500);
    };

    const startTracking = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            const loop = async () => {
              if (engine && videoRef.current) {
                const now = Date.now();
                // Throttle processing to 100ms to prevent infinite loops
                if (now - lastUpdateTime >= 100) {
                  try {
                    const results = await engine.processFrame(videoRef.current);
                    updateFromEngine(results);
                    lastUpdateTime = now;
                  } catch (error) {
                    console.warn('Frame processing error:', error);
                  }
                }
              }
              animationId = requestAnimationFrame(loop);
            };
            loop();
          };
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    initEngine();

    return () => {
      cancelAnimationFrame(animationId);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [updateFromEngine]);

  const handleToggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
  };

  const handleToggleAudio = () => {
    toggleAudioMute();
    setIsAudioMuted(!isAudioMuted);
  };

  return (
    <div className="relative h-screen bg-slate-950 overflow-hidden font-sans">
      {/* Camera Feed */}
      <div className="fixed bottom-4 left-4 w-40 h-28 border border-white/10 rounded-lg overflow-hidden z-50 shadow-2xl transition-all hover:scale-105 active:scale-95">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover scale-x-[-1]" 
          autoPlay 
          playsInline 
          muted 
        />
      </div>

      {/* Audio & Speech Controls */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => toggleSpeech()}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            isSpeechEnabled 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30' 
              : 'bg-slate-700/20 text-slate-400 border border-slate-500/50 hover:bg-slate-700/30'
          }`}
        >
          {isSpeechEnabled ? '🗣️ Speech On' : '😶 Speech Off'}
        </button>
        <button
          onClick={handleToggleAudio}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            isAudioMuted 
              ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
              : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
          }`}
        >
          {isAudioMuted ? '🔇 Muted' : '🔊 Audio'}
        </button>
      </div>

      {/* Right Side UI Container - Unified to prevent overlapping */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-4 items-end pointer-events-none">
        
        {/* Analytics Toggle */}
        <button
          onClick={handleToggleAnalytics}
          className={`pointer-events-auto px-4 py-2 rounded-lg font-semibold transition-all ${
            showAnalytics 
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50' 
              : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
          }`}
        >
          {showAnalytics ? '📊 Analytics Open' : '📊 Analytics Closed'}
        </button>

        {/* Focus Meter */}
        <div className="pointer-events-auto">
          <FocusMeter />
        </div>

        {/* Compact Analytics Widget */}
        {!showAnalytics && (
          <div className="pointer-events-auto w-64">
            <CompactAnalyticsWidget />
          </div>
        )}
      </div>

      
      <main className="container mx-auto px-8 pt-32 h-full">
        {!engineReady ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
              Initializing MediaPipe...
            </p>
          </div>
        ) : showAnalytics ? (
          /* Analytics Dashboard View */
          <AnalyticsDashboard isActive={true} />
        ) : (
          /* Reading View */
          <div className="max-w-2xl w-full mx-auto">
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">
                Deep Work
              </h1>
              <div className="w-12 h-1 bg-sky-500 mx-auto rounded-full opacity-50" />
            </div>
            
            <AdaptiveReader 
              content={`# The Art of Deep Work

## Introduction

Deep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information and produce better results in less time.

### Key Principles

- **Attention is a muscle**: The more you train it, the stronger it becomes
- **Distractions are costly**: Every interruption costs valuable cognitive resources
- **Flow state is precious**: Once broken, it takes significant time to re-enter

## Benefits of Deep Work

1. **Enhanced Learning**: Rapid mastery of complex subjects
2. **Improved Quality**: Higher quality output in less time
3. **Competitive Advantage**: In an increasingly distracted world, focus becomes rare and valuable
4. **Personal Satisfaction**: Deep engagement leads to greater fulfillment

## Practical Applications

### Academic Study
When studying complex material, maintain uninterrupted focus for 90-minute blocks. Use the 20-20-20 rule to prevent eye strain: every 20 minutes, look at something 20 feet away for 20 seconds.

### Creative Work
For writing, coding, or design work, eliminate all potential distractions. Turn off notifications, close unnecessary tabs, and create a dedicated workspace.

### Problem Solving
Complex problems require sustained attention. Break down large challenges into smaller components and tackle them systematically without interruption.

## Maintaining Focus

### Environment Optimization
- Ensure proper lighting to reduce eye strain
- Maintain comfortable room temperature
- Minimize background noise or use white noise if needed
- Keep your workspace clean and organized

### Personal Habits
- Get adequate sleep to maintain cognitive function
- Stay hydrated and maintain proper nutrition
- Take regular breaks to prevent mental fatigue
- Practice mindfulness to improve attention control

## Technology Integration

Modern tools can either enhance or hinder deep work. Use technology intentionally:

- **Block distracting websites** during focus sessions
- **Use focus-enhancing apps** that track attention and provide gentle reminders
- **Leverage automation** for routine tasks to free up mental bandwidth
- **Set boundaries** with communication tools

Remember: the goal is not to eliminate technology, but to use it in service of deep, meaningful work.

---

*This document adapts dynamically based on your attention patterns. When you look away or become distracted, the text will blur to encourage refocusing.*`}
              enableGazeScroll={true}
              enableSmartHighlighting={true}
              enableReadingSpeedAdaptation={true}
              enableBreakReminders={true}
            />
          </div>
        )}
      </main>

      {/* Compact Widget is now in the Unified Container above */}
    </div>
  );
}
