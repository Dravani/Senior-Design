const httpMocks = require('node-mocks-http');
const { requestLogger, unknownEndpoint, errorHandler } = require('../src/utils/middleware.js');

describe('Middleware', () => {
  it('unknownEndpoint returns 404 and JSON error', () => {
    const req = httpMocks.createRequest({ method: 'GET', url: '/nope' });
    const res = httpMocks.createResponse();
    unknownEndpoint(req, res);
    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: 'unknown endpoint' });
  });

  it('errorHandler catches errors and returns JSON', () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const next = jest.fn();
    const err = new Error('Test error');
    err.status = 500;

    errorHandler(err, req, res, next);
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toMatchObject({ success: false, message: 'Test error' });
  });
});