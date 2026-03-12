// src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import telemetryRoutes from './routes/telemetry.routes';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Parses incoming JSON payloads

// Mount Routes
app.use('/api/v1/telemetry', telemetryRoutes);

// Basic Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'AttentionOS Backend is Active' });
});

export default app;