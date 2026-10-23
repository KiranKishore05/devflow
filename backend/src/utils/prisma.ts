import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export interface DbStatus {
  status: 'connected' | 'disconnected';
  latencyMs?: number;
  error?: string;
}

export async function checkDbConnection(): Promise<DbStatus> {
  const start = Date.now();
  try {
    // Ping database with a lightweight query
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'connected',
      latencyMs: Date.now() - start,
    };
  } catch (error: any) {
    return {
      status: 'disconnected',
      error: error.message || 'Database connection unreachable',
    };
  }
}
