jest.mock('@supabase/supabase-js', () => {
    const mockFromToggle = jest.fn();
    return { createClient: () => ({ from: mockFromToggle }) };
  });
  const express4 = require('express');
  const request4 = require('supertest');
  const sensorRoutes4 = require('../src/routes/sensorRoutes.js').default;
  
  describe('Toggle Disabled Sensor', () => {
    let app;
    let mockFromToggle;
  
    beforeAll(() => {
      app = express4();
      app.use(express4.json());
      app.use('/api/sensors', sensorRoutes4);
    });
  
    beforeEach(() => {
      mockFromToggle = require('@supabase/supabase-js').createClient().from;
      mockFromToggle.mockReset();
    });
  
    it('POST /api/sensors/disabled/:name/toggle flips status', async () => {
      mockFromToggle
        .mockImplementationOnce((table) => ({
          select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { is_disabled: false }, error: null }) }) })
        }))
        .mockImplementationOnce((table) => ({
          update: () => ({ eq: () => Promise.resolve({ error: null }) })
        }));
  
      const res = await request4(app).post('/api/sensors/disabled/Z/toggle');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Status updated successfully', is_disabled: true });
    });
  });