"use client"
import { useEffect, useRef, useState } from "react";
import { AttentionEngine } from "@/lib/engine/AttentionEngine";
import { useFocusStore } from "@/store/useFocusStore";
import { FocusMeter } from "@/components/focuslens/FocusMeter";
import { AdaptiveReader } from "@/components/focuslens/AdaptiveReader";
import { AnalyticsDashboard } from "@/components/focuslens/AnalyticsDashboard";
import { CompactAnalyticsWidget } from "@/components/focuslens/AnalyticsDashboard";
import { BarChart3, Mic, MicOff, Volume2, VolumeX, UploadCloud, FileText, Square } from "lucide-react";
import { extractTextFromFile } from "@/lib/utils/documentParser";

export default function FocusLensPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const updateFromEngine = useFocusStore(s => s.updateFromEngine);
  const toggleAudioMute = useFocusStore(s => s.toggleAudioMute);
  const toggleSpeech = useFocusStore(s => s.toggleSpeech);
  const isSpeechEnabled = useFocusStore(s => s.isSpeechEnabled);
  const isFocused = useFocusStore(s => s.isFocused);
  const resetSession = useFocusStore(s => s.resetSession);
  const [textContent, setTextContent] = useState<string | null>(null);
  
  // Session States: 'upload' -> 'ready' (doc selected) -> 'active' (started) -> 'completed'
  const [sessionState, setSessionState] = useState<'upload' | 'ready' | 'active' | 'completed'>('upload');
  const sessionActiveRef = useRef(false);

  const [fileName, setFileName] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsExtracting(true);
    setFileName(file.name);
    try {
      const type = file.name.split('.').pop()?.toLowerCase() || 'txt';
      
      if (type === 'pdf') {
        const url = URL.createObjectURL(file);
        setFileUrl(url);
        setFileType('pdf');
        setTextContent(null);
        setSessionState('ready');
      } else {
        const text = await extractTextFromFile(file);
        setTextContent(text);
        setFileUrl(null);
        setFileType(type);
        setSessionState('ready');
      }
    } catch (error) {
      console.error("Failed to parse document:", error);
      alert("Failed to parse this document type. Please try a .txt, .md, .pdf, or .docx file.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleStartSession = () => {
    resetSession();
    setSessionState('active');
    sessionActiveRef.current = true;
  };

  const handleEndSession = () => {
    setSessionState('completed');
    setShowAnalytics(true);
    sessionActiveRef.current = false;
    
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  useEffect(() => {
    let animationId: number;
    let engine: any;
    let lastUpdateTime = 0;

    const initEngine = async () => {
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
              if (engine && videoRef.current && sessionActiveRef.current) {
                const now = Date.now();
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

  const handleToggleAnalytics = () => setShowAnalytics(!showAnalytics);
  const handleToggleAudio = () => {
    toggleAudioMute();
    setIsAudioMuted(!isAudioMuted);
  };

  return (
    <div className={`relative min-h-screen bg-[#0A0C10] overflow-y-auto dot-grid ${!isFocused ? 'edge-vignette-red' : ''}`}
      style={{ transition: 'box-shadow 0.7s ease-in-out', fontFamily: 'var(--font-sans), system-ui, sans-serif' }}
    >
      {/* Ambient glow behind content */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="ambient-orb-cyan animate-subtle-drift" style={{ top: '10%', left: '30%', opacity: 0.5 }} />
      </div>

      {/* Camera Feed — Bottom-Left */}
      <div className="fixed bottom-5 left-5 z-50 group">
        <div
          className="w-40 h-28 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105 active:scale-95"
          style={{
            border: '1px solid rgba(0,229,255,0.15)',
            boxShadow: '0 0 20px rgba(0,229,255,0.08)',
          }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover scale-x-[-1]"
            autoPlay
            playsInline
            muted
          />
        </div>
      </div>

      {/* Audio & Speech Controls — Bottom-Right */}
      <div className="fixed bottom-5 right-5 z-50 flex gap-2">
        <button
          onClick={() => toggleSpeech()}
          className={`glass-panel flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
            isSpeechEnabled
              ? 'border-[#00E5FF]/30 text-[#00E5FF]'
              : 'text-white/30 hover:text-white/50'
          }`}
        >
          {isSpeechEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          <span className="hidden sm:inline">{isSpeechEnabled ? 'Speech' : 'Muted'}</span>
        </button>
        <button
          onClick={handleToggleAudio}
          className={`glass-panel flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
            isAudioMuted
              ? 'border-[#FF3B5C]/30 text-[#FF3B5C]'
              : 'border-[#22D3A7]/20 text-[#22D3A7]'
          }`}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{isAudioMuted ? 'Muted' : 'Audio'}</span>
        </button>
      </div>

      {/* Right Side UI — Top-Right Stack */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 items-end pointer-events-none">
        {/* Analytics Toggle */}
        <button
          onClick={handleToggleAnalytics}
          className={`pointer-events-auto glass-panel flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
            showAnalytics
              ? 'border-[#00E5FF]/30 text-[#00E5FF] glow-cyan'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          {showAnalytics ? 'Analytics' : 'Analytics'}
        </button>

        {/* Start Session Button */}
        {sessionState === 'ready' && (
          <button
            onClick={handleStartSession}
            className="pointer-events-auto shadow-[0_0_20px_rgba(34,211,167,0.3)] flex items-center gap-2 px-5 py-2.5 rounded-xl text-base font-bold bg-gradient-to-r from-[#22D3A7] to-[#00E5FF] text-[#0A0C10] hover:scale-105 transition-all duration-300"
          >
            Start Session
          </button>
        )}

        {/* End Session Button */}
        {sessionState === 'active' && (
          <button
            onClick={handleEndSession}
            className="pointer-events-auto glass-panel flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-[#FF3B5C]/30 text-[#FF3B5C] hover:bg-[#FF3B5C]/10 transition-all duration-300"
          >
            <Square className="w-4 h-4 fill-current" />
            End Session
          </button>
        )}

        {/* Focus Meter */}
        {!showAnalytics && sessionState === 'active' && (
          <div className="pointer-events-auto animate-in fade-in zoom-in duration-500">
            <FocusMeter />
          </div>
        )}

        {/* Compact Analytics Widget */}
        {!showAnalytics && sessionState === 'active' && (
          <div className="pointer-events-auto w-64 animate-in fade-in zoom-in duration-500">
            <CompactAnalyticsWidget />
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-8 pt-20 pb-24 min-h-screen relative z-10">
        {!engineReady && sessionState !== 'completed' ? (
          <div className="flex flex-col items-center gap-5 pt-20">
            <div
              className="w-12 h-12 rounded-full animate-spin"
              style={{
                border: '3px solid rgba(0,229,255,0.1)',
                borderTopColor: '#00E5FF',
                boxShadow: '0 0 20px rgba(0,229,255,0.15)',
              }}
            />
            <p className="text-white/25 font-mono text-xs uppercase tracking-[0.3em]">
              Initializing MediaPipe
            </p>
          </div>
        ) : showAnalytics || sessionState === 'completed' ? (
          <div className="max-w-6xl mx-auto pt-10">
            {sessionState === 'completed' && (
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-white/90 mb-3">
                  Session Complete
                </h1>
                <p className="text-white/40">Here's your comprehensive attention analytics.</p>
              </div>
            )}
            <AnalyticsDashboard isActive={true} />
          </div>
        ) : sessionState === 'upload' ? (
          <div className="max-w-2xl w-full mx-auto pt-20 flex flex-col items-center justify-center">
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-white/90 mb-3">
                Deep Work
              </h1>
              <div
                className="w-12 h-0.5 mx-auto rounded-full"
                style={{ background: '#00E5FF', boxShadow: '0 0 12px rgba(0,229,255,0.5)' }}
              />
              <p className="mt-6 text-white/50 text-lg">What are we focusing on today?</p>
            </div>
            
            <label className="group relative w-full cursor-pointer h-64 rounded-3xl border-2 border-dashed border-white/10 bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.04] hover:border-[#00E5FF]/50 transition-all duration-300 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/0 to-[#00E5FF]/5 group-hover:opacity-100 opacity-0 transition-opacity duration-500" />
              
              {isExtracting ? (
                <>
                  <div className="w-10 h-10 rounded-full animate-spin mb-4" style={{ border: '2px solid rgba(0,229,255,0.1)', borderTopColor: '#00E5FF' }} />
                  <p className="text-[#00E5FF] font-medium font-mono text-sm">Processing Document...</p>
                  <p className="text-white/30 text-xs mt-2">{fileName}</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#00E5FF]/10 transition-all duration-500">
                    <UploadCloud className="w-6 h-6 text-[#00E5FF]" />
                  </div>
                  <h3 className="text-lg font-bold text-white/90 mb-2">Upload Material</h3>
                  <p className="text-sm text-white/40 mb-4">Supported formats: PDF, DOCX, TXT, MD</p>
                  <div className="px-4 py-2 rounded-xl bg-white/5 text-xs text-white/60 group-hover:bg-[#00E5FF]/20 group-hover:text-[#00E5FF] transition-colors">
                    Browse Files
                  </div>
                </>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.docx,.txt,.md,.csv" 
                onChange={handleFileUpload}
                disabled={isExtracting}
              />
            </label>
            
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="w-px h-8 bg-white/10" />
              <button 
                onClick={() => {
                  setTextContent("# The Art of Deep Work\n\n## Introduction\n\nDeep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information and produce better results in less time.\n\n### Key Principles\n\n- **Attention is a muscle**: The more you train it, the stronger it becomes\n- **Distractions are costly**: Every interruption costs valuable cognitive resources\n- **Flow state is precious**: Once broken, it takes significant time to re-enter\n\n## Benefits of Deep Work\n\n1. **Enhanced Learning**: Rapid mastery of complex subjects\n2. **Improved Quality**: Higher quality output in less time\n3. **Competitive Advantage**: In an increasingly distracted world, focus becomes rare and valuable\n4. **Personal Satisfaction**: Deep engagement leads to greater fulfillment");
                  setFileUrl(null);
                  setFileType('markdown');
                  setSessionState('ready');
                }}
                className="px-4 py-2 text-sm text-white/40 hover:text-white/80 transition-colors"
              >
                Or use sample text
              </button>
              <div className="w-px h-8 bg-white/10" />
            </div>
          </div>
        ) : (
          <div className={`max-w-2xl w-full mx-auto transition-all duration-700 ${sessionState === 'ready' ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100 blur-0'}`}>
            {sessionState === 'ready' && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0C10]/60 backdrop-blur-md rounded-2xl pointer-events-auto">
                <div className="w-16 h-16 rounded-full bg-[#00E5FF]/20 flex items-center justify-center mb-6 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,1)]" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Ready to Focus?</h2>
                <p className="text-white/50 mb-8 max-w-sm text-center">Click the Start Session button in the top right to begin tracking your attention metrics.</p>
              </div>
            )}

            <div className="mb-6 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-white/90 mb-2">
                  Deep Work
                </h1>
                <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                  <FileText className="w-3.5 h-3.5" />
                  {fileName || "Sample Document"}
                </div>
              </div>
              <button 
                onClick={() => {
                  setTextContent(null);
                  setFileUrl(null);
                  setFileType(null);
                  setSessionState('upload');
                }}
                className="text-xs text-white/30 hover:text-[#FF3B5C] transition-colors"
                disabled={sessionState === 'active'}
              >
                Close Document
              </button>
            </div>

            <AdaptiveReader
              content={textContent || ""}
              fileUrl={fileUrl || undefined}
              fileType={fileType || undefined}
              enableGazeScroll={sessionState === 'active'}
              enableSmartHighlighting={sessionState === 'active'}
              enableReadingSpeedAdaptation={sessionState === 'active'}
              enableBreakReminders={sessionState === 'active'}
            />
          </div>
        )}
      </main>
    </div>
  );
}
