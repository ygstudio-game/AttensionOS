"use client"
import { useEffect, useState, useRef } from "react";
import { useFocusStore } from "@/store/useFocusStore";
import { FocusMeter } from "@/components/focuslens/FocusMeter";
import { CompactAnalyticsWidget } from "@/components/focuslens/AnalyticsDashboard";
import { AttentionEngine } from "@/lib/engine/AttentionEngine";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

declare const chrome: any;

export default function SidePanelPage() {
  const [engineReady, setEngineReady] = useState(false);
  const [faceMeshReady, setFaceMeshReady] = useState(false);
  const updateFromEngine = useFocusStore(s => s.updateFromEngine);
  const isFocused = useFocusStore(s => s.isFocused);
  const faceDetected = useFocusStore(s => s.faceDetected);
  const multipleFacesDetected = useFocusStore(s => s.multipleFacesDetected);
  const isSmartMediaPauseEnabled = useFocusStore(s => s.isSmartMediaPauseEnabled);
  const isFocusLensEnabled = useFocusStore(s => s.isFocusLensEnabled);
  const toggleSmartMediaPause = useFocusStore(s => s.toggleSmartMediaPause);
  const toggleFocusLens = useFocusStore(s => s.toggleFocusLens);
  const isEyeCareEnabled = useFocusStore(s => s.isEyeCareEnabled);
  const toggleEyeCare = useFocusStore(s => s.toggleEyeCare);

  const lastBlinkTime = useFocusStore(s => s.lastBlinkTime);
  const smartMediaRewindAmount = useFocusStore(s => s.smartMediaRewindAmount);
  const setSmartMediaRewindAmount = useFocusStore(s => s.setSmartMediaRewindAmount);
  const showCameraPreview = useFocusStore(s => s.showCameraPreview);
  const toggleCameraPreview = useFocusStore(s => s.toggleCameraPreview);
  const isAudioMuted = useFocusStore(s => s.isAudioMuted);
  const toggleAudioMute = useFocusStore(s => s.toggleAudioMute);
  const isSpeechEnabled = useFocusStore(s => s.isSpeechEnabled);
  const toggleSpeech = useFocusStore(s => s.toggleSpeech);

  const [calcEngine] = useState(() => new AttentionEngine());
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceMeshRef = useRef<FaceLandmarker | null>(null);

  const [eyeStrainWarning, setEyeStrainWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // 5 second blink reminder (5,000 ms)
      if (Date.now() - lastBlinkTime > 5000 && isFocused && isEyeCareEnabled) {
        setEyeStrainWarning(true);
      } else {
        setEyeStrainWarning(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastBlinkTime, isFocused, isEyeCareEnabled]);

  // Initialize FaceLandmarker
  useEffect(() => {
    let animationFrameId: number;
    let cameraStream: MediaStream | null = null;

    const initLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "/mediapipe/wasm"
        );

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/mediapipe/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 2 // Detect shoulder surfers!
        });

        faceMeshRef.current = landmarker;
        setFaceMeshReady(true);
        console.log("SidePanel: FaceLandmarker Initialized (Module)");

        // Start Camera after landmarker is ready
        try {
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240, frameRate: 15 }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = cameraStream;
          }
        } catch (err) {
          console.error("SidePanel Camera Access Error:", err);
          if ((err as any).name === 'NotAllowedError' && typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.create({ url: 'onboarding.html' });
          }
        }

        const processFrames = () => {
          if (videoRef.current && faceMeshRef.current && videoRef.current.readyState >= 2) {
            try {
              const results = faceMeshRef.current.detectForVideo(videoRef.current, performance.now());
              setEngineReady(true);
              if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                calcEngine.processRawResults(results.faceLandmarks, updateFromEngine);
              } else {
                updateFromEngine({
                  focusScore: 0, faceDetected: false, isDistracted: true,
                  isDrowsy: false, headAligned: false, saccadeDetected: false, fixationDuration: 0,
                  multipleFacesDetected: false, isBlinking: false
                });
              }
            } catch (err) {
              console.error("FaceLandmarker Detect Error:", err);
            }
          }
          animationFrameId = requestAnimationFrame(processFrames);
        };

        processFrames();
      } catch (err) {
        console.error("FaceLandmarker Init Error:", err);
      }
    };

    initLandmarker();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    // Broadcast current state to the Active Tab
    const broadcastState = () => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
          if (tabs[0]?.id) {
            let shouldBlur = false;

            // FocusLens: Blur if you get distracted or drowsy
            if (isFocusLensEnabled && !isFocused) {
              shouldBlur = true;
            }

            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'UPDATE_FOCUS_STATE',
              isFocused: isFocused && faceDetected,
              shouldBlur,
              isSmartMediaPauseEnabled,
              smartMediaRewindAmount
            }).catch(() => { });
          }
        });
      }
    };

    broadcastState();
  }, [isFocused, faceDetected, isSmartMediaPauseEnabled, smartMediaRewindAmount, isFocusLensEnabled]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white font-sans p-4 overflow-y-auto overflow-x-hidden">
      <header className="mb-6 shrink-0">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
          AttentionOS
        </h1>
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Side Panel Engine</p>
      </header>

      {showCameraPreview && (
        <div className="w-full bg-slate-900 border border-white/10 rounded-xl overflow-hidden mb-6 shadow-xl shrink-0 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto object-cover"
          />
          {!engineReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
              <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
              <div className="absolute mt-12 text-[10px] text-sky-400 font-mono">
                {faceMeshReady ? "Starting Camera..." : "Initializing AI..."}
              </div>
            </div>
          )}
          <div className={`absolute top-2 right-2 w-3 h-3 rounded-full z-20 ${faceDetected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
        </div>
      )}

      <div className="flex flex-col gap-6 w-full">
        {isFocusLensEnabled && (
          <div className="bg-slate-900/40 p-1 rounded-2xl border border-white/5 shadow-inner">
            <FocusMeter />
          </div>
        )}

        {/* Global Alerts Feed — Fixed height to prevent layout shifts */}
        <div className="space-y-2" style={{ minHeight: '120px' }}>
          <div className={`p-4 rounded-xl border transition-all duration-500 ${isFocused ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isFocused ? 'bg-sky-400' : 'bg-amber-400'}`} />
              <span className="text-sm font-semibold uppercase tracking-wider">
                {isFocused ? 'System Focused' : 'Distraction Detected'}
              </span>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border border-[#A855F7]/30 bg-[#A855F7]/10 text-[#A855F7] flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden ${
              !isFocused && isSmartMediaPauseEnabled ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0 p-0 border-transparent'
            }`}
          >
            <span className="text-xs font-bold tracking-widest uppercase">⏸ Media Auto-Paused</span>
          </div>

          <div
            className={`p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden ${
              eyeStrainWarning ? 'max-h-16 opacity-100 animate-pulse' : 'max-h-0 opacity-0 p-0 border-transparent'
            }`}
          >
            <span className="text-xs font-bold tracking-widest uppercase">👁 Eye Strain: Please Blink!</span>
          </div>
        </div>

        {/* Module Toggles */}
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 shadow-inner space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Active Modules</h3>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white/90">Focus Lens</span>
              <span className="text-[10px] text-slate-500">Distraction Blurring</span>
            </div>
            <button
              onClick={toggleFocusLens}
              className={`w-11 h-6 rounded-full transition-colors relative ${isFocusLensEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-[4px] transition-transform ${isFocusLensEnabled ? 'translate-x-[24px]' : 'translate-x-[4px]'}`} />
            </button>
          </div>

          <div className="w-full border-t border-white/5" />

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white/90">EyeCare</span>
              <span className="text-[10px] text-slate-500">Blink Reminders</span>
            </div>
            <button
              onClick={toggleEyeCare}
              className={`w-11 h-6 rounded-full transition-colors relative ${isEyeCareEnabled ? 'bg-[#22D3A7]' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-[4px] transition-transform ${isEyeCareEnabled ? 'translate-x-[24px]' : 'translate-x-[4px]'}`} />
            </button>
          </div>

          <div className="w-full border-t border-white/5" />

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white/90">Smart Media Pause</span>
              <span className="text-[10px] text-slate-500">Auto-Pause & Rewind</span>
            </div>
            <button
              onClick={toggleSmartMediaPause}
              className={`w-11 h-6 rounded-full transition-colors relative ${isSmartMediaPauseEnabled ? 'bg-[#A855F7]' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-[4px] transition-transform ${isSmartMediaPauseEnabled ? 'translate-x-[24px]' : 'translate-x-[4px]'}`} />
            </button>
          </div>

          <div className="w-full border-t border-white/5" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white/90">Rewind Amount</span>
            <select
              className="bg-slate-800 border-none outline-none rounded-lg text-xs px-2 py-1.5 font-mono text-white/80"
              value={smartMediaRewindAmount}
              onChange={(e) => setSmartMediaRewindAmount(Number(e.target.value))}
            >
              <option value={0}>0s (Off)</option>
              <option value={5}>5s</option>
              <option value={10}>10s</option>
            </select>
          </div>

          <div className="w-full border-t border-white/5" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white/90">Show Camera Preview</span>
            <button
              onClick={toggleCameraPreview}
              className={`w-11 h-6 rounded-full transition-colors relative ${showCameraPreview ? 'bg-indigo-500' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-[4px] transition-transform ${showCameraPreview ? 'translate-x-[24px]' : 'translate-x-[4px]'}`} />
            </button>
          </div>

          <div className="w-full border-t border-white/5" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white/90">Audio Alerts</span>
            <button
              onClick={toggleAudioMute}
              className={`w-11 h-6 rounded-full transition-colors relative ${!isAudioMuted ? 'bg-orange-500' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-[4px] transition-transform ${!isAudioMuted ? 'translate-x-[24px]' : 'translate-x-[4px]'}`} />
            </button>
          </div>

          <div className="w-full border-t border-white/5" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white/90">Voice Notifications (TTS)</span>
            <button
              onClick={toggleSpeech}
              className={`w-11 h-6 rounded-full transition-colors relative ${isSpeechEnabled ? 'bg-teal-500' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-[4px] transition-transform ${isSpeechEnabled ? 'translate-x-[24px]' : 'translate-x-[4px]'}`} />
            </button>
          </div>
        </div>
        {isFocusLensEnabled && <CompactAnalyticsWidget />}
      </div>

      <footer className="mt-auto pt-8 pb-2 text-[10px] text-slate-600 text-center font-mono uppercase tracking-tighter shrink-0">
        Biometric Feedback Active • V1.0.0
      </footer>
    </div>
  );
}