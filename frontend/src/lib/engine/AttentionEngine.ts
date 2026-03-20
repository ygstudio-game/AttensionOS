// frontend/src/lib/engine/AttentionEngine.ts

export interface AttentionResults {
  focusScore: number;
  isDrowsy: boolean;
  isDistracted: boolean;
  headAligned: boolean;
  faceDetected: boolean;
  gazePosition?: { x: number; y: number };
  saccadeDetected: boolean;
  fixationDuration: number;
}

// Access MediaPipe from the global window object
declare var FaceMesh: any;

export class AttentionEngine {
  private faceMesh: any;
  private resolveCallback: ((results: AttentionResults) => void) | null = null;

  // State tracking for saccades and fixations
  private lastGazePosition: { x: number; y: number } | null = null;
  private fixationStartTime: number = 0;
  private currentFixationDuration: number = 0;
  private saccadeThreshold: number = 0.02; // Threshold for detecting saccades
  private fixationThreshold: number = 0.2; // Minimum time to consider a fixation

  constructor() {
    // We check if it exists (it will be loaded by a script tag in the layout)
    if (typeof FaceMesh === "undefined") {
      console.error("MediaPipe FaceMesh not loaded yet!");
      return;
    }

    this.faceMesh = new FaceMesh({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.faceMesh.onResults((results: any) => {
      if (!this.resolveCallback) return;

      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        this.resolveCallback({
          focusScore: 0,
          faceDetected: false,
          isDrowsy: false,
          isDistracted: true,
          headAligned: false,
          gazePosition: undefined,
          saccadeDetected: false,
          fixationDuration: 0
        });
        return;
      }

      const landmarks = results.multiFaceLandmarks[0];

      // EAR Logic (Drowsiness) - relaxed threshold from 0.2 to 0.15
      const leftEar = this.calculateEAR(landmarks, [362, 385, 387, 263, 373, 380]);
      const rightEar = this.calculateEAR(landmarks, [33, 160, 158, 133, 153, 144]);
      const isDrowsy = (leftEar + rightEar) / 2 < 0.15;

      // Enhanced Gaze Logic with position tracking
      const gazeData = this.estimateGazeWithPosition(landmarks, [362, 263], [474, 475, 476, 477], [33, 133], [469, 470, 471, 472]);
      const gazeScore = gazeData.score;
      const gazePosition = gazeData.position;

      // Head Alignment (Yaw/Pitch/Roll) - Using 3D landmarks for better accuracy
      const nose = landmarks[1];
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];
      const forehead = landmarks[10];
      const chin = landmarks[152];
      const leftCheek = landmarks[234];
      const rightCheek = landmarks[454];

      // Calculate Yaw (Left/Right rotation)
      // Comparison of X distance of nose from face sides, balanced by Z depth
      const leftDist = Math.abs(nose.x - leftCheek.x);
      const rightDist = Math.abs(nose.x - rightCheek.x);
      const yaw = (leftDist - rightDist) / (leftDist + rightDist);

      // Calculate Pitch (Up/Down rotation)
      // Comparison of Y distance of nose from forehead vs chin
      const upperDist = Math.abs(nose.y - forehead.y);
      const lowerDist = Math.abs(nose.y - chin.y);
      const pitch = (upperDist - lowerDist) / (upperDist + lowerDist);

      // Calculate Roll (Tilting side to side)
      // Slope between the eyes
      const roll = (rightEye.y - leftEye.y) / (rightEye.x - leftEye.x);

      // Strict alignment thresholds (approx 15-20 degrees equivalent)
      const isYawAligned = Math.abs(yaw) < 0.343;
      const isPitchAligned = pitch > -0.2 && pitch < 0.35; // Allow slightly more downward look for reading
      const isRollAligned = Math.abs(roll) < 0.2;

      const headAligned = isYawAligned && isPitchAligned && isRollAligned;

      // Saccade and Fixation Detection
      const saccadeData = this.detectSaccadesAndFixations(gazePosition);

      // FS = (0.4 * Eye State) + (0.3 * Gaze Centrality) + (0.3 * Head Alignment)
      const eyeScore = isDrowsy ? 0 : 1;
      const alignmentScore = headAligned ? 1 : 0.5;
      const focusScore = ((0.4 * eyeScore) + (0.3 * gazeScore) + (0.3 * alignmentScore)) * 100;
      this.resolveCallback({
        focusScore: Math.round(focusScore),
        isDrowsy,
        isDistracted: gazeScore < 1.0,
        headAligned,
        faceDetected: true,
        gazePosition: gazePosition,
        saccadeDetected: saccadeData.saccadeDetected,
        fixationDuration: saccadeData.fixationDuration
      });
    });
  }

  private calculateEAR(landmarks: any, indices: number[]) {
    const p = indices.map(i => landmarks[i]);
    const dist = (a: any, b: any) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    const v1 = dist(p[1], p[5]);
    const v2 = dist(p[2], p[4]);
    const h = dist(p[0], p[3]);
    return (v1 + v2) / (2.0 * h);
  }

  private estimateGazeWithPosition(
    landmarks: any,
    leftEyeIndices: number[],
    leftIrisIndices: number[],
    rightEyeIndices: number[],
    rightIrisIndices: number[]
  ) {
    // Calculate left eye gaze
    const leftGaze = this.estimateGaze(landmarks, leftEyeIndices, leftIrisIndices);
    const leftPosition = this.calculateGazePosition(landmarks, leftIrisIndices);

    // Calculate right eye gaze
    const rightGaze = this.estimateGaze(landmarks, rightEyeIndices, rightIrisIndices);
    const rightPosition = this.calculateGazePosition(landmarks, rightIrisIndices);

    // Average the gaze scores
    const gazeScore = (leftGaze + rightGaze) / 2;

    // Average the gaze positions if both eyes are valid
    const gazePosition = leftPosition && rightPosition ? {
      x: (leftPosition.x + rightPosition.x) / 2,
      y: (leftPosition.y + rightPosition.y) / 2
    } : (leftPosition || rightPosition || undefined);

    return {
      score: gazeScore,
      position: gazePosition
    };
  }

  private estimateGaze(landmarks: any, eyeIndices: number[], irisIndices: number[]): number {
    const irisX = irisIndices.map(i => landmarks[i].x);
    const irisY = irisIndices.map(i => landmarks[i].y);
    const eyeX = eyeIndices.map(i => landmarks[i].x);
    const eyeY = eyeIndices.map(i => landmarks[i].y);

    const minX = Math.min(...eyeX);
    const maxX = Math.max(...eyeX);
    const minY = Math.min(...eyeY);
    const maxY = Math.max(...eyeY);

    const width = maxX - minX;
    const height = maxY - minY;

    const irisCenterX = irisX.reduce((a, b) => a + b, 0) / irisX.length;
    const irisCenterY = irisY.reduce((a, b) => a + b, 0) / irisY.length;

    // Horizontal check (Yaw) - Strict 0.3 boundary from reference
    const horizontalFocus = (irisCenterX >= minX + (0.3 * width) && irisCenterX <= maxX - (0.3 * width));
    // Vertical check (Pitch) - Detect if looking too far down (phone/lap)
    const verticalFocus = (irisCenterY >= minY + (0.2 * height) && irisCenterY <= maxY - (0.2 * height));

    return (horizontalFocus && verticalFocus) ? 1.0 : 0.0;
  }

  private calculateGazePosition(landmarks: any, irisIndices: number[]): { x: number; y: number } | null {
    try {
      // Calculate iris center
      const irisX = irisIndices.map(i => landmarks[i].x);
      const irisY = irisIndices.map(i => landmarks[i].y);
      const irisCenterX = irisX.reduce((a, b) => a + b, 0) / irisX.length;
      const irisCenterY = irisY.reduce((a, b) => a + b, 0) / irisY.length;

      // Normalize to 0-1 range (MediaPipe coordinates are already normalized)
      return {
        x: Math.max(0, Math.min(1, irisCenterX)),
        y: Math.max(0, Math.min(1, irisCenterY))
      };
    } catch (error) {
      return null;
    }
  }

  private detectSaccadesAndFixations(currentGaze: { x: number; y: number } | undefined) {
    if (!currentGaze || !this.lastGazePosition) {
      this.lastGazePosition = currentGaze || null;
      this.fixationStartTime = Date.now();
      return { saccadeDetected: false, fixationDuration: 0 };
    }

    // Calculate distance between current and last gaze position
    const distance = Math.sqrt(
      Math.pow(currentGaze.x - this.lastGazePosition.x, 2) +
      Math.pow(currentGaze.y - this.lastGazePosition.y, 2)
    );

    const now = Date.now();
    let saccadeDetected = false;

    if (distance > this.saccadeThreshold) {
      // Saccade detected
      saccadeDetected = true;
      this.fixationStartTime = now;
      this.currentFixationDuration = 0;
    } else {
      // Fixation continues
      this.currentFixationDuration = now - this.fixationStartTime;
    }

    this.lastGazePosition = currentGaze;

    return {
      saccadeDetected,
      fixationDuration: this.currentFixationDuration
    };
  }

  public async processFrame(videoElement: HTMLVideoElement): Promise<AttentionResults> {
    return new Promise((resolve) => {
      this.resolveCallback = resolve;
      if (this.faceMesh) {
        this.faceMesh.send({ image: videoElement });
      }
    });
  }
}