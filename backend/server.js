import express from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import usersRouter, { initializeSDK, getSDKInstance } from "./api/users.js";
import messagesRouter, { setSDKInstance } from "./api/messages.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "chatdb";

app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
let client;

async function connectDB() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log("Connected to MongoDB");

    // Initialize SDK with MongoDB collections
    const userCollection = db.collection("users");
    const messageCollection = db.collection("messages");
    const groupCollection = db.collection("groups");
    
    const sdk = initializeSDK(userCollection, messageCollection, groupCollection);
    setSDKInstance(sdk);
    console.log("SDK initialized with MongoDB adapters");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

// API routes
app.use("/api/users", usersRouter);
app.use("/api/messages", messagesRouter);

// WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });
const clients = new Map(); // userId -> WebSocket

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    ws.close();
    return;
  }

  console.log(`Client connected: ${userId}`);
  clients.set(userId, ws);

  // ws.on("message", async (data) => {
  //   try {
  //     const message = JSON.parse(data.toString());
  //     const sdk = getSDKInstance();
  //     if (!sdk) {
  //       console.error("SDK not initialized");
  //       return;
  //     }

  //     // Save message to database
  //     // await sdk.config.messageStore.add(message);
      
  //     // Broadcast to recipient or group
  //     if (message.receiverId) {
  //       const recipientWs = clients.get(message.receiverId);
  //       if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
  //         recipientWs.send(JSON.stringify(message));
  //         console.log(`Message sent to ${message.receiverId}`);
  //       } else {
  //         console.log(`Recipient ${message.receiverId} not connected`);
  //       }
  //     } else if (message.groupId) {
  //       const group = await sdk.config.groupStore.findById(message.groupId);
  //       if (group) {
  //         group.members.forEach(memberId => {
  //           if (memberId !== userId) {
  //             const memberWs = clients.get(memberId);
  //             if (memberWs && memberWs.readyState === WebSocket.OPEN) {
  //               memberWs.send(JSON.stringify(message));
  //             }
  //           }
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error handling message:", error);
  //   }
  // });

  ws.on("message", async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      console.log("📨 Backend received WS message:", msg);

  
      //
      // Convert binary fields from arrays → base64 before broadcasting
      // (ONLY if sender didn't already convert them)
      //
      if (msg.ciphertext instanceof Array || Array.isArray(msg.ciphertext)) {
        msg.ciphertext = arrayBufferToBase64(Uint8Array.from(msg.ciphertext));
      }
      if (msg.iv instanceof Array || Array.isArray(msg.iv)) {
        msg.iv = arrayBufferToBase64(Uint8Array.from(msg.iv));
      }
      if (msg.ephemeralPubKey instanceof Array || Array.isArray(msg.ephemeralPubKey)) {
        msg.ephemeralPubKey = arrayBufferToBase64(Uint8Array.from(msg.ephemeralPubKey));
      }
  
      //
      // Broadcast same object untouched (base64-safe)
      //
      if (msg.receiverId) {
        const recipientWs = clients.get(msg.receiverId);
        if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
          recipientWs.send(JSON.stringify(msg));
        }
      }
  
    } catch (err) {
      console.error("Error handling message:", err);
    }
  });
  
  ws.on("close", () => {
    console.log(`Client disconnected: ${userId}`);
    clients.delete(userId);
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error for ${userId}:`, error);
  });
});

// REST API endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
async function start() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`HTTP server running on http://localhost:${PORT}`);
    console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);
  });
}

start().catch(console.error);

