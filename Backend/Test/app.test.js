import request from 'supertest';
import app from '../src/app.js';

describe('Main API Endpoint', () => {
  it('GET /api should return hello message', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Hello from the backend!' });
  });
});
