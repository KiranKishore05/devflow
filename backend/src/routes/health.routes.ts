import { Router } from 'express';
import { checkDbConnection } from '../utils/prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  const dbStatus = await checkDbConnection();
  const isHealthy = dbStatus.status === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    system: {
      nodeVersion: process.version,
      memory: process.memoryUsage(),
    },
  });
});

export const healthRoutes = router;
