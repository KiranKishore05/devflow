import { app } from './app.js';
import { env } from './config/env.js';
import { checkDbConnection, prisma } from './utils/prisma.js';

const PORT = env.PORT || 5000;

async function bootstrap() {
  const server = app.listen(PORT, async () => {
    console.log(`\n======================================================`);
    console.log(` DevFlow API Server running at http://localhost:${PORT}`);
    console.log(` Client Origin: ${env.CLIENT_ORIGIN}`);
    console.log(` Environment:   ${env.NODE_ENV}`);
    console.log(`======================================================\n`);

    const db = await checkDbConnection();
    if (db.status === 'connected') {
      console.log(`[Database] Connected successfully (latency: ${db.latencyMs}ms)`);
    } else {
      console.warn(`[Database] Standby / Disconnected: ${db.error}`);
    }
  });

  const handleShutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down DevFlow server...`);
    server.close(async () => {
      try {
        await prisma.$disconnect();
        console.log('[Database] Prisma disconnected.');
      } catch (e) {}
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
