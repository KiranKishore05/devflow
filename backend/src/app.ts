import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRoutes } from './routes/health.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { projectRoutes } from './routes/project.routes.js';
import { taskRoutes } from './routes/task.routes.js';
import { noteRoutes } from './routes/note.routes.js';
import { analyticsRoutes } from './routes/analytics.routes.js';

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS configuration
  const allowedOrigins = [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Allow during local development
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate Limiting for Auth
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // 100 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many authentication attempts. Please try again later.' },
  });

  // API Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/notes', noteRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // 404 Route Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
