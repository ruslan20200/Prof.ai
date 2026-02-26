import cors from 'cors';
import express from 'express';
import { createApiRouter } from './api';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use('/api', createApiRouter());

  return app;
}
