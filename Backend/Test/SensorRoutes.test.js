let mockFrom;
jest.mock('@supabase/supabase-js', () => {
  mockFrom = jest.fn();
  return { createClient: () => ({ from: mockFrom }) };
});
const express = require('express');
const request = require('supertest');
const sensorRoutes = require('../src/routes/sensorRoutes.js').default;

const app = express();
app.use(express.json());
app.use('/api/sensors', sensorRoutes);

describe('Sensor Routes', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it('GET /api/sensors returns combined data', async () => {
    // Stub DisabledSensors then Sensor
    mockFrom
      .mockImplementationOnce(() => ({ select: () => Promise.resolve({ data: [{ sensor_name: 'X', is_disabled: false }], error: null }) }))
      .mockImplementationOnce(() => ({ select: () => ({ order: () => Promise.resolve({ data: [{ sensor_name: 'X', timestamp: '2025-04-20T00:00:00Z' }], error: null }) }) }));

    const res = await request(app).get('/api/sensors');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      expect.objectContaining({ sensor_name: 'X', is_disabled: false, last_active: '2025-04-20T00:00:00Z' })
    ]);
  });
});