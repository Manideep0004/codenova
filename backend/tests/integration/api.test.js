const request = require('supertest');
const app = require('../../server');

describe('API Integration Tests (Supertest)', () => {
  it('GET /health should return 200 and system status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  it('GET /metrics should expose Prometheus telemetry metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('http_requests_total');
  });

  it('POST /api/auth/register should return 400 when body fails Joi validation', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ab', email: 'invalid-email', password: '123' });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('POST /api/submissions should return 401 without JWT authentication', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .send({ languageId: 1, code: 'print("hello")' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain('Access denied');
  });

  it('GET /api/admin/users should reject non-admin requests with 401', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.statusCode).toBe(401);
  });
});
