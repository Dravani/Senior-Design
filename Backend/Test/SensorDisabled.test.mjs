import { jest, describe, it, expect } from '@jest/globals';
import express from 'express';
import request from 'supertest';

await jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (_table) => {
      const builder = {
        select: () => builder,
        eq:     () => builder,
        then:   (resolve) => resolve({ data: [{ sensor_name: 'Y', is_disabled: true }], error: null }),
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

describe('Sensor Disabled Endpoints', () => {
  it('GET /api/sensors/disabled returns list', async () => {
    const res = await request(app).get('/api/sensors/disabled');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ sensor_name: 'Y', is_disabled: true }]);
  });

  it('GET /api/sensors/disabled/:name returns single', async () => {
    const res = await request(app).get('/api/sensors/disabled/Y');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ sensor_name: 'Y', is_disabled: true }]);
  });
});
