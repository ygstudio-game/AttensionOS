import { Request, Response } from 'express';
import Session from '../models/Session';

export const syncTelemetry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, sessionId, focusScore, batchData, additionalDWM } = req.body;

    // Upsert: Update the session if it exists, or create a new one
    const session = await Session.findOneAndUpdate(
      { sessionId },
      {
        $set: { userId, avgFocusScore: focusScore },
        $inc: { dwm: additionalDWM },
        $push: { gazeHeatmap: { $each: batchData } },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error('[Telemetry Error]', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};