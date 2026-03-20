import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: string;
  sessionId: string;
  avgFocusScore: number;
  dwm: number; // Deep Work Minutes
  totalFrames: number;
  gazeHeatmap: Array<{ x: number; y: number; weight: number; timestamp: number }>;
  alertHistory: Array<{ type: string; message: string; timestamp: number }>;
  saccadeCount: number;
  fixationDuration: number;
  blinkRate: number;
  headPose: { yaw: number; pitch: number; roll: number };
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, unique: true },
    avgFocusScore: { type: Number, default: 0 },
    dwm: { type: Number, default: 0 },
    totalFrames: { type: Number, default: 0 },
    gazeHeatmap: [
      {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        weight: { type: Number, default: 1 },
        timestamp: { type: Number, required: true }
      },
    ],
    alertHistory: [
      {
        type: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Number, required: true }
      }
    ],
    saccadeCount: { type: Number, default: 0 },
    fixationDuration: { type: Number, default: 0 },
    blinkRate: { type: Number, default: 0 },
    headPose: {
      yaw: { type: Number, default: 0 },
      pitch: { type: Number, default: 0 },
      roll: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

export default mongoose.model<ISession>('Session', SessionSchema);