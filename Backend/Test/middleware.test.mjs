import httpMocks from 'node-mocks-http';
import { describe, it, expect } from '@jest/globals';
import { requestLogger, unknownEndpoint, errorHandler } from '../src/utils/middleware.js';

describe('Middleware', () => {
  it('unknownEndpoint returns 404 and JSON error', () => {
    const req = httpMocks.createRequest({ method: 'GET', url: '/nope' });
    const res = httpMocks.createResponse();
    unknownEndpoint(req, res);
    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: 'unknown endpoint' });
  });

  it('errorHandler catches errors and returns JSON', async () => {
    const err = new Error('Test error');
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const next = () => {};
    await errorHandler(err, req, res, next);
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({
      success: false,
      message: 'Test error'
    });
  });
});
