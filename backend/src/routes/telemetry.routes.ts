import { Router } from 'express';
import { syncTelemetry } from '../controllers/telemetry.controller';

const router = Router();

// POST /api/v1/telemetry/sync
router.post('/sync', syncTelemetry);

export default router;