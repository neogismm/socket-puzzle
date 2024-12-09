import ws from "ws";
import { MousePosition } from "../types/socket.types";

export class ClientStore {
  private clients: Map<string, ws.WebSocket>;
  private positions: Map<string, MousePosition>;

  constructor() {
    this.clients = new Map();
    this.positions = new Map();
  }

  addClient(id: string, socket: ws.WebSocket) {
    this.clients.set(id, socket);
  }

  removeClient(id: string) {
    this.clients.delete(id);
    this.positions.delete(id);
  }

  updatePosition(id: string, position: MousePosition) {
    this.positions.set(id, position);
  }

  getAllPositions() {
    return this.positions;
  }

  getClients() {
    return this.clients;
  }
}
