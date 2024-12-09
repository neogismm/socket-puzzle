import ws from "ws";
import { MousePosition, SocketMessage } from "../types/socket.types";
import { ClientStore } from "../store/client.store";

export class BroadcastService {
  constructor(private clientStore: ClientStore) {}

  broadcastMousePos(senderId: string, data: MousePosition) {
    this.clientStore.updatePosition(senderId, data);

    this.clientStore.getClients().forEach((client, id) => {
      if (id !== senderId && client.readyState === ws.WebSocket.OPEN) {
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
  }

  broadcastClientDisconnect(clientId: string) {
    this.clientStore.getClients().forEach((client) => {
      if (client.readyState === ws.WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "clientDisconnect",
            clientId,
          })
        );
      }
    });
  }
}
