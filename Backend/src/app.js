import express from 'express';
import * as middleware from './utils/middleware.js';
import { createClient } from '@supabase/supabase-js';
import sensorRoutes from './routes/sensorRoutes.js';
import cors from 'cors';

// Initialize Supabase client
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));

app.use(express.json());
app.use(middleware.requestLogger);

// Main API Route
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Use the sensor routes
app.use('/api/sensors', sensorRoutes);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
