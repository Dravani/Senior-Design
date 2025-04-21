// src/app.js
import express from 'express';
import * as middleware from './utils/middleware.js';
import sensorRoutes from './routes/sensorRoutes.js';
import cors from 'cors';

const app = express();

// Allow CORS from your frontend origin
app.use(cors({ origin: 'http://localhost:5173' }));

// Parse JSON bodies
app.use(express.json());

// Custom request logger (response-time + colored output)
app.use(middleware.requestLogger);

// Health‑check / main API route
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Sensor data routes
app.use('/api/sensors', sensorRoutes);

// 404 handler for unknown endpoints
app.use(middleware.unknownEndpoint);

// Global error handler
app.use(middleware.errorHandler);

export default app;
