import { Request, Response } from 'express';
import Session from '../models/Session';

export const syncTelemetry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, sessionId, focusScore, batchData, additionalDWM } = req.body;

    // Validate required fields
    if (!userId || !sessionId) {
      res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: userId and sessionId' 
      });
      return;
    }

    // Upsert: Update the session if it exists, or create a new one
    const session = await Session.findOneAndUpdate(
      { sessionId },
      {
        $set: { 
          userId, 
          avgFocusScore: focusScore,
          updatedAt: new Date()
        },
        $inc: { 
          dwm: additionalDWM || 0,
          totalFrames: batchData ? batchData.length : 0
        },
        $push: { 
          gazeHeatmap: { 
            $each: batchData || [] 
          } 
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ 
      success: true, 
      data: {
        sessionId: session.sessionId,
        avgFocusScore: session.avgFocusScore,
        dwm: session.dwm,
        totalFrames: session.totalFrames,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    console.error('[Telemetry Error]', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};

export const getSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, limit = 10, offset = 0 } = req.query;
    
    if (!userId) {
      res.status(400).json({ 
        success: false, 
        message: 'Missing userId parameter' 
      });
      return;
    }

    const sessions = await Session.find({ userId })
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .select('-gazeHeatmap'); // Exclude large heatmap data for performance

    res.status(200).json({ 
      success: true, 
      data: sessions 
    });
  } catch (error) {
    console.error('[Get Sessions Error]', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};

export const getSessionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      res.status(400).json({ 
        success: false, 
        message: 'Missing sessionId parameter' 
      });
      return;
    }

    const session = await Session.findOne({ sessionId });
    
    if (!session) {
      res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
      return;
    }

    res.status(200).json({ 
      success: true, 
      data: session 
    });
  } catch (error) {
    console.error('[Get Session Error]', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, timeframe = '7d' } = req.query;
    
    if (!userId) {
      res.status(400).json({ 
        success: false, 
        message: 'Missing userId parameter' 
      });
      return;
    }

    // Calculate date range based on timeframe
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Aggregate analytics data
    const analytics = await Session.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalDWM: { $sum: '$dwm' },
          avgFocusScore: { $avg: '$avgFocusScore' },
          totalFrames: { $sum: '$totalFrames' },
          sessions: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: 0,
          totalSessions: 1,
          totalDWM: 1,
          avgFocusScore: { $round: ['$avgFocusScore', 2] },
          totalFrames: 1,
          sessions: 1
        }
      }
    ]);

    const result = analytics[0] || {
      totalSessions: 0,
      totalDWM: 0,
      avgFocusScore: 0,
      totalFrames: 0,
      sessions: []
    };

    res.status(200).json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('[Analytics Error]', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};

export const exportSessionData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      res.status(400).json({ 
        success: false, 
        message: 'Missing sessionId parameter' 
      });
      return;
    }

    const session = await Session.findOne({ sessionId });
    
    if (!session) {
      res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
      return;
    }

    // Create export data
    const exportData = {
      sessionId: session.sessionId,
      userId: session.userId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      avgFocusScore: session.avgFocusScore,
      dwm: session.dwm,
      totalFrames: session.totalFrames,
      gazeHeatmap: session.gazeHeatmap,
      exportDate: new Date().toISOString()
    };

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="session_${sessionId}.json"`);

    res.status(200).json(exportData);
  } catch (error) {
    console.error('[Export Error]', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};

export const deleteSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      res.status(400).json({ 
        success: false, 
        message: 'Missing sessionId parameter' 
      });
      return;
    }

    const session = await Session.findOneAndDelete({ sessionId });
    
    if (!session) {
      res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
      return;
    }

    res.status(200).json({ 
      success: true, 
      message: 'Session deleted successfully' 
    });
  } catch (error) {
    console.error('[Delete Session Error]', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};