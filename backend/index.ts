import express from "express";
import http from "http";
import cors from "cors";
import { SocketService } from "./services/socket.service";
import { SERVER_CONFIG } from "./config/server.config";

const createWebSocketServer = (port: number = SERVER_CONFIG.port) => {
  const app = express();
  app.use(cors(SERVER_CONFIG.cors));

  const server = http.createServer(app);
  new SocketService(server);

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

createWebSocketServer();

export default createWebSocketServer;
