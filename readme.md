# AttentionOS: The Biometric Awareness Layer

**AttentionOS** is a state-of-the-art Chrome Extension designed for the **Impetus 2026 (INC '26)** hackathon. It transforms your browser into an attention-aware environment using real-time biometric feedback. By processing edge-AI face landmarks locally, it helps users maintain "Deep Work" states and prevents digital burnout through a physical visual cue known as the **Fog of War**.

---

## 🚀 The Problem & Solution
*   **The Problem:** In an era of infinite scrolls and constant notifications, users suffer from "Zombie Browsing"—a state of low-awareness consumption that kills productivity and mental health.
*   **The Solution:** An AI-powered biometric feedback loop that monitors focus in real-time and gently "resets" the user's attention when they drift or become drowsy.

---

## 🛠️ Technical Architecture: "Hard Engineering" for MV3
AttentionOS represents a major engineering feat in the context of **Chrome Manifest V3 (MV3)** security restrictions.

### 1. Direct FaceLandmarker Integration (Security DMZ)
While Manifest V3 typically blocks high-performance WASM AI due to strict Content Security Policies (CSP) against `eval()`, AttentionOS uses the modern **MediaPipe Tasks Vision API**.
*   **WASM Optimization:** We host MediaPipe WASM binaries and the `face_landmarker.task` model locally within the extension to bypass remote code execution restrictions.
*   **Origin Persistence:** Biometric processing occurs directly in the **Side Panel** origin, allowing for stable, non-sandboxed hardware access (Camera API) while remaining compliant with `'wasm-unsafe-eval'` CSP guidelines.

### 2. The Biometric Engine (`AttentionEngine.ts`)
The core engine processes 478 face landmarks at ~15-30 FPS locally on the CPU/GPU:
*   **EAR (Eye Aspect Ratio):** Real-time monitoring of blink frequency and duration to detect micro-sleeps and drowsiness.
*   **3D Head Pose Estimation:** Calculates **Yaw, Pitch, and Roll** to determine if the user is looking away from their work or slouching.
*   **Saccade & Fixation Tracking:** Analyzes rapid eye movements (saccades) versus sustained focus (fixations) to quantify cognitive load.

### 3. Fog of War (Real-Time Visual Feedback)
When the Biometric Engine detects a "Distracted" or "Drowsy" state, it triggers the **Fog of War**:
*   **Content Script Injection:** A lightweight, Shadow DOM-isolated overlay is injected into every host webpage.
*   **Hardware-Accelerated Blur:** Using CSS `backdrop-filter: blur()`, the webpage gently blurs out, hiding distracting content and forcing a sensory "reset" until the user refocuses.
*   **Zero-Latency Bridge:** Uses `chrome.runtime` messaging to communicate focus states between the Side Panel AI and the Content Script with <50ms latency.

---

## 💻 Tech Stack
*   **Frontend:** Next.js 14, TypeScript, Tailwind CSS.
*   **State Management:** Zustand (for persistence and shared UI state).
*   **AI Engine:** Google MediaPipe (FaceLandmarker Task) via WebAssembly.
*   **Extension Layer:** Manifest V3, Chrome SidePanel API.
*   **Icons/Design:** Glassmorphism, Neon-Aesthetics, custom SVG iconography.

---

## 🔒 Privacy First
AttentionOS is built on the principle of **Zero-Server AI**.
*   **Local Processing:** All biometric data is processed on the user's device. 
*   **No Data Storage:** Camera frames are analyzed in-memory and immediately discarded.
*   **Extension Security:** No external scripts or CDNs are used in the production build, ensuring a 100% secure, offline-capable experience.

---

## 🛠️ Build & Installation
1.  **Clone the Repo:** `git clone ...`
2.  **Install Dependencies:** `npm install`
3.  **Build:** `npm run build:extension`
4.  **Load in Chrome:** Navigate to `chrome://extensions`, enable Dev Mode, and "Load Unpacked" the `out/` folder.

---

**Developed for Impetus 2026 (INC '26)**
*Pushing the boundaries of Edge-AI and Browser Security.*