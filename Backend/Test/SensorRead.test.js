jest.mock('@supabase/supabase-js', () => {
    const mockFromRead = jest.fn();
    return { createClient: () => ({ from: mockFromRead }) };
  });
  const express2 = require('express');
  const request2 = require('supertest');
  const sensorRoutes2 = require('../src/routes/sensorRoutes.js').default;
  
  describe('Sensor Read Endpoint', () => {
    let app;
    let mockFromRead;
  
    beforeAll(() => {
      app = express2();
      app.use(express2.json());
      app.use('/api/sensors', sensorRoutes2);
    });
  
    beforeEach(() => {
      mockFromRead = require('@supabase/supabase-js').createClient().from;
      mockFromRead.mockReset();
    });
  
    it('GET /api/sensors/read/:name returns formatted data', async () => {
      mockFromRead.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [{ temperature: 25, timestamp: '2025-04-20T01:00:00Z' }], error: null })
          })
        })
      }));
  
      const res = await request2(app).get('/api/sensors/read/Device1?type=temperature');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ labels: ['2025-04-20T01:00:00Z'], values: [25] });
    });
  });