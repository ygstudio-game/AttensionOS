# 👁️ AttentionOS (feat. FocusLens)

A privacy-first, client-side computer vision engine designed to quantify human focus in real-time. Built to transform passive web browsing into an adaptive, attention-aware digital experience.

## 🚀 The Vision
The digital ecosystem is optimized to capture attention, yet web applications lack the ability to measure if a user is genuinely engaged or mindlessly scrolling. AttentionOS utilizes pre-trained browser-based machine learning models to track gaze patterns, blink rates, and head tilt directly through standard webcams. 

**Zero video data is transmitted to external servers, guaranteeing complete user privacy.**

### 🔍 FocusLens (The Intervenion Layer)
FocusLens is a smart reading environment built on top of AttentionOS. It consumes real-time telemetry to combat digital fatigue:
* **The "Fog of War":** Blurs text if attention drifts to break the distraction loop.
* **Gaze-Aware Scrolling:** Pauses mindless scrolling when the user stops reading.
* **Analytics:** Generates attention heatmaps to calculate actual "Deep Work Minutes" (DWM).

## 💻 Tech Stack
This project is structured as a monorepo.
* **Frontend:** Next.js 14 (App Router), Tailwind CSS, Framer Motion, Zustand
* **ML Engine:** TensorFlow.js, MediaPipe Face Mesh, WebAssembly (running in a Web Worker)
* **Backend:** Node.js, Express, TypeScript
* **Database & Cache:** MongoDB Atlas, Redis (for telemetry throttling)
* **Package Manager:** pnpm

## 🛠️ Local Development Setup

### Prerequisites
* Node.js (v18+)
* pnpm (`npm install -g pnpm`)
* MongoDB running locally or a MongoDB Atlas URI

### 1. Clone the repository
\`\`\`bash
git clone <YOUR_GITHUB_REPO_URL>
cd attention-os-workspace
\`\`\`

### 2. Install Dependencies
Install packages for both the frontend and backend simultaneously:
\`\`\`bash
cd frontend && pnpm install
cd ../backend && pnpm install
\`\`\`

### 3. Environment Variables
Create a `.env` file inside the `backend` directory:
\`\`\`env
PORT=5000
MONGO_URI=mongodb://localhost:27017/attentionos
NODE_ENV=development
\`\`\`

### 4. Run the Application
You will need two terminal windows.

**Terminal 1 (Backend):**
\`\`\`bash
cd backend
pnpm run dev
\`\`\`

**Terminal 2 (Frontend):**
\`\`\`bash
cd frontend
pnpm run dev
\`\`\`

The application will be available at `http://localhost:3000`.