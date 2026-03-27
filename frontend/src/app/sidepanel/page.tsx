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

  const [calcEngine] = useState(() => new AttentionEngine());
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceMeshRef = useRef<FaceLandmarker | null>(null);

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
          runningMode: "VIDEO"
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
                  isDrowsy: false, headAligned: false, saccadeDetected: false, fixationDuration: 0
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
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'UPDATE_FOCUS_STATE',
              isFocused: isFocused && faceDetected
            }).catch(() => { });
          }
        });
      }
    };

    broadcastState();
  }, [isFocused, faceDetected]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white font-sans p-4 overflow-y-auto overflow-x-hidden">
      <header className="mb-6">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
          AttentionOS
        </h1>
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Side Panel Engine</p>
      </header>

      <div className="relative w-full aspect-video border border-white/10 rounded-xl overflow-hidden mb-6 shadow-xl bg-slate-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        {!engineReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
            <div className="absolute mt-12 text-[10px] text-sky-400 font-mono">
              {faceMeshReady ? "Starting Camera..." : "Initializing AI..."}
            </div>
          </div>
        )}
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${faceDetected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-slate-900/40 p-1 rounded-2xl border border-white/5 shadow-inner">
          <FocusMeter />
        </div>
        <div className={`p-4 rounded-xl border transition-all duration-500 ${isFocused ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isFocused ? 'bg-sky-400' : 'bg-amber-400'}`} />
            <span className="text-sm font-semibold uppercase tracking-wider">
              {isFocused ? 'System Focused' : 'Distraction Detected'}
            </span>
          </div>
        </div>
        <CompactAnalyticsWidget />
      </div>

      <footer className="mt-auto pt-8 pb-2 text-[10px] text-slate-600 text-center font-mono uppercase tracking-tighter">
        Biometric Feedback Active • V1.0.0
      </footer>
    </div>
  );
}