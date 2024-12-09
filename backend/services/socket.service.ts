import ws from "ws";
import { Server } from "http";
import { generateClientId } from "../utils/generateId.util";
import { ClientStore } from "../store/client.store";
import { BroadcastService } from "./broadcast.service";
import { MousePosition } from "../types/socket.types";

export class SocketService {
  private wss: ws.WebSocketServer;
  private clientStore: ClientStore;
  private broadcastService: BroadcastService;

  constructor(server: Server) {
    this.wss = new ws.WebSocketServer({ server });
    this.clientStore = new ClientStore();
    this.broadcastService = new BroadcastService(this.clientStore);
    this.initialize();
  }

  private initialize() {
    this.wss.on("connection", (socket) => {
      const clientId = generateClientId();
      this.clientStore.addClient(clientId, socket);

      socket.send(JSON.stringify({ type: "clientId", clientId }));
      this.sendExistingPositions(socket);
      this.setupSocketHandlers(socket, clientId);
    });
  }

  private sendExistingPositions(socket: ws.WebSocket) {
    this.clientStore.getAllPositions().forEach((position, existingClientId) => {
      socket.send(
        JSON.stringify({
          type: "mouseMove",
          clientId: existingClientId,
          x: position.x,
          y: position.y,
        })
      );
    });
  }

  private setupSocketHandlers(socket: ws.WebSocket, clientId: string) {
    socket.onmessage = (event) => {
      const data: MousePosition = JSON.parse(event.data.toString());
      this.broadcastService.broadcastMousePos(clientId, data);
    };

    socket.onclose = () => {
      this.clientStore.removeClient(clientId);
      this.broadcastService.broadcastClientDisconnect(clientId);
    };
  }
}
