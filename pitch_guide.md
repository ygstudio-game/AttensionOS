# AttentionOS: Impetus 2026 (INC '26) Pitch Guide

Use this guide to structure your 3-minute hackathon presentation and slides.

## 🎤 3-Minute Pitch Script

### **[0:00 - 0:30] The Hook (The Problem)**
"Every day, we spend hours in a state of 'digital drift.' We open a tab to work, and 20 minutes later, we're 10 levels deep in a rabbit hole with no memory of how we got there. We are becoming spectators in our own digital lives. Digital distraction isn't just a productivity killer; it’s an attention crisis. We need a way to wake up."

### **[0:30 - 1:15] The Solution (The Innovation)**
"Introducing **AttentionOS**: the first biometric awareness layer for your browser. It’s not a blocker; it’s a feedback loop. Using the same edge-AI that powers self-driving cars, AttentionOS monitors your focus in real-time. It measures your blink rate for fatigue, your head pose for engagement, and your gaze patterns for cognitive load. It doesn’t just 'know' where you are looking—it 'knows' if you are paying attention."

### **[1:15 - 2:00] The "Magic" Moment (Fog of War)**
"But awareness isn't enough. We need a cue. When AttentionOS detects you've drifted off, it triggers the **Fog of War**. Your screen gently blurs—a physical visual cue that breaks the 'zombie' cycle. It forces a neural reset, prompting you to breathe, refocus, and regain control of your time."

### **[2:00 - 2:45] The "Hard" Tech (Privacy & Security)**
"Building this in 2026 meant overcoming the toughest security barriers in the browser. We engineered a direct, WASM-accelerated biometric engine that runs 100% locally. Your camera feed never leaves your RAM. We solved the Manifest V3 CSP restrictions to deliver a real-time, zero-latency experience that respects user privacy as a human right."

### **[2:45 - 3:00] The Vision (Conclusion)**
"From deep work for developers to gaze-control accessibility for the motor-impaired—AttentionOS is the future of human-computer interaction. Don't just browse. Pay attention. Thank you."

---

## 📊 Slide Outline

### **Slide 1: Title**
*   **Visual:** AttentionOS Logo (Neon Cyan), "The Biometric Awareness Layer."
*   **Key Text:** Impetus 2026 | Team [Team Name]

### **Slide 2: The Attention Crisis**
*   **Visual:** A messy browser with 50+ tabs, "Zombie Browsing" label.
*   **Key Text:** 40% of time online is spent on distractions. Attention is the new currency.

### **Slide 3: Real-Time Biometrics**
*   **Visual:** Screenshot of the Side Panel with the Mesh overlay and Focus Meter.
*   **Key Text:** EAR (Drowsiness), 3D Pose (Engagement), Gaze Fixation.

### **Slide 4: The Fog of War**
*   **Visual:** Before/After split of a blurred webpage.
*   **Key Text:** A sensory "reset" cue. Real-time Shadow DOM injection.

### **Slide 5: Privacy-Ready Architecture**
*   **Visual:** Diagram showing Local WASM Processing (No Cloud/No Server).
*   **Key Text:** Edge-AI via MediaPipe. 100% Privacy. Manifest V3 Compliant.

### **Slide 6: Impact & Future**
*   **Visual:** Use cases: Education, Coding, Accessibility.
*   **Key Text:** The first step toward an attention-aware OS.

---

## 🏆 Judges' Q&A Cheat Sheet

**Q: Why a Chrome Extension and not a standalone app?**
*   **A:** "Because the browser is where 90% of our information consumption happens. By being an extension, we live inside the user's workflow without requiring them to switch contexts."

**Q: How do you handle different lighting or glasses?**
*   **A:** "We use the latest MediaPipe FaceLandmarker with 478 points of reference. It’s uniquely robust against environmental changes and occlusion, providing stable EAR and Pose data even in low-light hackathon environments!"

**Q: Is it distracting to have the screen blur?**
*   **A:** "That’s the point. It’s more distracting to spend 3 hours procrastinating. The blur is a 'gentle friction' that saves time in the long run."
