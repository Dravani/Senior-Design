import express from 'express';
import * as middleware from './utils/middleware.js';
const app = express();

app.use(express.json());
app.use(middleware.requestLogger);

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler)

export default app;