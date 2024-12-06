import ws from "ws";
import express from "express";
import http from "http";
import cors from "cors";

interface MousePosition {
  clientId: string;
  x: number;
  y: number;
}

const generateClientId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

const clients = new Map<string, ws.WebSocket>();
const lastKnownPositions = new Map<string, MousePosition>();

const createWebSocketServer = (port: number = 8080) => {
  const app = express();

  // Use CORS middleware
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST"],
    })
  );

  const server = http.createServer(app);
  const wss = new ws.WebSocketServer({ server });

  wss.on("connection", (socket) => {
    const clientId = generateClientId();
    clients.set(clientId, socket);
    socket.send(JSON.stringify({ type: "clientId", clientId }));

    // Send existing client positions to new client
    lastKnownPositions.forEach((position, existingClientId) => {
      socket.send(
        JSON.stringify({
          type: "mouseMove",
          clientId: existingClientId,
          x: position.x,
          y: position.y,
        })
      );
    });

    const broadcastMousePos = (senderId: string, data: MousePosition) => {
      // Store last known position
      lastKnownPositions.set(senderId, data);

      clients.forEach((client, id) => {
        if (id != senderId && client.readyState === ws.WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "mouseMove",
              clientId: senderId,
              x: data.x,
              y: data.y,
            })
          );
        }
      });
    };

    // Broadcast client disconnection
    const broadcastClientDisconnect = () => {
      clients.forEach((client) => {
        if (client.readyState === ws.WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "clientDisconnect",
              clientId,
            })
          );
        }
      });
    };

    // Handle incoming messages (mouse positions)
    socket.onmessage = (event) => {
      const data: MousePosition = JSON.parse(event.data.toString());
      broadcastMousePos(clientId, data);
    };

    // Handle client disconnection
    socket.onclose = () => {
      clients.delete(clientId);
      lastKnownPositions.delete(clientId);
      broadcastClientDisconnect();
    };
  });

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

createWebSocketServer();

export default createWebSocketServer;
