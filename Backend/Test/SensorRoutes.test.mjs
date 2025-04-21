import { jest, describe, it, expect } from '@jest/globals';
import express from 'express';
import request from 'supertest';

await jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table) => {
      const dataMap = {
        DisabledSensors: [{ sensor_name: 'A', is_disabled: false }],
        Sensor:        [{ sensor_name: 'A', timestamp: '2025-01-01T00:00:00Z' }]
      };
      const data = dataMap[table] || [];
      const builder = {
        select: () => builder,
        order:  () => builder,
        then:   (resolve) => resolve({ data, error: null }),
        catch:  () => builder
      };
      return builder;
    }
  })
}));

const { default: sensorRoutes } = await import('../src/routes/sensorRoutes.js');

const app = express();
app.use(express.json());
app.use('/api/sensors', sensorRoutes);

describe('Sensor Routes', () => {
  it('GET /api/sensors returns combined data', async () => {
    const res = await request(app).get('/api/sensors');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sensor_name: 'A',
          is_disabled: false,
          last_active: '2025-01-01T00:00:00Z'
        })
      ])
    );
  });
});
