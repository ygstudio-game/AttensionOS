"use client"
import { useState } from "react";

export default function OnboardingPage() {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'success' | 'denied'>('idle');

  const requestCameraAccess = async () => {
    try {
      setStatus('requesting');
      // This triggers the native Chrome permission popup
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // If we get here, the user clicked "Allow". 
      // We immediately stop the camera; we just wanted the permission.
      stream.getTracks().forEach(track => track.stop());
      setStatus('success');

    } catch (error) {
      console.error("Permission denied:", error);
      setStatus('denied');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-200">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">

        <div className="w-16 h-16 bg-sky-500/20 text-sky-400 rounded-full flex items-center justify-center mx-auto mb-6">
          {/* Simple camera icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Welcome to AttentionOS</h1>
        <p className="text-slate-400 mb-8">
          To enable the biometric FocusLens, we need access to your camera. The feed is processed locally and never leaves your device.
        </p>

        {status === 'idle' && (
          <button
            onClick={requestCameraAccess}
            className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl transition-colors"
          >
            Grant Camera Access
          </button>
        )}

        {status === 'requesting' && (
          <div className="w-full py-3 px-4 bg-slate-800 text-slate-300 font-bold rounded-xl animate-pulse">
            Waiting for permission...
          </div>
        )}

        {status === 'success' && (
          <div className="w-full py-3 px-4 bg-green-500/20 text-green-400 border border-green-500/30 font-bold rounded-xl">
            Access Granted! You can close this tab.
          </div>
        )}

        {status === 'denied' && (
          <div className="w-full py-3 px-4 bg-red-500/20 text-red-400 border border-red-500/30 font-bold rounded-xl">
            Access Denied. Please enable it in Chrome settings.
          </div>
        )}
      </div>
    </div>
  );
}