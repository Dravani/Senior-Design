jest.mock('@supabase/supabase-js', () => {
    const mockFromDis = jest.fn();
    return { createClient: () => ({ from: mockFromDis }) };
  });
  const express3 = require('express');
  const request3 = require('supertest');
  const sensorRoutes3 = require('../src/routes/sensorRoutes.js').default;
  
  describe('Sensor Disabled Endpoints', () => {
    let app;
    let mockFromDis;
  
    beforeAll(() => {
      app = express3();
      app.use(express3.json());
      app.use('/api/sensors', sensorRoutes3);
    });
  
    beforeEach(() => {
      mockFromDis = require('@supabase/supabase-js').createClient().from;
      mockFromDis.mockReset();
    });
  
    it('GET /api/sensors/disabled returns list', async () => {
      mockFromDis.mockImplementation((table) => ({ select: () => Promise.resolve({ data: [{ sensor_name: 'Y', is_disabled: true }], error: null }) }));
      const res = await request3(app).get('/api/sensors/disabled');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ sensor_name: 'Y', is_disabled: true }]);
    });
  
    it('GET /api/sensors/disabled/:name returns single', async () => {
      mockFromDis.mockImplementation((table) => ({ select: () => ({ eq: () => Promise.resolve({ data: [{ sensor_name: 'Y', is_disabled: true }], error: null }) }) }));
      const res = await request3(app).get('/api/sensors/disabled/Y');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ sensor_name: 'Y', is_disabled: true }]);
    });
  });
  