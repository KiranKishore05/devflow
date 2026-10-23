import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Health API Endpoint', () => {
  it('GET /api/health should respond with status information and JSON content-type', async () => {
    const res = await request(app).get('/api/health');

    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('database');
    expect(res.body.database).toHaveProperty('status');
  });

  it('GET /api/unknown-endpoint should return 404 with structured JSON error', async () => {
    const res = await request(app).get('/api/non-existent-route-xyz');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Endpoint not found');
  });
});
