import { jest, describe, it, expect } from '@jest/globals';
import express from 'express';
import request from 'supertest';

await jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table) => {
      if (table === 'DisabledSensors') {
        const sel = {
          select: () => sel,
          eq:     () => sel,
          single: () => Promise.resolve({ data: { is_disabled: false }, error: null })
        };
        const upd = {
          update: () => ({
            eq: () => Promise.resolve({ data: null, error: null })
          })
        };
        return { ...sel, ...upd };
      }
      return {
        select: () => ({ then: (r) => r({ data: [], error: null }) }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
      };
    }
  })
}));

const { default: sensorRoutes } = await import('../src/routes/sensorRoutes.js');

const app = express();
app.use(express.json());
app.use('/api/sensors', sensorRoutes);

describe('Toggle Disabled Sensor', () => {
  it('POST /api/sensors/disabled/:name/toggle flips status', async () => {
    const res = await request(app).post('/api/sensors/disabled/Z/toggle');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Status updated successfully', is_disabled: true });
  });
});
