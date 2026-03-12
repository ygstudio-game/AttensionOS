import app from './app';
import { connectDB } from './config/db';
import { ENV } from './config/env';

const startServer = async () => {
  // 1. Connect to Database
  await connectDB();

  // 2. Start Express Server
  app.listen(ENV.PORT, () => {
    console.log(`[Server] AttentionOS API running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode`);
  });
};

startServer();