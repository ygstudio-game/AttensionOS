"use client"
import { useEffect, useRef, useState } from "react";
import { AttentionEngine } from "@/lib/engine/AttentionEngine";
import { useFocusStore } from "@/store/useFocusStore";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export function CameraEngine({ showPreview = false }: { showPreview?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const [calcEngine] = useState(() => new AttentionEngine());
  const updateFromEngine = useFocusStore(s => s.updateFromEngine);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let animationId: number;
    let cameraStream: MediaStream | null = null;
    let lastUpdateTime = 0;
    let isActive = true;

    const initEngine = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/mediapipe/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO"
        });

        if (!isActive) return;
        landmarkerRef.current = landmarker;
        setIsInitializing(false);
        startTracking();
      } catch (error) {
        console.error("Failed to initialize FaceLandmarker:", error);
      }
    };

    const startTracking = async () => {
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 }
        });

        if (videoRef.current && isActive) {
          videoRef.current.srcObject = cameraStream;
          videoRef.current.onloadedmetadata = () => {
            const loop = () => {
              if (!isActive) return;
              if (landmarkerRef.current && videoRef.current && videoRef.current.readyState >= 2) {
                const now = Date.now();
                if (now - lastUpdateTime >= 100) {
                  try {
                    const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
                    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                      calcEngine.processRawResults(results.faceLandmarks, updateFromEngine);
                    } else {
                      updateFromEngine({
                        focusScore: 0,
                        faceDetected: false,
                        isDrowsy: false,
                        isDistracted: true,
                        headAligned: false,
                        gazePosition: undefined,
                        saccadeDetected: false,
                        fixationDuration: 0,
                        multipleFacesDetected: false,
                        isBlinking: false
                      });
                    }
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
      isActive = false;
      cancelAnimationFrame(animationId);
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [updateFromEngine, calcEngine]);

  const showCameraPreviewGlobal = useFocusStore(s => s.showCameraPreview);
  const displayPreview = showPreview && showCameraPreviewGlobal;

  return (
    <div className={displayPreview ? "fixed bottom-5 right-5 z-50 pointer-events-none" : "hidden"}>
      <div className="w-32 h-24 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,229,255,0.15)] border border-[#00E5FF]/30 relative bg-[#0A0C10]">
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0C10]/80 backdrop-blur-sm z-10">
            <div className="w-5 h-5 border-2 border-[#00E5FF]/30 border-t-[#00E5FF] rounded-full animate-spin" />
          </div>
        )}
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover scale-x-[-1]" 
          autoPlay 
          playsInline 
          muted 
        />
      </div>
    </div>
  );
}
