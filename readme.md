# AttentionOS

**The First Biometric, Attention-Aware Chrome Extension**

AttentionOS is a zero-latency, privacy-first Chrome Extension built for the **Impetus 2026** hackathon. It transforms your browser from a passive tool into an active, intelligent environment that helps you maintain deep work, protect your privacy, and learn more effectively.

---

## 🎯 The Core Value Proposition
In a world engineered to steal our focus, managing attention is the ultimate competitive advantage. Open offices expose our private data to shoulder surfers. Endless notifications shatter our flow state. Long learning videos drone on while we look at our phones. 

AttentionOS solves this by interpreting your **biometric presence** in real-time. It doesn't just know what tab is open—it knows if you are actually paying attention to it.

---

## 🚀 The 3 Core Modules

### 1. StealthHide (Privacy & Security)
*The end of shoulder surfing.*
In open-plan offices or public cafes, sensitive information (like banking portals or proprietary codebases) is constantly at risk. StealthHide provides **proactive, presence-based security**. 
By utilizing Face Detection and 3D Head Alignment data, StealthHide instantly blurs your screen the exact millisecond you look away or step out of frame. Your data is masked before you even realize you've been distracted.

### 2. Smart Media Pause (E-Learning & Productivity)
*Never miss a second of your lecture again.*
Distance learning and long tutorials require intense focus. If you're watching a video on YouTube or Coursera and you glance down at your phone, AttentionOS automatically pauses the video. 
When you look back, it **automatically rewinds by 5 seconds** and resumes playing, ensuring you seamlessly catch what you missed without having to fumble for the keyboard.

### 3. Flow State Dashboard (Analytics)
*Quantify your deep work.*
You can't improve what you don't measure. AttentionOS logs your genuine "focus intervals" instead of just tracking screen time. A beautiful, Next.js-powered UI visualizes your deep work sessions over time, helping you identify your most productive hours. All analytics and logs are stored 100% locally in your browser to maintain total privacy.

---

## 🛠️ Technical Architecture: The Manifest V3 "Sandbox DMZ"

AttentionOS is built with **Next.js 14, TypeScript, Zustand, and WebAssembly (WASM)**. It represents a major engineering achievement in navigating Google's strict Chrome Manifest V3 (MV3) security restrictions.

### The Challenge
Manifest V3 heavily restricts remote code execution and blocks `eval()`, making traditional AI/ML implementations inside Chrome Extensions incredibly difficult.

### The Solution: Zero-Server, Edge-AI Security
We engineered a custom **WebAssembly-accelerated MediaPipe FaceLandmarker engine**. 
Instead of relying on sandboxed iframes or external backends, we run the entire biometric pipeline locally within a dedicated **Side Panel DMZ Origin**.

*   **100% Local Inference:** The camera feed is analyzed in RAM at 30 FPS and discarded instantly. Absolutely no video or biometric data is ever sent to a server.
*   **Shadow DOM Injection:** To manipulate host webpages (like pausing videos or blurring the DOM), we inject highly-optimized Content Scripts that communicate with the Side Panel via lightning-fast `chrome.runtime` messaging.
*   **State Management:** Zustand manages the complex biometric state tree across the React frontend, enabling ultra-responsive UI updates free of latency.

---

## 🏁 How to Run Locally

1. Clone the repository.
2. Run `npm install` inside the `frontend` directory.
3. Run `npm run build:extension` to generate the production extension bundle.
4. Open Chrome, go to `chrome://extensions/`, enable **Developer mode**, and select **Load unpacked**. Choose the `frontend/out` folder.
5. Open the Side Panel in Chrome and grant camera permissions to activate AttentionOS.