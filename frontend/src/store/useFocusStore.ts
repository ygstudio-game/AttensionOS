import { create } from 'zustand';
import { throttle } from 'lodash';

/**
 * Interface representing the real-time biometric and focus state.
 * Synchronized with AttentionEngine.ts
 */
interface AttentionState {
  // --- Core Metrics ---
  focusScore: number;
  focusHistory: number[];
  isFocused: boolean;
  faceDetected: boolean;

  // --- Biometric States ---
  isDrowsy: boolean;
  isDistracted: boolean;
  headAligned: boolean;

  // --- NEW: Saccade & Fixation tracking ---
  saccadeDetected: boolean;   // Added to match Engine
  fixationDuration: number;   // Added to match Engine

  // --- NEW: Advanced Features ---
  multipleFacesDetected: boolean;
  smartMediaRewindAmount: number;
  showCameraPreview: boolean;
  isFocusLensEnabled: boolean;
  lastBlinkTime: number;

  // --- Session Analytics ---
  dwm: number;
  sessionStartTime: number | null;
  lastTelemetrySync: number;

  // --- Features ---
  gazeHeatmap: Array<{ x: number; y: number; weight: number; timestamp: number }>;
  alertHistory: Array<{ type: string; message: string; timestamp: number }>;
  isAudioMuted: boolean;
  isSpeechEnabled: boolean;
  alertSensitivity: 'low' | 'medium' | 'high';
  lastAlertTime: number;
  distractedSince: number | null;
  
  // --- Module Settings ---
  isSmartMediaPauseEnabled: boolean;

  customAudioFiles: {
    low_focus?: string;
    fatigue?: string;
    distracted?: string;
    break_reminder?: string;
  };

  // --- Actions ---
  updateFromEngine: (results: {
    focusScore: number;
    isDrowsy: boolean;
    isDistracted: boolean;
    headAligned: boolean;
    faceDetected: boolean;
    gazePosition?: { x: number; y: number };
    saccadeDetected: boolean; // Signature updated
    fixationDuration: number; // Signature updated
    multipleFacesDetected: boolean;
    isBlinking: boolean;
  }) => void;

  addGazePoint: (x: number, y: number) => void;
  triggerAlert: (type: 'low_focus' | 'fatigue' | 'distracted' | 'break_reminder', message: string) => void;
  toggleAudioMute: () => void;
  toggleSpeech: () => void;
  
  toggleSmartMediaPause: () => void;
  toggleFocusLens: () => void;
  

  setSmartMediaRewindAmount: (seconds: number) => void;
  toggleCameraPreview: () => void;

  updateAlertSensitivity: (sensitivity: 'low' | 'medium' | 'high') => void;
  setCustomAudioFile: (type: 'low_focus' | 'fatigue' | 'distracted' | 'break_reminder', audioUrl: string) => void;
  resetSession: () => void;
  processDWM: () => void;
}

export const useFocusStore = create<AttentionState>((set, get) => ({
  // Initial State
  focusScore: 100,
  focusHistory: Array(60).fill(100),
  isFocused: true,
  faceDetected: false,
  isDrowsy: false,
  isDistracted: false,
  headAligned: true,
  saccadeDetected: false, // Initialized
  fixationDuration: 0,    // Initialized
  multipleFacesDetected: false,
  smartMediaRewindAmount: 5,
  showCameraPreview: true,
  isFocusLensEnabled: true,
  lastBlinkTime: Date.now(),
  dwm: 0,
  sessionStartTime: null,
  lastTelemetrySync: Date.now(),

  gazeHeatmap: [],
  alertHistory: [],
  isAudioMuted: false,
  isSpeechEnabled: true,
  alertSensitivity: 'medium',
  lastAlertTime: 0,
  distractedSince: null,
  isSmartMediaPauseEnabled: true,
  customAudioFiles: {},

  updateFromEngine: throttle((results) => {
    const {
      focusScore, isDrowsy, isDistracted, headAligned,
      faceDetected, gazePosition, saccadeDetected, fixationDuration,
      multipleFacesDetected, isBlinking
    } = results;

    set((state) => {
      // Add gaze point to heatmap if available
      if (gazePosition && faceDetected) {
        state.addGazePoint(gazePosition.x, gazePosition.y);
      }

      const now = Date.now();
      const timeSinceLastAlert = now - state.lastAlertTime;
      const alertCooldown = 4000;
      const SUSTAINED_DISTRACTION_LIMIT = 3000;

      const wasFocused = state.isFocused;
      const willBeFocused = focusScore > 60 && faceDetected && !isDrowsy && headAligned && !multipleFacesDetected;

      if (!wasFocused && willBeFocused && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      let currentDistractedSince = state.distractedSince;
      const isCurrentlyDistracted = !faceDetected || isDistracted || !headAligned || focusScore < 50;

      if (isCurrentlyDistracted) {
        if (!currentDistractedSince) currentDistractedSince = now;
      } else {
        currentDistractedSince = null;
      }

      // Sustained Alert Logic
      if (currentDistractedSince && (now - currentDistractedSince > SUSTAINED_DISTRACTION_LIMIT)) {
        if (timeSinceLastAlert > alertCooldown && (!state.isAudioMuted || state.isSpeechEnabled)) {
          const thresholds = {
            low: 30,
            medium: 50,
            high: 60
          }[state.alertSensitivity];

          if (focusScore < thresholds) {
            state.triggerAlert('low_focus', 'Focus level is low.');
          } else if (isDrowsy) {
            state.triggerAlert('fatigue', 'Fatigue detected.');
          } else if (!headAligned) {
            state.triggerAlert('distracted', 'Look back at the screen.');
          }
        }
      }

      return {
        focusScore: Math.round(focusScore),
        focusHistory: [...state.focusHistory, Math.round(focusScore)].slice(-60),
        distractedSince: currentDistractedSince,
        isFocused: willBeFocused,
        isDrowsy,
        isDistracted,
        headAligned,
        faceDetected,
        saccadeDetected, // Updated state
        fixationDuration, // Updated state
        multipleFacesDetected,
        lastBlinkTime: isBlinking ? now : state.lastBlinkTime,
        sessionStartTime: state.sessionStartTime || now,
      };
    });

    get().processDWM();
  }, 100),

  addGazePoint: (x, y) => {
    set((state) => ({
      gazeHeatmap: [...state.gazeHeatmap, { x, y, weight: 1, timestamp: Date.now() }].slice(-500)
    }));
  },

  triggerAlert: (type, message) => {
    const now = Date.now();
    set((state) => ({
      alertHistory: [...state.alertHistory, { type, message, timestamp: now }].slice(-50),
      lastAlertTime: now
    }));
    if (!get().isAudioMuted) playAudioAlert(type);
    if (get().isSpeechEnabled) speakAlert(message);
  },

  toggleAudioMute: () => set((state) => ({ isAudioMuted: !state.isAudioMuted })),
  toggleSpeech: () => set((state) => ({ isSpeechEnabled: !state.isSpeechEnabled })),
  toggleSmartMediaPause: () => set((state) => ({ isSmartMediaPauseEnabled: !state.isSmartMediaPauseEnabled })),
  toggleFocusLens: () => set((state) => ({ isFocusLensEnabled: !state.isFocusLensEnabled })),


  setSmartMediaRewindAmount: (seconds) => set({ smartMediaRewindAmount: seconds }),
  toggleCameraPreview: () => set((state) => ({ showCameraPreview: !state.showCameraPreview })),

  updateAlertSensitivity: (sensitivity) => set({ alertSensitivity: sensitivity }),
  setCustomAudioFile: (type, audioUrl) => set((state) => ({
    customAudioFiles: { ...state.customAudioFiles, [type]: audioUrl }
  })),

  processDWM: () => {
    const { isFocused, sessionStartTime } = get();
    if (isFocused && sessionStartTime) {
      set((state) => ({ dwm: state.dwm + (1 / 120) }));
    }
  },

  resetSession: () => set({
    dwm: 0,
    sessionStartTime: null,
    focusScore: 100,
    isFocused: true,
    gazeHeatmap: [],
    alertHistory: [],
    lastAlertTime: 0,
    distractedSince: null,
    saccadeDetected: false,
    fixationDuration: 0
  }),
}));

// Helper functions (speakAlert, playAudioAlert, playSyntheticAlert) remain unchanged below...

// Web Speech API Implementation
function speakAlert(message: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Cancel any ongoing speech to prevent overlapping
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Try to find a clear English voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
  if (englishVoice) utterance.voice = englishVoice;

  window.speechSynthesis.speak(utterance);
}

// Enhanced audio alert implementation with custom file support and faster response
function playAudioAlert(type: string) {
  try {
    const state = useFocusStore.getState();
    const customAudioUrl = state.customAudioFiles[type as keyof typeof state.customAudioFiles];

    // Use custom audio file if available
    if (customAudioUrl) {
      const audio = new Audio(customAudioUrl);
      audio.volume = 1.0; // Higher volume for better prominence
      audio.play().catch(error => {
        console.warn('Custom audio failed, falling back to synthetic:', error);
        playSyntheticAlert(type);
      });
      return;
    }

    // Fallback to synthetic sounds
    playSyntheticAlert(type);
  } catch (error) {
    console.warn('Audio alert failed:', error);
  }
}

// Synthetic alert sounds with faster response times
function playSyntheticAlert(type: string) {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  // Create different sounds for different alert types with faster response
  const createAlertSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    gainNode.gain.setValueAtTime(1.0, audioContext.currentTime); // Max volume
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  };

  switch (type) {
    case 'low_focus':
      // Faster, more urgent tone for low focus
      createAlertSound(440, 0.4, 'sine'); // Increased duration
      setTimeout(() => createAlertSound(554, 0.4, 'sine'), 400);
      break;
    case 'fatigue':
      // Softer, but longer tone
      createAlertSound(330, 0.8, 'triangle'); // Increased duration
      break;
    case 'distracted':
      // More urgent and continuous siren-like
      createAlertSound(880, 0.4, 'square');
      setTimeout(() => createAlertSound(660, 0.4, 'square'), 400);
      setTimeout(() => createAlertSound(880, 0.4, 'square'), 800);
      setTimeout(() => createAlertSound(660, 0.4, 'square'), 1200);
      break;
    case 'break_reminder':
      // Calm but concise
      createAlertSound(261, 1.0, 'sine');
      break;
  }
}
