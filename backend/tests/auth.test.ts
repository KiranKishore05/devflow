import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Auth & Validation Security', () => {
  it('POST /api/auth/register should fail validation if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alex' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation failed');
  });

  it('POST /api/auth/register should reject passwords shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: '123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body.details)).toContain('Password must be at least 8 characters');
  });

  it('POST /api/auth/login should reject requests with missing credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Authentication required');
  });

  it('Protected project routes should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/projects');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
