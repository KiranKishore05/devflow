import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from backend folder or workspace root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16).default('devflow_default_development_secret_key_32_characters_min'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  DATABASE_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
}

export const env = parsed.success ? parsed.data : envSchema.parse({});
