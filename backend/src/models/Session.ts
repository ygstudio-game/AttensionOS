import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: string;
  sessionId: string;
  avgFocusScore: number;
  dwm: number; // Deep Work Minutes
  gazeHeatmap: Array<{ x: number; y: number; weight: number }>;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, unique: true },
    avgFocusScore: { type: Number, default: 0 },
    dwm: { type: Number, default: 0 },
    gazeHeatmap: [
      {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        weight: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ISession>('Session', SessionSchema);