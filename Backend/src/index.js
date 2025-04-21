import app from './app.js';
import http from 'http';
import { WebSocketServer } from 'ws';
import setupWebSocket from './sockets/sensorSocket.cjs';
import config from './utils/config.js';

const server = http.createServer(app);

const wsServer = new WebSocketServer({ server });
setupWebSocket(wsServer);

server.listen(config.PORT, () => {
  console.log(`HTTP+WebSocket server listening on port ${config.PORT}`);
});
