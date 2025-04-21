// src/app.js
import express from 'express';
import * as middleware from './utils/middleware.js';
import sensorRoutes from './routes/sensorRoutes.js';
import chartRoutes from './routes/chartRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import http from 'http'
import { WebSocketServer } from 'ws';
import cors from 'cors';
import setupWebSocket from './sockets/sensorSocket.cjs';

const app = express();
const server = http.createServer(app);

// Allow CORS from your frontend origin
app.use(cors({ origin: 'http://localhost:5173' }));

// Parse JSON bodies
app.use(express.json());

// Custom request logger (response-time + colored output)
app.use(middleware.requestLogger);

const wsServer = new WebSocketServer({ port: 8080 })

// Health‑check / main API route
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Sensor data routes
app.use('/api/sensors', sensorRoutes);

app.use('/api/charts', chartRoutes)

app.use('/api/projects', projectRoutes)

// 404 handler for unknown endpoints
app.use(middleware.unknownEndpoint);

// Global error handler
app.use(middleware.errorHandler);

setupWebSocket(wsServer)

export default app;
