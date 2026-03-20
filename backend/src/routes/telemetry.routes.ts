import { Router } from 'express';
import { 
  syncTelemetry, 
  getSessions, 
  getSessionById, 
  getAnalytics, 
  exportSessionData, 
  deleteSession 
} from '../controllers/telemetry.controller';

const router = Router();

// POST /api/v1/telemetry/sync
router.post('/sync', syncTelemetry);

// GET /api/v1/telemetry/sessions?userId=&limit=&offset=
router.get('/sessions', getSessions);

// GET /api/v1/telemetry/sessions/:sessionId
router.get('/sessions/:sessionId', getSessionById);

// GET /api/v1/telemetry/analytics?userId=&timeframe=
router.get('/analytics', getAnalytics);

// GET /api/v1/telemetry/sessions/:sessionId/export
router.get('/sessions/:sessionId/export', exportSessionData);

// DELETE /api/v1/telemetry/sessions/:sessionId
router.delete('/sessions/:sessionId', deleteSession);

export default router;
