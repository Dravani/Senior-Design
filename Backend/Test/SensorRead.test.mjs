import { jest, describe, it, expect } from '@jest/globals';
import express from 'express';
import request from 'supertest';

await jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table) => {
      const dataRead = [{ temperature: 25, timestamp: '2025-04-20T01:00:00Z' }];
      const builder = {
        select: () => builder,
        eq:     () => builder,
        order:  () => builder,
        then:   (resolve) => resolve({ data: dataRead, error: null }),
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

describe('Sensor Read Endpoint', () => {
  it('GET /api/sensors/read/:name returns formatted data', async () => {
    const res = await request(app).get('/api/sensors/read/Device1?type=temperature');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      labels: ['2025-04-20T01:00:00Z'],
      values: [25]
    });
  });
});
