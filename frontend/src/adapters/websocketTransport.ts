import type { Message } from "chatly-sdk";
import type { TransportAdapter } from "chatly-sdk";

export class WebSocketTransport implements TransportAdapter {
  private ws: WebSocket | null = null;
  private messageHandler?: (message: Message) => void;
  private userId: string | null = null;

  constructor(private url: string) {}

  async connect(userId: string): Promise<void> {
    this.userId = userId;
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${this.url}?userId=${userId}`);

      this.ws.onopen = () => {
        resolve();
      };

      this.ws.onerror = (error) => {
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: Message = JSON.parse(event.data);
          this.messageHandler?.(message);
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      };

      this.ws.onclose = () => {
        this.ws = null;
      };
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

