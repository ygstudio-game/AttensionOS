# AttentionOS: Devpost / Submission Summary

### **Project Name:** AttentionOS
### **Elevator Pitch:** 
An AI-powered biometric awareness layer that uses real-time face tracking to combat digital distraction and burnout, featuring an adaptive "Fog of War" that blurs the web when you lose focus.

### **The Problem:** 
"Zombie Browsing" and digital fatigue. Users spend hours scrolling mindlessly, losing track of time and productivity.

### **What it does:** 
AttentionOS runs a local biometric engine in your browser's side panel. It analyzes your engagement levels through head pose, eye-blink frequency (drowsiness), and gaze patterns. If you drift off, it blurs your active webpage until you return to focus, providing a physical cue to stay on task.

### **How we built it:** 
Built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**. We integrated **Google MediaPipe's FaceLandmarker** using a custom **WASM-accelerated** engine. We overcame the extreme security hurdles of **Chrome Manifest V3** by engineering a direct biometric pipeline in the Side Panel origin, ensuring 100% data privacy.

### **Challenges we ran into:** 
*   **Manifest V3 CSP:** Navigating the restriction on `eval()` and external WASM loads required hosting all AI models locally and using specific extension-page policies.
*   **Zero-Latency Messaging:** Implementing a high-speed bridge between the AI side panel and the content script to ensure the "Fog of War" felt fluid and responsive.

### **Accomplishments we're proud of:** 
Successfully running a heavy AI model at 20+ FPS locally in a browser extension without any backend, while maintaining a premium, "wow-factor" glassmorphism UI.

### **What's next for AttentionOS:** 
Gaze-based navigation for accessibility, deeper integration with productivity tools (Notion/GitHub), and an adaptive focus-score API for other developers.
