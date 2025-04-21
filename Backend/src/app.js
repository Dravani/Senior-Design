import express from 'express';
import * as middleware from './utils/middleware.js';
import sensorRoutes from './routes/sensorRoutes.js';
import chartRoutes from './routes/chartRoutes.js';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import setupWebSocket from './sockets/sensorSocket.cjs';

// Initialize Supabase client
//const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();
const server = http.createServer(app);

// Create WebSocket server and attach it to the HTTP server
const wsServer = new WebSocketServer({ port: 8080 });

app.use(cors({ origin: 'http://localhost:5173' }));

app.use(express.json());
app.use(middleware.requestLogger);

// Main API Route
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Use the sensor routes
app.use('/api/sensors', sensorRoutes);

// Use the chart routes
app.use('/api/charts', chartRoutes);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

setupWebSocket(wsServer);

export default app;
