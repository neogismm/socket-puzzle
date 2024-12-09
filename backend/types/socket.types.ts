import ws from "ws";

export interface MousePosition {
  clientId: string;
  x: number;
  y: number;
}

export interface SocketMessage {
  type: "clientId" | "mouseMove" | "clientDisconnect";
  clientId: string;
  x?: number;
  y?: number;
}
