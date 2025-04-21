let mockFrom;
jest.mock('@supabase/supabase-js', () => {
  mockFrom = jest.fn();
  return { createClient: () => ({ from: mockFrom }) };
});

const express = require('express');
const request = require('supertest');
const sensorRoutes = require('../src/routes/sensorRoutes.js').default;

describe('Network Routes', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/sensors', sensorRoutes);
  });
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it('GET /api/sensors/network returns data', async () => {
    mockFrom.mockImplementationOnce((table) => ({
      select: () => Promise.resolve({ data: [{ ip: '1.1.1.1', packet_length: 100 }], error: null }),
    }));

    const res = await request(app).get('/api/sensors/network');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ ip: '1.1.1.1', packet_length: 100 }]);
  });

  it('GET /api/sensors/network/read/:name returns formatted data', async () => {
    mockFrom.mockImplementationOnce((table) => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [{ packet_length: 200, created_at: '2025-04-20T02:00:00Z' }], error: null }),
        }),
      }),
    }));

    const res = await request(app).get('/api/sensors/network/read/1.1.1.1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ labels: ['2025-04-20T02:00:00Z'], values: [200] });
  });
});
