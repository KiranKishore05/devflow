import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from backend folder or workspace root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DEV_FALLBACK_JWT_SECRET = 'devflow_default_development_secret_key_32_characters_min';

const baseEnvSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  DATABASE_URL: z.string().optional(),
});

export type EnvConfig = {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  CLIENT_ORIGIN: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  DATABASE_URL?: string;
};

function loadAndValidateEnv(): EnvConfig {
  const parsed = baseEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    throw new Error(`Invalid environment configuration: ${errorDetails}`);
  }

  const data = parsed.data;
  let secret = data.JWT_SECRET;

  if (data.NODE_ENV === 'production') {
    if (!secret || secret.trim().length === 0) {
      throw new Error(
        'FATAL: In production, JWT_SECRET environment variable is required and cannot be empty.'
      );
    }
    if (secret.length < 32) {
      throw new Error(
        'FATAL: In production, JWT_SECRET must be at least 32 characters long for cryptographic security.'
      );
    }
    if (secret === DEV_FALLBACK_JWT_SECRET) {
      throw new Error(
        'FATAL: In production, JWT_SECRET cannot be set to the default development secret.'
      );
    }
  } else {
    // Development or test fallback
    if (!secret || secret.trim().length === 0) {
      secret = DEV_FALLBACK_JWT_SECRET;
    }
  }

  return {
    ...data,
    JWT_SECRET: secret,
  };
}

export const env = loadAndValidateEnv();
