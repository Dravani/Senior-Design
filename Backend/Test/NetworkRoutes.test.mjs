import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

let mockFrom;

jest.unstable_mockModule('@supabase/supabase-js', () => {
  const mockSelect = jest.fn();
  const mockEq     = jest.fn();
  const mockOrder  = jest.fn();

  mockSelect.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ order: mockOrder });
  mockFrom = jest.fn(() => ({ select: mockSelect }));

  return {
    createClient: () => ({ from: mockFrom })
  };
});

// Dynamically import the routes after mocking
const { default: sensorRoutes } = await import('../src/routes/sensorRoutes.js');

const app = express();
app.use(express.json());
app.use('/api/sensors', sensorRoutes);

describe('Network Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/sensors/network returns data', async () => {
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce({
        data: [{ ip: '1.1.1.1', packet_length: 100 }],
        error: null
      })
    });

    const res = await request(app).get('/api/sensors/network');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ ip: '1.1.1.1', packet_length: 100 }]);
  });

  it('GET /api/sensors/network/read/:name returns formatted data', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValueOnce({
            data: [
              { created_at: '2025-04-20T02:00:00Z', packet_length: 200 }
            ],
            error: null
          })
        })
      })
    });

    const res = await request(app).get('/api/sensors/network/read/1.1.1.1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      labels: ['2025-04-20T02:00:00Z'],
      values: [200],
    });
  });
});
