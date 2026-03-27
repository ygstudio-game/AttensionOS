"use client"
import { useEffect, useState } from 'react';
import { useFocusStore } from '@/store/useFocusStore';
import { Eye } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  visible: boolean;
}

let toastId = 0;

export function BlinkToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastBlinkTime = useFocusStore(s => s.lastBlinkTime);
  const isFocused = useFocusStore(s => s.isFocused);
  const isEyeCareEnabled = useFocusStore(s => s.isEyeCareEnabled);
  const faceDetected = useFocusStore(s => s.faceDetected);

  useEffect(() => {
    if (!isEyeCareEnabled) return;

    const interval = setInterval(() => {
      // 5 second blink reminder
      if (Date.now() - lastBlinkTime > 5000 && isFocused && faceDetected) {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message: '👁 Please blink! Protect your eyes.', visible: true }]);

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
          setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
          }, 400);
        }, 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastBlinkTime, isFocused, isEyeCareEnabled, faceDetected]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl transition-all duration-400 ${
            toast.visible
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-8'
          }`}
          style={{
            background: 'rgba(0,229,255,0.08)',
            borderColor: 'rgba(0,229,255,0.25)',
            boxShadow: '0 0 25px rgba(0,229,255,0.12), 0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div className="w-8 h-8 rounded-full bg-[#00E5FF]/15 flex items-center justify-center animate-pulse">
            <Eye className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <span className="text-sm font-semibold text-[#00E5FF]">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
