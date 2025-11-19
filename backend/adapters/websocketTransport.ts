import type { Message } from "chatly-sdk";
import type { TransportAdapter } from "chatly-sdk";
import { WebSocket } from "ws";

export class WebSocketTransport implements TransportAdapter {
  private ws: WebSocket | null = null;
  private messageHandler?: (message: Message) => void;
  private userId: string | null = null;

  constructor(private url: string) {}

  async connect(userId: string): Promise<void> {
    this.userId = userId;
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${this.url}?userId=${userId}`);

      this.ws.on("open", () => {
        resolve();
      });

      this.ws.on("error", (error) => {
        reject(error);
      });

      this.ws.on("message", (data) => {
        try {
          const message: Message = JSON.parse(data.toString());
          this.messageHandler?.(message);
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      });

      this.ws.on("close", () => {
        this.ws = null;
      });
    });
  }

  async send(message: Message): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }
    this.ws.send(JSON.stringify(message));
  }

  onMessage(handler: (message: Message) => void): void {
    this.messageHandler = handler;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

